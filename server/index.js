import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import crypto from 'node:crypto'
import { getDb } from './data/db.js'
import path from 'node:path'
import multer from 'multer'
import { sendPasswordResetEmail } from './utils/mailer.js'
import helmet from 'helmet'
import { requireAuth, requireRole } from './utils/rbac.js'
import { transcodeEpisode } from './utils/transcode.js'
import { ObjectId } from 'mongodb'

dotenv.config()

const app = express()
app.use(cors())
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))
app.use(express.json())
// Trust proxy (needed for accurate req.ip when behind reverse proxy / dev setups)
app.set('trust proxy', true)

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret'
const SALT_ROUNDS = 10

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || ''
  const parts = auth.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') {
    try {
      const payload = jwt.verify(parts[1], JWT_SECRET)
      req.user = payload
    } catch (e) {
      // invalid token
    }
  }
  next()
}

app.use(authMiddleware)

// In-process transcode runner (no Redis). Fire-and-forget background job.
// Local CDN: serve media files with cache headers
const MEDIA_ROOT = process.env.MEDIA_ROOT || path.join(process.cwd(), 'server', 'media')
function setCdnHeaders(res, filePath) {
  const ext = (filePath || '').toLowerCase()
  if (ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png') || ext.endsWith('.gif') || ext.endsWith('.webp') || ext.endsWith('.svg')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (ext.endsWith('.mp4') || ext.endsWith('.webm') || ext.endsWith('.mkv') || ext.endsWith('.mp3') || ext.endsWith('.aac') || ext.endsWith('.wav')) {
    res.setHeader('Cache-Control', 'public, max-age=604800')
  } else {
    res.setHeader('Cache-Control', 'public, max-age=3600')
  }
  res.setHeader('Accept-Ranges', 'bytes')
}
app.use('/cdn', express.static(MEDIA_ROOT, {
  dotfiles: 'ignore',
  etag: true,
  lastModified: true,
  fallthrough: true,
  setHeaders: setCdnHeaders
}))

// ---- Upload endpoints (protected) ----
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

function makeMulterFor(subdir, fileSize) {
  const dest = path.join(MEDIA_ROOT, subdir)
  const storage = multer.diskStorage({
    destination: dest,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      const base = path.basename(file.originalname, ext).toLowerCase()
      const safe = sanitizeFilename(base)
      const stamp = Date.now()
      cb(null, `${safe}-${stamp}${ext}`)
    }
  })
  return multer({ storage, limits: { fileSize } })
}

const uploadImages = makeMulterFor('images', Number(process.env.UPLOAD_LIMIT_IMAGES || 10 * 1024 * 1024)) // 10MB
const uploadClips = makeMulterFor('clips', Number(process.env.UPLOAD_LIMIT_CLIPS || 200 * 1024 * 1024))  // 200MB
const uploadEpisodes = makeMulterFor('episodes', Number(process.env.UPLOAD_LIMIT_EPISODES || 1_500 * 1024 * 1024)) // ~1.5GB

// Restrict uploads to moderators/admins
app.post('/api/upload/images', requireRole('moderator', 'admin'), uploadImages.single('file'), (req, res) => {
  const rel = `/cdn/images/${path.basename(req.file.path)}`
  res.status(201).json({ path: rel, size: req.file.size, mimetype: req.file.mimetype })
})
app.post('/api/upload/clips', requireRole('moderator', 'admin'), uploadClips.single('file'), (req, res) => {
  const rel = `/cdn/clips/${path.basename(req.file.path)}`
  res.status(201).json({ path: rel, size: req.file.size, mimetype: req.file.mimetype })
})
app.post('/api/upload/episodes', requireRole('moderator', 'admin'), uploadEpisodes.single('file'), async (req, res, next) => {
  try {
    const { animeSlug, episodeNumber } = req.body
    if (!animeSlug || !episodeNumber) return res.status(400).json({ error: 'animeSlug and episodeNumber required' })
    const rel = `/cdn/episodes/${path.basename(req.file.path)}`
    const db = await getDb()
    const anime = await db.collection('anime').findOne({ slug: animeSlug })
    if (!anime) return res.status(404).json({ error: 'Anime not found' })
    const doc = {
      createdBy: req.user.username,
      filePath: req.file.path,
      publicPath: rel,
      animeSlug,
      episodeNumber: Number(episodeNumber),
      status: 'queued',
      hlsPath: null,
      variants: [],
      createdAt: new Date(),
    }
    const result = await db.collection('episodes').insertOne(doc)
    const id = result.insertedId.toString()
    // Start transcode in background
    const outDir = path.join(MEDIA_ROOT, 'hls', id)
    ;(async () => {
      try {
        await db.collection('episodes').updateOne({ _id: result.insertedId }, { $set: { status: 'processing' } })
        await transcodeEpisode({ episodeId: id, sourcePath: req.file.path, outputDir: outDir, update: async (fields) => {
          await db.collection('episodes').updateOne({ _id: result.insertedId }, { $set: { status: 'ready', ...fields } })
        } })
      } catch (err) {
        console.error('Transcode failed:', err.message)
        await db.collection('episodes').updateOne({ _id: result.insertedId }, { $set: { status: 'failed', error: err.message } })
      }
    })()
    res.status(201).json({ id, path: rel, size: req.file.size, mimetype: req.file.mimetype, status: 'queued' })
  } catch (e) { next(e) }
})
// Rate limiting temporarily disabled due to runtime error with express-rate-limit in this environment.
// Provide no-op middleware placeholders; re-enable with stable configuration later.
function authLimiter(req, res, next) {
  if (typeof next === 'function') return next()
  return undefined
}


// DB is lazily initialized via getDb() when endpoints are hit.
// Ensure indexes once on startup
(async () => {
  try {
    const db = await getDb()
    await db.collection('anime').createIndex({ slug: 1 }, { unique: true })
    await db.collection('anime').createIndex({ title: 'text', synopsis: 'text' })
    await db.collection('communityPosts').createIndex({ createdAt: -1 })
    await db.collection('episodes').createIndex({ createdAt: -1 })
    console.log('Indexes ensured')
  } catch (e) {
    console.warn('Indexing failed:', e.message)
  }
})()

// Home
app.get('/api/home', async (req, res, next) => {
  try {
    const db = await getDb()
    const anime = await db
      .collection('anime')
      .find({}, { projection: { title: 1, slug: 1, coverImage: 1 } })
      .limit(10)
      .toArray()
    res.json({ featured: anime.slice(0, 3), trending: anime })
  } catch (e) { next(e) }
})
// About
app.get('/api/about', (req, res) => {
  res.json({ app: 'Anime Site', version: '1.0.0' })
})
// Stream page (episode list or stream metadata)
// Stream metadata: anime + linked episodes
app.get('/api/stream/:animeId', async (req, res, next) => {
  try {
    const db = await getDb()
    const anime = await db.collection('anime').findOne({ slug: req.params.animeId })
    if (!anime) return res.status(404).json({ error: 'Anime not found' })
    const episodes = await db.collection('episodes')
      .find({ animeSlug: req.params.animeId })
      .sort({ episodeNumber: 1 })
      .project({ filePath: 0 })
      .toArray()
    res.json({ anime: { slug: anime.slug, title: anime.title, synopsis: anime.synopsis, coverImage: anime.coverImage }, episodes })
  } catch (e) { next(e) }
})
// Community posts
app.get('/api/community/posts', async (req, res, next) => {
  try {
    const db = await getDb()
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20))
    const cursor = db.collection('communityPosts').find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
    const posts = await cursor.toArray()
    res.json({ posts, page, limit })
  } catch (e) { next(e) }
})

// Create community post (protected)
app.post('/api/community/posts', requireAuth, async (req, res, next) => {
  try {
    const { title, body } = req.body
    if (!title || !body) return res.status(400).json({ error: 'Missing fields' })
    const db = await getDb()
    const doc = { author: req.user.username, title, body, likes: 0, createdAt: new Date() }
    await db.collection('communityPosts').insertOne(doc)
    res.status(201).json({ post: doc })
  } catch (e) { next(e) }
})

// Comments
app.post('/api/community/posts/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ error: 'Missing text' })
    const db = await getDb()
    const comment = { _id: crypto.randomUUID(), author: req.user.username, text, createdAt: new Date() }
    await db.collection('communityPosts').updateOne({ _id: new ObjectId(req.params.id) }, { $push: { comments: comment } })
    res.status(201).json({ comment })
  } catch (e) { next(e) }
})

app.delete('/api/community/posts/:id', requireRole('moderator', 'admin'), async (req, res, next) => {
  try {
    const db = await getDb()
    await db.collection('communityPosts').deleteOne({ _id: new ObjectId(req.params.id) })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

app.delete('/api/community/posts/:postId/comments/:commentId', requireRole('moderator', 'admin'), async (req, res, next) => {
  try {
    const db = await getDb()
    await db.collection('communityPosts').updateOne(
      { _id: new ObjectId(req.params.postId) },
      { $pull: { comments: { _id: req.params.commentId } } }
    )
    res.json({ ok: true })
  } catch (e) { next(e) }
})
// Profile
app.get('/api/profile/:username', async (req, res, next) => {
  try {
    const db = await getDb()
    const user = await db.collection('users').findOne({ username: req.params.username })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const favs = await db
      .collection('anime')
      .find({ slug: { $in: user.favorites || [] } }, { projection: { title: 1, slug: 1, coverImage: 1 } })
      .toArray()
    const userClips = await db.collection('clips').find({ createdBy: user.username }).toArray()

    res.json({ username: user.username, avatar: user.avatar, favorites: favs, clips: userClips })
  } catch (e) { next(e) }
})

// Register
app.post('/api/auth/register', authLimiter,
  body('username').isString().isLength({ min: 3, max: 32 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 6, max: 128 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid input', details: errors.array() })

      const { username, email, password } = req.body

      const db = await getDb()
      const exists = await db.collection('users').findOne({ $or: [{ username }, { email }] })
      if (exists) return res.status(409).json({ error: 'User already exists' })

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
        const user = { username, email, passwordHash, avatar: '/avatars/default.svg', favorites: [], role: 'user', createdAt: new Date() }

      await db.collection('users').insertOne(user)
      const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
      res.json({ token, user: { username: user.username, avatar: user.avatar, role: user.role } })
    } catch (e) { next(e) }
  }
)

// Login
app.post('/api/auth/login', authLimiter,
  body('usernameOrEmail').isString().isLength({ min: 3 }).trim(),
  body('password').isString().isLength({ min: 6 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid input', details: errors.array() })

      const { usernameOrEmail, password } = req.body

      const db = await getDb()
      const user = await db.collection('users').findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] })
      if (!user) return res.status(401).json({ error: 'Invalid credentials' })

      const ok = await bcrypt.compare(password, user.passwordHash || '')
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

      const token = jwt.sign({ username: user.username, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' })
      res.json({ token, user: { username: user.username, avatar: user.avatar, favorites: user.favorites || [], role: user.role || 'user' } })
    } catch (e) { next(e) }
  }
)

// Password reset (dev stub)
app.post('/api/auth/request-reset', authLimiter,
  body('usernameOrEmail').isString().isLength({ min: 3 }).trim(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid input', details: errors.array() })
      const { usernameOrEmail } = req.body
      const db = await getDb()
      const user = await db.collection('users').findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] })
      if (!user) return res.status(200).json({ ok: true })
      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
      await db.collection('passwordResets').insertOne({ username: user.username, token, expiresAt })
      const result = await sendPasswordResetEmail(user.email, token)
      // In dev (no SMTP), still return the token to ease testing
      res.json(result.dev ? { ok: true, token } : { ok: true })
    } catch (e) { next(e) }
  }
)

app.post('/api/auth/reset', authLimiter,
  body('token').isString().isLength({ min: 10 }),
  body('newPassword').isString().isLength({ min: 6 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid input', details: errors.array() })
      const { token, newPassword } = req.body
      const db = await getDb()
      const rec = await db.collection('passwordResets').findOne({ token })
      if (!rec || new Date(rec.expiresAt) < new Date()) return res.status(400).json({ error: 'Invalid or expired token' })
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
      await db.collection('users').updateOne({ username: rec.username }, { $set: { passwordHash } })
      await db.collection('passwordResets').deleteOne({ token })
      res.json({ ok: true })
    } catch (e) { next(e) }
  }
)
// Current User
app.get('/api/me', async (req, res, next) => {
  try {
    if (!req.user || !req.user.username) return res.status(401).json({ error: 'Unauthorized' })
    const db = await getDb()
    const user = await db.collection('users').findOne({ username: req.user.username }, { projection: { passwordHash: 0 } })
    if (!user) return res.status(404).json({ error: 'Not found' })
    res.json({ user })
  } catch (e) { next(e) }
})
// Update current profile
app.put('/api/profile', requireAuth,
  body('avatar').optional().isString().isLength({ min: 5, max: 500 }).trim(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid input', details: errors.array() })
      const { avatar } = req.body
      const db = await getDb()
      const update = {}
      if (avatar) update.avatar = avatar
      if (Object.keys(update).length === 0) return res.status(400).json({ error: 'No fields to update' })
      await db.collection('users').updateOne({ username: req.user.username }, { $set: update })
      res.json({ ok: true })
    } catch (e) { next(e) }
  }
)
// Clips
app.get('/api/clips', async (req, res, next) => {
  try {
    const db = await getDb()
    const list = await db.collection('clips').find().sort({ createdAt: -1 }).limit(50).toArray()
    res.json({ clips: list })
  } catch (e) { next(e) }
})

// Episodes
app.get('/api/episodes/:id', async (req, res, next) => {
  try {
    const db = await getDb()
    const doc = await db.collection('episodes').findOne({ _id: new ObjectId(req.params.id) })
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.json(doc)
  } catch (e) { next(e) }
})

// Admin requeue transcode
app.post('/api/admin/transcode/:id', requireRole('moderator', 'admin'), async (req, res, next) => {
  try {
    const id = req.params.id
    const db = await getDb()
    const ep = await db.collection('episodes').findOne({ _id: new ObjectId(id) })
    if (!ep) return res.status(404).json({ error: 'Episode not found' })
    const outDir = path.join(MEDIA_ROOT, 'hls', id)
    ;(async () => {
      try {
        await db.collection('episodes').updateOne({ _id: ep._id }, { $set: { status: 'processing', error: null } })
        await transcodeEpisode({ episodeId: id, sourcePath: ep.filePath, outputDir: outDir, update: async (fields) => {
          await db.collection('episodes').updateOne({ _id: ep._id }, { $set: { status: 'ready', ...fields } })
        } })
      } catch (err) {
        console.error('Transcode failed:', err.message)
        await db.collection('episodes').updateOne({ _id: ep._id }, { $set: { status: 'failed', error: err.message } })
      }
    })()
    
    res.json({ ok: true })
  } catch (e) { next(e) }
})

app.get('/api/admin/episodes', requireRole('moderator', 'admin'), async (req, res, next) => {
  try {
    const db = await getDb()
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    const list = await db.collection('episodes').find().sort({ createdAt: -1 }).limit(limit).toArray()
    res.json({ episodes: list })
  } catch (e) { next(e) }
})

// Update episode linkage (animeSlug, episodeNumber)
app.put('/api/admin/episodes/:id', requireRole('moderator', 'admin'), async (req, res, next) => {
  try {
    const { animeSlug, episodeNumber } = req.body
    if (!animeSlug || !episodeNumber) return res.status(400).json({ error: 'animeSlug and episodeNumber required' })
    const db = await getDb()
    const anime = await db.collection('anime').findOne({ slug: animeSlug })
    if (!anime) return res.status(404).json({ error: 'Anime not found' })
    const id = new ObjectId(req.params.id)
    await db.collection('episodes').updateOne({ _id: id }, { $set: { animeSlug, episodeNumber: Number(episodeNumber) } })
    const doc = await db.collection('episodes').findOne({ _id: id })
    res.json({ episode: doc })
  } catch (e) { next(e) }
})

// Backfill episodes linkage by filename heuristics
app.post('/api/admin/backfill/episodes', requireRole('moderator', 'admin'), async (req, res, next) => {
  try {
    const db = await getDb()
    const dryRun = String(req.query.dryRun || 'false').toLowerCase() === 'true'
    const animeList = await db.collection('anime').find({}, { projection: { slug: 1 } }).toArray()
    const slugs = animeList.map(a => a.slug).sort((a,b) => b.length - a.length) // prefer longest slug first
    const candidates = await db.collection('episodes').find({ $or: [ { animeSlug: { $exists: false } }, { animeSlug: null }, { episodeNumber: { $exists: false } } ] }).toArray()

    const changes = []
    for (const ep of candidates) {
      const base = (ep.filePath || '').split('/').pop()?.replace(/\.[^/.]+$/, '') || ''
      let foundSlug = null
      for (const s of slugs) {
        if (base.startsWith(s) || base.includes(`${s}-`) || base.includes(`${s}_`) || base.includes(`${s}.`)) {
          foundSlug = s; break
        }
      }
      let num = null
      // prefer explicit tokens like ep12 or episode_12
      const m1 = base.match(/(?:ep|episode|e)[ _.-]?(\d{1,4})/i)
      if (m1) num = Number(m1[1])
      if (!num) {
        const m2 = base.match(/(\d{1,4})(?!.*\d)/) // last number run
        if (m2) num = Number(m2[1])
      }
      if (foundSlug && num) {
        changes.push({ _id: ep._id, animeSlug: foundSlug, episodeNumber: num })
      }
    }

    if (!dryRun) {
      for (const c of changes) {
        await db.collection('episodes').updateOne({ _id: c._id }, { $set: { animeSlug: c.animeSlug, episodeNumber: c.episodeNumber } })
      }
    }

    res.json({ count: changes.length, dryRun, applied: dryRun ? 0 : changes.length, changes })
  } catch (e) { next(e) }
})
// Detailed anime page
app.get('/api/anime/:animeId', async (req, res, next) => {
  try {
    const db = await getDb()
    const doc = await db.collection('anime').findOne({ slug: req.params.animeId })
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.json(doc)
  } catch (e) { next(e) }
})

// Search
app.get('/api/search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString().trim()
    if (!q) return res.json({ results: [], page: 1, limit: 20 })
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20))
    const db = await getDb()
    try {
      const cursor = db.collection('anime').find(
        { $text: { $search: q } },
        { projection: { score: { $meta: 'textScore' }, title: 1, slug: 1, coverImage: 1, synopsis: 1 } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .skip((page - 1) * limit)
        .limit(limit)
      const results = await cursor.toArray()
      return res.json({ results, page, limit })
    } catch (err) {
      // If text index missing (code 27), create it and fall back to regex search immediately
      if (err && (err.code === 27 || err.codeName === 'IndexNotFound')) {
        try {
          await db.collection('anime').createIndex({ title: 'text', synopsis: 'text' }, { name: 'anime_text_idx' })
        } catch (_) { /* ignore index racing */ }
        const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        const results = await db.collection('anime')
          .find({ $or: [{ title: rx }, { synopsis: rx }] }, { projection: { title: 1, slug: 1, coverImage: 1, synopsis: 1 } })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray()
        return res.json({ results, page, limit, fallback: true })
      }
      throw err
    }
  } catch (e) { next(e) }
})

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server running on port ${port}`))
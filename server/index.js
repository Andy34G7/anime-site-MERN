import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { getDb } from './data/db.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

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
function requireAuth(req, res, next) {
  if (!req.user || !req.user.username) return res.status(401).json({ error: 'Unauthorized' })
  next()
}


// DB is lazily initialized via getDb() when endpoints are hit.

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
app.get('/api/stream/:animeId', (req, res) => {
  res.json({ animeId: req.params.animeId, episodes: [] })
})
// Community posts
app.get('/api/community/posts', async (req, res, next) => {
  try {
    const db = await getDb()
    const posts = await db
      .collection('communityPosts')
      .find()
      .sort({ createdAt: -1 })
      .toArray()
    res.json({ posts })
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

    res.json({ username: user.username, favorites: favs, clips: userClips })
  } catch (e) { next(e) }
})

// Register
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' })

    const db = await getDb()
    const exists = await db.collection('users').findOne({ $or: [{ username }, { email }] })
    if (exists) return res.status(409).json({ error: 'User already exists' })

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = {
      username,
      email,
      passwordHash,
      avatar: '/avatars/default.png',
      favorites: [],
      createdAt: new Date()
    }

    await db.collection('users').insertOne(user)
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { username: user.username, avatar: user.avatar } })
  } catch (e) { next(e) }
})

// Login
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body
    if (!usernameOrEmail || !password) return res.status(400).json({ error: 'Missing fields' })

    const db = await getDb()
    const user = await db.collection('users').findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.passwordHash || '')
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { username: user.username, avatar: user.avatar, favorites: user.favorites || [] } })
  } catch (e) { next(e) }
})
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
// Clips
app.get('/api/clips', async (req, res, next) => {
  try {
    const db = await getDb()
    const list = await db.collection('clips').find().sort({ createdAt: -1 }).limit(50).toArray()
    res.json({ clips: list })
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

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server running on port ${port}`))
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { getDb } from './data/db.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

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
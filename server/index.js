import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

let db
async function initDb() {
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  db = client.db(process.env.DB_NAME || 'anime')
  console.log('DB connected')
}
initDb().catch(e => {
  console.error('DB connection failed', e)
  process.exit(1)
})

// Home
app.get('/api/home', (req, res) => {
  res.json({ featured: [], trending: [] })
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
app.get('/api/community/posts', (req, res) => {
  res.json({ posts: [] })
})
// Profile
app.get('/api/profile/:username', (req, res) => {
  res.json({ username: req.params.username, favorites: [], clips: [] })
})
// Clips
app.get('/api/clips', (req, res) => {
  res.json({ clips: [] })
})
// Detailed anime page
app.get('/api/anime/:animeId', (req, res) => {
  res.json({ animeId: req.params.animeId, title: '', synopsis: '', genres: [], episodes: [] })
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server running on port ${port}`))
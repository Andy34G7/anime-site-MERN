import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { MongoClient, ObjectId } from 'mongodb'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const uri = process.env.MONGODB_URI || 'mongodb+srv://aivillio34_db_user:zawarudo@anime-proj.txkrj4y.mongodb.net/animeDB?retryWrites=true&w=majority&appName=anime-proj'
const dbName = process.env.DB_NAME || 'animeDB'

const now = () => new Date()

const anime = [
  {
    _id: new ObjectId(),
    slug: 'naruto',
    title: 'Naruto',
    synopsis: 'A young ninja seeks recognition and dreams of becoming Hokage.',
    genres: ['Action', 'Adventure', 'Shonen'],
    episodes: [
      { number: 1, title: 'Enter Naruto Uzumaki!', lengthMin: 23 },
      { number: 2, title: 'My Name is Konohamaru!', lengthMin: 23 }
    ],
    score: 8.6,
    coverImage: '/images/naruto.jpg',
    createdAt: now()
  },
  {
    _id: new ObjectId(),
    slug: 'one-piece',
    title: 'One Piece',
    synopsis: 'Monkey D. Luffy sails to find the legendary One Piece.',
    genres: ['Action', 'Adventure', 'Comedy'],
    episodes: [
      { number: 1, title: 'I’m Luffy! The Man Who Will Become Pirate King!', lengthMin: 24 },
      { number: 2, title: 'Enter the Great Swordsman! Pirate Hunter Roronoa Zoro!', lengthMin: 24 }
    ],
    score: 8.0,
    coverImage: '/images/onepiece.jpg',
    createdAt: now()
  }
]

const users = [
  {
    _id: new ObjectId(),
    username: 'demo',
    avatar: '/avatars/demo.png',
    favorites: ['naruto'],
    clips: [],
    createdAt: now()
  }
]

const communityPosts = [
  {
    _id: new ObjectId(),
    author: 'demo',
    title: 'Welcome Thread',
    body: 'Introduce yourself and share favorite anime!',
    likes: 3,
    createdAt: now()
  }
]

const clips = [
  {
    _id: new ObjectId(),
    animeSlug: 'naruto',
    episode: 1,
    startSec: 30,
    endSec: 50,
    createdBy: 'demo',
    createdAt: now()
  }
]

async function seed() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)
  console.log('Connected -> ' + dbName)

  const collections = [
    { name: 'anime', data: anime },
    { name: 'users', data: users },
    { name: 'communityPosts', data: communityPosts },
    { name: 'clips', data: clips }
  ]

  for (const { name, data } of collections) {
    const col = db.collection(name)
    const count = await col.estimatedDocumentCount()
    if (count === 0) {
      await col.insertMany(data)
      console.log(`Seeded ${name} (${data.length})`)
    } else {
      console.log(`${name} already has data (skip)`) 
    }
  }

  await client.close()
  console.log('Seeding complete.')
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { MongoClient, ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'
import crypto from 'node:crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbName = process.env.DB_NAME || 'animeDB'
function cryptoRandom() {
  return crypto.randomUUID()
}

const now = () => new Date()
const mediaPaths = {
  naruto: '/cdn/images/demo-naruto.jpg',
  'one-piece': '/cdn/images/demo-onepiece.jpg',
  'demon-slayer': '/cdn/images/demo-demonslayer.jpg'
}
const demoEpisodeFile = path.join(__dirname, '..', 'media', 'episodes', 'demo-episode-1.mp4')

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
    coverImage: mediaPaths['naruto'] || '/cdn/images/poster-default.svg',
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
    coverImage: mediaPaths['one-piece'] || '/cdn/images/poster-default.svg',
    createdAt: now()
  },
  {
    _id: new ObjectId(),
    slug: 'attack-on-titan',
    title: 'Attack on Titan',
    synopsis: 'Humanity fights for survival within walls against man-eating titans.',
    genres: ['Action', 'Drama', 'Dark Fantasy'],
    episodes: [
      { number: 1, title: 'To You, in 2000 Years: The Fall of Shiganshina, Pt. 1', lengthMin: 24 }
    ],
    score: 9.0,
    coverImage: '/cdn/images/poster-default.svg',
    createdAt: now()
  },
  {
    _id: new ObjectId(),
    slug: 'demon-slayer',
    title: 'Demon Slayer',
    synopsis: 'A boy becomes a demon slayer to cure his sister.',
    genres: ['Action', 'Supernatural'],
    episodes: [
      { number: 1, title: 'Cruelty', lengthMin: 24 }
    ],
    score: 8.7,
    coverImage: mediaPaths['demon-slayer'] || '/cdn/images/poster-default.svg',
    createdAt: now()
  },
  {
    _id: new ObjectId(),
    slug: 'fullmetal-alchemist-brotherhood',
    title: 'Fullmetal Alchemist: Brotherhood',
    synopsis: 'Two brothers seek the Philosopher’s Stone after a failed ritual.',
    genres: ['Action', 'Adventure', 'Fantasy'],
    episodes: [
      { number: 1, title: 'Fullmetal Alchemist', lengthMin: 24 }
    ],
    score: 9.1,
    coverImage: '/cdn/images/poster-default.svg',
    createdAt: now()
  },
  {
    _id: new ObjectId(),
    slug: 'my-hero-academia',
    title: 'My Hero Academia',
    synopsis: 'A boy without powers enrolls in a hero academy.',
    genres: ['Action', 'Superhero'],
    episodes: [
      { number: 1, title: 'Izuku Midoriya: Origin', lengthMin: 24 }
    ],
    score: 8.2,
    coverImage: mediaPaths['naruto'] || '/cdn/images/poster-default.svg',
    createdAt: now()
  },
  {
    _id: new ObjectId(),
    slug: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    synopsis: 'A student swallows a cursed talisman to save his friends.',
    genres: ['Action', 'Supernatural'],
    episodes: [
      { number: 1, title: 'Ryomen Sukuna', lengthMin: 24 }
    ],
    score: 8.6,
    coverImage: '/cdn/images/poster-default.svg',
    createdAt: now()
  },
  {
    _id: new ObjectId(),
    slug: 'death-note',
    title: 'Death Note',
    synopsis: 'A student finds a notebook that kills anyone whose name is written.',
    genres: ['Thriller', 'Supernatural'],
    episodes: [
      { number: 1, title: 'Rebirth', lengthMin: 23 }
    ],
    score: 8.7,
    coverImage: '/cdn/images/poster-default.svg',
    createdAt: now()
  },
  {
    _id: new ObjectId(),
    slug: 'hunter-x-hunter',
    title: 'Hunter x Hunter',
    synopsis: 'A boy becomes a Hunter to find his father.',
    genres: ['Adventure', 'Action'],
    episodes: [
      { number: 1, title: 'Departure × Friends', lengthMin: 23 }
    ],
    score: 8.9,
    coverImage: mediaPaths['naruto'] || '/cdn/images/poster-default.svg',
    createdAt: now()
  }
]

const users = [
  {
    _id: new ObjectId(),
    username: 'demo',
    email: 'demo@example.com',
    role: 'user',
    avatar: '/avatars/default.svg',
    favorites: ['naruto'],
    clips: [],
    createdAt: now()
  },
  {
    _id: new ObjectId(),
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    avatar: '/avatars/default.svg',
    favorites: [],
    clips: [],
    createdAt: now()
  },
  {
    _id: new ObjectId(),
    username: 'mod',
    email: 'mod@example.com',
    role: 'moderator',
    avatar: '/avatars/default.svg',
    favorites: [],
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
    comments: [
      { _id: cryptoRandom(), author: 'admin', text: 'Welcome aboard!', createdAt: now() },
      { _id: cryptoRandom(), author: 'mod', text: 'Please be kind and follow the rules.', createdAt: now() }
    ],
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
    createdAt: now(),
    publicPath: '/cdn/clips/demo-clip-1.mp4',
    thumbnail: mediaPaths['naruto'] || '/cdn/images/poster-default.svg'
  }
]

const episodeDocs = [
  {
    animeSlug: 'naruto',
    episodeNumber: 1,
    title: 'Training Day',
    status: 'ready',
    publicPath: '/cdn/episodes/demo-episode-1.mp4',
    hlsPath: null,
    filePath: demoEpisodeFile,
    thumbnail: mediaPaths['naruto'] || '/cdn/images/poster-default.svg',
    variants: ['mp4'],
    createdBy: 'admin',
    createdAt: now(),
    updatedAt: now()
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
    { name: 'clips', data: clips },
    { name: 'episodes', data: episodeDocs }
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

  const animeCol = db.collection('anime')
  for (const [slug, coverImage] of Object.entries(mediaPaths)) {
    await animeCol.updateOne({ slug }, { $set: { coverImage } })
  }

  await db.collection('clips').updateOne(
    { animeSlug: 'naruto', createdBy: 'demo' },
    { $set: { publicPath: '/cdn/clips/demo-clip-1.mp4', thumbnail: mediaPaths['naruto'] || '/cdn/images/poster-default.svg' } },
    { upsert: true }
  )

  const episodesCol = db.collection('episodes')
  for (const doc of episodeDocs) {
    await episodesCol.updateOne(
      { animeSlug: doc.animeSlug, episodeNumber: doc.episodeNumber },
      {
        $set: {
          status: doc.status,
          publicPath: doc.publicPath,
          hlsPath: doc.hlsPath,
          thumbnail: doc.thumbnail,
          variants: doc.variants,
          filePath: doc.filePath,
          title: doc.title,
          createdBy: doc.createdBy,
          updatedAt: now()
        },
        $setOnInsert: { createdAt: doc.createdAt }
      },
      { upsert: true }
    )
  }

  // Ensure demo user with password exists/updated
  const demoPass = 'demo123'
  const passwordHash = await bcrypt.hash(demoPass, 10)
  const usersCol = db.collection('users')
  const demo = await usersCol.findOne({ username: 'demo' })
  if (!demo) {
    await usersCol.insertOne({ username: 'demo', email: 'demo@example.com', role: 'user', passwordHash, avatar: '/avatars/default.svg', favorites: ['naruto'], clips: [], createdAt: now() })
    console.log('Inserted demo user with default password')
  } else if (!demo.passwordHash) {
    await usersCol.updateOne({ _id: demo._id }, { $set: { passwordHash, role: demo.role || 'user', email: demo.email || 'demo@example.com' } })
    console.log('Updated demo user with password')
  }

  // Ensure admin and mod with passwords
  const admin = await usersCol.findOne({ username: 'admin' })
  if (!admin) {
    const hash = await bcrypt.hash('AdminPass123!', 10)
    await usersCol.insertOne({ username: 'admin', email: 'admin@example.com', role: 'admin', passwordHash: hash, avatar: '/avatars/default.svg', favorites: [], clips: [], createdAt: now() })
    console.log('Inserted admin user (AdminPass123!)')
  }
  const mod = await usersCol.findOne({ username: 'mod' })
  if (!mod) {
    const hash = await bcrypt.hash('ModPass123!', 10)
    await usersCol.insertOne({ username: 'mod', email: 'mod@example.com', role: 'moderator', passwordHash: hash, avatar: '/avatars/default.svg', favorites: [], clips: [], createdAt: now() })
    console.log('Inserted moderator user (ModPass123!)')
  }

  await client.close()
  console.log('Seeding complete.')
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})

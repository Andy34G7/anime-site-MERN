import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { MongoClient, ObjectId } from 'mongodb'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbName = process.env.DB_NAME || 'anime_dev'

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
    coverImage: 'https://placehold.co/400x600?text=Naruto',
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
    coverImage: 'https://placehold.co/400x600?text=One+Piece',
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
    coverImage: 'https://placehold.co/400x600?text=AOT',
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
    coverImage: 'https://placehold.co/400x600?text=Kimetsu',
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
    coverImage: 'https://placehold.co/400x600?text=FMAB',
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
    coverImage: 'https://placehold.co/400x600?text=MHA',
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
    coverImage: 'https://placehold.co/400x600?text=JJK',
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
    coverImage: 'https://placehold.co/400x600?text=Death+Note',
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
    coverImage: 'https://placehold.co/400x600?text=HxH',
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

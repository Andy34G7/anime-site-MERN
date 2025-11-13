import { MongoClient } from 'mongodb'

let client
let db

export async function getDb() {
  if (db) return db
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  client = new MongoClient(uri)
  await client.connect()
  db = client.db(process.env.DB_NAME || 'anime_dev')
  return db
}

export async function closeDb() {
  if (client) await client.close()
  client = undefined
  db = undefined
}

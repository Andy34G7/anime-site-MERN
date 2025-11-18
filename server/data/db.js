import { MongoClient } from 'mongodb'

let client
let db

export async function getDb() {
  if (db) return db
  const uri = process.env.MONGODB_URI || 'mongodb+srv://aivillio34_db_user:zawarudo@anime-proj.txkrj4y.mongodb.net/animeDB'
  client = new MongoClient(uri)
  await client.connect()
  db = client.db(process.env.DB_NAME || 'animeDB')
  return db
}

export async function closeDb() {
  if (client) await client.close()
  client = undefined
  db = undefined
}

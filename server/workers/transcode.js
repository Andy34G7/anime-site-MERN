import { Worker, QueueEvents } from 'bullmq'
import IORedis from 'ioredis'
import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { MongoClient, ObjectId } from 'mongodb'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const redisURL = process.env.REDIS_URL || 'redis://localhost:6379'
const connection = new IORedis(redisURL)

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbName = process.env.DB_NAME || 'anime_dev'
let db

async function getDb() {
  if (db) return db
  const client = new MongoClient(mongoUri)
  await client.connect()
  db = client.db(dbName)
  return db
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd })
    let stderr = ''
    child.stderr.on('data', (d) => { stderr += d.toString() })
    child.on('close', (code) => {
      if (code === 0) resolve(0)
      else reject(new Error(`Command failed: ${cmd} ${args.join(' ')}\n${stderr}`))
    })
  })
}

async function transcodeJob(job) {
  const { episodeId, sourcePath, outputDir } = job.data
  const outDir = outputDir
  await ensureDir(outDir)

  const s480 = path.join(outDir, '480p.m3u8')
  const s720 = path.join(outDir, '720p.m3u8')
  const master = path.join(outDir, 'master.m3u8')
  const thumb = path.join(outDir, 'thumb.jpg')

  // 480p
  await run('ffmpeg', [
    '-y', '-i', sourcePath,
    '-vf', 'scale=w=854:h=480:force_original_aspect_ratio=decrease',
    '-c:a', 'aac', '-ar', '48000', '-b:a', '128k',
    '-c:v', 'h264', '-profile:v', 'main', '-crf', '23', '-g', '48', '-keyint_min', '48', '-sc_threshold', '0',
    '-hls_time', '4', '-hls_playlist_type', 'vod', '-hls_segment_filename', path.join(outDir, '480p_%03d.ts'),
    s480
  ], outDir)

  // 720p
  await run('ffmpeg', [
    '-y', '-i', sourcePath,
    '-vf', 'scale=w=1280:h=720:force_original_aspect_ratio=decrease',
    '-c:a', 'aac', '-ar', '48000', '-b:a', '128k',
    '-c:v', 'h264', '-profile:v', 'high', '-crf', '21', '-g', '48', '-keyint_min', '48', '-sc_threshold', '0',
    '-hls_time', '4', '-hls_playlist_type', 'vod', '-hls_segment_filename', path.join(outDir, '720p_%03d.ts'),
    s720
  ], outDir)

  const masterContent = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=854x480\n480p.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720\n720p.m3u8\n`
  await fs.writeFile(master, masterContent, 'utf8')

  // Thumbnail (grab a frame at 5s if possible)
  await run('ffmpeg', [
    '-y', '-ss', '5', '-i', sourcePath, '-frames:v', '1', '-q:v', '2', thumb
  ], outDir)

  const database = await getDb()
  await database.collection('episodes').updateOne(
    { _id: new ObjectId(episodeId) },
    { $set: { status: 'ready', hlsPath: `/cdn/hls/${episodeId}/master.m3u8`, thumbnail: `/cdn/hls/${episodeId}/thumb.jpg`, variants: ['480p', '720p'] } }
  )

  return { ok: true }
}

const w = new Worker('transcode', transcodeJob, { connection })
const qe = new QueueEvents('transcode', { connection })

w.on('completed', (job) => {
  console.log(`Job completed ${job.id}`)
})

w.on('failed', (job, err) => {
  console.error(`Job failed ${job?.id}:`, err?.message)
})

qe.on('failed', ({ jobId, failedReason }) => {
  console.error(`Queue failed ${jobId}:`, failedReason)
})

console.log('Transcode worker started')

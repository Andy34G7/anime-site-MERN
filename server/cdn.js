import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url))
const MEDIA_ROOT = process.env.MEDIA_ROOT ? path.resolve(process.env.MEDIA_ROOT) : path.join(CURRENT_DIR, 'media')
const PORT = process.env.CDN_PORT ? Number(process.env.CDN_PORT) : 5050

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

app.use('/cdn', express.static(MEDIA_ROOT, { dotfiles: 'ignore', etag: true, lastModified: true, setHeaders: setCdnHeaders }))

// Basic health endpoint so we can quickly confirm the CDN is up
app.get('/healthz', (req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`[CDN] Serving ${MEDIA_ROOT} at http://localhost:${PORT}`)
})

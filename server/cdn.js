import express from 'express'
import path from 'node:path'

const app = express()
const MEDIA_ROOT = process.env.MEDIA_ROOT || path.join(process.cwd(), 'server', 'media')
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

app.use(express.static(MEDIA_ROOT, { dotfiles: 'ignore', etag: true, lastModified: true, setHeaders: setCdnHeaders }))

app.listen(PORT, () => {
  console.log(`[CDN] Serving ${MEDIA_ROOT} at http://localhost:${PORT}`)
})

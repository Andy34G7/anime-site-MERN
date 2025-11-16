import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'

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

export async function transcodeEpisode({ episodeId, sourcePath, outputDir, update }) {
  await ensureDir(outputDir)

  const s480 = path.join(outputDir, '480p.m3u8')
  const s720 = path.join(outputDir, '720p.m3u8')
  const master = path.join(outputDir, 'master.m3u8')
  const thumb = path.join(outputDir, 'thumb.jpg')

  // 480p
  await run('ffmpeg', [
    '-y', '-i', sourcePath,
    '-vf', 'scale=w=854:h=480:force_original_aspect_ratio=decrease',
    '-c:a', 'aac', '-ar', '48000', '-b:a', '128k',
    '-c:v', 'h264', '-profile:v', 'main', '-crf', '23', '-g', '48', '-keyint_min', '48', '-sc_threshold', '0',
    '-hls_time', '4', '-hls_playlist_type', 'vod', '-hls_segment_filename', path.join(outputDir, '480p_%03d.ts'),
    s480
  ], outputDir)

  // 720p
  await run('ffmpeg', [
    '-y', '-i', sourcePath,
    '-vf', 'scale=w=1280:h=720:force_original_aspect_ratio=decrease',
    '-c:a', 'aac', '-ar', '48000', '-b:a', '128k',
    '-c:v', 'h264', '-profile:v', 'high', '-crf', '21', '-g', '48', '-keyint_min', '48', '-sc_threshold', '0',
    '-hls_time', '4', '-hls_playlist_type', 'vod', '-hls_segment_filename', path.join(outputDir, '720p_%03d.ts'),
    s720
  ], outputDir)

  const masterContent = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=854x480\n480p.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720\n720p.m3u8\n`
  await fs.writeFile(master, masterContent, 'utf8')

  // Thumbnail
  await run('ffmpeg', [ '-y', '-ss', '5', '-i', sourcePath, '-frames:v', '1', '-q:v', '2', thumb ], outputDir)

  if (typeof update === 'function') {
    await update({ hlsPath: `/cdn/hls/${episodeId}/master.m3u8`, thumbnail: `/cdn/hls/${episodeId}/thumb.jpg`, variants: ['480p', '720p'] })
  }
}

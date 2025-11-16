# Local Media CDN

This folder is the root for locally served media. Files placed here are accessible at `/cdn/...` via the Express server.

Structure (suggested):

- images/: posters, banners, avatars
- clips/: short mp4/webm clips
- episodes/: full episodes or longer videos

Examples (assuming server on <http://localhost:5000>):

- <http://localhost:5000/cdn/images/naruto.jpg>
- <http://localhost:5000/cdn/clips/clip1.mp4>
- <http://localhost:5000/cdn/episodes/one-piece-ep1.mp4>

Caching

- Images: Cache-Control max-age=31536000, immutable
- Video/Audio: Cache-Control max-age=604800
- Other: Cache-Control max-age=3600

Range requests

Large files (video/audio) are served with `Accept-Ranges: bytes`. Express static supports Range requests, enabling streaming/scrubbing.

Configuration

- `MEDIA_ROOT` env var: set a custom absolute path to use as the CDN root. Default is this folder.

Notes

- Do not commit large media files to Git. Keep this folder gitignored or use an external volume.
- In production, consider putting a real CDN (or Nginx) in front of the Node server.

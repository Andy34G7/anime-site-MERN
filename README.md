# Anime Site (MERN)

Full-stack anime streaming sandbox built with the MERN stack. The project serves a curated catalog, user profiles, community posts, and basic media upload/transcoding so you can prototype an end-to-end anime platform locally. Made for Web Tech Course project.

## Features

- **Catalog & detail pages** for curated anime metadata, streaming links, and search with MongoDB text indexes.
- **Auth & profiles** including JWT-based login/registration, favorites, avatars, and role-aware guards for moderator/admin flows.
- **Community hub** for posts, comments, and lightweight moderation endpoints.
- **Media pipeline** with optional CDN process, protected uploads, and FFmpeg-powered HLS transcoding for episodes/clips.
- **Messaging utilities** for password reset links and contact form delivery via SMTP (falls back to console logs in dev).

## Tech Stack

- React 18 + Vite, React Router, Axios, HLS.js on the client.
- Express 5, MongoDB driver, JWT, Multer, Helmet, Nodemailer on the server.
- FFmpeg for HLS rendition generation, served from the built-in `/cdn` endpoint.

## Project Structure

```text
client/   # Vite + React SPA
server/   # Express API, media handlers, workers, seeds
media/    # Local storage for uploaded images/clips/episodes (inside server/ by default)
```

## Getting Started

1. **Install prerequisites**: Node.js 18+, npm, MongoDB/Atlas connection string, and FFmpeg available in your PATH.
2. **Clone and install**

   ```bash
   git clone https://github.com/Andy34G7/anime-site-MERN.git
   cd anime-site-MERN
   npm install
   npm --prefix server install
   npm --prefix client install
   ```

3. **Configure environment**

   - `server/.env` (copy `.env.example` if you add one):

     ```ini
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017
     DB_NAME=animeDB
     JWT_SECRET=dev_jwt_secret
     MEDIA_ROOT=/absolute/path/to/anime-site-MERN/server/media
     SMTP_HOST=smtp.example.com
     SMTP_PORT=587
     SMTP_USER=your-user
     SMTP_PASS=your-pass
     SMTP_SECURE=false
     EMAIL_FROM=Anime Bloom <no-reply@example.com>
     CONTACT_INBOX=support@example.com
     APP_URL=http://localhost:5173
     CDN_PORT=5050
     UPLOAD_LIMIT_IMAGES=10485760
     UPLOAD_LIMIT_CLIPS=209715200
     UPLOAD_LIMIT_EPISODES=1610612736
     ```

   - `client/.env`:

     ```ini
     VITE_API_URL=http://localhost:5000/api
     VITE_CDN_URL=http://localhost:5000
     ```

4. **Seed demo data (optional but recommended)**

   ```bash
   npm --prefix server run seed
   ```

5. **Run the dev stack**

   ```bash
   # API + client
   npm run dev

   # API + client + standalone CDN server (useful if serving media from another port)
   npm run dev:cdn
   ```

   The React app becomes available at `http://localhost:5173`, the API at `http://localhost:5000`, and the CDN (optional) at `http://localhost:5050`.

## Production Notes

- Build the SPA with `npm --prefix client run build` and host the `dist/` output behind your preferred CDN or static host.
- Start the API/CDN with `npm --prefix server run start` (and optionally `npm --prefix server run cdn`).
- Ensure `MEDIA_ROOT` points to persistent storage; episodes/clips are large and transcoding jobs write additional HLS segments.
- Configure SMTP credentials before enabling password reset/contact flows in production.

## License

This project is licensed under the ISC License. See `LICENSE` for more information.

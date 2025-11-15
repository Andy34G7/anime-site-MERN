import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import './AnimeDetail.css'

export default function AnimeDetail() {
  const { slug } = useParams()
  const [anime, setAnime] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get(`/anime/${encodeURIComponent(slug)}`)
      .then(res => { if (active) { setAnime(res.data); setLoading(false) }})
      .catch(err => { console.error(err); if (active) { setError('Not found or failed to load'); setLoading(false) }})
    return () => { active = false }
  }, [slug])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="error">{error}</div>
  if (!anime) return <div className="error">No data</div>

  return (
    <main className="anime-detail-wrapper">
      <div className="anime-detail-container">
        <img 
          className="anime-poster"
          src={anime.images?.jpg?.image_url || anime.coverImage}
          alt={anime.title}
        />

        <div className="anime-info">
          <h1 className="anime-title">{anime.title}</h1>

          <h3 className="section-label">DETAILS</h3>
          <p className="synopsis">{anime.synopsis}</p>

          <h3 className="section-label">GENRES</h3>
          <div className="genres">
            {(anime.genres || []).join(', ') || 'None'}
          </div>

          <h3 className="section-label">EPISODES</h3>
          <ul className="episode-list">
            {(anime.episodes || []).map((ep, i) => (
              <li key={i} className="episode-item">
                <span className="ep-number">Ep {ep.number || i + 1}</span>
                <span className="ep-title">{ep.title || 'Untitled'}</span>
                <span className="ep-length">{ep.lengthMin || '?'} min</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}

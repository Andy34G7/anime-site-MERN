import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { toMediaUrl } from '../services/api'
import './AnimeDetail.css'

export default function AnimeDetail() {
  const { slug } = useParams()
  const [anime, setAnime] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get(`/anime/${encodeURIComponent(slug)}`)
      .then(res => {
        if (!active) return
        const doc = res.data || {}
        setAnime({ ...doc, coverImage: toMediaUrl(doc.coverImage) })
        setLoading(false)
      })
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
          {(anime.episodes || []).length === 0 && <p className="no-episodes">Episodes coming soon.</p>}
          <ul className="episode-list">
            {(anime.episodes || []).map((ep, i) => {
              const epi = ep.number || ep.episodeNumber || i + 1
              return (
                <li key={`${epi}-${ep.title || i}`} className="episode-item">
                  <Link className="episode-link" to={`/stream/${anime.slug || slug}?episode=${epi}`}>
                    <span className="ep-number">Ep {epi}</span>
                    <span className="ep-title">{ep.title || 'Untitled'}</span>
                    <span className="ep-length">{ep.lengthMin || ep.duration || '?'} min</span>
                  </Link>
                </li>
              )
            })}
          </ul>
          {(anime.episodes || []).length > 0 && (
            <div className="episode-cta">
              <Link className="episode-cta-button" to={`/stream/${anime.slug || slug}`}>Open Player</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

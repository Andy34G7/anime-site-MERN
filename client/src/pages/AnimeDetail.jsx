import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

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

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>
  if (error) return <div style={{ padding: 24, color: 'crimson' }}>{error}</div>
  if (!anime) return <div style={{ padding: 24 }}>No data</div>

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>{anime.title}</h1>
      <p>{anime.synopsis}</p>
      <div style={{ marginTop: 24 }}>
        <h3>Genres</h3>
        <div>{(anime.genres || []).join(', ') || 'None'}</div>
      </div>
      <div style={{ marginTop: 24 }}>
        <h3>Episodes</h3>
        <ul>
          {(anime.episodes || []).map((ep, i) => (
            <li key={i}>Episode {ep.number || i + 1}: {ep.title || 'Untitled'} ({ep.lengthMin || '?'} min)</li>
          ))}
        </ul>
      </div>
    </main>
  )
}

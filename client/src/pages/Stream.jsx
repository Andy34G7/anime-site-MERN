import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function Stream() {
  const { animeId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get(`/stream/${encodeURIComponent(animeId)}`)
      .then(res => { if (active) { setData(res.data); setLoading(false) }})
      .catch(err => { console.error(err); if (active) { setError('Failed to load stream'); setLoading(false) }})
    return () => { active = false }
  }, [animeId])

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Stream</h1>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {data && (
        <div>
          <div>Anime ID: <strong>{data.animeId}</strong></div>
          <h3>Episodes</h3>
          <ul>
            {(data.episodes || []).map((e, i) => (
              <li key={i}>Episode {e.number || i + 1}: {e.title || 'Untitled'}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}

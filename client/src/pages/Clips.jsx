import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Clips() {
  const [clips, setClips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/clips')
      .then(res => { if (active) { setClips(res.data.clips || []); setLoading(false) }})
      .catch(err => { console.error(err); if (active) { setError('Failed to load clips'); setLoading(false) }})
    return () => { active = false }
  }, [])

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Clips</h1>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
        {clips.map((c) => (
          <li key={c._id || `${c.animeSlug}-${c.startSec}`} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
            <div><strong>{c.animeSlug}</strong> ep{c.episode}</div>
            <div>From {c.startSec}s to {c.endSec}s</div>
            <div style={{ color: '#666' }}>by {c.createdBy}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}

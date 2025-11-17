import { useEffect, useState } from 'react'
import api, { toMediaUrl } from '../services/api'

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
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 32, color: '#f6f0ff' }}>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Clips</h1>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
        {clips.map((c) => (
          <li key={c._id || `${c.animeSlug}-${c.startSec}`} style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: 16, background: 'rgba(0,0,0,0.25)' }}>
            <div><strong>{c.animeSlug}</strong> ep{c.episode}</div>
            <div>From {c.startSec}s to {c.endSec}s</div>
            <div style={{ color: '#c1b6ff' }}>by {c.createdBy}</div>
            {c.publicPath && (
              <video
                controls
                style={{ width: '100%', marginTop: 10, borderRadius: 8 }}
                src={toMediaUrl(c.publicPath)}
              />
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}

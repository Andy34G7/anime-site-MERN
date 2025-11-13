import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function Profile() {
  const { username } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get(`/profile/${encodeURIComponent(username)}`)
      .then(res => { if (active) { setData(res.data); setLoading(false) }})
      .catch(err => { console.error(err); if (active) { setError('Failed to load profile'); setLoading(false) }})
    return () => { active = false }
  }, [username])

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Profile</h1>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {data && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ fontWeight: 700 }}>{data.username}</div>
          <div>
            <h3>Favorites</h3>
            <ul>
              {(data.favorites || []).map(a => (
                <li key={a.slug}>{a.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Clips</h3>
            <ul>
              {(data.clips || []).map((c, idx) => (
                <li key={idx}>{c.animeSlug} ep{c.episode} [{c.startSec}-{c.endSec}s]</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  )
}

import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Community() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/community/posts')
      .then(res => { if (active) { setPosts(res.data.posts || []); setLoading(false) }})
      .catch(err => { console.error(err); if (active) { setError('Failed to load posts'); setLoading(false) }})
    return () => { active = false }
  }, [])

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Community</h1>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
        {posts.map(p => (
          <li key={p._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 600 }}>{p.title}</div>
            <div style={{ color: '#666', fontSize: 12 }}>by {p.author}</div>
            <p style={{ marginTop: 8 }}>{p.body}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}

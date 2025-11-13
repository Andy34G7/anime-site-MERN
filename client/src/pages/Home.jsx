import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function Section({ title, items }) {
  if (!items?.length) return null
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ margin: '12px 0' }}>{title}</h2>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {items.map((a) => (
          <Link key={a.slug} to={`/anime/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              {a.coverImage ? (
                <img src={a.coverImage} alt={a.title} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} />
              ) : null}
              <div style={{ fontWeight: 600, marginTop: 8 }}>{a.title}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  const [data, setData] = useState({ featured: [], trending: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/home')
      .then((res) => {
        if (active) {
          setData(res.data)
          setLoading(false)
        }
      })
      .catch((e) => {
        console.error(e)
        if (active) {
          setError('Failed to load home data')
          setLoading(false)
        }
      })
    return () => { active = false }
  }, [])

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>
  if (error) return <div style={{ padding: 24, color: 'crimson' }}>{error}</div>

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Anime Site</h1>
      <Section title="Featured" items={data.featured} />
      <Section title="Trending" items={data.trending} />
    </main>
  )
}

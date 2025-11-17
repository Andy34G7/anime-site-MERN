import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api, { toMediaUrl } from '../services/api'

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const qParam = params.get('q') || ''
  const pageParam = Number(params.get('page') || 1)
  const [q, setQ] = useState(qParam)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(pageParam)
  const limit = 20

  useEffect(() => {
    setQ(qParam)
  }, [qParam])

  useEffect(() => {
    if (!qParam) { setResults([]); return }
    let active = true
    setLoading(true); setError('')
    api.get(`/search?q=${encodeURIComponent(qParam)}&page=${pageParam}&limit=${limit}`)
      .then(r => { if (active) { setResults(r.data.results || []); setPage(r.data.page || 1) } })
      .catch(e => { if (active) setError(e?.response?.data?.error || 'Search failed') })
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [qParam, pageParam, limit])

  function submit(e) {
    e.preventDefault()
    const next = q.trim()
    if (!next) {
      setParams({})
      return
    }
    setParams({ q: next, page: '1' })
  }

  function next(delta) {
    const np = Math.max(1, page + delta)
    setParams({ q: qParam, page: String(np) })
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Search</h1>
      <form onSubmit={submit} style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search anime..." style={{ flex: 1, padding: '0.75rem' }} />
        <button style={{ padding: '0.75rem 1.5rem' }}>Go</button>
      </form>
      {loading && <div>Loading…</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && results.length === 0 && qParam && <div>No results.</div>}
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
        {results.map(r => (
          <li key={r.slug} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
            <Link to={`/anime/${r.slug}`} style={{ fontWeight: 600 }}>{r.title}</Link>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{(r.synopsis || '').slice(0, 140)}{(r.synopsis||'').length>140?'…':''}</div>
            {r.coverImage && <img src={toMediaUrl(r.coverImage)} alt={r.title} style={{ maxWidth: 160, marginTop: 8 }} />}
          </li>
        ))}
      </ul>
      {results.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button onClick={() => next(-1)} disabled={page <= 1}>Prev</button>
          <span>Page {page}</span>
          <button onClick={() => next(1)} disabled={results.length < limit}>Next</button>
        </div>
      )}
    </main>
  )
}

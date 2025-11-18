import { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Upload() {
  const { token } = useAuth()
  const [type, setType] = useState('images')
  const [file, setFile] = useState(null)
  const [animeSlug, setAnimeSlug] = useState('')
  const [episodeNumber, setEpisodeNumber] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(''); setResult(null)
    if (!token) return setError('You must be logged in')
    if (!file) return setError('Please choose a file')
    try {
      setLoading(true)
      const form = new FormData()
      form.append('file', file)
      if (type === 'episodes') {
        form.append('animeSlug', animeSlug)
        form.append('episodeNumber', episodeNumber)
      }
      const res = await api.post(`/upload/${type}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Upload failed')
    } finally { setLoading(false) }
  }

  return (
    <main className="profile-page" style={{ padding: 24 }}>
      <h1>Upload Media</h1>
      <form onSubmit={submit} className="login-form" style={{ maxWidth: 560 }}>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
            <option value="images">Images</option>
            <option value="clips">Clips</option>
            <option value="episodes">Episodes</option>
          </select>
        </div>
        {type === 'episodes' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label className="form-label">Anime Slug</label>
              <input className="form-input" value={animeSlug} onChange={e=>setAnimeSlug(e.target.value)} placeholder="e.g. naruto" />
            </div>
            <div className="form-group">
              <label className="form-label">Episode Number</label>
              <input className="form-input" type="number" value={episodeNumber} onChange={e=>setEpisodeNumber(e.target.value)} min="1" />
            </div>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">File</label>
          <input className="form-input" type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
        </div>
        {error && <div className="error">{error}</div>}
        <button disabled={loading} className="login-button">{loading ? 'Uploading…' : 'Upload'}</button>
      </form>

      {result && (
        <div style={{ marginTop: 16 }}>
          <div className="success">Uploaded!</div>
          <div>Path: <code>{result.path}</code></div>
          <div>Size: {result.size} bytes</div>
          <div>Type: {result.mimetype}</div>
        </div>
      )}
    </main>
  )
}

import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Admin() {
  const { role } = useAuth()
  const [episodes, setEpisodes] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ animeSlug: '', episodeNumber: '' })

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/admin/episodes?limit=50')
      setEpisodes(res.data.episodes || [])
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load episodes')
    } finally { setLoading(false) }
  }

  async function requeue(id) {
    try {
      await api.post(`/admin/transcode/${id}`)
      await load()
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to requeue job')
    }
  }

  function startEdit(ep) {
    setEditing(ep._id)
    setForm({ animeSlug: ep.animeSlug || '', episodeNumber: ep.episodeNumber || '' })
  }

  async function saveEdit(id) {
    try {
      await api.put(`/admin/episodes/${id}`, { animeSlug: form.animeSlug, episodeNumber: Number(form.episodeNumber) })
      setEditing(null)
      await load()
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to save episode')
    }
  }

  async function backfill(dryRun = false) {
    try {
      const res = await api.post(`/admin/backfill/episodes?dryRun=${dryRun ? 'true' : 'false'}`)
      if (dryRun) alert(`Would apply ${res.data.count} changes`)
      else await load()
    } catch (e) {
      setError(e?.response?.data?.error || 'Backfill failed')
    }
  }

  useEffect(() => { load() }, [])

  if (role !== 'admin' && role !== 'moderator') {
    return <main style={{ padding: 24 }}><h1>Admin</h1><div>Forbidden</div></main>
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>
      {error && <div className="error">{error}</div>}
      {loading ? <div>Loading…</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">ID</th>
              <th align="left">Status</th>
              <th align="left">HLS</th>
              <th align="left">Uploaded By</th>
              <th align="left">Anime Slug</th>
              <th align="left">Episode #</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {episodes.map(ep => (
              <tr key={ep._id}>
                <td><code>{ep._id}</code></td>
                <td>{ep.status}</td>
                <td>{ep.hlsPath ? <a href={ep.hlsPath} target="_blank">Open</a> : '-'}</td>
                <td>{ep.createdBy}</td>
                <td>
                  {editing === ep._id ? (
                    <input value={form.animeSlug} onChange={e=>setForm(f=>({ ...f, animeSlug: e.target.value }))} />
                  ) : (ep.animeSlug || '-')}
                </td>
                <td>
                  {editing === ep._id ? (
                    <input type="number" value={form.episodeNumber} onChange={e=>setForm(f=>({ ...f, episodeNumber: e.target.value }))} style={{ width: 80 }} />
                  ) : (ep.episodeNumber || '-')}
                </td>
                <td style={{ display:'flex', gap:8 }}>
                  <button onClick={() => requeue(ep._id)}>Requeue</button>
                  {editing === ep._id ? (
                    <>
                      <button onClick={() => saveEdit(ep._id)}>Save</button>
                      <button onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(ep)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: 16, display:'flex', gap:8 }}>
        <button onClick={() => backfill(true)}>Preview Backfill</button>
        <button onClick={() => backfill(false)}>Run Backfill</button>
      </div>
    </main>
  )
}

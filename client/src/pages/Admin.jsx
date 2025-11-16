import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Admin() {
  const { role } = useAuth()
  const [episodes, setEpisodes] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

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
                  <button onClick={() => requeue(ep._id)}>Requeue</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}

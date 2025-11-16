import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import "./Profile.css"
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { username: currentUser, logout } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    api.get(`/profile/${encodeURIComponent(username)}`)
      .then(res => { if (active) { setData(res.data); setAvatarUrl(res.data?.avatar || ''); setLoading(false) }})
      .catch(err => { console.error(err); if (active) { setError('Failed to load profile'); setLoading(false) }})
    return () => { active = false }
  }, [username])

  async function saveAvatar(e) {
    e.preventDefault()
    setSaveError(''); setSaved(false)
    if (!avatarUrl || avatarUrl.length < 5) {
      setSaveError('Please enter a valid image URL')
      return
    }
    try {
      setSaving(true)
      await api.put('/profile', { avatar: avatarUrl })
      setData(d => d ? { ...d, avatar: avatarUrl } : d)
      setSaved(true)
    } catch (err) {
      setSaveError(err?.response?.data?.error || 'Failed to save')
    } finally { setSaving(false) }
  }

  return (
    <main className="profile-page">
      <div className="profile-wrapper">
        <h1 className="profile-title">PROFILE</h1>

        {currentUser && currentUser === username && (
          <div style={{ marginBottom: 12 }}>
            <button className="logout-btn" onClick={() => { logout(); navigate('/') }}>Logout</button>
          </div>
        )}

        {loading && <div className="loading">Loading…</div>}
        {error && <div className="error">{error}</div>}

        {data && (
          <div className="profile-card">

            {/* LEFT SIDE */}
            <div className="profile-left">
              <div className="profile-field">
                <label>USERNAME</label>
                <input value={data.username} disabled />
              </div>

              <div className="profile-field">
                <label>FAVORITES</label>
                <ul>
                  {(data.favorites || []).map(a => (
                    <li key={a.slug}>{a.title}</li>
                  ))}
                </ul>
              </div>

              <div className="profile-field">
                <label>CLIPS</label>
                <ul>
                  {(data.clips || []).map((c, idx) => (
                    <li key={idx}>
                      {c.animeSlug} ep{c.episode} [{c.startSec}-{c.endSec}s]
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* RIGHT SIDE AVATAR */}
            <div className="profile-right">
              <div className="avatar-circle">
                <img src={data.avatar || "/avatars/default.svg"} alt="avatar" />
              </div>
              {currentUser && currentUser === username && (
                <form onSubmit={saveAvatar} style={{ marginTop: 12 }}>
                  <label className="form-label">Avatar URL</label>
                  <input
                    className="form-input"
                    placeholder="https://..."
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                  />
                  {saveError && <div className="error" style={{ marginTop: 6 }}>{saveError}</div>}
                  {saved && <div className="success" style={{ marginTop: 6 }}>Saved!</div>}
                  <button disabled={saving || (data.avatar || '') === avatarUrl} className="login-button" style={{ marginTop: 8 }}>
                    {saving ? 'Saving…' : 'Save Avatar'}
                  </button>
                </form>
              )}
            </div>

          </div>
        )}
      </div>
    </main>
  )
}

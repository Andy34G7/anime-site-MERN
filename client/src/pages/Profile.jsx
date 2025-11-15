import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import "./Profile.css"

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
    <main className="profile-page">
      <div className="profile-wrapper">
        <h1 className="profile-title">PROFILE</h1>

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
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4333/4333609.png"
                  alt="avatar"
                />
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  )
}

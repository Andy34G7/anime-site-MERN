import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Hls from 'hls.js'
import api from '../services/api'

export default function Stream() {
  const { animeId } = useParams()
  const [data, setData] = useState(null)
  const [currentEp, setCurrentEp] = useState(null)
  const [epLoading, setEpLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get(`/stream/${encodeURIComponent(animeId)}`)
      .then(res => { if (active) { setData(res.data); setLoading(false) }})
      .catch(err => { console.error(err); if (active) { setError('Failed to load stream'); setLoading(false) }})
    return () => { active = false }
  }, [animeId])

  useEffect(() => {
    if (!currentEp || !currentEp.hlsPath) return
    const video = document.getElementById('hls-player')
    if (!video) return
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true })
      hls.loadSource(currentEp.hlsPath)
      hls.attachMedia(video)
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = currentEp.hlsPath
    }
  }, [currentEp])

  function selectEpisode(ep) {
    setCurrentEp(ep)
    if (ep.status !== 'ready') {
      // poll until ready
      setEpLoading(true)
      const id = ep._id
      const interval = setInterval(async () => {
        try {
          const r = await api.get(`/episodes/${id}`)
          if (r.data.status === 'ready') {
            clearInterval(interval)
            // update episodes list state
            setData(d => ({ ...d, episodes: (d.episodes||[]).map(e => e._id === id ? { ...e, ...r.data } : e) }))
            setCurrentEp(r.data)
            setEpLoading(false)
          } else if (r.data.status === 'failed') {
            clearInterval(interval)
            setEpLoading(false)
          }
        } catch (e) {
          clearInterval(interval)
          setEpLoading(false)
        }
      }, 4000)
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Stream</h1>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {data && (
        <div>
          <h2>{data.anime.title}</h2>
          <p style={{ opacity: 0.8 }}>{data.anime.synopsis}</p>
          <div style={{ display:'flex', gap:24, marginTop:24 }}>
            <div style={{ flex: 1 }}>
              <h3>Episodes</h3>
              <ul style={{ listStyle:'none', padding:0 }}>
                {(data.episodes || []).map(ep => (
                  <li key={ep._id} style={{ marginBottom:8 }}>
                    <button onClick={() => selectEpisode(ep)} style={{ cursor:'pointer', background:'none', border:'1px solid #ccc', padding:'6px 10px', borderRadius:6, width:'100%', textAlign:'left' }}>
                      Ep {ep.episodeNumber || '?'} — {ep.status}
                      {ep.status === 'processing' && ' (transcoding…)'}
                      {ep.status === 'failed' && ' (failed)'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 2 }}>
              <h3>Player</h3>
              {!currentEp && <div>Select an episode to play.</div>}
              {currentEp && (
                <div>
                  <div style={{ marginBottom:8 }}>Episode {currentEp.episodeNumber} — {currentEp.status}</div>
                  <video id="hls-player" controls style={{ width:'100%', background:'#000', borderRadius:8 }} poster={currentEp.thumbnail || data.anime.coverImage} />
                  {epLoading && currentEp.status !== 'ready' && <div style={{ marginTop:8 }}>Waiting for transcoding… polling</div>}
                  {currentEp.status === 'failed' && <div style={{ color:'crimson', marginTop:8 }}>Transcode failed.</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

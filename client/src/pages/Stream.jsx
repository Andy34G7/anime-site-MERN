import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Hls from 'hls.js'
import api, { toMediaUrl } from '../services/api'

export default function Stream() {
  const { animeId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [currentEp, setCurrentEp] = useState(null)
  const [epLoading, setEpLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [playerError, setPlayerError] = useState('')
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const pollRef = useRef(null)
  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }
  const pageStyle = { maxWidth: 1000, margin: '0 auto', padding: '32px 24px', color: '#f6f0ff' }
  const panelStyle = { background: 'rgba(12, 6, 24, 0.75)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 20 }
  const requestedEpisode = useMemo(() => {
    const value = Number(searchParams.get('episode'))
    return Number.isFinite(value) && value > 0 ? value : null
  }, [searchParams])

  const playbackSource = useMemo(() => {
    if (!currentEp || currentEp.status !== 'ready') return null
    const raw = currentEp.hlsPath || currentEp.publicPath || currentEp.streamUrl
    if (!raw) return null
    const isHls = /\.m3u8(\?|$)/i.test(raw)
    return { url: toMediaUrl(raw), isHls }
  }, [currentEp])

  useEffect(() => {
    let active = true
    api.get(`/stream/${encodeURIComponent(animeId)}`)
      .then(res => {
        if (!active) return
        const mapEpisode = (ep) => ({
          ...ep,
          thumbnail: toMediaUrl(ep?.thumbnail)
        })
        setData({
          ...res.data,
          anime: { ...res.data?.anime, coverImage: toMediaUrl(res.data?.anime?.coverImage) },
          episodes: (res.data?.episodes || []).map(mapEpisode)
        })
        setLoading(false)
      })
      .catch(err => { console.error(err); if (active) { setError('Failed to load stream'); setLoading(false) }})
    return () => { active = false }
  }, [animeId])

  useEffect(() => () => {
    stopPolling()
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      return
    }

    if (!playbackSource) {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      video.removeAttribute('src')
      video.load()
      return undefined
    }

    setPlayerError('')

    if (playbackSource.isHls) {
      if (Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy()
        const hls = new Hls({ enableWorker: true })
        hls.loadSource(playbackSource.url)
        hls.attachMedia(video)
        hlsRef.current = hls
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playbackSource.url
        video.load()
      } else {
        setPlayerError('Your browser cannot play this HLS stream. Try Chrome, Edge, or Safari.')
      }
    } else {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      video.src = playbackSource.url
      video.load()
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [playbackSource])

  useEffect(() => {
    if (!data || !Array.isArray(data.episodes) || data.episodes.length === 0) return
    if (currentEp && (!requestedEpisode || Number(currentEp.episodeNumber) === requestedEpisode)) return
    let initial = null
    if (requestedEpisode) {
      initial = data.episodes.find(e => Number(e.episodeNumber) === requestedEpisode)
    }
    if (!initial) {
      initial = data.episodes.find(e => e.status === 'ready') || data.episodes[0]
    }
    if (initial) {
      setCurrentEp(initial)
    }
  }, [data, requestedEpisode, currentEp])

  function selectEpisode(ep) {
    stopPolling()
    setPlayerError('')
    setCurrentEp(ep)
    setEpLoading(ep.status !== 'ready')
    if (ep?.episodeNumber) {
      const next = new URLSearchParams(searchParams)
      next.set('episode', String(ep.episodeNumber))
      setSearchParams(next, { replace: true })
    }
    if (ep.status !== 'ready') {
      // poll until ready
      const id = ep._id
      const interval = setInterval(async () => {
        try {
          const r = await api.get(`/episodes/${id}`)
          if (r.data.status === 'ready') {
            stopPolling()
            // update episodes list state
            setData(d => ({ ...d, episodes: (d.episodes||[]).map(e => e._id === id ? { ...e, ...r.data } : e) }))
            setCurrentEp(r.data)
            setEpLoading(false)
          } else if (r.data.status === 'failed') {
            stopPolling()
            setEpLoading(false)
          }
        } catch (e) {
          stopPolling()
          setEpLoading(false)
        }
      }, 4000)
      pollRef.current = interval
    }
  }

  return (
    <main style={pageStyle}>
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>Stream</h1>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 style={{ margin: 0 }}>{data.anime.title}</h2>
            <p style={{ opacity: 0.85 }}>{data.anime.synopsis}</p>
          </div>
          <div style={{ display:'flex', gap:24, flexWrap: 'wrap' }}>
            <div style={{ ...panelStyle, flex: '1 1 260px' }}>
              <h3>Episodes</h3>
              <ul style={{ listStyle:'none', padding:0 }}>
                {(data.episodes || []).map(ep => (
                  <li key={ep._id} style={{ marginBottom:8 }}>
                    <button onClick={() => selectEpisode(ep)} style={{ cursor:'pointer', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.2)', padding:'8px 12px', borderRadius:10, width:'100%', textAlign:'left', color:'#f6f0ff' }}>
                      Ep {ep.episodeNumber || '?'} — {ep.status}
                      {ep.status === 'processing' && ' (transcoding…)'}
                      {ep.status === 'failed' && ' (failed)'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ ...panelStyle, flex: '2 1 400px' }}>
              <h3>Player</h3>
              {!currentEp && <div>Select an episode to play.</div>}
              {currentEp && (
                <div>
                  <div style={{ marginBottom:8 }}>Episode {currentEp.episodeNumber} — {currentEp.status}</div>
                  <video
                    id="hls-player"
                    ref={videoRef}
                    controls
                    style={{ width:'100%', background:'#000', borderRadius:8 }}
                    poster={currentEp.thumbnail || data.anime.coverImage}
                  />
                  {epLoading && currentEp.status !== 'ready' && <div style={{ marginTop:8 }}>Waiting for transcoding… polling</div>}
                  {currentEp.status === 'failed' && <div style={{ color:'crimson', marginTop:8 }}>Transcode failed.</div>}
                  {playerError && <div style={{ color:'crimson', marginTop:8 }}>{playerError}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Hls from 'hls.js'
import api, { toMediaUrl } from '../services/api'
import './Stream.css'

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
    <main className="page-shell stream-page">
      <div className="stream-page-header">
        <h1 className="section-heading">Stream</h1>
        <p className="muted-text">Choose an episode and start watching instantly.</p>
      </div>
      {loading && <div className="muted-text">Loading…</div>}
      {error && <div className="form-error">{error}</div>}
      {data && (
        <>
          <section className="glass-panel stream-hero">
            <div className="stream-hero-text">
              <span className="stream-meta">{(data.episodes || []).length} episodes available</span>
              <h2>{data.anime.title}</h2>
              <p className="muted-text">{data.anime.synopsis}</p>
            </div>
            {data.anime.coverImage && (
              <img src={data.anime.coverImage} alt={data.anime.title} className="stream-hero-art" />
            )}
          </section>

          <section className="stream-grid">
            <div className="glass-panel stream-episodes">
              <div className="stream-panel-header">
                <h3>Episodes</h3>
                <span className="muted-text">Tap to load a stream</span>
              </div>
              <ul className="episode-list">
                {(data.episodes || []).map(ep => {
                  const isActive = currentEp?._id === ep._id
                  return (
                    <li key={ep._id}>
                      <button
                        type="button"
                        className={`episode-button${isActive ? ' is-active' : ''}`}
                        onClick={() => selectEpisode(ep)}
                      >
                        <div>
                          <strong>Episode {ep.episodeNumber || '?'}</strong>
                          <span className="muted-text">{ep.status}</span>
                        </div>
                        {ep.status === 'processing' && <span className="episode-pill">Transcoding…</span>}
                        {ep.status === 'failed' && <span className="episode-pill error">Failed</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="glass-panel stream-player">
              <div className="stream-panel-header">
                <h3>Player</h3>
                {currentEp && <span className="muted-text">Episode {currentEp.episodeNumber}</span>}
              </div>
              {!currentEp && <p className="muted-text">Select an episode to begin playback.</p>}
              {currentEp && (
                <div className="stream-player-body">
                  <video
                    id="hls-player"
                    ref={videoRef}
                    controls
                    className="stream-video"
                    poster={currentEp.thumbnail || data.anime.coverImage}
                  />
                  <div className="player-status">
                    {epLoading && currentEp.status !== 'ready' && <span>Waiting for transcoding…</span>}
                    {currentEp.status === 'failed' && <span className="form-error">Transcode failed.</span>}
                    {playerError && <span className="form-error">{playerError}</span>}
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  )
}

import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Community.css'

export default function Community() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const { username, loading: authLoading } = useAuth()

  useEffect(() => {
    let active = true
    api.get('/community/posts')
      .then(res => { if (active) { setPosts(res.data.posts || []); setLoading(false) }})
      .catch(err => { console.error(err); if (active) { setError('Failed to load posts'); setLoading(false) }})
    return () => { active = false }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      setFormError('Please add a title and a short message.')
      return
    }
    setFormError('')
    setSubmitting(true)
    try {
      const res = await api.post('/community/posts', { title: title.trim(), body: body.trim() })
      setPosts(prev => [res.data.post, ...(prev || [])])
      setTitle('')
      setBody('')
    } catch (err) {
      const message = err?.response?.data?.error || 'Unable to publish post right now.'
      setFormError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const canPost = Boolean(username) && !authLoading

  return (
    <main className="page-shell community-wrapper">
      <header className="community-hero glass-panel">
        <p className="section-eyebrow">Community Threads</p>
        <h1 className="section-heading">Share highlights with other fans</h1>
        <p className="muted-text">Drop watch lists, hot takes, or quick reactions. Fresh conversations help everyone find their next binge.</p>
      </header>

      <section className="glass-panel community-form">
        <div className="community-form-header">
          <div>
            <h2>Start a thread</h2>
            <p className="muted-text">Logged in as {username || 'guest'}. {!canPost && 'Sign in to post.'}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="community-form-grid">
          <input
            type="text"
            placeholder="Give your post a title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={!canPost || submitting}
          />
          <textarea
            rows="4"
            placeholder="Share what you are watching or ask a question..."
            value={body}
            onChange={e => setBody(e.target.value)}
            disabled={!canPost || submitting}
          />
          <div className="community-form-actions">
            {formError && <span className="form-error">{formError}</span>}
            <button className="btn-primary" type="submit" disabled={!canPost || submitting}>
              {submitting ? 'Posting…' : 'Publish Post'}
            </button>
          </div>
        </form>
      </section>

      <section className="posts-panel">
        <div className="posts-header">
          <h2>Latest posts</h2>
          {loading && <span className="muted-text">Loading…</span>}
          {error && <span className="form-error">{error}</span>}
        </div>
        <ul className="posts-grid">
          {posts.map(p => (
            <li key={p._id} className="glass-panel post-card">
              <div className="post-card-header">
                <div>
                  <p className="post-title">{p.title}</p>
                  <p className="post-author">by {p.author}</p>
                </div>
                <span className="post-pill">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Today'}</span>
              </div>
              <p className="post-body">{p.body}</p>
            </li>
          ))}
          {!loading && posts.length === 0 && (
            <li className="glass-panel post-card">
              <p className="muted-text">No threads yet. Be the first to start one!</p>
            </li>
          )}
        </ul>
      </section>
    </main>
  )
}

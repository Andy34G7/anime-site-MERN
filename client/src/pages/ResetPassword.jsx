import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) setError('Missing reset token')
  }, [token])

  async function submit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError('Passwords do not match')
    setLoading(true)
    try {
      await api.post('/auth/reset', { token, newPassword: password })
      setSuccess('Password updated. You can now log in.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to reset password')
    } finally { setLoading(false) }
  }

  return (
    <main className="login-page">
      <h1 className="login-title">Reset Password</h1>
      <div className="login-container">
        <form className="login-form" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input type="password" className="form-input" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <button disabled={loading || !token} type="submit" className="login-button">
            {loading ? 'Please wait…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </main>
  )
}

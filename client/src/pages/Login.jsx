import React, { useState } from 'react';
import './Login.css';
import api, { setAuthToken } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (showReset) {
        const usernameOrEmail = username || email
        if (!usernameOrEmail) throw new Error('Enter username or email')
        const res = await api.post('/auth/request-reset', { usernameOrEmail })
        setResetSent(true)
        setLoading(false)
        return
      }
      if (isRegister) {
        const res = await api.post('/auth/register', { username, email, password })
        const { token, user } = res.data
        setAuthToken(token)
        try { localStorage.setItem('username', user.username) } catch {}
        navigate(`/profile/${user.username}`)
      } else {
        // login can accept username or email
        const res = await api.post('/auth/login', { usernameOrEmail: username || email, password })
        const { token, user } = res.data
        setAuthToken(token)
        try { localStorage.setItem('username', user.username) } catch {}
        navigate(`/profile/${user.username}`)
      }
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.error || 'Failed to authenticate')
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <h1 className="login-title">{isRegister ? 'Create Account' : 'Login'}</h1>

      <div className="login-container">
        <form className="login-form" onSubmit={submit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">USERNAME</label>
              <input value={username} onChange={e => setUsername(e.target.value)} className="form-input" />
            </div>
          )}

          {!isRegister && (
            <div className="form-group">
              <label className="form-label">USERNAME OR EMAIL</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username or email" className="form-input" />
            </div>
          )}

          {isRegister && (
            <div className="form-group">
              <label className="form-label">EMAIL</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="form-input" />
            </div>
          )}

          {!showReset && (
            <div className="form-group">
              <label className="form-label">PASSWORD</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="form-input" />
            </div>
          )}

          {error && <div className="error">{error}</div>}
          {showReset && resetSent && <div className="success">If the account exists, a reset email has been sent.</div>}

          <button disabled={loading} type="submit" className="login-button">
            {loading ? 'Please wait…' : showReset ? 'Send reset link' : isRegister ? 'Create account' : 'Login'}
          </button>

          <div style={{ marginTop: 12 }}>
            {!showReset && (
              <button type="button" className="login-toggle" onClick={() => setIsRegister(s => !s)}>
                {isRegister ? 'Have an account? Login' : "Don't have an account? Register"}
              </button>
            )}
          </div>

          {!isRegister && (
            <div style={{ marginTop: 8 }}>
              <button type="button" className="login-toggle" onClick={() => { setShowReset(s => !s); setResetSent(false) }}>
                {showReset ? 'Back to login' : 'Forgot password?'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
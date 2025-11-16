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
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
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

          <div className="form-group">
            <label className="form-label">PASSWORD</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="form-input" />
          </div>

          {error && <div className="error">{error}</div>}

          <button disabled={loading} type="submit" className="login-button">
            {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Login'}
          </button>

          <div style={{ marginTop: 12 }}>
            <button type="button" className="login-toggle" onClick={() => setIsRegister(s => !s)}>
              {isRegister ? 'Have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
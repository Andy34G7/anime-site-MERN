import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  timeout: 8000,
});

// Attach token automatically if present
const attachAuth = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
}

attachAuth()

// Helper to update token after login/register
export function setAuthToken(token) {
  if (token) {
    try { localStorage.setItem('token', token) } catch {}
  } else {
    try { localStorage.removeItem('token') } catch {}
  }
  attachAuth()
}

export default api;

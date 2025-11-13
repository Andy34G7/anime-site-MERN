import { Link, NavLink } from 'react-router-dom'

const linkStyle = ({ isActive }) => ({
  padding: '8px 12px',
  borderRadius: 6,
  textDecoration: 'none',
  color: isActive ? '#111' : '#333',
  background: isActive ? '#e8e8e8' : 'transparent'
})

export default function NavBar() {
  return (
    <header style={{ borderBottom: '1px solid #eee', background: '#fafafa' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: 18, color: '#222', textDecoration: 'none' }}>Anime Site</Link>
        <nav style={{ display: 'flex', gap: 8 }}>
          <NavLink to="/" style={linkStyle} end>Home</NavLink>
          <NavLink to="/about" style={linkStyle}>About</NavLink>
          <NavLink to="/community" style={linkStyle}>Community</NavLink>
          <NavLink to="/clips" style={linkStyle}>Clips</NavLink>
        </nav>
      </div>
    </header>
  )
}

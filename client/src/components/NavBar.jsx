import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { setAuthToken } from "../services/api";

export default function Navbar() {
  const [auth, setAuth] = useState({ token: null, username: null });
  const navigate = useNavigate();

  useEffect(() => {
    const read = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
      setAuth({ token, username });
    };
    read();
    const onStorage = (e) => {
      if (e.key === 'token' || e.key === 'username') read();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function logout() {
    try { localStorage.removeItem('username'); } catch {}
    setAuthToken(null);
    setAuth({ token: null, username: null });
    navigate('/');
  }

  const profileHref = auth.username ? `/profile/${auth.username}` : '/login';

  return (
    <nav className="nav">
      <div className="nav-blur" />

      <div className="nav-inner">
        <div className="nav-left">
          <h1 className="logo">ANIMEBLOOM</h1>

          <ul className="menu">
            {!auth.token && <li><Link to="/login">Log In</Link></li>}
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/community">Community</Link></li>
            <li><Link to="/news">News</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to={profileHref}>Profile</Link></li>
            {auth.token && (
              <li>
                <button onClick={logout} className="logout-btn">Logout</button>
              </li>
            )}
          </ul>
        </div>

        <div className="nav-right">
          <div className="search-box">
            <span className="icon">☰</span>
            <input type="text" placeholder="Search" />
            <span className="icon">🔍</span>
          </div>
        </div>
      </div>
    </nav>
  );
} 
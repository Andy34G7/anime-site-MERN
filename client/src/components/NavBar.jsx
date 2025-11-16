import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { token, username, logout } = useAuth();
  const navigate = useNavigate();

  const profileHref = username ? `/profile/${username}` : '/login';

  return (
    <nav className="nav">
      <div className="nav-blur" />

      <div className="nav-inner">
        <div className="nav-left">
          <h1 className="logo">ANIMEBLOOM</h1>

          <ul className="menu">
            {!token && <li><Link to="/login">Log In</Link></li>}
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/community">Community</Link></li>
            <li><Link to="/news">News</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to={profileHref}>Profile</Link></li>
            {token && (
              <li>
                <button onClick={() => { logout(); navigate('/') }} className="logout-btn">Logout</button>
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
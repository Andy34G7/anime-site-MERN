import "./Navbar.css";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="nav-blur" />

      <div className="nav-inner">
        <div className="nav-left">
          <h1 className="logo">ANIMEBLOOM</h1>

          <ul className="menu">
            <li><Link to="/login">Log In</Link></li>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/community">Community</Link></li>
            <li><Link to="/news">News</Link></li>
            <li><Link to="/profile/username">Profile</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
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

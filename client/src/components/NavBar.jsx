import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { token, username, role, logout } = useAuth();
  const navigate = useNavigate();

  const profileHref = username ? `/profile/${username}` : "/login";
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/community", label: "Community" },
    { to: "/contact", label: "Contact" },
    { to: profileHref, label: "Profile" }
  ];

  if (role === "moderator" || role === "admin") {
    navLinks.push({ to: "/upload", label: "Upload" });
    navLinks.push({ to: "/admin", label: "Admin" });
  }

  const handleSearch = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const q = (formData.get("q") || "").toString().trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="nav">
      <div className="nav-blur" />
      <div className="nav-inner">
        <div className="nav-left">
          <h1 className="logo">ANIMEBLOOM</h1>
          <ul className="menu">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link to={to}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="nav-right">
          <form className="nav-search" onSubmit={handleSearch}>
            <span aria-hidden="true">🔎</span>
            <input name="q" type="text" placeholder="Search anime…" />
            <button type="submit">Go</button>
          </form>
          {token ? (
            <button className="pill-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link className="pill-btn" to="/login">
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
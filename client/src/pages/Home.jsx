import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Home.css";

/* Truncate long anime titles */
const truncate = (text, n) => {
  return text.length > n ? text.slice(0, n) + "..." : text;
};

export default function Home() {
  const [data, setData] = useState({
    spotlight: null,
    featured: [],
    trending: [],
    comments: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const CACHE_KEY = "homeCache:server:v1";
    const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

    // Try cache first for instant paint
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { ts, payload } = JSON.parse(cached);
        if (Date.now() - ts < MAX_AGE_MS) {
          setData(payload);
          setLoading(false);
        }
      }
    } catch {}

    async function load() {
      try {
        // Load from our server
        const homeRes = await api.get("/home");
        const featured = homeRes.data?.featured || [];
        const trending = homeRes.data?.trending || [];

        let spotlightDoc = trending[0] || featured[0];
        let spotlightDetail = null;
        if (spotlightDoc?.slug) {
          try {
            const detailRes = await api.get(`/anime/${encodeURIComponent(spotlightDoc.slug)}`);
            spotlightDetail = detailRes.data;
          } catch {}
        }

        const payload = {
          spotlight: spotlightDoc
            ? {
                title: spotlightDetail?.title || spotlightDoc.title,
                slug: spotlightDoc.slug,
                banner: spotlightDetail?.coverImage || spotlightDoc.coverImage,
                description: spotlightDetail?.synopsis || "",
                duration: (spotlightDetail?.episodes?.[0]?.lengthMin
                  ? `${spotlightDetail.episodes[0].lengthMin} min`
                  : "") || "",
                releaseDate: ""
              }
            : null,
          featured: featured.map((a) => ({
            title: a.title,
            slug: a.slug,
            coverImage: a.coverImage
          })),
          trending: trending.map((a) => ({
            title: a.title,
            slug: a.slug,
            coverImage: a.coverImage
          })),
          comments: []
        };

        if (mounted) {
          setData(payload);
          setLoading(false);
        }

        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), payload }));
        } catch {}
      } catch (err) {
        console.error("Home data load failed", err);
        if (mounted) {
          setError("Failed to load content. Please retry.");
          setLoading(false);
        }
      }
    }

    load();
    return () => { mounted = false };
  }, []);

  if (loading) return <div className="loading">Loading…</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <main className="home-container">
      {/* ---------------- Spotlight ---------------- */}
      {data.spotlight && (
        <section className="spotlight-section">
          <div className="spotlight-left">
            <h4 className="spotlight-rank">#1 Spotlight</h4>
            <h1 className="spotlight-title">{truncate(data.spotlight.title, 40)}</h1>

            <div className="spotlight-meta">
              <span> {data.spotlight.duration}</span>
              <span> {data.spotlight.releaseDate}</span>
            </div>

            <p className="spotlight-desc">{data.spotlight.description}</p>

            <div className="spotlight-buttons">
              <a href={`/anime/${data.spotlight.slug}`} className="btn btn-watch">
                Watch Now
              </a>
              <a href={`/anime/${data.spotlight.slug}`} className="btn btn-detail">
                Details
              </a>
            </div>
          </div>

          <div className="spotlight-right">
            <img src={data.spotlight.banner} alt={data.spotlight.title} loading="lazy" />
          </div>
        </section>
      )}

      {/* ---------------- Featured ---------------- */}
      <section className="carousel-section">
        <h2 className="section-title">Featured Anime</h2>
        <div className="carousel-container">
          {data.featured.map((a) => (
            <Link key={a.slug} to={`/anime/${a.slug}`} className="anime-card">
              <img className="anime-img" src={a.coverImage} alt={a.title} loading="lazy" />
              <div className="anime-title">{truncate(a.title, 22)}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Trending ---------------- */}
      <section className="carousel-section">
        <h2 className="section-title">Trending Now</h2>
        <div className="carousel-container">
          {data.trending.map((a) => (
            <Link key={a.slug} to={`/anime/${a.slug}`} className="anime-card">
              <img className="anime-img" src={a.coverImage} alt={a.title} loading="lazy" />
              <div className="anime-title">{truncate(a.title, 22)}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

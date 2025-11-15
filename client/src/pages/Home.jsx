import { useEffect, useState } from "react";
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

    async function load() {
      try {
        setLoading(true);

        // Fetch seasonal anime (Featured)
        const seasonal = await api.get("/seasons/now?limit=12");

        // prevent 429 errors
        await new Promise((r) => setTimeout(r, 1200));

        // Fetch top anime (Trending)
        const top = await api.get("/top/anime?limit=12");

        const spotlightAnime = seasonal.data.data[0];

        if (mounted) {
          setData({
            spotlight: {
              title: spotlightAnime.title,
              slug: spotlightAnime.mal_id,
              banner: spotlightAnime.images.jpg.large_image_url,
              description: spotlightAnime.synopsis,
              duration: spotlightAnime.duration,
              releaseDate: spotlightAnime.aired?.from?.slice(0, 10) || "Unknown"
            },
            featured: seasonal.data.data.map((a) => ({
              title: a.title,
              slug: a.mal_id,
              coverImage: a.images.jpg.large_image_url
            })),
            trending: top.data.data.map((a) => ({
              title: a.title,
              slug: a.mal_id,
              coverImage: a.images.jpg.large_image_url
            })),
            comments: []
          });

          setLoading(false);
        }
      } catch (err) {
        console.error("Jikan request failed", err);
        setTimeout(load, 2000); // retry on rate-limit
      }
    }

    load();
    return () => (mounted = false);
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
              <span>🕒 {data.spotlight.duration}</span>
              <span>📅 {data.spotlight.releaseDate}</span>
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
            <img src={data.spotlight.banner} alt={data.spotlight.title} />
          </div>
        </section>
      )}

      {/* ---------------- Featured ---------------- */}
      <section className="carousel-section">
        <h2 className="section-title">Featured Anime</h2>
        <div className="carousel-container">
          {data.featured.map((a) => (
            <a key={a.slug} href={`/anime/${a.slug}`} className="anime-card">
              <img className="anime-img" src={a.coverImage} alt={a.title} />
              <div className="anime-title">{truncate(a.title, 22)}</div>
            </a>
          ))}
        </div>
      </section>

      {/* ---------------- Trending ---------------- */}
      <section className="carousel-section">
        <h2 className="section-title">Trending Now</h2>
        <div className="carousel-container">
          {data.trending.map((a) => (
            <a key={a.slug} href={`/anime/${a.slug}`} className="anime-card">
              <img className="anime-img" src={a.coverImage} alt={a.title} />
              <div className="anime-title">{truncate(a.title, 22)}</div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

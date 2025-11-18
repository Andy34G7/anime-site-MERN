import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { toMediaUrl } from '../services/api'
import './Intropage.css'

const COMMENT_CARDS = [
  {
    handle: '@MysticMangaFox',
    initials: 'MF',
    color: '#f472b6',
    text: "The interface is so cute?? I'm obsessed. And thank you for having both subs AND dubs for everything. My little sister can finally watch with me without getting lost!"
  },
  {
    handle: '@StrawHatVoyager',
    initials: 'SV',
    color: '#fb7185',
    text: 'This platform blows me away with its pacing and animation. Every fight looks like a full-budget movie scene!'
  },
  {
    handle: '@MechaMuse33',
    initials: 'MM',
    color: '#c084fc',
    text: 'Absolutely stunning visuals. Every battle feels like a painting in motion. Also, Tanjiro is the sweetest protagonist ever.'
  },
  {
    handle: '@OtakuOverload',
    initials: 'OO',
    color: '#818cf8',
    text: "I came for the new releases, stayed for the MASSIVE library. Classics, new stuff, obscure gems—I'm in anime heaven."
  },
  {
    handle: '@SakuraStorm',
    initials: 'SS',
    color: '#38bdf8',
    text: 'The visuals here are unreal. The colors literally glow off the screen. No ads, no lag—just anime bliss.'
  },
  {
    handle: '@MechaMuse',
    initials: 'MM',
    color: '#34d399',
    text: 'This site recommended mech shows I’ve never even heard of—and they were all bangers. Amazing algorithm!'
  },
  {
    handle: '@ChibiGoblin',
    initials: 'CG',
    color: '#facc15',
    text: 'Everything is so easy to find! Clean layout, fast loading, and the dub options help my little brother so much.'
  }
]

const Intropage = () => {
  const [topAnime, setTopAnime] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const carouselRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true;
    const CACHE_KEY = 'topAnimeCache:server:v2';
    const MAX_AGE_MS = 10 * 60 * 1000;

    const normalize = (list) => (list || []).map(item => ({ ...item, coverImage: toMediaUrl(item.coverImage) }))

    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const { ts, data } = JSON.parse(cached)
        if (Date.now() - ts < MAX_AGE_MS) {
          setTopAnime(normalize(data))
          setLoading(false)
        }
      }
    } catch {}

    const fetchTopAnime = async () => {
      try {
        const response = await api.get('/home')
        const list = normalize(response.data?.trending || [])
        if (active) {
          setTopAnime(list);
          setLoading(false);
        }
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: list }))
        } catch {}
      } catch (error) {
        console.error('Error fetching top anime:', error);
        if (active) setLoading(false);
      }
    };
    
    fetchTopAnime();
    return () => { active = false };
  }, []);

  const truncateTitle = (title, maxLength = 22) => {
    if (!title) return '';
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  const handleSearch = (e) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (!query) return
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="intro-page">

      {/* Title Section */}
      <section className="intro-title-section">
        <h1 className="intro-main-title">WELCOME TO ANIMEBLOOM !</h1>
      </section>

      {/* Search Bar Section */}
      <section className="intro-search-section">
        <div className="intro-nav-right">
          <form onSubmit={handleSearch} className="intro-search-box">
            <input
              type="text"
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="intro-icon">🔍</span>
          </form>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-content">
          <br />
          <p className="welcome-text">
            Welcome to AnimeBloom, the ultimate destination for anime lovers who crave stunning visuals, 
            immersive stories, and a seamless viewing experience. Dive into a universe where magic hums 
            beneath every scene, where heroes rise, legends unfold, and your next obsession is only a 
            click away.<br/>
            Join the millions who choose AnimeBloom and elevate your anime experience to something 
            truly extraordinary.<br/>
            Because anime isn't just entertainment—It's a universe. And it's waiting for you.
          </p>
        </div>
      </section>

      {/* Divider Line */}
      <div className="section-divider"></div>

      {/* Top Comments Section */}
      <section className="comments-section">
        <h2 className="comments-title">Top Comments</h2>
        <div className="comments-horizontal">
          {COMMENT_CARDS.map((comment) => (
            <div key={comment.handle} className="comment-card">
              <div className="comment-header">
                <div className="comment-avatar" style={{ background: comment.color }} aria-hidden="true">
                  {comment.initials}
                </div>
                <div className="comment-user">{comment.handle}</div>
              </div>
              <p className="comment-text">{comment.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider"></div>

      {/* Carousel Section */}
      <section className="carousel-section">
        <h2 className="section-title">Trending Now</h2>

        {loading ? (
          <div className="loading">Loading anime...</div>
        ) : (
          <div className="carousel-container">
            <div className="carousel-track" ref={carouselRef}>
              {topAnime.map((anime) => (
                <Link key={anime.slug} className="anime-card" to={`/anime/${anime.slug}`}>
                  <img 
                    className="anime-img" 
                    src={anime.coverImage}
                    alt={anime.title}
                    loading="lazy"
                  />
                  <div className="anime-title">
                    {truncateTitle(anime.title)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Intropage;

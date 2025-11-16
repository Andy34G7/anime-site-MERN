import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './Intropage.css';

import female1_profile from './female1_profile.jpg';
import man1_profile from './man1_profile.jpg';
import female2_profile from './female2_profile.jpg';
import man2_profile from './man2_profile.jpg';
import man3_profile from './man3_profile.png';
import man4_profile from './man4_profile.png';
import man5_profile from './man5_profile.png';

const Intropage = () => {
  const [topAnime, setTopAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchTopAnime = async () => {
      try {
        setLoading(true);
        const response = await api.get('/top/anime?limit=15');
        setTopAnime(response.data.data);
      } catch (error) {
        console.error('Error fetching top anime:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopAnime();
  }, []);

  const truncateTitle = (title, maxLength = 22) => {
    if (!title) return '';
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

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

          {/* Comment 1 */}
          <div className="comment-card">
            <div className="comment-header">
              <img src={female1_profile} alt="Profile" className="comment-avatar" />
              <div className="comment-user">@MysticMangaFox</div>
            </div>
            <p className="comment-text">
              The interface is so cute?? I'm obsessed. And thank you for having both subs AND dubs for everything. 
              My little sister can finally watch with me without getting lost!
            </p>
          </div>

          {/* Comment 2 */}
          <div className="comment-card">
            <div className="comment-header">
              <img src={man1_profile} alt="Profile" className="comment-avatar" />
              <div className="comment-user">@StrawHatVoyager</div>
            </div>
            <p className="comment-text">
              This platform blows me away with its pacing and animation. Every fight looks like a full-budget movie scene!
            </p>
          </div>

          {/* Comment 3 */}
          <div className="comment-card">
            <div className="comment-header">
              <img src={female2_profile} alt="Profile" className="comment-avatar" />
              <div className="comment-user">@MechaMuse33</div>
            </div>
            <p className="comment-text">
              Absolutely stunning visuals. Every battle feels like a painting in motion. 
              Also, Tanjiro is the sweetest protagonist ever.
            </p>
          </div>

          {/* Comment 4 */}
          <div className="comment-card">
            <div className="comment-header">
              <img src={man2_profile} alt="Profile" className="comment-avatar" />
              <div className="comment-user">@OtakuOverload</div>
            </div>
            <p className="comment-text">
              I came for the new releases, stayed for the MASSIVE library. Classics, new stuff, obscure gems—I'm in anime heaven.
            </p>
          </div>

          {/* Comment 5 */}
          <div className="comment-card">
            <div className="comment-header">
              <img src={man3_profile} alt="Profile" className="comment-avatar" />
              <div className="comment-user">@SakuraStorm</div>
            </div>
            <p className="comment-text">
              The visuals here are unreal. The colors literally glow off the screen. No ads, no lag—just anime bliss.
            </p>
          </div>

          {/* Comment 6 */}
          <div className="comment-card">
            <div className="comment-header">
              <img src={man4_profile} alt="Profile" className="comment-avatar" />
              <div className="comment-user">@MechaMuse</div>
            </div>
            <p className="comment-text">
              This site recommended mech shows I’ve never even heard of—and they were all bangers. Amazing algorithm!
            </p>
          </div>

          {/* Comment 7 */}
          <div className="comment-card">
            <div className="comment-header">
              <img src={man5_profile} alt="Profile" className="comment-avatar" />
              <div className="comment-user">@ChibiGoblin</div>
            </div>
            <p className="comment-text">
              Everything is so easy to find! Clean layout, fast loading, and the dub options help my little brother so much.
            </p>
          </div>

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
                <div key={anime.mal_id} className="anime-card">
                  <img 
                    className="anime-img" 
                    src={anime.images.jpg.large_image_url} 
                    alt={anime.title} 
                  />
                  <div className="anime-title">
                    {truncateTitle(anime.title.english || anime.title)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Intropage;

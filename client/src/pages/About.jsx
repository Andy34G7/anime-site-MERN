import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './About.css'

const HIGHLIGHTS = [
  { label: 'Simulcast series', value: '180+' },
  { label: 'Community reviews', value: '42k' },
  { label: 'Clubs and watch parties', value: '230+' },
  { label: 'Average uptime', value: '99.97%' },
]

const CORE_VALUES = [
  {
    title: 'Artists First',
    copy: 'We partner with studios and licensors so every stream supports the people who bring these worlds to life.'
  },
  {
    title: 'Fandom Powered',
    copy: 'From custom playlists to weekly community quests, fans steer our roadmap and keep the experience authentic.'
  },
  {
    title: 'Accessible Everywhere',
    copy: 'Adaptive streaming, dubs and subs, offline watchlists—AnimeBloom fits the way you already watch.'
  }
]

const TIMELINE = [
  { year: '2018', title: 'Concept sketch', detail: 'A tiny Discord community starts sharing mockups for a “dream anime hub.”' },
  { year: '2020', title: 'Beta launch', detail: 'First 1,000 fans test synced watch rooms and instant episode switching.' },
  { year: '2022', title: 'Creator program', detail: 'Open pipeline for AMV editors, reviewers, and translators to publish directly on AnimeBloom.' },
  { year: '2024', title: 'Global expansion', detail: '24/7 edge CDN plus adaptive encoding trims start times to under two seconds worldwide.' },
]

const COMMUNITY_SPOTLIGHTS = [
  {
    name: 'The Bloom Collective',
    desc: 'Weekly watch parties for new simulcasts with live polls, trivia, and surprise guest artists.'
  },
  {
    name: 'Lore Keepers',
    desc: 'Long-form essays, timelines, and spoiler-safe dossiers curated by canon purists.'
  },
  {
    name: 'Studio Labs',
    desc: 'Feedback channel where beta testers stress test new encoders, comment tools, and accessibility presets.'
  }
]

export default function About() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (event) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-copy">
          <p className="about-tag">Built by fans · Tuned for storytellers</p>
          <h1>Where anime marathons feel effortless</h1>
          <p className="about-lede">
            AnimeBloom blends a cinematic player, curated discovery, and a ridiculously friendly community so you can
            chase your watchlist without hunting through tabs. Every surface was tuned to stay bright, breathable, and fast—just like the rest of the site.
          </p>
          <form className="about-search" onSubmit={handleSearch}>
            <span aria-hidden="true">🔍</span>
            <input
              type="text"
              placeholder="Search shows, characters, or creators"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit">Dive in</button>
          </form>
          <div className="about-hero-pill-row">
            <span>Lag-free streams</span>
            <span>Crystal subs & dubs</span>
            <span>Smart recommendations</span>
          </div>
        </div>
        <div className="about-hero-panel">
          <div className="glow-card">
            <p className="glow-label">Featured Quest</p>
            <h3>Build your Autumn binge list</h3>
            <p className="glow-copy">
              Vote on the next simulcast pickups, unlock profile borders, and earn drop credits while you watch.
            </p>
            <ul>
              <li>Curated seasonal roadmap</li>
              <li>Seamless watch party setup</li>
              <li>Rewards synced to your account</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-highlights">
        {HIGHLIGHTS.map((item) => (
          <article key={item.label}>
            <p className="metric-value">{item.value}</p>
            <p className="metric-label">{item.label}</p>
          </article>
        ))}
      </section>

      <section className="about-core">
        <header>
          <p className="eyebrow">Why AnimeBloom?</p>
          <h2>Premium tech wrapped in a cozy interface</h2>
          <p>
            We obsess over the invisible bits—multi-bitrate encodes, instant resume, audio normalization—so the layout
            can stay playful and serene. The About page shares that same palette to keep you grounded as you explore.
          </p>
        </header>
        <div className="core-grid">
          {CORE_VALUES.map((value) => (
            <article key={value.title}>
              <h3>{value.title}</h3>
              <p>{value.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-timeline">
        <h2>Milestones</h2>
        <div className="timeline-grid">
          {TIMELINE.map((event) => (
            <article key={event.year}>
              <p className="timeline-year">{event.year}</p>
              <h3>{event.title}</h3>
              <p>{event.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-community">
        <header>
          <h2>Community Spotlight</h2>
          <p>Thousands of fans share recaps, playlists, translations, and wholesome chaos every single day.</p>
        </header>
        <div className="community-grid">
          {COMMUNITY_SPOTLIGHTS.map((spotlight) => (
            <article key={spotlight.name}>
              <h3>{spotlight.name}</h3>
              <p>{spotlight.desc}</p>
              <button type="button" onClick={() => navigate('/community')}>
                Join the conversation
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

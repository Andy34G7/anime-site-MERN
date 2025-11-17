import "./About.css";

const pillars = [
  {
    title: "Curated discovery",
    body: "Hand-picked spotlight, featured, and trending rails help fans jump into something great in under a minute.",
  },
  {
    title: "Community first",
    body: "Clips, watch parties, and lightweight posting tools let you share hype moments without leaving the stream.",
  },
  {
    title: "Creator-friendly",
    body: "Studios, AMV editors, and translators can self-upload pilots, run experiments, and reach anime Bloom audiences quickly.",
  }
];

const roadmap = [
  "Persistent profiles with watch history and synced playlists",
  "HLS + multi-CDN delivery to keep playback snappy globally",
  "Live simulcast rooms with chat, emotes, and clip creation",
  "Premium tiers for ad-free viewing and collectible drops"
];

export default function About() {
  return (
    <main className="page-shell about-page">
      <section className="glass-panel about-hero">
        <p className="section-eyebrow">Our mission</p>
        <h1 className="section-heading">Streaming built for anime superfans</h1>
        <p className="muted-text">
          AnimeBloom is a MERN-powered experiment to re-imagine how we discover, stream, and celebrate anime online.
          The project brings server-rendered recommendations, local CDN media, and community threads together in one place.
        </p>
      </section>

      <section className="about-grid">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="glass-panel about-card">
            <h3>{pillar.title}</h3>
            <p>{pillar.body}</p>
          </article>
        ))}
      </section>

      <section className="glass-panel about-roadmap">
        <h2>What&apos;s next</h2>
        <ul>
          {roadmap.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

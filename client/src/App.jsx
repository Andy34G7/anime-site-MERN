import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import About from './pages/About'
import Community from './pages/Community'
import Profile from './pages/Profile'
import Clips from './pages/Clips'
import Stream from './pages/Stream'
import AnimeDetail from './pages/AnimeDetail'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/community" element={<Community />} />
        <Route path="/clips" element={<Clips />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/stream/:animeId" element={<Stream />} />
        <Route path="/anime/:slug" element={<AnimeDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

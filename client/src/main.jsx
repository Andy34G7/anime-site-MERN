import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home'
import About from './pages/About'
import Community from './pages/Community'
import Profile from './pages/Profile'
import Clips from './pages/Clips'
import Stream from './pages/Stream'
import AnimeDetail from './pages/AnimeDetail'
import NotFound from './pages/NotFound'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login' // ← ADD THIS LINE
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'community', element: <Community /> },
      { path: 'clips', element: <Clips /> },
      { path: 'profile/:username', element: <Profile /> },
      { path: 'stream/:animeId', element: <Stream /> },
      { path: 'anime/:slug', element: <AnimeDetail /> },
      { path: 'contact', element: <Contact /> },
      { path: 'login', element: <Login /> }, // ← ADD THIS LINE
      { path: '*', element: <NotFound /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

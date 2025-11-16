import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home'
import Intropage from './pages/Intropage' // ← ADD THIS IMPORT
import Community from './pages/Community'
import Profile from './pages/Profile'
import Clips from './pages/Clips'
import Stream from './pages/Stream'
import AnimeDetail from './pages/AnimeDetail'
import NotFound from './pages/NotFound'
import ResetPassword from './pages/ResetPassword.jsx'
import Login from './pages/Login'
import Contact from './pages/Contact.jsx'
import Upload from './pages/Upload.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <Intropage /> }, // ← CHANGE About to Intropage
      { path: 'community', element: <Community /> },
      { path: 'clips', element: <Clips /> },
      { path: 'profile/:username', element: <Profile /> },
      { path: 'stream/:animeId', element: <Stream /> },
      { path: 'anime/:slug', element: <AnimeDetail /> },
      { path: 'Contact', element: <Contact /> },
      { path: 'login', element: <Login /> },
      { path: 'reset', element: <ResetPassword /> },
      { path: 'upload', element: <Upload /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
)
import './App.css'
import { Outlet } from 'react-router-dom'
import NavBar from './components/NavBar'

export default function App() {
  return (
    <>
      <div className="nav-fullwidth">
        <NavBar />
        
      </div>

      {/* Routed pages render here. Pages control their own full-bleed or centered layout. */}
      <Outlet />
    </>
  )
}

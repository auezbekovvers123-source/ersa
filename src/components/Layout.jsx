import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">LESGO 100% Team Project</h1>
        <nav className="app-nav" aria-label="Main">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/products">Products</NavLink>
          <span className="app-nav-user">{user?.email}</span>
          <button type="button" className="app-nav-btn" onClick={logout}>
            Log out
          </button>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

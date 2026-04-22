import { NavLink, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotify } from '../hooks/useNotify.js'
import { readCart } from '../cartStorage.js'
import { useEffect, useState } from 'react'

export default function Layout() {
  const { user, logout } = useAuth()
  const operationsCount = useSelector((s) => s.ui.operationsCount)
  const notify = useNotify()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    if (!user?.id) {
      setCartCount(0)
      return undefined
    }
    const calculate = () => {
      const count = readCart(user.id).reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0,
      )
      setCartCount(count)
    }
    calculate()
    const onCartUpdated = () => calculate()
    window.addEventListener('teamproject-cart-updated', onCartUpdated)
    return () => window.removeEventListener('teamproject-cart-updated', onCartUpdated)
  }, [user])

  function handleLogout() {
    logout()
    notify('info', 'Logged out successfully')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">LESGO 100% Team Project</h1>
        <nav className="app-nav" aria-label="Main">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/cart">Cart ({cartCount})</NavLink>
          {user?.role === 'admin' ? (
            <>
              <NavLink to="/admin/products">Manage Products</NavLink>
              <NavLink to="/categories">Categories</NavLink>
            </>
          ) : null}
          <span className="app-nav-user">role: {user?.role || 'user'}</span>
          <span className="app-nav-user">ops: {operationsCount}</span>
          <span className="app-nav-user">{user?.email}</span>
          <button type="button" className="app-nav-btn" onClick={handleLogout}>
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

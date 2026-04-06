import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Оборачивает Layout (или любой контент): без входа — редирект на /login.
 * state.from сохраняет адрес, чтобы после входа можно было вернуться.
 */
export default function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

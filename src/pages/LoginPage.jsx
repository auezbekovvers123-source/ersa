import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError(err.body?.error || err.message || 'Login failed')
    }
  }

  return (
    <section>
      <h2>Log in</h2>
      <form onSubmit={handleSubmit} className="stack-form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit">Log in</button>
      </form>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </section>
  )
}

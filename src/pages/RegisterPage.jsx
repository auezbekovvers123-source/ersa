import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await register({ email, password, name: name || undefined })
      const to = location.state?.from?.pathname || '/'
      navigate(to, { replace: true })
    } catch (err) {
      setError(err.body?.error || err.message || 'Register failed')
    }
  }

  return (
    <section>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="stack-form">
        <label>
          Name <span className="optional">(optional)</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </label>
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
            autoComplete="new-password"
            minLength={1}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit">Create account</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  )
}

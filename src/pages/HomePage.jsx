import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <section className="home-section">
      <h2 className="home-heading">Home</h2>
      <p className="app-lead">
        Открой <Link to="/products">Products</Link>, когда запущен API (
        <code>npm start</code> в <code>server/</code>).
      </p>
      <p className="app-lead">
        <strong>API:</strong> <code>cd server</code> → <code>npm start</code>{' '}
        (порт <code>3000</code>). <strong>Фронт:</strong>{' '}
        <code>npm run dev</code> в корне проекта.
      </p>
      <p className="home-links">
        <Link to="/products">Products</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/login">Log in</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/register">Register</Link>
      </p>
    </section>
  )
}

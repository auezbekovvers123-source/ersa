import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <section className="home-section">
      <h2 className="home-heading">Home</h2>
      <p className="app-lead">
        Hello! Главная страница!
      </p>
      <p className="app-lead">
        Team: Ерсайын Ауезбеков - Жасулан Бейсембеков - Турлыбай Бауыржан

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

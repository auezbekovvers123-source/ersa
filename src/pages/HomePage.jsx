import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <section className="home-section">
      <h2 className="home-heading">Home</h2>
      <p className="app-lead">
        Use the navigation above or open{' '}
        <Link to="/categories">Categories</Link> to see data from the API when
        the server is running.
      </p>
      <p className="app-lead">
        <strong>Run the API:</strong>{' '}
        <code>cd server</code> then <code>npm start</code> (port{' '}
        <code>3000</code>). <strong>Run this app:</strong>{' '}
        <code>npm run dev</code> in the project root.
      </p>
      <p className="home-links">
        <Link to="/products">Products</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/categories">Categories</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/orders">Orders</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/users">Users</Link>
      </p>
    </section>
  )
}

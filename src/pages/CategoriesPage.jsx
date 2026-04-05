import { useEffect, useState } from 'react'
import { apiJson } from '../api.js'

export default function CategoriesPage() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setError('')
    apiJson('/categories')
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!cancelled) {
          setItems(null)
          setError(
            err.message ||
              'Could not load categories. Is the API running on port 3000?',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section>
      <h2>Categories</h2>
      {error ? <p className="form-error">{error}</p> : null}
      {items === null && !error ? (
        <p className="muted">Loading…</p>
      ) : null}
      {items && items.length === 0 ? (
        <p className="muted">No categories yet. Add some via the API or seed data.</p>
      ) : null}
      {items && items.length > 0 ? (
        <ul className="resource-list">
          {items.map((c) => (
            <li key={c.id}>
              <strong>{c.name}</strong> <span className="muted">(id {c.id})</span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="muted" style={{ marginTop: '1.25rem' }}>
        Person 3: add create / edit / delete forms here using the same{' '}
        <code>apiJson</code> helper.
      </p>
    </section>
  )
}

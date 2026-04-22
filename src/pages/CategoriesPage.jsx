import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { useNotify } from '../hooks/useNotify.js'
import { apiJson } from '../api.js'
import { bumpOperationsCount } from '../store/slices/uiSlice.js'

export default function CategoriesPage() {
  const [categories, setCategories] = useState(null)
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loadingError, setLoadingError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const dispatch = useDispatch()
  const notify = useNotify()

  const refresh = useCallback(async () => {
    try {
      const list = await apiJson('/categories')
      setCategories(Array.isArray(list) ? list : [])
      setLoadingError('')
    } catch (err) {
      setLoadingError(err.body?.error || err.message || 'Could not load categories')
      notify('error', 'Failed to load categories')
    }
  }, [notify])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleSubmit(e) {
    e.preventDefault()
    const normalized = name.trim()
    if (!normalized) return
    setError('')
    try {
      if (editingId == null) {
        await apiJson('/categories', {
          method: 'POST',
          body: JSON.stringify({ name: normalized }),
        })
        notify('success', 'Category created')
      } else {
        await apiJson(`/categories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ name: normalized }),
        })
        notify('success', 'Category updated')
      }
      dispatch(bumpOperationsCount())
      setName('')
      setEditingId(null)
      await refresh()
    } catch (err) {
      setError(err.body?.error || err.message || 'Save failed')
      notify('error', 'Category save failed')
    }
  }

  function beginEdit(c) {
    setEditingId(c.id)
    setName(c.name || '')
    setError('')
  }

  async function confirmDelete() {
    if (pendingDelete == null) return
    try {
      await apiJson(`/categories/${pendingDelete}`, { method: 'DELETE' })
      notify('success', 'Category deleted')
      dispatch(bumpOperationsCount())
      if (editingId === pendingDelete) {
        setEditingId(null)
        setName('')
      }
      setPendingDelete(null)
      await refresh()
    } catch (err) {
      setError(err.body?.error || err.message || 'Delete failed')
      notify('error', 'Category delete failed')
      setPendingDelete(null)
    }
  }

  return (
    <section>
      <h2>Categories (admin only)</h2>
      {loadingError ? <p className="form-error">{loadingError}</p> : null}
      <form onSubmit={handleSubmit} className="stack-form product-form">
        <label>
          Category name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="form-actions">
          <button type="submit">{editingId == null ? 'Create' : 'Save'}</button>
          {editingId != null ? (
            <button
              type="button"
              className="app-nav-btn"
              onClick={() => {
                setEditingId(null)
                setName('')
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {categories === null ? <p className="muted">Loading...</p> : null}
      {categories && categories.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td className="data-table-actions">
                    <button
                      type="button"
                      className="app-nav-btn"
                      onClick={() => beginEdit(c)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="app-nav-btn danger"
                      onClick={() => setPendingDelete(c.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {categories && categories.length === 0 ? (
        <p className="muted">No categories yet.</p>
      ) : null}
      <ConfirmModal
        open={pendingDelete != null}
        title="Delete category"
        message="Are you sure you want to delete this category?"
        confirmText="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  )
}

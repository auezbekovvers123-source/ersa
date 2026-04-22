import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { useNotify } from '../hooks/useNotify.js'
import { apiJson } from '../api.js'
import { bumpOperationsCount, setProductSearch } from '../store/slices/uiSlice.js'

const emptyForm = {
  name: '',
  price: '',
  categoryId: '',
  description: '',
}

export default function AdminProductsPage() {
  const dispatch = useDispatch()
  const notify = useNotify()
  const search = useSelector((s) => s.ui.productSearch)
  const [products, setProducts] = useState(null)
  const [categories, setCategories] = useState([])
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const refresh = useCallback(async () => {
    setLoadError('')
    try {
      const [pList, cList] = await Promise.all([
        apiJson('/products'),
        apiJson('/categories'),
      ])
      setProducts(Array.isArray(pList) ? pList : [])
      setCategories(Array.isArray(cList) ? cList : [])
    } catch (err) {
      setProducts(null)
      notify('error', 'Failed to load products/categories')
      setLoadError(
        err.message || 'Could not load data. Check that API is running on 3000.',
      )
    }
  }, [notify])

  useEffect(() => {
    refresh()
  }, [refresh])

  function categoryName(id) {
    if (id == null) return '—'
    const c = categories.find((x) => Number(x.id) === Number(id))
    return c ? c.name : `#${id}`
  }

  function startEdit(p) {
    setEditingId(p.id)
    setForm({
      name: p.name ?? '',
      price: p.price != null ? String(p.price) : '',
      categoryId:
        p.categoryId != null && p.categoryId !== '' ? String(p.categoryId) : '',
      description: p.description ?? '',
    })
    setFormError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) return

    const body = {
      name,
      price: form.price === '' ? 0 : Number(form.price),
      description: form.description.trim(),
    }
    if (form.categoryId === '') body.categoryId = null
    else body.categoryId = Number(form.categoryId)

    setFormError('')
    setSaving(true)
    try {
      if (editingId == null) {
        await apiJson('/products', {
          method: 'POST',
          body: JSON.stringify(body),
        })
        notify('success', 'Product created')
      } else {
        await apiJson(`/products/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })
        notify('success', 'Product updated')
      }
      dispatch(bumpOperationsCount())
      cancelEdit()
      await refresh()
    } catch (err) {
      notify('error', 'Product save failed')
      setFormError(err.body?.error || err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteConfirmed() {
    if (pendingDelete == null) return
    setFormError('')
    try {
      await apiJson(`/products/${pendingDelete}`, { method: 'DELETE' })
      notify('success', 'Product deleted')
      dispatch(bumpOperationsCount())
      if (editingId === pendingDelete) cancelEdit()
      setPendingDelete(null)
      await refresh()
    } catch (err) {
      notify('error', 'Product delete failed')
      setFormError(err.body?.error || err.message || 'Could not delete')
      setPendingDelete(null)
    }
  }

  const filteredProducts =
    products?.filter((p) =>
      String(p.name || '')
        .toLowerCase()
        .includes(search.toLowerCase()),
    ) || []

  return (
    <section>
      <h2>Products Admin Panel</h2>
      <p className="muted">
        Create, update, and delete products from this admin-only page.
      </p>

      {loadError ? <p className="form-error">{loadError}</p> : null}
      <label className="search-label">
        Search products
        <input
          value={search}
          onChange={(e) => dispatch(setProductSearch(e.target.value))}
          placeholder="Type product name..."
        />
      </label>

      <form onSubmit={handleSubmit} className="stack-form product-form">
        <h3 className="form-section-title">
          {editingId == null ? 'New product' : `Editing #${editingId}`}
        </h3>
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            disabled={saving}
          />
        </label>
        <label>
          Price
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            disabled={saving}
          />
        </label>
        <label>
          Category
          <select
            value={form.categoryId}
            onChange={(e) =>
              setForm((f) => ({ ...f, categoryId: e.target.value }))
            }
            disabled={saving}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Description
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            disabled={saving}
          />
        </label>
        {formError ? <p className="form-error">{formError}</p> : null}
        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId == null ? 'Create' : 'Save'}
          </button>
          {editingId != null ? (
            <button
              type="button"
              className="app-nav-btn"
              onClick={cancelEdit}
              disabled={saving}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <h3 className="form-section-title">Products list</h3>
      {products === null && !loadError ? <p className="muted">Loading...</p> : null}
      {products && filteredProducts.length === 0 ? (
        <p className="muted">No products found.</p>
      ) : null}
      {products && filteredProducts.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.price}</td>
                  <td>{categoryName(p.categoryId)}</td>
                  <td className="data-table-actions">
                    <button
                      type="button"
                      className="app-nav-btn"
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="app-nav-btn danger"
                      onClick={() => setPendingDelete(p.id)}
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
      <ConfirmModal
        open={pendingDelete != null}
        title="Delete product"
        message="Delete this product permanently?"
        confirmText="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDeleteConfirmed}
      />
    </section>
  )
}

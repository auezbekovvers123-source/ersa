import { useCallback, useEffect, useState } from 'react'
import { apiJson } from '../api.js'

const emptyForm = {
  name: '',
  price: '',
  categoryId: '',
  description: '',
}

export default function ProductsPage() {
  const [products, setProducts] = useState(null)
  const [categories, setCategories] = useState([])
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

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
      setLoadError(
        err.message ||
          'Не удалось загрузить данные. Запущен ли сервер (порт 3000)?',
      )
    }
  }, [])

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
      } else {
        await apiJson(`/products/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })
      }
      cancelEdit()
      await refresh()
    } catch (err) {
      setFormError(err.body?.error || err.message || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Удалить этот товар?')) return
    setFormError('')
    try {
      await apiJson(`/products/${id}`, { method: 'DELETE' })
      if (editingId === id) cancelEdit()
      await refresh()
    } catch (err) {
      setFormError(err.body?.error || err.message || 'Не удалось удалить')
    }
  }

  return (
    <section>
      <h2>Products</h2>
      <p className="muted">
        <strong>CRUD:</strong> Create — форма ниже; Read — таблица; Update —
        «Изменить»; Delete — «Удалить».
      </p>

      {loadError ? <p className="form-error">{loadError}</p> : null}

      <form onSubmit={handleSubmit} className="stack-form product-form">
        <h3 className="form-section-title">
          {editingId == null ? 'Новый товар' : `Редактирование #${editingId}`}
        </h3>
        <label>
          Название
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            disabled={saving}
          />
        </label>
        <label>
          Цена
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
          Категория
          <select
            value={form.categoryId}
            onChange={(e) =>
              setForm((f) => ({ ...f, categoryId: e.target.value }))
            }
            disabled={saving}
          >
            <option value="">Без категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Описание
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
            {saving ? 'Сохранение…' : editingId == null ? 'Создать' : 'Сохранить'}
          </button>
          {editingId != null ? (
            <button
              type="button"
              className="app-nav-btn"
              onClick={cancelEdit}
              disabled={saving}
            >
              Отмена
            </button>
          ) : null}
        </div>
      </form>

      <h3 className="form-section-title">Список</h3>
      {products === null && !loadError ? (
        <p className="muted">Загрузка…</p>
      ) : null}
      {products && products.length === 0 ? (
        <p className="muted">Пока нет товаров.</p>
      ) : null}
      {products && products.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Категория</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
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
                      Изменить
                    </button>
                    <button
                      type="button"
                      className="app-nav-btn danger"
                      onClick={() => handleDelete(p.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { apiJson } from '../api.js'

export default function CategoriesPage() {
  // Список с сервера (null = ещё грузим или ошибка загрузки)
  const [items, setItems] = useState(null)
  const [loadError, setLoadError] = useState('')

  // Поле формы: имя новой категории
  const [newName, setNewName] = useState('')
  // Ошибка только от кнопки «Добавить»
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  // Функция «заново скачать список» — вызываем при открытии страницы и после добавления
  const refreshList = useCallback(async () => {
    setLoadError('')
    try {
      const data = await apiJson('/categories')
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setItems(null)
      setLoadError(
        err.message ||
          'Не удалось загрузить категории. Запущен ли сервер (npm start в server/)?',
      )
    }
  }, [])

  useEffect(() => {
    refreshList()
  }, [refreshList])

  async function handleAdd(e) {
    e.preventDefault() // не перезагружать страницу
    const name = newName.trim()
    if (!name) return

    setSaveError('')
    setSaving(true)
    try {
      // POST /categories — сервер ждёт JSON { "name": "..." }
      await apiJson('/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      })
      setNewName('') // очистить поле
      await refreshList() // показать обновлённый список
    } catch (err) {
      setSaveError(err.body?.error || err.message || 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h2>Категории</h2>

      {/* Форма добавления — простой первый шаг CRUD: Create */}
      <form onSubmit={handleAdd} className="stack-form" style={{ marginBottom: '1.5rem' }}>
        <label>
          Новая категория
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Например: Напитки"
            disabled={saving || items === null}
          />
        </label>
        {saveError ? <p className="form-error">{saveError}</p> : null}
        <button type="submit" disabled={saving || items === null || !newName.trim()}>
          {saving ? 'Сохраняю…' : 'Добавить'}
        </button>
      </form>

      {loadError ? <p className="form-error">{loadError}</p> : null}
      {items === null && !loadError ? (
        <p className="muted">Загрузка…</p>
      ) : null}
      {items && items.length === 0 ? (
        <p className="muted">Пока нет категорий — добавь первую формой выше.</p>
      ) : null}
      {items && items.length > 0 ? (
        <ul className="resource-list">
          {items.map((c) => (
            <li key={c.id}>
              <strong>{c.name}</strong>{' '}
              <span className="muted">(id {c.id})</span>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="muted" style={{ marginTop: '1.25rem' }}>
        Следующий шаг: кнопки «Изменить» (PUT) и «Удалить» (DELETE) у каждой строки.
      </p>
    </section>
  )
}

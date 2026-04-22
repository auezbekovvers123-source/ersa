import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiJson } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { addToCart } from '../cartStorage.js'
import { useNotify } from '../hooks/useNotify.js'

export default function ProductsPage() {
  const { user } = useAuth()
  const notify = useNotify()
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState(null)
  const [categories, setCategories] = useState([])
  const [loadError, setLoadError] = useState('')
  const [activeProduct, setActiveProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)

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
      setLoadError(err.message || 'Could not load products catalog.')
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

  const filteredProducts = useMemo(
    () =>
      (products || []).filter((p) =>
      String(p.name || '')
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
    [products, search],
  )

  function openProductModal(product) {
    setActiveProduct(product)
    setQuantity(1)
  }

  function closeProductModal() {
    setActiveProduct(null)
    setQuantity(1)
  }

  function handleAddToCart() {
    if (!activeProduct || !user?.id) return
    const qty = Math.max(1, Number(quantity) || 1)
    addToCart(user.id, activeProduct, qty)
    notify('success', `${activeProduct.name} added to cart`)
    closeProductModal()
  }

  return (
    <section className="catalog-section">
      <h2>Products Catalog</h2>
      <p className="muted">Browse products. Only admins can manage product data.</p>

      {loadError ? <p className="form-error">{loadError}</p> : null}
      <label className="search-label">
        Search products
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Type product name..."
        />
      </label>

      {products === null && !loadError ? (
        <p className="muted">Loading...</p>
      ) : null}
      {products !== null && filteredProducts.length === 0 ? (
        <p className="muted">No products found.</p>
      ) : null}
      {filteredProducts.length > 0 ? (
        <div className="catalog-grid">
          {filteredProducts.map((p) => (
            <article key={p.id} className="product-card">
              <p className="product-category">{categoryName(p.categoryId)}</p>
              <h3 className="product-title">{p.name}</h3>
              <p className="product-description">{p.description || 'No description'}</p>
              <p className="product-price">${Number(p.price || 0).toFixed(2)}</p>
              <button
                type="button"
                className="app-nav-btn"
                onClick={() => openProductModal(p)}
              >
                View details
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {activeProduct ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card" role="dialog" aria-modal="true">
            <h3>{activeProduct.name}</h3>
            <p className="muted">Category: {categoryName(activeProduct.categoryId)}</p>
            <p>{activeProduct.description || 'No description'}</p>
            <p className="product-price">
              ${Number(activeProduct.price || 0).toFixed(2)}
            </p>
            <label className="product-qty-label">
              Quantity
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="app-nav-btn" onClick={closeProductModal}>
                Close
              </button>
              <button type="button" className="app-nav-btn" onClick={handleAddToCart}>
                Add to cart
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

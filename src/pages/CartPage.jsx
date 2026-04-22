import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { readCart, writeCart } from '../cartStorage.js'
import { useNotify } from '../hooks/useNotify.js'

export default function CartPage() {
  const { user } = useAuth()
  const notify = useNotify()
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!user?.id) return
    setItems(readCart(user.id))
  }, [user])

  function persist(nextItems) {
    setItems(nextItems)
    writeCart(user.id, nextItems)
  }

  function changeQty(productId, nextQty) {
    const q = Math.max(1, Number(nextQty) || 1)
    const next = items.map((item) =>
      Number(item.productId) === Number(productId)
        ? { ...item, quantity: q }
        : item,
    )
    persist(next)
  }

  function removeItem(productId) {
    const next = items.filter((item) => Number(item.productId) !== Number(productId))
    persist(next)
    notify('info', 'Item removed from cart')
  }

  function clearCart() {
    persist([])
    notify('info', 'Cart cleared')
  }

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [items],
  )

  return (
    <section>
      <h2>Your Cart</h2>
      <p className="muted">Cart is saved per user account on this browser.</p>

      {items.length === 0 ? <p className="muted">Your cart is empty.</p> : null}

      {items.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.productId}>
                  <td>{item.name}</td>
                  <td>${Number(item.price || 0).toFixed(2)}</td>
                  <td>
                    <input
                      className="cart-qty-input"
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => changeQty(item.productId, e.target.value)}
                    />
                  </td>
                  <td>
                    ${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="app-nav-btn danger"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="cart-footer">
          <strong>Total: ${total.toFixed(2)}</strong>
          <button type="button" className="app-nav-btn" onClick={clearCart}>
            Clear cart
          </button>
        </div>
      ) : null}
    </section>
  )
}

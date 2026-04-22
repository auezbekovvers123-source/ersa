const CART_KEY_PREFIX = 'teamproject_cart_user_'

function keyForUser(userId) {
  return `${CART_KEY_PREFIX}${userId}`
}

export function readCart(userId) {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(keyForUser(userId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeCart(userId, cartItems) {
  if (!userId) return
  localStorage.setItem(keyForUser(userId), JSON.stringify(cartItems))
  window.dispatchEvent(new CustomEvent('teamproject-cart-updated', { detail: { userId } }))
}

export function addToCart(userId, product, quantity) {
  if (!userId || !product) return []
  const safeQty = Math.max(1, Number(quantity) || 1)
  const current = readCart(userId)
  const idx = current.findIndex((x) => Number(x.productId) === Number(product.id))
  if (idx === -1) {
    current.push({
      productId: product.id,
      name: product.name,
      price: Number(product.price || 0),
      quantity: safeQty,
      description: product.description || '',
    })
  } else {
    current[idx] = {
      ...current[idx],
      quantity: current[idx].quantity + safeQty,
    }
  }
  writeCart(userId, current)
  return current
}

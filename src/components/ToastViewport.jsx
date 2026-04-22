import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeNotification } from '../store/slices/notificationsSlice.js'

export default function ToastViewport() {
  const dispatch = useDispatch()
  const items = useSelector((s) => s.notifications.items)

  useEffect(() => {
    if (!items.length) return undefined
    const timers = items.map((n) =>
      setTimeout(() => dispatch(removeNotification(n.id)), 3200),
    )
    return () => timers.forEach(clearTimeout)
  }, [items, dispatch])

  if (!items.length) return null

  return (
    <div className="toast-viewport" role="status" aria-live="polite">
      {items.map((n) => (
        <div key={n.id} className={`toast toast-${n.type}`}>
          <span>{n.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => dispatch(removeNotification(n.id))}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

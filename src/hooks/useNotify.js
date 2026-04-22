import { useDispatch } from 'react-redux'
import { pushNotification } from '../store/slices/notificationsSlice.js'

export function useNotify() {
  const dispatch = useDispatch()
  return (type, message) => dispatch(pushNotification({ type, message }))
}

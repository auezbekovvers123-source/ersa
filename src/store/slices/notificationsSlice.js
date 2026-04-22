import { createSlice } from '@reduxjs/toolkit'

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    nextId: 1,
  },
  reducers: {
    pushNotification(state, action) {
      const { type = 'info', message = '' } = action.payload || {}
      state.items.push({ id: state.nextId++, type, message })
    },
    removeNotification(state, action) {
      state.items = state.items.filter((n) => n.id !== action.payload)
    },
    clearNotifications(state) {
      state.items = []
    },
  },
})

export const { pushNotification, removeNotification, clearNotifications } =
  notificationsSlice.actions
export default notificationsSlice.reducer

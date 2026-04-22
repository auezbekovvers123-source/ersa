import { configureStore } from '@reduxjs/toolkit'
import notificationsReducer from './slices/notificationsSlice.js'
import uiReducer from './slices/uiSlice.js'

export const store = configureStore({
  reducer: {
    notifications: notificationsReducer,
    ui: uiReducer,
  },
})

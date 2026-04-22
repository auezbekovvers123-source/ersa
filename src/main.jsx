import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ToastViewport from './components/ToastViewport.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { store } from './store/index.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <ToastViewport />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)

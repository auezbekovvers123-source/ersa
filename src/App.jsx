import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import CategoriesPage from './pages/CategoriesPage.jsx'
import AdminProductsPage from './pages/AdminProductsPage.jsx'
import CartPage from './pages/CartPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route
          path="admin/products"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="categories"
          element={
            <ProtectedRoute roles={['admin']}>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App

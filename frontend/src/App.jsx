// frontend/src/App.jsx - WITH CATEGORY ROUTE
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './App.css'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ReviewProfile from './pages/ReviewProfile.jsx'
import EditProfile from './pages/EditProfile.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Products from './pages/Products.jsx'
import CategoryProducts from './pages/CategoryProducts.jsx' // ✅ ADD
import About from './pages/About.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Orders from './pages/Orders.jsx'
import OrderDetail from './pages/OrderDetail.jsx'

function App() {
  const token = useSelector((s) => s.auth.token)

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/category/:categoryId" element={<CategoryProducts />} /> {/* ✅ ADD */}
      <Route path="/about" element={<About />} />
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/product/:id" element={<ProductDetail />} />

      {/* Protected Routes - Cart & Checkout */}
      <Route 
        path="/cart" 
        element={token ? <Cart /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/checkout" 
        element={token ? <Checkout /> : <Navigate to="/login" replace />} 
      />

      {/* Protected Routes - Orders */}
      <Route 
        path="/orders" 
        element={token ? <Orders /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/orders/:orderId" 
        element={token ? <OrderDetail /> : <Navigate to="/login" replace />} 
      />

      {/* Protected Routes - Profile */}
      <Route 
        path="/review-profile" 
        element={token ? <ReviewProfile /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/edit-profile" 
        element={token ? <EditProfile /> : <Navigate to="/login" replace />} 
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
// frontend/src/App.jsx - UPDATED WITH ADMIN ROUTES
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
import CategoryProducts from './pages/CategoryProducts.jsx'
import About from './pages/About.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Orders from './pages/Orders.jsx'
import OrderDetail from './pages/OrderDetail.jsx'
import Reviews from './pages/Reviews'
import Wishlist from './pages/Wishlist'
import LoyaltyPoints from './pages/LoyaltyPoints'

// ✅ ADMIN ROUTES
import AdminOrders from './pages/admin/AdminOrders'

function App() {
  const { token, user } = useSelector((s) => s.auth)
  const isAdmin = user?.role === 'admin'

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/category/:categoryId" element={<CategoryProducts />} />
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

      {/* Protected Routes - Reviews, Wishlist, Loyalty Points */}
      <Route path="/reviews" element={token ? <Reviews /> : <Navigate to="/login" />} />
      <Route path="/wishlist" element={token ? <Wishlist /> : <Navigate to="/login" />} />
      <Route path="/loyalty" element={token ? <LoyaltyPoints /> : <Navigate to="/login" />} />

      {/* ✅ ADMIN ROUTES */}
      <Route 
        path="/admin/orders" 
        element={token && isAdmin ? <AdminOrders /> : <Navigate to="/" />} 
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
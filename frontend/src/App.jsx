import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './App.css'
import Home from './pages/home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ReviewProfile from './pages/ReviewProfile.jsx'
import EditProfile from './pages/EditProfile.jsx'
import ProductDetail from './pages/ProductDetail.jsx'

function App() {
  const token = useSelector((s) => s.auth.token)

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/review-profile" element={token ? <ReviewProfile /> : <Navigate to="/login" replace />} />
      <Route path="/edit-profile" element={token ? <EditProfile /> : <Navigate to="/login" replace />} />
      <Route path="/product/:id" element={<ProductDetail />} />

      <Route path="/home" element={<Home />} />

    </Routes>
  )
}

export default App


import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import ForgotPassword from './components/ForgotPassword'
import './App.css'
import EditProfile from './components/EditProfile.jsx';

function App() {
  const token = useSelector((s) => s.auth.token)

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/edit-profile" element={token ? <EditProfile /> : <Navigate to="/login" replace />}/>
      <Route
        path="/dashboard"
        element={token ? <Dashboard /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default App


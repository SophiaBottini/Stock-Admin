import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Buscar from './pages/Buscar'
import NuevaVenta from './pages/NuevaVenta'
import Stock from './pages/Stock'
import AgregarProducto from './pages/AgregarProducto'
import Trazabilidad from './pages/Trazabilidad'
import Reportes from './pages/Reportes'
import Alertas from './pages/Alertas'
import Usuarios from './pages/Usuarios'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><span className="spinner" /></div>
  if (!user) return <Navigate to="/login" />
  if (adminOnly && user.rol !== 'admin') return <Navigate to="/buscar" />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
          <Route path="buscar" element={<Buscar />} />
          <Route path="ventas/nueva" element={<NuevaVenta />} />
          <Route path="stock" element={<ProtectedRoute adminOnly><Stock /></ProtectedRoute>} />
          <Route path="stock/nuevo" element={<ProtectedRoute adminOnly><AgregarProducto /></ProtectedRoute>} />
          <Route path="trazabilidad" element={<ProtectedRoute adminOnly><Trazabilidad /></ProtectedRoute>} />
          <Route path="reportes" element={<ProtectedRoute adminOnly><Reportes /></ProtectedRoute>} />
          <Route path="alertas" element={<ProtectedRoute adminOnly><Alertas /></ProtectedRoute>} />
          <Route path="usuarios" element={<ProtectedRoute adminOnly><Usuarios /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  )
}

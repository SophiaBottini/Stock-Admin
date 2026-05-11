import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ADMIN_NAV = [
  { to: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard' },
  { to: '/buscar', icon: 'ti-search', label: 'Buscar producto' },
  { to: '/ventas/nueva', icon: 'ti-receipt', label: 'Nueva venta' },
  { sep: 'Inventario' },
  { to: '/stock', icon: 'ti-box', label: 'Stock' },
  { to: '/alertas', icon: 'ti-bell', label: 'Alertas' },
  { to: '/trazabilidad', icon: 'ti-history', label: 'Trazabilidad' },
  { sep: 'Análisis' },
  { to: '/reportes', icon: 'ti-chart-bar', label: 'Reportes' },
  { sep: 'Config' },
  { to: '/usuarios', icon: 'ti-users', label: 'Usuarios' },
]

const VENDOR_NAV = [
  { to: '/buscar', icon: 'ti-search', label: 'Buscar producto' },
  { to: '/ventas/nueva', icon: 'ti-receipt', label: 'Nueva venta' },
]

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const nav = isAdmin ? ADMIN_NAV : VENDOR_NAV

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Topbar */}
      <div style={{ height: 52, background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 1.25rem', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 500 }}><span style={{ color: 'var(--green)' }}>●</span> StockRopa</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={`badge badge-${user?.rol}`}>{user?.rol === 'admin' ? 'Admin' : 'Vendedor'}</span>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>{user?.nombre}</span>
          <button className="btn" style={{ padding: '5px 10px', fontSize: 12 }} onClick={handleLogout}>
            <i className="ti ti-logout" /> Salir
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: 200, minWidth: 200, background: '#fff', borderRight: '1px solid var(--border)', padding: '1rem 0' }}>
          {nav.map((item, i) =>
            item.sep ? (
              <div key={i} style={{ fontSize: 10, color: 'var(--text3)', padding: '10px 1.1rem 3px', textTransform: 'uppercase', letterSpacing: '.06em' }}>{item.sep}</div>
            ) : (
              <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 9, padding: '8px 1.1rem',
                fontSize: 13, color: isActive ? 'var(--green-dark)' : 'var(--text2)',
                background: isActive ? 'var(--green-light)' : 'transparent',
                fontWeight: isActive ? 500 : 400, textDecoration: 'none',
              })}>
                <i className={`ti ${item.icon}`} style={{ fontSize: 17 }} />
                {item.label}
              </NavLink>
            )
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

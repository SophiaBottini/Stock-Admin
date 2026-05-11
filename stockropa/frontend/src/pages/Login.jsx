import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handle = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Bienvenida/o, ${user.nombre}`)
      navigate(user.rol === 'admin' ? '/dashboard' : '/buscar')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="card" style={{ width: 360 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 600 }}><span style={{ color: 'var(--green)' }}>●</span> StockRopa</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Sistema de gestión para locales de ropa</div>
        </div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="fg">
            <label>Email</label>
            <input className="input" type="email" placeholder="usuario@stockropa.com" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="fg">
            <label>Contraseña</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Ingresar'}
          </button>
        </form>

        <div style={{ marginTop: 16, padding: 12, background: 'var(--bg3)', borderRadius: 8, fontSize: 12, color: 'var(--text2)' }}>
          <strong>Demo:</strong><br />
          Admin: admin@stockropa.com / admin123<br />
          Vendedor: vendedor@stockropa.com / vendedor123
        </div>
      </div>
    </div>
  )
}

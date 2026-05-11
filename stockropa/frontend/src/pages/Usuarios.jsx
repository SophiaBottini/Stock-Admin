import React, { useEffect, useState } from 'react'
import api from '../hooks/useApi'
import toast from 'react-hot-toast'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'vendedor', local_id: '' })
  const [guardando, setGuardando] = useState(false)

  const cargar = () => api.get('/usuarios').then(r => setUsuarios(r.data)).finally(() => setLoading(false))
  useEffect(() => { cargar() }, [])

  const guardar = async e => {
    e.preventDefault()
    setGuardando(true)
    try {
      await api.post('/usuarios', form)
      toast.success('Usuario creado correctamente')
      setModal(false)
      setForm({ nombre: '', email: '', password: '', rol: 'vendedor', local_id: '' })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al crear usuario')
    } finally { setGuardando(false) }
  }

  const desactivar = async id => {
    if (!confirm('¿Desactivar este usuario?')) return
    await api.delete(`/usuarios/${id}`)
    toast.success('Usuario desactivado')
    cargar()
  }

  const fmt = d => d ? new Date(d).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : 'Nunca'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500 }}>Usuarios y roles</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Gestioná quién tiene acceso y qué puede hacer</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><i className="ti ti-user-plus" /> Nuevo usuario</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading
          ? <div className="empty"><span className="spinner" /></div>
          : <table>
              <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Local</th><th>Último acceso</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.nombre}</td>
                    <td style={{ fontSize: 12, color: 'var(--text2)' }}>{u.email}</td>
                    <td><span className={`badge badge-${u.rol}`}>{u.rol}</span></td>
                    <td>{u.locales?.nombre || 'Todos'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text2)' }}>{fmt(u.ultimo_acceso)}</td>
                    <td><span className={`badge ${u.activo ? 'badge-ok' : 'badge-low'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                      {u.activo && <button className="btn badge-low" style={{ fontSize: 12, padding: '3px 8px', background: 'var(--red-light)', color: 'var(--red)', border: 'none' }} onClick={() => desactivar(u.id)}>Desactivar</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>

      {/* Modal nuevo usuario */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: 420, maxWidth: '90vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontWeight: 500, fontSize: 15 }}>Nuevo usuario</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text2)', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="fg"><label>Nombre <span className="req">*</span></label><input className="input" value={form.nombre} onChange={e => setForm(p=>({...p,nombre:e.target.value}))} required /></div>
              <div className="fg"><label>Email <span className="req">*</span></label><input className="input" type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} required /></div>
              <div className="fg"><label>Contraseña <span className="req">*</span></label><input className="input" type="password" value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} required minLength={6} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="fg">
                  <label>Rol <span className="req">*</span></label>
                  <select className="input" value={form.rol} onChange={e => setForm(p=>({...p,rol:e.target.value}))}>
                    <option value="vendedor">Vendedor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Local (vendedores)</label>
                  <input className="input" placeholder="ID del local" value={form.local_id} onChange={e => setForm(p=>({...p,local_id:e.target.value}))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

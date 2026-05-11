import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../hooks/useApi'

export default function Stock() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [cat, setCat] = useState('')
  const navigate = useNavigate()

  const cargar = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (buscar) params.set('buscar', buscar)
    if (cat) params.set('categoria', cat)
    const res = await api.get('/stock?' + params)
    setItems(res.data)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const estadoBadge = (cantidad, minimo) => {
    if (cantidad === 0) return <span className="badge badge-low">Sin stock</span>
    if (cantidad <= minimo) return <span className="badge badge-warn">Bajo</span>
    return <span className="badge badge-ok">OK</span>
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500 }}>Stock</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Inventario por producto y local</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/stock/nuevo')}>
          <i className="ti ti-plus" /> Agregar producto
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input className="input" placeholder="Buscar producto o ID..." value={buscar}
          onChange={e => setBuscar(e.target.value)} onKeyDown={e => e.key === 'Enter' && cargar()} style={{ flex: 1 }} />
        <select className="input" style={{ width: 180 }} value={cat} onChange={e => { setCat(e.target.value); }}>
          <option value="">Todas las categorías</option>
          {['Remeras','Jeans','Buzos','Vestidos','Camperas','Polleras','Accesorios'].map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-primary" onClick={cargar}><i className="ti ti-search" /></button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading
          ? <div className="empty"><span className="spinner" /></div>
          : items.length === 0
            ? <div className="empty"><i className="ti ti-box" />Sin productos</div>
            : <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Producto</th><th>Categoría</th>
                    <th>Stock</th><th>Local</th><th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text2)' }}>{item.productos?.id_unico}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {item.productos?.imagen_url
                            ? <img src={item.productos.imagen_url} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} />
                            : <div style={{ width: 32, height: 32, background: 'var(--bg3)', borderRadius: 4 }} />
                          }
                          {item.productos?.nombre}
                        </div>
                      </td>
                      <td>{item.productos?.categoria}</td>
                      <td style={{ fontWeight: 500 }}>{item.cantidad}</td>
                      <td>{item.locales?.nombre}</td>
                      <td>{estadoBadge(item.cantidad, item.productos?.stock_minimo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
        }
      </div>
    </div>
  )
}

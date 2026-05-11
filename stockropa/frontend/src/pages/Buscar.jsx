import React, { useState, useRef } from 'react'
import api from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'

export default function Buscar() {
  const { isAdmin, user } = useAuth()
  const [query, setQuery] = useState('')
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const timer = useRef(null)

  const buscar = async (id) => {
    if (!id.trim()) { setProducto(null); setNotFound(false); return }
    setLoading(true); setNotFound(false)
    try {
      const res = await api.get(`/productos/${id.trim()}`)
      setProducto(res.data)
    } catch {
      setProducto(null); setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const onInput = val => {
    setQuery(val)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => buscar(val), 400)
  }

  const stockTotal = producto
    ? (producto.stock_por_local || []).reduce((s, l) => s + l.cantidad, 0)
    : 0

  const stockLocal = producto && !isAdmin
    ? (producto.stock_por_local || []).find(l => l.local_id === user.local_id)?.cantidad ?? 0
    : null

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: 18, fontWeight: 500 }}>Buscar producto</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Ingresá el ID único para ver precio, imagen y stock</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, maxWidth: 500 }}>
        <input className="input" placeholder="ID del producto (ej: RM001, JN003...)"
          value={query} onChange={e => onInput(e.target.value)}
          style={{ flex: 1, fontSize: 14, padding: '10px 12px' }} autoFocus />
        {loading && <span className="spinner" style={{ alignSelf: 'center' }} />}
      </div>

      {notFound && (
        <div className="empty">
          <i className="ti ti-search-off" />
          <div>No se encontró el producto <strong>{query}</strong></div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Verificá el ID e intentá de nuevo</div>
        </div>
      )}

      {producto && (
        <div className="card" style={{ maxWidth: 680 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 0 }}>
            {/* Imagen */}
            <div style={{ borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160, background: 'var(--bg3)', borderRadius: '12px 0 0 0' }}>
              {producto.imagen_url
                ? <img src={producto.imagen_url} alt={producto.nombre} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: '12px 0 0 0' }} />
                : <i className="ti ti-shirt" style={{ fontSize: 48, color: 'var(--text3)' }} />
              }
            </div>
            {/* Info */}
            <div style={{ padding: '1.25rem' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>{producto.id_unico}</div>
              <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 2 }}>{producto.nombre}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>{producto.categoria}</div>
              <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--green)', marginBottom: 14 }}>
                ${producto.precio_venta?.toLocaleString('es-AR')}
              </div>

              {/* Talles */}
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Stock por talle</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(producto.talles || []).map(t => (
                  <div key={t.talle} style={{
                    padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)',
                    background: t.stock_total === 0 ? 'var(--bg3)' : '#fff',
                    textAlign: 'center', minWidth: 48,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: t.stock_total === 0 ? 'var(--text3)' : 'var(--text)', textDecoration: t.stock_total === 0 ? 'line-through' : 'none' }}>{t.talle}</div>
                    <div style={{ fontSize: 11, color: t.stock_total === 0 ? 'var(--text3)' : 'var(--text2)' }}>{t.stock_total}</div>
                  </div>
                ))}
              </div>

              {/* Stock badge */}
              <div style={{ marginTop: 14 }}>
                <span className={`badge ${stockTotal <= 2 ? 'badge-low' : stockTotal <= 5 ? 'badge-warn' : 'badge-ok'}`}>
                  Stock total: {stockTotal}
                </span>
              </div>
            </div>
          </div>

          {/* Stock por local */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.25rem' }}>
            {isAdmin ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {(producto.stock_por_local || []).map(l => (
                  <div key={l.local_id} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>{l.locales?.nombre}</div>
                    <div style={{ fontSize: 22, fontWeight: 500 }}>{l.cantidad}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>unidades</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>Stock en tu local</div>
                <div style={{ fontSize: 28, fontWeight: 500 }}>{stockLocal}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

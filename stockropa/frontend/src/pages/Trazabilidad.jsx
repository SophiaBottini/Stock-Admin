import React, { useEffect, useState } from 'react'
import api from '../hooks/useApi'

const TIPO_CONFIG = {
  venta: { icon: 'ti-receipt', color: '#1D9E75', bg: '#E1F5EE', label: 'Venta' },
  ingreso: { icon: 'ti-package', color: '#185FA5', bg: '#E6F1FB', label: 'Ingreso' },
  ajuste: { icon: 'ti-adjustments', color: '#BA7517', bg: '#FAEEDA', label: 'Ajuste' },
  transferencia_salida: { icon: 'ti-arrow-right', color: '#993556', bg: '#FBEAF0', label: 'Transf. salida' },
  transferencia_entrada: { icon: 'ti-arrow-left', color: '#534AB7', bg: '#EEEDFE', label: 'Transf. entrada' },
}

export default function Trazabilidad() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tipo, setTipo] = useState('')
  const [desde, setDesde] = useState('')

  const cargar = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (tipo) params.set('tipo', tipo)
    if (desde) params.set('desde', desde)
    const res = await api.get('/reportes/trazabilidad?' + params)
    setItems(res.data)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const fmt = d => new Date(d).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: 18, fontWeight: 500 }}>Trazabilidad</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Historial completo de movimientos de stock</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select className="input" style={{ width: 180 }} value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          {Object.entries(TIPO_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <input className="input" type="date" style={{ width: 160 }} value={desde} onChange={e => setDesde(e.target.value)} />
        <button className="btn btn-primary" onClick={cargar}><i className="ti ti-filter" /> Filtrar</button>
      </div>

      <div className="card">
        {loading
          ? <div className="empty"><span className="spinner" /></div>
          : items.length === 0
            ? <div className="empty"><i className="ti ti-history" />Sin movimientos</div>
            : items.map(item => {
                const cfg = TIPO_CONFIG[item.tipo] || TIPO_CONFIG.ajuste
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`ti ${cfg.icon}`} style={{ fontSize: 15 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>
                        {cfg.label} — {item.productos?.nombre}
                        <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>{item.productos?.id_unico}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                        {item.locales?.nombre} · {item.talle ? `Talle ${item.talle} · ` : ''}{item.usuarios?.nombre} ({item.usuarios?.rol}) {item.nota ? `· ${item.nota}` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 500, color: item.cantidad > 0 ? 'var(--green)' : 'var(--red)' }}>
                        {item.cantidad > 0 ? '+' : ''}{item.cantidad}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{fmt(item.created_at)}</div>
                    </div>
                  </div>
                )
              })
        }
      </div>
    </div>
  )
}

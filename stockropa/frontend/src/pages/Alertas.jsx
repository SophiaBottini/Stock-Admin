import React, { useEffect, useState } from 'react'
import api from '../hooks/useApi'
import toast from 'react-hot-toast'

export default function Alertas() {
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/stock/alertas').then(r => setAlertas(r.data)).finally(() => setLoading(false))
  }, [])

  const criticas = alertas.filter(a => a.cantidad === 0)
  const bajas = alertas.filter(a => a.cantidad > 0)

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: 18, fontWeight: 500 }}>Alertas de stock</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Productos que necesitan reposición</p>
      </div>

      {loading
        ? <div className="empty"><span className="spinner" /></div>
        : alertas.length === 0
          ? <div className="empty"><i className="ti ti-circle-check" style={{ color: 'var(--green)' }} /><div style={{ color: 'var(--green)' }}>¡Todo el stock está en orden!</div></div>
          : <>
              {criticas.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <i className="ti ti-alert-triangle" style={{ color: 'var(--red)', fontSize: 18 }} />
                    <span style={{ fontWeight: 500, color: 'var(--red)' }}>Sin stock ({criticas.length})</span>
                  </div>
                  <table>
                    <thead><tr><th>ID</th><th>Producto</th><th>Local</th><th>Stock</th><th>Mínimo</th><th></th></tr></thead>
                    <tbody>
                      {criticas.map(a => (
                        <tr key={a.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text2)' }}>{a.productos?.id_unico}</td>
                          <td>{a.productos?.nombre}</td>
                          <td>{a.locales?.nombre}</td>
                          <td><span className="badge badge-low">0</span></td>
                          <td>{a.productos?.stock_minimo}</td>
                          <td><button className="btn" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => toast.success('Orden de reposición creada')}>Reponer</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {bajas.length > 0 && (
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <i className="ti ti-alert-circle" style={{ color: 'var(--yellow)', fontSize: 18 }} />
                    <span style={{ fontWeight: 500, color: 'var(--yellow)' }}>Stock bajo ({bajas.length})</span>
                  </div>
                  <table>
                    <thead><tr><th>ID</th><th>Producto</th><th>Local</th><th>Stock</th><th>Mínimo</th><th></th></tr></thead>
                    <tbody>
                      {bajas.map(a => (
                        <tr key={a.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text2)' }}>{a.productos?.id_unico}</td>
                          <td>{a.productos?.nombre}</td>
                          <td>{a.locales?.nombre}</td>
                          <td><span className="badge badge-warn">{a.cantidad}</span></td>
                          <td>{a.productos?.stock_minimo}</td>
                          <td><button className="btn" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => toast.success('Orden de reposición creada')}>Reponer</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
      }
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../hooks/useApi'

export default function Dashboard() {
  const [resumen, setResumen] = useState(null)
  const [porLocal, setPorLocal] = useState([])
  const [masVendidos, setMasVendidos] = useState([])
  const [ultimasVentas, setUltimasVentas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reportes/resumen'),
      api.get('/reportes/por-local'),
      api.get('/reportes/productos-mas-vendidos?limit=5'),
      api.get('/ventas?limit=5'),
    ]).then(([r, l, mv, uv]) => {
      setResumen(r.data)
      setPorLocal(l.data)
      setMasVendidos(mv.data)
      setUltimasVentas(uv.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="empty"><span className="spinner" /></div>

  const fmt = n => '$' + (n || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 })

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: 18, fontWeight: 500 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Resumen del día</p>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Ventas hoy', value: fmt(resumen?.totalVentas), sub: `${resumen?.cantidadVentas || 0} transacciones` },
          { label: 'Unidades vendidas', value: resumen?.totalUnidades || 0, sub: 'hoy' },
          { label: 'Ticket promedio', value: fmt(resumen?.ticketPromedio), sub: 'por venta' },
          { label: 'Mejor local', value: porLocal[0]?.local || '—', sub: fmt(porLocal[0]?.total) },
        ].map((m, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500 }}>{m.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Gráfico por local */}
        <div className="card">
          <div className="card-title">Ventas por local</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={porLocal.map(l => ({ name: l.local, total: l.total }))}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
              <Tooltip formatter={v => fmt(v)} />
              <Bar dataKey="total" fill="#1D9E75" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Últimas ventas */}
        <div className="card">
          <div className="card-title">Últimas ventas</div>
          {ultimasVentas.length === 0
            ? <div className="empty" style={{ padding: '1rem' }}>Sin ventas aún hoy</div>
            : <table>
                <thead><tr><th>Local</th><th>Pago</th><th>Total</th></tr></thead>
                <tbody>
                  {ultimasVentas.map(v => (
                    <tr key={v.id}>
                      <td>{v.locales?.nombre}</td>
                      <td>{v.medio_pago}</td>
                      <td style={{ fontWeight: 500 }}>{fmt(v.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>

      {/* Más vendidos */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Productos más vendidos</div>
        <table>
          <thead><tr><th>ID</th><th>Producto</th><th>Unidades</th><th>Total</th></tr></thead>
          <tbody>
            {masVendidos.map(p => (
              <tr key={p.id_unico}>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text2)' }}>{p.id_unico}</td>
                <td>{p.nombre}</td>
                <td>{p.unidades}</td>
                <td style={{ fontWeight: 500 }}>{fmt(p.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

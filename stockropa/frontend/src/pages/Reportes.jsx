import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import api from '../hooks/useApi'

export default function Reportes() {
  const [resumen, setResumen] = useState(null)
  const [porLocal, setPorLocal] = useState([])
  const [masVendidos, setMasVendidos] = useState([])
  const [periodo, setPeriodo] = useState('mes')
  const [loading, setLoading] = useState(true)

  const periodos = {
    hoy: { desde: new Date().toISOString().split('T')[0], hasta: new Date().toISOString() },
    semana: { desde: new Date(Date.now() - 7*86400000).toISOString(), hasta: new Date().toISOString() },
    mes: { desde: new Date(new Date().setDate(1)).toISOString().split('T')[0], hasta: new Date().toISOString() },
  }

  const cargar = async () => {
    setLoading(true)
    const { desde, hasta } = periodos[periodo]
    const params = `desde=${desde}&hasta=${hasta}`
    const [r, l, mv] = await Promise.all([
      api.get('/reportes/resumen?' + params),
      api.get('/reportes/por-local?' + params),
      api.get('/reportes/productos-mas-vendidos?limit=8&' + params),
    ])
    setResumen(r.data)
    setPorLocal(l.data)
    setMasVendidos(mv.data)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [periodo])

  const fmt = n => '$' + (n || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 })

  if (loading) return <div className="empty"><span className="spinner" /></div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500 }}>Reportes</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Análisis de ventas y rendimiento</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['hoy','semana','mes'].map(p => (
            <button key={p} className={`btn ${periodo===p ? 'btn-primary' : ''}`} onClick={() => setPeriodo(p)}
              style={{ padding: '6px 14px', textTransform: 'capitalize' }}>{p}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Ventas totales', value: fmt(resumen?.totalVentas) },
          { label: 'Transacciones', value: resumen?.cantidadVentas || 0 },
          { label: 'Unidades', value: resumen?.totalUnidades || 0 },
          { label: 'Ticket promedio', value: fmt(resumen?.ticketPromedio) },
        ].map((m, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500 }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-title">Ventas por local</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={porLocal.map(l => ({ name: l.local, total: l.total, cantidad: l.cantidad }))}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
              <Tooltip formatter={v => fmt(v)} />
              <Bar dataKey="total" fill="#1D9E75" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Productos más vendidos</div>
          <table>
            <thead><tr><th>#</th><th>Producto</th><th>Uds.</th><th>Total</th></tr></thead>
            <tbody>
              {masVendidos.slice(0,6).map((p, i) => (
                <tr key={p.id_unico}>
                  <td style={{ color: 'var(--text3)', fontSize: 12 }}>{i+1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {p.imagen_url ? <img src={p.imagen_url} alt="" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 4 }} /> : null}
                      <span>{p.nombre}</span>
                    </div>
                  </td>
                  <td>{p.unidades}</td>
                  <td style={{ fontWeight: 500 }}>{fmt(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useRef } from 'react'
import api from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const MEDIOS_PAGO = ['Efectivo', 'Tarjeta débito', 'Tarjeta crédito', 'Transferencia', 'Mercado Pago']

export default function NuevaVenta() {
  const { user, isAdmin } = useAuth()
  const [idInput, setIdInput] = useState('')
  const [producto, setProducto] = useState(null)
  const [talle, setTalle] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [medioPago, setMedioPago] = useState('Efectivo')
  const [descuento, setDescuento] = useState(0)
  const [localId, setLocalId] = useState(user?.local_id || '')
  const [locales, setLocales] = useState([])
  const [carrito, setCarrito] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const timer = useRef(null)

  React.useEffect(() => {
    if (isAdmin) api.get('/stock').then(r => {
      const ls = [...new Map(r.data.map(i => [i.local_id, i.locales])).entries()]
        .map(([id, l]) => ({ id, nombre: l?.nombre }))
      setLocales(ls)
      if (ls[0]) setLocalId(ls[0].id)
    })
  }, [isAdmin])

  const buscarProducto = async id => {
    if (!id.trim()) { setProducto(null); return }
    setBuscando(true)
    try {
      const res = await api.get(`/productos/${id.trim()}`)
      setProducto(res.data)
      const primerTalle = res.data.talles?.find(t => t.stock_total > 0)
      setTalle(primerTalle?.talle || '')
    } catch { setProducto(null) }
    finally { setBuscando(false) }
  }

  const onIdChange = val => {
    setIdInput(val)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => buscarProducto(val), 400)
  }

  const agregarAlCarrito = () => {
    if (!producto || !talle) return toast.error('Seleccioná un talle')
    const precio = producto.precio_venta * (1 - descuento / 100)
    setCarrito(c => [...c, { producto, talle, cantidad: parseInt(cantidad), precio_unitario: precio, id_unico: producto.id_unico }])
    setIdInput(''); setProducto(null); setTalle(''); setCantidad(1)
  }

  const eliminarItem = idx => setCarrito(c => c.filter((_, i) => i !== idx))

  const total = carrito.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0)

  const confirmarVenta = async () => {
    if (!carrito.length) return toast.error('Agregá productos al carrito')
    if (!localId) return toast.error('Seleccioná un local')
    setGuardando(true)
    try {
      await api.post('/ventas', {
        local_id: localId,
        medio_pago: medioPago,
        descuento_pct: descuento,
        items: carrito.map(i => ({ id_unico: i.id_unico, talle: i.talle, cantidad: i.cantidad })),
      })
      toast.success('¡Venta registrada correctamente!')
      setCarrito([])
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al registrar la venta')
    } finally {
      setGuardando(false)
    }
  }

  const fmt = n => '$' + n.toLocaleString('es-AR', { maximumFractionDigits: 0 })

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: 18, fontWeight: 500 }}>Nueva venta</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>El stock se descuenta automáticamente al confirmar</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Formulario */}
        <div className="card">
          <div className="card-title">Datos del producto</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isAdmin && (
              <div className="fg">
                <label>Local</label>
                <select className="input" value={localId} onChange={e => setLocalId(e.target.value)}>
                  {locales.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                </select>
              </div>
            )}
            <div className="fg">
              <label>ID del producto</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" placeholder="ej: RM001" value={idInput} onChange={e => onIdChange(e.target.value)} style={{ flex: 1 }} />
                {buscando && <span className="spinner" style={{ alignSelf: 'center' }} />}
              </div>
            </div>

            {producto && (
              <>
                <div style={{ display: 'flex', gap: 10, padding: 10, background: 'var(--bg3)', borderRadius: 8, alignItems: 'center' }}>
                  {producto.imagen_url
                    ? <img src={producto.imagen_url} alt={producto.nombre} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                    : <div style={{ width: 48, height: 48, background: 'var(--border)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="ti ti-shirt" style={{ fontSize: 22, color: 'var(--text3)' }} /></div>
                  }
                  <div>
                    <div style={{ fontWeight: 500 }}>{producto.nombre}</div>
                    <div style={{ fontSize: 16, color: 'var(--green)', fontWeight: 600 }}>{fmt(producto.precio_venta)}</div>
                  </div>
                </div>
                <div className="fg">
                  <label>Talle</label>
                  <select className="input" value={talle} onChange={e => setTalle(e.target.value)}>
                    {(producto.talles || []).map(t => (
                      <option key={t.talle} value={t.talle} disabled={t.stock_total === 0}>
                        {t.talle} {t.stock_total === 0 ? '— Sin stock' : `(${t.stock_total})`}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="fg">
                <label>Cantidad</label>
                <input className="input" type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} />
              </div>
              <div className="fg">
                <label>Descuento %</label>
                <input className="input" type="number" min="0" max="100" value={descuento} onChange={e => setDescuento(e.target.value)} />
              </div>
            </div>
            <div className="fg">
              <label>Medio de pago</label>
              <select className="input" value={medioPago} onChange={e => setMedioPago(e.target.value)}>
                {MEDIOS_PAGO.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <button className="btn" onClick={agregarAlCarrito} disabled={!producto}>
              <i className="ti ti-plus" /> Agregar al carrito
            </button>
          </div>
        </div>

        {/* Carrito */}
        <div className="card">
          <div className="card-title">Carrito</div>
          {carrito.length === 0
            ? <div className="empty" style={{ padding: '2rem 1rem' }}><i className="ti ti-shopping-cart" />Sin productos aún</div>
            : <>
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                  {carrito.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: i < carrito.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{item.producto.nombre}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)' }}>Talle {item.talle} · x{item.cantidad}</div>
                      </div>
                      <div style={{ fontWeight: 500 }}>{fmt(item.precio_unitario * item.cantidad)}</div>
                      <button onClick={() => eliminarItem(i)} style={{ background: 'none', border: 'none', color: 'var(--text3)', padding: 4 }}>
                        <i className="ti ti-x" style={{ fontSize: 16 }} />
                      </button>
                    </div>
                  ))}
                  <div style={{ background: 'var(--bg3)', padding: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 500, fontSize: 15 }}>
                    <span>Total</span><span style={{ color: 'var(--green)' }}>{fmt(total)}</span>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={confirmarVenta} disabled={guardando} style={{ width: '100%', justifyContent: 'center', padding: 10 }}>
                  {guardando ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <><i className="ti ti-check" /> Confirmar venta</>}
                </button>
              </>
          }
        </div>
      </div>
    </div>
  )
}

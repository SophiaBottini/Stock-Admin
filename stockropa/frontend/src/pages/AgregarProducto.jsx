import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../hooks/useApi'
import toast from 'react-hot-toast'

const CATEGORIAS = [
  { value: 'RM', label: 'Remeras' }, { value: 'JN', label: 'Jeans' },
  { value: 'BZ', label: 'Buzos' }, { value: 'VS', label: 'Vestidos' },
  { value: 'CK', label: 'Camperas' }, { value: 'PL', label: 'Polleras' },
  { value: 'AC', label: 'Accesorios' }, { value: 'ZP', label: 'Calzado' },
]
const TALLES = ['XS','S','M','L','XL','XXL','34','36','38','40','42','44','Único']

export default function AgregarProducto() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ id_unico: '', nombre: '', categoria: '', descripcion: '', precio_venta: '', precio_costo: '', stock_minimo: 5 })
  const [tallesActivos, setTallesActivos] = useState({})
  const [stockLocales, setStockLocales] = useState({ l1: 0, l2: 0, l3: 0 })
  const [imagen, setImagen] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [idManual, setIdManual] = useState(false)

  const onCat = (cat) => {
    const prefix = cat
    if (!idManual) {
      setForm(f => ({ ...f, categoria: CATEGORIAS.find(c => c.value === cat)?.label || cat, id_unico: prefix + '00X' }))
    } else {
      setForm(f => ({ ...f, categoria: CATEGORIAS.find(c => c.value === cat)?.label || cat }))
    }
  }

  const toggleTalle = t => {
    setTallesActivos(prev => {
      const next = { ...prev }
      if (next[t] !== undefined) delete next[t]
      else next[t] = 0
      return next
    })
  }

  const onImagen = e => {
    const file = e.target.files[0]
    if (!file) return
    setImagen(file)
    setPreview(URL.createObjectURL(file))
  }

  const guardar = async e => {
    e.preventDefault()
    if (!form.id_unico || !form.nombre || !form.categoria || !form.precio_venta)
      return toast.error('Completá los campos obligatorios')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('talles', JSON.stringify(tallesActivos))
      if (imagen) fd.append('imagen', imagen)
      await api.post('/productos', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Producto guardado correctamente')
      navigate('/stock')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <button className="btn" onClick={() => navigate('/stock')}><i className="ti ti-arrow-left" /></button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500 }}>Agregar producto</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Completá los datos del nuevo producto</p>
        </div>
      </div>

      <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Identificación */}
        <div className="card">
          <div className="card-title"><i className="ti ti-tag" style={{ color: 'var(--green)', marginRight: 6 }} />Identificación</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fg">
              <label>Categoría <span className="req">*</span></label>
              <select className="input" onChange={e => onCat(e.target.value)} required>
                <option value="">Seleccioná</option>
                {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>ID único <span className="req">*</span></label>
              <input className="input" value={form.id_unico} onChange={e => { setIdManual(true); setForm(f => ({ ...f, id_unico: e.target.value.toUpperCase() })) }} placeholder="ej: RM002" maxLength={8} required />
            </div>
            <div className="fg" style={{ gridColumn: 'span 2' }}>
              <label>Nombre <span className="req">*</span></label>
              <input className="input" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="ej: Remera rayada manga larga" required />
            </div>
            <div className="fg">
              <label>Precio de venta <span className="req">*</span></label>
              <input className="input" type="number" min="0" value={form.precio_venta} onChange={e => setForm(f => ({ ...f, precio_venta: e.target.value }))} placeholder="0" required />
            </div>
            <div className="fg">
              <label>Precio de costo</label>
              <input className="input" type="number" min="0" value={form.precio_costo} onChange={e => setForm(f => ({ ...f, precio_costo: e.target.value }))} placeholder="0" />
            </div>
            <div className="fg">
              <label>Stock mínimo (alerta)</label>
              <input className="input" type="number" min="0" value={form.stock_minimo} onChange={e => setForm(f => ({ ...f, stock_minimo: e.target.value }))} />
            </div>
            <div className="fg">
              <label>Descripción</label>
              <input className="input" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Opcional" />
            </div>
          </div>
        </div>

        {/* Imagen */}
        <div className="card">
          <div className="card-title"><i className="ti ti-photo" style={{ color: 'var(--green)', marginRight: 6 }} />Imagen</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 16, alignItems: 'start' }}>
            <label style={{ border: '1px dashed var(--border)', borderRadius: 8, padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: 'var(--bg3)', display: 'block' }}>
              <input type="file" accept="image/*" onChange={onImagen} style={{ display: 'none' }} />
              <i className="ti ti-cloud-upload" style={{ fontSize: 28, color: 'var(--text3)', display: 'block', marginBottom: 6 }} />
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>Arrastrá o hacé clic para subir</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>JPG, PNG · máx 5 MB</div>
            </label>
            <div style={{ width: 140, height: 140, background: 'var(--bg3)', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {preview
                ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <i className="ti ti-shirt" style={{ fontSize: 40, color: 'var(--text3)' }} />
              }
            </div>
          </div>
        </div>

        {/* Talles */}
        <div className="card">
          <div className="card-title"><i className="ti ti-ruler-measure" style={{ color: 'var(--green)', marginRight: 6 }} />Talles y stock inicial</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
            {TALLES.map(t => (
              <div key={t}>
                <div onClick={() => toggleTalle(t)} style={{
                  padding: '6px 4px', borderRadius: 6, border: `1px solid ${tallesActivos[t] !== undefined ? 'var(--green)' : 'var(--border)'}`,
                  background: tallesActivos[t] !== undefined ? 'var(--green-light)' : 'var(--bg3)',
                  color: tallesActivos[t] !== undefined ? 'var(--green-dark)' : 'var(--text2)',
                  textAlign: 'center', fontSize: 12, fontWeight: 500, cursor: 'pointer', marginBottom: 4
                }}>{t}</div>
                <input type="number" min="0" value={tallesActivos[t] ?? ''} disabled={tallesActivos[t] === undefined}
                  onChange={e => setTallesActivos(p => ({ ...p, [t]: parseInt(e.target.value) || 0 }))}
                  style={{ width: '100%', padding: '4px 6px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg3)', fontSize: 12, textAlign: 'center', opacity: tallesActivos[t] === undefined ? .4 : 1 }}
                  placeholder="0" />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn" onClick={() => navigate('/stock')}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <><i className="ti ti-check" /> Guardar producto</>}
          </button>
        </div>
      </form>
    </div>
  )
}

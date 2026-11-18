import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { Avatar } from '../components/Layout.jsx';
import { ageOf, initials, useStore } from '../store.jsx';

export default function Patients() {
  const { state } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const t = q.toLowerCase();
  const rows = state.patients
    .filter((p) => !t || [p.name, p.mrn, p.phone, p.insurance].some((f) => f.toLowerCase().includes(t)))
    .sort((x, y) => x.name.localeCompare(y.name));

  return (
    <>
      <div className="page-head">
        <div><h1>Pacientes</h1><p className="muted">{state.patients.length} pacientes registrados</p></div>
        <div className="search search-inline"><Icon name="search" size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar por nombre, HC, obra social…" /></div>
      </div>
      <section className="card table-card">
        <table className="table hover">
          <thead><tr><th>Paciente</th><th>HC</th><th>Edad</th><th>Cobertura</th><th>Teléfono</th><th>Diagnósticos</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} onClick={() => nav(`/pacientes/${p.id}`)}>
                <td><span className="row"><Avatar text={initials(p.name)} size="sm" /> <strong>{p.name}</strong></span></td>
                <td className="mono">{p.mrn}</td>
                <td>{ageOf(p.birth).long}</td>
                <td>{p.insurance}</td>
                <td className="nowrap">{p.phone}</td>
                <td>{p.conditions.map((c) => c.name).join(', ') || <span className="muted">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

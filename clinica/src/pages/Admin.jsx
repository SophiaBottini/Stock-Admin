import { Link } from 'react-router-dom';
import { DOCTORS, PRICES } from '../data/seed.js';
import { doctorById, money, useStore } from '../store.jsx';
import { Stat } from './Today.jsx';

const tone = { 'Fuera de rango': 'red', Revisar: 'amber', Normal: 'green', Pendiente: 'amber', Dispensada: 'green', Listo: 'blue', 'En proceso': '', Revisado: 'green' };

function usePatient() {
  const { state } = useStore();
  return (id) => state.patients.find((p) => p.id === id);
}

export function Labs() {
  const { state, dispatch } = useStore();
  const patient = usePatient();
  return (
    <>
      <div className="page-head"><div><h1>Laboratorio</h1><p className="muted">Resultados recibidos y estudios en curso</p></div></div>
      <section className="card table-card">
        <table className="table">
          <thead><tr><th>Paciente</th><th>Estudio</th><th>Recibido</th><th>Resultado</th><th>Estado</th><th /></tr></thead>
          <tbody>
            {state.labs.map((l) => (
              <tr key={l.id}>
                <td><Link className="link" to={`/pacientes/${l.patientId}`}>{patient(l.patientId).name}</Link></td>
                <td>{l.test}</td><td className="nowrap">{l.date}</td>
                <td>{l.flag === '—' ? <span className="muted">—</span> : <span className={`chip chip-${tone[l.flag]}`}>{l.flag}</span>}</td>
                <td><span className={`chip chip-${tone[l.status]}`}>{l.status}</span></td>
                <td className="right">{l.status === 'Listo' && <button className="btn btn-sm" onClick={() => dispatch({ type: 'REVIEW_LAB', id: l.id })}>Marcar revisado</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

export function Pharmacy() {
  const { state, dispatch } = useStore();
  const patient = usePatient();
  return (
    <>
      <div className="page-head"><div><h1>Farmacia</h1><p className="muted">Recetas emitidas hoy</p></div></div>
      <section className="card table-card">
        <table className="table">
          <thead><tr><th>Emitida</th><th>Paciente</th><th>Medicamento</th><th>Indicación</th><th>Profesional</th><th>Estado</th><th /></tr></thead>
          <tbody>
            {state.prescriptions.map((r) => (
              <tr key={r.id}>
                <td className="nowrap">{r.date}</td>
                <td><Link className="link" to={`/pacientes/${r.patientId}`}>{patient(r.patientId).name}</Link></td>
                <td><strong>{r.drug}</strong></td><td>{r.dose}</td><td className="nowrap">{doctorById(r.doctorId).name}</td>
                <td><span className={`chip chip-${tone[r.status]}`}>{r.status}</span></td>
                <td className="right">{r.status === 'Pendiente' && <button className="btn btn-sm" onClick={() => dispatch({ type: 'SET_RX_STATUS', id: r.id, status: 'Dispensada' })}>Dispensar</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

export function Billing() {
  const { state } = useStore();
  const patient = usePatient();
  const done = state.appointments.filter((a) => a.status === 'done' || a.status === 'in_progress');
  const rows = done.map((a) => {
    const p = patient(a.patientId);
    const total = PRICES[a.mode] || PRICES.presencial;
    const covered = p.insurance === 'Particular' ? 0 : Math.round(total * 0.8);
    return { a, p, total, covered, copay: total - covered };
  });
  const sum = (k) => rows.reduce((s, r) => s + r[k], 0);
  return (
    <>
      <div className="page-head"><div><h1>Facturación</h1><p className="muted">Prestaciones del día listas para liquidar</p></div></div>
      <div className="stats stats-3">
        <Stat icon="receipt" tone="blue" label="Facturado hoy" value={money(sum('total'))} hint={`${rows.length} prestaciones`} />
        <Stat icon="building" tone="violet" label="A cobrar a obras sociales" value={money(sum('covered'))} hint="se liquida a fin de mes" />
        <Stat icon="check" tone="green" label="Cobrado en caja" value={money(sum('copay'))} hint="coseguros y particulares" />
      </div>
      <section className="card table-card">
        <table className="table">
          <thead><tr><th>Hora</th><th>Paciente</th><th>Cobertura</th><th>Prestación</th><th className="right">Total</th><th className="right">Obra social</th><th className="right">Paciente</th></tr></thead>
          <tbody>
            {rows.map(({ a, p, total, covered, copay }) => (
              <tr key={a.id}>
                <td>{a.start}</td><td>{p.name}</td><td>{p.insurance}</td><td>{a.mode === 'tele' ? 'Teleconsulta' : 'Consulta'} · {doctorById(a.doctorId).specialty}</td>
                <td className="right">{money(total)}</td><td className="right">{money(covered)}</td><td className="right">{money(copay)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

export function Reports() {
  const { state } = useStore();
  const appts = state.appointments.filter((a) => a.mode !== 'break');
  const byDoc = DOCTORS.map((d) => {
    const mine = appts.filter((a) => a.doctorId === d.id);
    return { d, total: mine.length, done: mine.filter((a) => a.status === 'done').length, noShow: mine.filter((a) => a.status === 'no_show').length };
  });
  const max = Math.max(...byDoc.map((r) => r.total));
  const byIns = Object.entries(appts.reduce((m, a) => {
    const ins = state.patients.find((p) => p.id === a.patientId).insurance.split(' ')[0];
    m[ins] = (m[ins] || 0) + 1; return m;
  }, {})).sort((x, y) => y[1] - x[1]);
  return (
    <>
      <div className="page-head"><div><h1>Reportes</h1><p className="muted">Resumen del día</p></div></div>
      <div className="two-col">
        <section className="card">
          <div className="card-head"><h3>Turnos por profesional</h3></div>
          {byDoc.map(({ d, total, done, noShow }) => (
            <div key={d.id} className="bar-row">
              <span>{d.name}<small>{done} atendidos · {noShow} ausentes</small></span>
              <div className="bar"><i className={`tone-${d.color}`} style={{ width: `${(total / max) * 100}%` }} /></div>
              <strong>{total}</strong>
            </div>
          ))}
        </section>
        <section className="card">
          <div className="card-head"><h3>Pacientes por cobertura</h3></div>
          {byIns.map(([ins, n]) => (
            <div key={ins} className="bar-row">
              <span>{ins}</span>
              <div className="bar"><i className="tone-blue" style={{ width: `${(n / byIns[0][1]) * 100}%` }} /></div>
              <strong>{n}</strong>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Schedule from '../components/Schedule.jsx';
import { DOCTORS } from '../data/seed.js';
import { doctorById, toMin, useStore } from '../store.jsx';
import { STATUS, StatusChip } from './PatientRecord.jsx';

export default function Appointments() {
  const { state, dispatch } = useStore();
  const [doc, setDoc] = useState('all');
  const [status, setStatus] = useState('all');
  const doctors = doc === 'all' ? DOCTORS : DOCTORS.filter((d) => d.id === doc);
  const rows = state.appointments
    .filter((a) => a.mode !== 'break' && (doc === 'all' || a.doctorId === doc) && (status === 'all' || a.status === status))
    .sort((x, y) => toMin(x.start) - toMin(y.start));
  const patient = (id) => state.patients.find((p) => p.id === id);

  return (
    <>
      <div className="page-head">
        <div><h1>Turnos</h1><p className="muted">Agenda completa del día por profesional</p></div>
        <div className="row">
          <select className="select" value={doc} onChange={(e) => setDoc(e.target.value)}>
            <option value="all">Todos los profesionales</option>
            {DOCTORS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Todos los estados</option>
            {Object.entries(STATUS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
      </div>
      <Schedule from="08:00" to="14:00" doctors={doctors} />
      <section className="card table-card">
        <table className="table">
          <thead><tr><th>Hora</th><th>Paciente</th><th>Profesional</th><th>Motivo</th><th>Cobertura</th><th>Estado</th><th /></tr></thead>
          <tbody>
            {rows.map((a) => {
              const p = patient(a.patientId);
              return (
                <tr key={a.id}>
                  <td className="nowrap">{a.start}–{a.end}</td>
                  <td><Link className="link" to={`/pacientes/${p.id}`}>{p.name}</Link></td>
                  <td className="nowrap">{doctorById(a.doctorId).name}</td>
                  <td>{a.mode === 'tele' ? `Teleconsulta · ${a.reason}` : a.reason}</td>
                  <td>{p.insurance}</td>
                  <td><StatusChip status={a.status} /></td>
                  <td className="right nowrap">
                    {a.status === 'booked' && a.mode === 'presencial' && <button className="btn btn-sm" onClick={() => dispatch({ type: 'CHECK_IN', id: a.id })}>Llegó</button>}
                    {a.status === 'booked' && <button className="btn btn-sm btn-ghost" onClick={() => dispatch({ type: 'SET_STATUS', id: a.id, status: 'no_show' })}>Ausente</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}

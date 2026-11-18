import { useState } from 'react';
import Modal from './Modal.jsx';
import { DOCTORS } from '../data/seed.js';
import { toMin, toTime, useStore } from '../store.jsx';

const INSURANCES = ['Particular', 'OSDE 210', 'OSDE 310', 'Swiss Medical', 'Galeno', 'Medifé', 'PAMI', 'IOMA'];

export default function AppointmentModal({ onClose, preset = {} }) {
  const { state, dispatch } = useStore();
  const [f, setF] = useState({
    patientId: preset.patientId || '', newName: '', newBirth: '', newInsurance: 'Particular', newPhone: '',
    doctorId: preset.doctorId || 'd1', start: preset.start || '13:30', duration: 30, reason: '', mode: 'presencial',
  });
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const isNew = f.patientId === 'new';

  const submit = (e) => {
    e.preventDefault();
    if (!f.patientId) return setError('Elegí un paciente.');
    if (isNew && (!f.newName.trim() || !f.newBirth)) return setError('Completá nombre y fecha de nacimiento del paciente nuevo.');
    if (!/^\d{2}:\d{2}$/.test(f.start)) return setError('Hora inválida.');
    const s = toMin(f.start); const en = s + Number(f.duration);
    const clash = state.appointments.find((a) => a.doctorId === f.doctorId && a.status !== 'no_show' && toMin(a.start) < en && s < toMin(a.end));
    if (clash) return setError(`Se superpone con un turno de ${clash.start} a ${clash.end}.`);

    let patientId = f.patientId;
    if (isNew) {
      patientId = `p${Date.now()}`;
      dispatch({ type: 'ADD_PATIENT', patient: {
        id: patientId, name: f.newName.trim(), sex: '—', birth: f.newBirth, insurance: f.newInsurance, phone: f.newPhone || '—',
        mrn: `HC-${String(state.patients.length + 1000).padStart(5, '0')}`, blood: null, conditions: [], allergies: [], meds: [], vitals: null, hba1c: [], labs: [], lastVisit: null,
      } });
    }
    dispatch({ type: 'ADD_APPOINTMENT', appt: {
      id: `a${Date.now()}`, doctorId: f.doctorId, patientId, start: f.start, end: toTime(en),
      reason: f.reason.trim() || 'Consulta', status: 'booked', mode: f.mode, checkIn: null, ticket: null,
    } });
    onClose();
  };

  return (
    <Modal title="Nuevo turno" onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Cancelar</button><button className="btn btn-primary" form="appt-form">Guardar turno</button></>}>
      <form id="appt-form" className="form" onSubmit={submit}>
        <label>Paciente
          <select value={f.patientId} onChange={set('patientId')} autoFocus>
            <option value="">Seleccionar…</option>
            <option value="new">+ Paciente nuevo</option>
            {[...state.patients].sort((x, y) => x.name.localeCompare(y.name)).map((p) => <option key={p.id} value={p.id}>{p.name} · {p.mrn}</option>)}
          </select>
        </label>
        {isNew && (
          <div className="form-grid">
            <label>Nombre y apellido<input value={f.newName} onChange={set('newName')} /></label>
            <label>Fecha de nacimiento<input type="date" value={f.newBirth} onChange={set('newBirth')} /></label>
            <label>Obra social<select value={f.newInsurance} onChange={set('newInsurance')}>{INSURANCES.map((i) => <option key={i}>{i}</option>)}</select></label>
            <label>Teléfono<input value={f.newPhone} onChange={set('newPhone')} placeholder="11 5555-0000" /></label>
          </div>
        )}
        <div className="form-grid">
          <label>Profesional
            <select value={f.doctorId} onChange={set('doctorId')}>{DOCTORS.map((d) => <option key={d.id} value={d.id}>{d.name} · {d.specialty}</option>)}</select>
          </label>
          <label>Modalidad
            <select value={f.mode} onChange={set('mode')}><option value="presencial">Presencial</option><option value="tele">Teleconsulta</option></select>
          </label>
          <label>Hora<input type="time" step="300" value={f.start} onChange={set('start')} /></label>
          <label>Duración
            <select value={f.duration} onChange={set('duration')}>{[15, 20, 30, 40, 45, 60].map((m) => <option key={m} value={m}>{m} min</option>)}</select>
          </label>
        </div>
        <label>Motivo<input value={f.reason} onChange={set('reason')} placeholder="Ej.: control, fiebre, vacunación" /></label>
        {error && <p className="error">{error}</p>}
      </form>
    </Modal>
  );
}

import Modal from './Modal.jsx';
import { doctorById, toMin, useStore } from '../store.jsx';

export default function CheckInModal({ onClose }) {
  const { state, dispatch } = useStore();
  const pending = state.appointments
    .filter((a) => a.status === 'booked' && a.mode === 'presencial')
    .sort((x, y) => toMin(x.start) - toMin(y.start));
  const patient = (id) => state.patients.find((p) => p.id === id);

  return (
    <Modal title="Registrar llegada" onClose={onClose}>
      <p className="muted small">Al registrar la llegada, el paciente recibe un número y entra en la sala de espera del profesional.</p>
      <ul className="pick-list">
        {pending.length === 0 && <li className="muted">No quedan turnos presenciales por recibir.</li>}
        {pending.map((a) => {
          const p = patient(a.patientId);
          const d = doctorById(a.doctorId);
          return (
            <li key={a.id}>
              <div><strong>{a.start} · {p.name}</strong><small>{d.name} · {a.reason} · {p.insurance}</small></div>
              <button className="btn btn-primary btn-sm" onClick={() => dispatch({ type: 'CHECK_IN', id: a.id })}>Llegó</button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

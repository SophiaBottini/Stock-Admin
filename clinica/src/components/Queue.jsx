import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { ageOf, doctorById, isChild, nowTime, toMin, useStore } from '../store.jsx';

export default function Queue() {
  const { state, dispatch, me } = useStore();
  const now = toMin(nowTime());
  const patient = (id) => state.patients.find((p) => p.id === id);
  const serving = state.appointments.find((a) => a.doctorId === me.id && a.status === 'in_progress');
  const servingP = serving && patient(serving.patientId);

  const waiting = state.appointments.filter((a) => a.status === 'waiting').sort((x, y) => toMin(x.checkIn) - toMin(y.checkIn));
  const tele = state.appointments.filter((a) => a.mode === 'tele' && a.status === 'booked');
  const list = [...waiting, ...tele];
  const myWaiting = waiting.some((a) => a.doctorId === me.id);

  return (
    <section className="card queue">
      <div className="card-head">
        <h2>Sala de espera</h2>
        <div className="spacer" />
        <span className="pill pill-amber">{waiting.length} esperando</span>
      </div>

      <div className="serving">
        <small>Atendiendo ahora · {me.room}</small>
        {serving ? (
          <>
            <div className="ticket">{serving.ticket}</div>
            <div className="serving-row">
              <Link to={`/pacientes/${servingP.id}`}>{servingP.name}</Link>
              <span className="chip">desde {serving.checkIn}</span>
            </div>
          </>
        ) : (
          <div className="ticket ticket-empty">Consultorio libre</div>
        )}
        <button className="btn btn-glass" disabled={!serving && !myWaiting} onClick={() => dispatch({ type: 'CALL_NEXT', doctorId: me.id })}>
          {serving ? (myWaiting ? 'Finalizar y llamar al siguiente' : 'Finalizar consulta') : 'Llamar al siguiente'} <Icon name="arrowright" size={14} />
        </button>
      </div>

      <ul className="queue-list">
        {list.length === 0 && <li className="muted small">No hay pacientes esperando.</li>}
        {list.map((a) => {
          const p = patient(a.patientId);
          const d = doctorById(a.doctorId);
          const mins = a.checkIn ? now - toMin(a.checkIn) : null;
          return (
            <li key={a.id}>
              <span className="q-ticket">{a.ticket}</span>
              <Link to={`/pacientes/${p.id}`} className="q-main">
                <strong>{p.name}{isChild(p) ? `, ${ageOf(p.birth).label}` : ''}</strong>
                <small>{a.mode === 'tele' ? `Teleconsulta · ${a.start}` : `${a.reason} · ${p.insurance}`}{d.id !== me.id && ` · ${d.specialty}`}</small>
              </Link>
              {a.mode === 'tele'
                ? <span className="q-wait online"><strong>Online</strong><small>link enviado</small></span>
                : <span className={`q-wait ${mins >= 20 ? 'late' : ''}`}><strong>{mins} min</strong><small>esperando</small></span>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

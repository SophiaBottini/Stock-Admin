import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Schedule from '../components/Schedule.jsx';
import Queue from '../components/Queue.jsx';
import CheckInModal from '../components/CheckInModal.jsx';
import { nowTime, toMin, useStore } from '../store.jsx';

const greeting = () => {
  const h = Number(nowTime().slice(0, 2));
  return h < 12 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
};

export function Stat({ icon, tone, label, value, unit, hint }) {
  return (
    <div className="card stat">
      <div className="stat-label"><span className={`stat-icon tone-${tone}`}><Icon name={icon} size={14} /></span>{label}</div>
      <div className="stat-value">{value}{unit && <small>{unit}</small>}</div>
      <div className="stat-hint">{hint}</div>
    </div>
  );
}

export default function Today() {
  const { state, me } = useStore();
  const [checkIn, setCheckIn] = useState(false);
  const now = toMin(nowTime());
  const appts = state.appointments.filter((a) => a.mode !== 'break');
  const seen = appts.filter((a) => a.status === 'done').length;
  const waiting = appts.filter((a) => a.status === 'waiting');
  const noShows = appts.filter((a) => a.status === 'no_show').length;
  const avgWait = waiting.length ? Math.round(waiting.reduce((s, a) => s + (now - toMin(a.checkIn)), 0) / waiting.length) : 0;
  const firstName = me.name.split(' ')[1];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{greeting()}, {me.name.split(' ')[0]} {firstName}</h1>
          <p className="muted">{appts.length} pacientes con turno hoy · {waiting.length} en sala de espera</p>
        </div>
        <button className="btn" onClick={() => setCheckIn(true)}><Icon name="usercheck" size={15} /> Registrar llegada</button>
      </div>

      <div className="stats">
        <Stat icon="calendar" tone="blue" label="Turnos" value={appts.length} hint="+4 sin turno previo" />
        <Stat icon="check" tone="green" label="Atendidos" value={seen} hint={`${Math.round((seen / appts.length) * 100)} % del día`} />
        <Stat icon="sofa" tone="amber" label="Esperando" value={waiting.length} hint="en la sala ahora" />
        <Stat icon="timer" tone="violet" label="Espera promedio" value={avgWait} unit="min" hint="objetivo: menos de 20" />
        <Stat icon="usermiss" tone="red" label="Ausentes" value={noShows} hint="recordatorio por WhatsApp enviado" />
      </div>

      <div className="today-grid">
        <Schedule action={<Link to="/turnos" className="link">Ver semana</Link>} />
        <Queue />
      </div>
      {checkIn && <CheckInModal onClose={() => setCheckIn(false)} />}
    </>
  );
}

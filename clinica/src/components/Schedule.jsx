import { useNavigate } from 'react-router-dom';
import { DOCTORS } from '../data/seed.js';
import { ageOf, isChild, nowTime, toMin, toTime, useStore } from '../store.jsx';
import { Avatar } from './Layout.jsx';

const PPM = 1.55; // píxeles por minuto

export default function Schedule({ from = '08:00', to = '13:30', doctors = DOCTORS, title = 'Agenda', action }) {
  const { state } = useStore();
  const nav = useNavigate();
  const start = toMin(from);
  const end = toMin(to);
  const now = toMin(nowTime());
  const hours = [];
  for (let m = Math.ceil(start / 60) * 60; m < end; m += 60) hours.push(m);
  const height = (end - start) * PPM;
  const patient = (id) => state.patients.find((p) => p.id === id);

  return (
    <section className="card schedule">
      <div className="card-head">
        <h2>{title}</h2>
        <span className="pill">{new Date().toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        <div className="spacer" />
        {action}
      </div>
      <div className="schedule-scroll">
        <div className="schedule-inner" style={{ '--cols': doctors.length }}>
          <div className="sched-head">
            <div />
            {doctors.map((d) => (
              <div key={d.id} className="sched-doc">
                <Avatar text={d.initials} color={d.color} />
                <div><strong>{d.name}</strong><small>{d.specialty} · {d.room}</small></div>
              </div>
            ))}
          </div>
          <div className="sched-body" style={{ height }}>
            {hours.map((m) => (
              <div key={m} className="hour-line" style={{ top: (m - start) * PPM }}><span>{toTime(m)}</span></div>
            ))}
            {doctors.map((d, i) => (
              <div key={d.id} className="sched-col" style={{ gridColumn: i + 2 }}>
                {state.appointments
                  .filter((a) => a.doctorId === d.id && toMin(a.end) > start && toMin(a.start) < end)
                  .map((a) => {
                    const top = (Math.max(toMin(a.start), start) - start) * PPM;
                    const h = (Math.min(toMin(a.end), end) - Math.max(toMin(a.start), start)) * PPM - 4;
                    const p = patient(a.patientId);
                    const tone = a.mode === 'break' ? 'break' : a.mode === 'tele' ? 'amber' : d.color;
                    const name = a.mode === 'break' ? a.reason : p ? `${p.name}${isChild(p) ? `, ${ageOf(p.birth).label}` : ''}` : '—';
                    return (
                      <button key={a.id} type="button"
                        className={`appt tone-${tone} st-${a.status}`}
                        style={{ top, height: h }}
                        disabled={!p}
                        onClick={() => p && nav(`/pacientes/${p.id}`)}
                        title={p ? `${name} · ${a.start}–${a.end} · ${a.reason}` : a.reason}>
                        <strong>{name}{a.status === 'no_show' && <em> · ausente</em>}</strong>
                        {h > 34 && <small>{a.start}–{a.end} · {a.mode === 'tele' ? 'Teleconsulta' : a.mode === 'break' ? '' : a.reason}</small>}
                      </button>
                    );
                  })}
              </div>
            ))}
            {now > start && now < end && (
              <div className="now-line" style={{ top: (now - start) * PPM }}><span>{nowTime()}</span></div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import { Avatar } from '../components/Layout.jsx';
import { ageOf, doctorById, fmtDate, initials, nowTime, toMin, useStore } from '../store.jsx';

function Vital({ icon, label, value, unit, status, tone }) {
  return (
    <div className="card vital">
      <div className="stat-label"><Icon name={icon} size={13} /> {label}</div>
      <div className="vital-value">{value}<small>{unit}</small></div>
      <span className={`chip chip-${tone}`}>{status}</span>
    </div>
  );
}

function TrendChart({ data, target = 7 }) {
  const W = 300, H = 150, pad = { l: 28, r: 10, t: 10, b: 22 };
  const min = 6, max = 10;
  const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / (data.length - 1);
  const y = (v) => pad.t + ((max - v) * (H - pad.t - pad.b)) / (max - min);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.value)}`).join(' ');
  const area = `${line} L${x(data.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
  const last = data[data.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="trend" role="img" aria-label={`HbA1c bajó de ${data[0].value} a ${last.value} %`}>
      <defs>
        <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity=".22" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[10, 8, 6].map((v) => (
        <g key={v}><line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="grid" /><text x={0} y={y(v) + 3} className="axis">{v} %</text></g>
      ))}
      <line x1={pad.l} x2={W - pad.r} y1={y(target)} y2={y(target)} className="target" />
      <text x={pad.l + 4} y={y(target) + 12} className="target-label">Objetivo {String(target).replace('.', ',')} %</text>
      <path d={area} fill="url(#area)" />
      <path d={line} className="trend-line" />
      {data.map((d, i) => <text key={d.label} x={x(i)} y={H - 4} textAnchor="middle" className="axis">{d.label}</text>)}
      <circle cx={x(data.length - 1)} cy={y(last.value)} r="4.5" className="trend-dot" />
    </svg>
  );
}

function LabBar({ lab }) {
  // Escala: rango normal ocupa el 25–70 % de la barra
  const span = lab.max - lab.min;
  const pos = Math.max(3, Math.min(97, 25 + ((lab.value - lab.min) / span) * 45));
  const high = lab.value > lab.max;
  const far = lab.value > lab.max + span * 0.3;
  return (
    <div className="lab-row">
      <div><strong>{lab.name}</strong><small>{lab.range}</small></div>
      <span className={`lab-val ${far ? 'bad' : high ? 'warn' : ''}`}>{String(lab.value).replace('.', ',')}{lab.unit}</span>
      <div className="lab-bar"><i style={{ left: `${pos}%` }} /></div>
    </div>
  );
}

const SOAP = [['s', 'Subjetivo'], ['o', 'Objetivo'], ['a', 'Evaluación'], ['p', 'Plan']];
const EMPTY_NOTE = { s: '', o: '', a: '', p: '', tags: [] };

function ConsultNote({ patientId }) {
  const { state, dispatch } = useStore();
  const [note, setNote] = useState(state.notes[patientId] || EMPTY_NOTE);
  const [saved, setSaved] = useState(true);
  const timer = useRef();

  useEffect(() => { setNote(state.notes[patientId] || EMPTY_NOTE); }, [patientId]); // eslint-disable-line

  const change = (k, v) => {
    const next = { ...note, [k]: v };
    setNote(next); setSaved(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { dispatch({ type: 'SAVE_NOTE', patientId, note: next }); setSaved(true); }, 600);
  };

  return (
    <section className="card note">
      <div className="card-head">
        <h3>Evolución</h3>
        <span className="chip chip-green">{saved ? 'Borrador · guardado' : 'Guardando…'}</span>
        <div className="spacer" />
        <button className="link" onClick={() => change('s', note.s || 'Motivo de consulta: ')}>Usar plantilla</button>
      </div>
      {SOAP.map(([k, label]) => (
        <label key={k} className="soap-row">
          <span className="soap-key" title={label}>{k.toUpperCase()}</span>
          <textarea rows={1} value={note[k]} placeholder={label} onChange={(e) => change(k, e.target.value)}
            onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} />
        </label>
      ))}
      {note.tags?.length > 0 && <div className="tags">{note.tags.map((t, i) => <span key={t} className={`chip ${i === note.tags.length - 1 ? 'chip-green' : ''}`}>{t}</span>)}</div>}
    </section>
  );
}

function PrescriptionModal({ patient, onClose }) {
  const { dispatch, me } = useStore();
  const [drug, setDrug] = useState('');
  const [dose, setDose] = useState('');
  const allergyHit = patient.allergies.find((a) => drug.toLowerCase().includes(a.name.toLowerCase().slice(0, 5)) || (a.name === 'Penicilina' && /amoxi|ampi/i.test(drug)));
  const save = (e) => {
    e.preventDefault();
    if (!drug.trim()) return;
    dispatch({ type: 'ADD_PRESCRIPTION', rx: { id: `rx${Date.now()}`, patientId: patient.id, doctorId: me.id, drug: drug.trim(), dose: dose.trim() || 'Según indicación', date: `Hoy ${nowTime()}`, status: 'Pendiente' } });
    onClose();
  };
  return (
    <Modal title={`Receta · ${patient.name}`} onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Cancelar</button><button className="btn btn-dark" form="rx-form">Emitir receta</button></>}>
      <form id="rx-form" className="form" onSubmit={save}>
        <label>Medicamento<input autoFocus value={drug} onChange={(e) => setDrug(e.target.value)} placeholder="Ej.: Amlodipina 10 mg" /></label>
        <label>Indicación<input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="Ej.: 1 vez al día, a la mañana" /></label>
        {allergyHit && <p className="error"><Icon name="alert" size={14} /> Atención: el paciente es alérgico a {allergyHit.name}.</p>}
        <p className="muted small">La receta queda en Farmacia como pendiente de dispensar.</p>
      </form>
    </Modal>
  );
}

export default function PatientRecord() {
  const { id } = useParams();
  const { state } = useStore();
  const [rx, setRx] = useState(false);
  const p = state.patients.find((x) => x.id === id);
  if (!p) return <div className="card pad">Paciente no encontrado. <Link to="/pacientes" className="link">Volver</Link></div>;

  const age = ageOf(p.birth);
  const visits = state.appointments.filter((a) => a.patientId === p.id);
  const today = visits[0];
  const doctor = today && doctorById(today.doctorId);
  const meds = [...p.meds, ...state.prescriptions.filter((r) => r.patientId === p.id && r.date.startsWith('Hoy')).map((r) => ({ name: r.drug, dose: r.dose, color: 'green', isNew: true }))];
  const drop = p.hba1c.length > 1 ? (p.hba1c[p.hba1c.length - 1].value - p.hba1c[0].value).toFixed(1).replace('.', ',') : null;
  const bpHigh = p.vitals && Number(p.vitals.bp.split('/')[0]) >= 130;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Historia clínica</h1>
          <p className="muted">{today ? `Turno de hoy ${today.start} · ${doctor.room} · ${today.reason}` : 'Sin turno hoy'}{today?.status === 'in_progress' && ` · en consulta desde ${today.checkIn}`}</p>
        </div>
        <div className="row">
          <Link className="btn" to="/turnos"><Icon name="history" size={15} /> Consultas anteriores</Link>
          <button className="btn btn-dark" onClick={() => setRx(true)}><Icon name="edit" size={15} /> Escribir receta</button>
        </div>
      </div>

      <div className="record-grid">
        <aside className="record-side">
          <section className="card profile">
            <div className="profile-avatar"><Avatar text={initials(p.name)} size="xl" />{today?.status === 'in_progress' && <i className="online" />}</div>
            <h2>{p.name}</h2>
            <p className="muted small">{p.sex === 'F' ? 'Mujer' : p.sex === 'M' ? 'Varón' : '—'} · {age.long} · nac. {fmtDate(p.birth)}</p>
            <div className="tags center">
              <span className="chip chip-blue">{p.mrn}</span>
              <span className="chip chip-violet">{p.insurance}</span>
              {p.blood && <span className="chip">{p.blood}</span>}
            </div>
            <dl className="facts">
              <dt>Diagnósticos</dt>
              <dd>{p.conditions.length ? p.conditions.map((c) => <div key={c.code}>{c.name} · {c.code}</div>) : <span className="muted">Sin registrar</span>}</dd>
              <dt>Última visita</dt><dd>{p.lastVisit ? fmtDate(p.lastVisit) : '—'}</dd>
              <dt>Teléfono</dt><dd>{p.phone}</dd>
            </dl>
            {p.allergies.map((a) => (
              <div key={a.name} className="allergy"><Icon name="alert" size={15} /><div><strong>Alergia: {a.name}</strong><small>{a.detail}</small></div></div>
            ))}
          </section>

          <section className="card meds">
            <h3>Medicación actual</h3>
            {meds.length === 0 && <p className="muted small">Sin medicación registrada.</p>}
            {meds.map((m) => (
              <div key={m.name} className="med">
                <span className={`med-icon tone-${m.color}`}><Icon name="pill" size={14} /></span>
                <div><strong>{m.name}{m.isNew && <em className="chip chip-green">nueva</em>}</strong><small>{m.dose}</small></div>
              </div>
            ))}
          </section>
        </aside>

        <div className="record-main">
          {p.vitals ? (
            <div className="vitals">
              <Vital icon="heart" label="Presión" value={p.vitals.bp} unit="mmHg" status={bpHigh ? 'Levemente alta' : 'Normal'} tone={bpHigh ? 'amber' : 'green'} />
              <Vital icon="pulse" label="Frec. cardíaca" value={p.vitals.hr} unit="lpm" status="Normal" tone="green" />
              <Vital icon="thermo" label="Temperatura" value={String(p.vitals.temp).replace('.', ',')} unit="°C" status="Normal" tone="green" />
              <Vital icon="drop" label="SpO₂" value={p.vitals.spo2} unit="%" status="Normal" tone="green" />
              <Vital icon="scale" label="IMC" value={String(p.vitals.bmi).replace('.', ',')} unit="" status={`${String(p.vitals.weight).replace('.', ',')} kg`} tone="amber" />
            </div>
          ) : (
            <div className="card pad muted">Todavía no se cargaron signos vitales en esta visita.</div>
          )}

          {(p.hba1c.length > 0 || p.labs.length > 0) && (
            <div className="two-col">
              {p.hba1c.length > 0 && (
                <section className="card">
                  <div className="card-head"><h3>Evolución HbA1c</h3><div className="spacer" /><span className="chip chip-green">{drop} desde enero</span></div>
                  <TrendChart data={p.hba1c} />
                </section>
              )}
              {p.labs.length > 0 && (
                <section className="card">
                  <div className="card-head"><h3>Laboratorio · hoy</h3><div className="spacer" /><Link to="/laboratorio" className="link">Informe completo</Link></div>
                  {p.labs.map((l) => <LabBar key={l.name} lab={l} />)}
                </section>
              )}
            </div>
          )}

          <ConsultNote patientId={p.id} />

          {visits.length > 0 && (
            <section className="card card-pad">
              <div className="card-head"><h3>Turnos de hoy</h3></div>
              <table className="table">
                <tbody>
                  {visits.sort((x, y) => toMin(x.start) - toMin(y.start)).map((v) => (
                    <tr key={v.id}><td>{v.start}–{v.end}</td><td>{doctorById(v.doctorId).name}</td><td>{v.reason}</td><td><StatusChip status={v.status} /></td></tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      </div>
      {rx && <PrescriptionModal patient={p} onClose={() => setRx(false)} />}
    </>
  );
}

export const STATUS = {
  done: ['Atendido', 'green'], in_progress: ['En consulta', 'blue'], waiting: ['En espera', 'amber'], booked: ['Reservado', ''], no_show: ['Ausente', 'red'],
};
export const StatusChip = ({ status }) => <span className={`chip chip-${STATUS[status][1]}`}>{STATUS[status][0]}</span>;

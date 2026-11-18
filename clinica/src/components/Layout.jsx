import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Icon, { Logo } from './Icon.jsx';
import { CLINIC, DOCTORS } from '../data/seed.js';
import { ageOf, nowTime, todayLabel, useStore } from '../store.jsx';
import AppointmentModal from './AppointmentModal.jsx';

const NAV = [
  { section: 'Clínica', items: [
    { to: '/', icon: 'grid', label: 'Hoy', end: true },
    { to: '/turnos', icon: 'calendar', label: 'Turnos' },
    { to: '/pacientes', icon: 'record', label: 'Pacientes' },
    { to: '/laboratorio', icon: 'flask', label: 'Laboratorio', badge: 'labs' },
    { to: '/farmacia', icon: 'pill', label: 'Farmacia' },
  ] },
  { section: 'Administración', items: [
    { to: '/facturacion', icon: 'receipt', label: 'Facturación' },
    { to: '/reportes', icon: 'chart', label: 'Reportes' },
  ] },
];

export const Avatar = ({ text, color = 'peach', size = 'md' }) => <span className={`avatar avatar-${color} avatar-${size}`}>{text}</span>;

function Search() {
  const { state } = useStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ref.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return state.patients.filter((p) => [p.name, p.mrn, p.phone].some((f) => f.toLowerCase().includes(t))).slice(0, 6);
  }, [q, state.patients]);

  const go = (p) => { nav(`/pacientes/${p.id}`); setQ(''); setOpen(false); ref.current?.blur(); };

  return (
    <div className="search">
      <Icon name="search" size={15} />
      <input ref={ref} value={q} placeholder="Buscar paciente, HC o teléfono"
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) go(results[0]); if (e.key === 'Escape') ref.current.blur(); }} />
      <kbd>⌘K</kbd>
      {open && q && (
        <div className="search-results">
          {results.length === 0 && <div className="muted small pad">Sin resultados</div>}
          {results.map((p) => (
            <button key={p.id} onMouseDown={() => go(p)}>
              <strong>{p.name}</strong>
              <span className="muted small">{p.mrn} · {ageOf(p.birth).long} · {p.insurance}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { state, me } = useStore();
  const [newAppt, setNewAppt] = useState(false);
  const [menu, setMenu] = useState(false);
  const pendingLabs = state.labs.filter((l) => l.status === 'Listo').length;

  return (
    <div className={`shell ${menu ? 'menu-open' : ''}`}>
      <aside className="sidebar" onClick={() => setMenu(false)}>
        <div className="brand"><Logo /> <span>Alivia</span></div>
        <button className="clinic-switch">
          <span className="clinic-icon"><Icon name="building" /></span>
          <span className="clinic-text"><strong>{CLINIC.name}</strong><small>{CLINIC.city}</small></span>
          <Icon name="chevrons" size={14} />
        </button>

        {NAV.map((s) => (
          <nav key={s.section}>
            <div className="nav-label">{s.section}</div>
            {s.items.map((i) => (
              <NavLink key={i.to} to={i.to} end={i.end} className="nav-item">
                <Icon name={i.icon} /> <span>{i.label}</span>
                {i.badge === 'labs' && pendingLabs > 0 && <em className="badge">{pendingLabs}</em>}
              </NavLink>
            ))}
          </nav>
        ))}

        <div className="sidebar-spacer" />
        <div className="on-duty">
          <span className="small">De turno ahora</span>
          <div className="stack">{DOCTORS.map((d) => <Avatar key={d.id} text={d.initials} color={d.color} />)}</div>
          <strong>{DOCTORS.length} médicos · {CLINIC.nurses} enfermeros</strong>
          <span className="small">Consultorios 1–3 abiertos hasta {CLINIC.closesAt}</span>
        </div>
        <div className="me">
          <Avatar text={me.initials} />
          <div><strong>{me.name}</strong><small>{me.specialty}</small></div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setMenu(true)} aria-label="Menú"><Icon name="menu" /></button>
          <Search />
          <div className="topbar-right">
            <span className="date"><Icon name="calendar" size={15} /> <strong>{todayLabel()}</strong> · {nowTime()}</span>
            <button className="icon-btn" aria-label="Mensajes"><Icon name="chat" /></button>
            <button className="icon-btn dot" aria-label="Notificaciones"><Icon name="bell" /></button>
            <button className="btn btn-primary" onClick={() => setNewAppt(true)}><Icon name="calendar" size={15} /> <span>Nuevo turno</span></button>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
      {menu && <div className="scrim" onClick={() => setMenu(false)} />}
      {newAppt && <AppointmentModal onClose={() => setNewAppt(false)} />}
    </div>
  );
}

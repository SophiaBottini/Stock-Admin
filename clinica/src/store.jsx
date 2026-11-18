import { createContext, useContext, useEffect, useReducer } from 'react';
import { APPOINTMENTS, CURRENT_DOCTOR_ID, DOCTORS, LAB_ORDERS, NOTES, PATIENTS, PRESCRIPTIONS } from './data/seed.js';

const KEY = 'alivia-demo-v1';

// Reloj de demo: la agenda de ejemplo está armada alrededor de las 10:24.
// Para usar la hora real, poner DEMO_CLOCK = null.
export const DEMO_CLOCK = '10:24';

export const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export const toTime = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
export const nowTime = () => {
  if (DEMO_CLOCK) return DEMO_CLOCK;
  const d = new Date();
  return toTime(d.getHours() * 60 + d.getMinutes());
};

const initial = () => ({
  patients: PATIENTS,
  appointments: APPOINTMENTS,
  notes: NOTES,
  prescriptions: PRESCRIPTIONS,
  labs: LAB_ORDERS,
});

const nextTicket = (appointments, doctorId) => {
  const prefix = DOCTORS.find((d) => d.id === doctorId).prefix;
  const nums = appointments.filter((a) => a.ticket?.startsWith(prefix)).map((a) => Number(a.ticket.split('-')[1]));
  return `${prefix}-${String(Math.max(0, ...nums) + 1).padStart(3, '0')}`;
};

function reducer(state, action) {
  const upd = (id, fn) => state.appointments.map((a) => (a.id === id ? fn(a) : a));
  switch (action.type) {
    case 'ADD_PATIENT':
      return { ...state, patients: [...state.patients, action.patient] };
    case 'ADD_APPOINTMENT': {
      const appt = { ...action.appt, ticket: action.appt.mode === 'tele' ? nextTicket(state.appointments, action.appt.doctorId) : null };
      return { ...state, appointments: [...state.appointments, appt] };
    }
    case 'CHECK_IN':
      return {
        ...state,
        appointments: upd(action.id, (a) => ({
          ...a, status: 'waiting', checkIn: nowTime(), ticket: a.ticket || nextTicket(state.appointments, a.doctorId),
        })),
      };
    case 'SET_STATUS':
      return { ...state, appointments: upd(action.id, (a) => ({ ...a, status: action.status })) };
    case 'CALL_NEXT': {
      // Termina la consulta actual del médico y llama al siguiente en la sala de espera
      const mine = state.appointments.filter((a) => a.doctorId === action.doctorId);
      const current = mine.find((a) => a.status === 'in_progress');
      const next = mine.filter((a) => a.status === 'waiting').sort((x, y) => toMin(x.checkIn) - toMin(y.checkIn))[0];
      return {
        ...state,
        appointments: state.appointments.map((a) => {
          if (current && a.id === current.id) return { ...a, status: 'done' };
          if (next && a.id === next.id) return { ...a, status: 'in_progress' };
          return a;
        }),
      };
    }
    case 'SAVE_NOTE':
      return { ...state, notes: { ...state.notes, [action.patientId]: action.note } };
    case 'ADD_PRESCRIPTION':
      return { ...state, prescriptions: [action.rx, ...state.prescriptions] };
    case 'SET_RX_STATUS':
      return { ...state, prescriptions: state.prescriptions.map((r) => (r.id === action.id ? { ...r, status: action.status } : r)) };
    case 'REVIEW_LAB':
      return { ...state, labs: state.labs.map((l) => (l.id === action.id ? { ...l, status: 'Revisado' } : l)) };
    case 'RESET':
      return initial();
    default:
      return state;
  }
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* sin almacenamiento disponible */ }
    return initial();
  });
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignorar */ }
  }, [state]);
  return <Ctx.Provider value={{ state, dispatch, me: DOCTORS.find((d) => d.id === CURRENT_DOCTOR_ID) }}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);

// Utilidades de presentación
export const doctorById = (id) => DOCTORS.find((d) => d.id === id);

export function ageOf(birth) {
  const b = new Date(birth);
  const now = new Date();
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  return months < 24 ? { n: months, label: `${months} m`, long: `${months} meses` } : { n: Math.floor(months / 12), label: `${Math.floor(months / 12)} a`, long: `${Math.floor(months / 12)} años` };
}

export const isChild = (p) => ageOf(p.birth).n < 14 || ageOf(p.birth).label.endsWith('m');

export const initials = (name) => name.replace(/^(Dra?\.)\s*/, '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export const fmtDate = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-AR', opts);

export const todayLabel = () =>
  new Date().toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });

export const money = (n) => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

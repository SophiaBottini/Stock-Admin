// Datos de demostración. Al conectar un backend (Supabase), esto se reemplaza
// por consultas reales; la forma de los objetos ya es la de las tablas.

export const CLINIC = {
  name: 'Centro Médico Palermo',
  city: 'CABA',
  closesAt: '21:00',
  nurses: 2,
};

export const DOCTORS = [
  { id: 'd1', name: 'Dra. Sofía Benítez', initials: 'SB', specialty: 'Clínica médica', room: 'Consultorio 1', color: 'blue', prefix: 'A' },
  { id: 'd2', name: 'Dr. Martín Ríos', initials: 'MR', specialty: 'Pediatría', room: 'Consultorio 2', color: 'green', prefix: 'B' },
  { id: 'd3', name: 'Dra. Lucía Herrera', initials: 'LH', specialty: 'Dermatología', room: 'Consultorio 3', color: 'violet', prefix: 'C' },
];

// Médico con sesión iniciada en la demo
export const CURRENT_DOCTOR_ID = 'd1';

const basic = (id, name, sex, birth, insurance, phone) => ({
  id, name, sex, birth, insurance, phone,
  mrn: `HC-${String(1000 + Number(id.slice(1))).padStart(5, '0')}`,
  blood: null, conditions: [], allergies: [], meds: [], vitals: null, hba1c: [], labs: [], lastVisit: null,
});

export const PATIENTS = [
  {
    ...basic('p1', 'Rosa Acosta', 'F', '1980-03-12', 'OSDE 310', '11 5555-0101'),
    mrn: 'HC-00873',
    blood: '0+',
    conditions: [
      { name: 'Diabetes tipo 2', code: 'E11.9' },
      { name: 'Hipertensión', code: 'I10' },
    ],
    allergies: [{ name: 'Penicilina', detail: 'Urticaria, informada en 2019' }],
    meds: [
      { name: 'Metformina 500 mg', dose: '2 veces al día, después de comer', color: 'blue' },
      { name: 'Amlodipina 5 mg', dose: '1 vez al día, a la mañana', color: 'violet' },
      { name: 'Atorvastatina 10 mg', dose: '1 vez al día, a la noche', color: 'amber' },
    ],
    vitals: { bp: '138/86', hr: 82, temp: 36.8, spo2: 98, bmi: 26.7, weight: 68.4 },
    hba1c: [
      { label: 'Ene', value: 8.9 },
      { label: 'Abr', value: 8.4 },
      { label: 'Jul', value: 7.8 },
      { label: 'Oct', value: 7.2 },
    ],
    labs: [
      { name: 'Glucemia en ayunas', range: '70 – 99 mg/dL', value: 142, min: 70, max: 99, unit: '' },
      { name: 'HbA1c', range: 'menor a 7,0 %', value: 7.2, min: 4, max: 7, unit: '%' },
      { name: 'LDL', range: 'menor a 100 mg/dL', value: 118, min: 50, max: 100, unit: '' },
      { name: 'Creatinina', range: '0,5 – 1,1 mg/dL', value: 0.9, min: 0.5, max: 1.1, unit: '' },
    ],
    lastVisit: '2026-07-14',
  },
  basic('p2', 'Mateo Fernández', 'M', '1991-06-02', 'Swiss Medical', '11 5555-0102'),
  basic('p3', 'Valentina Gómez', 'F', '1987-11-23', 'Galeno', '11 5555-0103'),
  basic('p4', 'Julián Pereyra', 'M', '1965-01-30', 'PAMI', '11 5555-0104'),
  basic('p5', 'Camila Sosa', 'F', '1999-09-14', 'OSDE 210', '11 5555-0105'),
  basic('p6', 'Diego Romero', 'M', '1978-04-08', 'Particular', '11 5555-0106'),
  basic('p7', 'Federico Molina', 'M', '1983-12-19', 'Swiss Medical', '11 5555-0107'),
  basic('p8', 'Andrea Castro', 'F', '1972-05-27', 'Medifé', '11 5555-0108'),
  basic('p9', 'Tomás Medina', 'M', '2022-07-11', 'OSDE 210', '11 5555-0109'),
  basic('p10', 'Emma Ruiz', 'F', '2019-02-03', 'Galeno', '11 5555-0110'),
  basic('p11', 'Benjamín Díaz', 'M', '2024-05-21', 'IOMA', '11 5555-0111'),
  basic('p12', 'Olivia Torres', 'F', '2021-08-09', 'Swiss Medical', '11 5555-0112'),
  basic('p13', 'Lautaro Vega', 'M', '2026-02-01', 'OSDE 310', '11 5555-0113'),
  basic('p14', 'Mía Álvarez', 'F', '2023-03-17', 'Particular', '11 5555-0114'),
  basic('p15', 'Clara Núñez', 'F', '2003-10-05', 'Medifé', '11 5555-0115'),
  basic('p16', 'Hernán Gutiérrez', 'M', '1969-08-22', 'PAMI', '11 5555-0116'),
  basic('p17', 'Paula Domínguez', 'F', '1994-01-12', 'OSDE 210', '11 5555-0117'),
  basic('p18', 'Laura Ibáñez', 'F', '1988-06-29', 'Swiss Medical', '11 5555-0118'),
  basic('p19', 'Daniel Suárez', 'M', '1975-03-03', 'Galeno', '11 5555-0119'),
];

// status: done | in_progress | waiting | booked | no_show
// mode: presencial | tele | break
const a = (id, doctorId, patientId, start, end, reason, status, extra = {}) => ({
  id, doctorId, patientId, start, end, reason, status, mode: 'presencial', checkIn: null, ticket: null, ...extra,
});

export const APPOINTMENTS = [
  // Dra. Benítez — Clínica médica
  a('a1', 'd1', 'p2', '08:00', '08:30', 'Control de presión', 'done'),
  a('a2', 'd1', 'p3', '08:30', '09:00', 'Resultados de análisis', 'no_show'),
  a('a3', 'd1', 'p4', '09:00', '09:30', 'Control anual', 'done'),
  a('a4', 'd1', 'p5', '09:45', '10:15', 'Certificado de aptitud física', 'done'),
  a('a5', 'd1', 'p1', '10:15', '10:45', 'Control de diabetes', 'in_progress', { checkIn: '10:02', ticket: 'A-014' }),
  a('a6', 'd1', 'p6', '10:45', '11:15', 'Tos hace 3 días', 'waiting', { checkIn: '10:12', ticket: 'A-015' }),
  a('a7', 'd1', 'p7', '11:15', '11:45', 'Seguimiento', 'booked', { mode: 'tele', ticket: 'A-016' }),
  a('b1', 'd1', null, '12:00', '13:00', 'Almuerzo', 'booked', { mode: 'break' }),
  a('a8', 'd1', 'p8', '13:00', '13:30', 'Dolor lumbar', 'booked'),
  // Dr. Ríos — Pediatría
  a('a9', 'd2', 'p9', '08:15', '08:45', 'Vacunación', 'done'),
  a('a10', 'd2', 'p10', '09:00', '09:30', 'Control de niño sano', 'done'),
  a('a11', 'd2', 'p11', '09:40', '10:10', 'Control de crecimiento', 'done'),
  a('a12', 'd2', 'p12', '10:20', '10:50', 'Erupción en la piel', 'waiting', { checkIn: '10:15', ticket: 'B-009' }),
  a('a13', 'd2', 'p13', '11:00', '11:30', 'Vacunación', 'waiting', { checkIn: '10:22', ticket: 'B-010' }),
  a('a14', 'd2', 'p14', '11:30', '12:00', 'Fiebre', 'booked'),
  a('b2', 'd2', null, '12:15', '13:00', 'Almuerzo', 'booked', { mode: 'break' }),
  // Dra. Herrera — Dermatología
  a('a15', 'd3', 'p15', '09:00', '09:40', 'Control de acné', 'done'),
  a('a16', 'd3', 'p16', '09:50', '10:20', 'Extracción de verruga', 'done'),
  a('a17', 'd3', 'p17', '10:30', '11:00', 'Control de lunar', 'waiting', { checkIn: '10:18', ticket: 'C-004' }),
  a('a18', 'd3', 'p18', '11:10', '11:50', 'Consulta láser', 'booked'),
  a('a19', 'd3', 'p19', '12:00', '12:30', 'Seguimiento', 'booked', { mode: 'tele' }),
];

export const NOTES = {
  p1: {
    s: 'Se siente bien. Hormigueo en ambos pies a la noche. Se olvida la dosis nocturna de Metformina ~2 veces por semana.',
    o: 'PA 138/86, IMC 26,7. HbA1c 7,2 % (7,8 % en julio). Test de monofilamento normal.',
    a: 'DM2 en mejoría, todavía fuera de objetivo. Hipertensión, control limítrofe.',
    p: 'Subir Amlodipina a 10 mg. Recordatorio para la dosis nocturna. Repetir HbA1c en enero.',
    tags: ['E11.9 · I10', 'Próximo control 18 ene 2027', 'Examen de pie hecho'],
  },
};

export const PRESCRIPTIONS = [
  { id: 'rx1', patientId: 'p4', doctorId: 'd1', drug: 'Enalapril 10 mg', dose: '1 vez al día', date: 'Hoy 09:24', status: 'Dispensada' },
  { id: 'rx2', patientId: 'p9', doctorId: 'd2', drug: 'Paracetamol jarabe 120 mg/5 ml', dose: '5 ml cada 8 h si hay fiebre', date: 'Hoy 08:40', status: 'Pendiente' },
  { id: 'rx3', patientId: 'p15', doctorId: 'd3', drug: 'Adapaleno gel 0,1 %', dose: 'Aplicar a la noche', date: 'Hoy 09:38', status: 'Pendiente' },
];

export const LAB_ORDERS = [
  { id: 'l1', patientId: 'p1', test: 'Perfil metabólico', status: 'Listo', flag: 'Fuera de rango', date: 'Hoy 08:10' },
  { id: 'l2', patientId: 'p4', test: 'Hemograma completo', status: 'Listo', flag: 'Normal', date: 'Hoy 09:50' },
  { id: 'l3', patientId: 'p8', test: 'Orina completa', status: 'Listo', flag: 'Revisar', date: 'Ayer 17:20' },
  { id: 'l4', patientId: 'p16', test: 'Biopsia de piel', status: 'Listo', flag: 'Revisar', date: 'Ayer 15:05' },
  { id: 'l5', patientId: 'p6', test: 'Radiografía de tórax', status: 'En proceso', flag: '—', date: 'Hoy 10:20' },
];

export const PRICES = { presencial: 18000, tele: 12000 };

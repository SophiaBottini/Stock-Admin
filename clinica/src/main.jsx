import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './store.jsx';
import Layout from './components/Layout.jsx';
import Today from './pages/Today.jsx';
import Appointments from './pages/Appointments.jsx';
import Patients from './pages/Patients.jsx';
import PatientRecord from './pages/PatientRecord.jsx';
import { Billing, Labs, Pharmacy, Reports } from './pages/Admin.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Today />} />
            <Route path="turnos" element={<Appointments />} />
            <Route path="pacientes" element={<Patients />} />
            <Route path="pacientes/:id" element={<PatientRecord />} />
            <Route path="laboratorio" element={<Labs />} />
            <Route path="farmacia" element={<Pharmacy />} />
            <Route path="facturacion" element={<Billing />} />
            <Route path="reportes" element={<Reports />} />
            <Route path="*" element={<Today />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </React.StrictMode>,
);

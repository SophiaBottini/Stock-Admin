# Alivia — Software de gestión para clínicas y consultorios

Demo funcional (frontend) de un sistema para clínicas: agenda por profesional, sala de espera con números, historia clínica, recetas, laboratorio, facturación por obra social y reportes.

> "Alivia" es un nombre provisorio. Cambiarlo en `index.html`, `src/components/Layout.jsx` y el logo en `src/components/Icon.jsx`.

## Pantallas
- **Hoy**: métricas del día, agenda por médico con la hora actual marcada, y la sala de espera ("Finalizar y llamar al siguiente").
- **Turnos**: agenda completa + tabla filtrable; marcar llegada o ausente.
- **Pacientes** e **Historia clínica**: signos vitales, evolución de HbA1c, laboratorio, medicación, alergias y nota de evolución (SOAP) con autoguardado.
- **Escribir receta**: avisa si el medicamento choca con una alergia; la receta pasa a **Farmacia**.
- **Laboratorio**, **Facturación** (lo que paga la obra social vs. el paciente) y **Reportes**.
- Búsqueda global con ⌘K / Ctrl+K. Funciona en celular.

## Cómo correrlo
```bash
cd clinica
npm install
npm run dev     # http://localhost:5173
```
Para publicarlo en Vercel: importar el repo y elegir `clinica` como *Root Directory*.

## Datos
Por ahora los datos son de demostración (`src/data/seed.js`) y los cambios se guardan en el navegador (localStorage).
El reloj está fijo en 10:24 para que la demo siempre se vea "en pleno día"; para usar la hora real, poner `DEMO_CLOCK = null` en `src/store.jsx`.

## Pendiente para venderlo como producto
1. Backend + base de datos (Supabase, igual que StockRopa) con varias clínicas por cuenta.
2. Inicio de sesión con roles (médico, recepción, administración).
3. Recordatorios de turno por WhatsApp y turnos online para pacientes.
4. Receta electrónica válida según la normativa vigente y facturación electrónica (AFIP/ARCA).
5. Seguridad de datos de salud: cifrado, copias de seguridad, registro de accesos y cumplimiento de la Ley 25.326 de datos personales.

# Manual de Operación: XV Gabriella Sofía

**Sitio principal:** `index.html` — invitación tipo 4 (parallax, galería, RSVP). Opcionalmente conecta a un API en Node (`server/`) para correo (Resend), WhatsApp (Twilio) y registro de confirmaciones.

**App interactiva anterior** (pestañas, juego, etc.): abre `evento_interactivo.html` (usa `css/evento-app.css` y `js/app-router.js`).

## 🔑 Acceso de Invitados
El flujo actual usa **link único por invitado** (`?t=...`), validado por backend en `GET /api/guest/session`.

## 📂 Organización del Código
- `js/screens/`: Contiene cada página de la app. Para agregar una sección nueva, crea un archivo aquí y regístralo en `js/app.js`.
- `js/components/`: Componentes globales como el `BottomNav`.
- `css/style.css`: Control total del diseño. Modifica las variables en `:root` para cambiar los colores globales.

## 🚀 Despliegue en Vercel
Esta app es estática (HTML/JS/CSS). Para desplegarla:
1. Sube esta carpeta a un repositorio de **GitHub**.
2. Conecta tu cuenta de **Vercel** a ese repositorio.
3. Vercel detectará automáticamente que es un sitio estático y le asignará una URL.

## API + Resend + Twilio + Excel
1. En `server/`: `cp .env.example .env`, completa variables y `npm install && npm start`.
2. En `index.html`, meta `xv-api-base`: por ejemplo `http://localhost:3001/api` (mismo origen en producción vía proxy o URL pública).
3. RSVP: el front hace `POST .../rsvp`; si falla o el meta está vacío, se abre WhatsApp como antes.
4. Panel admin seguro: abre `admin.html`, inicia sesión con `ADMIN_USERNAME` + `ADMIN_PASSWORD`, y sube Excel desde ahí.
5. Importación de invitados: `POST /api/admin/import-guests` con sesión Bearer (o `x-admin-token` legado).
6. Generación de links únicos: `POST /api/admin/generate-links`.
7. Envío batch (Twilio): `POST /api/admin/send-invitations` (admite `dryRun`).

## 🎮 Gaby Crush
El juego es funcional. Puedes ajustar la dificultad (número de colores) o el tamaño del tablero en el constructor de `js/screens/Game.js`.

---

**¡Disfruta organizando los XV de Gabriella Sofía! ✨**

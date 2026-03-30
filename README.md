# Manual de Operación: SPA XV Gabriella Sofía

Esta aplicación es una **Landing Page / SPA Modular** construida en Vanilla JavaScript, diseñada para ser rápida, segura y estéticamente premium.

## 🔑 Acceso de Invitados
Para entrar a la aplicación, los invitados deben usar:
- **Teléfono**: 10 dígitos (ej. `5512345678`)
- **Código**: `GABY15`

> [!TIP]
> Puedes agregar más teléfonos permitidos editando el archivo `js/utils/auth.js`.

## 📂 Organización del Código
- `js/screens/`: Contiene cada página de la app. Para agregar una sección nueva, crea un archivo aquí y regístralo en `js/app.js`.
- `js/components/`: Componentes globales como el `BottomNav`.
- `css/style.css`: Control total del diseño. Modifica las variables en `:root` para cambiar los colores globales.

## 🚀 Despliegue en Vercel
Esta app es estática (HTML/JS/CSS). Para desplegarla:
1. Sube esta carpeta a un repositorio de **GitHub**.
2. Conecta tu cuenta de **Vercel** a ese repositorio.
3. Vercel detectará automáticamente que es un sitio estático y le asignará una URL.

## 📧 Integración con Resend
Para habilitar el envío de correos cuando alguien confirme en el RSVP:
1. Crea una cuenta en [Resend.com](https://resend.com).
2. Deberás crear un endpoint (en Vercel Functions o un servidor PHP/Node).
3. En `js/screens/RSVP.js`, sustituye la lógica del botón por una llamada a tu API.

Ejemplo de llamada API:
```javascript
fetch('/api/send-email', {
  method: 'POST',
  body: JSON.stringify({ to: 'admin@email.com', body: 'Nuevo RSVP de ' + phone })
});
```

## 🎮 Gaby Crush
El juego es funcional. Puedes ajustar la dificultad (número de colores) o el tamaño del tablero en el constructor de `js/screens/Game.js`.

---

**¡Disfruta organizando los XV de Gabriella Sofía! ✨**

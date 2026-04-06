# Supabase DB Setup

## 1) Variables requeridas (`server/.env`)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`

## 2) Crear estructura SQL
1. Abre Supabase SQL Editor del proyecto.
2. Ejecuta `server/db/001_init_supabase.sql`.

## 3) Tablas creadas
- `public.guests`
- `public.rsvps`
- `public.invitation_sends`
- `public.delivery_webhook_events`

## 4) Vistas para panel
- `public.v_guest_admin_status`
- `public.v_dashboard_metrics`

## 5) Nota de seguridad
RLS queda habilitado y sin politicas abiertas para `anon`. El backend debe usar `SUPABASE_SERVICE_ROLE_KEY`.

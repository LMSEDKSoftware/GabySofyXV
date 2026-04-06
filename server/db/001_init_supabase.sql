-- Esquema base XV (Supabase / Postgres)
-- Ejecutar en Supabase SQL Editor.

create extension if not exists pgcrypto;

-- Trigger helper para updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Invitados (fuente de verdad).
create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_e164 text not null unique,
  email text,
  approved_seats integer not null default 1 check (approved_seats >= 0),
  confirmed_seats integer default 0 check (confirmed_seats >= 0),
  attendance_status text not null default 'pending'
    check (attendance_status in ('pending', 'confirmed', 'declined')),
  rsvp_note text,
  -- Token/hash para acceso por link unico.
  personal_token_hash text,
  token_expires_at timestamptz,
  -- URL completa de invitacion (admin); se actualiza al emitir token.
  personal_invite_url text,
  -- Metadatos de envios.
  last_sent_at timestamptz,
  last_delivery_status text
    check (last_delivery_status in ('queued', 'sent', 'delivered', 'undelivered', 'failed')),
  -- Texto listo para WhatsApp (admin); se persiste por invitado.
  invitation_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_guests_updated_at
before update on public.guests
for each row
execute function public.set_updated_at();

create index if not exists idx_guests_attendance_status on public.guests(attendance_status);
create index if not exists idx_guests_last_delivery_status on public.guests(last_delivery_status);

-- Historial de RSVPs (auditable). El ultimo registro vigente por invitado se marca con is_latest=true.
create table if not exists public.rsvps (
  id bigserial primary key,
  guest_id uuid not null references public.guests(id) on delete cascade,
  attendance text not null check (attendance in ('si', 'no')),
  confirmed_seats integer check (confirmed_seats >= 0),
  congrat_note text,
  source text not null default 'web' check (source in ('web', 'admin', 'import', 'api')),
  is_latest boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_rsvps_guest_id on public.rsvps(guest_id);
create index if not exists idx_rsvps_latest on public.rsvps(guest_id, is_latest);

-- Envio de invitaciones y recordatorios (WhatsApp/email) por invitado.
create table if not exists public.invitation_sends (
  id bigserial primary key,
  guest_id uuid not null references public.guests(id) on delete cascade,
  send_type text not null default 'invitation' check (send_type in ('invitation', 'reminder', 'ack')),
  channel text not null check (channel in ('whatsapp', 'email')),
  provider text not null check (provider in ('twilio', 'resend', 'manual')),
  twilio_message_sid text,
  resend_email_id text,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'delivered', 'undelivered', 'failed')),
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  sent_at timestamptz not null default now(),
  delivered_at timestamptz
);

create unique index if not exists uq_invitation_sends_twilio_sid
  on public.invitation_sends(twilio_message_sid)
  where twilio_message_sid is not null;

create index if not exists idx_invitation_sends_guest_status
  on public.invitation_sends(guest_id, status, sent_at desc);

-- Webhooks crudos de Twilio para trazabilidad.
create table if not exists public.delivery_webhook_events (
  id bigserial primary key,
  provider text not null default 'twilio',
  message_sid text,
  status text,
  event_payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now()
);

create index if not exists idx_delivery_webhook_sid on public.delivery_webhook_events(message_sid);

-- Vista para panel admin.
create or replace view public.v_guest_admin_status as
select
  g.id,
  g.full_name,
  g.phone_e164,
  g.email,
  g.approved_seats,
  g.confirmed_seats,
  g.attendance_status,
  g.rsvp_note,
  g.last_sent_at,
  g.last_delivery_status,
  (
    select max(s.sent_at)
    from public.invitation_sends s
    where s.guest_id = g.id
  ) as last_any_send_at,
  (
    select max(r.created_at)
    from public.rsvps r
    where r.guest_id = g.id and r.is_latest = true
  ) as last_rsvp_at
from public.guests g;

-- Vista de metricas para el dashboard.
create or replace view public.v_dashboard_metrics as
select
  count(*)::int as total_guests,
  count(*) filter (where attendance_status = 'confirmed')::int as confirmed_guests,
  count(*) filter (where attendance_status = 'pending')::int as pending_guests,
  count(*) filter (where attendance_status = 'declined')::int as declined_guests,
  coalesce(sum(approved_seats), 0)::int as approved_seats_total,
  coalesce(sum(confirmed_seats), 0)::int as confirmed_seats_total
from public.guests;

-- RLS habilitada para reforzar que el cliente anon no lea/escriba sin politicas explicitas.
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.invitation_sends enable row level security;
alter table public.delivery_webhook_events enable row level security;

-- Politicas minimas:
-- Backend con service_role ignora RLS. Para anon, no abrimos nada por defecto.
-- (Agregar politicas especificas cuando definamos el endpoint publico final.)

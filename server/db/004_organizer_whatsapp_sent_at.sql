-- Marca manual del organizador: "ya envié el WhatsApp a este invitado".
-- Ejecutar en Supabase SQL Editor.

alter table public.guests
  add column if not exists organizer_whatsapp_sent_at timestamptz;

comment on column public.guests.organizer_whatsapp_sent_at is
  'Marca manual (panel admin): cuándo el organizador confirmó haber enviado el WhatsApp.';

create index if not exists idx_guests_organizer_whatsapp_sent_at
  on public.guests (organizer_whatsapp_sent_at)
  where organizer_whatsapp_sent_at is not null;

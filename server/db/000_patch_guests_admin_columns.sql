-- Ejecutar TODO este bloque en Supabase → SQL Editor (una sola vez).
-- Corrige: "Could not find the 'invitation_message' column of 'guests' in the schema cache"

alter table public.guests
  add column if not exists invitation_message text;

alter table public.guests
  add column if not exists personal_invite_url text;

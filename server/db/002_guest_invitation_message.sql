-- Ejecutar en Supabase SQL Editor si la tabla guests ya existía sin esta columna.
alter table public.guests
  add column if not exists invitation_message text;

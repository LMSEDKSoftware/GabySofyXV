-- Backfill de estado RSVP en guests desde rsvps.
-- Útil si se re-importó Excel y se "reseteó" attendance_status/confirmed_seats/rsvp_note.
--
-- Ejecutar en Supabase SQL Editor.
-- Nota: no toca organizer_whatsapp_sent_at ni invitation_message.

with latest as (
  -- Preferimos registros marcados como latest; si hay más de uno, tomamos el más reciente.
  select distinct on (r.guest_id)
    r.guest_id,
    r.attendance,
    r.confirmed_seats,
    r.congrat_note,
    r.created_at
  from public.rsvps r
  where r.is_latest = true
  order by r.guest_id, r.created_at desc, r.id desc
)
update public.guests g
set
  attendance_status = case latest.attendance
    when 'si' then 'confirmed'
    when 'no' then 'declined'
    else g.attendance_status
  end,
  confirmed_seats = coalesce(latest.confirmed_seats, g.confirmed_seats, 0),
  rsvp_note = nullif(latest.congrat_note, '')
from latest
where g.id = latest.guest_id;


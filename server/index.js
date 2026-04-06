import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import { randomBytes, createHash, timingSafeEqual } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Carpeta raíz del repo (padre de server/) — invitación estática sin exponer server/.env */
const REPO_ROOT = path.resolve(__dirname, '..');

function parseOrigins() {
  const raw = process.env.CORS_ORIGINS || '';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function b64urlEncode(obj) {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64url');
}

function b64urlDecode(str) {
  return JSON.parse(Buffer.from(str, 'base64url').toString('utf8'));
}

function signAdminJwtLike(payload, secret) {
  const head = b64urlEncode({ alg: 'HS256', typ: 'JWT' });
  const body = b64urlEncode(payload);
  const sig = createHash('sha256').update(`${head}.${body}.${secret}`).digest('base64url');
  return `${head}.${body}.${sig}`;
}

function verifyAdminJwtLike(token, secret) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return { ok: false };
  const [head, body, sig] = parts;
  const expected = createHash('sha256').update(`${head}.${body}.${secret}`).digest('base64url');
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false };
  const payload = b64urlDecode(body);
  if (!payload?.exp || Date.now() >= Number(payload.exp) * 1000) return { ok: false };
  return { ok: true, payload };
}

function extractAdminToken(req) {
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  return bearer || req.headers['x-admin-token'] || '';
}

function adminAuth(req, res, next) {
  const legacyToken = process.env.ADMIN_TOKEN || '';
  const adminSecret = process.env.ADMIN_AUTH_SECRET || '';
  const got = extractAdminToken(req);

  if (!got) return res.status(401).json({ error: 'No autorizado' });

  if (legacyToken && got === legacyToken) {
    req.admin = { sub: 'legacy-admin', username: 'admin-legacy' };
    return next();
  }

  if (!adminSecret) return res.status(503).json({ error: 'ADMIN_AUTH_SECRET no configurado' });
  const verified = verifyAdminJwtLike(got, adminSecret);
  if (!verified.ok) return res.status(401).json({ error: 'Sesión inválida o expirada' });
  req.admin = verified.payload;
  next();
}

function normalizePhoneE164(raw) {
  const clean = String(raw || '').replace(/[^\d+]/g, '');
  if (!clean) return '';
  if (clean.startsWith('+')) return clean;
  if (clean.length >= 10) return `+52${clean.slice(-10)}`;
  return `+${clean}`;
}

function normalizeGuestRow(row) {
  const lower = {};
  Object.keys(row).forEach((k) => (lower[String(k).trim().toLowerCase()] = row[k]));
  const fullName = lower.nombre ?? lower.name ?? lower.invitado ?? lower['nombre completo'] ?? '';
  const seats =
    lower['num. pases'] ??
    lower['num pases'] ??
    lower['núm. pases'] ??
    lower.pases ??
    lower.passes ??
    lower.boletos ??
    lower.cantidad ??
    '';
  const phone = lower.telefono ?? lower.tel ?? lower.phone ?? lower.celular ?? '';
  const email = lower.email ?? lower.correo ?? lower.mail ?? '';
  const approved = Number.parseInt(String(seats || '1'), 10);
  return {
    full_name: String(fullName || '').trim(),
    phone_e164: normalizePhoneE164(phone),
    email: String(email || '').trim() || null,
    approved_seats: Number.isFinite(approved) && approved >= 0 ? approved : 1
  };
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GUESTS_TABLE = process.env.SUPABASE_GUESTS_TABLE || 'guests';
const RSVP_TABLE = process.env.SUPABASE_RSVP_TABLE || 'rsvps';
const INVITATIONS_TABLE = process.env.SUPABASE_INVITATIONS_TABLE || 'invitation_sends';
const FRONTEND_BASE_URL = (process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500').replace(/\/$/, '');
const TOKEN_TTL_HOURS = Number(process.env.ACCESS_LINK_TTL_HOURS || 24 * 365);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_AUTH_SECRET = process.env.ADMIN_AUTH_SECRET || '';
const ADMIN_SESSION_TTL_HOURS = Number(process.env.ADMIN_SESSION_TTL_HOURS || 12);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function makeToken() {
  return randomBytes(24).toString('base64url');
}
function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
function tokenMatches(raw, hashed) {
  const a = Buffer.from(hashToken(raw), 'utf8');
  const b = Buffer.from(String(hashed || ''), 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

async function issueGuestToken(guestId) {
  const token = makeToken();
  const tokenHash = hashToken(token);
  const exp = new Date(Date.now() + TOKEN_TTL_HOURS * 3600 * 1000).toISOString();
  const url = `${FRONTEND_BASE_URL}/?t=${encodeURIComponent(token)}`;
  const { error } = await supabase
    .from(GUESTS_TABLE)
    .update({ personal_token_hash: tokenHash, token_expires_at: exp, personal_invite_url: url })
    .eq('id', guestId);
  if (error) throw error;
  return { token, tokenHash, tokenExpiresAt: exp, url };
}

async function ensureGuestToken(guestId, currentHash, expiresAt) {
  const now = Date.now();
  if (currentHash && expiresAt && new Date(expiresAt).getTime() > now) {
    return { token: null, reused: true };
  }
  const token = makeToken();
  const tokenHash = hashToken(token);
  const exp = new Date(now + TOKEN_TTL_HOURS * 3600 * 1000).toISOString();
  const url = `${FRONTEND_BASE_URL}/?t=${encodeURIComponent(token)}`;
  const { error } = await supabase
    .from(GUESTS_TABLE)
    .update({ personal_token_hash: tokenHash, token_expires_at: exp, personal_invite_url: url })
    .eq('id', guestId);
  if (error) throw error;
  return { token, reused: false, tokenHash, tokenExpiresAt: exp, url };
}

function buildFinalInvitationMessage(fullName, approvedSeats, link) {
  return (
    `Hola ${fullName}, estás invitado(a) a los XV de Gabriella Sofía.\n` +
    `Tus lugares aprobados: ${approvedSeats}.\n` +
    `Confirma tu asistencia aquí: ${link}\n` +
    `Te esperamos con mucho cariño.`
  );
}

async function sendResendEmail(subject, text) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.ORG_EMAIL;
  if (!key || !from || !to) return { skipped: true };
  const { Resend } = await import('resend');
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({ from, to: [to], subject, text });
  if (error) throw new Error(error.message || String(error));
  return { id: data?.id };
}

async function sendTwilioWhatsAppTo(toPhoneE164, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const tok = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !tok || !from) return { skipped: true };
  const twilio = (await import('twilio')).default(sid, tok);
  const to = String(toPhoneE164 || '').startsWith('whatsapp:') ? toPhoneE164 : `whatsapp:${toPhoneE164}`;
  const msg = await twilio.messages.create({ from, to, body });
  return { sid: msg.sid };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

app.use(cors({
  origin: parseOrigins().length ? parseOrigins() : true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token']
}));
app.use(express.json({ limit: '128kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, db: 'supabase' }));

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!ADMIN_PASSWORD || !ADMIN_AUTH_SECRET) {
    return res.status(503).json({ error: 'Configura ADMIN_PASSWORD y ADMIN_AUTH_SECRET en .env' });
  }
  if (!username || !password) {
    return res.status(400).json({ error: 'username y password son requeridos' });
  }
  if (String(username) !== ADMIN_USERNAME || String(password) !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  const nowSec = Math.floor(Date.now() / 1000);
  const exp = nowSec + Math.max(1, ADMIN_SESSION_TTL_HOURS) * 3600;
  const token = signAdminJwtLike(
    { sub: 'admin', username: ADMIN_USERNAME, iat: nowSec, exp },
    ADMIN_AUTH_SECRET
  );
  res.json({
    ok: true,
    token,
    tokenType: 'Bearer',
    expiresAt: new Date(exp * 1000).toISOString(),
    user: { username: ADMIN_USERNAME }
  });
});

app.get('/api/admin/me', adminAuth, async (req, res) => {
  res.json({ ok: true, user: { username: req.admin?.username || ADMIN_USERNAME } });
});

/** Configuración no sensible (para verificar links antes de enviar) */
app.get('/api/admin/config', adminAuth, (_req, res) => {
  const twilioReady = Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM
  );
  res.json({
    ok: true,
    frontendBaseUrl: FRONTEND_BASE_URL,
    guestsTable: GUESTS_TABLE,
    linkTtlHours: TOKEN_TTL_HOURS,
    twilioReady,
    sendDelayMs: Math.min(5000, Math.max(0, Number(process.env.TWILIO_SEND_DELAY_MS ?? 450)))
  });
});

app.get('/api/admin/template.xlsx', adminAuth, async (_req, res) => {
  /** Matriz explícita: exactamente 3 columnas (sin email ni columnas extra). */
  const aoa = [
    ['nombre', 'telefono', 'pases'],
    ['Invitado Ejemplo 1', '8112345678', 2],
    ['Invitado Ejemplo 2', '8176543210', 4]
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(wb, ws, 'invitados');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=\"template-invitados-xv.xlsx\"');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.status(200).send(buf);
});

app.post('/api/admin/import-guests', adminAuth, upload.single('file'), async (req, res) => {
  if (!req.file?.buffer) return res.status(400).json({ error: 'Archivo requerido (campo file)' });
  let workbook;
  try { workbook = XLSX.read(req.file.buffer, { type: 'buffer' }); } catch { return res.status(400).json({ error: 'Excel inválido' }); }
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return res.status(400).json({ error: 'La hoja está vacía' });

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const guests = rows.map(normalizeGuestRow).filter((g) => g.full_name && g.phone_e164);
  if (!guests.length) return res.status(400).json({ error: 'No hay invitados válidos (nombre + teléfono)' });

  const phones = [...new Set(guests.map((g) => g.phone_e164))];
  const { data: existingRows } = await supabase
    .from(GUESTS_TABLE)
    .select('phone_e164, invitation_message, personal_invite_url, personal_token_hash, token_expires_at')
    .in('phone_e164', phones);
  const prevByPhone = new Map((existingRows || []).map((r) => [r.phone_e164, r]));

  const payload = guests.map((g) => {
    const prev = prevByPhone.get(g.phone_e164);
    if (prev) {
      return {
        ...g,
        attendance_status: 'pending',
        confirmed_seats: 0,
        invitation_message: prev.invitation_message ?? null,
        personal_invite_url: prev.personal_invite_url ?? null,
        personal_token_hash: prev.personal_token_hash ?? null,
        token_expires_at: prev.token_expires_at ?? null
      };
    }
    return {
      ...g,
      attendance_status: 'pending',
      confirmed_seats: 0,
      invitation_message: null
    };
  });
  const { data, error } = await supabase.from(GUESTS_TABLE).upsert(payload, { onConflict: 'phone_e164' }).select('id');
  if (error) return res.status(500).json({ error: error.message });

  const ids = (data || []).map((r) => r.id).filter(Boolean);
  if (ids.length) {
    const { data: checkRows, error: linkErr } = await supabase
      .from(GUESTS_TABLE)
      .select('id, full_name, approved_seats, personal_invite_url, personal_token_hash, token_expires_at')
      .in('id', ids);
    if (linkErr) return res.status(500).json({ error: linkErr.message });
    const now = Date.now();
    for (const r of checkRows || []) {
      let inviteUrl = String(r.personal_invite_url || '').trim();
      const expMs = r.token_expires_at ? new Date(r.token_expires_at).getTime() : 0;
      const needsToken = !r.personal_token_hash || expMs <= now || !inviteUrl;
      if (needsToken) {
        try {
          const issued = await issueGuestToken(r.id);
          inviteUrl = issued.url;
        } catch (e) {
          return res.status(500).json({ error: e.message || 'Error al crear enlace de invitación' });
        }
      }
      if (!inviteUrl) return res.status(500).json({ error: 'No se pudo obtener enlace para un invitado' });
      const message = buildFinalInvitationMessage(r.full_name, r.approved_seats, inviteUrl);
      const { error: msgErr } = await supabase
        .from(GUESTS_TABLE)
        .update({ invitation_message: message })
        .eq('id', r.id);
      if (msgErr) return res.status(500).json({ error: msgErr.message });
    }
  }

  res.json({ ok: true, count: data?.length || guests.length });
});

app.get('/api/admin/guests', adminAuth, async (_req, res) => {
  const { data, error } = await supabase.from(GUESTS_TABLE)
    .select('id, full_name, phone_e164, email, approved_seats, confirmed_seats, attendance_status, rsvp_note, invitation_message, personal_invite_url, token_expires_at, last_sent_at, last_delivery_status, created_at')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ guests: data || [], updatedAt: new Date().toISOString() });
});

app.post('/api/admin/messages', adminAuth, async (req, res) => {
  const { guestIds, onlyPending = false, regenerate = true } = req.body || {};
  let q = supabase
    .from(GUESTS_TABLE)
    .select('id, full_name, phone_e164, approved_seats, attendance_status, personal_token_hash, token_expires_at');
  if (Array.isArray(guestIds) && guestIds.length) q = q.in('id', guestIds);
  if (onlyPending) q = q.eq('attendance_status', 'pending');
  const { data: guests, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const messages = [];
  for (const g of guests || []) {
    let token = null;
    if (regenerate) {
      const issued = await issueGuestToken(g.id);
      token = issued.token;
    } else {
      const ensured = await ensureGuestToken(g.id, g.personal_token_hash, g.token_expires_at);
      token = ensured.token;
      if (!token) {
        const issued = await issueGuestToken(g.id);
        token = issued.token;
      }
    }

    const link = `${FRONTEND_BASE_URL}/?t=${encodeURIComponent(token)}`;
    const message = buildFinalInvitationMessage(g.full_name, g.approved_seats, link);
    const { error: saveErr } = await supabase
      .from(GUESTS_TABLE)
      .update({ invitation_message: message, personal_invite_url: link })
      .eq('id', g.id);
    if (saveErr) return res.status(500).json({ error: saveErr.message });
    messages.push({
      guestId: g.id,
      fullName: g.full_name,
      phone: g.phone_e164,
      approvedSeats: g.approved_seats,
      link,
      message
    });
  }

  res.json({ ok: true, total: messages.length, messages });
});

app.get('/api/guest/session', async (req, res) => {
  const t = String(req.query.t || '').trim();
  if (!t) return res.status(400).json({ error: 'Token requerido' });
  const { data: guests, error } = await supabase.from(GUESTS_TABLE)
    .select('id, full_name, approved_seats, attendance_status, token_expires_at, personal_token_hash')
    .not('personal_token_hash', 'is', null)
    .limit(2000);
  if (error) return res.status(500).json({ error: error.message });

  const now = Date.now();
  const hit = (guests || []).find((g) => {
    if (!g.personal_token_hash) return false;
    if (!g.token_expires_at || new Date(g.token_expires_at).getTime() < now) return false;
    return tokenMatches(t, g.personal_token_hash);
  });

  if (!hit) return res.status(401).json({ error: 'Link inválido o expirado' });
  res.json({ ok: true, guest: { id: hit.id, fullName: hit.full_name, approvedSeats: hit.approved_seats, attendanceStatus: hit.attendance_status } });
});

app.post('/api/rsvp', async (req, res) => {
  const { guestName, attendance, partySize, message, pageUrl, guestToken } = req.body || {};
  const safeAttendance = attendance === 'no' ? 'no' : 'si';
  const safeMessage = message != null ? String(message).slice(0, 2000) : null;
  const safePageUrl = pageUrl != null ? String(pageUrl).slice(0, 500) : null;

  let guest = null;
  if (guestToken) {
    const { data: guests, error } = await supabase.from(GUESTS_TABLE)
      .select('id, full_name, approved_seats, personal_token_hash, token_expires_at')
      .not('personal_token_hash', 'is', null)
      .limit(2000);
    if (error) return res.status(500).json({ error: error.message });
    guest = (guests || []).find((g) => g.token_expires_at && new Date(g.token_expires_at).getTime() > Date.now() && tokenMatches(guestToken, g.personal_token_hash));
  }
  if (!guest && guestName) {
    const { data, error } = await supabase.from(GUESTS_TABLE).select('id, full_name, approved_seats').ilike('full_name', String(guestName).slice(0, 200)).limit(1).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    guest = data;
  }
  if (!guest) return res.status(404).json({ error: 'Invitado no encontrado' });

  const confirmedSeats = safeAttendance === 'no' ? 0 : Math.max(0, Number(guest.approved_seats || 0));

  const { error: clearErr } = await supabase.from(RSVP_TABLE).update({ is_latest: false }).eq('guest_id', guest.id).eq('is_latest', true);
  if (clearErr) return res.status(500).json({ error: clearErr.message });
  const { error: rsvpErr } = await supabase.from(RSVP_TABLE).insert({ guest_id: guest.id, attendance: safeAttendance, confirmed_seats: confirmedSeats, congrat_note: safeMessage, source: 'web', is_latest: true });
  if (rsvpErr) return res.status(500).json({ error: rsvpErr.message });

  const { error: gErr } = await supabase.from(GUESTS_TABLE).update({ attendance_status: safeAttendance === 'si' ? 'confirmed' : 'declined', confirmed_seats: confirmedSeats, rsvp_note: safeMessage }).eq('id', guest.id);
  if (gErr) return res.status(500).json({ error: gErr.message });

  const ackBody = `RSVP XV\nInvitado: ${guest.full_name}\nAsistencia: ${safeAttendance}\nPersonas: ${confirmedSeats}\n${safeMessage ? `Mensaje: ${safeMessage}\n` : ''}${safePageUrl ? `URL: ${safePageUrl}` : ''}`;
  try {
    const tw = await sendTwilioWhatsAppTo((await supabase.from(GUESTS_TABLE).select('phone_e164').eq('id', guest.id).single()).data?.phone_e164, ackBody.slice(0, 1200));
    await supabase.from(INVITATIONS_TABLE).insert({ guest_id: guest.id, send_type: 'ack', channel: 'whatsapp', provider: 'twilio', status: tw.skipped ? 'failed' : 'sent', twilio_message_sid: tw.sid || null, payload: { source: 'rsvp_ack' } });
  } catch (_) {
    // noop
  }

  try { await sendResendEmail(`RSVP XV — ${guest.full_name}`, ackBody); } catch (_) {}
  res.json({ ok: true, guestId: guest.id, confirmedSeats });
});

app.post('/api/admin/send-invitations', adminAuth, async (req, res) => {
  const { guestIds, onlyPending = true, dryRun = false } = req.body || {};
  /** Pausa entre envíos reales (Twilio / carrier); configurable en .env */
  const sendDelayMs = Math.min(5000, Math.max(0, Number(process.env.TWILIO_SEND_DELAY_MS ?? 450)));

  let q = supabase.from(GUESTS_TABLE).select('id, full_name, phone_e164, approved_seats, attendance_status, personal_token_hash, token_expires_at');
  if (Array.isArray(guestIds) && guestIds.length) q = q.in('id', guestIds);
  if (onlyPending) q = q.eq('attendance_status', 'pending');
  const { data: guests, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const results = [];
  let firstSend = true;
  for (const g of guests || []) {
    const issued = await issueGuestToken(g.id);
    const token = issued.token;

    const link = `${FRONTEND_BASE_URL}/?t=${encodeURIComponent(token)}`;
    const body = buildFinalInvitationMessage(g.full_name, g.approved_seats, link);

    if (dryRun) {
      results.push({ guestId: g.id, status: 'dry_run', link });
      continue;
    }

    if (!firstSend && sendDelayMs > 0) await sleep(sendDelayMs);
    firstSend = false;

    try {
      const tw = await sendTwilioWhatsAppTo(g.phone_e164, body);
      const status = tw.skipped ? 'failed' : 'sent';
      await supabase.from(INVITATIONS_TABLE).insert({ guest_id: g.id, send_type: 'invitation', channel: 'whatsapp', provider: 'twilio', status, twilio_message_sid: tw.sid || null, payload: { link } });
      await supabase.from(GUESTS_TABLE).update({ last_sent_at: new Date().toISOString(), last_delivery_status: status }).eq('id', g.id);
      results.push({ guestId: g.id, status, twilioMessageSid: tw.sid || null });
    } catch (e) {
      await supabase.from(INVITATIONS_TABLE).insert({ guest_id: g.id, send_type: 'invitation', channel: 'whatsapp', provider: 'twilio', status: 'failed', error_message: String(e.message || e), payload: { link } });
      await supabase.from(GUESTS_TABLE).update({ last_delivery_status: 'failed' }).eq('id', g.id);
      results.push({ guestId: g.id, status: 'failed', error: String(e.message || e) });
    }
  }

  const ok = results.filter((r) => r.status === 'sent').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const dry = results.filter((r) => r.status === 'dry_run').length;

  try {
    await sendResendEmail('Resumen envío invitaciones XV', `Total: ${results.length}\nEnviados: ${ok}\nFallidos: ${failed}\nDryRun: ${dry}`);
  } catch (_) {}

  res.json({ ok: true, total: results.length, sent: ok, failed, dryRun: dry, results });
});

const staticNoCache = {
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-store');
  }
};

app.use('/css', express.static(path.join(REPO_ROOT, 'css'), staticNoCache));
app.use('/js', express.static(path.join(REPO_ROOT, 'js'), staticNoCache));
app.use('/assets', express.static(path.join(REPO_ROOT, 'assets'), staticNoCache));

app.get('/', (_req, res) => {
  res.sendFile(path.join(REPO_ROOT, 'index.html'), { maxAge: 0 });
});

app.get('/admin.html', (_req, res) => {
  res.sendFile(path.join(REPO_ROOT, 'admin.html'), { maxAge: 0 });
});

app.get('/admin', (_req, res) => {
  res.redirect(302, '/admin.html');
});

export default app;

const port = Number(process.env.PORT || 3001);
if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    const base = `http://127.0.0.1:${port}`;
    console.log(`Invitación: ${base}/`);
    console.log(`Admin:      ${base}/admin.html`);
    console.log(`API health: ${base}/api/health`);
    console.log(`Usa FRONTEND_BASE_URL=${base} en .env para links de WhatsApp.`);
  });
}

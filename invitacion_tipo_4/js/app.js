/**
 * Invitación tipo 4 — lógica (countdown, galería oficial, RSVP, audio, URL params)
 * Galería: JPG optimizados (max ancho 1000px) en assets/img/oficial_gallery/final/
 */

const EVENT_DATE = new Date('2026-05-08T17:30:00');

const OFFICIAL_PHOTOS = [
  'galeria-01.jpg',
  'galeria-02.jpg',
  'galeria-03.jpg',
  'galeria-04.jpg',
  'galeria-05.jpg',
  'galeria-06.jpg',
  'galeria-07.jpg',
  'galeria-08.jpg',
  'galeria-09.jpg',
  'galeria-10.jpg',
  'galeria-11.jpg',
  'galeria-12.jpg',
  'galeria-13.jpg',
  'galeria-14.jpg',
  'galeria-15.jpg',
  'galeria-16.jpg'
];

const GALLERY_BASE = 'assets/img/oficial_gallery/final/';

function getXVApiBase() {
  if (typeof window === 'undefined' || typeof location === 'undefined') return '';
  const m = document.querySelector('meta[name="xv-api-base"]');
  const raw = m && m.getAttribute('content') != null ? String(m.getAttribute('content')).trim() : '';
  if (raw === '') return '';

  const rm = document.querySelector('meta[name="xv-api-remote"]');
  const remote = rm && rm.getAttribute('content') != null ? String(rm.getAttribute('content')).trim().replace(/\/$/, '') : '';

  const h = location.hostname || '';
  const isLocal = h === 'localhost' || h === '127.0.0.1';
  const onVercel = /\.vercel\.app$/i.test(h);

  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, '');
  }

  const pathPart = raw.startsWith('/') ? raw : `/${raw}`;
  if (isLocal || onVercel) {
    return `${location.origin}${pathPart}`.replace(/\/$/, '');
  }

  if (remote) {
    return /^https?:\/\//i.test(remote) ? remote : `${location.origin}${remote.startsWith('/') ? remote : `/${remote}`}`.replace(/\/$/, '');
  }

  return `${location.origin}${pathPart}`.replace(/\/$/, '');
}

async function submitRsvpToApi(payload) {
  const base = getXVApiBase();
  if (!base) return { ok: false, skipped: true };
  const res = await fetch(`${base}/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {
    /* noop */
  }
  if (!res.ok) {
    const err = new Error(data?.error || text || res.statusText);
    err.status = res.status;
    throw err;
  }
  return { ok: true, data };
}

async function resolveGuestSession(token) {
  const base = getXVApiBase();
  if (!base || !token) return { ok: false, skipped: true };
  const res = await fetch(`${base}/guest/session?t=${encodeURIComponent(token)}`, {
    headers: { Accept: 'application/json' }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || 'No se pudo validar el link');
    err.status = res.status;
    throw err;
  }
  return { ok: true, data };
}

function showRsvpToast(html) {
  const toast = document.createElement('div');
  toast.className =
    'fixed top-24 left-1/2 -translate-x-1/2 z-[5000] bg-white px-8 py-5 shadow-2xl text-center max-w-sm';
  toast.innerHTML = html;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}

function withAssetBust(url) {
  if (!url || url.includes('?')) return url;
  const v = typeof window !== 'undefined' && window.__INV_ASSET_V != null ? window.__INV_ASSET_V : Date.now();
  return url + '?' + v;
}

class App {
  constructor() {
    if (typeof window !== 'undefined' && window.__INV_ASSET_V == null) {
      window.__INV_ASSET_V = Date.now();
    }
    this.bustDomAssets();

    this.gallerySources = [];
    this._lightboxIndex = 0;
    this.guestToken = null;
    this.approvedSeats = 2;
    this.initUrlParams();
    this.initScrollReveal();
    this.initCountdown();
    this.initHeroParallaxScroll();
    this.initMrParallaxScroll();
    this.initCdParallaxScroll();
    this.initLightbox();
    this.initGallery();
    this.initRSVP();
    this.initMusic();
    this.initAttendanceToggle();
  }

  bustDomAssets() {
    const v = window.__INV_ASSET_V;
    document.querySelectorAll('img[src]').forEach((img) => {
      const raw = img.getAttribute('src');
      if (!raw || raw.includes('?') || !raw.includes('assets')) return;
      img.setAttribute('src', raw + '?' + v);
    });
    document.querySelectorAll('source[src]').forEach((el) => {
      const raw = el.getAttribute('src');
      if (!raw || raw.includes('?') || !raw.includes('assets')) return;
      el.setAttribute('src', raw + '?' + v);
    });
    const audio = document.getElementById('bg_music');
    if (audio) {
      try {
        audio.load();
      } catch (_) {
        /* noop */
      }
    }
  }

  initUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('t');
    const nombre = params.get('nombre') || params.get('name');
    const pases = params.get('pases') || params.get('p');

    if (token) {
      this.guestToken = token;
      resolveGuestSession(token)
        .then((r) => {
          if (!r.ok || !r.data?.guest) return;
          const guest = r.data.guest;
          const nameEl = document.getElementById('guest_name');
          const passesEl = document.getElementById('guest_passes');
          if (nameEl && guest.fullName) nameEl.textContent = guest.fullName;
          if (passesEl && guest.approvedSeats != null) {
            passesEl.textContent = String(guest.approvedSeats);
            this.approvedSeats = Number.parseInt(String(guest.approvedSeats), 10) || 0;
            this.syncFixedSeatsUI();
          }
          this.syncGuestNameRsvp();
        })
        .catch((e) => {
          console.warn('[SESSION]', e.message);
          showRsvpToast(
            '<p class="text-xs font-bold uppercase tracking-widest text-gray-500">Aviso</p>' +
              '<p class="text-sm mt-2 text-gray-600">Tu link es inválido o expiró. Solicita un nuevo enlace al organizador.</p>'
          );
        });
    }

    if (nombre) {
      const el = document.getElementById('guest_name');
      if (el) el.textContent = decodeURIComponent(nombre.replace(/\+/g, ' '));
    }
    if (pases) {
      const el = document.getElementById('guest_passes');
      if (el) el.textContent = pases;
      this.approvedSeats = Number.parseInt(String(pases), 10) || this.approvedSeats;
      this.syncFixedSeatsUI();
    }
    this.syncGuestNameRsvp();
    this.syncFixedSeatsUI();
  }

  syncGuestNameRsvp() {
    const primary = document.getElementById('guest_name');
    const mirror = document.getElementById('guest_name_rsvp');
    if (primary && mirror) mirror.textContent = primary.textContent;
  }

  syncFixedSeatsUI() {
    const n = String(this.approvedSeats ?? 0);
    const fixed = document.getElementById('rsvp_personas_fixed');
    if (fixed) fixed.textContent = n;
    const passesEl = document.getElementById('guest_passes');
    if (passesEl) passesEl.textContent = n;
  }

  initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  initHeroParallaxScroll() {
    const track = document.getElementById('inv_hero_track');
    const layers = document.getElementById('inv_hero_layers');
    const img = document.getElementById('inv_hero_img');
    const logoHero = document.getElementById('inv_sofia_logo_hero');
    if (!track || !layers || !img) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

    const tick = () => {
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const H = Math.max(1, track.offsetHeight);

      const intersects = rect.bottom > 0 && rect.top < vh;
      if (!intersects) {
        layers.classList.remove('is-active');
        if (logoHero) logoHero.style.transform = '';
        return;
      }
      layers.classList.add('is-active');

      if (reduced) {
        img.style.objectPosition = '50% 45%';
        if (logoHero) logoHero.style.transform = '';
        return;
      }

      let p = (vh - rect.top) / H;
      p = clamp(p, 0, 1);
      const yPct = (1 - p) * 100;
      img.style.objectPosition = `50% ${yPct}%`;

      if (logoHero) {
        const lift = p * 14;
        const subtle = 1 + p * 0.035;
        logoHero.style.transform = `translateY(${lift}px) scale(${subtle})`;
      }
    };

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick, { passive: true });
    tick();
  }

  initMrParallaxScroll() {
    const track = document.getElementById('inv_mr_track');
    const layers = document.getElementById('inv_mr_layers');
    const img = document.getElementById('inv_mr_img');
    if (!track || !layers || !img) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

    const tick = () => {
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const H = Math.max(1, track.offsetHeight);

      const intersects = rect.bottom > 0 && rect.top < vh;
      if (!intersects) {
        layers.classList.remove('is-active');
        return;
      }
      layers.classList.add('is-active');

      if (reduced) {
        img.style.objectPosition = '50% 50%';
        return;
      }

      let p = (vh - rect.top) / H;
      p = clamp(p, 0, 1);
      const yPct = (1 - p) * 100;
      img.style.objectPosition = `50% ${yPct}%`;
    };

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick, { passive: true });
    tick();
  }

  initCdParallaxScroll() {
    const track = document.getElementById('inv_cd_track');
    const layers = document.getElementById('inv_cd_layers');
    const img = document.getElementById('inv_cd_img');
    if (!track || !layers || !img) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

    const tick = () => {
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const H = Math.max(1, track.offsetHeight);

      const intersects = rect.bottom > 0 && rect.top < vh;
      if (!intersects) {
        layers.classList.remove('is-active');
        return;
      }
      layers.classList.add('is-active');

      if (reduced) {
        img.style.objectPosition = '50% 50%';
        return;
      }

      /* Solo la foto: encuadre según scroll. El countdown va en el flujo del track (misma velocidad que el documento). */
      let p = (vh - rect.top) / H;
      p = clamp(p, 0, 1);
      const yPct = (1 - p) * 100;
      img.style.objectPosition = `50% ${yPct}%`;
    };

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick, { passive: true });
    tick();
  }

  initCountdown() {
    const pad = (n) => n.toString().padStart(2, '0');
    const tick = () => {
      const now = new Date();
      const diff = EVENT_DATE - now;
      const $d = document.getElementById('cd-days');
      const $h = document.getElementById('cd-hours');
      const $m = document.getElementById('cd-mins');
      const $s = document.getElementById('cd-secs');
      if (!$d || !$h || !$m || !$s) return;

      if (diff <= 0) {
        ['00', '00', '00', '00'].forEach((v, i) => {
          [ $d, $h, $m, $s ][i].textContent = v;
        });
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      $d.textContent = pad(d);
      $h.textContent = pad(h);
      $m.textContent = pad(m);
      $s.textContent = pad(s);
    };
    setInterval(tick, 1000);
    tick();
  }

  initGallery() {
    const viewport = document.getElementById('gallery_viewport');
    if (!viewport) return;

    this.gallerySources = [];
    OFFICIAL_PHOTOS.forEach((file, index) => {
      const path = withAssetBust(GALLERY_BASE + encodeURIComponent(file));
      this.gallerySources.push(path);

      const slide = document.createElement('div');
      slide.className = 'inv-gallery-slider__slide';
      slide.setAttribute('role', 'button');
      slide.tabIndex = 0;
      slide.setAttribute('aria-label', `Ampliar foto ${index + 1}`);

      const img = document.createElement('img');
      img.src = path;
      img.alt = `Recuerdo ${index + 1}`;
      img.loading = index < 2 ? 'eager' : 'lazy';
      img.onerror = () => {
        slide.style.display = 'none';
      };

      slide.appendChild(img);
      const open = () => {
        if (viewport.dataset.gallerySuppressClick === '1') return;
        this.openLightbox(index);
      };
      slide.addEventListener('click', open);
      slide.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
      viewport.appendChild(slide);
    });

    this.bindGalleryPointerScroll(viewport);
    this.initGalleryDots(viewport);
  }

  initGalleryDots(viewport) {
    const wrap = document.getElementById('gallery_dots');
    if (!wrap) return;

    const slides = () => Array.from(viewport.querySelectorAll('.inv-gallery-slider__slide'));
    const n = slides().length;
    wrap.innerHTML = '';

    const getActiveIndex = () => {
      const all = slides();
      const visible = all.filter((el) => el.offsetParent !== null);
      if (!visible.length) return 0;
      const mid = viewport.scrollLeft + viewport.clientWidth * 0.5;
      for (let i = 0; i < visible.length; i++) {
        const el = visible[i];
        const l = el.offsetLeft;
        const r = l + el.offsetWidth;
        if (mid >= l && mid < r) return all.indexOf(el);
      }
      const w = viewport.clientWidth || 1;
      return Math.min(all.length - 1, Math.max(0, Math.round(viewport.scrollLeft / w)));
    };

    const syncDots = () => {
      const active = getActiveIndex();
      wrap.querySelectorAll('.inv-gallery-slider__dot').forEach((btn, i) => {
        const on = i === active;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-current', on ? 'true' : 'false');
      });
    };

    for (let i = 0; i < n; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'inv-gallery-slider__dot';
      btn.setAttribute('aria-label', `Ir a la foto ${i + 1} de ${n}`);
      btn.addEventListener('click', () => {
        const target = slides()[i];
        if (!target) return;
        viewport.scrollTo({
          left: target.offsetLeft,
          behavior: 'smooth'
        });
      });
      wrap.appendChild(btn);
    }

    viewport.addEventListener('scroll', syncDots, { passive: true });
    window.addEventListener('resize', syncDots, { passive: true });
    syncDots();
  }

  /**
   * Arrastre con ratón (y puntero) + rueda horizontal / Shift+rueda.
   * El tacto usa el scroll nativo del contenedor (overflow-x).
   */
  bindGalleryPointerScroll(viewport) {
    let dragging = false;
    let ptrId = null;
    let startX = 0;
    let startScroll = 0;
    let dragged = false;

    const onDown = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      dragged = false;
      ptrId = e.pointerId;
      startX = e.clientX;
      startScroll = viewport.scrollLeft;
      viewport.classList.add('is-dragging');
      viewport.style.scrollBehavior = 'auto';
      try {
        viewport.setPointerCapture(e.pointerId);
      } catch (_) {
        /* noop */
      }
    };

    const onMove = (e) => {
      if (!dragging || e.pointerId !== ptrId) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) dragged = true;
      viewport.scrollLeft = startScroll - dx;
    };

    const onEnd = (e) => {
      if (!dragging || e.pointerId !== ptrId) return;
      dragging = false;
      ptrId = null;
      viewport.classList.remove('is-dragging');
      viewport.style.scrollBehavior = '';
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch (_) {
        /* noop */
      }
      if (dragged) {
        viewport.dataset.gallerySuppressClick = '1';
        viewport.addEventListener(
          'click',
          (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
          },
          { capture: true, once: true }
        );
        window.setTimeout(() => {
          delete viewport.dataset.gallerySuppressClick;
        }, 150);
      }
    };

    viewport.addEventListener('pointerdown', onDown);
    viewport.addEventListener('pointermove', onMove);
    viewport.addEventListener('pointerup', onEnd);
    viewport.addEventListener('pointercancel', onEnd);

    viewport.addEventListener(
      'wheel',
      (e) => {
        const ax = Math.abs(e.deltaX);
        const ay = Math.abs(e.deltaY);
        if (ax > ay && ax > 0) {
          e.preventDefault();
          viewport.scrollLeft += e.deltaX;
          return;
        }
        if (e.shiftKey && ay > 0) {
          e.preventDefault();
          viewport.scrollLeft += e.deltaY;
        }
      },
      { passive: false }
    );
  }

  initLightbox() {
    const box = document.getElementById('lightbox');
    const img = document.getElementById('lightbox_img');
    const closeBtn = document.getElementById('lightbox_close');
    const prevBtn = document.getElementById('lightbox_prev');
    const nextBtn = document.getElementById('lightbox_next');
    const body = document.getElementById('lightbox_body');
    if (!box || !img) return;

    const close = () => {
      box.classList.add('hidden');
      img.src = '';
      img.removeAttribute('src');
      document.body.style.overflow = '';
    };

    const showAt = (idx) => {
      const n = this.gallerySources.length;
      if (n === 0) return;
      let i = ((idx % n) + n) % n;
      this._lightboxIndex = i;
      img.src = this.gallerySources[i];
      img.alt = `Recuerdo ${i + 1}`;
    };

    closeBtn?.addEventListener('click', close);
    prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      showAt(this._lightboxIndex - 1);
    });
    nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      showAt(this._lightboxIndex + 1);
    });

    body?.addEventListener('click', (e) => {
      if (e.target === body) close();
    });

    let touchStartX = 0;
    body?.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].clientX;
      },
      { passive: true }
    );
    body?.addEventListener(
      'touchend',
      (e) => {
        if (box.classList.contains('hidden')) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) < 56) return;
        if (dx > 0) showAt(this._lightboxIndex - 1);
        else showAt(this._lightboxIndex + 1);
      },
      { passive: true }
    );

    document.addEventListener('keydown', (e) => {
      if (box.classList.contains('hidden')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showAt(this._lightboxIndex - 1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        showAt(this._lightboxIndex + 1);
      }
    });

    this.openLightbox = (index) => {
      if (!this.gallerySources.length) return;
      showAt(typeof index === 'number' ? index : 0);
      box.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    };
  }

  initAttendanceToggle() {
    const radios = document.querySelectorAll('input[name="asistencia"]');
    const extra = document.getElementById('rsvp_extra');
    if (!radios.length || !extra) return;

    const sync = () => {
      const no = document.querySelector('input[name="asistencia"][value="no"]')?.checked;
      const msg = document.getElementById('rsvp_msg');
      if (msg) msg.disabled = !!no;
      extra.style.opacity = no ? '0.65' : '1';
    };
    radios.forEach((r) => r.addEventListener('change', sync));
    sync();
  }

  initRSVP() {
    const btn = document.getElementById('rsvp_submit_v4');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      const base = getXVApiBase();
      if (!base) {
        showRsvpToast(
          '<p class="text-xs font-bold uppercase tracking-widest text-gray-500">No disponible</p>' +
            '<p class="text-sm mt-2 text-gray-600">No hay servidor de confirmación configurado. Contacta al organizador.</p>'
        );
        return;
      }

      const asistencia = document.querySelector('input[name="asistencia"]:checked')?.value;
      const personas = String(this.approvedSeats ?? 0);
      const msg = document.getElementById('rsvp_msg')?.value?.trim() || '';
      const guest = document.getElementById('guest_name')?.textContent?.trim() || 'Invitado';

      const payload = {
        guestName: guest,
        attendance: asistencia === 'no' ? 'no' : 'si',
        partySize: asistencia === 'no' ? null : personas,
        message: msg || null,
        pageUrl: typeof window !== 'undefined' ? window.location.href : null,
        guestToken: this.guestToken
      };

      btn.disabled = true;
      btn.textContent = 'Enviando…';

      await new Promise((r) => setTimeout(r, 200));

      try {
        const apiResult = await submitRsvpToApi(payload);
        if (apiResult.ok) {
          btn.textContent = '¡Listo!';
          showRsvpToast(
            '<p class="text-xs font-bold uppercase tracking-widest text-gray-500">Gracias</p>' +
              '<p class="text-sm mt-2 text-gray-600">Tu confirmación fue registrada en el sistema.</p>'
          );
          await new Promise((r) => setTimeout(r, 2200));
          btn.disabled = false;
          btn.textContent = 'Enviar';
          return;
        }
      } catch (err) {
        const detail = err?.message ? String(err.message) : 'Intenta de nuevo más tarde.';
        showRsvpToast(
          '<p class="text-xs font-bold uppercase tracking-widest text-red-600">No se guardó</p>' +
            '<p class="text-sm mt-2 text-gray-600">' +
            detail.replace(/</g, '&lt;') +
            '</p>'
        );
      }
      btn.disabled = false;
      btn.textContent = 'Enviar';
    });
  }

  initMusic() {
    const btn = document.getElementById('music_player');
    const audio = document.getElementById('bg_music');
    if (!btn || !audio) return;

    let playing = false;
    const icon = btn.querySelector('.material-symbols-outlined');

    btn.addEventListener('click', async () => {
      try {
        if (playing) {
          audio.pause();
          playing = false;
          btn.classList.remove('is-playing');
          if (icon) icon.textContent = 'music_note';
        } else {
          await audio.play();
          playing = true;
          btn.classList.add('is-playing');
          if (icon) icon.textContent = 'pause';
        }
      } catch {
        if (icon) icon.textContent = 'music_off';
      }
    });

    audio.addEventListener('ended', () => {
      playing = false;
      btn.classList.remove('is-playing');
      if (icon) icon.textContent = 'music_note';
    });
  }
}

function bootInvitacion() {
  new App();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootInvitacion);
} else {
  bootInvitacion();
}

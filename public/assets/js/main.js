import { CONFIG } from './config.js';
import { VAULT } from './items.js';
import { spriteMarkup, weaponSvg } from './weapons.js';
import { startBackground } from './background.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const launchAt = new Date(CONFIG.launchAt).getTime();
const pad2 = (n) => String(n).padStart(2, '0');

const bg = startBackground($('#bg'), { reducedMotion });
document.body.insertAdjacentHTML('afterbegin', spriteMarkup());
$('#year').textContent = new Date().getFullYear();

/* ── Intro ─────────────────────────────────────────────────────── */

async function runIntro() {
  const intro = $('#intro');
  const fill = $('#intro-fill');
  const pct = $('#intro-pct');
  const heroImages = $$('.hero img, .top img');
  const assetsReady = Promise.race([
    Promise.all([
      document.fonts ? document.fonts.ready : null,
      ...heroImages.map((img) => (img.decode ? img.decode().catch(() => {}) : null)),
    ]),
    new Promise((r) => setTimeout(r, 2500)),
  ]);

  const minDuration = reducedMotion ? 0 : 1100;
  const t0 = performance.now();
  let ready = false;
  assetsReady.then(() => { ready = true; });

  await new Promise((resolve) => {
    const tick = (now) => {
      const elapsed = now - t0;
      // Creep to 90% on time alone, finish once assets are in.
      let p = Math.min(elapsed / Math.max(minDuration, 1), 1) * 0.9;
      if (ready && elapsed >= minDuration) p = 1;
      fill.style.transform = `scaleX(${p})`;
      pct.textContent = Math.round(p * 100);
      if (p >= 1) resolve(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  intro.classList.add('is-done');
  document.body.classList.add('is-ready');
  setTimeout(() => intro.remove(), 1000);
}

/* ── Countdown ─────────────────────────────────────────────────── */

const units = ['days', 'hours', 'minutes', 'seconds'].map((name) => {
  const el = $(`.cd-unit[data-unit="${name}"]`);
  return { name, el, digits: $('.cd-digits', el), bar: $('.cd-bar span', el), strips: [], values: [] };
});

function buildDigits(unit, count) {
  unit.digits.innerHTML = '';
  unit.strips = [];
  unit.values = [];
  for (let i = 0; i < count; i++) {
    const d = document.createElement('span');
    d.className = 'digit';
    const strip = document.createElement('span');
    strip.className = 'digit-strip';
    // 0-9 followed by a second 0, so 0 -> 9 can roll one step instead of nine.
    strip.innerHTML = '0123456789'.split('').concat('0').map((n) => `<span>${n}</span>`).join('');
    d.appendChild(strip);
    unit.digits.appendChild(d);
    unit.strips.push(strip);
    unit.values.push(null);
  }
}

function setDigit(unit, i, value) {
  const strip = unit.strips[i];
  const prev = unit.values[i];
  if (prev === value) return;
  if (prev === 0 && value > 0) {
    // Jump to the duplicate 0 at the bottom, then roll up one step.
    strip.classList.add('no-anim');
    strip.style.transform = 'translateY(-10em)';
    strip.getBoundingClientRect();
    strip.classList.remove('no-anim');
  }
  strip.style.transform = `translateY(${-value}em)`;
  unit.values[i] = value;
}

function setUnit(unit, value, fraction) {
  const str = pad2(value);
  if (unit.strips.length !== str.length) buildDigits(unit, str.length);
  [...str].forEach((ch, i) => setDigit(unit, i, Number(ch)));
  unit.bar.style.setProperty('--p', fraction.toFixed(4));
}

const countdownEl = $('#countdown');
let lastAria = '';

function updateCountdown() {
  const diff = launchAt - Date.now();
  if (diff <= 0) {
    goLive();
    return false;
  }
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  setUnit(units[0], days, Math.min(days / 60, 1));
  setUnit(units[1], hours, hours / 24);
  setUnit(units[2], minutes, minutes / 60);
  setUnit(units[3], seconds, seconds / 60);

  const aria = `Launch in ${days} days, ${hours} hours and ${minutes} minutes`;
  if (aria !== lastAria) {
    countdownEl.setAttribute('aria-label', aria);
    lastAria = aria;
  }
  return true;
}

function scheduleCountdown() {
  if (!updateCountdown()) return;
  // Tick on the second boundary so every unit flips together.
  setTimeout(scheduleCountdown, 1000 - (Date.now() % 1000) + 5);
}

function goLive() {
  countdownEl.hidden = true;
  $('#notify').hidden = true;
  $('#live').hidden = false;
  $('#live-link').href = CONFIG.liveUrl;
  $('.status-text').textContent = 'Season 0 · Live now';
  $$('[data-live-text]').forEach((el) => { el.textContent = el.dataset.liveText; });
}

function showLaunchTime() {
  const el = $('#launch-time');
  el.dateTime = new Date(launchAt).toISOString();
  el.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  }).format(launchAt);
}

/* ── Notify form ───────────────────────────────────────────────── */

const form = $('#notify');
const emailInput = $('#email');
const btn = $('#notify-btn');
const msg = $('#notify-msg');
const field = $('.notify-field');
const DEFAULT_MSG = msg.textContent;
const STORAGE_KEY = 'raiku:notified';
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

function setMessage(text, kind = '') {
  msg.textContent = text;
  msg.classList.toggle('is-ok', kind === 'ok');
  msg.classList.toggle('is-err', kind === 'err');
}

function markJoined() {
  btn.classList.add('is-done');
  btn.querySelector('.btn-label').textContent = "You're in ✓";
  emailInput.disabled = true;
  emailInput.placeholder = 'On the list';
}

function flagError(text) {
  setMessage(text, 'err');
  field.classList.remove('has-error');
  void field.offsetWidth;
  field.classList.add('has-error');
}

function countUp(el, to) {
  const t0 = performance.now();
  const dur = reducedMotion ? 1 : 1400;
  const step = (now) => {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function showCount(count) {
  if (!Number.isFinite(count) || count < CONFIG.showCountFrom) return;
  const el = $('#notify-count');
  el.hidden = false;
  el.innerHTML = '<span class="pulse" aria-hidden="true"></span><span><b>0</b> players in line</span>';
  countUp(el.querySelector('b'), count);
}

async function loadCount() {
  try {
    const res = await fetch(CONFIG.notifyEndpoint, { headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    showCount((await res.json()).count);
  } catch { /* the count is decoration; stay quiet */ }
}

function setupForm() {
  if (!CONFIG.notifyEndpoint) {
    form.hidden = true;
    return;
  }
  if (store.get(STORAGE_KEY)) {
    markJoined();
    setMessage("You're on the list. We'll email you the moment doors open.", 'ok');
  }
  loadCount();

  emailInput.addEventListener('input', () => {
    if (msg.classList.contains('is-err')) {
      field.classList.remove('has-error');
      setMessage(DEFAULT_MSG);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (btn.classList.contains('is-loading') || btn.classList.contains('is-done')) return;
    const email = emailInput.value.trim();
    if (!EMAIL_RE.test(email)) {
      flagError('Enter a full email address, like you@email.com.');
      emailInput.focus();
      return;
    }

    btn.classList.add('is-loading');
    btn.setAttribute('aria-busy', 'true');
    try {
      const res = await fetch(CONFIG.notifyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, company: form.company.value }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) throw new Error('Too many tries from this network. Give it a few minutes.');
      if (res.status === 400) throw new Error('That email does not look right. Check it and try again.');
      if (!res.ok) throw new Error("We couldn't reach the list just now. Try again in a moment.");

      store.set(STORAGE_KEY, '1');
      markJoined();
      setMessage(data.already
        ? "You're already on the list. We'll email you the moment doors open."
        : "You're on the list. We'll email you the moment doors open.", 'ok');
      burst(btn);
      if (data.count) showCount(data.count);
    } catch (err) {
      flagError(err instanceof TypeError
        ? "We couldn't reach the list just now. Try again in a moment."
        : err.message);
    } finally {
      btn.classList.remove('is-loading');
      btn.removeAttribute('aria-busy');
    }
  });
}

function burst(origin) {
  if (reducedMotion) return;
  const r = origin.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const colors = ['#b47bff', '#8a2bf6', '#ffffff', '#d32ce6', '#ffd24a'];
  for (let i = 0; i < 34; i++) {
    const s = document.createElement('span');
    s.className = 'spark';
    s.style.left = `${cx}px`;
    s.style.top = `${cy}px`;
    s.style.setProperty('--c', colors[i % colors.length]);
    const size = 4 + Math.random() * 6;
    s.style.width = s.style.height = `${size}px`;
    document.body.appendChild(s);
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 160;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 40;
    s.animate([
      { transform: 'translate(-50%, -50%) rotate(45deg) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 80}px)) rotate(${225 + Math.random() * 180}deg) scale(.2)`, opacity: 0 },
    ], { duration: 900 + Math.random() * 600, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' })
      .finished.then(() => s.remove());
  }
}

/* ── Vault spotlight & rail ────────────────────────────────────── */

// Steam image, falling back to the vector silhouette if it cannot load.
function skinArt(item, size, eager = false) {
  const img = new Image();
  img.alt = '';
  img.decoding = 'async';
  img.loading = eager ? 'eager' : 'lazy';
  img.referrerPolicy = 'no-referrer';
  img.addEventListener('error', () => {
    const t = document.createElement('template');
    t.innerHTML = weaponSvg(item.shape, item.paint);
    img.replaceWith(t.content.firstElementChild);
  }, { once: true });
  img.src = item.image(size);
  return img;
}

function setupVault() {
  const vault = $('#vault');
  const spot = $('#spot');
  const stage = $('#spot-stage');
  const meta = $('.spot-meta');
  const rail = $('#rail-row');
  const bar = $('#spot-progress');
  const total = VAULT.length;
  const duration = CONFIG.spotlightSeconds * 1000;
  const slides = new Map();
  let current = -1;
  let elapsed = 0;
  let hovering = false;
  let inView = false;

  $('#spot-total').textContent = pad2(total);

  const railItem = (it, i, clone) => `
    <button class="rail-item" type="button" data-i="${i}" style="--r:${it.color}"${clone ? ' tabindex="-1" aria-hidden="true"' : ` aria-label="Show ${it.weapon} | ${it.skin}"`}>
      <span class="rail-art"></span>
      <span class="rail-weapon">${it.weapon}</span>
      <span class="rail-skin">${it.skin}</span>
    </button>`;
  // Two copies so the marquee loops seamlessly at -50%.
  rail.innerHTML = VAULT.map((it, i) => railItem(it, i, false)).join('') + VAULT.map((it, i) => railItem(it, i, true)).join('');
  $$('.rail-item', rail).forEach((el) => {
    $('.rail-art', el).appendChild(skinArt(VAULT[el.dataset.i], '256fx192f'));
    el.addEventListener('click', () => { show(Number(el.dataset.i)); elapsed = 0; });
  });

  function show(i) {
    i = (i + total) % total;
    if (i === current) return;
    const item = VAULT[i];

    const prev = slides.get(current);
    if (prev) {
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
    }

    let slide = slides.get(i);
    if (!slide) {
      slide = document.createElement('div');
      slide.className = 'spot-item';
      slide.appendChild(skinArt(item, '512fx384f', true));
      stage.appendChild(slide);
      slides.set(i, slide);
    } else {
      // Reset a slide that is still leaving so it enters from the right again.
      slide.style.transition = 'none';
      slide.classList.remove('is-leaving');
      slide.getBoundingClientRect();
      slide.style.transition = '';
    }
    requestAnimationFrame(() => slide.classList.add('is-active'));

    vault.style.setProperty('--rc', item.color);
    const fill = () => {
      $('#spot-rarity').textContent = item.rarity;
      $('#spot-weapon').textContent = item.weapon;
      $('#spot-skin').textContent = item.skin;
      meta.classList.remove('is-swapping');
    };
    if (current === -1) fill();
    else {
      meta.classList.add('is-swapping');
      setTimeout(fill, 260);
    }
    $('#spot-index').textContent = pad2(i + 1);
    $$('.rail-item', rail).forEach((el) => el.classList.toggle('is-current', Number(el.dataset.i) === i));
    current = i;

    // Warm the next image so autoplay never shows an empty stage.
    new Image().src = VAULT[(i + 1) % total].image('512fx384f');
  }

  $('#spot-prev').addEventListener('click', () => { show(current - 1); elapsed = 0; });
  $('#spot-next').addEventListener('click', () => { show(current + 1); elapsed = 0; });

  // Pause while the visitor is looking closely or the section is off-screen.
  [spot, $('.spot-controls'), $('.rail')].forEach((el) => {
    el.addEventListener('pointerenter', () => { hovering = true; });
    el.addEventListener('pointerleave', () => { hovering = false; });
    el.addEventListener('focusin', () => { hovering = true; });
    el.addEventListener('focusout', () => { hovering = false; });
  });
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0.25 }).observe(spot);

  show(0);

  if (!reducedMotion) {
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(now - last, 100);
      last = now;
      const paused = hovering || !inView || document.hidden;
      vault.classList.toggle('is-paused', paused);
      if (!paused) elapsed += dt;
      if (elapsed >= duration) {
        elapsed = 0;
        show(current + 1);
      }
      bar.style.transform = `scaleX(${(elapsed / duration).toFixed(4)})`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Gentle 3D tilt of the spotlight toward the pointer.
  if (finePointer && !reducedMotion) {
    spot.addEventListener('pointermove', (e) => {
      const r = spot.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      stage.style.setProperty('--sry', `${(x * 14).toFixed(2)}deg`);
      stage.style.setProperty('--srx', `${(-y * 10).toFixed(2)}deg`);
    });
    spot.addEventListener('pointerleave', () => {
      stage.style.setProperty('--sry', '0deg');
      stage.style.setProperty('--srx', '0deg');
    });
  }
}

/* ── Discord ───────────────────────────────────────────────────── */

async function setupDiscord() {
  $$('.js-discord').forEach((a) => { a.href = CONFIG.discordUrl; });
  if (!CONFIG.discordStatsEndpoint) return;
  try {
    const res = await fetch(CONFIG.discordStatsEndpoint, { headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    const { members, online } = await res.json();
    if (!Number.isFinite(members) || members <= 0) return;
    const el = $('#discord-stats');
    el.innerHTML = '<span class="pulse pulse--online" aria-hidden="true"></span>' +
      `<span>${Number.isFinite(online) ? '<b data-n="online">0</b> online · ' : ''}<b data-n="members">0</b> members</span>`;
    el.hidden = false;
    if (Number.isFinite(online)) countUp($('[data-n="online"]', el), online);
    countUp($('[data-n="members"]', el), members);
  } catch { /* counts are optional */ }
}

/* ── Header, reveals & pointer effects ─────────────────────────── */

function setupHeader() {
  const top = $('#top');
  const onScroll = () => top.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function setupReveals() {
  if (reducedMotion || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('reveal-ready');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  $$('[data-reveal]').forEach((el) => io.observe(el));
}

function setupPointer() {
  if (!finePointer || reducedMotion) return;

  const tilt = $('#emblem-tilt');
  const target = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  const loop = () => {
    cur.x += (target.x - cur.x) * 0.07;
    cur.y += (target.y - cur.y) * 0.07;
    tilt.style.setProperty('--ry', `${(cur.x * 14).toFixed(2)}deg`);
    tilt.style.setProperty('--rx', `${(-cur.y * 12).toFixed(2)}deg`);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  // Spotlight that follows the pointer across the countdown tiles.
  $$('.cd-unit').forEach((tile) => {
    tile.addEventListener('pointermove', (e) => {
      const r = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', `${e.clientX - r.left}px`);
      tile.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
    tile.addEventListener('pointerleave', () => {
      tile.style.setProperty('--mx', '50%');
      tile.style.setProperty('--my', '0%');
    });
  });

  // Magnetic pull on the buttons.
  $$('.btn').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.setProperty('--tx', `${((e.clientX - r.left) / r.width - 0.5) * 8}px`);
      b.style.setProperty('--ty', `${((e.clientY - r.top) / r.height - 0.5) * 6}px`);
    });
    b.addEventListener('pointerleave', () => {
      b.style.setProperty('--tx', '0px');
      b.style.setProperty('--ty', '0px');
    });
  });
}

/* ── Crown mode (easter egg) ───────────────────────────────────── */

let toastTimer = 0;
function toast(text) {
  const t = $('#toast');
  t.textContent = text;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), 3200);
}

function setupCrownMode() {
  const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let pos = 0;
  window.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = key === code[pos] ? pos + 1 : (key === code[0] ? 1 : 0);
    if (pos < code.length) return;
    pos = 0;
    const on = document.documentElement.classList.toggle('crown-mode');
    bg?.setGold(on);
    toast(on ? 'Crown mode unlocked' : 'Crown mode off');
  });
}

/* ── Boot ──────────────────────────────────────────────────────── */

showLaunchTime();
scheduleCountdown();
setupForm();
setupVault();
setupDiscord();
setupHeader();
setupReveals();
setupPointer();
setupCrownMode();
runIntro();

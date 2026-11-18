'use strict';
const CATS = {
  peliculas: { badge: 'PELÍCULA', icon: '▶', ph: 'Ej. Interestelar', empty: 'Aún no hay películas', fields: [['anio', 'Año', 'number'], ['director', 'Director'], ['empresa', 'Empresa'], ['genero', 'Género'], ['duracion', 'Duración']] },
  series: { badge: 'SERIE', icon: '▣', ph: 'Ej. Dark', empty: 'Aún no hay series', fields: [['temporadas', 'Temporadas', 'number'], ['capitulos', 'Capítulos', 'number']] },
  musica: { badge: 'MÚSICA', icon: '♫', ph: 'Ej. Midnight City', empty: 'Aún no hay música', fields: [['autor', 'Autor'], ['anio', 'Año', 'number'], ['album', 'Álbum'], ['duracion', 'Duración']] }
};
const FMT = { cuadrada: [1080, 1080], vertical: [1080, 1350], historia: [1080, 1920] };
const FMT_NAMES = { cuadrada: 'Cuadrada', vertical: 'Vertical', historia: 'Historia' };
const FONTS = { sans: 'DM Sans', serif: 'Fraunces', hand: 'Caveat', impact: 'Bebas Neue', script: 'Pacifico', mono: 'Space Mono' };
const FONT_NAMES = { sans: 'Moderna', serif: 'Elegante', hand: 'A mano', impact: 'Titular', script: 'Cursiva', mono: 'Retro' };
const TPLS = { poster: 'Póster', clasica: 'Clásica', polaroid: 'Polaroid', revista: 'Revista', ticket: 'Boleto', neon: 'Neón' };
const MODES = { liso: 'Liso', grad: 'Degradado', radial: 'Radial' };
const PATS = { none: 'Sin patrón', puntos: 'Puntos', rayas: 'Rayas', cuadros: 'Cuadrícula', estrellas: 'Estrellas' };
const FILTERS = { none: 'none', bn: 'grayscale(1) contrast(1.1)', sepia: 'sepia(.8)', calido: 'sepia(.35) saturate(1.4) hue-rotate(-12deg)', frio: 'saturate(1.1) hue-rotate(18deg) brightness(1.03)', vivo: 'saturate(1.6) contrast(1.1)', suave: 'contrast(.85) brightness(1.1) saturate(.85)' };
const FILTER_NAMES = { none: 'Original', bn: 'B/N', sepia: 'Sepia', calido: 'Cálido', frio: 'Frío', vivo: 'Vívido', suave: 'Suave' };
const EMOJIS = ['🎬', '🍿', '⭐', '❤️', '🔥', '🎧', '🌙', '📺', '🎵', '✨', '😭', '💜'];
const PALS = [['#1f2347', '#ffb199'], ['#14342f', '#f2d27a'], ['#3b1f3f', '#ff9ec4'], ['#f6efe4', '#d9583b'], ['#111111', '#7cffb2'], ['#e6eeff', '#3a5bd9'], ['#ffd9c7', '#7a2e1a'], ['#2d1b4e', '#ffd166'], ['#0b3d5c', '#7fe3ff'], ['#f9e6ee', '#c2185b'], ['#202020', '#ff5a36'], ['#e9f5db', '#3b7a2a']];
const LOOKS = {
  'Cine nocturno': { tpl: 'poster', bg: '#0f1230', bg2: '#2a1a4a', mode: 'grad', pat: 'estrellas', accent: '#ffd37a', font: 'serif', filter: 'none' },
  'Atardecer': { tpl: 'clasica', bg: '#ff9a6b', bg2: '#8a3b6e', mode: 'grad', pat: 'none', accent: '#fff1d6', font: 'script', filter: 'calido' },
  'Papel antiguo': { tpl: 'polaroid', bg: '#e9dcc3', bg2: '#d2bf9b', mode: 'liso', pat: 'puntos', accent: '#7a2e1a', font: 'hand', filter: 'sepia' },
  'Neón 90s': { tpl: 'neon', bg: '#0b0b1a', bg2: '#2b0a4a', mode: 'grad', pat: 'cuadros', accent: '#39ffb0', font: 'impact', filter: 'vivo' },
  'Menta fresca': { tpl: 'revista', bg: '#d9f2e6', bg2: '#7fc8a9', mode: 'grad', pat: 'none', accent: '#14534a', font: 'sans', filter: 'none' },
  'Cine clásico': { tpl: 'ticket', bg: '#f4e9d4', bg2: '#e2cfa8', mode: 'liso', pat: 'rayas', accent: '#b3261e', font: 'mono', filter: 'sepia' }
};
const DEF = () => ({ tpl: 'poster', bg: '#1f2347', bg2: '#3b2a5e', mode: 'liso', pat: 'none', accent: '#ffb199', font: 'sans', fmt: 'vertical', zoom: 1, radius: 40, pr: 24, bw: 0, fw: 0, filter: 'none', al: 'auto', ts: 1, upper: false, ink: 'auto', epos: 'tr', esz: 1, hide: [] });
const $ = (s, r = document) => r.querySelector(s);
const fontsReady = document.fonts ? Promise.all(Object.values(FONTS).map((f) => document.fonts.load(`700 40px "${f}"`).catch(() => {}))) : Promise.resolve();

function h(tag, p = {}, ...kids) {
  const e = document.createElement(tag);
  for (const k in p) {
    if (k === 'class') e.className = p[k];
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), p[k]);
    else if (k in e) e[k] = p[k];
    else e.setAttribute(k, p[k]);
  }
  e.append(...kids);
  return e;
}
const lum = (hex) => { const n = parseInt(hex.slice(1), 16), f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(n >> 16) + .7152 * f((n >> 8) & 255) + .0722 * f(n & 255); };

function wrap(c, text, maxW, maxLines) {
  const lines = []; let line = '';
  for (const w of text.split(/\s+/)) {
    const t = line ? `${line} ${w}` : w;
    if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  lines.push(line);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/.?.?$/, '…'); }
  return lines;
}

const loadImg = (src) => new Promise((res) => {
  if (!src) return res(null);
  const i = new Image();
  if (!/^(data|blob):/.test(src)) i.crossOrigin = 'anonymous';
  i.onload = () => res(i); i.onerror = () => res(null); i.src = src;
});
function shrink(img, max = 900) {
  const k = Math.min(1, max / Math.max(img.width, img.height)), cv = document.createElement('canvas');
  cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
  const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height); x.drawImage(img, 0, 0, cv.width, cv.height);
  return cv.toDataURL('image/jpeg', .85);
}

/* Dibuja la tarjeta: la misma función sirve para la vista previa, la colección y la descarga. */
function draw(cv, card, img, cat, k = 1) {
  const s = card.style, [W, H] = FMT[s.fmt] || FMT.vertical, c = cv.getContext('2d');
  cv.width = Math.round(W * k); cv.height = Math.round(H * k); c.scale(k, k);
  const t = s.tpl, pol = t === 'polaroid', P = 72, base = s.mode === 'liso' ? s.bg : s.bg2;
  const dark = s.ink === 'light' ? true : s.ink === 'dark' ? false : !pol && lum(base) < .35;
  const ink = dark ? '#fff' : '#241f1b', sub = dark ? 'rgba(255,255,255,.75)' : 'rgba(36,31,27,.65)';
  const fam = `"${FONTS[s.font]}","DM Sans",sans-serif`, wt = s.font === 'impact' || s.font === 'script' ? 400 : 700, big = { impact: 1.25, hand: 1.2, script: .85 }[s.font] || 1;
  const al = s.al === 'auto' ? (pol ? 'center' : 'left') : s.al, raw = (card.titulo || '').trim() || 'Tu título aquí', title = s.upper ? raw.toUpperCase() : raw;
  c.beginPath(); c.roundRect(0, 0, W, H, s.radius); c.clip();
  let g = null;
  if (s.mode === 'grad') g = c.createLinearGradient(0, 0, W * .35, H);
  else if (s.mode === 'radial') g = c.createRadialGradient(W / 2, H * .35, 40, W / 2, H * .35, H * .85);
  if (g) { g.addColorStop(0, s.bg); g.addColorStop(1, s.bg2); }
  c.fillStyle = g || s.bg; c.fillRect(0, 0, W, H);

  const pattern = () => {
    if (s.pat === 'none') return;
    c.save(); c.fillStyle = c.strokeStyle = s.accent; c.globalAlpha = .2; c.lineWidth = 3;
    if (s.pat === 'puntos') for (let y = 24; y < H; y += 48) for (let x = 24; x < W; x += 48) { c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); }
    if (s.pat === 'rayas') for (let i = -H; i < W; i += 44) { c.beginPath(); c.moveTo(i, H); c.lineTo(i + H, 0); c.stroke(); }
    if (s.pat === 'cuadros') for (let i = 0; i < Math.max(W, H); i += 60) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, H); c.moveTo(0, i); c.lineTo(W, i); c.stroke(); }
    if (s.pat === 'estrellas') { c.globalAlpha = .55; for (let i = 1; i < 90; i++) { c.beginPath(); c.arc((i * 7919) % W, (i * 104729) % H, 2 + (i % 4), 0, 7); c.fill(); } }
    c.restore();
  };

  const photo = (x, y, w, hh, r) => {
    c.save(); c.beginPath(); c.roundRect(x, y, w, hh, r); c.clip();
    if (img) { c.filter = FILTERS[s.filter] || 'none'; const z = Math.max(w / img.width, hh / img.height) * s.zoom; c.drawImage(img, x + (w - img.width * z) / 2, y + (hh - img.height * z) / 2, img.width * z, img.height * z); c.filter = 'none'; }
    else {
      const gg = c.createLinearGradient(x, y, x + w, y + hh); gg.addColorStop(0, s.accent); gg.addColorStop(1, s.bg);
      c.fillStyle = gg; c.fillRect(x, y, w, hh); c.fillStyle = 'rgba(255,255,255,.6)'; c.font = '220px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(cat.icon, x + w / 2, y + hh / 2);
    }
    c.restore();
    if (s.bw) { c.save(); c.lineWidth = s.bw; c.strokeStyle = s.accent; c.beginPath(); c.roundRect(x, y, w, hh, r); c.stroke(); c.restore(); }
  };

  const block = (x, y0, w, dry) => {
    let y = y0; c.textAlign = al; c.textBaseline = 'alphabetic';
    const X = al === 'center' ? x + w / 2 : al === 'right' ? x + w : x, T = (tx, yy) => { if (!dry) c.fillText(tx, X, yy); };
    c.font = '700 26px "DM Sans",sans-serif'; c.letterSpacing = '5px'; c.fillStyle = s.accent; y += 26; T(cat.badge, y); c.letterSpacing = '0px'; y += 30;
    const fs = (title.length > 22 ? 76 : 96) * big * s.ts; c.font = `${wt} ${fs}px ${fam}`; c.fillStyle = ink;
    wrap(c, title, w, 3).forEach((l) => { y += fs * 1.05; T(l, y); }); y += 14;
    c.font = '500 34px "DM Sans",sans-serif'; c.fillStyle = sub;
    cat.fields.filter(([key]) => card[key] && !s.hide.includes(key)).forEach(([key, l]) => { y += 48; T(`${l}: ${card[key]}`, y); });
    if (card.rating) { y += 76; c.font = '56px "DM Sans",sans-serif'; c.fillStyle = s.accent; c.letterSpacing = '6px'; T('★'.repeat(card.rating) + '☆'.repeat(5 - card.rating), y); c.letterSpacing = '0px'; }
    if (card.nota) { const f = s.font === 'hand' ? 46 : 38; c.font = `italic 500 ${f}px ${fam}`; c.fillStyle = ink; y += 26; wrap(c, `“${card.nota}”`, w, 3).forEach((l) => { y += f * 1.35; T(l, y); }); }
    return y - y0;
  };

  let notch = 0;
  if (t === 'poster' || t === 'revista') {
    const top = t === 'revista'; photo(0, 0, W, H, 0);
    const hh = block(P, 0, W - 2 * P, true), gr = top ? c.createLinearGradient(0, 0, 0, P + hh + 300) : c.createLinearGradient(0, H - P - hh - 260, 0, H - P - hh + 90);
    if (top) { gr.addColorStop(0, s.bg); gr.addColorStop(1, s.bg + '00'); c.fillStyle = gr; c.fillRect(0, 0, W, P + hh + 300); }
    else { gr.addColorStop(0, base + '00'); gr.addColorStop(1, base); c.fillStyle = gr; c.fillRect(0, 0, W, H); c.fillStyle = base; c.fillRect(0, H - P - hh + 90, W, H); }
    pattern();
    if (top) { c.fillStyle = s.accent; c.fillRect(al === 'right' ? W - P - 160 : al === 'center' ? W / 2 - 80 : P, P - 22, 160, 12); }
    block(P, top ? P : H - P - hh, W - 2 * P);
  } else {
    pattern();
    if (pol) { c.fillStyle = '#fffdf8'; c.beginPath(); c.roundRect(44, 44, W - 88, H - 88, Math.max(0, s.radius - 22)); c.fill(); }
    const Q = pol ? 96 : t === 'neon' ? 90 : P, gap = t === 'ticket' ? 70 : 36, hh = block(Q, 0, W - 2 * Q, true), ih = Math.max(240, H - 2 * Q - hh - gap);
    photo(Q, Q, W - 2 * Q, ih, pol ? 10 : s.pr);
    if (t === 'ticket') { notch = Q + ih + gap / 2; c.save(); c.strokeStyle = sub; c.lineWidth = 4; c.setLineDash([16, 14]); c.beginPath(); c.moveTo(Q, notch); c.lineTo(W - Q, notch); c.stroke(); c.restore(); }
    if (t === 'neon') { c.save(); c.strokeStyle = s.accent; c.shadowColor = s.accent; c.shadowBlur = 36; c.lineWidth = 7; c.beginPath(); c.roundRect(34, 34, W - 68, H - 68, Math.max(0, s.radius - 12)); c.stroke(); c.stroke(); c.restore(); }
    block(Q, Q + ih + gap, W - 2 * Q);
  }
  if (card.emoji) {
    const r = 76 * s.esz, m = P + r, ex = s.epos[1] === 'r' ? W - m : m, ey = s.epos[0] === 't' ? m : H - m;
    c.save(); c.translate(ex, ey); c.rotate(-.2); c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 24;
    c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.shadowBlur = 0; c.font = `${96 * s.esz}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(card.emoji, 0, 6 * s.esz); c.restore();
  }
  if (s.fw) { c.strokeStyle = s.accent; c.lineWidth = s.fw; c.beginPath(); c.roundRect(s.fw / 2, s.fw / 2, W - s.fw, H - s.fw, Math.max(0, s.radius - s.fw / 2)); c.stroke(); }
  if (notch) { c.save(); c.globalCompositeOperation = 'destination-out'; [0, W].forEach((x) => { c.beginPath(); c.arc(x, notch, 36, 0, 7); c.fill(); }); c.restore(); }
  cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', `Tarjeta: ${raw}`);
}

function initNavigation() {
  const t = $('.menu-toggle'), n = $('.nav-links');
  if (!t || !n) return;
  t.addEventListener('click', () => t.setAttribute('aria-expanded', String(n.classList.toggle('open'))));
  n.addEventListener('click', (e) => { if (e.target.closest('a')) { n.classList.remove('open'); t.setAttribute('aria-expanded', 'false'); } });
}

function initHome() {
  const S = [
    ['peliculas', { titulo: 'La última estación', anio: '2026', director: 'Andrea Solís', genero: 'Drama', nota: 'La vi con mi mamá y nos encantó.', rating: 5, emoji: '🎬' }, LOOKS['Cine nocturno']],
    ['musica', { titulo: 'Luces de invierno', autor: 'Nube Norte', anio: '2025', nota: 'Perfecta para días de lluvia.', rating: 4, emoji: '🌧️' }, LOOKS['Papel antiguo']],
    ['series', { titulo: 'Frecuencia cero', temporadas: '3', capitulos: '24', rating: 5, emoji: '📡' }, LOOKS['Neón 90s']],
    ['peliculas', { titulo: 'Otros mundos', genero: 'Fantasía', anio: '2024', nota: 'Mi peli de domingo.', rating: 4, emoji: '✨' }, LOOKS['Atardecer']],
    ['musica', { titulo: 'Verano eterno', autor: 'Luna Roja', anio: '2023', rating: 5, emoji: '🎧' }, { ...LOOKS['Menta fresca'], epos: 'br' }],
    ['peliculas', { titulo: 'Noche de estreno', anio: '1994', director: 'M. Ferrer', nota: 'Una de las favoritas de mi abuelo.', rating: 5, emoji: '🍿' }, LOOKS['Cine clásico']]
  ];
  const mk = ([key, d, st], k, cls) => { const cv = h('canvas', { class: cls || '' }); draw(cv, { nota: '', emoji: '', rating: 0, ...d, style: { ...DEF(), ...st } }, null, CATS[key], k); return cv; };
  fontsReady.then(() => {
    $('#sample-carousel')?.replaceChildren(...S.map((x) => h('div', { class: 'sample-card' }, mk(x, .4))));
    $('#hero-stack')?.replaceChildren(mk(S[0], .5, 'hero-c1'), mk(S[1], .5, 'hero-c2'));
  });
  document.querySelectorAll('[data-carousel]').forEach((b) => b.addEventListener('click', () => $('#sample-carousel').scrollBy({ left: (b.dataset.carousel === 'next' ? 1 : -1) * 260, behavior: 'smooth' })));
}

function initStudio(key) {
  const cat = CATS[key], store = `tarjetas-app-v1-${key}`, cv = $('#preview'), form = $('#card-form'), grid = $('#cards-grid');
  const fresh = () => ({ titulo: '', nota: '', emoji: '', rating: 0, img: '', style: DEF() });
  const clone = (c) => { const o = JSON.parse(JSON.stringify(c)); o.style = { ...DEF(), ...(o.style || {}) }; o.img = o.img || o.imagen || ''; return o; };
  let cards = [], card = fresh(), img = null, editing = null, raf, tt; const sync = [], cache = new Map();
  try { const p = JSON.parse(localStorage.getItem(store)); if (Array.isArray(p)) cards = p.filter((x) => x && x.id); } catch (e) { /* sin datos */ }

  const toast = (m, bad) => { const t = $('#toast'); t.textContent = m; t.classList.toggle('error', !!bad); t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 3200); };
  const save = () => { try { localStorage.setItem(store, JSON.stringify(cards)); return true; } catch (e) { toast('No hay espacio para guardar más. Elimina alguna tarjeta que ya no uses.', true); return false; } };
  const imgOf = async (c) => { const s = c.img || c.imagen || ''; if (!cache.has(s)) cache.set(s, await loadImg(s)); return cache.get(s); };
  const render = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => fontsReady.then(() => draw(cv, card, img, cat, .6))); };
  const refresh = () => { sync.forEach((f) => f()); render(); };

  /* Controles */
  const field = (l, ctl, o = {}) => h(o.div ? 'div' : 'label', { class: 'f' + (o.wide ? ' wide' : '') }, h('span', {}, l), ctl, ...(o.hint ? [h('small', {}, o.hint)] : []));
  const group = (title, open, ...kids) => h('details', { class: 'group', open }, h('summary', {}, title), h('div', { class: 'group-body' }, ...kids));
  const text = (get, set, p = {}) => { const i = h('input', p); i.addEventListener('input', () => { set(i.value); render(); }); sync.push(() => { i.value = get() ?? ''; }); return i; };
  const chips = (opts, on, pick) => {
    const w = h('div', { class: 'chips' }), bs = Object.entries(opts).map(([k, l]) => { const b = h('button', { type: 'button', class: 'chip', onclick: () => { pick(k); refresh(); } }, l); w.append(b); return [k, b]; });
    sync.push(() => bs.forEach(([k, b]) => b.setAttribute('aria-pressed', String(on(k))))); return w;
  };
  const range = (name, min, max, step) => { const i = h('input', { type: 'range', min, max, step }); i.addEventListener('input', () => { card.style[name] = +i.value; render(); }); sync.push(() => { i.value = card.style[name]; }); return i; };
  const color = (name) => { const i = h('input', { type: 'color' }); i.addEventListener('input', () => { card.style[name] = i.value; refresh(); }); sync.push(() => { i.value = card.style[name]; }); return i; };
  const stars = h('div', { class: 'chips' }, ...[1, 2, 3, 4, 5].map((n) => h('button', { type: 'button', class: 'star', 'aria-label': `${n} de 5`, onclick: () => { card.rating = card.rating === n ? 0 : n; refresh(); } }, '★')));
  sync.push(() => [...stars.children].forEach((b, i) => b.setAttribute('aria-pressed', String(i < card.rating))));
  const swatches = h('div', { class: 'chips' }, ...PALS.map(([bg, ac]) => h('button', { type: 'button', class: 'sw', 'aria-label': 'Paleta de colores', style: `background:linear-gradient(135deg,${bg} 50%,${ac} 50%)`, onclick: () => { card.style.bg = bg; card.style.accent = ac; refresh(); } })));

  const setImage = async (data) => { card.img = data; img = await imgOf(card); refresh(); };
  const file = h('input', { type: 'file', accept: 'image/*', hidden: true });
  file.addEventListener('change', async () => {
    const f = file.files[0]; if (!f) return;
    const u = URL.createObjectURL(f), im = await loadImg(u); URL.revokeObjectURL(u); file.value = '';
    im ? setImage(shrink(im)) : toast('No pudimos abrir esa imagen. Prueba con otra.', true);
  });
  const urlIn = h('input', { type: 'url', placeholder: 'o pega un enlace de imagen', autocomplete: 'off' });
  urlIn.addEventListener('change', async () => {
    if (!urlIn.value.trim()) return;
    const im = await loadImg(urlIn.value.trim());
    if (im) { setImage(shrink(im)); urlIn.value = ''; } else toast('Ese sitio no deja usar la imagen. Descárgala y súbela desde tu dispositivo.', true);
  });
  const imgBox = h('div', { class: 'imgbox' }, h('button', { type: 'button', class: 'button button-quiet', onclick: () => file.click() }, '📷 Subir foto'), h('button', { type: 'button', class: 'button button-quiet', onclick: () => setImage('') }, 'Quitar'), file, urlIn);

  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const random = () => { const [bg, ac] = rnd(PALS); Object.assign(card.style, { tpl: rnd(Object.keys(TPLS)), font: rnd(Object.keys(FONTS)), pat: rnd(Object.keys(PATS)), mode: rnd(Object.keys(MODES)), bg, bg2: rnd(PALS)[0], accent: ac }); refresh(); };
  const looks = h('div', { class: 'chips' }, ...Object.entries(LOOKS).map(([n, l]) => h('button', { type: 'button', class: 'chip', onclick: () => { Object.assign(card.style, l); refresh(); } }, n)), h('button', { type: 'button', class: 'chip', onclick: random }, '🎲 Sorpréndeme'));
  const one = (name, opts) => chips(opts, (v) => card.style[name] === v, (v) => { card.style[name] = v; });
  const toggle = (name, label) => chips({ on: label }, () => card.style[name], () => { card.style[name] = !card.style[name]; });
  const W2 = { div: true, wide: true };

  form.append(
    group('Lo que dice tu tarjeta', true,
      field('Título', text(() => card.titulo, (v) => { card.titulo = v; }, { placeholder: cat.ph, maxLength: 80 }), { wide: true }),
      field('Imagen', imgBox, W2),
      ...cat.fields.map(([k, l, t]) => field(l, text(() => card[k], (v) => { card[k] = v; }, { type: t || 'text', placeholder: l, maxLength: 40 }))),
      field('Una nota tuya', text(() => card.nota, (v) => { card.nota = v; }, { placeholder: 'Ej. La vi con mi familia y nos encantó', maxLength: 100 }), { wide: true }),
      field('Tu calificación', stars, { div: true }),
      field('Emoji', text(() => card.emoji, (v) => { card.emoji = v; }, { placeholder: '🎬', maxLength: 4 }))
    ),
    group('Estilo', true,
      field('Looks listos', looks, { ...W2, hint: 'Un clic y cambia todo. Después ajusta lo que quieras.' }),
      field('Plantilla', one('tpl', TPLS), W2),
      field('Paletas', swatches, W2),
      field('Fondo', color('bg')), field('Segundo color', color('bg2')),
      field('Acento', color('accent')), field('Tipo de fondo', one('mode', MODES), { div: true }),
      field('Patrón', one('pat', PATS), W2),
      field('Letra', one('font', FONT_NAMES), W2),
      field('Tamaño', one('fmt', FMT_NAMES), W2)
    ),
    group('Texto', false,
      field('Alineación', one('al', { auto: 'Según plantilla', left: 'Izquierda', center: 'Centro', right: 'Derecha' }), W2),
      field('Color del texto', one('ink', { auto: 'Automático', light: 'Claro', dark: 'Oscuro' }), W2),
      field('Tamaño del título', range('ts', .6, 1.4, .05)), field('Estilo', toggle('upper', 'MAYÚSCULAS'), { div: true })
    ),
    group('Foto y forma', false,
      field('Filtro de la foto', one('filter', FILTER_NAMES), W2),
      field('Acercar foto', range('zoom', 1, 2.5, .05)), field('Esquinas de la tarjeta', range('radius', 0, 90, 1)),
      field('Esquinas de la foto', range('pr', 0, 300, 2)), field('Borde de la foto', range('bw', 0, 24, 1)),
      field('Marco de la tarjeta', range('fw', 0, 40, 1)),
      field('Datos visibles', chips(Object.fromEntries(cat.fields.map(([k, l]) => [k, l])), (k) => !card.style.hide.includes(k), (k) => { const hd = card.style.hide; card.style.hide = hd.includes(k) ? hd.filter((x) => x !== k) : [...hd, k]; }), { ...W2, hint: 'Elige qué datos aparecen en la tarjeta.' })
    ),
    group('Pegatina', false,
      field('Elige una', chips(Object.fromEntries(EMOJIS.map((e) => [e, e])), (e) => card.emoji === e, (e) => { card.emoji = card.emoji === e ? '' : e; }), W2),
      field('Posición', one('epos', { tl: '↖', tr: '↗', bl: '↙', br: '↘' }), { div: true }), field('Tamaño', range('esz', .5, 2, .1))
    )
  );
  form.addEventListener('submit', (e) => e.preventDefault());

  /* Acciones */
  async function download(c, im) {
    await fontsReady; const o = document.createElement('canvas'); draw(o, c, im, cat, 1);
    o.toBlob((b) => {
      if (!b) return toast('No pudimos crear la imagen. Intenta de nuevo.', true);
      const a = h('a', { href: URL.createObjectURL(b), download: ((c.titulo || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tarjeta') + '.png' });
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); toast('¡Listo! Tu tarjeta ya está en tus descargas.');
    }, 'image/png');
  }
  const dl = h('button', { type: 'button', class: 'button button-primary', onclick: () => download(card, img) }, 'Descargar imagen ↓');
  const sv = h('button', { type: 'button', class: 'button button-quiet', onclick: saveCard }, 'Guardar en mi colección');
  const cancel = h('button', { type: 'button', class: 'button button-quiet', hidden: true, onclick: () => reset() }, 'Cancelar edición');
  $('#stage-actions').append(dl, sv, cancel);

  function reset() { card = fresh(); img = null; editing = null; sv.textContent = 'Guardar en mi colección'; cancel.hidden = true; refresh(); }
  function saveCard() {
    if (!card.titulo.trim()) { toast('Ponle un título a tu tarjeta primero.', true); return form.querySelector('input').focus(); }
    const data = clone(card), uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    const prev = cards; cards = editing ? cards.map((x) => (x.id === editing ? { ...x, ...data, updatedAt: Date.now() } : x)) : [...cards, { ...data, id: uid(), createdAt: Date.now() }];
    if (!save()) { cards = prev; return; }
    toast(editing ? 'Cambios guardados.' : '¡Guardada en tu colección!'); reset(); list();
  }
  async function edit(c) {
    card = clone(c); img = await imgOf(card); editing = c.id; sv.textContent = 'Guardar cambios'; cancel.hidden = false; refresh();
    $('.studio').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  async function list() {
    await fontsReady;
    const q = $('#search-cards').value.trim().toLowerCase();
    const shown = [...cards].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).filter((c) => JSON.stringify([c.titulo, c.nota, ...cat.fields.map(([k]) => c[k])]).toLowerCase().includes(q));
    $('#total-count').textContent = cards.length; $('#results-label').textContent = `${shown.length} ${shown.length === 1 ? 'tarjeta' : 'tarjetas'}`;
    $('#empty-state').hidden = shown.length > 0; $('#empty-state h3').textContent = cards.length ? 'No encontramos coincidencias' : cat.empty;
    const els = await Promise.all(shown.map(async (c, i) => {
      const c2 = clone(c), im = await imgOf(c2), cvs = h('canvas'); draw(cvs, c2, im, cat, .4);
      const act = (t, f, cls = '') => h('button', { type: 'button', class: cls, onclick: f }, t);
      return h('figure', { class: 'saved', style: `--i:${i}` }, cvs, h('figcaption', {}, h('b', {}, c.titulo), h('div', { class: 'acts' },
        act('Descargar', () => download(c2, im)), act('Editar', () => edit(c)),
        act('Eliminar', () => { if (confirm(`¿Eliminar "${c.titulo}"?`)) { const p = cards; cards = cards.filter((x) => x.id !== c.id); if (save()) { if (editing === c.id) reset(); list(); toast('Tarjeta eliminada.'); } else cards = p; } }, 'del'))));
    }));
    grid.replaceChildren(...els);
  }
  $('#search-cards').addEventListener('input', list);
  refresh(); list();
}

initNavigation();
if (document.body.dataset.page === 'catalog') initStudio(document.body.dataset.category); else initHome();

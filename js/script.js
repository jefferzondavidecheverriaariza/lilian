(() => {
'use strict';
const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rnd = (a, b) => a + Math.random() * (b - a);
const pad = n => String(n).padStart(2, '0');
const img = n => `assets/images/foto${pad(n)}.jpg`;
const AUDIO_SRC = 'assets/audio/perfect.mp3';
/* perfect.mp3 ya está recortado (empieza en el 2.º verso). Puente tranquilo ≈ 0:84, clímax ≈ 2:04 */
const T_BRIDGE = 84, T_CLIMAX = 124;

/* L: layout (top = texto arriba · stack = foto y texto agrupados · over = texto sobre la foto) */
const SCENES = [
 {n:1,  t:'Bueno... hoy la protagonista eres tú.', L:'over', e:'e-focus', d:'d-zoom', c:['#3f9a6a','#e0a35a']},
 {n:2,  t:'26 años ya... y todavía queda muchísimo por vivir.', L:'top', e:'e-left', d:'d-side', c:['#6fa84a','#d98f4a']},
 {n:3,  t:'Hay fotos que uno mira y automáticamente sonríe.', L:'over', e:'e-rise', d:'d-up', c:['#e8833a','#4a8f6a']},
 {n:4,  t:'Porque también se vale celebrar lo bonito de uno mismo.', L:'top', e:'e-scale', d:'d-zoom', c:['#a24a8f','#d9708a'], focus:true},
 {n:5,  t:'Creo que esta foto habla por sí sola.', L:'stack', e:'e-scale', d:'d-down', c:['#e59ab0','#6aa6c9']},
 {n:6,  t:'Ojalá este nuevo año te regale muchos momentos de esos que terminan convirtiéndose en buenos recuerdos.', L:'over', e:'e-right', d:'d-up', c:['#d9544a','#2aa59a']},
 {n:7,  t:'Que nunca te falten motivos para reírte así.', L:'stack', e:'e-focus', d:'d-zoom', c:['#e8b24a','#d96a8a']},
 {n:8,  t:'Y que sigas coleccionando momentos que algún día quieras volver a recordar.', L:'over', e:'e-mask', d:'d-down', c:['#3f86d0','#6ad0c9']},
 {n:9,  t:'No todo tiene que ser perfecto. A veces basta con disfrutar el momento.', L:'top', e:'e-left', d:'d-zoom', c:['#e08a2a','#7a3fa0']},
 {n:10, t:'26. Suena bonito.', L:'stack', e:'e-scale', d:'d-side', c:['#9a5a8a','#d4b073']},
 {n:11, t:'Así que hoy toca celebrar.', L:'top', e:'e-right', d:'d-zoom', c:['#c97a5a','#5a7ac9']},
 {n:12, t:'Y guardar otro recuerdo bonito.', L:'stack', e:'e-rise', d:'d-side', c:['#d98a5a','#8a5ad0']}
];

/* ---------- Imágenes ---------- */
const IM = {};
const preloaded = Promise.all(Array.from({length: 13}, (_, i) => new Promise(res => {
  const im = new Image();
  im.onload = () => { IM[i + 1] = {w: im.naturalWidth, h: im.naturalHeight}; res(); };
  im.onerror = res; im.src = img(i + 1);
})));

/* ---------- Audio ---------- */
const hint = $('musicHint'), fileIn = $('musicFile');
let audio = null, audioOK = false, vol = 0, fadeT = null, started = false;
function setupAudio(src) {
  audio = new Audio(src); audio.loop = false; audio.preload = 'auto'; audio.volume = 0; vol = 0;
  audio.addEventListener('error', () => { audioOK = false; if (started) hint.hidden = false; });
}
function fadeTo(target, ms) {
  clearInterval(fadeT); if (!audio) return;
  const from = vol, t0 = performance.now();
  fadeT = setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    vol = from + (target - from) * k;
    try { audio.volume = Math.max(0, Math.min(1, vol)); } catch (e) {}
    if (k >= 1) clearInterval(fadeT);
  }, 60);
}
async function playMusic() {
  if (!audio) setupAudio(AUDIO_SRC);
  try { await audio.play(); audioOK = true; hint.hidden = true; fadeTo(.7, 5000); }
  catch (e) { audioOK = false; hint.hidden = false; }
}
/* Si la música va desfasada de la escena (por el tiempo de las interacciones), salta con fundido */
async function syncTo(t) {
  if (!audio || !audioOK || !isFinite(audio.duration)) return;
  if (Math.abs(audio.currentTime - t) < 6) return;
  fadeTo(0, 450); await sleep(500);
  try { audio.currentTime = t; } catch (e) {}
}
hint.addEventListener('click', async () => {
  if (audio && audio.error) { fileIn.click(); return; }
  await playMusic(); if (!audioOK) fileIn.click();
});
fileIn.addEventListener('change', async () => {
  const f = fileIn.files && fileIn.files[0]; if (!f) return;
  setupAudio(URL.createObjectURL(f)); await playMusic();
});

/* ---------- Utilidades ---------- */
const screens = ['intro', 'stage', 'wish', 'pause', 'finale', 'mosaic', 'outro'];
const show = id => screens.forEach(s => { $(s).hidden = s !== id; });
function line(parent, text, cls = 'line') {
  const p = document.createElement('p'); p.className = cls + ' fadein'; p.textContent = text; parent.appendChild(p); return p;
}
async function swapLine(parent, text, hold, cls = 'line') {
  parent.innerHTML = ''; const p = line(parent, text, cls); await sleep(hold);
  p.className = cls + ' fadeout'; await sleep(1100);
}
function words(el, text) {
  el.innerHTML = ''; const wl = document.createElement('div'); wl.className = 'wl'; el.appendChild(wl);
  text.split(' ').forEach((w, i) => { const s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i); s.textContent = w; wl.appendChild(s); wl.appendChild(document.createTextNode(' ')); });
}
const COLORS = ['#f6d28f', '#f4a9bb', '#8fe0d4', '#fff4de', '#d4b073'];
function burst(x, y, n = 28, power = 150) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i'); s.className = 'spark';
    const a = rnd(0, 6.283), d = rnd(.25, 1) * power;
    s.style.cssText = `left:${x}px;top:${y}px;background:${COLORS[i % COLORS.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
    $('app').appendChild(s); setTimeout(() => s.remove(), 1400);
  }
}
document.addEventListener('pointerdown', e => { if (started) burst(e.clientX, e.clientY, 7, 60); });

/* ---------- Escena 1 ---------- */
async function intro() {
  const box = $('introText'); await sleep(900);
  await swapLine(box, 'Hay personas que simplemente hacen que los días sean un poquito mejores.', 4200);
  await swapLine(box, 'Y hoy hay una razón para celebrar a una de ellas.', 3600);
  box.innerHTML = '';
  line(box, 'Lilian', 'name'); await sleep(1800);
  line(box, '26 años.', 'age'); await sleep(2200);
  $('startBtn').hidden = false;
}

/* ---------- Fotos ---------- */
function buildScene(sc) {
  const s = document.createElement('div');
  s.className = `scene L-${sc.L}`; s.style.setProperty('--c1', sc.c[0]); s.style.setProperty('--c2', sc.c[1]);
  const vw = innerWidth, vh = innerHeight, d = IM[sc.n] || {w: 3, h: 4};
  const [mw, mh] = sc.L === 'over' ? [vw, vh * .94] : sc.L === 'top' ? [vw * .9, vh * .67] : [vw * .9, vh * .5];
  const k = Math.min(mw / d.w, mh / d.h);
  s.innerHTML = `<div class="aurora"><i></i><i></i></div><div class="bokeh"></div>
   <div class="box"><div class="card ${sc.e} ${sc.d}" style="width:${d.w * k}px;height:${d.h * k}px"><img class="fg" alt="" src="${img(sc.n)}"></div><p class="cap"></p></div>`;
  const bk = s.querySelector('.bokeh');
  for (let i = 0; i < 9; i++) { const b = document.createElement('b'), z = rnd(6, 22); b.style.cssText = `left:${rnd(0, 100)}%;width:${z}px;height:${z}px;--dx:${rnd(-40, 40)}px;animation-duration:${rnd(7, 13)}s;animation-delay:${rnd(0, 6)}s`; bk.appendChild(b); }
  return s;
}
/* Interacción 1: desliza para enfocar */
function focusGame(s, sc) {
  return new Promise(resolve => {
    const fg = s.querySelector('.fg'), cap = s.querySelector('.cap'); let p = 0, lx = null, ly = null, idle = 0, done = false;
    fg.classList.add('blurry'); fg.style.filter = 'blur(26px)';
    cap.className = 'cap hintcap'; words(cap, 'Desliza sobre la foto para enfocarla');
    const apply = () => { fg.style.filter = `blur(${26 * (1 - p)}px)`; };
    const finish = async () => {
      if (done) return; done = true; clearInterval(tm); s.removeEventListener('pointermove', mv);
      fg.classList.add('unblur'); fg.style.filter = 'blur(0px)';
      const r = s.getBoundingClientRect(); burst(r.width / 2, r.height * .55, 22, 130);
      cap.className = 'cap'; words(cap, sc.t); await sleep(4200); resolve();
    };
    const mv = e => { if (lx !== null) p = Math.min(1, p + Math.hypot(e.clientX - lx, e.clientY - ly) / 1100); lx = e.clientX; ly = e.clientY; idle = 0; apply(); if (p >= 1) finish(); };
    s.addEventListener('pointermove', mv);
    const tm = setInterval(() => { idle += 100; if (idle > 3500 && !done) { p = Math.min(1, p + .018); apply(); if (p >= 1) finish(); } }, 100);
  });
}
async function photos() {
  show('stage'); const st = $('stage'); st.innerHTML = ''; let prev = null;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i], s = buildScene(sc), cap = s.querySelector('.cap');
    if (!sc.focus) words(cap, sc.t);
    st.appendChild(s); $('prog').style.width = ((i + 1) / SCENES.length * 88) + '%';
    const lk = document.createElement('div'); lk.className = 'leak'; st.appendChild(lk); setTimeout(() => lk.remove(), 1300);
    if (prev) { const p = prev; p.classList.add('out'); setTimeout(() => p.remove(), 1300); }
    prev = s;
    if (sc.focus) await focusGame(s, sc); else await sleep(2800 + sc.t.split(' ').length * 180);
  }
  prev.classList.add('out'); await sleep(1200); st.innerHTML = '';
}

/* ---------- Interacción 2: pide un deseo ---------- */
function wish() {
  return new Promise(async resolve => {
    show('wish'); const orb = $('orb'), hintEl = $('wishHint'), t = $('wishText');
    orb.style.setProperty('--p', 0); hintEl.style.opacity = 1; t.className = 'fadein'; t.textContent = 'Antes de seguir, pide un deseo.';
    let p = 0, holding = false, done = false, last = performance.now(), auto = performance.now() + 9000;
    const down = () => { holding = true; hintEl.style.opacity = 0; }, up = () => { holding = false; };
    orb.addEventListener('pointerdown', down);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => orb.addEventListener(ev, up));
    const tick = async now => {
      const dt = now - last; last = now;
      p = Math.max(0, Math.min(1, p + (holding || now > auto ? dt / 2200 : -dt / 1400)));
      orb.style.setProperty('--p', p);
      if (p >= 1 && !done) {
        done = true; const r = orb.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, 60, 260);
        t.className = 'fadeout'; await sleep(1700); $('wish').classList.add('fadeout'); await sleep(1000); $('wish').classList.remove('fadeout'); resolve(); return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ---------- Pausa + contador ---------- */
async function pause() {
  show('pause'); const t = $('pauseText'), c = $('counter'); c.textContent = '';
  t.className = 'fadein'; t.textContent = 'Espera...'; await sleep(2400);
  t.className = 'fadeout'; await sleep(1000);
  t.className = 'fadein'; t.textContent = 'Todavía falta una.'; await sleep(2600);
  for (let i = 1; i <= 13; i++) { c.textContent = pad(i); await sleep(i === 13 ? 900 : 250); }
  await sleep(600); $('pause').classList.add('fadeout'); await sleep(1100); $('pause').classList.remove('fadeout');
}

/* ---------- Final ---------- */
async function finale() {
  show('finale'); const box = $('finalText'), ph = $('finalPhoto'); box.innerHTML = ''; $('prog').style.width = '96%';
  await syncTo(T_BRIDGE); fadeTo(.8, 5000);
  await sleep(300); ph.classList.add('on'); await sleep(6200);
  await swapLine(box, 'Y para terminar...', 2600); await sleep(400);
  await swapLine(box, 'Feliz cumpleaños, Lilian.', 3200, 'line big');
  box.innerHTML = '';
  const a = line(box, '26 años de historias, recuerdos y momentos que apenas comienzan.', 'line'); await sleep(4600);
  const b = line(box, 'Espero que este nuevo año venga cargado de cosas buenas, risas, viajes, sueños cumplidos y muchos motivos para sonreír.', 'small'); await sleep(6000);
  a.className = 'line fadeout'; b.className = 'small fadeout'; await sleep(1200); box.innerHTML = '';
  await sleep(400); line(box, 'Disfruta muchísimo tu día.', 'line'); await sleep(4000);
  $('finale').classList.add('fadeout'); await sleep(1200); $('finale').classList.remove('fadeout');
}

/* ---------- Mosaico ---------- */
async function mosaic() {
  const landscape = innerWidth > innerHeight, cols = landscape ? 6 : 3, rows = landscape ? 3 : 6, total = cols * rows;
  const g = $('grid'); g.innerHTML = '';
  g.style.gridTemplateColumns = `repeat(${cols},1fr)`; g.style.gridTemplateRows = `repeat(${rows},1fr)`;
  const order = Array.from({length: 13}, (_, i) => i + 1).sort(() => Math.random() - .5);
  const tiles = Array.from({length: total}, (_, i) => { const im = new Image(); im.alt = ''; im.src = img(order[i % 13]); g.appendChild(im); return im; });
  $('mosaicVeil').classList.remove('on'); $('mosaicTitle').classList.remove('on');
  await syncTo(T_CLIMAX); $('prog').style.width = '100%';
  show('mosaic'); fadeTo(1, 2500);
  const d = i => Math.hypot((i % cols) - (cols - 1) / 2, Math.floor(i / cols) - (rows - 1) / 2) + Math.random() * .6;
  const idx = tiles.map((_, i) => i).sort((a, b) => d(a) - d(b));
  for (const i of idx) { tiles[i].classList.add('on'); await sleep(170); }
  await sleep(500); $('mosaicVeil').classList.add('on'); await sleep(900); $('mosaicTitle').classList.add('on');
  burst(innerWidth / 2, innerHeight / 2, 70, Math.min(innerWidth, 500) * .75); await sleep(1500);
  burst(innerWidth / 2, innerHeight / 2, 50, Math.min(innerWidth, 500) * .6); await sleep(7500);
  $('mosaic').classList.add('fadeout'); await sleep(1300); $('mosaic').classList.remove('fadeout');
}
async function outro() { show('outro'); fadeTo(.8, 2000); }

async function run() {
  started = true; $('startBtn').hidden = true; playMusic();
  $('intro').classList.add('fadeout'); await Promise.race([preloaded, sleep(6000)]); await sleep(1100);
  await photos(); await wish(); await pause(); await finale(); await mosaic(); await outro();
}
$('startBtn').addEventListener('click', run, {once: true});
$('replayBtn').addEventListener('click', () => location.reload());
document.addEventListener('visibilitychange', () => { if (audio && audioOK) document.hidden ? audio.pause() : audio.play().catch(() => {}); });
intro();
})();

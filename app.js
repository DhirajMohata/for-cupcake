(() => {
  'use strict';

  /* ---------------------------------------------------------------- setup */
  const C = window.LOVE_CONFIG || {};
  const HER = C.herName || 'My Love';
  const ME = C.yourName || 'Me';
  const GIFS = C.gifs || {};
  const CHEERS = (C.cheers && C.cheers.length) ? C.cheers : ['You are amazing! 💖'];
  const PICK_LINES = (C.pickLines && C.pickLines.length) ? C.pickLines : ['Added with love 💖'];
  const NOTES = (C.loveNotes && C.loveNotes.length) ? C.loveNotes : ['you + me = forever'];
  const loveTape = () => { const t = NOTES.map(n => `<span>${esc(n)}</span><i>♥</i>`).join(''); return `<div class="love-tape" aria-hidden="true"><div class="lt-track">${t}${t}</div></div>`; };
  const KEY = 'lovebox-v1';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rand = a => a[Math.floor(Math.random() * a.length)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => (/^https?:\/\//i.test(String(u || '').trim()) ? String(u).trim() : '');
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

  const LEVELS = (C.levels || []).map((lv, li) => ({
    ...lv,
    items: (lv.items || []).map((it, ii) => ({ ...it, key: `${lv.id || 'l' + li}::${it.id || it.name || ii}` }))
  }));
  const ALL_ITEMS = LEVELS.flatMap((lv, li) => lv.items.map(it => ({ ...it, li, levelTitle: lv.title })));
  const itemByKey = k => ALL_ITEMS.find(i => i.key === k);

  // the whole journey, in order
  const STEPS = [{ type: 'intro' }, { type: 'rules' }];
  LEVELS.forEach((_, i) => STEPS.push({ type: 'map', node: i }, { type: 'level', i }, { type: 'cheer', i }));
  const WISH_NODE = LEVELS.length, HOME_NODE = LEVELS.length + 1;
  STEPS.push({ type: 'map', node: WISH_NODE }, { type: 'wishlist' }, { type: 'map', node: HOME_NODE }, { type: 'address' }, { type: 'final' });
  const NODES = [...LEVELS.map(l => ({ emoji: l.emoji || '🎁', title: l.title })), { emoji: '🪄', title: 'Wish Well' }, { emoji: '🏡', title: 'Home' }];
  const stepIndex = pred => STEPS.findIndex(pred);

  // saved progress
  const DEFAULT = { step: 0, picks: [], wishes: [], address: {}, soundOn: C.sound !== false, musicOn: C.music !== false, editing: false };
  let S = load();
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      const s = { ...DEFAULT, ...raw };
      s.picks = (s.picks || []).filter(k => itemByKey(k));
      s.wishes = Array.isArray(s.wishes) ? s.wishes : [];
      s.wishes.forEach(w => { if (!(Number.isInteger(w.at) && w.at >= 0 && w.at < LEVELS.length)) delete w.at; delete w.tried; });
      s.address = s.address || {};
      if (!(s.step >= 0 && s.step < STEPS.length)) s.step = 0;
      return s;
    } catch (e) { return { ...DEFAULT }; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode: fine */ } syncSoon(); }

  /* ------------------------------------------------- private sync to admin */
  // Her box is encrypted on her phone with the admin public key, then saved to a tiny text store.
  // Only admin.html + his password can open it. Runs quietly a few seconds after each change.
  const AD = window.LOVE_ADMIN;
  const STORE_URL = AD ? 'https://textdb.dev/api/data/' + AD.store : '';
  const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  let syncT, syncing = false, syncAgain = false;
  function syncSoon(ms = 2500) {
    if (!AD || !(window.crypto && crypto.subtle) || !window.fetch) return;
    clearTimeout(syncT); syncT = setTimeout(syncNow, ms);
  }
  async function seal(obj) {
    const sub = crypto.subtle, EC = { name: 'ECDH', namedCurve: 'P-256' };
    const pub = await sub.importKey('jwk', AD.pub, EC, false, []);
    const eph = await sub.generateKey(EC, true, ['deriveKey']);
    const key = await sub.deriveKey({ name: 'ECDH', public: pub }, eph.privateKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await sub.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj)));
    const epk = await sub.exportKey('jwk', eph.publicKey);
    return { epk: { kty: epk.kty, crv: epk.crv, x: epk.x, y: epk.y }, iv: b64(iv), ct: b64(ct) };
  }
  async function syncNow() {
    if (syncing) { syncAgain = true; return; }
    if (!S.picks.length && !S.wishes.length && !S.address.name) return;
    syncing = true;
    try {
      if (!S.id) {
        S.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* */ }
      }
      const entry = await seal({
        id: S.id, at: Date.now(), sentAt: S.sentAt || null, screen: STEPS[S.step].type,
        picks: S.picks, wishes: S.wishes, address: S.address, message: buildMessage()
      });
      const r = await fetch(STORE_URL, { cache: 'no-store' });
      if (!r.ok) throw new Error('store read ' + r.status);
      const t = (await r.text()).trim();
      const all = t ? JSON.parse(t) : {};          // unreadable store → throw, never overwrite it
      all.entries = all.entries && typeof all.entries === 'object' ? all.entries : {};
      all.entries[S.id] = entry;
      await fetch(STORE_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(all) });
    } catch (e) { /* offline or store down: tries again on the next change */ }
    syncing = false;
    if (syncAgain) { syncAgain = false; syncSoon(800); }
  }

  const stage = $('#stage'), modal = $('#modal'), drawer = $('#drawer'), toastEl = $('#toast');

  /* ---------------------------------------------------------------- sound */
  // soft harp plucks in a warm little room: gentle, loving, never beepy
  let ac, master, echoIn;
  const plucks = new Map();
  function audio() {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0.8;
      const warm = ac.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 3200; warm.Q.value = 0.3;
      const comp = ac.createDynamicsCompressor();
      master.connect(warm).connect(comp).connect(ac.destination);
      // soft room reverb
      const len = Math.floor(ac.sampleRate * 2.4), ir = ac.createBuffer(2, len, ac.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      }
      const verb = ac.createConvolver(); verb.buffer = ir;
      echoIn = ac.createGain(); echoIn.gain.value = 0.35;
      echoIn.connect(verb).connect(master);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  // a plucked string (Karplus-Strong), rounded so it sounds like a soft harp
  function pluckBuffer(f) {
    const key = Math.round(f);
    if (plucks.has(key)) return plucks.get(key);
    const sr = ac.sampleRate, len = Math.floor(sr * 2.2), N = Math.max(2, Math.round(sr / f));
    const buf = ac.createBuffer(1, len, sr), out = buf.getChannelData(0), ring = new Float32Array(N);
    let prev = 0;
    for (let i = 0; i < N; i++) { prev = prev * 0.6 + (Math.random() * 2 - 1) * 0.4; ring[i] = prev; }
    for (let i = 0; i < len; i++) {
      const j = i % N;
      out[i] = ring[j];
      ring[j] = (ring[j] + ring[(j + 1) % N]) * 0.5 * 0.998;
    }
    plucks.set(key, buf);
    return buf;
  }
  function pluck(f, { at = 0, vol = 0.15 } = {}) {
    const src = ac.createBufferSource(), g = ac.createGain();
    src.buffer = pluckBuffer(f); g.gain.value = vol;
    src.connect(g); g.connect(master); g.connect(echoIn);
    src.start(ac.currentTime + at);
  }
  // a soft warm hum under happy moments
  function glow(f, { at = 0, dur = 1.2, vol = 0.03 } = {}) {
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); g.connect(echoIn); o.start(t); o.stop(t + dur + 0.05);
  }
  const play = fn => { if (!S.soundOn) return; try { audio(); fn(); } catch (e) { /* no audio, no problem */ } };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  function tone(freqs, dur, type, gap = 0.07) { play(() => freqs.forEach((f, i) => pluck(f, { at: i * gap, vol: 0.13 }))); }
  const sfx = {
    // one soft harp note
    pop: () => play(() => pluck(hz(rand([79, 81, 84])), { vol: 0.11 })),
    // two gentle notes going down
    boop: () => play(() => { pluck(hz(76), { vol: 0.09 }); pluck(hz(72), { at: 0.1, vol: 0.08 }); }),
    // a little harp strum with a warm hum, for "added to your love box"
    chime: () => play(() => { [72, 76, 79, 84].forEach((m, i) => pluck(hz(m), { at: i * 0.075, vol: 0.14 })); glow(hz(60), { vol: 0.022 }); glow(hz(67), { vol: 0.016 }); }),
    // a dreamy full harp sweep for big moments
    tada: () => play(() => { [60, 64, 67, 71, 74, 76, 79, 84].forEach((m, i) => pluck(hz(m), { at: i * 0.06, vol: 0.12 })); glow(hz(48), { dur: 2.2, vol: 0.026 }); glow(hz(64), { dur: 2.2, vol: 0.016 }); }),
    step: () => {},
    blip: () => {},
    // a soft "mwah": three rising notes and a warm hum
    mwah: () => play(() => { pluck(hz(79), { vol: 0.12 }); pluck(hz(84), { at: 0.13, vol: 0.13 }); pluck(hz(88), { at: 0.28, vol: 0.09 }); glow(hz(72), { dur: 1.5, vol: 0.022 }); })
  };

  /* ------------------------------------------------------------- confetti */
  let heartShape;
  function burst(opts = {}) {
    if (!window.confetti || reduceMotion) return;
    try {
      if (!heartShape && confetti.shapeFromPath) {
        heartShape = confetti.shapeFromPath({ path: 'M167 72c19-38 37-56 75-56 42 0 76 33 76 75 0 76-76 151-151 227-76-76-151-151-151-227 0-42 33-75 75-75 38 0 57 18 76 56z' });
      }
      confetti({
        particleCount: 80, spread: 75, startVelocity: 38, origin: { y: 0.6 }, scalar: 1.15, ticks: 220,
        colors: ['#ff5fa2', '#ff8fbf', '#ffc2da', '#ffffff', '#ffb0c8', '#e8417f'],
        shapes: heartShape ? [heartShape, heartShape, 'circle'] : undefined,
        disableForReducedMotion: true,
        ...opts
      });
    } catch (e) { /* ignore */ }
  }
  function bigCelebration() {
    burst({ particleCount: 120, spread: 100, origin: { y: 0.55 } });
    setTimeout(() => burst({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }), 250);
    setTimeout(() => burst({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }), 450);
  }
  function burstAt(el, opts = {}) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    burst({ particleCount: 36, spread: 60, startVelocity: 24, scalar: 0.9,
      origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight }, ...opts });
  }


  // tiny phone buzz on happy moments (Android; iPhones simply ignore it)
  const buzz = p => { try { if (!reduceMotion && navigator.vibrate) navigator.vibrate(p); } catch (e) { /* */ } };

  // speech bubbles type themselves out, with soft little blips
  const graphemes = t => (window.Intl && Intl.Segmenter) ? [...new Intl.Segmenter().segment(t)].map(x => x.segment) : [...t];
  function typeInto(el, text, delay = 0) {
    clearTimeout(el._tt);
    el.setAttribute('aria-label', text);
    if (reduceMotion) { el.textContent = text; return; }
    const parts = graphemes(text);
    el.style.minHeight = el.offsetHeight ? el.offsetHeight + 'px' : '';
    el.textContent = '';
    let i = 0;
    const step = () => {
      if (!el.isConnected) return;
      el.textContent = parts.slice(0, ++i).join('');
      if (i % 3 === 1 && /\S/.test(parts[i - 1])) sfx.blip();
      if (i < parts.length) el._tt = setTimeout(step, /[.,!?…]/.test(parts[i - 1]) ? 160 : 26);
      else el.style.minHeight = '';
    };
    el._tt = setTimeout(step, delay);
  }

  /* --------------------------------------------------------- the couple 💑 */
  const heartAt = (x, y) => `<path d="M${x} ${y + 3.6}c-3-2.3-6-4.2-6-7 0-1.9 1.4-3.2 3.1-3.2 1.3 0 2.3.7 2.9 1.8.6-1.1 1.6-1.8 2.9-1.8 1.7 0 3.1 1.3 3.1 3.2 0 2.8-3 4.7-6 7z"/>`;
  const PARTY = C.partyHats !== false ? 'party' : '';
  function couple(mode = 'idle', cls = '', attrs = '') {
    return `
<svg class="couple ${mode} ${cls} ${PARTY}" viewBox="0 0 200 165" aria-hidden="true" ${attrs}>
  <ellipse class="shadow" cx="100" cy="158" rx="78" ry="6" fill="#e9a5c0" opacity=".35"/>
  <path class="float-heart" d="M100 28c-6-11-22-9-22 3 0 9 13 16 22 24 9-8 22-15 22-24 0-12-16-14-22-3z" fill="#ff5fa2" stroke="#7a2e55" stroke-width="2.5"/>
  <!-- him: a bear -->
  <g class="char bear">
    <rect class="leg leg-a" x="47" y="128" width="13" height="26" rx="6.5" fill="#e6b896" stroke="#7a2e55" stroke-width="2.5"/>
    <rect class="leg leg-b" x="66" y="128" width="13" height="26" rx="6.5" fill="#e6b896" stroke="#7a2e55" stroke-width="2.5"/>
    <path class="arm arm-free" d="M42 108q-14 8-9 22" stroke="#7a2e55" stroke-width="14" stroke-linecap="round" fill="none"/>
    <path class="arm arm-free arm-fill" d="M42 108q-14 8-9 22" stroke="#f2cdb0" stroke-width="9" stroke-linecap="round" fill="none"/>
    <ellipse cx="63" cy="118" rx="26" ry="24" fill="#f2cdb0" stroke="#7a2e55" stroke-width="2.5"/>
    <ellipse cx="63" cy="123" rx="15" ry="13" fill="#fbe8d8"/>
    <path d="M57 104l6 5 6-5" fill="#ff8fbf" stroke="#7a2e55" stroke-width="2" stroke-linejoin="round"/>
    <g class="head">
      <circle cx="40" cy="47" r="11" fill="#f2cdb0" stroke="#7a2e55" stroke-width="2.5"/><circle cx="40" cy="47" r="5.5" fill="#ffb3cb"/>
      <circle cx="86" cy="47" r="11" fill="#f2cdb0" stroke="#7a2e55" stroke-width="2.5"/><circle cx="86" cy="47" r="5.5" fill="#ffb3cb"/>
      <circle cx="63" cy="70" r="30" fill="#f2cdb0" stroke="#7a2e55" stroke-width="2.5"/>
      <ellipse cx="63" cy="80" rx="13" ry="10" fill="#fbe8d8"/>
      <ellipse cx="63" cy="75.5" rx="4.6" ry="3.3" fill="#4a2a35"/>
      <path d="M58 82q5 5 10 0" stroke="#4a2a35" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <g class="look"><g class="eyes"><ellipse cx="51" cy="66" rx="3.5" ry="4.3" fill="#3b2230"/><ellipse cx="75" cy="66" rx="3.5" ry="4.3" fill="#3b2230"/>
        <circle cx="52.2" cy="64.4" r="1.3" fill="#fff"/><circle cx="76.2" cy="64.4" r="1.3" fill="#fff"/></g><g class="heart-eyes">${heartAt(51, 66)}${heartAt(75, 66)}</g></g>
      <ellipse class="blush" cx="44" cy="79" rx="6" ry="3.6" fill="#ff7fa8" opacity=".55"/>
      <ellipse class="blush" cx="82" cy="79" rx="6" ry="3.6" fill="#ff7fa8" opacity=".55"/>
      <g class="hat"><path d="M51 45 L59 13 L75 43 Q63 49 51 45z" fill="#ff5fa2" stroke="#7a2e55" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="61" cy="34" r="2" fill="#fff"/><circle cx="66" cy="41" r="2" fill="#fff"/><circle cx="58" cy="24" r="1.8" fill="#fff"/>
        <circle cx="59" cy="12" r="5" fill="#ffd166" stroke="#7a2e55" stroke-width="2.2"/></g>
    </g>
  </g>
  <!-- her: a bunny -->
  <g class="char bunny">
    <rect class="leg leg-b" x="124" y="130" width="12" height="24" rx="6" fill="#fff" stroke="#7a2e55" stroke-width="2.5"/>
    <rect class="leg leg-a" x="141" y="130" width="12" height="24" rx="6" fill="#fff" stroke="#7a2e55" stroke-width="2.5"/>
    <path class="arm arm-free" d="M160 110q14 8 9 21" stroke="#7a2e55" stroke-width="13" stroke-linecap="round" fill="none"/>
    <path class="arm arm-free arm-fill" d="M160 110q14 8 9 21" stroke="#fff" stroke-width="8" stroke-linecap="round" fill="none"/>
    <ellipse cx="138" cy="118" rx="23" ry="22" fill="#fff" stroke="#7a2e55" stroke-width="2.5"/>
    <path d="M117 116q21-14 42 0l6 21q-27 10-54 0z" fill="#ff9cc4" stroke="#7a2e55" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="128" cy="128" r="2" fill="#fff"/><circle cx="140" cy="132" r="2" fill="#fff"/><circle cx="151" cy="127" r="2" fill="#fff"/>
    <g class="head">
      <g class="ears">
        <g class="ear ear-l"><ellipse cx="124" cy="28" rx="9.5" ry="24" fill="#fff" stroke="#7a2e55" stroke-width="2.5" transform="rotate(-12 124 44)"/>
          <ellipse cx="124" cy="30" rx="4.5" ry="16" fill="#ffb3cb" transform="rotate(-12 124 44)"/></g>
        <g class="ear ear-r"><ellipse cx="153" cy="28" rx="9.5" ry="24" fill="#fff" stroke="#7a2e55" stroke-width="2.5" transform="rotate(14 153 44)"/>
          <ellipse cx="153" cy="30" rx="4.5" ry="16" fill="#ffb3cb" transform="rotate(14 153 44)"/></g>
      </g>
      <circle cx="138" cy="72" r="28" fill="#fff" stroke="#7a2e55" stroke-width="2.5"/>
      <g class="bow" transform="translate(156 50)">
        <path d="M0 0l-11-8v16zM0 0l11-8v16z" fill="#ff5fa2" stroke="#7a2e55" stroke-width="2.2" stroke-linejoin="round"/>
        <circle r="3.6" fill="#ff5fa2" stroke="#7a2e55" stroke-width="2.2"/>
      </g>
      <g class="look"><g class="eyes"><ellipse cx="128" cy="70" rx="3.4" ry="4.2" fill="#3b2230"/><ellipse cx="148" cy="70" rx="3.4" ry="4.2" fill="#3b2230"/>
        <circle cx="129.2" cy="68.4" r="1.3" fill="#fff"/><circle cx="149.2" cy="68.4" r="1.3" fill="#fff"/></g><g class="heart-eyes">${heartAt(128, 70)}${heartAt(148, 70)}</g></g>
      <ellipse cx="138" cy="77" rx="3" ry="2.2" fill="#ff7fa8"/>
      <path d="M133 81q2.5 3 5 0q2.5 3 5 0" stroke="#4a2a35" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse class="blush" cx="121" cy="80" rx="5.5" ry="3.4" fill="#ff7fa8" opacity=".6"/>
      <ellipse class="blush" cx="155" cy="80" rx="5.5" ry="3.4" fill="#ff7fa8" opacity=".6"/>
      <g class="hat"><path d="M127 47 L140 18 L150 47 Q138 52 127 47z" fill="#9fd8ff" stroke="#7a2e55" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="138" cy="38" r="1.9" fill="#ff5fa2"/><circle cx="143" cy="44" r="1.9" fill="#ff5fa2"/><circle cx="139.5" cy="28" r="1.7" fill="#ff5fa2"/>
        <circle cx="140" cy="17" r="4.6" fill="#fff" stroke="#7a2e55" stroke-width="2.2"/></g>
    </g>
  </g>
  <!-- holding hands -->
  <g class="hands">
    <path d="M84 108q8 10 16 12M116 110q-8 9-16 10" stroke="#7a2e55" stroke-width="13" stroke-linecap="round" fill="none"/>
    <path d="M84 108q8 10 16 12" stroke="#f2cdb0" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M116 110q-8 9-16 10" stroke="#fff" stroke-width="8" stroke-linecap="round" fill="none"/>
    <circle cx="100" cy="120" r="5.5" fill="#ffd6e4" stroke="#7a2e55" stroke-width="2.2"/>
  </g>
</svg>`;
  }

  function gifOr(url, mode = 'dance') {
    const u = safeUrl(url) || (url && !/^[a-z]+:/i.test(url) ? url : '');
    return u
      ? `<div class="gif-frame"><img src="${esc(u)}" alt="" data-fallback-couple="${mode}"><span class="gif-tape"></span></div>`
      : `<div class="gif-frame mascot">${couple(mode)}</div>`;
  }

  function imgTag(it) {
    const fb = esc(it.emoji || '🎁');
    return it.image
      ? `<img src="${esc(it.image)}" alt="${esc(it.name)}" loading="lazy" data-fallback="${fb}">`
      : `<span class="emoji-tile">${fb}</span>`;
  }

  // broken image → cute emoji tile / dancing couple instead
  document.addEventListener('error', e => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    if (img.dataset.fallback) {
      const s = document.createElement('span'); s.className = 'emoji-tile'; s.textContent = img.dataset.fallback; img.replaceWith(s);
    } else if (img.dataset.fallbackCouple) {
      const frame = img.closest('.gif-frame'); if (frame) { frame.classList.add('mascot'); frame.innerHTML = couple(img.dataset.fallbackCouple); }
    }
  }, true);

  const wavy = (txt, cls = '') => `<span class="wavy ${cls}">${[...txt].map((ch, i) => ch === ' ' ? '<span class="sp"> </span>' : `<span style="--i:${i}">${esc(ch)}</span>`).join('')}</span>`;

  /* --------------------------------------------------------------- screens */
  const SCREENS = {
    intro: () => `
      <section class="screen intro">
        ${C.occasion ? `<p class="kicker pop-in" style="--d:.1s">${esc(C.occasion)}</p>` : ''}
        <h1 class="big-title pop-in" style="--d:.2s">${wavy(HER)}</h1>
        ${GIFS.welcome ? gifOr(GIFS.welcome, 'wave') : `<div class="mascot-stage pop-in" style="--d:.35s">${couple('wave', 'big')}</div>`}
        <div class="bubble pop-in" style="--d:.55s" data-type="700">${esc(C.introLine || 'I made you something. Hold my hand? 🫶')}</div>
        <button class="btn primary big pop-in wiggle" style="--d:.75s" data-act="next">Let’s go 💗</button>
        <p class="tiny pop-in" style="--d:.9s">love, ${esc(ME)}</p>
        ${loveTape()}
      </section>`,

    rules: () => `
      <section class="screen rules">
        <h2 class="title">Tiny rules 🎀</h2>
        <ol class="rule-list">
          ${[
            ['💖', `Pick as many as you like, even <b>all</b> of them. Not feeling something? Skip it, <b>no pressure</b>. I kind of chose these randomly 🙈`],
            ['🔗', `Seen something cuter somewhere? <b>Paste the link</b> at any stop.`],
            ['↩️', `Change your mind whenever. You can always go <b>back</b> or take things out.`]
          ].map(([e, t], i) => `<li class="rule pop-in" style="--d:${0.1 + i * 0.12}s"><span class="rule-ico">${e}</span><span>${t}</span></li>`).join('')}
        </ol>
        <h2 class="title small pop-in" style="--d:.5s">And my promises 🫶</h2>
        <ul class="promise-list">
          ${[
            ['💗', 'I love you. Today, tomorrow and every day after.'],
            ['♾️', 'Forever means forever. You’re stuck with me 😌'],
            ['🤝', 'I’ll hold your hand on this little map and everywhere else.']
          ].map(([e, t], i) => `<li class="promise pop-in" style="--d:${0.6 + i * 0.12}s"><span>${e}</span>${t}</li>`).join('')}
        </ul>
        <button class="btn primary big pop-in" style="--d:1s" data-act="next">Pinky promise 🤙 Let’s go!</button>
      </section>`,

    map: step => {
      const n = step.node;
      const head = n === HOME_NODE ? 'Now let me walk you home 🏡' : esc(NOTES[n % NOTES.length]);
      const decos = [['🌸', 28, 540], ['🌷', 335, 455], ['🍓', 34, 330], ['🌳', 330, 250], ['🌼', 190, 625], ['🍄', 40, 130], ['🌈', 300, 70], ['🦋', 180, 395], ['🌻', 330, 600], ['☁️', 60, 30]];
      return `
      <section class="screen map">
        <h2 class="love-note">${head}</h2>
        <div class="map-card">
          <svg class="map-svg" viewBox="0 0 360 700" role="img" aria-label="Map of our adventure">
            ${decos.map(([e, x, y], i) => `<text class="deco" x="${x}" y="${y}" style="--i:${i}">${e}</text>`).join('')}
            <path id="road" class="road-edge" d="M60 620 C200 650 340 600 290 520 S70 460 90 380 S320 320 280 240 S50 190 90 120 S260 40 300 40"/>
            <path class="road-base" d="M60 620 C200 650 340 600 290 520 S70 460 90 380 S320 320 280 240 S50 190 90 120 S260 40 300 40"/>
            <path class="road-dash" d="M60 620 C200 650 340 600 290 520 S70 460 90 380 S320 320 280 240 S50 190 90 120 S260 40 300 40"/>
            <path id="roadDone" class="road-done" d="M60 620 C200 650 340 600 290 520 S70 460 90 380 S320 320 280 240 S50 190 90 120 S260 40 300 40"/>
            <g id="steps"></g>
            <g class="node start" data-node="-1"><text class="node-flag" y="6">🚩</text></g>
            ${NODES.map((nd, i) => `
              <g class="node ${i < n ? 'done' : ''} ${i === n ? 'target' : ''}" data-node="${i}">
                <circle class="ring" r="30"/>
                <circle class="disc" r="23"/>
                <text class="node-emoji" y="8">${nd.emoji}</text>
                ${i < n ? '<text class="node-check" x="17" y="-13">💗</text>' : ''}
                <g class="label"><rect x="-64" y="28" width="128" height="22" rx="11"/><text y="43.5">${esc(nd.title.length > 16 ? nd.title.slice(0, 15) + '…' : nd.title)}</text></g>
              </g>`).join('')}
            <g id="walker"><g id="walkerFlip">${couple('walk', '', 'x="-50" y="-92" width="100" height="83" overflow="visible"')}</g></g>
          </svg>
        </div>
        <div class="bubble map-bubble">Next: <b>${NODES[n].emoji} ${esc(NODES[n].title)}</b></div>
        <button class="btn primary big" data-act="next" id="enterBtn">Let’s see ✨</button>
      </section>`;
    },

    level: step => {
      const lv = LEVELS[step.i];
      const peekLines = ['Tap anything to see it closer 👀', 'Take your time, baby 💕', 'Only the ones that make you go aww 🥹', 'I’m right here holding your hand 🫶'];
      return `
      <section class="screen level">
        <div class="level-head">
          <div class="level-badge">${lv.emoji || '🎁'}</div>
          <p class="kicker">stop ${step.i + 1} of ${LEVELS.length}</p>
          <h2 class="title">${esc(lv.title)}</h2>
          ${lv.intro ? `<p class="sub">${esc(lv.intro)}</p>` : ''}
        </div>
        <div class="love-rule">💕 Pick as many as you <b>love</b>. Don’t like any? Skip it, no pressure.</div>
        <div class="float-field">
          ${lv.items.map((it, k) => `
            <button class="float-item ${S.picks.includes(it.key) ? 'picked' : ''}" data-act="peek" data-key="${esc(it.key)}"
              style="--d:${(-k * 0.9).toFixed(2)}s; --r:${(k % 2 ? 2.5 : -2.5)}deg; --in:${(0.1 + k * 0.09).toFixed(2)}s">
              <span class="tape"></span>
              <span class="ph">${imgTag(it)}</span>
              <span class="name">${esc(it.name)}</span>
              <span class="pick-badge" aria-label="in your love box">💖</span>
            </button>`).join('')}
        </div>
        <div class="stop-link card">
          <p class="stop-link-title">Seen something better? 🔗</p>
          <div class="stop-link-row">
            <input id="stopText" type="url" inputmode="url" autocomplete="off" placeholder="Paste a link here…">
            <button class="btn primary" data-act="stopAdd" data-i="${step.i}">Add 💕</button>
          </div>
          <p class="wish-err" id="stopErr" hidden>That’s not a link, baby. Copy it again? 🥺</p>
          <div class="float-field finds" id="stopLinks" hidden></div>
        </div>
        <div class="peek-row">
          <div class="mini-mascot">${couple('idle')}</div>
          <div class="bubble left" data-type="400">${peekLines[step.i % peekLines.length]}</div>
        </div>
        ${navButtons(nextLabelForLevel(step.i))}
      </section>`;
    },

    cheer: step => {
      const n = LEVELS[step.i].items.filter(it => S.picks.includes(it.key)).length + linksAt(step.i).length;
      const total = S.picks.length + S.wishes.length;
      const cheerGifs = GIFS.cheer || [];
      return `
      <section class="screen cheer">
        ${gifOr(cheerGifs.length ? cheerGifs[step.i % cheerGifs.length] : '', 'dance')}
        <h2 class="title pop-in" style="--d:.15s">${esc(CHEERS[step.i % CHEERS.length])}</h2>
        <p class="sub pop-in" style="--d:.3s">${n ? `${plural(n, 'thing')} from here 😍` : 'Nothing here? Totally fine 💕'}</p>
        <div class="stat-pill pop-in" style="--d:.45s">💝 ${total} in your box</div>
        <div class="nav-row single"><button class="btn primary big" data-act="next">Keep going 💨</button></div>
      </section>`;
    },

    wishlist: () => `
      <section class="screen wish">
        <div class="level-head">
          ${GIFS.wish ? `<div class="level-badge gif-badge"><img src="${esc(GIFS.wish)}" alt="" data-fallback="🪄"></div>` : '<div class="level-badge">🪄</div>'}
          <h2 class="title">The Wish Well</h2>
          <p class="sub">Anything else you’ve been eyeing? Paste the link here ✨</p>
        </div>
        <div class="wish-input card">
          <textarea id="wishText" rows="3" placeholder="Paste links here…"></textarea>
          <input id="wishNote" type="text" maxlength="140" placeholder="Size, colour… (optional)">
          <div class="row">
            ${navigator.clipboard && navigator.clipboard.readText ? '<button class="btn soft" data-act="wishPaste">📋 Paste</button>' : ''}
            <button class="btn primary" data-act="wishAdd">Add ✨</button>
          </div>
          <p class="wish-err" id="wishErr" hidden>That’s not a link, baby. Copy it again? 🥺</p>
        </div>
        <div class="well">
          <svg viewBox="0 0 200 90" class="well-svg" aria-hidden="true">
            <ellipse cx="100" cy="28" rx="78" ry="16" fill="#9fd8ff" stroke="#7a2e55" stroke-width="3"/>
            <path d="M22 28v38q78 30 156 0V28" fill="#ffc2da" stroke="#7a2e55" stroke-width="3"/>
            <path d="M22 44q78 30 156 0M22 58q78 30 156 0" stroke="#7a2e55" stroke-width="2" fill="none" opacity=".35"/>
            <text x="100" y="34" text-anchor="middle" class="well-sparkle">✨</text>
          </svg>
        </div>
        <div class="float-field finds" id="wishList"></div>
        ${navButtons(S.editing ? 'Save & back to my box 💝' : 'Next →', 'wishNext')}
      </section>`,

    address: () => {
      const a = S.address;
      const f = (id, label, opts = {}) => `
        <label class="field ${opts.wide ? 'wide' : ''}">
          <span>${label}${opts.req ? ' <i>*</i>' : ''}</span>
          ${opts.area
            ? `<textarea id="a_${id}" rows="2" placeholder="${esc(opts.ph || '')}">${esc(a[id] || '')}</textarea>`
            : `<input id="a_${id}" value="${esc(a[id] || '')}" placeholder="${esc(opts.ph || '')}" ${opts.attrs || ''}>`}
          <em class="err" hidden>${opts.err || 'Need this one 🥺'}</em>
        </label>`;
      return `
      <section class="screen address">
        <div class="level-head">
          ${GIFS.home ? `<div class="level-badge gif-badge"><img src="${esc(GIFS.home)}" alt="" data-fallback="🏡"></div>` : '<div class="level-badge">🏡</div>'}
          <h2 class="title">Where do I send the love? 💌</h2>
        </div>
        <form class="addr card" id="addrForm" novalidate onsubmit="return false">
          ${f('name', 'Your name', { req: true, ph: HER, attrs: 'autocomplete="name"' })}
          ${f('phone', 'Phone', { req: true, ph: '98765 43210', attrs: 'inputmode="tel" autocomplete="tel"', err: 'A 10-digit number please 📱' })}
          ${f('line1', 'House / Flat / Building', { req: true, wide: true, attrs: 'autocomplete="address-line1"' })}
          ${f('line2', 'Street / Area', { wide: true, attrs: 'autocomplete="address-line2"' })}
          ${f('landmark', 'Landmark', { wide: true, ph: 'near the cute café…' })}
          ${f('city', 'City', { req: true, attrs: 'autocomplete="address-level2"' })}
          ${f('state', 'State', { attrs: 'autocomplete="address-level1"' })}
          ${f('pincode', 'Pincode', { req: true, attrs: 'inputmode="numeric" maxlength="6" autocomplete="postal-code"', err: '6 digits please 🔢' })}
          ${f('notes', 'Anything else?', { wide: true, area: true, ph: 'best time to deliver, gate code…' })}
        </form>
        <p class="tiny">🔒 Only ${esc(ME)} can see this.</p>
        ${navButtons(S.editing ? 'Save & back to my box 💝' : 'Walk me home 🏡', 'addrNext')}
      </section>`;
    },

    final: () => {
      const picks = S.picks.map(itemByKey).filter(Boolean);
      const a = S.address;
      const hasAddr = a.name && a.line1 && a.city && a.pincode;
      const byLevel = LEVELS.map((lv, li) => ({ lv, li, its: picks.filter(p => p.li === li), links: withIdx(w => w.at === li) })).filter(g => g.its.length || g.links.length);
      const well = withIdx(w => w.at === undefined);
      return `
      <section class="screen final">
        ${GIFS.final ? gifOr(GIFS.final, 'dance') : `<div class="mascot-stage">${couple('dance', 'big')}</div>`}
        <h1 class="big-title">${wavy('Your Love Box')}</h1>
        <p class="sub">${plural(picks.length + S.wishes.length, 'thing')} you love 💝</p>

        <div class="receipt card">
          <div class="receipt-top"><span>💗</span> ${esc(HER)}’s Love Box <span>💗</span></div>
          <div class="r-sec">
            <div class="r-head"><h3>Your picks</h3><button class="link-btn" data-act="jump" data-to="level0">edit</button></div>
            ${byLevel.length ? byLevel.map(g => `
              <p class="r-level">${g.lv.emoji || '🎁'} ${esc(g.lv.title)}</p>
              <ul class="r-list">${g.its.map(it => `
                <li><span class="r-thumb">${imgTag(it)}</span>
                  <span class="r-name">${safeUrl(it.link) ? `<a href="${esc(safeUrl(it.link))}" target="_blank" rel="noopener">${esc(it.name)}</a>` : esc(it.name)}</span>
                  <button class="x-btn" data-act="remove" data-key="${esc(it.key)}" aria-label="Remove ${esc(it.name)}">✕</button></li>`).join('')}${g.links.map(linkLi).join('')}
              </ul>`).join('') : '<p class="r-empty">Nothing yet, and that’s okay 💕</p>'}
          </div>
          <div class="r-sec">
            <div class="r-head"><h3>Wish Well</h3><button class="link-btn" data-act="jump" data-to="wishlist">edit</button></div>
            ${well.length ? `<ul class="r-list">${well.map(linkLi).join('')}</ul>`
              : '<p class="r-empty">No extra links 🪄</p>'}
          </div>
          <div class="r-sec">
            <div class="r-head"><h3>Deliver to</h3><button class="link-btn" data-act="jump" data-to="address">edit</button></div>
            ${hasAddr ? `<address class="r-addr">
                <b>${esc(a.name)}</b> · ${esc(a.phone || '')}<br>
                ${esc([a.line1, a.line2].filter(Boolean).join(', '))}<br>
                ${a.landmark ? `Near ${esc(a.landmark)}<br>` : ''}
                ${esc(a.city)}${a.state ? ', ' + esc(a.state) : ''} – ${esc(a.pincode)}
                ${a.notes ? `<br><small>📝 ${esc(a.notes)}</small>` : ''}
              </address>` : '<p class="r-empty">No address yet. Tap edit 🏡</p>'}
          </div>
          <div class="receipt-zig"></div>
        </div>

        ${C.finalNote ? `<div class="letter card"><p>${esc(C.finalNote)}</p><p class="sig">— always yours, ${esc(ME)} 💌</p></div>` : ''}

        <button class="btn ghost kiss-btn" data-act="kiss">Catch a kiss 😘</button>

        <div class="final-actions">
          <button class="btn primary big wiggle" data-act="send">Send it to ${esc(ME)} 💌</button>
          <button class="btn soft" data-act="copy">📋 Copy everything</button>
        </div>
        ${loveTape()}
        <button class="link-btn restart" data-act="restart">start over</button>
      </section>`;
    }
  };

  function navButtons(nextLabel = 'Next →', nextAct = 'next') {
    return `<div class="nav-row">
      <button class="btn soft" data-act="back">← Back</button>
      <button class="btn primary" data-act="${nextAct}" id="nextBtn">${nextLabel}</button>
    </div>`;
  }
  function nextLabelForLevel(i) {
    if (S.editing) return 'Save & back to my box 💝';
    const n = LEVELS[i].items.filter(it => S.picks.includes(it.key)).length + linksAt(i).length;
    return n ? 'Next stop →' : 'Skip this stop →';
  }

  /* --------------------------------------------------------- after-render */
  const AFTER = {
    map: afterMap,
    cheer: () => { sfx.tada(); setTimeout(bigCelebration, 150); },
    wishlist: renderWishList,
    address: bindAddress,
    final: (_, __, dir) => { if (dir !== 0) { sfx.tada(); setTimeout(bigCelebration, 200); } }
  };

  function afterMap(step, scr) {
    const road = $('#road', scr), done = $('#roadDone', scr), walker = $('#walker', scr), flip = $('#walkerFlip', scr);
    const steps = $('#steps', scr), bubble = $('.map-bubble', scr);
    const L = road.getTotalLength();
    const tAt = n => (n < 0 ? 0 : 0.07 + 0.9 * (n / Math.max(1, NODES.length - 1))) * L;
    $$('.node', scr).forEach(g => {
      const p = road.getPointAtLength(tAt(+g.dataset.node));
      g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      const lab = $('.label', g);
      if (lab) { const shift = Math.max(70 - p.x, Math.min(0, 290 - p.x)); lab.setAttribute('transform', `translate(${shift} 0)`); }
    });
    const from = tAt(step.node - 1), to = tAt(step.node);
    done.style.strokeDasharray = `${L} ${L}`;
    let facing = 1;
    const place = len => {
      const p = road.getPointAtLength(len), q = road.getPointAtLength(Math.min(L, len + 2));
      if (Math.abs(q.x - p.x) > 0.3) facing = q.x < p.x ? -1 : 1;
      walker.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      flip.setAttribute('transform', `scale(${facing} 1)`);
      done.style.strokeDashoffset = L - len;
      return p;
    };
    place(from);
    // keep the walker in view on short phones
    const target = $(`.node[data-node="${step.node}"]`, scr);
    const arrive = () => {
      walker.querySelector('.couple').classList.remove('walk');
      walker.querySelector('.couple').classList.add('dance', 'happy');
      target.classList.add('arrived');
      bubble.innerHTML = `We’re here! <b>${NODES[step.node].emoji} ${esc(NODES[step.node].title)}</b> ✨`;
      $('#enterBtn', scr).classList.add('wiggle');
      sfx.chime();
      burstAt(target, { particleCount: 40 });
    };
    if (reduceMotion) { place(to); arrive(); return; }
    const dur = 1500 + Math.min(1400, (to - from) * 6);
    let t0 = null, lastPrint = 0, lastStep = 0;
    const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    setTimeout(() => {
      const tick = now => {
        if (!scr.isConnected) return;
        if (t0 === null) t0 = now;
        const k = Math.min(1, (now - t0) / dur);
        const p = place(from + (to - from) * ease(k));
        if (now - lastPrint > 140 && k < 0.98) {
          lastPrint = now;
          const h = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          h.setAttribute('x', p.x.toFixed(1)); h.setAttribute('y', (p.y + 4).toFixed(1));
          h.setAttribute('class', 'footprint'); h.textContent = '♥';
          steps.appendChild(h); setTimeout(() => h.remove(), 1800);
        }
        if (now - lastStep > 300 && k < 0.95) { lastStep = now; sfx.step(); }
        if (k < 1) requestAnimationFrame(tick); else arrive();
      };
      requestAnimationFrame(tick);
    }, 500);
  }

  /* --------------------------------------------------------------- render */
  function render(dir = 1) {
    const step = STEPS[S.step];
    document.body.dataset.screen = step.type;
    stage.innerHTML = SCREENS[step.type](step);
    const scr = stage.firstElementChild;
    scr.classList.add(dir < 0 ? 'from-left' : dir > 0 ? 'from-right' : 'still');
    window.scrollTo(0, 0);
    $('#backBtn').style.visibility = S.step === 0 ? 'hidden' : 'visible';
    const pct = Math.round((S.step / (STEPS.length - 1)) * 100);
    $('#progressFill').style.width = Math.max(6, pct) + '%';
    updateBox(false);
    $('#soundBtn').textContent = S.soundOn ? '🔊' : '🔇';
    $('#musicBtn').classList.toggle('off', !S.musicOn);
    AFTER[step.type] && AFTER[step.type](step, scr, dir);
    if (step.type === 'level') renderStopLinks();
    requestAnimationFrame(() => $$('textarea.wish-note-edit').forEach(growNote));
    $$('[data-type]', scr).forEach(el => typeInto(el, el.textContent, +el.dataset.type || 0));
  }

  function go(i, dir) {
    S.step = Math.max(0, Math.min(STEPS.length - 1, i));
    save(); render(dir);
  }
  function forward() {
    const t = STEPS[S.step].type;
    if (S.editing && ['level', 'wishlist', 'address'].includes(t)) {
      S.editing = false; sfx.pop(); go(STEPS.length - 1, 1); return;
    }
    sfx.pop();
    try { history.pushState({ lb: S.step + 1 }, ''); } catch (e) { /* file:// on some browsers */ }
    go(S.step + 1, 1);
  }
  function backward() {
    let i = S.step - 1;
    while (i > 0 && ['map', 'cheer'].includes(STEPS[i].type)) i--;
    S.editing = false;
    sfx.boop(); go(i, -1);
  }

  /* ------------------------------------------------------------ love box */
  function updateBox(bump = true) {
    const n = S.picks.length + S.wishes.length;
    $('#boxCount').textContent = n;
    if (bump) { const b = $('#boxBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
  }

  function flyHeart(fromEl) {
    if (reduceMotion || !fromEl) return;
    const a = fromEl.getBoundingClientRect(), b = $('#boxBtn').getBoundingClientRect();
    for (let k = 0; k < 4; k++) {
      const h = document.createElement('div');
      h.className = 'fly-heart'; h.textContent = k % 2 ? '💗' : '💖';
      document.body.appendChild(h);
      const sx = a.left + a.width / 2 + (Math.random() - 0.5) * 40, sy = a.top + a.height / 2;
      const ex = b.left + b.width / 2, ey = b.top + b.height / 2;
      const mx = (sx + ex) / 2 + (Math.random() - 0.5) * 160, my = Math.min(sy, ey) - 80;
      h.animate([
        { transform: `translate(${sx}px, ${sy}px) scale(.6)`, opacity: 1 },
        { transform: `translate(${mx}px, ${my}px) scale(1.4)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${ex}px, ${ey}px) scale(.4)`, opacity: 0.2 }
      ], { duration: 850 + k * 90, easing: 'cubic-bezier(.5,0,.5,1)', delay: k * 60, fill: 'forwards' }).onfinish = () => h.remove();
    }
  }

  function refreshAfterChange() {
    updateBox();
    const t = STEPS[S.step].type;
    if (t === 'level') {
      $$('.float-item').forEach(el => el.classList.toggle('picked', S.picks.includes(el.dataset.key)));
      const nb = $('#nextBtn'); if (nb) nb.textContent = nextLabelForLevel(STEPS[S.step].i);
      renderStopLinks();
    }
    if (t === 'wishlist') renderWishList();
    if (t === 'final') render(0);
    if (drawer.classList.contains('open')) openDrawer(true);
  }

  function addPick(key, srcEl) {
    if (!S.picks.includes(key)) S.picks.push(key);
    save();
    flyHeart(srcEl); burstAt(srcEl, { particleCount: 30 });
    sfx.chime(); toast(rand(PICK_LINES)); buzz(18); gifPop(GIFS.reactions);
    closeModal();
    refreshAfterChange();
    mascotReact();
  }
  function removePick(key) {
    S.picks = S.picks.filter(k => k !== key); save();
    sfx.boop(); toast('Taken out 💨');
    if (modal.classList.contains('open')) closeModal();
    refreshAfterChange();
  }

  /* --------------------------------------------------------------- modal */
  let lastFocus = null;
  function openOverlay(el, html) {
    lastFocus = document.activeElement;
    el.innerHTML = html; el.classList.add('open'); el.setAttribute('aria-hidden', 'false');
    const f = el.querySelector('[data-focus]') || el.querySelector('button, a');
    f && setTimeout(() => f.focus({ preventScroll: true }), 50);
  }
  function closeOverlay(el) {
    el.classList.remove('open'); el.setAttribute('aria-hidden', 'true');
    setTimeout(() => { if (!el.classList.contains('open')) el.innerHTML = ''; }, 300);
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  const closeModal = () => closeOverlay(modal);
  const closeDrawer = () => closeOverlay(drawer);

  function openPeek(key) {
    const it = itemByKey(key); if (!it) return;
    const picked = S.picks.includes(key);
    const link = safeUrl(it.link);
    sfx.pop();
    openOverlay(modal, `
      <div class="modal-card" role="dialog" aria-modal="true" aria-label="${esc(it.name)}">
        <button class="close-x" data-act="closeModal" aria-label="Close">✕</button>
        <div class="modal-img">${imgTag(it)}${picked ? '<span class="pick-badge on">💖</span>' : ''}</div>
        <h3>${esc(it.name)}</h3>
        ${it.note ? `<p class="his-note">“${esc(it.note)}”<span>— ${esc(ME)}</span></p>` : ''}
        ${link ? `<a class="btn ghost open-link" href="${esc(link)}" target="_blank" rel="noopener">See it in the app 🛍️</a>` : ''}
        <div class="modal-actions">
          ${picked
            ? `<button class="btn soft" data-act="remove" data-key="${esc(key)}">Remove 💔</button>
               <button class="btn primary" data-act="closeModal" data-focus>Keep it ✓</button>`
            : `<button class="btn soft" data-act="closeModal">Maybe later</button>
               <button class="btn primary" data-act="add" data-key="${esc(key)}" data-focus>I love it! 💖</button>`}
        </div>
      </div>`);
  }

  function openDrawer(silent) {
    const picks = S.picks.map(itemByKey).filter(Boolean);
    const n = picks.length + S.wishes.length;
    if (!silent) sfx.pop();
    const tile = (img, name, sub, act, attr, k, note = '') => `
      <li class="box-tile" style="--in:${(k * 0.04).toFixed(2)}s">
        ${img}
        <span class="bt-name">${name}</span>
        <span class="bt-sub">${sub}</span>${note ? `<span class="bt-note">📝 ${esc(note)}</span>` : ''}
        <button class="bt-x" data-act="${act}" ${attr} aria-label="Remove">✕</button>
      </li>`;
    const html = `
      <div class="drawer-card" role="dialog" aria-modal="true" aria-label="Your love box">
        <div class="drawer-head"><h3>💝 Your Love Box</h3><button class="close-x" data-act="closeDrawer" aria-label="Close">✕</button></div>
        ${n === 0
          ? `<div class="empty">${couple('idle')}<p>Nothing here yet 🥺</p></div>`
          : `<p class="box-count"><b>${n}</b> ${n === 1 ? 'thing' : 'things'} you love so far</p>
             <ul class="box-grid">
               ${picks.map((it, k) => tile(`<span class="bt-img">${imgTag(it)}</span>`, esc(it.name), esc(it.levelTitle), 'remove', `data-key="${esc(it.key)}"`, k)).join('')}
               ${S.wishes.map((w, i) => tile(wThumb(w, 'bt-img'), wName(w), `🔗 ${w.at !== undefined ? esc(LEVELS[w.at].title) : 'Wish Well'}`, 'wishRemove', `data-i="${i}"`, picks.length + i, w.note)).join('')}
             </ul>`}
        <button class="btn primary drawer-go" data-act="closeDrawer">Keep going ✨</button>
      </div>`;
    if (silent && drawer.classList.contains('open')) drawer.innerHTML = html; else openOverlay(drawer, html);
  }

  /* ------------------------------------------------------------ wish well */
  const STORES = [
    [/amazon\.|amzn\./, '🛒', 'Amazon'], [/myntra/, '👗', 'Myntra'], [/flipkart|fkrt/, '🛍️', 'Flipkart'],
    [/nykaa/, '💄', 'Nykaa'], [/ajio/, '👠', 'AJIO'], [/meesho/, '🧺', 'Meesho'], [/zara\./, '🖤', 'Zara'],
    [/hm\.com|h&m/, '❤️', 'H&M'], [/purplle/, '💜', 'Purplle'], [/sugarcosmetics/, '💋', 'SUGAR'],
    [/tatacliq/, '✨', 'Tata CLiQ'], [/shein/, '🎀', 'SHEIN'], [/uniqlo/, '🧣', 'Uniqlo'], [/etsy/, '🧶', 'Etsy'],
    [/savana/, '🛍️', 'Savana'], [/instagram|instagr\.am/, '📸', 'Instagram'], [/pinterest|pin\.it/, '📌', 'Pinterest'], [/blinkit|zepto|swiggy|bigbasket/, '🛵', 'Quick delivery'],
    [/mamaearth/, '🌿', 'Mamaearth'], [/minimalist|beminimalist/, '🧴', 'Minimalist'], [/lenskart/, '👓', 'Lenskart'],
    [/firstcry/, '🧸', 'FirstCry'], [/fabindia/, '🪡', 'Fabindia'], [/bewakoof/, '👕', 'Bewakoof'], [/croma|reliancedigital/, '🎧', 'Gadgets']
  ];
  function storeOf(url) {
    let host = '';
    try { host = new URL(url).hostname.replace(/^www\./, ''); } catch (e) { host = String(url).slice(0, 30); }
    const m = STORES.find(([re]) => re.test(host.toLowerCase()));
    return m ? { icon: m[1], name: m[2], host } : { icon: '✨', name: host || 'A cute link', host };
  }
  function extractUrls(text) {
    const re = /https?:\/\/[^\s<>"']+/gi;
    const found = String(text || '').match(re) || [];
    // links pasted without https, like "amazon.in/dp/xyz"
    const rest = String(text || '').replace(re, ' ');
    (rest.match(/\b(?:[a-z0-9-]+\.)+(?:com|in|co|net|org|shop|store|me|io|app|ly|gl|it|page)\b(?:\/[^\s<>"']*)?/gi) || []).forEach(u => found.push('https://' + u));
    return [...new Set(found.map(u => u.replace(/[),.;!]+$/, '')))].filter(u => { try { new URL(u); return true; } catch (e) { return false; } });
  }
  // her pasted links fetch their own product photo + name (microlink.io, free, works from the browser)
  const previewing = new Set();
  const BAD_TITLE = /maintenance|access denied|robot|captcha|not found|sign in|log ?in|just a moment|error|blocked/i;
  const wThumb = (w, cls) => `<span class="${cls}${!w.img && previewing.has(w.url) ? ' loading' : ''}" data-wurl="${esc(w.url)}">${w.img
    ? `<img src="${esc(w.img)}" alt="" loading="lazy" data-fallback="${storeOf(w.url).icon}">`
    : `<span class="emoji-tile">${storeOf(w.url).icon}</span>`}</span>`;
  const wName = w => `<span data-wtitle="${esc(w.url)}">${esc(w.title || storeOf(w.url).name)}</span>`;
  async function viaReader(url) {
    const r = await fetch('https://r.jina.ai/' + url, { headers: { 'X-Return-Format': 'html', 'X-Target-Selector': 'head, #landingImage, #productTitle' } });
    if (!r.ok) throw new Error('reader ' + r.status);
    const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
    const meta = n => (doc.querySelector(`meta[property="${n}"], meta[name="${n}"]`) || {}).content || '';
    const li = doc.querySelector('#landingImage');            // Amazon's main photo
    let dyn = '';
    try { dyn = Object.keys(JSON.parse((li && li.getAttribute('data-a-dynamic-image')) || '{}'))[0] || ''; } catch (e) { /* */ }
    let img = meta('og:image') || meta('og:image:url') || meta('twitter:image') || meta('twitter:image:src')
      || (li && (li.getAttribute('data-old-hires') || dyn || li.getAttribute('src'))) || '';
    try { img = img ? new URL(img, url).href : ''; } catch (e) { img = ''; }
    const pt = doc.querySelector('#productTitle');
    return { img: safeUrl(img), title: meta('og:title') || meta('twitter:title') || (pt && pt.textContent) || doc.title || '' };
  }
  async function viaMicrolink(url) {
    const j = await (await fetch('https://api.microlink.io/?url=' + encodeURIComponent(url))).json();
    const d = (j && j.status === 'success' && j.data) || {};
    return { img: d.image ? safeUrl(d.image.url) : '', title: d.title || '' };
  }
  function fetchPreview(w) {
    if (w.img || (w.tries || 0) >= 2 || previewing.has(w.url) || !window.fetch || !window.DOMParser) return;
    previewing.add(w.url);
    const withPhoto = p => (p && p.img ? p : Promise.reject(new Error('no photo')));
    viaReader(w.url).then(withPhoto)
      .catch(() => viaMicrolink(w.url).then(withPhoto))
      .then(p => {
        w.img = p.img;
        const t = String(p.title || '').replace(/\s+/g, ' ').trim();
        if (t && !BAD_TITLE.test(t)) w.title = t.slice(0, 80);
      })
      .catch(() => { w.tries = (w.tries || 0) + 1; })   // blocked site: cute icon card, one more try next visit
      .finally(() => { previewing.delete(w.url); save(); paintPreview(w); });
  }
  // swap the photo + name in wherever this link is showing, without re-rendering (keeps typing focus)
  function paintPreview(w) {
    $$('[data-wurl]').forEach(el => {
      if (el.dataset.wurl !== w.url) return;
      el.classList.remove('loading');
      if (w.img && !el.querySelector('img')) el.innerHTML = `<img src="${esc(w.img)}" alt="" data-fallback="${storeOf(w.url).icon}">`;
    });
    $$('[data-wtitle]').forEach(el => {
      if (el.dataset.wtitle !== w.url || !w.title) return;
      el.textContent = w.title;
      const sub = el.closest('.wish-body') && el.closest('a').querySelector(':scope > span');
      if (sub) sub.textContent = storeOf(w.url).name;
    });
  }
  const withIdx = pred => S.wishes.map((w, i) => ({ w, i })).filter(x => pred(x.w));
  const linksAt = li => S.wishes.filter(w => w.at === li);
  const linkLi = ({ w, i }) => `
    <li>${wThumb(w, 'r-thumb')}
      <span class="r-name"><a href="${esc(w.url)}" target="_blank" rel="noopener">${wName(w)}</a>${w.note ? `<small class="r-note">📝 ${esc(w.note)}</small>` : ''}</span>
      <button class="x-btn" data-act="wishRemove" data-i="${i}" aria-label="Remove link">✕</button></li>`;

  // at = stop index when she pastes a link inside a stop; undefined for the Wish Well
  function addWishes(text, note, at) {
    const inStop = at !== undefined;
    const box = $(inStop ? '.stop-link' : '.wish-input'), err = $(inStop ? '#stopErr' : '#wishErr');
    const urls = extractUrls(text);
    if (!urls.length) { if (err) err.hidden = false; box?.classList.add('shake'); setTimeout(() => box?.classList.remove('shake'), 500); sfx.boop(); return; }
    if (err) err.hidden = true;
    let added = 0;
    urls.forEach(u => {
      if (S.wishes.some(w => w.url === u)) return;
      const w = { url: u, note: urls.length === 1 ? (note || '') : '' };
      if (inStop) w.at = at;
      S.wishes.push(w); added++;
      if (added <= 8) fetchPreview(w);
    });
    save();
    if (inStop) {
      $('#stopText').value = '';
      flyHeart(box); burstAt(box, { particleCount: 30 });
    } else {
      $('#wishText').value = ''; $('#wishNote').value = '';
      const well = $('.well');
      if (well) { well.classList.remove('splash'); void well.offsetWidth; well.classList.add('splash'); }
      flyHeart($('.well-svg')); burstAt($('.well-svg'), { particleCount: 34 });
    }
    sfx.chime();
    toast(!added ? 'Already in your box, silly 😄'
      : added > 1 ? `${added} links added! 💕`
      : inStop ? rand(['Good find 😍', 'Added 💖', 'Ooh cute 🎀'])
      : rand(['Ooh what is it? 👀', 'Added ✨', 'Wish granted 😉']));
    refreshAfterChange();
  }
  // her pasted links look just like the products: fetched photo, name, store
  const linkCard = ({ w, i }, k) => `
    <div class="float-item her-find" style="--d:${(-k * 0.9).toFixed(2)}s; --r:${(k % 2 ? 2.5 : -2.5)}deg; --in:${(k * 0.06).toFixed(2)}s">
      <span class="tape"></span>
      <a class="find-link" href="${esc(w.url)}" target="_blank" rel="noopener">${wThumb(w, 'ph')}</a>
      <span class="name">${wName(w)}</span>
      <span class="find-chip">🔗 ${esc(storeOf(w.url).name)}</span>
      <textarea class="wish-note-edit" data-wishnote="${i}" rows="1" maxlength="140" placeholder="📝 size, colour…">${esc(w.note || '')}</textarea>
      <button class="bt-x" data-act="wishRemove" data-i="${i}" aria-label="Remove link">✕</button>
    </div>`;
  function renderWishList() {
    const ul = $('#wishList'); if (!ul) return;
    const list = withIdx(w => w.at === undefined);
    ul.innerHTML = list.length ? list.map(linkCard).join('')
      : `<div class="wish-empty">Nothing here yet. That’s okay too 💕</div>`;
    $$('textarea.wish-note-edit', ul).forEach(growNote);
    const nb = $('#nextBtn');
    if (nb && !S.editing) nb.textContent = list.length ? 'Next →' : 'Skip →';
  }
  function renderStopLinks() {
    const ul = $('#stopLinks'), st = STEPS[S.step]; if (!ul || st.type !== 'level') return;
    const list = withIdx(w => w.at === st.i);
    ul.innerHTML = list.map(linkCard).join('');
    ul.hidden = !list.length;
    $$('textarea.wish-note-edit', ul).forEach(growNote);
  }

  /* -------------------------------------------------------------- address */
  const ADDR_FIELDS = ['name', 'phone', 'line1', 'line2', 'landmark', 'city', 'state', 'pincode', 'notes'];
  function bindAddress() {
    ADDR_FIELDS.forEach(id => {
      const el = $('#a_' + id); if (!el) return;
      el.addEventListener('input', () => {
        S.address[id] = el.value; save();
        el.closest('.field').classList.remove('bad');
        $('.err', el.closest('.field')).hidden = true;
      });
    });
  }
  function validateAddress() {
    const a = S.address, bad = [];
    if (!(a.name || '').trim()) bad.push('name');
    if (((a.phone || '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '')).length !== 10) bad.push('phone');
    if (!(a.line1 || '').trim()) bad.push('line1');
    if (!(a.city || '').trim()) bad.push('city');
    if (!/^\d{6}$/.test((a.pincode || '').trim())) bad.push('pincode');
    ADDR_FIELDS.forEach(id => {
      const el = $('#a_' + id); if (!el) return;
      const f = el.closest('.field'), isBad = bad.includes(id);
      f.classList.toggle('bad', isBad); $('.err', f).hidden = !isBad;
    });
    if (bad.length) {
      const first = $('#a_' + bad[0]); first && first.focus();
      const form = $('#addrForm'); form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
      sfx.boop(); toast('A couple of things are missing 🥺');
      return false;
    }
    return true;
  }

  /* ---------------------------------------------------------- send / copy */
  function buildMessage() {
    const out = [`💝 ${HER}'s Love Box 💝`, ''];
    const picks = S.picks.map(itemByKey).filter(Boolean);
    const linkLines = (w, n) => { if (w.title) out.push(`${n}. ${w.title}`, `   ${w.url}`); else out.push(`${n}. ${w.url}`); if (w.note) out.push(`   📝 ${w.note}`); };
    LEVELS.forEach((lv, li) => {
      const its = picks.filter(p => p.li === li), links = linksAt(li);
      if (!its.length && !links.length) return;
      out.push(`${lv.emoji || '🎁'} ${lv.title}:`);
      let n = 0;
      its.forEach(it => { out.push(`${++n}. ${it.name}`); if (safeUrl(it.link)) out.push(`   ${safeUrl(it.link)}`); });
      links.forEach(w => linkLines(w, ++n));
      out.push('');
    });
    const well = S.wishes.filter(w => w.at === undefined);
    if (well.length) {
      out.push('🪄 From my Wish Well:');
      well.forEach((w, i) => linkLines(w, i + 1));
      out.push('');
    }
    if (!picks.length && !S.wishes.length) out.push('(Just you is enough 🥹)', '');
    const a = S.address;
    if (a.name || a.line1) {
      out.push('🏡 Deliver to:');
      if (a.name) out.push(a.name);
      if (a.phone) out.push(`📞 ${a.phone}`);
      const l = [a.line1, a.line2].filter(Boolean).join(', '); if (l) out.push(l);
      if (a.landmark) out.push(`Landmark: ${a.landmark}`);
      out.push(`${a.city || ''}${a.state ? ', ' + a.state : ''}${a.pincode ? ' - ' + a.pincode : ''}`);
      if (a.notes) out.push(`📝 ${a.notes}`);
      out.push('');
    }
    out.push(`Love you ${ME} 💗`);
    return out.join('\n');
  }
  async function copyText(txt) {
    try { await navigator.clipboard.writeText(txt); return true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { /* */ }
      ta.remove(); return ok;
    }
  }
  function send() {
    const a = S.address;
    if (!(a.name && a.line1 && a.city && a.pincode)) {
      toast('Wait! I need your address first 🏡'); sfx.boop();
      setTimeout(() => { S.editing = true; go(stepIndex(s => s.type === 'address'), -1); }, 700);
      return;
    }
    const num = String(C.whatsappNumber || '').replace(/\D/g, '');
    const url = `https://wa.me/${/^\d{8,15}$/.test(num) ? num : ''}?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, '_blank', 'noopener');
    S.sentAt = Date.now(); save(); syncSoon(0);
    emailCopy();
    sfx.tada(); bigCelebration();
    setTimeout(() => openOverlay(modal, `
      <div class="modal-card sent" role="dialog" aria-modal="true" aria-label="Sent">
        ${GIFS.sent ? gifOr(GIFS.sent, 'dance') : `<div class="mascot-stage">${couple('dance', 'big')}</div>`}
        <h3>${wavy('Yaaay!')}</h3>
        <p>Got it, baby 💌<br>Now sit back, surprises are on the way 😘</p>
        <p class="tiny">If WhatsApp didn’t open, tap Copy everything and send it to me.</p>
        <button class="btn primary" data-act="closeModal" data-focus>Aww okay 🥹</button>
      </div>`), 600);
  }

  // a copy of her whole box lands in his inbox too, so nothing gets lost
  function emailCopy() {
    const to = String(C.email || '').trim();
    if (!to || !window.fetch) return;
    fetch('https://formsubmit.co/ajax/' + encodeURIComponent(to), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: `💝 ${HER}'s Love Box`, _template: 'box', _captcha: 'false', 'Her love box': buildMessage() })
    }).catch(() => { /* WhatsApp still has it */ });
  }

  /* -------------------------------------------------------------- toast */
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove('show'); void toastEl.offsetWidth; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* ------------------------------------------------------------- actions */
  const ACTIONS = {
    next: () => forward(),
    back: () => { if (S.step > 0) backward(); },
    peek: el => openPeek(el.dataset.key),
    add: el => addPick(el.dataset.key, el),
    remove: el => removePick(el.dataset.key),
    closeModal: () => { sfx.boop(); closeModal(); },
    openBox: () => openDrawer(),
    closeDrawer: () => { sfx.boop(); closeDrawer(); },
    sound: () => { S.soundOn = !S.soundOn; save(); $('#soundBtn').textContent = S.soundOn ? '🔊' : '🔇'; sfx.pop(); },
    wishAdd: () => addWishes($('#wishText').value, $('#wishNote').value.trim()),
    wishPaste: async () => {
      try { const t = await navigator.clipboard.readText(); if (t) { $('#wishText').value = t; addWishes(t, $('#wishNote').value.trim()); } }
      catch (e) { toast('Long-press the box & tap Paste 📋'); $('#wishText').focus(); }
    },
    wishRemove: el => { S.wishes.splice(+el.dataset.i, 1); save(); sfx.boop(); toast('Poof! Removed 💨'); refreshAfterChange(); },
    wishNext: () => forward(),
    stopAdd: el => addWishes($('#stopText').value, '', +el.dataset.i),
    addrNext: () => { if (validateAddress()) forward(); },
    jump: el => {
      const to = el.dataset.to;
      const i = to === 'level0' ? stepIndex(s => s.type === 'level') : stepIndex(s => s.type === to);
      if (i < 0) return;
      S.editing = true; sfx.pop(); go(i, -1);
    },
    send: () => send(),
    copy: async () => { const ok = await copyText(buildMessage()); sfx.chime(); toast(ok ? 'Copied! Send it to me 💌' : 'Couldn’t copy. Try Send? 🥺'); },
    restart: () => {
      if (!confirm('Start over? This empties your love box.')) return;
      S = { ...DEFAULT, soundOn: S.soundOn }; save(); go(0, -1);
    }
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (el && ACTIONS[el.dataset.act]) { e.preventDefault(); ACTIONS[el.dataset.act](el, e); return; }
    if (e.target === modal) closeModal();
    if (e.target === drawer) closeDrawer();
  });
  const growNote = el => { if (el.tagName === 'TEXTAREA') { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } };
  document.addEventListener('input', e => {
    const i = e.target.dataset && e.target.dataset.wishnote;
    if (i !== undefined && S.wishes[+i]) { S.wishes[+i].note = e.target.value; save(); growNote(e.target); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (modal.classList.contains('open')) closeModal(); else if (drawer.classList.contains('open')) closeDrawer(); }
    if (e.key === 'Enter' && e.target.id === 'wishText' && !e.shiftKey) { e.preventDefault(); ACTIONS.wishAdd(); }
    if (e.key === 'Enter' && e.target.id === 'wishNote') { e.preventDefault(); ACTIONS.wishAdd(); }
    if (e.key === 'Enter' && e.target.id === 'stopText') { e.preventDefault(); $('[data-act="stopAdd"]')?.click(); }
  });
  window.addEventListener('popstate', () => {
    if (modal.classList.contains('open')) closeModal();
    else if (drawer.classList.contains('open')) closeDrawer();
    else if (S.step > 0) backward();
  });

  /* ------------------------------------------------------- ambient magic */
  // floating hearts & sparkles in the background
  (function floaties() {
    const box = $('#floaties');
    const kinds = ['♥', '♥', '♥', '✦', '✿', '♡'];
    const cols = ['#ff8fbf', '#ffb3cf', '#ffffff', '#ff5fa2', '#ffd1e3'];
    const count = reduceMotion ? 0 : (innerWidth < 600 ? 14 : 24);
    for (let k = 0; k < count; k++) {
      const s = document.createElement('span');
      s.textContent = rand(kinds);
      s.style.cssText = `left:${Math.random() * 100}%;font-size:${12 + Math.random() * 22}px;color:${rand(cols)};` +
        `animation-duration:${10 + Math.random() * 14}s;animation-delay:${-Math.random() * 20}s;--sway:${(Math.random() * 60 - 30).toFixed(0)}px`;
      box.appendChild(s);
    }
  })();

  // tap anywhere → little heart pop
  document.addEventListener('pointerdown', e => {
    if (reduceMotion || e.target.closest('input, textarea, select')) return;
    for (let k = 0; k < 6; k++) {
      const h = document.createElement('span');
      h.className = 'tap-heart'; h.textContent = k % 3 ? '♥' : '✦';
      const ang = (Math.PI * 2 * k) / 6 + Math.random() * 0.5, dist = 28 + Math.random() * 26;
      h.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--dx:${(Math.cos(ang) * dist).toFixed(0)}px;--dy:${(Math.sin(ang) * dist - 14).toFixed(0)}px`;
      document.body.appendChild(h); setTimeout(() => h.remove(), 750);
    }
  }, { passive: true });


  /* ------------------------------------------------- extra cuteness ✨ */
  // slow romantic ballad (original, made with Web Audio, no files):
  // warm pad chords + a soft electric-piano melody + a quiet harp ripple underneath
  const BEAT = 0.8;                                   // ~75 bpm, unhurried
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  // [bass, pad voicing] per bar: Fmaj7  Am7  Dm7  Bbmaj7  Gm7  C7sus  Fmaj7  Fmaj7
  const CHORDS = [
    [41, [53, 57, 60, 64]], [45, [57, 60, 64, 67]], [38, [53, 57, 60, 62]], [46, [53, 57, 58, 62]],
    [43, [53, 55, 58, 62]], [48, [53, 55, 58, 60]], [41, [53, 57, 60, 64]], [41, [53, 57, 60, 64]]
  ];
  // melody per bar as [note, beats]
  const TUNE = [
    [[76, 3], [72, 1]], [[72, 2], [76, 1], [79, 1]], [[77, 3], [76, 1]], [[74, 2], [72, 1], [69, 1]],
    [[70, 2], [74, 2]], [[77, 2], [76, 2]], [[81, 2], [79, 1], [76, 1]], [[77, 4]]
  ];
  const ARP = [0, 1, 2, 3, 2, 1, 2, 3];               // gentle broken chord in eighths
  let musicTimer = null, musicGain = null, musicArmed = false;
  function bell(f, t, vol) {                          // soft harp ripple
    const src = ac.createBufferSource(), g = ac.createGain();
    src.buffer = pluckBuffer(f); g.gain.value = vol;
    src.connect(g).connect(musicGain); src.start(t);
  }
  function pad(f, t, dur, vol) {                      // warm, slow-swelling chord tone
    const o = ac.createOscillator(), o2 = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 1.004;
    lp.type = 'lowpass'; lp.frequency.value = 1000;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.9);
    g.gain.setValueAtTime(vol, t + dur - 0.3); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.8);
    o.connect(lp); o2.connect(lp); lp.connect(g).connect(musicGain);
    o.start(t); o2.start(t); o.stop(t + dur + 0.9); o2.stop(t + dur + 0.9);
  }
  function keys(f, t, dur, vol) {                     // soft electric-piano note for the melody
    const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), g2 = ac.createGain();
    o.type = 'sine'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2; g2.gain.value = 0.18;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.04);
    g.gain.exponentialRampToValueAtTime(vol * 0.45, t + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.4);
    o.connect(g); o2.connect(g2).connect(g); g.connect(musicGain);
    o.start(t); o2.start(t); o.stop(t + dur + 1.5); o2.stop(t + dur + 1.5);
  }
  function playLoop() {
    if (!musicGain) return;
    const t0 = ac.currentTime + 0.1, bar = 4 * BEAT;
    CHORDS.forEach(([bass, v], i) => {
      const tb = t0 + i * bar;
      pad(mtof(bass), tb, bar, 0.05);
      v.forEach(m => pad(mtof(m), tb, bar, 0.011));
      ARP.forEach((k, j) => bell(mtof(v[k] + 12), tb + j * BEAT / 2, j === 0 ? 0.03 : 0.018));
      let tm = tb;
      TUNE[i].forEach(([m, beats]) => { keys(mtof(m), tm, beats * BEAT, 0.075); tm += beats * BEAT; });
    });
    musicTimer = setTimeout(playLoop, CHORDS.length * bar * 1000 - 100);
  }
  function startTune() {
    if (musicTimer) return;
    try {
      audio();
      musicGain = ac.createGain(); musicGain.gain.setValueAtTime(0.0001, ac.currentTime); musicGain.gain.linearRampToValueAtTime(0.7, ac.currentTime + 2.5);
      musicGain.connect(master); musicGain.connect(echoIn);
      playLoop();
    } catch (e) { /* no audio */ }
  }
  function stopTune() {
    clearTimeout(musicTimer); musicTimer = null;
    if (musicGain) { const g = musicGain; musicGain = null; try { g.gain.setTargetAtTime(0.0001, ac.currentTime, 0.15); setTimeout(() => g.disconnect(), 800); } catch (e) { /* */ } }
  }

  /* ---- our songs: slowed Taylor love songs from YouTube, in a little player at the bottom */
  const SONGS = (C.songs || []).filter(x => x && x.youtube && x.youtube.length);
  const TOTAL_IDS = SONGS.reduce((n, x) => n + x.youtube.length, 0);
  const dock = $('#songDock');
  let yt = null, ytReady = false, ytDead = !SONGS.length || !dock, ytWant = false, songI = 0, idI = 0, fails = 0, hintT;
  function showDock() { if (ytDead) return; dock.hidden = false; document.body.classList.add('has-dock'); $('#sdTitle').textContent = SONGS[songI].title; }
  function giveUpYT() {
    ytDead = true; dock.hidden = true; document.body.classList.remove('has-dock');
    if (ytWant) { ytWant = false; startTune(); }
  }
  function cue(play) {
    $('#sdTitle').textContent = SONGS[songI].title;
    const id = SONGS[songI].youtube[idI];
    try { play ? yt.loadVideoById(id) : yt.cueVideoById(id); } catch (e) { giveUpYT(); }
  }
  function nextSong() { songI = (songI + 1) % SONGS.length; idI = 0; cue(ytWant); }
  function loadYT() {
    if (ytDead || document.getElementById('ytApi')) return;
    window.onYouTubeIframeAPIReady = () => {
      try {
        yt = new YT.Player('ytPlayer', {
          width: 160, height: 90, videoId: SONGS[0].youtube[0],
          playerVars: { playsinline: 1, controls: 0, rel: 0, modestbranding: 1, disablekb: 1, fs: 0, iv_load_policy: 3 },
          events: {
            onReady: () => { ytReady = true; try { yt.setVolume(75); } catch (e) { /* */ } if (ytWant) ytPlay(); },
            onStateChange: e => {
              if (e.data === 0) nextSong();                                    // ended → next song
              if (e.data === 1) { fails = 0; clearTimeout(hintT); dock.classList.remove('hint'); if (!ytWant) yt.pauseVideo(); }
            },
            onError: () => {                                                   // removed / blocked video → backup id → next song
              if (++fails > TOTAL_IDS) return giveUpYT();
              if (++idI < SONGS[songI].youtube.length) cue(ytWant); else nextSong();
            }
          }
        });
      } catch (e) { giveUpYT(); }
    };
    const sc = document.createElement('script');
    sc.id = 'ytApi'; sc.src = 'https://www.youtube.com/iframe_api';
    sc.onerror = giveUpYT;
    document.head.appendChild(sc);
  }
  function ytPlay() {
    showDock();
    if (!ytReady) return;
    try { yt.playVideo(); } catch (e) { return giveUpYT(); }
    // some phones only let music start from a tap on the video itself
    clearTimeout(hintT);
    hintT = setTimeout(() => { try { if (ytWant && yt.getPlayerState() !== 1) dock.classList.add('hint'); } catch (e) { /* */ } }, 3000);
  }
  function startMusic() {
    musicArmed = true;
    if (!S.musicOn || document.hidden) return;
    if (!ytDead) { ytWant = true; stopTune(); loadYT(); ytPlay(); return; }
    startTune();
  }
  function stopMusic() {
    ytWant = false; clearTimeout(hintT); dock && dock.classList.remove('hint');
    if (ytReady) { try { yt.pauseVideo(); } catch (e) { /* */ } }
    stopTune();
  }
  ACTIONS.songNext = () => { if (ytReady) { ytWant = true; S.musicOn = true; $('#musicBtn').classList.remove('off'); nextSong(); sfx.pop(); } };
  if (S.musicOn) loadYT();   // get the player ready early so her first tap can start the song

  document.addEventListener('pointerdown', () => { if (!musicArmed && !$('#envelope:not([hidden])')) startMusic(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopMusic(); else if (musicArmed) startMusic(); });
  ACTIONS.music = () => {
    S.musicOn = !S.musicOn; save();
    $('#musicBtn').classList.toggle('off', !S.musicOn);
    if (S.musicOn) startMusic(); else stopMusic();
    toast(S.musicOn ? 'Music on 🎶' : 'Shh… music off 🤫');
  };

  // the love letter she opens first 💌
  function showEnvelope() {
    const env = $('#envelope');
    env.innerHTML = `
      <div class="env-wrap">
        <p class="kicker">psst… ${esc(HER)}</p>
        <h2 class="title">A letter for you 💌</h2>
        <div class="env">
          <svg class="env-svg" viewBox="0 -110 300 310" aria-hidden="true">
            <rect class="e-back" x="4" y="40" width="292" height="156" rx="16" fill="#ff8fbf" stroke="#7a2e55" stroke-width="4"/>
            <g class="e-letter">
              <rect x="26" y="48" width="248" height="140" rx="12" fill="#fffdf8" stroke="#7a2e55" stroke-width="3.5"/>
              <text x="150" y="86" text-anchor="middle" class="e-to">For my ${esc(HER)}</text>
              <text x="150" y="118" text-anchor="middle" font-size="26">💗</text>
            </g>
            <path class="e-front" d="M4 74 L150 142 L296 74 V180 a16 16 0 0 1 -16 16 H20 a16 16 0 0 1 -16 -16 Z" fill="#ffc2da" stroke="#7a2e55" stroke-width="4" stroke-linejoin="round"/>
            <path d="M24 182 h30 M246 182 h30" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
            <path class="e-flap" d="M4 56 a16 16 0 0 1 16 -16 H280 a16 16 0 0 1 16 16 L150 136 Z" fill="#ffadd0" stroke="#7a2e55" stroke-width="4" stroke-linejoin="round"/>
          </svg>
          <button class="env-seal" data-act="openEnvelope" aria-label="Open the love letter">💗</button>
        </div>
        <p class="sub">tap the heart</p>
      </div>`;
    env.hidden = false;
  }
  ACTIONS.openEnvelope = () => {
    const env = $('#envelope');
    if (env.classList.contains('opening')) return;
    env.classList.add('opening');
    sfx.chime(); startMusic(); buzz([20, 50, 20]);
    const flap = $('.e-flap', env), letter = $('.e-letter', env);
    setTimeout(() => flap.parentNode.insertBefore(flap, letter), 280);
    setTimeout(() => { sfx.tada(); bigCelebration(); }, 950);
    setTimeout(() => {
      env.classList.add('gone');
      $$('#stage [data-type]').forEach(el => typeInto(el, el.getAttribute('aria-label') || el.textContent, 450));
    }, 1900);
    setTimeout(() => { env.hidden = true; env.innerHTML = ''; env.classList.remove('opening', 'gone'); }, 2600);
  };


  // little GIF stickers that pop up on happy moments 💋🤗
  const gifQueue = {};
  function gifPop(list) {
    const arr = (Array.isArray(list) ? list : [list]).filter(Boolean);
    if (!arr.length) return;
    const key = arr.join('|');
    const q = gifQueue[key] = (gifQueue[key] && gifQueue[key].length) ? gifQueue[key] : arr.slice().sort(() => Math.random() - 0.5);
    const url = q.shift();
    let el = $('#gifPop');
    if (!el) { el = document.createElement('div'); el.id = 'gifPop'; el.setAttribute('aria-hidden', 'true'); document.body.appendChild(el); }
    clearTimeout(el._t);
    el.innerHTML = `<span class="gif-tape"></span><img src="${esc(url)}" alt="">`;
    el.style.setProperty('--tilt', (Math.random() * 10 - 5).toFixed(1) + 'deg');
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    el._t = setTimeout(() => el.classList.remove('show'), 2600);
  }
  // warm the cache so stickers appear instantly
  setTimeout(() => [].concat(GIFS.reactions || [], GIFS.kiss || [], GIFS.cheer || []).forEach(u => { const i = new Image(); i.src = u; }), 2500);

  // the couple cheers when she picks something
  function mascotReact() {
    const m = $('.mini-mascot .couple'), b = $('.peek-row .bubble');
    if (!m) return;
    m.classList.remove('idle'); m.classList.add('dance', 'happy');
    if (b) {
      typeInto(b, rand(['Yaay 🥳', 'Eee good pick 🙈', '*happy bunny noises* 🐰', 'Ooh that’s cute 😍', 'Another one? 😍', 'We approve 💯']));
      b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing');
    }
    clearTimeout(mascotReact.t);
    mascotReact.t = setTimeout(() => { m.classList.remove('dance', 'happy'); m.classList.add('idle'); }, 1700);
  }

  // catch a kiss 😘
  ACTIONS.kiss = el => {
    sfx.mwah(); buzz([12, 40, 12]); gifPop(GIFS.kiss);
    $$('.final svg.couple').forEach(c => { c.classList.add('happy'); clearTimeout(c._h); c._h = setTimeout(() => c.classList.remove('happy'), 1800); });
    toast(rand(['Mwah! 💋', 'Caught it? 😘', 'Kiss delivered 💌', 'Mwah mwah mwah 💕']));
    const m = $('.final .mascot-stage .couple, .final .gif-frame');
    if (m) { m.classList.remove('boing'); void m.getBoundingClientRect(); m.classList.add('boing'); }
    if (reduceMotion) return;
    const r = el.getBoundingClientRect();
    for (let k = 0; k < 16; k++) {
      const h = document.createElement('div');
      h.className = 'kiss'; h.textContent = rand(['💋', '😘', '💗', '💕', '💋']);
      document.body.appendChild(h);
      const sx = r.left + r.width / 2, sy = r.top;
      const ex = Math.random() * innerWidth, ey = -60 - Math.random() * 100;
      h.animate([
        { transform: `translate(${sx}px, ${sy}px) scale(.3) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${(sx + ex) / 2 + (Math.random() - .5) * 120}px, ${sy * 0.5}px) scale(1.5) rotate(${(Math.random() - .5) * 60}deg)`, opacity: 1, offset: .5 },
        { transform: `translate(${ex}px, ${ey}px) scale(.8) rotate(${(Math.random() - .5) * 90}deg)`, opacity: 0 }
      ], { duration: 1400 + Math.random() * 900, delay: k * 50, easing: 'cubic-bezier(.3,.1,.3,1)', fill: 'forwards' }).onfinish = () => h.remove();
    }
  };

  // squishy jelly taps
  document.addEventListener('pointerdown', e => {
    if (reduceMotion) return;
    const t = e.target.closest('.float-item, .btn, .icon-btn, .box-btn, .x-btn, .env-seal');
    if (!t) return;
    t.classList.remove('squish'); void t.offsetWidth; t.classList.add('squish');
  }, { passive: true });
  document.addEventListener('animationend', e => { if (e.animationName === 'squish') e.target.classList.remove('squish'); });

  // sparkle trail + the couple's eyes follow her finger
  let lastTrail = 0, lookRaf = 0, lookX = innerWidth / 2, lookY = innerHeight / 2;
  function updateLook() {
    lookRaf = 0;
    $$('svg.couple').forEach(svg => {
      if (svg.closest('#walker')) return;
      const r = svg.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > innerHeight) return;
      const dx = lookX - (r.left + r.width / 2), dy = lookY - (r.top + r.height * 0.4);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 180);
      svg.querySelectorAll('.look').forEach(g => { g.style.transform = `translate(${(dx / d * 3.2 * k).toFixed(2)}px, ${(dy / d * 2.6 * k).toFixed(2)}px)`; });
    });
  }
  document.addEventListener('pointermove', e => {
    lookX = e.clientX; lookY = e.clientY;
    if (!lookRaf) lookRaf = requestAnimationFrame(updateLook);
    if (reduceMotion) return;
    const now = performance.now();
    if (now - lastTrail < 45) return;
    lastTrail = now;
    const s = document.createElement('span');
    s.className = 'trail'; s.textContent = Math.random() < 0.55 ? '✦' : '♥';
    s.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;color:${rand(['#ff5fa2', '#ff9cc4', '#ffc94d', '#ffffff', '#b98cff'])};font-size:${8 + Math.random() * 9}px`;
    document.body.appendChild(s); setTimeout(() => s.remove(), 850);
  }, { passive: true });

  // cherry-blossom petals drifting down
  (function petals() {
    if (reduceMotion) return;
    const box = $('#floaties'), n = innerWidth < 600 ? 8 : 14;
    for (let k = 0; k < n; k++) {
      const p = document.createElement('i');
      p.className = 'petal';
      p.style.cssText = `left:${(Math.random() * 100).toFixed(1)}%;--s:${(0.6 + Math.random() * 0.8).toFixed(2)};` +
        `animation-duration:${(10 + Math.random() * 10).toFixed(1)}s,${(2 + Math.random() * 2.5).toFixed(1)}s;animation-delay:${(-Math.random() * 20).toFixed(1)}s,0s`;
      box.appendChild(p);
    }
  })();

  /* ----------------------------------------------------------------- go! */
  try { history.replaceState({ lb: S.step }, ''); } catch (e) { /* */ }
  S.wishes.filter(w => !w.img).slice(0, 8).forEach(fetchPreview);
  render(0);
  if (S.step === 0) showEnvelope();
})();

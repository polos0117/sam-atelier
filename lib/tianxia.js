/* 천하 지도 · 진영 막사(2026-11-17) — 공방의 첫 화면(index.html). 설계 docs/superpowers/specs/2026-11-17-tianxia-map-design.md.
   한 화면의 두 층: 지도(html[data-layer="map"])와 막사("camp"). 주소 ?era=<판도>&w=<세계>[&f=<세력>] — f 가 있으면 막사. 뒤로 가기는 막사 → 지도.
   셈(판도별 세력 · 막사 · 결의 · 새 그림)은 lib/tianxia-core.js(window.Tianxia), 자료는 data/tianxia.json, 말은 lib/words.js(tx.*).
   고른 판도 · 세계는 이 브라우저에(samguk_tianxia_v1). 바탕 그림은 그림 저장소 backgrounds/tianxia/<세계>-<light|dark>.webp — 못 받으면 임시 바탕(종이색 + 강 · 해안 윤곽). */
import { h, render } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useRef, useMemo } from 'https://esm.sh/preact@10.24.3/hooks';
import { PAGES } from './workspace-ui.js?v=8';

const W = window.W, IMG = window.AtelierImg, T = window.Tianxia, A = window.AtelierAppearance;
const WORLDS = ['samguk', 'fantasy', 'mecha'], STORE = 'samguk_tianxia_v1';
const ART = IMG.BASES[0].replace(/img\/$/, 'backgrounds/tianxia/');
const param = k => { try { return new URLSearchParams(location.search).get(k); } catch (e) { return null; } };
const pref = (() => { try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { return {}; } })();
const json = u => fetch(u, { cache: 'no-cache' }).then(r => r.ok ? r.json() : Promise.reject(new Error(u + ' ' + r.status)));
/* 공간의 밝기 — 밝은 공간이면 밝은 판. workspace-theme.js 가 theme-color 에 그 공간의 바탕색을 적어 둔다(공간을 더해도 여기는 안 고친다) */
function toneNow() {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec((document.querySelector('meta[name="theme-color"]') || {}).content || '');
  return m && (parseInt(m[1], 16) * 299 + parseInt(m[2], 16) * 587 + parseInt(m[3], 16) * 114) / 1000 < 128 ? 'dark' : 'light';
}

/* 자료 한 번 — 설계표 · 새 판 세력 자료(읽기만) · 지도 자료 · 그림 등록부 */
function useDocs() {
  const [doc, setDoc] = useState(null);
  useEffect(() => {
    Promise.all([json('data/sam-design.json'), json('data/draft2-packs.json'), json('data/draft2-factions.json'), json('data/draft2-combos.json'), json('data/tianxia.json'),
      IMG.load().catch(() => ({}))])
      .then(([design, packs, factions, combos, tianxia, img]) => {
        const by = {}, last = {}; for (const g of design.generals) { by[g.key] = g; last[g.key] = T.lastAdded(img[g.key], IMG.added()); }
        setDoc({ t: T.make({ design, packs, factions, combos, tianxia }), design, tianxia, img, by, last, today: T.today(location.search) });
      }).catch(() => setDoc({ failed: true }));
  }, []);
  return doc;
}
const isNew = (doc, name) => T.isNew(doc.last[name], doc.today, T.seen.get(name));

/* ── 지도 끌기 · 확대 ── 포인터 이벤트로 직접(한 손가락 끌기 · 두 손가락 · 두 번 누르기 · 휠). 처음엔 전체 맞춤, 지도는 밖으로 못 나간다.
   끌기가 시작되면 포인터를 무대가 잡아 그 손가락의 누르기(click)가 성 · 땅에 가지 않는다 */
function usePanZoom(stage, map) {
  useEffect(() => {
    const el = stage.current, m = map.current, z = { s: 1, x: 0, y: 0 }, pts = new Map();
    let mw = 0, mh = 0, moved = false, start = null, pinch = 0, tapT = 0, tapP = null;
    const apply = () => {
      const w = el.clientWidth, hh = el.clientHeight, sw = mw * z.s, sh = mh * z.s;
      z.x = sw <= w ? (w - sw) / 2 : Math.min(0, Math.max(w - sw, z.x)); z.y = sh <= hh ? (hh - sh) / 2 : Math.min(0, Math.max(hh - sh, z.y));
      m.style.transform = 'translate(' + z.x + 'px,' + z.y + 'px) scale(' + z.s + ')'; el.dataset.zoom = z.s > 1.01 ? '1' : '0';
    };
    const fit = () => { mw = Math.min(el.clientWidth, el.clientHeight * 2 / 3); mh = mw * 1.5; m.style.width = mw + 'px'; m.style.height = mh + 'px'; apply(); };
    const zoomAt = (px, py, ns) => { ns = Math.min(4, Math.max(1, ns)); z.x = px - (px - z.x) * ns / z.s; z.y = py - (py - z.y) * ns / z.s; z.s = ns; apply(); };
    const at = e => { const r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const gap = () => { const [a, b] = [...pts.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]); };
    const down = e => { pts.set(e.pointerId, at(e)); if (pts.size === 1) { moved = false; start = at(e); } else if (pts.size === 2) { moved = true; pinch = gap(); } };
    const move = e => {
      if (!pts.has(e.pointerId)) return;
      const p = at(e), q = pts.get(e.pointerId);
      if (pts.size === 1) {
        if (!moved && Math.hypot(p[0] - start[0], p[1] - start[1]) < 7) return;
        if (!moved) { moved = true; try { el.setPointerCapture(e.pointerId); } catch (x) {} }
        z.x += p[0] - q[0]; z.y += p[1] - q[1]; pts.set(e.pointerId, p); apply();
      } else if (pts.size === 2) {
        pts.set(e.pointerId, p); const d = gap(), [a, b] = [...pts.values()];
        if (pinch) zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z.s * d / pinch); pinch = d;
      }
    };
    const up = e => {
      if (!pts.delete(e.pointerId) || pts.size || moved) return;
      const p = at(e), now = Date.now();   /* 두 번 누르기 — 그 자리로 확대, 커져 있으면 전체로 */
      if (now - tapT < 320 && tapP && Math.hypot(p[0] - tapP[0], p[1] - tapP[1]) < 30) { zoomAt(p[0], p[1], z.s > 1.01 ? 1 : 2.4); tapT = 0; } else { tapT = now; tapP = p; }
    };
    const click = e => { if (moved) { e.stopPropagation(); e.preventDefault(); } };
    const wheel = e => { e.preventDefault(); const p = at(e); zoomAt(p[0], p[1], z.s * Math.exp(-e.deltaY / 400)); };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('click', click, true); el.addEventListener('wheel', wheel, { passive: false });
    const ro = new ResizeObserver(fit); ro.observe(el); fit();
    return () => { ro.disconnect(); el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      el.removeEventListener('click', click, true); el.removeEventListener('wheel', wheel); };
  }, []);
}

/* 임시 바탕의 강 · 해안 윤곽(지도 백분율 좌표) — 바탕 그림을 못 받을 때만. 그림이 정해지면 그림의 것이 보인다 */
const SEA = 'M100,14 L92,13 C86,11 79,12 77,16 C75,20 77,22 81,23 C86,23 90,25 90,27 C86,30 80,30 78,33 C80,38 86,42 87,46 C85,50 87,56 84,62 C80,70 74,76 68,80 C60,86 48,90 40,93 C36,95 34,98 34,100 L100,100 Z';
const RIVERS = ['M14,30 C22,27 26,22 34,16 C40,14 44,18 45,26 C46,32 50,31 55,31.6 C60,31 62,28 66,25 C70,22 74,22 77,21',
  'M10,52 C18,56 24,55 30.5,54.6 C36,52 38,49 41,48.6 C46,49 48,51.6 51,51.6 C55,52 56,50.6 58.5,50.9 C61,52 62,54 64.5,54.1 C68,52 70,47 74,44.9 C78,44 82,45 87,45.5'];

/* 성 이름을 표지의 어느 쪽에 둘까 — 아래 · 오른쪽 · 왼쪽 · 위 차례로, 다른 성의 표지 · 이미 놓은 이름과 덜 겹치는 쪽(폰 폭 344 에서 셈한다 — 가장 빽빽한 때).
   가운데(낙양 · 하내 · 진류 · 허창 …)가 빽빽해 모두 아래에 두면 이름이 서로 덮는다. 성 자리가 바뀌면 다시 셈한다 */
function labelSides(cities) {
  const PX = 3.44, PY = 5.16, boxes = cities.map(c => [c.x * PX - 8, c.y * PY - 8, 16, 16]), out = {};
  const hit = (a, b) => Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
  for (const c of cities) {
    const x = c.x * PX, y = c.y * PY, w = c.ko.length * 10 + 2, cand = { b: [x - w / 2, y + 9, w, 11], r: [x + 10, y - 5.5, w, 11], l: [x - 10 - w, y - 5.5, w, 11], t: [x - w / 2, y - 20, w, 11] };
    let best = 'b', bs = Infinity;
    for (const k of ['b', 'r', 'l', 't']) { const s = boxes.reduce((n, b) => n + hit(cand[k], b), 0) + (cand[k][0] < 0 || cand[k][0] + w > 344 ? 999 : 0); if (s < bs) { bs = s; best = k; } }
    out[c.key] = best; boxes.push(cand[best]);
  }
  return out;
}

/* ── ① 천하 지도 ── */
function MapLayer({ doc, era, world, tone, setEra, setWorld, onFaction, onTools }) {
  const stage = useRef(null), map = useRef(null), [art, setArt] = useState('');
  usePanZoom(stage, map);
  /* 바탕 그림 — 받아지면 쓰고, 못 받으면 임시 바탕 */
  useEffect(() => { const url = ART + world + '-' + tone + '.webp', im = new Image(); let live = true;
    im.onload = () => { if (live) setArt(url); }; im.onerror = () => { if (live) setArt(''); }; im.src = url; return () => { live = false; }; }, [world, tone]);
  const e = doc.tianxia.eras[era], facs = useMemo(() => T.factionsOf(doc.t, era), [doc, era]), fmap = {}; for (const f of facs) fmap[f.key] = f;
  const cities = doc.tianxia.cities, sides = useMemo(() => labelSides(cities), [cities]), firstLandless = facs.findIndex(f => f.landless);
  /* 땅을 누르면 — 가장 가까운 성의 주인 세력으로(성 표지는 작아도 된다) */
  const land = ev => { const r = map.current.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * 100, y = (ev.clientY - r.top) / r.height * 100; let best = null, bd = 8;
    for (const c of cities) { const f = T.ownerOf(doc.t, era, c.key), d = Math.hypot(c.x - x, (c.y - y) * 1.5); if (f && d < bd) { bd = d; best = f; } }
    if (best) onFaction(best); };
  return h('div', { class: 'tx-app' },
    h('header', { class: 'tx-top' },
      h('b', { class: 'tx-name' }, W('app.title')),
      h('button', { type: 'button', class: 'tx-tools', 'aria-label': W('tx.tools'), title: W('tx.tools'), onClick: onTools }, h('span', { 'aria-hidden': 'true' }, '⚙')),
      h('p', { class: 'tx-line' }, e.virtual ? W('tx.virtual', { ko: e.ko, line: e.line }) : e.line)),
    h('div', { class: 'tx-stage', ref: stage, onClick: land },
      h('div', { class: 'tx-map', ref: map, 'data-art': art ? '1' : '0', role: 'group', 'aria-label': W('tx.map'), style: art ? { backgroundImage: 'url("' + art + '")' } : null },
        !art && h('svg', { class: 'tx-terrain', viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' },
          h('path', { class: 'sea', d: SEA }), RIVERS.map((d, i) => h('path', { key: i, class: 'river', d, 'vector-effect': 'non-scaling-stroke' }))),
        /* 세력의 땅 — 성마다 세력색 번짐. 가까운 성끼리 겹쳐 같은 세력은 이어 보인다 */
        cities.map(c => { const f = fmap[T.ownerOf(doc.t, era, c.key)]; return h('i', { key: c.key, class: 'tx-land', style: { left: c.x + '%', top: c.y + '%', backgroundColor: f ? f.color : 'transparent' } }); }),
        cities.map(c => { const f = fmap[T.ownerOf(doc.t, era, c.key)];
          return h('button', { key: c.key, type: 'button', class: 'tx-city', 'data-city': c.key, 'data-f': f ? f.key : '', 'data-l': sides[c.key], style: { left: c.x + '%', top: c.y + '%', '--c': f ? f.color : 'transparent' },
            'aria-label': W('tx.city', { city: c.ko, f: f ? f.key : W('tx.noowner') }), onClick: ev => { ev.stopPropagation(); if (f) onFaction(f.key); } }, h('u'), h('s', null, c.ko)); })),
      e.when && h('p', { class: 'tx-when' }, e.when)),
    /* 범례 — 그해 장수가 있는 세력. 성 많은 차례, 성이 없는 세력은 끝에 「떠도는 세력」 */
    h('nav', { class: 'tx-legend', 'aria-label': W('tx.legend') }, facs.map((f, i) => { const nw = T.members(doc.t, era, f.key).some(m => isNew(doc, m.name));
      return [i === firstLandless && h('span', { key: 'll', class: 'tx-ll' }, W('tx.landless')),
        h('button', { key: f.key, type: 'button', 'data-f': f.key, 'data-new': nw ? '1' : '0', 'data-landless': f.landless ? '1' : '0', style: { '--c': f.color },
          'aria-label': W(nw ? 'tx.legend.new' : 'tx.legend.n', { f: f.key, n: f.count }), onClick: () => onFaction(f.key) }, h('em', null, f.glyph), f.key, h('small', null, f.count))]; })),
    h('footer', { class: 'tx-bot' },
      h('div', { class: 'tx-eras', role: 'group', 'aria-label': W('tx.eras') }, T.ERAS.map(k => { const ko = doc.tianxia.eras[k].ko, sp = ko.indexOf(' ');
        return h('button', { key: k, type: 'button', 'data-era': k, 'aria-pressed': era === k, onClick: () => setEra(k) }, sp < 0 ? ko : ko.slice(0, sp), h('small', null, sp < 0 ? W('tx.era.all') : ko.slice(sp + 1))); })),
      h('div', { class: 'tx-worlds', role: 'group', 'aria-label': W('tx.worlds') }, WORLDS.map(w => h('button', { key: w, type: 'button', 'data-w': w, 'aria-pressed': world === w, onClick: () => setWorld(w) }, W('tx.world.' + w)))),
      h('p', { class: 'tx-hint' }, W('tx.hint'))));
}

/* ── 도구 상자 ── 옛 타이틀의 메뉴 · 군막의 최근 그림 여덟 · 패치 기록 · 공간 고르기, 그리고 「새 그림 모두 확인」 */
function recent(doc, n) {
  return Object.entries(IMG.added()).filter(([f]) => doc.by[f.split('_')[0]]).sort((a, b) => a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : (a[0] < b[0] ? -1 : 1)).slice(0, n)
    .map(([f]) => ({ f, g: doc.by[f.split('_')[0]] }));
}
function Tools({ doc, onClose, onSeen }) {
  const [log, setLog] = useState(null), [theme, setTheme] = useState(A.get().theme), box = useRef(null);
  useEffect(() => { const k = e => { if (e.key === 'Escape') onClose(); }, t = () => setTheme(A.get().theme);
    addEventListener('keydown', k); addEventListener('atelier-appearance', t); box.current && box.current.focus();
    return () => { removeEventListener('keydown', k); removeEventListener('atelier-appearance', t); }; }, []);
  const openPatch = () => { if (log) return setLog(null); setLog({ wait: true });
    fetch(window.AtelierPatch.PATH, { cache: 'no-cache' }).then(r => r.ok ? r.text() : Promise.reject(new Error(String(r.status))))
      .then(t => setLog({ entries: window.AtelierPatch.parse(t).slice(0, 12) })).catch(() => setLog({ entries: [], failed: true })); };
  const fresh = doc.design.generals.filter(g => isNew(doc, g.key)), list = recent(doc, 8);
  const seenAll = () => { const m = {}; for (const g of fresh) m[g.key] = doc.last[g.key]; T.seen.markAll(m); onSeen(); };
  return h('div', { class: 'tx-shade', onClick: e => { if (e.target === e.currentTarget) onClose(); } },
    h('section', { class: 'tx-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': W('tx.tools'), tabIndex: -1, ref: box },
      h('div', { class: 'tx-sheet-head' }, h('h2', null, W('tx.tools')), h('button', { type: 'button', class: 'tx-close', onClick: onClose }, W('tx.close'))),
      h('nav', { class: 'tx-go', 'aria-label': W('tx.tools.go') }, PAGES.filter(k => k !== 'hall').map(k => h('a', { key: k, 'data-go': k, href: k + '.html' }, W('nav.' + k)))),
      h('button', { type: 'button', class: 'tx-seenall', disabled: !fresh.length, onClick: seenAll }, fresh.length ? W('tx.seenall.n', { n: fresh.length }) : W('tx.seenall.none')),
      h('h3', null, W('home.recent')),
      list.length ? h('div', { class: 'tx-recent' }, list.map(x => h('a', { key: x.f, href: 'dex.html?faction=' + x.g.faction + '&card=' + encodeURIComponent(x.g.key) + '&pic=' + encodeURIComponent(x.f), title: x.g.key },
        h('img', { loading: 'lazy', src: IMG.thumbURL(x.f), alt: x.g.key, onError: e => { e.target.onerror = null; e.target.src = IMG.imgURL(x.f); } }), h('span', null, x.g.key))))
        : h('p', { class: 'tx-note' }, W('home.recent.none')),
      h('h3', null, W('home.themes')),
      h('div', { class: 'tx-themes', role: 'group', 'aria-label': W('ui.theme') }, A.themes.map(k => h('button', { key: k, type: 'button', 'data-theme-pick': k, 'aria-pressed': theme === k, onClick: () => A.set('theme', k) }, W('theme.' + k)))),
      h('h3', null, W('home.patch')),
      h('button', { type: 'button', class: 'tx-patch-open', 'aria-expanded': !!log, onClick: openPatch }, W(log ? 'home.patch.close' : 'home.patch.open')),
      log && (log.wait ? h('p', { class: 'tx-note' }, W('home.patch.loading')) : log.failed ? h('p', { class: 'tx-note' }, W('home.patch.fail')) : !log.entries.length ? h('p', { class: 'tx-note' }, W('home.patch.none')) :
        h('ul', { class: 'tx-patch' }, log.entries.map((e, i) => h('li', { key: i }, h('small', null, e.date + ' · ' + e.who), h('b', null, e.title), e.items.map((x, j) => h('p', { key: j }, x)))),
          h('li', null, h('a', { href: window.AtelierPatch.PATH }, W('tx.tools.patch.more')))))));
}

function App() {
  const doc = useDocs();
  const [era, setEraS] = useState(() => [param('era'), pref.era].find(k => T.ERAS.includes(k)) || 'mx');
  const [world, setWorldS] = useState(() => [param('w'), pref.w].find(k => WORLDS.includes(k)) || 'samguk');
  const [tone, setTone] = useState(toneNow), [tools, setTools] = useState(false), [, tick] = useState(0);
  const layer = 'map';
  useEffect(() => { const t = () => setTone(toneNow()); addEventListener('atelier-appearance', t); return () => removeEventListener('atelier-appearance', t); }, []);
  useEffect(() => { const d = document.documentElement.dataset; d.layer = layer; d.world = world; d.tone = tone; }, [layer, world, tone]);
  /* 고른 것은 주소와 이 브라우저에 — 주소의 다른 값은 그대로 둔다 */
  const keep = (e, w) => { try { localStorage.setItem(STORE, JSON.stringify({ era: e, w })); } catch (x) {}
    try { const u = new URL(location.href); u.searchParams.set('era', e); u.searchParams.set('w', w); history.replaceState(history.state, '', u); } catch (x) {} };
  const setEra = e => { setEraS(e); keep(e, world); }, setWorld = w => { document.documentElement.dataset.world = w; setWorldS(w); keep(era, w); };
  if (!doc) return h('p', { class: 'tx-wait' }, W('tx.loading'));
  if (doc.failed) return h('p', { class: 'tx-wait' }, W('tx.fail'));
  return h('div', null,
    h(MapLayer, { doc, era, world, tone, setEra, setWorld, onFaction: () => {}, onTools: () => setTools(true) }),
    tools && h(Tools, { doc, onClose: () => setTools(false), onSeen: () => tick(n => n + 1) }));
}
render(h(App), document.getElementById('app'));
window.AtelierFresh.watch();

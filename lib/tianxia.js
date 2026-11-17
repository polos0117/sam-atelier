/* 천하 지도 · 진영 막사(2026-11-17) — 공방의 첫 화면(index.html). 설계 docs/superpowers/specs/2026-11-17-tianxia-map-design.md.
   한 화면의 두 층: 지도(html[data-layer="map"])와 막사("camp"). 주소 ?era=<판도>&w=<세계>[&f=<세력>] — f 가 있으면 막사. 뒤로 가기는 막사 → 지도.
   셈(판도별 세력 · 막사 · 결의 · 새 그림)은 lib/tianxia-core.js(window.Tianxia), 자료는 data/tianxia.json, 말은 lib/words.js(tx.*).
   고른 판도 · 세계는 이 브라우저에(samguk_tianxia_v1). 바탕 그림은 그림 저장소 backgrounds/tianxia/<세계>-<light|dark>.webp — 못 받으면 임시 바탕(종이색 + 강 · 해안 윤곽). */
import { h, render } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useRef, useMemo } from 'https://esm.sh/preact@10.24.3/hooks';
import { PAGES } from './workspace-ui.js?v=8';
import { flyFrom, pop } from './motion-fx.js?v=1';

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
    Promise.all([json('data/sam-design.json'), json('data/draft2-packs.json'), json('data/draft2-factions.json'), json('data/draft2-combos.json'), json('data/tianxia.json'), json('data/draft2-roster.json').catch(() => null),
      IMG.load().catch(() => ({})), json('data/style.json').catch(() => ({}))])
      .then(([design, packs, factions, combos, tianxia, roster, img, style]) => {
        const by = {}, last = {}; for (const g of design.generals) { by[g.key] = g; last[g.key] = T.lastAdded(img[g.key], IMG.added()); }
        setDoc({ t: T.make({ design, packs, factions, combos, tianxia, roster }), design, tianxia, img, by, last, today: T.today(location.search), style: style.default || '',
          names: Object.fromEntries(T.ERAS.map(e => [e, Object.fromEntries(Object.keys(packs.packs[e].factions || {}).map(k => [(factions.alias || {})[k] || k, k]))])) });
      }).catch(() => setDoc({ failed: true }));
  }, []);
  return doc;
}
const isNew = (doc, name) => T.isNew(doc.last[name], doc.today, T.seen.get(name));
/* 그해의 이름 — 연도 판도는 그해 세력 이름(조조군 · 유비군), 없으면 세력 열쇠 그대로(군웅록) */
const nameOf = (doc, era, f) => { const n = doc.names[era][f]; return n && n !== f ? n : doc.by[f] ? W('tx.army', { f }) : f; };   /* 사람 이름 그대로인 세력(군웅록의 원소 · 장수 …)은 「○○군」 */
/* 얼굴에 쓸 그림 — 고른 세계의 세계 그림(기본 화풍 먼저, 그다음 늦게 생긴 화풍), 없으면 다른 세계, 그것도 없으면 그 장수의 아무 그림 */
function faceFile(doc, name, world) {
  const m = IMG.styleMap(doc.img[name]), sts = Object.keys(m).reverse().sort((a, b) => (b === doc.style) - (a === doc.style));
  for (const w of [world, ...WORLDS.filter(x => x !== world)]) for (const s of sts) { const f = IMG.formOf(m[s], w); if (f && f.f) return f.f; }
  return T.filesOf(doc.img[name])[0] || null;
}

/* ── 지도 끌기 · 확대 ── 포인터 이벤트로 직접(한 손가락 끌기 · 두 손가락 · 휠) + 지도 아래 ＋ · − · 전체 보기 단추. 처음엔 전체 맞춤, 지도는 밖으로 못 나간다.
   두 번 누르기 확대는 뺐다 — 땅 위에선 첫 누르기가 막사로 들어가 버려 쓸 수 없었다.
   끌기가 시작되면 포인터를 무대가 잡아 그 손가락의 누르기(click)가 성 · 땅에 가지 않는다(키보드 Enter 의 누르기는 detail 이 0 이라 막지 않는다).
   확대 · 자리는 이 탭 안에서 기억한다(막사나 도감에 갔다 돌아와도 그대로) */
const ZKEY = 'samguk_tianxia_zoom';
function usePanZoom(stage, map) {
  const ctl = useRef({});
  useEffect(() => {
    const el = stage.current, m = map.current, z = { s: 1, x: 0, y: 0 }, pts = new Map();
    try { const j = JSON.parse(sessionStorage.getItem(ZKEY)); if (j && j.s >= 1 && j.s <= 4 && isFinite(j.x) && isFinite(j.y)) Object.assign(z, { s: j.s, x: j.x, y: j.y }); } catch (e) {}
    const save = () => { try { sessionStorage.setItem(ZKEY, JSON.stringify(z)); } catch (e) {} };
    let mw = 0, mh = 0, moved = false, start = null, pinch = 0;
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
    const up = e => { pts.delete(e.pointerId); };
    const click = e => { if (moved && e.detail) { e.stopPropagation(); e.preventDefault(); } moved = false; };
    const wheel = e => { e.preventDefault(); const p = at(e); zoomAt(p[0], p[1], z.s * Math.exp(-e.deltaY / 400)); };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('click', click, true); el.addEventListener('wheel', wheel, { passive: false }); addEventListener('pagehide', save);
    ctl.current = { by: k => zoomAt(el.clientWidth / 2, el.clientHeight / 2, z.s * k), fit: () => { z.s = 1; apply(); } };
    const ro = new ResizeObserver(fit); ro.observe(el); fit();
    return () => { save(); ro.disconnect(); el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      el.removeEventListener('click', click, true); el.removeEventListener('wheel', wheel); removeEventListener('pagehide', save); };
  }, []);
  return ctl;
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
  const zoom = usePanZoom(stage, map);
  /* 바탕 그림 — 받아지면 쓰고, 못 받으면 임시 바탕 */
  useEffect(() => { const url = ART + world + '-' + tone + '.webp', im = new Image(); let live = true;
    im.onload = () => { if (live) setArt(url); }; im.onerror = () => { if (live) setArt(''); }; im.src = url; return () => { live = false; }; }, [world, tone]);
  const e = doc.tianxia.eras[era], facs = useMemo(() => T.factionsOf(doc.t, era), [doc, era]), fmap = {}; for (const f of facs) fmap[f.key] = f;
  const cities = doc.tianxia.cities, sides = useMemo(() => labelSides(cities), [cities]), firstLandless = facs.findIndex(f => f.landless);
  /* 땅을 누르면 — 세력색이 보이는 곳(성에서 지도 폭의 12.5% 안 — lib/tianxia.css .tx-land 의 번짐과 같은 범위)이면 가장 가까운 성의 주인 세력으로. 지도 그림 밖(위아래 띠)은 땅이 아니다 */
  const land = ev => { const r = map.current.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * 100, y = (ev.clientY - r.top) / r.height * 100; let best = null, bd = 12.5;
    if (x < 0 || x > 100 || y < 0 || y > 100) return;
    for (const c of cities) { const f = T.ownerOf(doc.t, era, c.key), d = Math.hypot(c.x - x, (c.y - y) * 1.5); if (f && d < bd) { bd = d; best = f; } }
    if (best) onFaction(best, new DOMRect(ev.clientX - 24, ev.clientY - 24, 48, 48)); };
  return h('div', { class: 'tx-app' },
    h('header', { class: 'tx-top' },
      h('b', { class: 'tx-name' }, W('app.title')),
      h('button', { type: 'button', class: 'tx-tools', 'aria-label': W('tx.tools'), title: W('tx.tools'), onClick: onTools }, h('span', { 'aria-hidden': 'true' }, '⚙')),
      h('p', { class: 'tx-line' }, e.virtual ? W('tx.virtual', { ko: e.ko, line: e.line }) : e.line),
      e.when && h('p', { class: 'tx-when' }, e.when)),   /* 판도 설명 — 지도 밖 위 막대에(PC 에선 지도 위에 겹쳐 안 읽혔다) */
    h('div', { class: 'tx-stage', ref: stage, onClick: land },
      h('div', { class: 'tx-map', ref: map, 'data-art': art ? '1' : '0', role: 'group', 'aria-label': W('tx.map'), style: art ? { backgroundImage: 'url("' + art + '")' } : null },
        !art && h('svg', { class: 'tx-terrain', viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' },
          h('path', { class: 'sea', d: SEA }), RIVERS.map((d, i) => h('path', { key: i, class: 'river', d, 'vector-effect': 'non-scaling-stroke' }))),
        /* 세력의 땅 — 성마다 세력색 번짐. 가까운 성끼리 겹쳐 같은 세력은 이어 보인다. 지도 그림 밖으로 번지지 않게 한 겹 안에서 자른다 */
        h('div', { class: 'tx-lands', 'aria-hidden': 'true' }, cities.map(c => { const f = fmap[T.ownerOf(doc.t, era, c.key)]; return h('i', { key: c.key, class: 'tx-land', style: { left: c.x + '%', top: c.y + '%', backgroundColor: f ? f.color : 'transparent' } }); })),
        cities.map(c => { const f = fmap[T.ownerOf(doc.t, era, c.key)];
          return h('button', { key: c.key, type: 'button', class: 'tx-city', 'data-city': c.key, 'data-f': f ? f.key : '', 'data-l': sides[c.key], style: { left: c.x + '%', top: c.y + '%', '--c': f ? f.color : 'transparent' },
            'aria-label': W('tx.city', { city: c.ko, f: f ? nameOf(doc, era, f.key) : W('tx.noowner') }), onClick: ev => { if (f) { ev.stopPropagation(); onFaction(f.key, ev.currentTarget.getBoundingClientRect()); } } }, h('u'), h('s', null, c.ko)); }))),
    /* 지도 밖 한 줄 — 도움말과 확대 단추 셋(지도를 가리지 않는다) */
    h('div', { class: 'tx-under' }, h('p', { class: 'tx-hint' }, W('tx.hint')),
      h('div', { class: 'tx-zoom', role: 'group', 'aria-label': W('tx.zoom') },
        h('button', { type: 'button', 'data-zoom': 'out', 'aria-label': W('tx.zoom.out'), title: W('tx.zoom.out'), onClick: () => zoom.current.by(1 / 1.6) }, '−'),
        h('button', { type: 'button', 'data-zoom': 'in', 'aria-label': W('tx.zoom.in'), title: W('tx.zoom.in'), onClick: () => zoom.current.by(1.6) }, '＋'),
        h('button', { type: 'button', 'data-zoom': 'fit', 'aria-label': W('tx.zoom.fit'), title: W('tx.zoom.fit'), onClick: () => zoom.current.fit() },
          h('svg', { viewBox: '0 0 20 20', width: 18, height: 18, 'aria-hidden': 'true' }, h('path', { d: 'M3 8V3h5M12 3h5v5M17 12v5h-5M8 17H3v-5', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }))))),
    /* 범례 — 그해 장수가 있는 세력. 성 많은 차례, 성이 없는 세력은 끝에 「떠도는 세력」 */
    h('nav', { class: 'tx-legend', 'aria-label': W('tx.legend') }, facs.map((f, i) => { const nw = T.members(doc.t, era, f.key).some(m => isNew(doc, m.name));
      return [i === firstLandless && h('span', { key: 'll', class: 'tx-ll' }, W('tx.landless')),
        h('button', { key: f.key, type: 'button', 'data-f': f.key, 'data-new': nw ? '1' : '0', 'data-landless': f.landless ? '1' : '0', style: { '--c': f.color },
          'aria-label': W(nw ? 'tx.legend.new' : 'tx.legend.n', { f: nameOf(doc, era, f.key), n: f.count }), onClick: ev => onFaction(f.key, ev.currentTarget.getBoundingClientRect()) }, h('em', null, f.glyph), nameOf(doc, era, f.key), h('small', null, f.count))]; })),
    h('footer', { class: 'tx-bot' },
      h('div', { class: 'tx-eras', role: 'group', 'aria-label': W('tx.eras') }, T.ERAS.map(k => { const ko = doc.tianxia.eras[k].ko, sp = ko.indexOf(' ');
        return h('button', { key: k, type: 'button', 'data-era': k, 'aria-pressed': era === k, onClick: () => setEra(k) }, sp < 0 ? ko : ko.slice(0, sp), h('small', null, sp < 0 ? W('tx.era.all') : ko.slice(sp + 1))); })),
      h('div', { class: 'tx-worlds', role: 'group', 'aria-label': W('tx.worlds') }, WORLDS.map(w => h('button', { key: w, type: 'button', 'data-w': w, 'aria-pressed': world === w, onClick: () => setWorld(w) }, W('tx.world.' + w))))));
}

/* ── 도구 상자 ── 옛 타이틀의 메뉴 · 군막의 최근 그림 여덟 · 패치 기록 · 공간 고르기, 그리고 「새 그림 모두 확인」 */
function recent(doc, n) {   /* 장수가 겹치지 않게 — 장수마다 가장 늦은 한 장 */
  const seen = {};
  return Object.entries(IMG.added()).filter(([f]) => doc.by[f.split('_')[0]]).sort((a, b) => a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : (a[0] < b[0] ? -1 : 1))
    .filter(([f]) => { const k = f.split('_')[0]; return !seen[k] && (seen[k] = 1); }).slice(0, n).map(([f]) => ({ f, g: doc.by[f.split('_')[0]] }));
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

/* ── ② 진영 막사 ── 군주가 가운데, 장수들이 둘레에, 결의로 묶인 사이는 선으로. 둘레에 다 못 넣는 장수는 아래 줄로 */
const dexFac = g => g.faction === 'qun' && g.camp ? g.camp : g.faction;   /* 목록 도감의 세력 줄 — 군웅은 무리(camp) */
function Face({ doc, name, world, cls, style }) {
  const g = doc.by[name], f = faceFile(doc, name, world), nw = isNew(doc, name);
  return h('a', { class: 'tx-face' + (cls ? ' ' + cls : ''), 'data-name': name, 'data-art': f ? '1' : '0', 'data-new': nw ? '1' : '0', style,
    href: 'dex.html?faction=' + dexFac(g) + '&card=' + encodeURIComponent(name), 'aria-label': W(!f ? 'tx.noart' : nw ? 'tx.face.new' : 'tx.face', { name }) },
    h('i', null, f ? h('img', { src: IMG.thumbURL(f), alt: '', loading: 'lazy', draggable: false, onError: e => { e.target.onerror = null; e.target.src = IMG.imgURL(f); } }) : h('span', { 'data-n': (g.seal || '').length }, g.seal || name.charAt(0))),
    h('em', null, name));
}
const FACE = 58;
function CampLayer({ doc, era, faction, world, from, onBack, onTools }) {
  const el = useRef(null), [role, setRole] = useState('all'), [sel, setSel] = useState(-1);
  const [bw, setBw] = useState(() => Math.min(440, Math.min(innerWidth, 720) - 24));
  useEffect(() => { const r = () => setBw(Math.min(440, Math.min(innerWidth, 720) - 24)); addEventListener('resize', r); return () => removeEventListener('resize', r); }, []);
  /* 들어오기 — 누른 세력의 땅(성 · 범례)에서 번져 들어온다. 움직임 줄이기면 바로(lib/motion-fx.js 가 끈다) */
  useEffect(() => { if (!(from && flyFrom(from, el.current))) pop(el.current, 0.97); }, []);
  const info = T.factionsOf(doc.t, era).find(f => f.key === faction), e = doc.tianxia.eras[era], all = T.members(doc.t, era, faction);
  /* 가운데 — 그 세력의 우두머리(T.chiefOf: 자료의 lords → 세력 이름에 든 군주 → roleMap 군주 → 첫 군주 → 군주 없는 무리는 첫 장수). 역할을 걸러도 가운데는 그대로 */
  const chief = T.chiefOf(doc.t, era, faction), lord = all.find(m => m.name === chief);
  const others = (role === 'all' ? all : all.filter(m => m.role === role || m.role === 'lord')).filter(m => m !== lord).map(m => m.name), shown = [lord.name, ...others];
  /* 둘레에 몇 명 — 화면 폭에서 셈한다(얼굴 58px 이 서로 닿지 않는 수, 여섯에서 열둘). 군주와 결의로 묶인 장수가 먼저, 그 안에서는 그림 있는 장수가 먼저 둘레에 든다 */
  const R = bw / 2 - FACE / 2 - 1, cap = Math.max(6, Math.min(12, Math.floor(2 * Math.PI * R / (FACE + 16))));
  const tied = {}; for (const b of T.bondsOf(doc.t, shown)) if (b.m.includes(lord.name)) for (const n of b.m) tied[n] = 1;
  const rank = n => (tied[n] ? 0 : 2) + (T.hasArt(doc.img[n]) ? 0 : 1);
  const ring = [0, 1, 2, 3].flatMap(k => others.filter(n => rank(n) === k)).slice(0, cap), inRing = {}; for (const n of ring) inRing[n] = 1;
  const rest = others.filter(n => !inRing[n]);
  const pos = { [lord.name]: [bw / 2, bw / 2] }; ring.forEach((n, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / ring.length; pos[n] = [bw / 2 + R * Math.cos(a), bw / 2 + R * Math.sin(a)]; });
  /* 결의 선 — 둘레(와 가운데)에 든 사이만. 셋까지는 서로 다 잇고, 넷부터는 차례로 */
  const bonds = T.bondsOf(doc.t, [lord.name, ...ring]).map(b => { const ps = [];
    for (let i = 0; i < b.m.length; i++) for (let j = i + 1; j < b.m.length; j++) if (b.m.length <= 3 || j === i + 1) ps.push([pos[b.m[i]], pos[b.m[j]]]);
    return Object.assign({ ps }, b); });
  const on = bonds[sel], line = (p, cls) => h('line', { class: cls, x1: p[0][0], y1: p[0][1], x2: p[1][0], y2: p[1][1] });
  const cities = info.cities.map(k => doc.tianxia.cities.find(c => c.key === k).ko), label = nameOf(doc, era, faction), sp = e.ko.indexOf(' ');
  const count = r => all.filter(m => m.role === r).length;
  /* 「목록으로 보기」 — 이 막사 장수들이 가장 많이 든 목록 세력(군웅이면 무리)으로 */
  const tally = {}; let listFac = ''; for (const m of all) { const k = dexFac(doc.by[m.name]); tally[k] = (tally[k] || 0) + 1; if (!listFac || tally[k] > tally[listFac]) listFac = k; }
  return h('div', { class: 'tx-camp', ref: el, style: { '--fc': info.color } },
    h('header', { class: 'tx-camp-top' },
      h('button', { type: 'button', class: 'tx-back', onClick: onBack }, W('tx.back')),
      h('button', { type: 'button', class: 'tx-tools', 'aria-label': W('tx.tools'), title: W('tx.tools'), onClick: onTools }, h('span', { 'aria-hidden': 'true' }, '\u2699'))),
    h('div', { class: 'tx-camp-head' }, h('span', { class: 'tx-seal', 'aria-hidden': 'true' }, info.glyph),
      h('div', null, h('h1', null, W('tx.camp.title', { f: label, era: sp < 0 ? e.ko : e.ko.slice(0, sp) })),
        e.notes[faction] && h('p', null, e.notes[faction]),
        h('p', { class: 'tx-held' }, cities.length ? W('tx.camp.cities', { cities: cities.join(' · ') }) : W('tx.camp.nocity')))),
    h('div', { class: 'tx-ring', style: { width: bw + 'px', height: bw + 10 + 'px' } },
      h('svg', { class: 'tx-lines', width: bw, height: bw, viewBox: '0 0 ' + bw + ' ' + bw, 'data-sel': on ? '1' : '0', 'aria-hidden': 'true' },
        ring.map(n => line([pos[lord.name], pos[n]], 'tx-spoke')),
        bonds.map((b, i) => h('g', { key: b.n, class: 'tx-bond', 'data-kind': b.kind, 'data-on': i === sel ? '1' : '0', onClick: () => setSel(i === sel ? -1 : i) }, b.ps.map(p => [line(p, 'hit'), line(p)])))),
      ring.map(n => h(Face, { key: n, doc, name: n, world, style: { left: pos[n][0] + 'px', top: pos[n][1] + 'px' } })),
      h(Face, { key: lord.name, doc, name: lord.name, world, cls: 'tx-lord', style: { left: bw / 2 + 'px', top: bw / 2 + 'px' } })),
    /* 결의 — 이름을 누르거나 선을 누르면 그 결의와 사람 */
    h('div', { class: 'tx-note' },
      bonds.length > 0 && h('div', { class: 'tx-bonds', role: 'group', 'aria-label': W('tx.bonds') }, bonds.map((b, i) =>
        h('button', { key: b.n, type: 'button', 'data-kind': b.kind, 'aria-pressed': i === sel, onClick: () => setSel(i === sel ? -1 : i) }, b.n))),
      h('p', { class: 'tx-bond-note' }, on ? [h('b', { key: 'b' }, on.n), ' — ' + on.m.join(' · ') + ' · ' + W('tx.bond.kind.' + on.kind)] : W(bonds.length ? 'tx.bond.legend' : 'tx.bond.none'))),
    h('div', { class: 'tx-roles', role: 'group', 'aria-label': W('tx.roles') },
      h('button', { type: 'button', 'data-role': 'all', 'aria-pressed': role === 'all', onClick: () => { setRole('all'); setSel(-1); } }, W('tx.role.all') + ' ' + all.length),
      ['general', 'strategist', 'official'].map(r => h('button', { key: r, type: 'button', 'data-role': r, 'aria-pressed': role === r, disabled: !count(r), onClick: () => { setRole(r); setSel(-1); } }, doc.design.roles[r].ko + ' ' + count(r)))),
    rest.length > 0 && h('div', { class: 'tx-rest', role: 'group', 'aria-label': W('tx.rest'), style: { '--rows': rest.length > 24 ? 3 : rest.length > 8 ? 2 : 1 } }, rest.map(n => h(Face, { key: n, doc, name: n, world }))),
    h('a', { class: 'tx-tolist', href: 'dex.html?faction=' + listFac }, W('tx.tolist')));
}

function App() {
  const doc = useDocs();
  const [era, setEraS] = useState(() => [param('era'), pref.era].find(k => T.ERAS.includes(k)) || 'mx');
  const [world, setWorldS] = useState(() => [param('w'), pref.w].find(k => WORLDS.includes(k)) || 'samguk');
  const [f, setF] = useState(() => param('f') || ''), from = useRef(null);
  /* 도구 상자와 뒤로 가기 — 열 때 기록에 한 칸(txSheet)을 더해 두면 뒤로 가기가 그 칸을 지우며 판만 닫는다(도감의 크게 보기와 같은 방식). 닫기 · Esc · 바깥으로 닫으면 그 칸을 우리가 지운다 */
  const isSheet = () => !!(history.state && history.state.txSheet);
  const [tone, setTone] = useState(toneNow), [tools, setTools] = useState(isSheet), [, tick] = useState(0);
  const openTools = () => { if (!isSheet()) { try { history.pushState({ txSheet: 1 }, '', location.href); } catch (x) {} } setTools(true); };
  const closeTools = () => { if (isSheet()) { try { return history.back(); } catch (x) {} } setTools(false); };
  /* 도감에서 그림을 확인하고 뒤로 돌아오면(되살린 화면 포함) · 다른 탭에서 돌아오면 「새 그림」 점을 다시 셈한다 */
  useEffect(() => { const again = () => tick(n => n + 1), vis = () => { if (!document.hidden) again(); };
    addEventListener('pageshow', again); document.addEventListener('visibilitychange', vis);
    return () => { removeEventListener('pageshow', again); document.removeEventListener('visibilitychange', vis); }; }, []);
  /* 막사 층 — 주소의 f 가 그 판도에 장수가 있는 세력일 때만. 아니면 지도 */
  const camp = doc && !doc.failed && f && T.members(doc.t, era, f).length ? f : '', layer = camp ? 'camp' : 'map';
  { const d = document.documentElement.dataset; if (d.layer !== layer) d.layer = layer; if (d.world !== world) d.world = world; if (d.tone !== tone) d.tone = tone; }
  useEffect(() => { const t = () => setTone(toneNow()); addEventListener('atelier-appearance', t); return () => removeEventListener('atelier-appearance', t); }, []);
  /* 뒤로 · 앞으로 — 주소를 다시 읽는다(막사 ↔ 지도) */
  useEffect(() => { const back = () => { setTools(isSheet()); setF(param('f') || ''); if (T.ERAS.includes(param('era'))) setEraS(param('era')); if (WORLDS.includes(param('w'))) setWorldS(param('w')); };
    addEventListener('popstate', back); return () => removeEventListener('popstate', back); }, []);
  /* 고른 것은 주소와 이 브라우저에 — 주소의 다른 값은 그대로 둔다. 지도에서 판도 · 세계를 바꾸면 남아 있던 f 는 뗀다 */
  const keep = (e, w) => { try { localStorage.setItem(STORE, JSON.stringify({ era: e, w })); } catch (x) {}
    try { const u = new URL(location.href); u.searchParams.set('era', e); u.searchParams.set('w', w); u.searchParams.delete('f'); history.replaceState(history.state, '', u); } catch (x) {} setF(''); };
  const setEra = e => { setEraS(e); keep(e, world); }, setWorld = w => { document.documentElement.dataset.world = w; setWorldS(w); keep(era, w); };
  const enter = (k, rect) => { from.current = rect || null;
    try { const u = new URL(location.href); u.searchParams.set('era', era); u.searchParams.set('w', world); u.searchParams.set('f', k); history.pushState({ txCamp: 1 }, '', u); } catch (x) {}
    setF(k); scrollTo(0, 0); };
  /* 「‹ 천하 지도」 — 지도에서 들어왔으면 뒤로 가기와 같은 길, 주소로 바로 열었으면 그 자리에서 지도로 */
  const leave = () => { if (history.state && history.state.txCamp) return history.back();
    try { const u = new URL(location.href); u.searchParams.delete('f'); history.replaceState(null, '', u); } catch (x) {} setF(''); };
  if (!doc) return h('p', { class: 'tx-wait' }, W('tx.loading'));
  if (doc.failed) return h('p', { class: 'tx-wait' }, W('tx.fail'));
  return h('div', null,
    camp ? h(CampLayer, { key: era + camp, doc, era, faction: camp, world, from: from.current, onBack: leave, onTools: openTools })
      : h(MapLayer, { doc, era, world, tone, setEra, setWorld, onFaction: enter, onTools: openTools }),
    tools && h(Tools, { doc, onClose: closeTools, onSeen: () => tick(n => n + 1) }));
}
render(h(App), document.getElementById('app'));
window.AtelierFresh.watch();

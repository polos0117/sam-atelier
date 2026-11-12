/* 새 판(draft2) 화면 손잡이 — Phaser 위에 글 · 단추 · 장수 카드를 그리는 것과, 그 위에 겹치는 HTML 창(Sheet).
   좌표는 CSS 픽셀이다: 캔버스는 기기 화소(devicePixelRatio, 2까지)로 크게 그리고 카메라를 그만큼 당겨서
   글자가 휴대폰에서도 또렷하다(lib/draft2/main.js 가 크기를 맞춘다). 누를 자리는 장면의 d2hits 에도 적어 둔다 —
   브라우저 검사(tests/draft2-screen.cjs)가 그 자리를 누른다. */
(function (root) {
  'use strict';
  var Art = root.Draft2Art;
  var SANS = '"IBM Plex Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "WenQuanYi Zen Hei", sans-serif';
  var SERIF = '"Noto Serif KR", "Nanum Myeongjo", "AppleMyungjo", "WenQuanYi Zen Hei", serif';
  var C = {
    bg: 0x14110d, panel: 0x1f1a14, panel2: 0x2a231b, line: 0x40362a, gold: 0xd8b26a, gold2: 0xf0d79c, paper: 0xefe6d2, dim: 0xa89a80,
    me: 0xd8b26a, foe: 0xd0573f, foe2: 0x6fa8cf, good: 0x8fc27a, bad: 0xe0705a
  };
  function hex(n) { return '#' + ('000000' + n.toString(16)).slice(-6); }
  function mix(a, b, t) {
    var ar = a >> 16 & 255, ag = a >> 8 & 255, ab = a & 255, br = b >> 16 & 255, bg = b >> 8 & 255, bb = b & 255;
    return (Math.round(ar + (br - ar) * t) << 16) | (Math.round(ag + (bg - ag) * t) << 8) | Math.round(ab + (bb - ab) * t);
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function dpr() { return Math.min(2, Math.max(1, root.devicePixelRatio || 1)); }

  /* 카메라 — 원점을 왼쪽 위에 두고 기기 화소만큼 당긴다. 화면 크기(CSS 픽셀) */
  function cam(scene) {
    var z = root.Draft2Main ? root.Draft2Main.zoom() : 1;
    scene.cameras.main.setOrigin(0, 0).setZoom(z).setScroll(0, 0).setSize(scene.scale.width, scene.scale.height);
    return { W: scene.scale.width / z, H: scene.scale.height / z, z: z };
  }

  function text(scene, x, y, s, o) {
    o = o || {};
    var st = {
      fontFamily: o.serif ? SERIF : SANS, fontSize: (o.size || 14) + 'px',
      fontStyle: o.serif ? (o.weight || '900') : (o.bold ? 'bold' : 'normal'),
      color: hex(o.color == null ? C.paper : o.color), align: o.align || 'left', resolution: Math.max(1, (root.Draft2Main ? root.Draft2Main.zoom() : 1)) * (o.sharp || 1),
      padding: { x: 1, y: 2 }
    };
    if (o.wrap) st.wordWrap = { width: o.wrap, useAdvancedWrap: true };
    if (o.ls) st.lineSpacing = o.ls;
    var t = scene.add.text(x, y, s, st);
    if (o.origin) t.setOrigin(o.origin[0], o.origin[1]);
    if (o.alpha != null) t.setAlpha(o.alpha);
    if (o.stroke) t.setStroke(hex(o.stroke), o.strokeW || 3);
    return t;
  }
  /* 글이 폭을 넘으면 줄여 맞춘다 */
  function fit(t, w) { if (t.width > w && t.width > 0) t.setScale(w / t.width); return t; }

  function hit(scene, id, x, y, w, h, extra) {
    var r = { id: id, x: x, y: y, w: w, h: h };
    if (extra) for (var k in extra) r[k] = extra[k];
    (scene.d2hits = scene.d2hits || []).push(r);
    return r;
  }
  /* 누름 — 눌렀다 뗀 자리가 같은 것일 때만 */
  function press(obj, fn) {
    obj.setInteractive({ useHandCursor: true });
    obj.on('pointerdown', function () { obj._down = true; });
    obj.on('pointerout', function () { obj._down = false; });
    obj.on('pointerup', function (p) { if (obj._down) { obj._down = false; fn(p); } });
    return obj;
  }

  /* 단추 — o: {id, kind: 'primary'|'ghost'|'toggle', on, disabled, size, sub} */
  function button(scene, parent, x, y, w, h, label, o, fn) {
    o = o || {};
    var ct = scene.add.container(x, y), prim = o.kind === 'primary', on = !!o.on;
    var fill = prim ? C.gold : on ? mix(C.gold, C.panel, 0.55) : C.panel2;
    var bg = scene.add.rectangle(0, 0, w, h, fill, 1).setOrigin(0).setRounded(Math.min(10, h / 2));
    bg.setStrokeStyle(1, prim ? C.gold2 : on ? C.gold : C.line);
    ct.add(bg);
    var size = o.size || clamp(h * 0.36, 12, 16);
    var t = text(scene, w / 2, o.sub ? h / 2 - size * 0.42 : h / 2, label, { size: size, bold: true, color: prim ? 0x1a140c : on ? C.gold2 : C.paper, origin: [0.5, 0.5] });
    fit(t, w - 12); ct.add(t);
    if (o.sub) { var s2 = text(scene, w / 2, h / 2 + size * 0.62, o.sub, { size: size * 0.72, color: prim ? 0x3a2c14 : C.dim, origin: [0.5, 0.5] }); fit(s2, w - 10); ct.add(s2); }
    if (o.disabled) ct.setAlpha(0.38);
    else {
      press(bg, function () { if (fn) fn(); });
      bg.on('pointerover', function () { bg.setFillStyle(mix(fill, 0xffffff, 0.1), 1); });
      bg.on('pointerout', function () { bg.setFillStyle(fill, 1); });
    }
    if (parent) parent.add(ct);
    hit(scene, o.id || label, x, y, w, h, { disabled: !!o.disabled });
    return ct;
  }

  function pill(scene, ct, x, y, label, o) {
    o = o || {};
    var size = o.size || 10, t = text(scene, 0, 0, label, { size: size, bold: !!o.bold, color: o.color == null ? C.paper : o.color });
    var w = t.width + size * 0.9, h = size * 1.6;
    if (o.right) x -= w;
    var bg = scene.add.rectangle(x, y, w, h, o.fill == null ? 0x000000 : o.fill, o.fillA == null ? 0.55 : o.fillA).setOrigin(0).setRounded(h / 2);
    if (o.stroke != null) bg.setStrokeStyle(1, o.stroke);
    t.setPosition(x + size * 0.45, y + (h - t.height) / 2);
    ct.add(bg); ct.add(t);
    return { w: w, h: h };
  }

  /* 진영 색 — 진영 셈(view)의 세력 색. 군웅록이면 그 장수가 마지막에 몸담은 세력(옛 facOf) */
  function num(c) { return typeof c === 'number' ? c : parseInt(String(c).replace('#', ''), 16) || 0x7a6a55; }
  function facColor(db, f) { return num(root.Draft2Rules.facColor(db, f)); }
  function cardColor(db, key) { return facColor(db, root.Draft2Rules.facOf(db, key)); }
  /* 진영 칩 — 거친 세력을 그 색으로 「동탁·여포 · 무장」 (옛 판 카드의 이력 줄). 세력이 하나면 그 색 바탕 */
  function facPill(scene, ct, x, y, db, c, size, maxW) {
    var R = root.Draft2Rules, fs = R.facsOf(db, c.key), role = R.ROLE_KO[c.role];
    if (fs.length === 1) {
      var one = pill(scene, ct, x, y, fs[0] + ' · ' + role, { size: size, fill: facColor(db, fs[0]), fillA: 0.9, bold: true });
      return one;
    }
    var g = scene.add.container(0, 0), cx = 0, h = size * 1.6, padX = size * 0.45;
    var parts = [];
    fs.forEach(function (f, i) {
      if (i) parts.push({ t: '·', c: C.dim });
      parts.push({ t: f, c: mix(facColor(db, f), 0xffffff, 0.45) });
    });
    parts.push({ t: ' · ' + role, c: C.paper });
    var texts = parts.map(function (p) { var t = text(scene, 0, 0, p.t, { size: size, bold: true, color: p.c }); t.setX(cx); cx += t.width - 1; return t; });
    var w = cx + padX * 2, bg = scene.add.rectangle(0, 0, w, h, 0x0c0906, 0.78).setOrigin(0).setRounded(h / 2);
    bg.setStrokeStyle(1, mix(facColor(db, fs[fs.length - 1]), 0xffffff, 0.2), 0.9);
    g.add(bg);
    texts.forEach(function (t) { t.setPosition(t.x + padX, (h - t.height) / 2); g.add(t); });
    var sc = maxW && w > maxW ? maxW / w : 1;
    g.setScale(sc).setPosition(x, y);
    ct.add(g);
    return { w: w * sc, h: h * sc };
  }
  function classKo(db, k) { return (k && db.classes[k] && db.classes[k].ko) || ''; }
  function traitKo(db, k) { return (k && db.traits[k] && db.traits[k].ko) || ''; }

  /* 도장 글자 카드의 바탕 — 그림이 없을 때 */
  function sealFace(scene, ct, c, w, h, mini, fc) {
    var r = Math.round(w * 0.06), cy = h * (mini ? 0.34 : 0.29), rad = w * (mini ? 0.34 : 0.29);
    ct.add(scene.add.rectangle(0, 0, w, h, mix(fc, 0x0d0a07, 0.62), 1).setOrigin(0).setRounded(r));
    var g = scene.add.graphics();
    g.fillStyle(mix(fc, 0x000000, 0.25), 0.55); g.fillCircle(w / 2, cy, rad);
    g.lineStyle(Math.max(1.5, w * 0.018), mix(fc, 0xffffff, 0.35), 0.9); g.strokeCircle(w / 2, cy, rad);
    g.lineStyle(1, mix(fc, 0xffffff, 0.2), 0.5); g.strokeCircle(w / 2, cy, rad * 0.85);
    g.fillStyle(0x0c0906, 0.6); g.fillRoundedRect(0, h * 0.56, w, h * 0.44, { tl: 0, tr: 0, bl: r, br: r });
    ct.add(g);
    ct.add(text(scene, w / 2, cy, c.seal, { serif: true, size: Math.round(rad * (c.seal.length > 1 ? 0.7 : 1.05)), color: C.paper, origin: [0.5, 0.5] }));
  }

  /* 장수 카드 — o: {db, world, hint, near, mark, blocked, selected, best, mini, badge} */
  function card(scene, c, x, y, w, h, o) {
    o = o || {};
    var db = o.db, ct = scene.add.container(x, y), fc = cardColor(db, c.key), r = Math.round(w * 0.06), pad = Math.max(5, w * 0.055);
    var tk = Art && Art.tex(c.key, o.world);
    if (tk) {
      ct.add(scene.add.rectangle(0, 0, w, h, 0x0c0906, 1).setOrigin(0).setRounded(r));
      ct.add(scene.add.image(0, 0, tk).setOrigin(0).setDisplaySize(w, h));
    } else sealFace(scene, ct, c, w, h, o.mini, fc);
    var frame = scene.add.rectangle(0, 0, w, h).setOrigin(0).setRounded(r);
    frame.setStrokeStyle(o.selected ? 3 : 1.5, o.selected ? C.gold2 : mix(fc, 0xffffff, 0.3), 1);
    frame.isFilled = false;
    ct.add(frame);
    var small = clamp(w * 0.083, 8.5, 12), name = clamp(w * 0.12, 11, 19);
    /* 위: 진영 · 역할 / 뽑으면 +얼마 */
    if (w >= 70) facPill(scene, ct, pad, pad, db, c, small * 0.92, w - pad * 2 - (o.badge || (o.hint && !o.mark) ? small * 3.6 : 0));
    if (o.badge) pill(scene, ct, w - pad, pad, o.badge.label, { size: small, right: true, bold: true, fill: o.badge.fill, fillA: 0.95, color: o.badge.color });
    else if (o.hint && !o.mark) {
      var d = o.hint.d, best = o.best;
      pill(scene, ct, w - pad, pad, (d >= 0 ? '+' : '') + d, { size: small * 1.05, right: true, bold: true, fill: best ? C.gold : 0x000000, fillA: best ? 0.95 : 0.6, color: best ? 0x1a140c : d < 0 ? C.bad : C.gold2 });
    }
    /* 아래에서 위로: 능력치 넷 → 갈래 칩 → 이름 → 결의 한 줄 */
    var yy = h - pad;
    if (!o.mini) {
      var cellW = (w - pad * 2) / 4, labels = ['통', '무', '지', '정'], keys = root.Draft2Rules.STATS, vs = small * 1.15;
      for (var i = 0; i < 4; i++) {
        var v = c.s[keys[i]], cx = pad + cellW * i + cellW / 2;
        var col = v >= 90 ? C.gold2 : v >= 75 ? C.paper : C.dim;
        ct.add(text(scene, cx, yy, String(v), { size: vs, bold: true, color: col, origin: [0.5, 1] }));
        ct.add(text(scene, cx, yy - vs * 1.25, labels[i], { size: small * 0.82, color: C.dim, origin: [0.5, 1] }));
      }
      yy -= vs * 1.25 + small * 1.25;
      /* 갈래 — 주(채움) · 부(테두리), 군주는 기질 */
      var cy = yy - small * 1.6;
      if (c.role === 'lord') {
        var tp = c.trait ? pill(scene, ct, pad, cy, traitKo(db, c.trait), { size: small, bold: true, fill: C.gold, fillA: 0.92, color: 0x1a140c }) : { w: -4 };
        /* 팩에서 군주가 된 장수(군웅록 여포 등) — 본디 갈래를 부 칩처럼 곁에 */
        if (c.asLord && c.cls) {
          var pr = text(scene, 0, 0, classKo(db, c.cls), { size: small }), pw2 = pr.width + small * 0.9; pr.destroy();
          if (pad + tp.w + 4 + pw2 <= w - pad) pill(scene, ct, pad + tp.w + 4, cy, classKo(db, c.cls), { size: small, fill: 0x000000, fillA: 0.45, stroke: mix(fc, 0xffffff, 0.45) });
        }
      } else {
        var m = pill(scene, ct, pad, cy, classKo(db, c.cls), { size: small, bold: true, fill: mix(fc, 0xffffff, 0.15), fillA: 0.95 });
        if (c.sub) {
          var probe = text(scene, 0, 0, classKo(db, c.sub), { size: small }), sw = probe.width + small * 0.9; probe.destroy();
          if (pad + m.w + 4 + sw <= w - pad) pill(scene, ct, pad + m.w + 4, cy, classKo(db, c.sub), { size: small, fill: 0x000000, fillA: 0.45, stroke: mix(fc, 0xffffff, 0.45) });
        }
      }
      yy = cy - 3;
    }
    var nt = text(scene, pad, yy, c.key, { size: name, bold: true, color: C.paper, origin: [0, 1], stroke: 0x0c0906, strokeW: 3 });
    fit(nt, w - pad * 2); ct.add(nt);
    if (o.mini) {
      ct.add(text(scene, pad, yy - nt.displayHeight, root.Draft2Rules.CAT_KO[c.cat] + ' · ' + c.pw, { size: small * 0.9, color: C.dim, origin: [0, 1] }));
    }
    /* 결의 한 줄 — 새로 맺는 것(금) · 불화(붉음) · 다가서는 것(흐린 금) */
    if (!o.mini && (o.hint || o.near)) {
      var line = null, col2 = C.gold2;
      var names = (o.hint && o.hint.names) || [];
      var feud = names.filter(function (n) { return n.kind === 'feud' || n.kind === 'betray'; })[0], kn = names.filter(function (n) { return n.kind === 'combo' || n.kind === 'kin'; })[0];
      var lg = names.filter(function (n) { return n.kind === 'league' || n.kind === 'bond'; })[0];
      if (kn) line = '결의 ' + kn.label + ' ' + (kn.v > 0 ? '+' : '') + kn.v;
      else if (feud) { line = feud.label.replace(/^(불화|배신) · /, '$1 ') + ' ' + feud.v; col2 = C.bad; }
      else if (lg) line = lg.label.split(' · ')[0] + ' +' + lg.v;
      else if (o.near && o.near.length) { line = o.near[0].n + ' ' + o.near[0].w + '/' + o.near[0].next; col2 = mix(C.gold, C.dim, 0.4); }
      if (line) { var lt = text(scene, pad, yy - nt.displayHeight - 1, line, { size: small * 0.92, bold: true, color: col2, origin: [0, 1], stroke: 0x0c0906, strokeW: 3 }); fit(lt, w - pad * 2); ct.add(lt); }
    }
    if (o.mark) {
      /* o.mark = {label, color} — 어느 자리가 지명했나 */
      var mc = o.mark.color;
      ct.add(scene.add.rectangle(0, 0, w, h, 0x0c0906, 0.55).setOrigin(0).setRounded(r));
      var lb = text(scene, w / 2, h * 0.42, o.mark.label, { size: clamp(w * 0.12, 11, 18), bold: true, color: mc, origin: [0.5, 0.5], stroke: 0x0c0906, strokeW: 4 });
      ct.add(lb);
      var mf = scene.add.rectangle(0, 0, w, h).setOrigin(0).setRounded(r); mf.isFilled = false; mf.setStrokeStyle(2.5, mc, 1); ct.add(mf);
    } else if (o.blocked) {
      ct.setAlpha(0.42);
      ct.add(text(scene, w / 2, h * 0.42, '정원 참', { size: clamp(w * 0.11, 10, 16), bold: true, color: C.paper, origin: [0.5, 0.5], stroke: 0x0c0906, strokeW: 4 }));
    }
    ct.d2w = w; ct.d2h = h;
    return ct;
  }

  /* 판 바탕 — 옻칠 바탕에 옅은 큰 글자 하나와 금선 */
  function backdrop(scene, W, H, glyph) {
    scene.add.rectangle(0, 0, W, H, C.bg, 1).setOrigin(0);
    var g = scene.add.graphics();
    g.fillStyle(0x2a1d12, 0.55); g.fillCircle(W * 0.85, H * 0.08, Math.max(W, H) * 0.45);
    g.fillStyle(0x0b1418, 0.5); g.fillCircle(W * 0.05, H * 0.95, Math.max(W, H) * 0.4);
    if (glyph) {
      var t = text(scene, W * 0.5, H * 0.5, glyph, { serif: true, size: Math.min(W, H) * 0.9, color: C.gold, origin: [0.5, 0.5] });
      t.setAlpha(0.035);
    }
    g.lineStyle(1, C.gold, 0.18); g.strokeRect(8, 8, W - 16, H - 16);
    return g;
  }

  /* ── HTML 창 ───────────────────────────── */
  var sheetEl = null, lastFocus = null, onCloseFn = null;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function sheetOpen(title, html, onClose) {
    sheetClose(true);
    lastFocus = document.activeElement; onCloseFn = onClose || null;
    var v = document.createElement('div');
    v.className = 'd2-veil';
    v.innerHTML = '<section class="d2-sheet" role="dialog" aria-modal="true" aria-labelledby="d2-sheet-title">' +
      '<header><h2 id="d2-sheet-title">' + esc(title) + '</h2><button type="button" class="d2-x" aria-label="닫기">×</button></header>' +
      '<div class="d2-body">' + html + '</div></section>';
    v.addEventListener('click', function (e) { if (e.target === v) sheetClose(); });
    v.querySelector('.d2-x').addEventListener('click', function () { sheetClose(); });
    document.body.appendChild(v);
    sheetEl = v;
    requestAnimationFrame(function () { v.classList.add('on'); var x = v.querySelector('.d2-x'); if (x) x.focus(); });
    return v;
  }
  function sheetClose(silent) {
    if (!sheetEl) return;
    var v = sheetEl, fn = onCloseFn; sheetEl = null; onCloseFn = null;
    v.remove();
    try { if (lastFocus && lastFocus.focus) lastFocus.focus(); } catch (e) {}
    if (!silent && fn) fn();
  }
  document.addEventListener('keydown', function (e) {
    if (!sheetEl) return;
    if (e.key === 'Escape') { e.preventDefault(); sheetClose(); return; }
    if (e.key === 'Tab') {
      var f = sheetEl.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  root.Draft2UI = {
    C: C, SANS: SANS, SERIF: SERIF, hex: hex, mix: mix, clamp: clamp, dpr: dpr, cam: cam,
    text: text, fit: fit, hit: hit, press: press, button: button, pill: pill, card: card, backdrop: backdrop,
    facColor: facColor, cardColor: cardColor, facPill: facPill, classKo: classKo, traitKo: traitKo, esc: esc,
    sheet: { open: sheetOpen, close: sheetClose, isOpen: function () { return !!sheetEl; } }
  };
})(window);

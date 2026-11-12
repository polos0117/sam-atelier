/* 새 판(draft2) 장수 그림 — 고른 세계의 세계 그림(data/img.json 의 byStyle → byForm[세계].f).
   화풍이 여럿이면 도감(dex.html)과 같은 차례로 고른다: 기본 화풍(data/style.json default) 먼저, 그다음 style.json 의 차례,
   그 밖의 화풍은 맨 뒤. 도감은 고른 화풍 하나만 보여 주지만 카드는 한 장이 있어야 하니 그 차례에서 처음 나오는 것을 쓴다.
   주소는 lib/img.js(AtelierImg) 의 썸네일 → 원본 차례(그림 저장소 Pages). 받지 못하면 도장 글자 카드로 떨어진다.
   앞쪽(fileFor · styleOrder · hasArt)은 순수 함수라 node 검사도 부른다. 뒤쪽(load)은 브라우저 — 그림을 둥근 모서리 ·
   아래 그늘을 구운 캔버스로 만들어 Phaser 텍스처('art:<세계>:<장수>')로 올린다(장면이 바뀌어도 남는다). */
(function (root, factory) {
  var A = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = A;
  if (root) root.Draft2Art = A;
})(typeof window !== 'undefined' ? window : null, function (root) {
  'use strict';
  var WORLDS = ['samguk', 'fantasy', 'mecha'];

  function styleOrder(styleDoc) {
    var def = styleDoc && styleDoc.default, out = def ? [def] : [], k;
    for (k in (styleDoc && styleDoc.styles) || {}) if (out.indexOf(k) < 0) out.push(k);
    return out;
  }
  /* 장수 · 세계의 세계 그림 파일 이름(없으면 null) */
  function fileFor(imgMap, order, key, world) {
    var e = imgMap && imgMap[key], bs = (e && e.byStyle) || {}, seen = {}, i, k, f;
    var ks = order.concat(Object.keys(bs));
    for (i = 0; i < ks.length; i++) {
      k = ks[i]; if (seen[k] || !bs[k]) continue; seen[k] = 1;
      f = bs[k].byForm && bs[k].byForm[world];
      if (f && f.f) return f.f;
    }
    return null;
  }
  function hasArt(imgMap, order, key, world) { return !!fileFor(imgMap, order, key, world); }

  /* ── 브라우저: 그림 받기 ─────────────────── */
  var W = 300, H = 450, R = 16, MAX = 6, TIMEOUT = 12000;
  var status = {}, queue = [], active = 0, game = null, doc = null, order = [];
  function texKey(world, key) { return 'art:' + world + ':' + key; }
  function setup(g, imgDoc, styleDoc) {
    game = g; doc = imgDoc || { img: {} }; order = styleOrder(styleDoc);
    if (root && root.AtelierImg) { root.AtelierImg.setShards(doc); }
  }
  function file(key, world) { return fileFor(doc && doc.img, order, key, world); }
  function bake(img) {
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d'), iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    var s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
    x.save();
    x.beginPath();
    if (x.roundRect) x.roundRect(0, 0, W, H, R); else x.rect(0, 0, W, H);
    x.clip();
    x.drawImage(img, (W - dw) / 2, 0, dw, dh);   // 위를 맞춘다 — 얼굴이 위에 있다
    var g = x.createLinearGradient(0, H * 0.48, 0, H);
    g.addColorStop(0, 'rgba(12,9,6,0)'); g.addColorStop(0.45, 'rgba(12,9,6,0.72)'); g.addColorStop(1, 'rgba(12,9,6,0.95)');
    x.fillStyle = g; x.fillRect(0, H * 0.48, W, H * 0.52);
    x.restore();
    return c;
  }
  function pump() {
    while (active < MAX && queue.length) {
      (function (job) {
        active++;
        var img = new Image(), done = false, tries = [root.AtelierImg.thumbURL(job.f), root.AtelierImg.imgURL(job.f)], timer;
        function end(ok) {
          if (done) return; done = true; clearTimeout(timer); img.onload = img.onerror = null; active--;
          if (ok) {
            try {
              if (game && !game.textures.exists(job.t)) game.textures.addCanvas(job.t, bake(img));
              status[job.t] = 'ok';
            } catch (e) { status[job.t] = 'fail'; }
          } else status[job.t] = 'fail';
          if (game) game.events.emit('d2-art', job.t, status[job.t]);
          pump();
        }
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.onload = function () { end(true); };
        img.onerror = function () { if (tries.length) img.src = tries.shift(); else end(false); };
        timer = setTimeout(function () { end(false); }, TIMEOUT);
        img.src = tries.shift();
      })(queue.shift());
    }
  }
  /* 받기를 줄 세운다. 이미 있거나 받는 중이면 그대로. 앞에 세우려면 first */
  function want(keys, world, first) {
    if (!game || !root || !root.AtelierImg) return;
    var jobs = [];
    keys.forEach(function (k) {
      var t = texKey(world, k), f = file(k, world);
      if (!f || status[t]) return;
      status[t] = 'loading'; jobs.push({ t: t, f: f });
    });
    queue = first ? jobs.concat(queue) : queue.concat(jobs);
    pump();
  }
  /* 지금 쓸 수 있는 텍스처 열쇠(없으면 null — 도장 카드) */
  function tex(key, world) { var t = texKey(world, key); return status[t] === 'ok' && game && game.textures.exists(t) ? t : null; }
  function state(key, world) { return status[texKey(world, key)] || (file(key, world) ? 'idle' : 'none'); }
  function counts() {
    var o = { ok: 0, fail: 0, loading: 0 };
    for (var k in status) o[status[k]] = (o[status[k]] || 0) + 1;
    return o;
  }

  return { WORLDS: WORLDS, styleOrder: styleOrder, fileFor: fileFor, hasArt: hasArt,
    setup: setup, file: file, want: want, tex: tex, state: state, texKey: texKey, counts: counts };
});

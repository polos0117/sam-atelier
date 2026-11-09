/* API 생성 탭(api.html) — API 프롬프트 탭(promptapi.html)이 보낸 일(localStorage samguk_api_job)을 OpenAI 그림 API 로 그린다(2026-11-09 사용자 「탭 하나 더 해서 내가 API 쓸 수 있게도 해줄 수 있나?」).
   세계 그림 · 우리 설계 → images/generations, 일상컷 → images/edits(참고 그림 = 그 세계 그림), GPT 자유 설계 · 옷 자유 컷 → Responses(대화 모델 + image_generation 도구, 그림 모델은 고른 것).
   키는 이 브라우저에만 — 「이 기기에 저장」 을 켜면 localStorage, 아니면 이 탭(sessionStorage). api.openai.com 말고는 어디에도 보내지 않는다.
   뽑은 세계 그림은 IndexedDB(samguk_api_refs)에 파일 이름으로 둔다 — 그 세계 일상컷의 참고 그림으로 다시 쓴다. 그림 · 기록은 내려받아 그림 저장소에 올린다(IMAGE_RULES.md).
   지시문은 고치지 않는다(생성기가 고른 값으로만 — IMAGE_RULES 1절). 말은 전부 lib/words.js. */
(function () {
  'use strict';
  var W = window.W, $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var JOB = 'samguk_api_job', KEY = 'samguk_openai_key', OPT = 'samguk_api_opt', IMG = window.AtelierImg;
  var MODELS = ['gpt-image-2.5-sunburst', 'gpt-image-2', 'gpt-image-2.6-sunburst'], CHATS = ['gpt-5', 'gpt-5-mini'], QUALS = ['medium', 'low', 'high'], SIZE = '1024x1536';
  var job = null, ref = null, results = [], busy = false, tree = null;

  function store(kind) { try { return kind === 'local' ? window.localStorage : window.sessionStorage; } catch (e) { return null; } }
  function get(kind, k) { try { var s = store(kind); return s ? s.getItem(k) : null; } catch (e) { return null; } }
  function set(kind, k, v) { try { var s = store(kind); if (s) { if (v == null) s.removeItem(k); else s.setItem(k, v); } } catch (e) { /* 막힌 브라우저 — 이 화면에서만 */ } }
  function key() { return ($('key').value || '').trim(); }
  function opts() { try { return JSON.parse(get('local', OPT) || '{}') || {}; } catch (e) { return {}; } }

  /* ── 참고 그림 보관(IndexedDB) ── */
  function db() {
    return new Promise(function (ok, no) {
      try { var r = indexedDB.open('samguk_api_refs', 1); r.onupgradeneeded = function () { r.result.createObjectStore('refs'); }; r.onsuccess = function () { ok(r.result); }; r.onerror = function () { no(r.error); }; } catch (e) { no(e); }
    });
  }
  function putRef(name, blob) { return db().then(function (d) { return new Promise(function (ok) { var tx = d.transaction('refs', 'readwrite'); tx.objectStore('refs').put(blob, name); tx.oncomplete = function () { ok(true); }; tx.onerror = function () { ok(false); }; }); }).catch(function () { return false; }); }
  function getRef(name) { return db().then(function (d) { return new Promise(function (ok) { var q = d.transaction('refs').objectStore('refs').get(name); q.onsuccess = function () { ok(q.result || null); }; q.onerror = function () { ok(null); }; }); }).catch(function () { return null; }); }

  function b64blob(b64, type) { var bin = atob(b64), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new Blob([a], { type: type || 'image/png' }); }
  function blobB64(blob) { return new Promise(function (ok) { var r = new FileReader(); r.onload = function () { ok(String(r.result)); }; r.readAsDataURL(blob); }); }
  function sha256(blob) { return blob.arrayBuffer().then(function (buf) { return crypto.subtle.digest('SHA-256', buf); }).then(function (h) { return Array.prototype.map.call(new Uint8Array(h), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }).catch(function () { return ''; }); }
  function words(s) { return (String(s).match(/\S+/g) || []).length; }
  /* 기록 파일 이름 — 그림 저장소 records/<장수>/ 의 꼴(<세계>.<화풍>-ui.json · <세계>-casualN.<화풍>-ui.json, IMAGE_RULES 3절) */
  function recName(rec) { return rec.slot && /^casual/.test(rec.slot) ? rec.world + '-' + rec.slot + '.' + rec.style + '-ui.json' : rec.world + '.' + rec.style + '-ui.json'; }
  function pngName(f) { return String(f || 'image').replace(/\.webp$/, '.png'); }

  /* 우리 옷 목록 — 옷 자유 컷이 「없는 옷」 을 짓게(tools/prompt-pack.cjs outfit-catalog.md 와 같은 꼴) */
  function catalog() {
    var t = tree || {};
    return '# Our outfit catalog — every outfit type we already use for casual cuts\n\nFor a free-outfit cut, design an outfit that is NOT on this list.\n\n' +
      (t.outfits || []).map(function (f) { return '## ' + f.key + ' — ' + f.en + '\n' + (f.items || []).map(function (i) { return '- ' + i.en; }).join('\n'); }).join('\n\n') + '\n';
  }

  /* ── 참고 그림 찾기 — 방금 뽑아 둔 것(IndexedDB) → 등록된 그림 → 직접 고르기 ── */
  function findRef() {
    ref = null; if (!job || job.kind !== 'casual') return Promise.resolve();
    return getRef(job.ref).then(function (b) {
      if (b) { ref = { blob: b, from: 'saved', name: job.ref }; return; }
      if (!job.refFile) return;
      return fetch(IMG.imgURL(job.refFile)).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); }).then(function (b2) { ref = { blob: b2, from: 'registered', name: job.refFile }; }).catch(function () { /* 못 받으면 직접 고른다 */ });
    });
  }

  /* ── 부르기 ── */
  function call(url, body, json) {
    return fetch(url, { method: 'POST', headers: json ? { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key() } : { Authorization: 'Bearer ' + key() }, body: json ? JSON.stringify(body) : body })
      .then(function (r) { return r.text().then(function (t) { var j = null; try { j = JSON.parse(t); } catch (e) { /* 글 그대로 */ } if (!r.ok) { var m = j && j.error && j.error.message || t.slice(0, 300); var e2 = new Error(m); e2.status = r.status; throw e2; } return j; }); });
  }
  function runImage(model, quality) {
    if (job.kind === 'casual') {
      var fd = new FormData();
      fd.append('model', model); fd.append('prompt', job.prompt); fd.append('size', SIZE); fd.append('quality', quality); fd.append('n', '1');
      fd.append('image[]', ref.blob, (ref.name || 'ref').replace(/\.webp$/, '') + (ref.blob.type === 'image/webp' ? '.webp' : '.png'));
      return call('https://api.openai.com/v1/images/edits', fd, false).then(function (j) { return { b64: j.data[0].b64_json, usage: j.usage, endpoint: 'images/edits' }; });
    }
    return call('https://api.openai.com/v1/images/generations', { model: model, prompt: job.prompt, n: 1, size: SIZE, quality: quality, output_format: 'png' }, true)
      .then(function (j) { return { b64: j.data[0].b64_json, usage: j.usage, endpoint: 'images/generations' }; });
  }
  function runGpt(model, quality, chat) {
    var content = [{ type: 'input_text', text: job.prompt }];
    var go = function () {
      var body = { model: chat, input: [{ role: 'user', content: content }], tools: [{ type: 'image_generation', model: model, size: SIZE, quality: quality, output_format: 'png' }], tool_choice: { type: 'image_generation' } };
      return call('https://api.openai.com/v1/responses', body, true).then(function (j) {
        var c = (j.output || []).filter(function (o) { return o.type === 'image_generation_call'; })[0];
        if (!c || !c.result) throw new Error(W('api.err.noimage'));
        return { b64: c.result, usage: j.usage, endpoint: 'responses', chat: j.model, revised: c.revised_prompt || '', id: j.id };
      });
    };
    if (job.ofree) content.push({ type: 'input_text', text: catalog() });
    if (job.kind === 'casual') return blobB64(ref.blob).then(function (d) { content.push({ type: 'input_image', image_url: d }); return go(); });
    return go();
  }
  function run() {
    if (busy || !job) return;
    if (!key()) { say(W('api.err.key'), true); $('key').focus(); return; }
    if (job.kind === 'casual' && !ref) { say(W('api.err.ref'), true); return; }
    var model = $('model').value, quality = $('quality').value, chat = $('chat') ? $('chat').value : CHATS[0], t0 = Date.now();
    set('local', OPT, JSON.stringify({ model: model, quality: quality, chat: chat }));
    busy = true; render();
    var tick = setInterval(function () { say(W('api.running', { s: Math.round((Date.now() - t0) / 1000) })); }, 1000);
    (job.mode === 'gpt' ? runGpt(model, quality, chat) : runImage(model, quality)).then(function (r) {
      var blob = b64blob(r.b64, 'image/png');
      return sha256(blob).then(function (h) {
        var gen = { model: model, endpoint: r.endpoint, size: SIZE, quality: quality, usage: r.usage || null, seconds: Math.round((Date.now() - t0) / 100) / 10, png_sha256: h, date: new Date().toISOString().slice(0, 10), via: 'api.html' };
        if (r.chat) { gen.chat_model = r.chat; gen.revised_prompt = r.revised; gen.response_id = r.id; }
        if (job.design) gen.design = job.design;
        if (job.kind === 'casual') gen.ref = ref.name;
        var rec = Object.assign({}, job.record || {}, { generation: gen });
        if (job.design === 'gpt_free') { rec.prompt = job.prompt; rec.generation.free_prompt = r.revised || ''; }   /* GPT 자유 설계 — 기록의 지시문은 설계 주문, GPT 가 실제로 쓴 글은 free_prompt(IMAGE_RULES 1절) */
        results.unshift({ url: URL.createObjectURL(blob), blob: blob, file: job.file, rec: rec, gen: gen });
        if (job.kind === 'world') putRef(job.file, blob);   /* 그 세계 일상컷의 참고 그림으로 */
        say(W('api.done', { s: gen.seconds, n: (r.usage && (r.usage.output_tokens || (r.usage.output_tokens_details || {}).image_tokens)) || '?' }));
      });
    }).catch(function (e) {
      say(/safety|rejected/i.test(e.message) ? W('api.err.safety', { msg: e.message }) : W('api.err.call', { msg: e.message }), true);
    }).then(function () { clearInterval(tick); busy = false; render(); });
  }
  function say(t, bad) { var s = $('status'); s.textContent = t || ''; s.classList.toggle('bad', !!bad); }
  function download(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }

  /* ── 그리기 ── */
  function sel(id, list, cur) { return '<select id="' + id + '">' + list.map(function (v) { return '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(v) + '</option>'; }).join('') + '</select>'; }
  function render() {
    var o = opts(), box = $('job');
    if (!job) { box.innerHTML = '<p class="note">' + esc(W('api.nojob')) + ' <a href="promptapi.html">' + esc(W('nav.promptapi')) + '</a></p>'; $('run').disabled = true; $('results').innerHTML = ''; return; }
    var kind = W('api.kind.' + job.kind) + ' · ' + W(job.mode === 'gpt' ? (job.kind === 'casual' ? 'api.mode.ofree' : 'api.mode.free') : 'api.mode.ours');
    var model = o.model && MODELS.indexOf(o.model) >= 0 ? o.model : (job.model || MODELS[0]);
    var refHtml = job.kind !== 'casual' ? '' : '<div class="api-ref"><b>' + esc(W('api.ref')) + '</b> ' + (ref ? '<img src="' + esc(URL.createObjectURL(ref.blob)) + '" alt=""><small>' + esc(W('api.ref.' + ref.from, { name: ref.name })) + '</small>' : '<small class="bad">' + esc(W('api.ref.none', { name: job.ref })) + '</small>') +
      '<label class="btn">' + esc(W('api.ref.pick')) + '<input type="file" id="ref-file" accept="image/png,image/webp,image/jpeg" hidden></label></div>';
    box.innerHTML = '<h3>' + esc(job.card + ' · ' + W('world.' + job.world)) + ' <small>' + esc(kind) + '</small></h3>' +
      '<p class="file"><span>' + esc(W('studio.file')) + '</span>' + esc(job.file) + '</p>' + refHtml +
      '<details' + (results.length ? '' : ' open') + '><summary>' + esc(W('studio.prompt')) + ' <small>' + esc(W('studio.words', { n: words(job.prompt) })) + '</small></summary><textarea readonly rows="10">' + esc(job.prompt) + '</textarea>' + (job.ofree ? '<p class="note">' + esc(W('api.ofree.catalog')) + '</p>' : '') + '</details>' +
      '<div class="api-opts"><label class="axis">' + esc(W('api.model')) + sel('model', MODELS, model) + '</label><label class="axis">' + esc(W('api.quality')) + sel('quality', QUALS, o.quality || 'medium') + '</label>' +
      (job.mode === 'gpt' ? '<label class="axis">' + esc(W('api.chat')) + sel('chat', CHATS, o.chat || CHATS[0]) + '</label>' : '') + '</div>';
    $('run').disabled = busy; $('run').textContent = W(busy ? 'api.run.busy' : 'api.run');
    $('results').innerHTML = results.map(function (r, i) {
      var u = r.gen.usage || {}, tok = u.output_tokens || (u.output_tokens_details || {}).image_tokens || '';
      return '<figure class="api-res"><img src="' + esc(r.url) + '" alt=""><figcaption><b>' + esc(pngName(r.file)) + '</b><small>' + esc(W('api.res.meta', { model: r.gen.model, s: r.gen.seconds, n: tok })) + '</small>' +
        '<span class="rand"><button type="button" class="btn pri" data-png="' + i + '">' + esc(W('api.png')) + '</button><button type="button" class="btn" data-rec="' + i + '">' + esc(W('api.rec')) + '</button></span></figcaption></figure>';
    }).join('');
  }

  function boot() {
    var k = get('local', KEY) || get('session', KEY) || '';
    $('key').value = k; $('remember').checked = !!get('local', KEY);
    try { job = JSON.parse(get('local', JOB) || 'null'); } catch (e) { job = null; }
    fetch('data/casual-tree.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (t) { tree = t; }).catch(function () { /* 옷 목록 없이 — 옷 자유 컷만 쓴다 */ });
    findRef().then(render);
    render();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.id === 'run') { run(); return; }
    if (b.id === 'forget') { set('local', KEY, null); set('session', KEY, null); $('key').value = ''; $('remember').checked = false; say(W('api.key.forgot')); return; }
    if (b.dataset.png != null) { var r = results[+b.dataset.png]; if (r) download(r.blob, pngName(r.file)); return; }
    if (b.dataset.rec != null) { var r2 = results[+b.dataset.rec]; if (r2) download(new Blob([JSON.stringify(r2.rec, null, 1)], { type: 'application/json' }), recName(r2.rec)); return; }
  });
  document.addEventListener('change', function (e) {
    var x = e.target;
    if (x.id === 'remember' || x.id === 'key') { var v = key(); set('session', KEY, v || null); set('local', KEY, $('remember').checked && v ? v : null); return; }
    if (x.id === 'ref-file' && x.files && x.files[0]) { ref = { blob: x.files[0], from: 'picked', name: x.files[0].name }; render(); return; }
  });
  window.AtelierApiRun = { state: function () { return { job: job, ref: !!ref, results: results.length, busy: busy }; } };
  boot();
})();

/* 화면 검사 — 도감 · 생성기를 브라우저로 연다(첫 화면 천하 지도 · 진영 막사 · 옛 주소는 tests/tianxia-screen.cjs — 2026-11-17 옛 타이틀 · 군막 몫을 뺐다). 폰(390)과 PC(1280). 게임(draft.html)은 손대지 않아 검사하지 않는다(회귀 검사는 2026-11-12 지웠다) — 여기선 안 연다.
   도감: 세력 넷 · 고른 세력의 장수 수 = 설계표 · 장수마다 세계 셋(빈 칸은 생성기로) · 역할로 바로 가기 · 이름 찾기 · 그림 있는 것만 · 주소 ?faction=&q= · 설계 상태(확정 · 시안 · 다시 설계) · 설계 요약 · 상태 거르기(?st=).
   생성기: 세력 › 장수 › 갈래 › 단계. 세계 그림은 세계 → … → 다 골랐다 — 지시문이 조립기(lib/prompt-sam.js)와 같고 파일 이름이 <장수>_<세계>_<화풍>_f.webp.
   일상컷은 트리 버전2 — 처음부터 랜덤으로 다 골랐다까지, 시대 넷 · 역사의 자리 장소. 주소 ?card=&o=&world=. 콘솔 오류 없음 · 옆으로 넘치지 않음.
   Run: ESM_DIR=<preact 가 든 node_modules> CHROMIUM_PATH=<chrome> node tests/screen.cjs   (PORT 로 자리 바꾸기, 기본 8796) */
const assert = require('node:assert/strict'), http = require('node:http'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), PORT = +(process.env.PORT || 8796), BASE = 'http://127.0.0.1:' + PORT;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.md': 'text/markdown', '.webp': 'image/webp', '.png': 'image/png' };
const server = http.createServer((q, s) => {
  const p = decodeURIComponent(new URL(q.url, BASE).pathname), file = path.join(ROOT, p === '/' ? 'index.html' : p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(s);
});
const ESM = { 'https://esm.sh/preact@10.24.3': 'preact/dist/preact.mjs', 'https://esm.sh/preact@10.24.3/hooks': 'preact/hooks/dist/hooks.mjs' };
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/sam-design.json'), 'utf8'));
const S = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/style.json'), 'utf8'));
/* 조립기를 노드에서도 — 화면의 지시문과 글자 그대로 같아야 한다 */
const ctx0 = { window: {}, console }; vm.createContext(ctx0);
for (const f of ['lib/words.js', 'lib/prompt-spec.js', 'lib/look-spec.js', 'lib/prompt-sam.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx0);
const P = ctx0.window.AtelierPrompt;
/* ONLY=dex(또는 battle · styles · prompt, 쉼표로 여럿) — 바꾼 화면 몫만 돌린다. 없으면 전부 */
const part = k => !process.env.ONLY || process.env.ONLY.split(',').includes(k);
const IMGDOC = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/img.json'), 'utf8')), C = require('../lib/tianxia-core.js');
/* 도감 「그림 없음」(data-art=0 · 그림 없는 것만) — 고른 화풍(검사에선 기본)의 세계 그림이 하나도 없는 장수. 다른 화풍 그림 · 일상컷만 있어도 없는 것(2026-11-18, 전엔 어느 화풍이든) */
const noWorldArt = g => !['samguk', 'fantasy', 'mecha'].some(w => ((((((IMGDOC.img[g.key] || {}).byStyle || {})[S.default] || {}).byForm || {})[w]) || {}).f);
const countDex = f => D.generals.filter(g => C.dexKey(DEXSRC, g) === f).length;   /* 목록 도감의 줄 인원 — 진 탭으로 간 장수(사마의 · 나헌 …)는 빠진다 */
const DEXSRC = (J2 => ({ dex: J2('data/draft2-factions.json').dex, fix: J2('data/draft2-career-fix.json').fix, career: J2('data/draft2-packs.json').packs.mx.career }))(f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')));   /* 목록 도감의 세력 줄 열쇠(진 탭) */
/* 일상컷 한 줄 fixture — 기본 화풍에 한 세계 일상컷이 넷 넘는 장수, 앞 셋만 색인에(필수 · 코스프레 GPT · 옷 자유), 넷째는 없음 */
const CN = (() => {
  const IJ = IMGDOC.img;
  for (const g of D.generals) { const b = ((IJ[g.key] || {}).byStyle || {})[S['default']]; if (!b) continue;
    for (const w of D.vocab.worlds) { const fl = (((b.byForm || {})[w] || {}).casual || {}).f || []; if (fl.length < 4 || !(b.byForm[w] || {}).f) continue;
      const files = fl.slice(0, 4), n = f => +f.match(/_casual(\d+)\.webp$/)[1], base = f => ({ card: g.key, name: g.key, world: w, worldKo: '', n: n(f), date: '2026-11-17', style: S['default'], path: '', required: null, requiredKo: null, family: null, familyKo: null, item: null, itemKo: null, shade: null, shadeKo: null, cosplay: null, free: null });
      const outfit = 'a plum-coloured opaque linen butterfly-tuck bandeau with a deep folded centre neckline and separate short puffed shoulder bands, paired with a copper-brown skort';
      const rows = [Object.assign(base(files[0]), { required: 'swimwear', requiredKo: '노출 갈래(수영복)', family: 'swimwear', familyKo: '수영복', item: 'bikini', itemKo: '비키니', shade: 'orange', shadeKo: '코랄 · 오렌지',
          s: { pl: '수영장', act: '잔을 든다', fr: '허리 위', ex: '차분함', gz: '카메라', ln: '50mm 표준', era: '지금 현실', ar: '2:3' } }),
        Object.assign(base(files[1]), { required: 'cosplay', requiredKo: '게임 코스프레', family: 'game_cosplay', familyKo: '게임 코스프레', item: 'gc_mini_dress', itemKo: '미니 드레스', cosplay: { game: 'dragon_quest', gameKo: '드래곤 퀘스트', character: 'Jessica Albert', characterKo: null, cut: 'mini_dress', cutKo: '미니 드레스', by: 'gpt', round: 1 } }),
        Object.assign(base(files[2]), { free: { kind: 'ofree', kindKo: '옷 자유', outfit }, s: { pl: 'a rooftop garden', act: 'she waters the herbs', en: 1, ar: '2:3' } })];
      let k = 0;   /* 칸 이름(세계 · 번호)은 도감이 세계 안 차례로 붙인다 */
      const labels = fl.map(() => W0('world.' + w) + ' ' + (++k));
      return { g, w, files, outfit, label: i => labels[i], doc: { version: 1, atelier: 'sam', built: '', source: [], rows } };
    } }
  return null;
})();
function W0(k) { return ctx0.window.W(k); }


(async () => {
  await new Promise(r => server.listen(PORT, r));
  const br = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  let checks = 0;
  const open = async (url, viewport, more) => {
    const ctx = await br.newContext(Object.assign({ viewport }, more));
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => {
      const file = process.env.ESM_DIR && ESM[r.request().url().split('?')[0]];
      if (!file || !fs.existsSync(path.join(process.env.ESM_DIR, file))) return /^https:\/\/esm\.sh\//.test(r.request().url()) ? r.continue() : r.abort();   /* ESM_DIR 에 preact 가 없으면 esm.sh 에서 그대로 받는다 */
      return r.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(process.env.ESM_DIR, file), 'utf8').replace(/from"preact"/g, 'from"https://esm.sh/preact@10.24.3"') });
    });
    const page = await ctx.newPage(), errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await page.goto(BASE + url); return { ctx, page, errors };
  };
  const noOverflow = async (page, w) => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), w + ' 옆으로 넘친다');
  const state = pg => pg.evaluate(() => window.AtelierStudio.state());
  const openOf = async pg => (await state(pg)).open;
  const promptOf = pg => pg.evaluate(() => window.AtelierStudio.prompt());
  const menu = async pg => { const m = pg.locator('[data-menu="rand"]'); if (await m.count()) await m.click(); };
  const randAll = async (pg, k) => { await menu(pg); await pg.click('[data-rand-all="' + k + '"]'); };
  const toDone = async pg => {
    for (let i = 0; i < 12 && (await openOf(pg)) !== 'done'; i++) {
      if (await pg.locator('#panel [data-open="done"]').count()) { await pg.click('#panel [data-open="done"]'); continue; }
      const m = pg.locator('[data-menu="rand"]');
      if (await m.count()) { await m.click(); if (await pg.locator('#hbar .hmenu [data-open="done"]').count()) { await pg.click('#hbar .hmenu [data-open="done"]'); continue; } await m.click(); }
      const nx = pg.locator('#hbar [data-skip], #hbar [data-next], #panel [data-next]').first();
      assert(await nx.count(), '넘길 단추가 없다 — ' + (await openOf(pg)));
      await nx.click();
    }
    assert.equal(await openOf(pg), 'done', '다 골랐다에 못 갔다');
  };
  const count = f => D.generals.filter(g => g.faction === f).length;

  for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    const mob = vp.width <= 768;
    if (part('battle'))
    /* ── 전장(2026-11-02) — 일곱 전장 · 세계마다 지도와 자리 · 진영(군웅은 무리) · 역할별 이름표 → 미리 보기 → 배치하기 → 자리 · 크게 보기 ── */
    {
      const BT = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/battles.json'), 'utf8'));
      let bv = await open('/battle.html?b=changban&w=samguk', vp), bp = bv.page;
      await bp.evaluate(() => { try { localStorage.removeItem('samguk_battle_v1'); } catch (e) {} });
      await bp.reload(); await bp.waitForSelector('.b-slot');
      assert.equal(await bp.locator('.b-battles button').count(), BT.battles.length, '전장 일곱');
      const cb = BT.battles.find(b => b.key === 'changban');
      assert.equal(await bp.locator('.b-slot').count(), cb.worlds.samguk.slots.length, '자리 — 그 세계 지도의 것');
      assert.match(await bp.locator('.b-map').getAttribute('src'), /battle-changban-samguk\.webp/);
      await bp.click('.b-sides [data-side="shu"]');
      assert.equal(await bp.locator('.b-name').count(), D.generals.filter(g => g.faction === 'shu').length, '촉 이름표 — 역할별');
      await bp.click('.b-name[data-g="조운"]'); await bp.waitForSelector('.b-peek');
      await bp.click('.b-act[data-act="place"]'); await bp.click('.b-slot[data-slot="bridge"]');
      assert.match(await bp.locator('.b-slot[data-slot="bridge"]').textContent(), /조운/, '고른 자리에 선다');
      await bp.click('.b-worlds [data-w="fantasy"]');
      assert.match(await bp.locator('.b-map').getAttribute('src'), /battle-changban-fantasy\.webp/, '세계를 바꾸면 그 세계 지도');
      assert.doesNotMatch(await bp.locator('.b-slot[data-slot="bridge"]').textContent(), /조운/, '배치는 전장 × 세계마다');
      await bp.click('.b-sides [data-side="qun"]');
      assert.equal(await bp.locator('.b-camps button').count(), D.factions.find(f => f.key === 'qun').camps.length, '군웅은 무리로');
      await bp.click('.b-camps [data-camp="lubu"]');
      assert.deepEqual((await bp.locator('.b-name').allTextContents()).sort(), D.generals.filter(g => g.camp === 'lubu').map(g => g.key).sort(), '여포군만');
      { const w0 = await bp.locator('.b-field').evaluate(e => e.offsetWidth);   /* 확대 · 축소 — 지도가 커지고 자리는 따라간다, 맞춤으로 돌아온다 */
        await bp.click('[data-zoom="in"]'); assert.equal(await bp.locator('.b-zoom-n').textContent(), '150%');
        assert(Math.abs(await bp.locator('.b-field').evaluate(e => e.offsetWidth) - w0 * 1.5) < 3, '확대하면 지도가 1.5배');
        await bp.click('[data-zoom="fit"]'); assert.equal(await bp.locator('.b-field').evaluate(e => e.offsetWidth), w0, '맞춤'); }
      await bp.click('.b-worlds [data-w="samguk"]'); await bp.click('.b-slot[data-slot="bridge"]'); await bp.waitForSelector('.b-peek');
      assert.match(await bp.locator('.b-peek').textContent(), /장판교/, '선 자리를 누르면 그 장수 — 서 있는 자리');
      if (await bp.locator('.b-act[data-act="open"]').count()) { await bp.click('.b-act[data-act="open"]'); await bp.waitForSelector('.b-big'); await bp.keyboard.press('Escape'); await bp.waitForSelector('.b-peek'); }
      await bp.click('.b-act[data-act="remove"]'); assert.doesNotMatch(await bp.locator('.b-slot[data-slot="bridge"]').textContent(), /조운/, '자리에서 빼기');
      await noOverflow(bp, vp.width); assert.deepEqual(bv.errors, [], '전장 콘솔'); checks += 10; await bv.ctx.close();
    }
    /* ── 목록 도감 정리판(2026-11-17) — 첫 화면에 장수 줄 · 세력 줄(위 · 촉 · 오 + 군웅의 무리) · 도구 판(찾기 · 화풍 · 걸러 보기) ── */
    if (part('dex')) {
    let v = await open('/dex.html', vp);
    await v.page.waitForSelector('.dx-row');
    const sheet = async () => { if (!(await v.page.locator('.dx-sheet').count())) await v.page.click('.dx-tools'); await v.page.waitForSelector('.dx-sheet'); };
    const shut = async () => { if (await v.page.locator('.dx-sheet').count()) await v.page.click('.dx-sheet .dx-close'); };
    const rows = n => v.page.waitForFunction(k => document.querySelectorAll('.dx-row').length === k, n);
    /* 그림이 있는 장수(조조) — 칸은 크게 보기 단추 */
    if (await v.page.locator('.dx-row[data-name="조조"] .dx-slots button.dx-slot').count()) assert.equal(await v.page.locator('.dx-row[data-name="조조"] .dx-slots button.dx-slot').count(), 3, '조조 세계 셋 그림');
    const camps = D.factions.find(f => f.key === 'qun').camps;
    assert.deepEqual(await v.page.locator('.dx-facs [data-f]').evaluateAll(es => es.map(e => e.dataset.f)), ['wei', 'shu', 'wu', 'jin', ...camps.map(c => c.key), 'qun'], '세력 줄 — 위 · 촉 · 오 · 진(군웅록 기준) · 군웅의 무리 · 군웅 전체');
    assert.equal(await v.page.locator('.dx-row').count(), D.generals.filter(g => C.dexKey(DEXSRC, g) === D.factions[0].key).length, '첫 세력의 장수 수 — 군웅록에서 진인 장수는 진 줄로');
    assert.equal(await v.page.locator('.workspace-nav, .ek-section').count(), 0, '옛 뼈대(머리 항해 · 장식 틀 섹션)가 없다');
    const one = v.page.locator('.dx-row').first(), bare = v.page.locator('.dx-row[data-art="0"]').first();   /* 그림이 없는 장수 — 빈 칸이 생성기로 */
    assert.equal(await one.locator('.dx-slots .dx-slot').count(), 3, '세계 셋');
    assert.match(await bare.locator('.dx-slots .dx-slot').first().getAttribute('href'), /^prompt\.html\?card=.+&world=samguk$/, '빈 칸은 생성기로');
    assert.equal(await bare.locator('img').count(), 0); assert.match(await bare.textContent(), /그림 없음/, '그림 없는 장수 표시');
    await sheet(); assert.equal(await v.page.locator('.dx-sheet [data-jump]').count(), new Set(D.generals.filter(g => g.faction === D.factions[0].key).map(g => g.role)).size, '역할로 바로 가기');
    for (const hgt of await v.page.locator('.dx-facs [data-f], .dx-tools, .dx-back, .dx-sheet button, .dx-sheet select, .dx-sheet input, .dx-sheet .dx-fav').evaluateAll(es => es.map(e => e.getBoundingClientRect().height))) assert(hgt >= 44, '누르는 자리 ' + hgt);
    await shut(); checks += 8;
    /* 촉 — 관우는 확정(★) · 설계 요약(펼치면), 상태 거르기 · 찾기 · 주소 */
    await v.page.click('.dx-facs [data-f="shu"]'); await rows(countDex('shu'));
    assert.match(v.page.url(), /faction=shu/); assert.equal(await v.page.locator('.dx-facs [aria-current="page"]').getAttribute('data-f'), 'shu');
    assert.match(await v.page.locator('.dx-row[data-name="관우"]').textContent(), /확정/);
    assert.match(await v.page.locator('.dx-row[data-name="관우"] .stats').textContent(), /무97/);
    await v.page.click('.dx-row[data-name="관우"] .dx-who');
    assert.match(await v.page.locator('.dx-row[data-name="관우"] .summary').textContent(), /청룡언월도/, '설계 요약');
    { const cas = await v.page.locator('.dx-row[data-name="관우"] .dx-casuals .dx-slot').count(), more = await v.page.locator('.dx-row[data-name="유비"] .dx-who .more').textContent();   /* 일상컷 접기 — 펼치면 그 장수의 일상컷 */
      if (cas) { assert.match(more, /일상컷 \d+/); await v.page.click('.dx-row[data-name="관우"] .dx-who'); assert.equal(await v.page.locator('.dx-row[data-name="관우"] .dx-casuals').count(), 0, '다시 누르면 접힌다'); } }
    await sheet(); await v.page.selectOption('#dex-state', 'hand'); await rows(D.generals.filter(g => C.dexKey(DEXSRC, g) === 'shu' && g.designed === 'hand').length);
    assert.match(v.page.url(), /st=hand/);
    await v.page.selectOption('#dex-state', ''); await rows(countDex('shu'));
    /* 찾기 — 찾는 말이 있으면 모든 세력에서(머리의 수도 찾은 수 · 세력 줄엔 「찾는 중」), 지우면 원래 세력으로 */
    { const hit = D.generals.filter(g => /zhuge/i.test(g.en)); assert(hit.some(g => g.faction !== 'shu'), '다른 세력에도 제갈씨가 있다');
      await v.page.fill('#dex-find', 'zhuge'); await rows(hit.length); assert.match(v.page.url(), /q=zhuge/);
      assert.match(await v.page.locator('.dx-bar').textContent(), new RegExp('찾는 중.*' + hit.length + '명')); assert.equal(await v.page.locator('.dx-facs [aria-current="page"]').count(), 0); assert.equal(await v.page.locator('.dx-facs .dx-finding').count(), 1, '세력 줄의 「찾는 중」');
      await v.page.fill('#dex-find', ''); await rows(countDex('shu')); assert.equal(await v.page.locator('.dx-facs [aria-current="page"]').getAttribute('data-f'), 'shu'); assert.equal(await v.page.locator('.dx-facs .dx-finding').count(), 0);
      await v.page.fill('#dex-find', 'zhuge'); await rows(hit.length); await shut(); await v.page.click('.dx-facs .dx-finding'); await rows(countDex('shu')); assert.doesNotMatch(v.page.url(), /q=/); await sheet(); checks += 6; }
    await v.page.click('#dex-only'); assert.equal(await v.page.getAttribute('#dex-only', 'aria-pressed'), 'true', '그림 있는 것만 — 누른 단추'); assert.match(v.page.url(), /only=1/);
    await v.page.waitForFunction(() => !document.querySelector('.dx-row[data-art="0"]'));
    const withArt = await v.page.locator('.dx-row').count();
    assert(withArt <= count('shu'), '그림 있는 것만');
    if (!withArt) assert(await v.page.locator('#dex-none').count(), '없으면 알림');
    assert.equal(await v.page.locator('.dx-tools').getAttribute('data-on'), '1', '걸러 보는 중 표시');
    await v.page.click('#dex-only'); assert.equal(await v.page.getAttribute('#dex-only', 'aria-pressed'), 'false'); await rows(countDex('shu'));
    /* 그림 없는 것만 */
    await v.page.click('.dx-sheet [data-only="none"]'); await v.page.waitForFunction(() => !document.querySelector('.dx-row[data-art="1"]'));
    assert.equal(await v.page.locator('.dx-row').count(), D.generals.filter(g => C.dexKey(DEXSRC, g) === 'shu' && noWorldArt(g)).length, '그림 없는 것만(고른 화풍)'); assert.match(v.page.url(), /only=none/);
    await v.page.click('.dx-sheet [data-only="none"]'); await rows(countDex('shu'));
    /* 보기 갈래 · 세계 — 일상컷 보기는 줄마다 펼쳐 두고, 세계를 고르면 그 세계 칸만 */
    await v.page.click('.dx-sheet [data-view="all"]'); await v.page.waitForFunction(() => document.querySelectorAll('.dx-row[data-open="1"]').length === document.querySelectorAll('.dx-row').length); assert.match(v.page.url(), /view=all/);
    await v.page.click('.dx-sheet [data-view="world"]'); await v.page.click('.dx-sheet [data-wf="mecha"]'); await v.page.waitForFunction(() => document.querySelector('.dx-row').querySelectorAll('.dx-slots .dx-slot').length === 1); assert.match(v.page.url(), /w=mecha/);
    await v.page.click('.dx-sheet [data-wf="all"]');
    /* 화풍 고르개(2026-11-05) — 기본 화풍이 처음, 그림 있는 앞 화풍은 따로 */
    assert.equal(await v.page.inputValue('#dex-style'), S['default'], '처음은 기본 화풍');
    const stys = await v.page.locator('#dex-style option').evaluateAll(es => es.map(e => e.value));
    assert.equal(stys[0], S['default']);
    const prevSt = ['kv_kmmo_23d', 'kr_mmorpg'].find(k => k !== S['default'] && stys.includes(k));   /* 그림 많은 앞 기본 화풍(촉 장수 그림이 있는 것) */ if (prevSt) { await v.page.selectOption('#dex-style', prevSt); assert.match(v.page.url(), new RegExp('style=' + prevSt)); await v.page.waitForSelector('.dx-row .dx-slots button.dx-slot');
      await v.page.selectOption('#dex-style', S['default']); assert.doesNotMatch(v.page.url(), /style=/); }
    await shut();
    /* 군웅 — 무리 하나 · 군웅 전체 · 주소로 바로 */
    await v.page.click('.dx-facs [data-f="yuanshao"]'); await rows(D.generals.filter(g => g.camp === 'yuanshao').length); assert.match(v.page.url(), /faction=yuanshao/);
    await v.page.goto(BASE + '/dex.html?faction=qun'); await v.page.waitForSelector('.dx-row'); assert.equal(await v.page.locator('.dx-row').count(), count('qun'), '군웅 전체');
    await v.page.goto(BASE + '/dex.html?faction=lubu'); await v.page.waitForSelector('.dx-row'); assert.equal(await v.page.locator('.dx-row').count(), D.generals.filter(g => g.camp === 'lubu').length, '주소로 무리 열기');
    assert.equal(await v.page.locator('.dx-back').getAttribute('href'), 'index.html', '‹ 지도');
    await noOverflow(v.page, vp.width + ' 도감');
    assert.deepEqual(v.errors, [], '도감 콘솔'); checks += 22; await v.ctx.close();
    /* 일상컷 설명(2026-11-17 「상세보기나 크게보기 일 때만 보이도록」 · 2026-11-25 두 줄 + 더 보기) — fixture 색인: 크게 보기에서만 · 목록엔 없음(색인도 안 받는다) · 필수 · 둘째 줄 장소 · 하는 일 · 구도 ·
       더 보기(44px · aria-expanded · 탭 동안 기억) · 코스프레(GPT 고름) · 자유 설계(영어 Outfit · 장면, 길면 줄였다 펼침) · 옛 줄은 첫 줄만 · 색인에 없는 컷은 없음 · 색인은 한 번만 */
    if (CN) {
      let fetched = 0;
      v = await open('/dex.html?faction=' + CN.g.faction + '&view=world&q=' + encodeURIComponent(CN.g.key), vp);
      await v.ctx.route(/\/data\/casual-index\.json/, r => { fetched++; return r.fulfill({ contentType: 'application/json', body: JSON.stringify(CN.doc) }); });
      await v.page.reload(); const row = '.dx-row[data-name="' + CN.g.key + '"]'; await v.page.waitForSelector(row);
      await v.page.click(row + ' .dx-who'); await v.page.waitForSelector(row + '[data-open="1"] .dx-casuals button.dx-slot');   /* 줄을 펼쳐야 일상컷 칸이 나온다 */
      assert.equal(await v.page.locator('.cnote').count(), 0, '목록 칸엔 한 줄이 없다'); assert.equal(fetched, 0, '목록을 그릴 때 색인을 안 받는다');
      await v.page.locator(row + ' .dx-casuals button.dx-slot[title$="' + CN.label(0) + '"]').click();
      const note = v.page.locator('.lightbox .lb-cnote'), l1 = note.locator('.cnote-l1'), l2 = note.locator('.cnote-l2'), more = note.locator('.cnote-more'), list = note.locator('.cnote-list');
      await note.waitFor(); assert.equal(fetched, 1, '처음 열 때 색인 한 번');
      assert.equal((await l1.textContent()).trim(), '필수 · 노출 갈래(수영복) — 비키니 · 코랄 · 오렌지', '첫 줄 — 필수 · 옷 · 색');
      assert.equal((await l2.textContent()).trim(), '수영장 · 잔을 든다 · 허리 위', '둘째 줄 — 장소 · 하는 일 · 구도(2026-11-25)');
      /* 더 보기 — 44px 단추 · aria-expanded · 펼치면 표정 · 시선 · 렌즈 · 시대 · 화면비, 크게 보기는 그대로 */
      assert.equal(await more.getAttribute('aria-expanded'), 'false'); assert.equal(await list.isVisible(), false, '처음엔 접힘');
      { const bb = await more.boundingBox(); assert(bb.height >= 44 && bb.width >= 44, '더 보기 단추 44px ' + JSON.stringify(bb)); }
      await more.click(); assert.equal(await more.getAttribute('aria-expanded'), 'true'); assert(await list.isVisible(), '펼침');
      assert.deepEqual(await list.locator('dt').allTextContents(), ['표정', '시선', '렌즈', '시대', '화면비']); assert.equal(await list.locator('dd').first().textContent(), '차분함');
      assert(await v.page.locator('.lightbox').isVisible(), '펼쳐도 크게 보기는 그대로');
      await v.page.keyboard.press('ArrowRight'); await v.page.waitForFunction(() => /코스프레/.test((document.querySelector('.lb-cnote') || {}).textContent || ''));
      assert.equal(await l1.locator('b').textContent(), '필수 · 게임 코스프레'); assert.match(await l1.textContent(), /— 드래곤 퀘스트 · Jessica Albert · 미니 드레스GPT 고름$/, '코스프레 — 캐릭터는 영어 그대로 · GPT 고름');
      assert.equal(await note.locator('.cnote-gpt').count(), 1); assert.equal(await l2.count(), 0, '장면 풀이가 없는 옛 줄 — 첫 줄만'); assert.equal(await more.count(), 0, '더 볼 것이 없으면 단추도 없다');
      await v.page.keyboard.press('ArrowRight'); await v.page.waitForFunction(() => /옷 자유/.test((document.querySelector('.lb-cnote') || {}).textContent || ''));
      assert.equal(await l1.locator('b').textContent(), '옷 자유');
      assert.equal(await more.getAttribute('aria-expanded'), 'true', '펼침은 이 탭 동안 기억한다'); assert.equal(await l1.locator('span[lang="en"]').textContent(), CN.outfit, '펼친 채면 Outfit 도 다');
      assert.equal(await l2.locator('.cnote-tag').textContent(), 'GPT 설계'); assert.equal(await l2.locator('span[lang="en"]').textContent(), 'a rooftop garden · she waters the herbs', '자유 설계 장면은 영어 그대로');
      assert.deepEqual(await list.locator('dd').allTextContents(), ['옷 자유 — GPT 가 설계', '2:3']);
      await more.click(); assert.equal(await more.getAttribute('aria-expanded'), 'false'); assert((await l1.locator('span[lang="en"]').textContent()).endsWith('…'), '접으면 긴 Outfit 은 줄여 보인다');
      assert.equal(await v.page.evaluate(() => sessionStorage.getItem('cnote-open')), '0');
      await v.page.keyboard.press('ArrowRight'); await v.page.waitForFunction(f => (document.querySelector('.lightbox .lb-stage img') || {}).getAttribute('src').endsWith(encodeURIComponent(f)), CN.files[3]);
      assert.equal(await v.page.locator('.lb-cnote').count(), 0, '색인에 없는 컷은 아무것도 안 보인다'); assert.equal(fetched, 1, '색인은 한 번만');
      await noOverflow(v.page, vp.width + ' 일상컷 설명'); assert.deepEqual(v.errors, [], '일상컷 설명 콘솔'); checks += 16; await v.ctx.close();
    }
    }

    /* ── 화풍 비교(2026-11-07 「네비게이션바에 화풍탭을 추가해서 비교하기 쉽게」) — 항해에 화풍 탭, 화풍별 · 세계별 보기, 크게 보기 ── */
    if (part('styles')) { const W = ctx0.window.W, SC = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data/style-compare.json'), 'utf8')), R0 = SC.rounds.slice().sort((a, b) => a.key < b.key ? 1 : -1)[0], n = R0.styles.length, nk = (R0.kinds || ['world', 'casual']).length;   /* 화면은 최신 묶음을 연다 */
      const sv = await open('/styles.html', vp);
      await sv.page.waitForSelector('.sc-cell');
      assert.equal(await sv.page.locator('.workspace-nav a[aria-current="page"]').getAttribute('href'), 'styles.html', '화풍 탭');
      assert.equal(await sv.page.locator('.sc-style').count(), n, '화풍마다 한 칸');
      assert.equal(await sv.page.locator('.sc-cell').count(), n * 3 * nk, '세계 셋 × 묶음의 갈래');
      await sv.page.click('.sc-bar button:has-text("' + W('styles.view.world') + '")');
      assert.equal(await sv.page.locator('.sc-cell').count(), n * nk, '세계별 — 화풍이 한 줄로');
      if (R0.styles.some(x => x.old)) { await sv.page.click('.sc-bar button:has-text("' + W('styles.kind.old') + '")');
        assert.equal(await sv.page.locator('.sc-cell').count(), n * (nk + 1), '예전 줄 — 없는 화풍은 빈 칸'); }
      if (SC.rounds.length > 1) assert.equal(await sv.page.locator('.sc-bar select option').count(), SC.rounds.length, '묶음 고르개');
      await sv.page.locator('.sc-cell button').first().click();
      assert(await sv.page.locator('.lightbox').isVisible(), '크게 보기'); await sv.page.keyboard.press('Escape');
      assert.match(sv.page.url(), /view=world/);
      await noOverflow(sv.page, vp.width + ' 화풍 비교');
      assert.deepEqual(sv.errors, [], '화풍 비교 콘솔'); checks += 9; await sv.ctx.close(); }
    /* ── 생성기 — 세력 › 장수 › 세계 그림 ── */
    if (!part('prompt')) continue;
    let v = await open('/prompt.html', vp);
    await v.page.waitForSelector('[data-faction]');
    assert.equal(await v.page.locator('[data-faction]').count(), D.factions.length, '세력 고르기');
    await v.page.click('[data-faction="shu"]');
    assert.equal(await v.page.locator('#panel [data-card]').count(), count('shu'), '촉 장수 단추');
    await v.page.click('#panel [data-card="관우"]');
    await v.page.click('[data-out="world"]');
    assert.equal(await openOf(v.page), 'world');
    assert.equal(await v.page.locator('#panel [data-pick]').count(), 3, '세계 셋');
    await v.page.click('#panel [data-pick="samguk"]');
    await toDone(v.page);
    const st = await state(v.page), want = P.build(D, S, '관우', 'samguk', { style: S['default'], notes: st.notes['관우|samguk'] || {}, look: st.looks['관우|samguk'], shot: st.shots['관우|samguk'] });
    const got = await promptOf(v.page);
    assert.equal(got, want, '화면 지시문 = 조립기');
    assert.match(got, /Guan Yu/); assert.match(got, /COSTUME[^\n]*WUXIA|WORLD — THREE KINGDOMS ERA|^A full-body vertical 2:3 \(1024×1536\) character card image|^A full-body character (?:card illustration|image), vertical 2:3[^\n]*\n\n1\. STYLE/);   /* 기본 판 kv(2026-11-05~) 영문 네 칸 · kr_mmorpg v6(2026-11-08~) 줄 꼴 · 칸 꼴(kr_drawn_rim_dewy 2026-11-11~) */ assert.match(got, /Green Dragon Crescent Blade/);
    assert.match(await v.page.locator(mob ? '.hres .file' : '#file-name').textContent(), new RegExp('관우_samguk_' + S['default'] + '_f\\.webp'), '파일 이름');
    assert.match(v.page.url(), /card=%EA%B4%80%EC%9A%B0|card=관우/); assert.match(v.page.url(), /world=samguk/);
    /* 화풍 고르개(2026-11-06 「생성기에 화풍추가해주고, 변경 기능 만들어줘」) — 맨 위가 기본(''), 고르면 지시문 · 파일 이름이 그 화풍, 기본으로 돌아오면 그대로 */
    { const ov = await v.page.$$eval('#st-style option', os => os.map(o => o.value));
      assert.equal(ov[0], '', '화풍 맨 위는 기본'); assert(ov.includes('kv_kmmo_23d') && ov.includes('kr_promo_hikey') && !ov.includes(S['default']) && !ov.includes('kv_jp_paint') && !ov.includes('semi_smooth'), '화풍 목록 — 내린 화풍(2026-11-11)은 없다');
      await v.page.selectOption('#st-style', 'kv_kmmo_23d');
      assert.match(await promptOf(v.page), /^A full-body character card illustration[^\n]*\n\n1\. STYLE\n/, '고른 화풍 지시문');   /* 짧은 세계 그림(2026-11-08)이면 화풍 단락이 그 화풍 글 */
      assert.match(await v.page.locator(mob ? '.hres .file' : '#file-name').textContent(), /관우_samguk_kv_kmmo_23d_f\.webp/, '고른 화풍 파일 이름');
      await v.page.selectOption('#st-style', ''); assert.equal(await promptOf(v.page), want, '기본으로 돌아옴'); }
    await noOverflow(v.page, vp.width + ' 생성기 세계');
    checks += 12;
    /* 일상컷 — 처음부터 랜덤 → 다 골랐다 */
    await v.page.click('[data-open="out"]');
    await v.page.click('[data-out="casual"]');
    await v.page.click('#panel [data-pick="mecha"]');
    const ks = await v.page.evaluate(() => window.AtelierStudio.steps());
    await randAll(v.page, ks[1]);
    await toDone(v.page);
    const cp = await promptOf(v.page);
    if (/^Create ONE finished illustration\. Use case: identity-preserve/.test(cp)) assert.match(cp, /IDENTITY AND ART STYLE LOCK/);   /* 자연판(v7) */
    else if (/^Use the attached image as the reference/.test(cp)) { assert.match(cp, /Guan Yu/); assert.match(cp, /\n\nStyle: /); }   /* 짧은 판(2026-11-08) */
    else if (/^Edit the attached image: /.test(cp)) { assert.match(cp, /Guan Yu/); assert.match(cp, /1\. KEEP — from the attached image/); assert.match(cp, /Style: /); }   /* 칸 꼴(기본 kr_drawn_rim_dewy, 2026-11-11) */
    else { assert.match(cp, /^INPUT: the attached image/); assert.match(cp, /female personification of Guan Yu/); assert.match(cp, /SCENE \(chosen\)/); }
    assert.doesNotMatch(cp, /element|chemical symbol|atomic number/i, '원소 말이 남지 않았다');
    assert.match(await v.page.locator(mob ? '.hres .file' : '#file-name').textContent(), new RegExp('관우_mecha_' + S['default'] + '_f_casual1\\.webp'));
    /* 게임 코스프레(2026-11-15) — 코스프레 장소(거실)에서 계열을 고르면 옷 = 재단 열하나 → 게임 칸(목록의 게임 수) · 옷 색 · 데니어 · 상황 칸은 없다 · Outfit 줄에 게임 · 캐릭터, 등장인물 많은 게임은 「…」 자리 */
    { const pg = v.page, lineOf = (txt, head) => (String(txt).split('\n').find(l => l.startsWith(head)) || '');
      await pg.click('[data-open="era"]'); await pg.click('#panel .opt[data-pick="now"]');
      await pg.click('[data-open="place"]');
      if (!(await pg.locator('#panel .opt[data-pick="home_living"]').count()) && mob) await pg.click('#panel [data-gtab=""]');
      await pg.click('#panel .opt[data-pick="home_living"]');
      await pg.click('[data-open="ofam"]'); await pg.click('#panel .opt[data-pick="game_cosplay"]'); assert.equal(await openOf(pg), 'item', '코스프레 계열 다음 옷(재단)');
      assert.equal(await pg.locator('#panel .opt[data-pick^="gc_"]').count(), 11, '재단 열하나');
      await pg.click('#panel .opt[data-pick="gc_bikini"]'); assert.equal(await openOf(pg), 'cosplay', '옷 다음 게임');
      assert.equal(await pg.locator('#panel .opt[data-pick]').count(), JSON.parse(fs.readFileSync(path.join(ROOT, 'data/game-cosplay.json'), 'utf8')).games.length + 1, '목록의 게임 + 안 고름');   /* 게임 수는 목록에서(2026-11-17 — 열아홉 → 스물넷, 박아 둔 20 이 깨졌다) */
      await pg.click('#panel .opt[data-pick="legend_of_zelda"]'); assert.equal(await openOf(pg), 'hair', '게임 다음은 머리 — 옷 색 · 데니어 · 상황 칸이 없다');
      assert.equal(await pg.locator('.hchip[data-open="color"], .hchip[data-open="denier"], .hchip[data-open="situ"]').count(), 0, '코스프레엔 옷 색 · 데니어 · 상황 칩이 없다');
      await randAll(pg, 'hair'); await toDone(pg);
      assert.equal((await state(pg)).scene.cosplay.game, 'legend_of_zelda', '랜덤이 고른 게임을 지킨다');
      assert((await state(pg)).scene.frame !== 'face_close', '코스프레엔 얼굴 클로즈업이 없다');
      const tc = await promptOf(pg);
      assert(lineOf(tc, 'Outfit: ').startsWith('Outfit: a daring adult cosplay of Link from The Legend of Zelda — ') && /^(?:OUTPUT: [^\n]*game cosplay|Cosplay: in this cut)/m.test(tc) && !/SIGNATURE ACCESSORY|faction's palette/.test(tc), '코스프레 지시문 ' + lineOf(tc, 'Outfit: ').slice(0, 100));
      await pg.click('[data-open="cosplay"]'); await pg.click('#panel .opt[data-pick="overwatch"]'); await toDone(pg);
      assert(lineOf(await promptOf(pg), 'Outfit: ').startsWith('Outfit: … (a daring adult cosplay of one character of your choice from Overwatch'), '등장인물 많은 게임은 「…」 자리');
      assert.equal((await state(pg)).scene.cosplay.cut, 'bikini', '장면의 코스프레 재단 = 옷');
      checks += 11;
      /* 옷 색 구체 색(2026-11-16) — 옷 색 묶음을 고르면 그 아래 「색」 칸(자동 + 묶음 shade), 자동은 조립부 결정 규칙 · 고르면 그 shade 글, 다른 묶음으로 바꾸면 shade 를 뗀다 */
      await pg.click('[data-open="ofam"]'); await pg.click('#panel .opt[data-pick="homewear"]'); await toDone(pg);
      assert.equal(await pg.locator('.hchip[data-open="shade"]').count(), 0, '옷 색 묶음 전엔 색 칸이 없다');
      await pg.click('[data-open="color"]'); await pg.click('#panel .opt[data-pick="pastel"]'); assert.equal(await openOf(pg), 'shade', '옷 색 다음 색');
      assert.equal(await pg.locator('#panel .opt[data-pick]').count(), 7, '자동 + 파스텔 shade 여섯');
      const sa = P.shadeAuto('pastel', P.shadeSeed('관우', 'mecha', (await state(pg)).casualN || 1), P.hairHue(D, '관우', 'mecha'));
      assert(lineOf(await promptOf(pg), 'Outfit: ').includes(' — in ' + sa.en + '; the outfit colour reads clearly'), '자동 — 결정 규칙 shade ' + sa.key);
      await pg.click('#panel .opt[data-pick="baby_blue"]'); await toDone(pg);
      assert(lineOf(await promptOf(pg), 'Outfit: ').includes(' — in soft pastel baby blue; ') && !/such as/.test(lineOf(await promptOf(pg), 'Outfit: ')), '고른 shade 글');
      await pg.click('[data-open="color"]'); await pg.click('#panel .opt[data-pick="vivid"]');
      assert(!(await state(pg)).scene.shade, '다른 묶음이면 shade 를 뗀다');
      checks += 6; }
    await noOverflow(v.page, vp.width + ' 생성기 일상');
    assert.deepEqual(v.errors, [], '생성기 콘솔'); checks += 6; await v.ctx.close();
  }
  /* ── 목록 도감 — 폴드 커버(344×882 터치): 첫 화면에 장수 그림 · 그림 없는 장수 · 새 그림 표시와 확인 · 옛 즐겨찾기 주소 ── */
  if (part('dex')) {
    const { ctx, page: p, errors } = await open('/dex.html?faction=wei&today=2026-11-17', { width: 344, height: 882 }, { hasTouch: true, isMobile: true });
    await p.waitForSelector('.dx-row');
    const first = await p.locator('.dx-row >> nth=0').boundingBox(); assert(first.y < 260, '첫 화면에 장수 줄 — y ' + first.y);
    assert(await p.locator('.dx-row >> nth=0 >> img').count() >= 1 || await p.locator('.dx-row >> nth=0').getAttribute('data-art') === '0');
    assert(await p.locator('.dx-row').evaluateAll(es => es.filter(e => e.getBoundingClientRect().top < innerHeight - 60).length) >= 4, '첫 화면에 장수 줄 넷 이상');
    assert(await p.locator('.dx-facs [data-f]').count() >= 3 + 10, '위 · 촉 · 오 + 군웅의 무리');
    for (const hgt of await p.locator('.dx-facs [data-f], .dx-tools, .dx-back, .dx-row .dx-who').evaluateAll(es => es.map(e => e.getBoundingClientRect().height))) assert(hgt >= 44, '누르는 자리 ' + hgt);
    await p.click('.dx-facs [data-f="yuanshao"]'); await p.waitForFunction(n => document.querySelectorAll('.dx-row').length === n, D.generals.filter(g => g.camp === 'yuanshao').length);
    await p.goto(BASE + '/dex.html?faction=qun'); await p.waitForSelector('.dx-row'); assert.equal(await p.locator('.dx-row').count(), D.generals.filter(g => g.faction === 'qun').length);
    /* 그림 없는 장수 */
    assert(await p.locator('.dx-row[data-art="0"]').count() > 0); assert.equal(await p.locator('.dx-row[data-art="0"]').count(), D.generals.filter(g => g.faction === 'qun' && noWorldArt(g)).length);
    await p.click('.dx-tools'); await p.click('.dx-sheet [data-only="none"]'); await p.waitForFunction(() => !document.querySelector('.dx-row[data-art="1"]')); assert.equal(await p.locator('.dx-row[data-art="1"]').count(), 0);
    await p.click('.dx-sheet [data-only="none"]'); await p.click('.dx-sheet .dx-close');
    assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '폴드 커버 넘침'); checks += 9;
    /* 새 그림 — 열어 보면 꺼진다, 새로 고쳐도 꺼진 채, 날짜가 지나면 처음부터 없다. 가장 늦게 등록된(기본 화풍 세계 그림이 있는) 장수로 */
    const lastOf = g => C.lastAdded(IMGDOC.img[g.key], IMGDOC.added), hasWorld = g => D.vocab.worlds.some(w => (((IMGDOC.img[g.key] || {}).byStyle || {})[S['default']] || { byForm: {} }).byForm[w]);
    const cand = D.generals.filter(g => lastOf(g) && hasWorld(g)).sort((a, b) => lastOf(a) < lastOf(b) ? 1 : -1)[0];
    if (cand) { const newName = cand.key, newest = lastOf(cand), facOfNew = cand.faction, row = '.dx-row[data-name="' + newName + '"]';
      const fresh = D.generals.filter(g => g.faction === facOfNew && C.isNew(lastOf(g), newest, '')).length;
      await p.goto(BASE + '/dex.html?faction=' + facOfNew + '&today=' + newest); await p.waitForSelector(row + '[data-new="1"]');
      assert.equal(await p.locator('.dx-row[data-new="1"]').count(), fresh, '새 그림 줄 수'); assert.match(await p.locator(row).textContent(), /새 그림/);
      assert.equal(await p.locator('.dx-facs [data-f="' + facOfNew + '"]').getAttribute('data-new'), '1', '세력 줄의 새 그림 점');
      /* 새 그림만 */
      await p.click('.dx-tools'); await p.click('.dx-sheet [data-only="new"]'); await p.waitForFunction(() => !document.querySelector('.dx-row[data-new="0"]')); assert.equal(await p.locator('.dx-row').count(), fresh);
      await p.click('.dx-sheet [data-only="new"]'); await p.click('.dx-sheet .dx-close');
      await p.click(row + ' img >> nth=0'); await p.waitForSelector('.lightbox'); await p.keyboard.press('Escape');
      await p.waitForSelector(row + '[data-new="0"]'); await p.reload(); await p.waitForSelector(row + '[data-new="0"]');
      assert.equal(await p.locator('.dx-row[data-new="1"]').count(), fresh - 1, '다른 장수의 표지는 그대로');
      /* 새 그림 모두 확인 */
      if (fresh > 1) { await p.click('.dx-tools'); await p.click('.dx-sheet .dx-seenall'); await p.waitForFunction(() => !document.querySelector('.dx-row[data-new="1"]'));
        assert.equal(await p.locator('.dx-facs [data-new="1"]').count(), 0, '모두 확인하면 세력 줄의 점도'); await p.click('.dx-sheet .dx-close'); }
      await p.evaluate(() => localStorage.removeItem('samguk_seen_v1'));
      await p.goto(BASE + '/dex.html?faction=' + facOfNew + '&today=2099-01-01'); await p.waitForSelector('.dx-row'); assert.equal(await p.locator('.dx-row[data-new="1"]').count(), 0, '하루 넘긴 등록은 처음부터 안 켜진다');
      /* 막사에서 온 길 — ?card= 만 오면 그 장수의 그림이 열리고 확인으로 친다. 뒤로 가기는 팝업만 */
      await p.goto(BASE + '/dex.html?faction=' + facOfNew + '&card=' + encodeURIComponent(newName) + '&today=' + newest); await p.waitForSelector('.lightbox');
      await p.goBack(); await p.waitForFunction(() => !document.querySelector('.lightbox')); await p.waitForSelector(row + '[data-new="0"]'); assert.match(p.url(), /dex\.html/);
      assert.doesNotMatch(p.url(), /card=|pic=/, '크게 보기를 닫으면 주소에서 card · pic 을 지운다'); await p.reload(); await p.waitForSelector(row); await p.waitForTimeout(300); assert.equal(await p.locator('.lightbox').count(), 0, '새로 고쳐도 다시 열리지 않는다');
      /* 크게 보기 — 아래 단추 셋이 44px, 떠 있는 동안 뒤 목록이 밀리지 않는다 */
      await p.click(row + ' img >> nth=0'); await p.waitForSelector('.lightbox');
      for (const hgt of await p.locator('.lightbox .bar button, .lightbox .bar a').evaluateAll(es => es.map(e => e.getBoundingClientRect().height))) assert(hgt >= 44, '크게 보기 단추 ' + hgt);
      { const y0 = await p.evaluate(() => scrollY); await p.mouse.wheel(0, 500); await p.waitForTimeout(150); assert.equal(await p.evaluate(() => scrollY), y0, '크게 보기 뒤 목록이 밀린다'); }
      await p.keyboard.press('Escape'); await p.waitForFunction(() => !document.querySelector('.lightbox'));
      /* 도구 판을 연 채 뒤로 가기 — 판만 닫힌다 */
      await p.click('.dx-tools'); await p.waitForSelector('.dx-sheet'); await p.goBack(); await p.waitForFunction(() => !document.querySelector('.dx-sheet')); assert.match(p.url(), /dex\.html/); assert(await p.locator('.dx-row').count() > 0);
      /* faction 과 card 가 안 맞는 주소 — 그 장수가 든 세력 줄을 연다(닫은 뒤에도 그 줄) */
      { const other = ['wei', 'shu', 'wu'].find(k => k !== facOfNew), grpKey = cand.faction === 'qun' && cand.camp ? cand.camp : cand.faction;
        await p.goto(BASE + '/dex.html?faction=' + other + '&card=' + encodeURIComponent(newName)); await p.waitForSelector('.lightbox'); assert.equal(await p.locator(row).count(), 1);
        await p.keyboard.press('Escape'); await p.waitForFunction(() => !document.querySelector('.lightbox')); assert.equal(await p.locator('.dx-facs [aria-current="page"]').getAttribute('data-f'), grpKey);
        assert.match(p.url(), new RegExp('faction=' + grpKey)); assert.equal(await p.locator(row).count(), 1); }
      /* 주소로 바로 연 도감의 「‹ 지도」 는 지도로(넘어온 막사가 없다) — 막사에서 넘어온 길은 tests/tianxia-screen.cjs */
      await p.click('.dx-back'); await p.waitForURL(/index\.html$/); await p.goBack(); await p.waitForSelector('.dx-row');
      /* 옛 즐겨찾기 주소 — pic 이 파일 이름이 아니면 첫 그림을 연다 */
      await p.goto(BASE + '/dex.html?card=' + encodeURIComponent(newName) + '&pic=0'); await p.waitForSelector('.dx-row[data-name="' + newName + '"]'); await p.waitForSelector('.lightbox[role="dialog"]');
      await p.keyboard.press('Escape'); await p.waitForFunction(() => !document.querySelector('.lightbox')); checks += 9;
      const pic = D.vocab.worlds.map(w => (((IMGDOC.img[newName].byStyle[S['default']] || {}).byForm || {})[w] || {}).f).find(Boolean);
      await p.goto(BASE + '/dex.html?faction=' + facOfNew + '&card=' + encodeURIComponent(newName) + '&pic=' + encodeURIComponent(pic)); await p.waitForSelector('.lightbox[role="dialog"]');
      assert.match(await p.locator('.lightbox img').getAttribute('src'), new RegExp(encodeURIComponent(pic).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), '즐겨찾기의 그 그림');
      checks += 10; }
    /* 그림 없는 장수의 ?card= — 줄이 펼쳐진다 */
    { const none = D.generals.find(g => !C.hasArt(IMGDOC.img[g.key])); await p.goto(BASE + '/dex.html?faction=' + none.faction + '&card=' + encodeURIComponent(none.key));
      await p.waitForSelector('.dx-row[data-name="' + none.key + '"][data-open="1"]'); assert.equal(await p.locator('.lightbox').count(), 0); checks += 1; }
    assert.deepEqual(errors, [], '도감(폴드 커버) 콘솔'); await ctx.close();
  }
  /* 시대 넷 — 역사의 자리 장소가 일상컷 트리에 산다 */
  const tree = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/casual-tree.json'), 'utf8'));
  assert.deepEqual(tree.eras.map(e => e.key), ['now', 'heritage', 'nation', 'fantasy']);
  assert.equal(tree.places.filter(p => p.key.startsWith('heritage_')).length, 19); checks += 2;   // 2026-11-03 「다 넣어줘」 — 관제묘 · 백제성 · 오장원 … 열을 더했다
  await br.close(); server.close();
  console.log('PASS 화면: 전장(일곱 전장 · 세계마다 지도 · 진영 · 군웅 무리 · 이름표 → 미리 보기 → 배치 · 크게 보기 · 확대 축소 · 빼기) · 목록 도감 정리판(세력 줄 — 위 · 촉 · 오 · 군웅의 무리 · 장수 줄 · 세계 셋 · 빈 칸 → 생성기 · 설계 상태 · 요약 · 도구 판 — 찾기 · 화풍 · 걸러 보기 · 그림 없음 · 새 그림과 확인 · 주소) · 생성기(세력 › 장수 › 세계 그림 = 조립기 · 파일 이름 · 일상컷 랜덤 → 다 골랐다) · 폰 · PC — ' + checks + '가지');
})().catch(e => { console.error(e); server.close(); process.exit(1); });

/* 천하 지도 · 진영 막사 화면 검사 — index.html(lib/tianxia.js). 폴드 커버 344×882 터치가 기준, 끝에 PC(1280)로 넘침만.
   서버 · ESM 바꿔치기는 tests/screen.cjs 방식(ESM_DIR 에 preact 가 없으면 esm.sh 에서 그대로 받는다). 그림 주소는 막는다 — 지도는 임시 바탕으로.
   Run: [ESM_DIR=<preact 가 든 node_modules>] CHROMIUM_PATH=<chrome> node tests/tianxia-screen.cjs   (PORT 기본 8797) */
const assert = require('node:assert/strict'), http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), PORT = +(process.env.PORT || 8797), BASE = 'http://127.0.0.1:' + PORT;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.md': 'text/markdown' };
const server = http.createServer((q, s) => {
  const p = decodeURIComponent(new URL(q.url, BASE).pathname), file = path.join(ROOT, p === '/' ? 'index.html' : p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(s);
});
const ESM = { 'https://esm.sh/preact@10.24.3': 'preact/dist/preact.mjs', 'https://esm.sh/preact@10.24.3/hooks': 'preact/hooks/dist/hooks.mjs' };
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const T = J('data/tianxia.json'), design = J('data/sam-design.json'), IMGDOC = J('data/img.json');
const C = require('../lib/tianxia-core.js'), doc = C.make({ design, packs: J('data/draft2-packs.json'), factions: J('data/draft2-factions.json'), combos: J('data/draft2-combos.json'), tianxia: T });
const TODAY = '2026-11-17';
/* 그 판도 그 세력에 새 그림(오늘 · 어제 등록)이 있나 — 화면의 범례 점과 맞춰 본다(확인 기록이 빈 브라우저) */
const hasNew = (era, f) => C.members(doc, era, f).some(m => C.isNew(C.lastAdded(IMGDOC.img[m.name], IMGDOC.added), TODAY, ''));

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const br = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const open = async (viewport, touch) => {
    const ctx = await br.newContext({ viewport, hasTouch: !!touch, isMobile: !!touch });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => {
      const url = r.request().url().split('?')[0], file = process.env.ESM_DIR && ESM[url];
      if (file && fs.existsSync(path.join(process.env.ESM_DIR, file))) return r.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(process.env.ESM_DIR, file), 'utf8').replace(/from"preact"/g, 'from"https://esm.sh/preact@10.24.3"') });
      return /^https:\/\/esm\.sh\//.test(url) ? r.continue() : r.abort();
    });
    const p = await ctx.newPage(), errors = [];
    p.on('pageerror', e => errors.push(String(e)));
    p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    return { ctx, p, errors };
  };
  const fits = p => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  let checks = 0;

  /* ── ① 천하 지도 ── */
  const { ctx, p, errors } = await open({ width: 344, height: 882 }, true);
  await p.goto(BASE + '/index.html?today=' + TODAY); await p.waitForSelector('.tx-city');
  assert.equal(await p.evaluate(() => document.documentElement.dataset.layer), 'map');
  assert.equal(await p.locator('.tx-city').count(), T.cities.length);
  assert.equal(await p.locator('.tx-eras [data-era]').count(), 5);
  assert.equal(await p.locator('.tx-eras [aria-pressed="true"]').getAttribute('data-era'), 'mx');
  assert.equal(await p.locator('.tx-worlds [data-w]').count(), 3);
  assert.equal(await p.evaluate(() => document.documentElement.dataset.world), 'samguk');
  for (const h of await p.locator('.tx-eras [data-era], .tx-worlds [data-w], .tx-legend [data-f], .tx-tools').evaluateAll(es => es.map(e => e.getBoundingClientRect().height))) assert(h >= 44, '누르는 자리 ' + h);
  /* 성의 주인 = 자료, 지도는 처음에 전체가 화면 안에 */
  const own = () => p.locator('.tx-city').evaluateAll(es => es.map(e => e.dataset.city + '=' + e.dataset.f).join());
  const want = era => T.cities.map(c => c.key + '=' + (C.ownerOf(doc, era, c.key) || '')).join();
  assert.equal(await own(), want('mx'), '군웅록 — 성의 주인');
  { const r = await p.locator('.tx-map').boundingBox(), s = await p.locator('.tx-stage').boundingBox();
    assert(r.x >= s.x - 1 && r.y >= s.y - 1 && r.x + r.width <= s.x + s.width + 1 && r.y + r.height <= s.y + s.height + 1, '처음엔 지도 전체가 보인다');
    assert(Math.abs(r.height / r.width - 1.5) < 0.02, '지도는 세로 2:3'); }
  /* 범례 — 장수가 있는 세력 모두, 성 많은 차례 · 떠도는 세력은 끝. 새 그림 점은 그해 장수만 */
  const legend = () => p.locator('.tx-legend [data-f]').evaluateAll(es => es.map(e => e.dataset.f + (e.dataset.new === '1' ? '*' : '') + (e.dataset.landless === '1' ? '~' : '')).join());
  const wantLegend = era => C.factionsOf(doc, era).map(f => f.key + (hasNew(era, f.key) ? '*' : '') + (f.landless ? '~' : '')).join();
  assert.equal(await legend(), wantLegend('mx'), '군웅록 범례'); assert(/~/.test(wantLegend('mx')), '군웅록 — 떠도는 세력이 범례에');
  assert(await p.locator('.tx-line').textContent(), '위 막대의 한 줄'); assert((await p.locator('.tx-line').textContent()).includes(T.eras.mx.line));
  checks += 12;
  /* 판도를 바꾸면 성의 주인이 바뀐다 */
  const a = await own(); await p.click('.tx-eras [data-era="jb208"]'); await p.waitForFunction(x => [...document.querySelectorAll('.tx-city')].map(e => e.dataset.city + '=' + e.dataset.f).join() !== x, a);
  assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('era')), 'jb208');
  assert.equal(await own(), want('jb208')); assert.equal(await legend(), wantLegend('jb208'), '208 범례');
  assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('today')), TODAY, '주소의 다른 값은 그대로');
  /* 떠도는 세력 — 263 의 회남(장수는 있고 성이 없다) */
  await p.click('.tx-eras [data-era="end263"]'); await p.waitForFunction(() => document.querySelector('.tx-eras [aria-pressed="true"]').dataset.era === 'end263');
  assert.equal(await legend(), wantLegend('end263')); assert.equal(await p.locator('.tx-legend [data-landless="1"]').count(), C.factionsOf(doc, 'end263').filter(f => f.landless).length);
  assert(await p.locator('.tx-legend [data-landless="1"]').count() >= 1, '263 떠도는 세력');
  /* 194 — 주인 없는 성이 많다. 빈 값 표지 */
  await p.click('.tx-eras [data-era="w194"]'); await p.waitForFunction(() => document.querySelector('.tx-eras [aria-pressed="true"]').dataset.era === 'w194');
  assert.equal(await p.locator('.tx-city[data-f=""]').count(), T.cities.filter(c => !C.ownerOf(doc, 'w194', c.key)).length, '194 주인 없는 성');
  await p.click('.tx-eras [data-era="jb208"]');
  /* 세계를 바꾸면 바탕이 바뀐다 */
  await p.click('.tx-worlds [data-w="mecha"]'); assert.equal(await p.evaluate(() => document.documentElement.dataset.world), 'mecha');
  assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('w')), 'mecha');
  assert.equal(await p.locator('.tx-map').getAttribute('data-art'), '0', '그림을 못 받으면 임시 바탕'); assert(await p.locator('.tx-map .tx-terrain').count(), '임시 바탕의 강 · 해안');
  /* 기억 · 넘침 · 콘솔 */
  await p.reload(); await p.waitForSelector('.tx-city'); assert.equal(await p.locator('.tx-eras [aria-pressed="true"]').getAttribute('data-era'), 'jb208');
  await p.goto(BASE + '/index.html'); await p.waitForSelector('.tx-city');   /* 주소에 없어도 이 브라우저가 기억한다 */
  assert.equal(await p.locator('.tx-eras [aria-pressed="true"]').getAttribute('data-era'), 'jb208'); assert.equal(await p.locator('.tx-worlds [aria-pressed="true"]').getAttribute('data-w'), 'mecha');
  await p.goto(BASE + '/index.html?era=zzz&w=zzz'); await p.waitForSelector('.tx-city');   /* 모르는 값은 기억한 것으로 */
  assert.equal(await p.locator('.tx-eras [aria-pressed="true"]').getAttribute('data-era'), 'jb208');
  assert(await fits(p)); assert.deepEqual(errors, []);
  checks += 14;
  /* 확대 — 두 번 누르면 커지고, 끌어도 지도가 밖으로 나가지 않는다 */
  { const s = await p.locator('.tx-stage').boundingBox(), w0 = (await p.locator('.tx-map').boundingBox()).width, x = s.x + 20, y = s.y + s.height - 20;   /* 지도 밖 빈 구석 — 세력의 땅이 아닌 곳 */
    const cx = s.x + s.width / 2, cy = s.y + s.height / 2;
    await p.evaluate(() => document.querySelector('.tx-stage').dispatchEvent(new WheelEvent('wheel', { deltaY: -400, clientX: innerWidth / 2, clientY: innerHeight / 2, bubbles: true, cancelable: true })));
    const w1 = (await p.locator('.tx-map').boundingBox()).width; assert(w1 > w0 * 1.2, '확대 ' + w0 + ' → ' + w1);
    await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.move(cx + 300, cy + 300, { steps: 4 }); await p.mouse.up();
    const r = await p.locator('.tx-map').boundingBox(); assert(r.x <= s.x + 1 && r.y <= s.y + 1, '끌어도 밖으로 못 나간다');
    assert.equal(await p.evaluate(() => document.documentElement.dataset.layer), 'map', '끌기는 누르기가 아니다');
    await p.evaluate(() => document.querySelector('.tx-stage').dispatchEvent(new WheelEvent('wheel', { deltaY: 4000, clientX: 10, clientY: 300, bubbles: true, cancelable: true })));
    assert(Math.abs((await p.locator('.tx-map').boundingBox()).width - w0) < 1, '다시 전체 맞춤'); void x; void y; checks += 4; }
  /* 옛 주소 — 군막은 지도로(주소의 ? 뒤는 그대로), 예전 게임 주소는 게임으로 */
  await p.goto(BASE + '/hall.html?era=gd200'); await p.waitForSelector('.tx-city');
  assert.match(p.url(), /\/index\.html\?era=gd200$/); assert.equal(await p.locator('.tx-eras [aria-pressed="true"]').getAttribute('data-era'), 'gd200');
  for (const old of ['/?daily', '/index.html?local=1#sam-transfer=%7B%7D']) { await p.goto(BASE + old); await p.waitForURL(/draft\.html/); }
  /* 도구 상자 — 옛 메뉴가 다 있다 · 최근 그림 · 패치 기록 · 공간 · 새 그림 모두 확인 */
  await p.goto(BASE + '/index.html?era=mx&today=' + TODAY); await p.waitForSelector('.tx-city');
  await p.click('.tx-tools'); for (const k of ['draft', 'draft2', 'battle', 'dex', 'prompt']) assert.equal(await p.locator('.tx-sheet [data-go="' + k + '"]').count(), 1);
  for (const h of await p.locator('.tx-sheet [data-go], .tx-sheet [data-theme-pick], .tx-sheet .tx-seenall, .tx-sheet .tx-patch-open, .tx-sheet .tx-close').evaluateAll(es => es.map(e => e.getBoundingClientRect().height))) assert(h >= 44, '도구 상자 누르는 자리 ' + h);
  assert.equal(await p.locator('.tx-sheet .tx-recent a').count(), Math.min(8, Object.keys(IMGDOC.added).length), '최근 그림 여덟');
  assert.match(await p.locator('.tx-sheet .tx-recent a >> nth=0').getAttribute('href'), /^dex\.html\?faction=\w+&card=.+&pic=.+/);
  assert.equal(await p.locator('.tx-sheet [data-theme-pick]').count(), 9, '공간 아홉');
  await p.click('.tx-sheet [data-theme-pick="neonrain"]'); assert.equal(await p.evaluate(() => document.documentElement.dataset.theme), 'neonrain'); assert.equal(await p.evaluate(() => document.documentElement.dataset.tone), 'dark', '어두운 공간 → 어두운 판');
  await p.click('.tx-sheet [data-theme-pick="peachsword"]'); assert.equal(await p.evaluate(() => document.documentElement.dataset.tone), 'light', '밝은 공간 → 밝은 판');
  await p.click('.tx-sheet .tx-patch-open'); await p.waitForSelector('.tx-sheet .tx-patch li');
  /* 새 그림 모두 확인 — 범례의 점이 꺼지고 새로 고쳐도 꺼진 채 */
  if (/\*/.test(wantLegend('mx'))) {
    assert(await p.locator('.tx-legend [data-new="1"]').count() > 0); await p.click('.tx-sheet .tx-seenall');
    await p.waitForFunction(() => !document.querySelector('.tx-legend [data-new="1"]'));
    await p.reload(); await p.waitForSelector('.tx-city'); assert.equal(await p.locator('.tx-legend [data-new="1"]').count(), 0, '확인 기록은 이 브라우저에 남는다');
    await p.goto(BASE + '/index.html?era=mx&today=2099-01-01'); await p.waitForSelector('.tx-city'); assert.equal(await p.locator('.tx-legend [data-new="1"]').count(), 0); checks += 2;
  } else { await p.keyboard.press('Escape'); }
  assert(await fits(p)); assert.deepEqual(errors, []); checks += 12;
  await ctx.close();

  /* ── 저장이 막힌 브라우저에서도 뜬다 · PC 에서 넘치지 않는다 ── */
  { const v = await open({ width: 344, height: 882 }, true);
    await v.p.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
    await v.p.goto(BASE + '/index.html?today=' + TODAY); await v.p.waitForSelector('.tx-city');
    await v.p.click('.tx-eras [data-era="gd200"]'); assert.equal(await v.p.evaluate(() => new URLSearchParams(location.search).get('era')), 'gd200');
    assert.deepEqual(v.errors, []); await v.ctx.close(); checks += 2; }
  { const v = await open({ width: 1280, height: 900 });
    await v.p.goto(BASE + '/index.html?era=mx'); await v.p.waitForSelector('.tx-city'); assert(await fits(v.p), 'PC 넘침');
    const r = await v.p.locator('.tx-map').boundingBox(); assert(r.height <= 900 && r.width > 300, 'PC 지도 크기');
    assert.deepEqual(v.errors, []); await v.ctx.close(); checks += 2; }

  await br.close(); server.close();
  console.log('PASS 천하 지도 화면: 판도 다섯 · 세계 셋 · 성 ' + T.cities.length + ' · 범례(떠도는 세력 · 새 그림 점) · 확대 · 기억 · 옛 주소 · 도구 상자 · 폰 · PC — ' + checks + '가지');
})().catch(e => { console.error(e); server.close(); process.exit(1); });

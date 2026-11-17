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
  for (const h of await p.locator('.tx-eras [data-era], .tx-worlds [data-w], .tx-legend [data-f], .tx-tools, .tx-zoom button').evaluateAll(es => es.map(e => Math.min(e.getBoundingClientRect().height, e.matches('.tx-zoom button') ? e.getBoundingClientRect().width : 99)))) assert(h >= 44, '누르는 자리 ' + h);
  assert.equal(await p.locator('.tx-zoom button').count(), 3, '확대 단추 셋');
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
  /* 확대 — 휠로 커지고, 끌어도 지도가 밖으로 나가지 않는다(단추 셋 · 두 번 누르기 없음은 아래 「검토에서 나온 흠」) */
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
  { const who = await p.locator('.tx-sheet .tx-recent a').evaluateAll(es => es.map(e => e.title));
    assert.equal(who.length, Math.min(8, new Set(Object.keys(IMGDOC.added).map(f => f.split('_')[0]).filter(k => design.generals.some(g => g.key === k))).size), '최근 그림 여덟');
    assert.equal(new Set(who).size, who.length, '최근 그림 — 장수가 겹치지 않는다'); }
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

  /* ── ② 진영 막사 ── 범례 · 성 · 땅을 누르면 그 세력의 막사, 뒤로 가면 지도 */
  const SHU = '촉한', enc = encodeURIComponent, art = n => C.hasArt(IMGDOC.img[n]);
  await p.evaluate(() => { try { localStorage.removeItem('samguk_seen_v1'); } catch (e) {} });
  await p.goto(BASE + '/index.html?era=mx&today=' + TODAY); await p.waitForSelector('.tx-city');
  await p.click('.tx-legend [data-f="' + SHU + '"]'); await p.waitForSelector('.tx-camp');
  await p.waitForFunction(() => document.querySelector('.tx-camp').getAnimations().length === 0);   /* 들어오는 움직임이 끝난 뒤에 잰다 */
  assert.equal(await p.evaluate(() => document.documentElement.dataset.layer), 'camp');
  assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('f')), SHU);
  assert.equal(await p.locator('.tx-lord').getAttribute('data-name'), '유비');
  const ms = C.members(doc, 'mx', SHU), n = ms.length;
  assert.equal(await p.locator('.tx-face[data-name]').count(), n, '막사의 장수 수');          // 가운데 + 둘레 + 아래 줄 = 모두
  assert.deepEqual((await p.locator('.tx-face[data-name]').evaluateAll(es => es.map(e => e.dataset.name))).sort(), ms.map(m => m.name).sort());
  const ring = await p.locator('.tx-ring .tx-face:not(.tx-lord)').count(), rest = await p.locator('.tx-rest .tx-face').count();
  assert(ring >= 6 && ring <= 12 && 1 + ring + rest === n, '둘레 ' + ring + ' · 아래 줄 ' + rest);
  assert(await p.locator('.tx-bond[data-kind="bond"]').count() > 0, '결의 선');
  assert((await p.locator('.tx-ring .tx-face').evaluateAll(es => es.map(e => e.dataset.name))).includes('관우'), '군주와 결의로 묶인 장수가 둘레에');
  for (const h of await p.locator('.tx-roles [data-role], .tx-tolist, .tx-back, .tx-bonds button').evaluateAll(es => es.map(e => e.getBoundingClientRect().height))) assert(h >= 44, '막사 누르는 자리 ' + h);
  /* 둘레의 얼굴끼리 · 가운데와 겹치지 않는다 */
  { const bs = await p.locator('.tx-ring .tx-face i, .tx-lord i').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, r.width / 2]; }));
    for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) assert(Math.hypot(bs[i][0] - bs[j][0], bs[i][1] - bs[j][1]) >= bs[i][2] + bs[j][2] - 0.5, '얼굴이 겹친다 ' + i + ' · ' + j);
    for (const b of bs) assert(b[0] - b[2] >= 0 && b[0] + b[2] <= 344, '얼굴이 화면 밖'); }
  /* 머리 — 세력 · 판도 · 그 세력의 한 줄 · 가진 성 */
  { const head = await p.locator('.tx-camp-head').textContent(); assert(head.includes(SHU) && head.includes(T.eras.mx.notes[SHU]), '막사 머리');
    for (const c of C.factionsOf(doc, 'mx').find(f => f.key === SHU).cities) assert(head.includes(T.cities.find(x => x.key === c).ko), '가진 성 ' + c); }
  /* 결의 — 글 칸에 이름과 사람, 누르면 그 결의 */
  assert(await p.locator('.tx-bonds button').count() > 0); await p.click('.tx-bonds button >> nth=0');
  assert.equal(await p.locator('.tx-bonds [aria-pressed="true"]').count(), 1); assert((await p.locator('.tx-bond-note').textContent()).length > 4);
  /* 그림 없는 장수 · 새 그림 */
  assert.equal(await p.locator('.tx-face[data-art="0"]').count(), ms.filter(m => !art(m.name)).length); assert(await p.locator('.tx-face[data-art="0"]').count() > 0);
  assert.equal(await p.locator('.tx-face[data-art="0"] img').count(), 0); assert.equal(await p.locator('.tx-face[data-art="1"] img').count(), ms.filter(m => art(m.name)).length);
  assert.equal(await p.locator('.tx-face[data-new="1"]').count(), ms.filter(m => C.isNew(C.lastAdded(IMGDOC.img[m.name], IMGDOC.added), TODAY, '')).length, '새 그림 표지');
  /* 장수를 누르면 목록 도감의 그 장수로 · 목록으로 보기 */
  assert.equal(await p.locator('.tx-lord').getAttribute('href'), 'dex.html?faction=shu&card=' + enc('유비'));
  assert.equal(await p.locator('.tx-tolist').getAttribute('href'), 'dex.html?faction=shu');
  /* 역할 걸러 보기 — 군주는 남는다 */
  await p.click('.tx-roles [data-role="strategist"]');
  assert.equal(await p.locator('.tx-face[data-name]:visible').count(), ms.filter(m => m.role === 'strategist' || m.role === 'lord').length);
  await p.click('.tx-roles [data-role="all"]'); assert.equal(await p.locator('.tx-face[data-name]').count(), n);
  assert(await fits(p)); checks += 22;
  /* 뒤로 — 지도로(판도는 그대로). 「‹ 천하 지도」 도 같은 길 */
  await p.goBack(); await p.waitForSelector('.tx-city'); assert.equal(await p.evaluate(() => document.documentElement.dataset.layer), 'map');
  assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('f')), null);
  await p.click('.tx-city[data-city="chengdu"]'); await p.waitForSelector('.tx-camp'); assert.equal(await p.locator('.tx-lord').getAttribute('data-name'), '유비', '성을 누르면 주인 세력의 막사');
  await p.click('.tx-back'); await p.waitForSelector('.tx-city'); assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('f')), null);
  await p.goForward(); await p.waitForSelector('.tx-camp'); await p.goBack(); await p.waitForSelector('.tx-city');
  /* 세력의 땅(성 표지 옆)을 눌러도 */
  { const b = await p.locator('.tx-city[data-city="yunnan"]').boundingBox(); await p.mouse.click(b.x + b.width / 2 + 16, b.y + b.height / 2 - 14); await p.waitForSelector('.tx-camp');
    assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('f')), C.ownerOf(doc, 'mx', 'yunnan')); await p.goBack(); await p.waitForSelector('.tx-city'); }
  /* 주소로 바로 — 가장 큰 막사 · 그림이 하나도 없는 막사 · 군주가 없는 무리도 넘치지 않고 모두 나온다 */
  const fsMx = C.factionsOf(doc, 'mx'), largest = fsMx.slice().sort((x, y) => y.count - x.count)[0].key;
  const artless = fsMx.filter(f => C.members(doc, 'mx', f.key).every(m => !art(m.name))).sort((x, y) => y.count - x.count)[0].key;
  const lordless = fsMx.find(f => C.members(doc, 'mx', f.key)[0].role !== 'lord').key;
  for (const f of [largest, artless, lordless]) { await p.goto(BASE + '/index.html?era=mx&f=' + enc(f)); await p.waitForSelector('.tx-camp'); assert(await fits(p), f + ' 넘침');
    assert.equal(await p.locator('.tx-face[data-name]').count(), C.members(doc, 'mx', f).length, f + ' 장수 수'); assert.equal(await p.locator('.tx-lord').getAttribute('data-name'), C.chiefOf(doc, 'mx', f));
    assert.equal(await p.locator('.tx-face img').count(), C.members(doc, 'mx', f).filter(m => art(m.name)).length, f + ' 그림 있는 얼굴 수'); }
  await p.goto(BASE + '/index.html?era=mx&f=' + enc(artless)); await p.waitForSelector('.tx-camp'); assert.equal(await p.locator('.tx-face img').count(), 0, '그림 없는 막사 — 도장 얼굴만');
  /* 주소로 바로 연 막사의 「‹ 천하 지도」 — 지도로(공방 밖으로 나가지 않는다) */
  await p.click('.tx-back'); await p.waitForSelector('.tx-city'); assert.match(p.url(), /index\.html\?era=mx/);
  /* 연도 판도의 떠도는 세력에도 들어간다 · 그해에 없는 세력의 주소는 지도로 */
  const drift = C.factionsOf(doc, 'end263').find(f => f.landless).key;
  await p.click('.tx-eras [data-era="end263"]'); await p.click('.tx-legend [data-f="' + drift + '"]'); await p.waitForSelector('.tx-camp');
  assert.equal(await p.locator('.tx-face[data-name]').count(), C.members(doc, 'end263', drift).length, '떠도는 세력의 막사'); assert(await fits(p));
  await p.goto(BASE + '/index.html?era=end263&f=' + enc('여포')); await p.waitForSelector('.tx-city'); assert.equal(await p.evaluate(() => document.documentElement.dataset.layer), 'map');
  assert.deepEqual(errors, []); checks += 16;

  /* ── 검토에서 나온 흠(2026-11-17) ── */
  const layer = () => p.evaluate(() => document.documentElement.dataset.layer), qs = k => p.evaluate(k => new URLSearchParams(location.search).get(k), k);
  const camp = async (era, f) => { await p.goto(BASE + '/index.html?era=' + era + '&f=' + enc(f) + '&today=' + TODAY); await p.waitForSelector('.tx-camp'); await p.waitForFunction(() => document.querySelector('.tx-camp').getAnimations().length === 0); };
  /* 가운데 = 그 세력의 우두머리 — 200 원소군은 원소(유비가 아니다) · 263 진은 사마소 · 군웅록 동오는 손권. 사람 이름 그대로인 세력은 「○○군」 */
  for (const [era, f, who] of [['gd200', '원소', '원소'], ['end263', '진', '사마소'], ['mx', '동오', '손권'], ['w194', '도겸', '유비']]) { await camp(era, f); assert.equal(await p.locator('.tx-lord').getAttribute('data-name'), who, era + ' ' + f + ' 가운데'); }
  await camp('mx', '장수'); assert.match(await p.locator('.tx-camp-head h1').textContent(), /^장수군 · /, '사람 이름인 세력은 ○○군');
  /* 군주 없는 무리 — 역할을 걸러도 가운데가 그대로, 0명인 역할 단추는 못 누른다. 「목록으로 보기」 는 가장 많이 든 목록 세력으로 */
  { await camp('mx', lordless); const c0 = await p.locator('.tx-lord').getAttribute('data-name'), ms0 = C.members(doc, 'mx', lordless);
    for (const r of ['general', 'strategist', 'official']) { const n0 = ms0.filter(m => m.role === r).length, b = p.locator('.tx-roles [data-role="' + r + '"]');
      assert.equal(await b.isDisabled(), !n0, r + ' 단추'); if (!n0) continue;
      await b.click(); assert.equal(await p.locator('.tx-lord').getAttribute('data-name'), c0, '역할 ' + r + ' 로 걸러도 가운데 그대로');
      assert.equal(await p.locator('.tx-face[data-name]').count(), ms0.filter(m => m.role === r || m.role === 'lord' || m.name === c0).length); }
    const tally = {}; for (const m of ms0) { const g = design.generals.find(x => x.key === m.name), k = g.faction === 'qun' && g.camp ? g.camp : g.faction; tally[k] = (tally[k] || 0) + 1; }
    const href = await p.locator('.tx-tolist').getAttribute('href'); assert.equal(tally[href.split('=')[1]], Math.max(...Object.values(tally)), '목록으로 보기 — 가장 많이 든 세력 ' + href);
    const solo = C.factionsOf(doc, 'mx').find(f => f.count === 1).key; await camp('mx', solo); assert(await p.locator('.tx-roles button:disabled').count() >= 2, '한 명뿐인 막사 — 빈 역할 단추'); }
  /* 주소의 이상한 값 — 없는 세력은 지도로, 틀린 날짜는 기기 날짜로(흰 화면이 아니다) */
  for (const bad of ['f=constructor', 'f=__proto__', 'f=toString', 'today=2026-13-45', 'f=' + enc(SHU) + '&today=2026-99-99']) { await p.goto(BASE + '/index.html?era=mx&' + bad); await p.waitForSelector(/today=2026-99/.test(bad) ? '.tx-camp' : '.tx-city'); }
  assert.deepEqual(errors, []); checks += 12;
  /* 범례 — 군웅록에서 사람 이름 그대로인 세력은 「○○군」 */
  await p.evaluate(() => { try { sessionStorage.clear(); localStorage.removeItem('samguk_seen_v1'); } catch (e) {} });
  await p.goto(BASE + '/index.html?era=mx&today=' + TODAY); await p.waitForSelector('.tx-city');
  assert.match(await p.locator('.tx-legend [data-f="장수"]').textContent(), /장수군/); assert.doesNotMatch(await p.locator('.tx-legend [data-f="조위"]').textContent(), /군/);
  /* 확대 단추 — ＋ · − · 전체 보기. 지도 밖에 있다. 두 번 눌러도 커지지 않는다 */
  { const s = await p.locator('.tx-stage').boundingBox(), z = await p.locator('.tx-zoom').boundingBox(), w = async () => (await p.locator('.tx-map').boundingBox()).width, w0 = await w();
    assert(z.y >= s.y + s.height - 1, '확대 단추는 지도 밖');
    await p.touchscreen.tap(s.x + 20, s.y + 3); await p.touchscreen.tap(s.x + 20, s.y + 3); await p.waitForTimeout(200);
    if (await layer() === 'camp') { await p.goBack(); await p.waitForSelector('.tx-city'); } assert(Math.abs(await w() - w0) < 1, '두 번 누르기 확대는 없다');
    await p.click('.tx-zoom [data-zoom="in"]'); const w1 = await w(); assert(w1 > w0 * 1.4, '＋ ' + w0 + ' → ' + w1);
    await p.click('.tx-zoom [data-zoom="in"]'); await p.click('.tx-zoom [data-zoom="out"]'); assert(Math.abs(await w() - w1) < 2, '−');
    /* 지도를 끈 뒤에도 키보드(Enter)로 성이 눌린다 · 막사에 갔다 돌아와도 확대 · 자리가 그대로(새로 고쳐도 — 이 탭 안에서) */
    const cx = s.x + s.width / 2, cy = s.y + s.height / 2; await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.move(cx - 60, cy - 80, { steps: 4 }); await p.mouse.up();
    const b0 = await p.locator('.tx-map').boundingBox();
    await p.locator('.tx-city[data-city="chengdu"]').focus(); await p.keyboard.press('Enter'); await p.waitForSelector('.tx-camp'); assert.equal(await qs('f'), C.ownerOf(doc, 'mx', 'chengdu'), '끈 뒤 Enter');
    await p.goBack(); await p.waitForSelector('.tx-city'); const b1 = await p.locator('.tx-map').boundingBox();
    assert(Math.abs(b0.width - b1.width) < 1 && Math.abs(b0.x - b1.x) < 1 && Math.abs(b0.y - b1.y) < 1, '막사에서 돌아오면 확대 · 자리 그대로');
    await p.reload(); await p.waitForSelector('.tx-city'); const b2 = await p.locator('.tx-map').boundingBox(); assert(Math.abs(b0.width - b2.width) < 1 && Math.abs(b0.x - b2.x) < 1, '새로 고쳐도');
    await p.click('.tx-zoom [data-zoom="fit"]'); assert(Math.abs(await w() - w0) < 1, '전체 보기'); checks += 9; }
  /* 세력색이 보이는 범위 = 눌리는 범위(성에서 지도 폭의 12.5%) — 가장 가까운 성의 주인. 색은 지도 그림 안에서 잘린다, 지도 밖 띠는 땅이 아니다 */
  { const r = await p.locator('.tx-map').boundingBox(), s = await p.locator('.tx-stage').boundingBox(), c = T.cities.find(x => x.key === 'yunnan');
    const near = (x, y) => { let b = null, bd = 12.5; for (const cc of T.cities) { const f = C.ownerOf(doc, 'mx', cc.key), d = Math.hypot(cc.x - x, (cc.y - y) * 1.5); if (f && d < bd) { bd = d; b = f; } } return b; };
    for (const dx of [-11, -14]) { await p.mouse.click(r.x + (c.x + dx) / 100 * r.width, r.y + c.y / 100 * r.height); await p.waitForTimeout(150);
      const got = await layer() === 'camp' ? await qs('f') : null; assert.equal(got, near(c.x + dx, c.y), '운남에서 ' + dx + '%'); if (got) { await p.goBack(); await p.waitForSelector('.tx-city'); } }
    assert.equal(near(c.x - 11, c.y), C.ownerOf(doc, 'mx', 'yunnan')); assert.equal(near(c.x - 14, c.y), null);
    if (r.y - s.y > 8) { await p.mouse.click(r.x + r.width / 2, s.y + 3); await p.waitForTimeout(150); assert.equal(await layer(), 'map', '지도 밖 띠는 땅이 아니다'); }
    assert(await p.evaluate(() => { const l = document.querySelector('.tx-lands'), m = document.querySelector('.tx-map').getBoundingClientRect(), b = l.getBoundingClientRect();
      return getComputedStyle(l).overflow === 'hidden' && Math.abs(b.width - m.width) < 1 && Math.abs(b.height - m.height) < 1 && l.querySelectorAll('.tx-land').length === document.querySelectorAll('.tx-city').length; }), '세력색은 지도 안에서 잘린다'); checks += 5; }
  /* 도구 상자를 연 채 뒤로 가기 — 판만 닫힌다(지도 · 막사 그대로). 닫기 단추로 닫은 뒤의 뒤로 가기는 그대로 이전 화면 */
  await p.click('.tx-tools'); await p.waitForSelector('.tx-sheet'); await p.goBack(); await p.waitForFunction(() => !document.querySelector('.tx-sheet')); assert.equal(await layer(), 'map'); assert.match(p.url(), /index\.html/);
  await p.click('.tx-legend [data-f="' + SHU + '"]'); await p.waitForSelector('.tx-camp'); await p.click('.tx-tools'); await p.waitForSelector('.tx-sheet'); await p.goBack(); await p.waitForFunction(() => !document.querySelector('.tx-sheet')); assert.equal(await layer(), 'camp', '막사에서 판만 닫힌다');
  await p.click('.tx-tools'); await p.waitForSelector('.tx-sheet'); await p.click('.tx-sheet .tx-close'); await p.waitForFunction(() => !document.querySelector('.tx-sheet')); assert.equal(await layer(), 'camp');
  await p.goBack(); await p.waitForSelector('.tx-city'); assert.equal(await layer(), 'map', '닫기 뒤 뒤로 가기는 지도'); checks += 5;
  /* 막사 → 장수 → 크게 보기 닫기 → 「‹ 지도」(막사) → 뒤로(지도). 도감에서 확인하고 돌아오면 막사 · 지도의 「새 그림」 점이 꺼지고, 더 늦은 등록이면 다시 켜진다 */
  { const STY = J('data/style.json').default, lastOf = n => C.lastAdded(IMGDOC.img[n], IMGDOC.added);
    const inDef = n => design.vocab.worlds.some(w => ((((IMGDOC.img[n] || {}).byStyle || {})[STY] || {}).byForm || {})[w]);
    const cand = design.generals.map(g => g.key).filter(n => lastOf(n) && inDef(n)).sort((a, b) => lastOf(a) < lastOf(b) ? 1 : -1)[0];
    if (cand) { const day = lastOf(cand), f = C.factionOf(doc, 'mx', cand), face = '.tx-face[data-name="' + cand + '"]', dot = '.tx-legend [data-f="' + f + '"]';
      const others = C.members(doc, 'mx', f).some(m => m.name !== cand && C.isNew(lastOf(m.name), day, ''));
      await p.goto(BASE + '/index.html?era=mx&today=' + day); await p.waitForSelector('.tx-city'); assert.equal(await p.locator(dot).getAttribute('data-new'), '1');
      await p.click(dot); await p.waitForSelector('.tx-camp'); assert.equal(await p.locator(face).getAttribute('data-new'), '1');
      await p.locator(face).click(); await p.waitForSelector('.lightbox'); await p.click('.lightbox .bar button:last-child'); await p.waitForFunction(() => !document.querySelector('.lightbox'));
      assert.equal(await qs('card'), null, '크게 보기를 닫으면 주소에서 card 를 지운다');
      await p.click('.dx-back'); await p.waitForSelector('.tx-camp'); assert.equal(await qs('f'), f, '「‹ 지도」 — 넘어온 막사로 돌아간다');
      assert.equal(await p.locator(face).getAttribute('data-new'), '0', '확인하고 돌아오면 막사의 점이 꺼진다');
      await p.goBack(); await p.waitForSelector('.tx-city'); assert.equal(await layer(), 'map', '막사 → 장수 → 닫기 → 막사 → 지도');
      assert.equal(await p.locator(dot).getAttribute('data-new'), others ? '1' : '0', '지도의 점');
      /* 더 늦은 등록 — 확인한 날짜가 그 전날이면 다시 켜진다 · 되살린 화면(pageshow)에서 다시 셈한다 */
      const before = new Date(Date.parse(day + 'T00:00:00Z') - 864e5).toISOString().slice(0, 10);
      await p.evaluate(([n, d]) => { const m = JSON.parse(localStorage.getItem('samguk_seen_v1')); m[n] = d; localStorage.setItem('samguk_seen_v1', JSON.stringify(m)); dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); }, [cand, before]);
      await p.waitForFunction(s => document.querySelector(s).dataset.new === '1', dot); await p.click(dot); await p.waitForSelector('.tx-camp');
      assert.equal(await p.locator(face).getAttribute('data-new'), '1', '더 늦은 등록이면 표지가 다시 켜진다'); checks += 8; } }
  assert(await fits(p)); assert.deepEqual(errors, []);
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
    await v.p.click('.tx-eras [data-era="w194"]'); await v.p.waitForFunction(() => document.querySelector('.tx-when'));   /* 판도 설명은 지도 밖 막대에 — 지도 위에 겹치지 않는다 */
    { const wy = await v.p.locator('.tx-when').boundingBox(), m = await v.p.locator('.tx-map').boundingBox(); assert(wy.y + wy.height <= m.y + 1, 'PC — 판도 설명이 지도 위에 겹친다'); }
    assert.deepEqual(v.errors, []); await v.ctx.close(); checks += 3; }
  /* 바탕 그림을 받으면 .tx-map 의 배경이 그 주소(그림은 가짜로 내준다) — 고른 세계 · 공간의 밝기 판 */
  { const v = await open({ width: 344, height: 882 }, true), PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    await v.ctx.route('**/backgrounds/tianxia/**', r => r.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
    await v.p.goto(BASE + '/index.html?era=mx&w=fantasy'); await v.p.waitForSelector('.tx-map[data-art="1"]');
    const tone = await v.p.evaluate(() => document.documentElement.dataset.tone);
    assert.match(await v.p.locator('.tx-map').evaluate(e => e.style.backgroundImage), new RegExp('backgrounds/tianxia/fantasy-' + tone + '\\.webp'), '바탕 그림 주소');
    assert.equal(await v.p.locator('.tx-map .tx-terrain').count(), 0, '그림이 오면 임시 바탕은 없다');
    await v.p.click('.tx-worlds [data-w="mecha"]'); await v.p.waitForFunction(() => /tianxia\/mecha-/.test(document.querySelector('.tx-map').style.backgroundImage));
    assert.deepEqual(v.errors, []); await v.ctx.close(); checks += 3; }

  await br.close(); server.close();
  console.log('PASS 천하 지도 화면: 판도 다섯 · 세계 셋 · 성 ' + T.cities.length + ' · 범례(떠도는 세력 · 새 그림 점) · 확대 · 기억 · 옛 주소 · 도구 상자 · 폰 · PC — ' + checks + '가지');
})().catch(e => { console.error(e); server.close(); process.exit(1); });

/* 새 판(draft2) 브라우저 검사 — 한 판을 처음부터 결과까지 자동으로 둔다(세계 하나 · 「그림 있는 장수만」 · 하수, ?fast=1).
   폰 판은 처음 설정 그대로(3인 · 군웅록 — 기본값인지도 본다), PC 판은 2인 · 본편 네 진영으로 고른다.
   폰(390×844) — 그림을 그림 저장소 대신 이 기기의 사본(../sam-atelier-img/img 또는 IMG_DIR)에서 받아 카드에 그림이 오르는지,
   PC(1280×800) — 그림 주소를 막아 도장 글자 카드로 떨어지는지 · 중간에 새로 고쳐 이어하기. 두 번 다 페이지 오류 0 · 결과 화면까지.
   Phaser 는 CDN(jsdelivr) 주소를 이 기기의 같은 판(PHASER_JS 또는 node_modules 의 phaser@4.2.1)으로 돌린다 — 바깥은 다 막는다.
   SHOT_DIR 을 주면 세계 고르기 · 지명 중 화면을 남긴다.
   Run: PHASER_JS=<phaser.min.js> [IMG_DIR=<그림 폴더>] [SHOT_DIR=<폴더>] node tests/draft2-screen.cjs   (PORT 기본 8790) */
'use strict';
const assert = require('node:assert/strict'), http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), PORT = +(process.env.PORT || 8790), BASE = 'http://127.0.0.1:' + PORT;
const PHASER_URL = 'https://cdn.jsdelivr.net/npm/phaser@4.2.1/dist/phaser.min.js';
const IMG_URL = 'https://polos0117.github.io/sam-atelier-img/img/';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png' };

function phaserFile() {
  const c = [process.env.PHASER_JS];
  try { c.push(require.resolve('phaser/dist/phaser.min.js')); } catch (e) {}
  const f = c.find(p => p && fs.existsSync(p));
  if (!f) { console.error('phaser@4.2.1 의 dist/phaser.min.js 가 필요하다 — PHASER_JS=<경로> (npm pack phaser@4.2.1 로 받을 수 있다)'); process.exit(2); }
  const src = fs.readFileSync(f, 'utf8');
  assert(/4\.2\.1/.test(src.slice(0, 4000)) || /VERSION:"4\.2\.1"/.test(src), 'phaser 판이 4.2.1 이 아니다 — ' + f);
  return src;
}
const PHASER = phaserFile();
const IMG_DIR = process.env.IMG_DIR || path.join(ROOT, '..', 'sam-atelier-img', 'img');
const SHOT = process.env.SHOT_DIR;

const server = http.createServer((q, s) => {
  const p = decodeURIComponent(new URL(q.url, BASE).pathname), file = path.join(ROOT, p === '/' ? 'draft2.html' : p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(s);
});

async function open(br, viewport, withArt) {
  const ctx = await br.newContext({ viewport });
  let served = 0;
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => {
    const u = r.request().url();
    if (u.split('?')[0] === PHASER_URL) return r.fulfill({ status: 200, contentType: 'text/javascript', body: PHASER });
    if (withArt && u.startsWith(IMG_URL)) {
      const rel = decodeURIComponent(u.slice(IMG_URL.length).split('?')[0]), f = path.join(IMG_DIR, rel);
      if (f.startsWith(IMG_DIR) && fs.existsSync(f)) { served++; return r.fulfill({ status: 200, contentType: 'image/webp', headers: { 'access-control-allow-origin': '*' }, body: fs.readFileSync(f) }); }
    }
    return r.abort();
  });
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  return { ctx, page, errors, served: () => served };
}
const sceneIs = (page, k, t) => page.waitForFunction(k => window.D2 && window.D2.scene() === k, k, { timeout: t || 15000 });
async function tap(page, id) {
  const h = await page.waitForFunction(id => { const x = window.D2 && window.D2.hits().find(h => h.id === id && !h.disabled); return x || null; }, id, { timeout: 10000 });
  const r = await h.jsonValue();
  await page.mouse.click(r.x + r.w / 2, r.y + r.h / 2);
}
/* 아군 차례면 고를 수 있는 카드 하나 → 「지명」. 편성이 오면 멈춘다 */
async function playDraft(page, limit) {
  let picks = 0;
  while (picks < (limit || 99)) {
    const s = await page.waitForFunction(() => {
      const k = window.D2.scene();
      if (k !== 'Draft') return k;
      return window.D2.myTurn() && window.D2.hits().some(h => h.id.startsWith('card:') && h.legal) ? 'me' : null;
    }, null, { timeout: 20000 }).then(h => h.jsonValue());
    if (s !== 'me') return { picks, scene: s };
    const cards = await page.evaluate(() => window.D2.hits().filter(h => h.id.startsWith('card:') && h.legal));
    const c = cards[picks % cards.length];
    await page.mouse.click(c.x + c.w / 2, c.y + c.h / 2);
    await page.waitForFunction(id => { const p = window.D2.hits().find(h => h.id === 'pick'); return p && !p.disabled; }, c.id, { timeout: 5000 });
    const before = await page.evaluate(() => window.D2.state().mine.length);
    await tap(page, 'pick');
    await page.waitForFunction(n => window.D2.state().mine.length === n + 1, before, { timeout: 5000 });
    picks++;
  }
  return { picks, scene: await page.evaluate(() => window.D2.scene()) };
}
async function finish(page, shot) {
  await sceneIs(page, 'Lineup', 20000);
  if (shot) { await page.waitForTimeout(300); await page.screenshot({ path: shot + '-lineup.png' }); }
  const st = await page.evaluate(() => window.D2.state());
  assert.equal(st.phase, 'lineup');
  for (const s of st.seats) assert.equal((s === 'me' ? st.mine : st[s]).length, 13, s + ' 13명');
  await tap(page, 'confirm');
  await sceneIs(page, 'Result');
  if (shot) { await page.waitForTimeout(300); await page.screenshot({ path: shot + '-result.png' }); }
  const res = await page.evaluate(() => window.D2.state().result);
  assert.equal(res.mine.length, 11); assert.equal(res.foe.length, 11);
  assert.equal(typeof res.me.total, 'number'); assert(res.me.rows.length > 2, '채점 줄');
  assert.equal(res.sides.length, st.seats.length); assert(res.sides.every(x => x.team.length === 11 && x.rank >= 1 && x.rank <= st.seats.length), '순위');
  await tap(page, 'score');
  await page.waitForSelector('.d2-sheet .d2-score');
  assert.equal(await page.locator('.d2-sheet .d2-score').count(), st.seats.length, '채점표 — 자리마다');
  assert(await page.locator('.d2-sheet .d2-score .d2-fac').count() > 0, '채점표 결속 줄에 세력색');
  if (shot) { await page.waitForTimeout(250); await page.screenshot({ path: shot + '-score.png' }); }
  await page.click('.d2-x');
  assert.equal(await page.locator('.d2-veil').count(), 0, '창 닫힘');
  assert.equal(await page.evaluate(() => { try { return localStorage.getItem('samguk_draft2_game_v1'); } catch (e) { return 'x'; } }), null, '끝난 판은 이어하기에서 지운다');
  return res;
}

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const br = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  let checks = 0;
  try {
    /* ── 폰 · 그림 사본 ── */
    {
      const art = fs.existsSync(IMG_DIR);
      const { ctx, page, errors, served } = await open(br, { width: 390, height: 844 }, art);
      await page.goto(BASE + '/draft2.html?fast=1');
      await sceneIs(page, 'Title', 20000);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, '옆으로 넘치지 않음');
      await tap(page, 'new'); await sceneIs(page, 'Setup');
      const on = await page.evaluate(() => window.D2.hits().filter(h => /^(players|fmode):/.test(h.id)).map(h => h.id));
      assert.deepEqual(on.sort(), ['fmode:base', 'fmode:end263', 'fmode:gd200', 'fmode:jb208', 'fmode:mx', 'fmode:w194', 'players:2', 'players:3'], '인원 · 천하 고르개');
      const offscreen = await page.evaluate(() => window.D2.hits().filter(h => h.y + h.h > innerHeight + 0.5).map(h => h.id));
      assert.deepEqual(offscreen, [], '설정 — 화면 밖 단추');
      for (const id of ['world:samguk', 'scope:art', 'lv:0']) await tap(page, id);
      const cfg = await page.evaluate(() => JSON.parse(localStorage.getItem('samguk_draft2_cfg_v1')));
      assert.deepEqual([cfg.world, cfg.scope, cfg.lv, cfg.daily, cfg.players, cfg.fmode], ['samguk', 'art', 0, false, 3, 'mx'], '설정 저장 · 처음은 3인 · 군웅록');
      if (art) await page.waitForFunction(() => window.D2.art().ok >= 3, null, { timeout: 15000 });
      await page.waitForTimeout(400);
      if (SHOT) await page.screenshot({ path: path.join(SHOT, 'draft2-setup-390.png') });
      await tap(page, 'start'); await sceneIs(page, 'Draft');
      const st0 = await page.evaluate(() => window.D2.state());
      assert.equal(st0.world, 'samguk'); assert.equal(st0.lv, 0); assert.equal(st0.pack.length, 6);
      assert.equal(st0.players, 3); assert.equal(st0.fmode, 'mx'); assert.deepEqual(st0.seats, ['me', 'foe', 'foe2']);
      assert(st0.pool.length + 6 <= 60, '그림 있는 장수만 — ' + (st0.pool.length + 6));
      const first = await playDraft(page, 2);
      assert.equal(first.picks, 2);
      if (art) await page.waitForFunction(() => window.D2.art().ok >= 12, null, { timeout: 15000 });
      await page.waitForFunction(() => window.D2.myTurn(), null, { timeout: 10000 });
      /* 휴대폰 세로 — 진영 칸 셋(13칸씩)과 후보 여섯 · 아래 줄이 다 화면 안 */
      const inView = await page.evaluate(() => { const hs = window.D2.hits(); return { n: hs.length, out: hs.filter(h => h.x < 0 || h.y < 0 || h.x + h.w > innerWidth + 0.5 || h.y + h.h > innerHeight + 0.5).map(h => h.id), foe2: hs.filter(h => h.id.startsWith('foe2:')).length, cards: hs.filter(h => h.id.startsWith('card:')).length }; });
      assert.deepEqual(inView.out, [], '화면 밖 — ' + inView.out.join(', '));
      assert.equal(inView.cards, 6); assert(inView.foe2 >= 1, '적장2 칸');
      assert.equal(await page.evaluate(() => window.D2.state().aiFac.foe2), '군웅', '둘째 적장은 군웅 기치');
      await page.waitForTimeout(500);
      if (SHOT) await page.screenshot({ path: path.join(SHOT, 'draft2-draft-390.png') });
      /* 결의 창 · 열전 창 */
      await tap(page, 'pledges'); await page.waitForSelector('.d2-sheet .d2-pl, .d2-sheet .d2-dim'); await page.keyboard.press('Escape');
      assert.equal(await page.locator('.d2-veil').count(), 0, 'Esc 로 닫힘');
      await tap(page, 'me:0'); await page.waitForSelector('.d2-sheet .d2-stats'); await page.click('.d2-x');
      const rest = await playDraft(page);
      assert.equal(rest.scene, 'Lineup', '13진 뒤 편성 — ' + rest.scene);
      await finish(page, SHOT && path.join(SHOT, 'draft2-390'));
      if (art) assert(served() > 0 && (await page.evaluate(() => window.D2.art().ok)) > 0, '그림이 카드에 올랐다');
      assert.deepEqual(errors, [], '폰 — 페이지 오류');
      console.log('폰 390 — 3인 · 군웅록(기본) 결과까지, 그림', art ? (await page.evaluate(() => window.D2.art().ok)) + '장' : '사본 없음(건너뜀)');
      await ctx.close(); checks++;
    }
    /* ── PC · 그림 막힘 → 도장 카드, 중간에 새로 고쳐 이어하기 ── */
    {
      const { ctx, page, errors } = await open(br, { width: 1280, height: 800 }, false);
      await page.goto(BASE + '/draft2.html?fast=1');
      await sceneIs(page, 'Title', 20000);
      assert.equal(await page.evaluate(() => window.D2.hits().some(h => h.id === 'resume')), false, '처음엔 이어하기 없음');
      await tap(page, 'new'); await sceneIs(page, 'Setup');
      const tx = await page.evaluate(() => window.D2.hits().filter(h => h.id.startsWith('fmode:')).map(h => h.id));
      assert.deepEqual(tx, ['fmode:mx', 'fmode:w194', 'fmode:gd200', 'fmode:jb208', 'fmode:end263', 'fmode:base'], '천하 고르개 여섯');
      for (const id of ['world:fantasy', 'scope:art', 'lv:0', 'players:2', 'fmode:base']) await tap(page, id);
      await tap(page, 'start'); await sceneIs(page, 'Draft');
      const s2 = await page.evaluate(() => window.D2.state());
      assert.deepEqual([s2.players, s2.fmode, s2.foe2], [2, 'base', null], '2인 · 본편으로 고르면 그대로');
      const a = await playDraft(page, 3);
      assert.equal(a.picks, 3);
      const mid = await page.evaluate(() => window.D2.state());
      await page.reload(); await sceneIs(page, 'Title', 20000);
      await tap(page, 'resume'); await sceneIs(page, 'Draft');
      const back = await page.evaluate(() => window.D2.state());
      assert.deepEqual(back.mine.slice(0, mid.mine.length), mid.mine, '이어하기 — 지명한 장수 그대로');
      assert.equal(back.world, 'fantasy');
      await page.waitForFunction(() => window.D2.myTurn(), null, { timeout: 10000 }); await page.waitForTimeout(400);
      if (SHOT) await page.screenshot({ path: path.join(SHOT, 'draft2-draft-1280-seal.png') });
      /* 창 크기를 바꿔도 다시 그린다(가로 폰 크기) */
      await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(500);
      const hs = await page.evaluate(() => window.D2.hits().filter(h => h.id.startsWith('card:')));
      assert(hs.length === 6 && hs.every(h => h.x >= 0 && h.y >= 0 && h.x + h.w <= 844 && h.y + h.h <= 390), '가로 폰 — 후보 여섯이 화면 안');
      await page.setViewportSize({ width: 1280, height: 800 }); await page.waitForTimeout(300);
      const rest = await playDraft(page);
      assert.equal(rest.scene, 'Lineup');
      await finish(page);
      const ac = await page.evaluate(() => window.D2.art());
      assert.equal(ac.ok, 0, '그림 주소를 막았으니 받은 그림 없음'); assert(ac.fail > 0, '받지 못한 그림 → 도장 카드');
      assert.deepEqual(errors, [], 'PC — 페이지 오류');
      console.log('PC 1280 — 2인 · 본편, 그림 막힘 → 도장 카드 ' + ac.fail + '장, 이어하기, 결과까지');
      await ctx.close(); checks++;
    }
  } finally { await br.close(); server.close(); }
  console.log('draft2-screen ok —', checks, '판');
})().catch(e => { console.error(e); server.close(); process.exit(1); });

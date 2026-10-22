/* 도트 무장 — 군막 바닥 띠 · 인물 확대(도감)의 작은 무대 (data/sprites.json · lib/sprite-actor.js).
   도트 자료는 시험 자료(유비·관우)를 길로 바꿔 주고, 그림은 tests/fixtures/make-sprites.py 가 임시 자리에 그린다.
   - 군막: 도트가 있으면 머리 밑에 바닥 띠(좁으면 둘), 거닌다, 누르면 그 인물 확대가 열리고 거기에도 작은 무대
   - 확대: 도트를 누르면 반응만(창은 그대로), 바깥을 누르면 닫히고 무대도 치운다 · 도감의 초상으로 연 확대도 같다 · 도트 없는 인물은 무대가 없다
   - 도트 자료가 비면 띠째 없다(판은 그대로)
   CHROMIUM_PATH=<chrome> NODE_PATH=<playwright 가 있는 node_modules> node tests/dot-screen.cjs   (SAM_PORT, 기본 8781) */
const assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path'), http = require('node:http');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), PORT = +(process.env.SAM_PORT || 8781), BASE = 'http://127.0.0.1:' + PORT;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json' };
const actor = (card, id) => ({ card, id, form: 'base', cell: [96, 128], foot: [48, 126], scale: 1, flip: true, facing: 'right', states: {
  still: { file: id + '/' + id + '_base_still.png', frames: 1 },
  idle: { file: id + '/' + id + '_base_idle.png', frames: 4, order: [0, 1, 2, 3], ms: [300, 200, 140, 200] },
  walk: { file: id + '/' + id + '_base_walk.png', frames: 6, order: [0, 1, 2, 3, 4, 5], ms: [120, 120, 120, 120, 120, 120], speed: 60, dy: [0, 1, -1, 0, 1, -1] },
  react: { file: id + '/' + id + '_base_react.png', frames: 4, order: [0, 1, 2, 3], ms: [100, 120, 160, 120] } } });
const SPRITES = { base: 'https://polos0117.github.io/sam-atelier/sprites/', actors: { liubei: actor('유비', 'liubei'), guanyu: actor('관우', 'guanyu') } };
const art = fs.mkdtempSync(path.join(os.tmpdir(), 'sam-dot-'));
fs.writeFileSync(path.join(art, 'sprites.json'), JSON.stringify(SPRITES));
execFileSync('python3', [path.join(__dirname, 'fixtures', 'make-sprites.py'), path.join(art, 'sprites.json'), art]);
const wait = ms => new Promise(ok => setTimeout(ok, ms));
const server = http.createServer((q, s) => {
  const p = decodeURIComponent(new URL(q.url, BASE).pathname), f = path.resolve(ROOT, '.' + (p === '/' ? '/index.html' : p));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(s);
});

(async () => {
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  const br = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
  async function open(data, size = { width: 390, height: 844 }) {
    const ctx = await br.newContext({ viewport: size });
    await ctx.route('**/*', r => {
      const u = new URL(r.request().url());
      if (u.origin === BASE && u.pathname === '/data/sprites.json') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
      if (u.origin === BASE) return r.continue();
      const m = u.origin === 'https://polos0117.github.io' && u.pathname.match(/^\/sam-atelier\/(sprites\/.+)$/);
      if (m) { const f = path.join(art, decodeURIComponent(m[1])); return fs.existsSync(f) ? r.fulfill({ status: 200, contentType: 'image/png', body: fs.readFileSync(f) }) : r.fulfill({ status: 404 }); }
      return r.abort();
    });
    const p = await ctx.newPage(), errors = [];
    p.on('pageerror', e => errors.push(String(e)));
    await p.goto(BASE + '/');
    /* 처음 오면 새 대국 창이 덮는다(뒤 화면은 잠긴다) — 대국을 열고 본다 */
    if (await p.locator('#setup.on').count()) { await p.click('#setupGo'); await p.waitForSelector('#setup:not(.on)', { state: 'attached' }); await p.waitForFunction(() => !document.getElementById('app').inert); }
    return { ctx, p, errors };
  }
  let n = 0;
  try {
    /* 군막 바닥 */
    let { ctx, p, errors } = await open(SPRITES);
    await p.waitForSelector('#samDots:not([hidden]) .sprite-actor:not([hidden])', { timeout: 10000 });
    assert.equal(await p.locator('#samDots .sprite-actor').count(), 2, '좁으면 둘');
    assert(await p.evaluate(() => { const t = document.querySelector('.top').getBoundingClientRect(), f = document.getElementById('samDots').getBoundingClientRect(); return f.top >= t.bottom - 1; }), '머리 밑');
    await p.waitForFunction(() => [...document.querySelectorAll('#samDots .sprite-actor')].some(a => a.sprite.debug().state === 'walk'), null, { timeout: 10000 });
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, '옆으로 넘치지 않는다');
    n += 2;
    /* 누르면 그 인물 확대 + 작은 무대 */
    const who = await p.locator('#samDots .sprite-actor').first().getAttribute('data-who');
    await p.locator('#samDots .sprite-actor').first().click({ force: true });
    await p.waitForSelector('#zoom.on');
    assert.equal(await p.textContent('#zn'), who, '누른 인물의 확대');
    await p.waitForSelector('#zdot:not([hidden]) .sprite-actor:not([hidden])', { timeout: 8000 });
    await p.locator('#zdot .sprite-actor').click();
    assert.equal(await p.locator('#zoom.on').count(), 1, '도트를 누르면 창은 그대로');
    await p.locator('#zoom').click({ position: { x: 10, y: 10 } });
    await p.waitForSelector('#zoom:not(.on)', { state: 'attached' });
    assert.equal(await p.locator('#zdot .sprite-actor').count(), 0, '닫으면 무대를 치운다');
    n += 2;
    /* 도감의 초상으로 연 확대 — 도트 있는 인물·없는 인물 */
    await p.click('#dexBtn'); await p.waitForSelector('#dex.on');
    await p.locator('#dexList .dx', { has: p.locator('.nm3', { hasText: /^관우$/ }) }).locator('.avbtn').click();
    await p.waitForSelector('#zdot:not([hidden]) .sprite-actor:not([hidden])', { timeout: 8000 });
    assert.match(await p.locator('#zdot .sprite-actor').getAttribute('aria-label'), /관우 도트/);
    await p.locator('#zoom').click({ position: { x: 10, y: 10 } }); await p.waitForSelector('#zoom:not(.on)', { state: 'attached' });
    await p.locator('#dexList .dx', { has: p.locator('.nm3', { hasText: /^장비$/ }) }).locator('.avbtn').click();
    await p.waitForSelector('#zoom.on'); await wait(800);
    assert.equal(await p.locator('#zdot').isHidden(), true, '도트 없는 인물은 무대가 없다');
    assert.deepEqual(errors, []);
    await ctx.close();
    n += 2;
    /* 자료가 비면 띠째 없다 */
    ({ ctx, p, errors } = await open({ base: SPRITES.base, actors: {} }));
    await p.waitForSelector('#board'); await wait(900);
    assert.equal(await p.locator('#samDots').isHidden(), true, '도트 자료가 비면 띠째 없다');
    assert.deepEqual(errors, []);
    await ctx.close();
    n++;
    console.log('PASS 도트 무장: ' + n + '가지 · 군막 바닥 띠(좁으면 둘·머리 밑·넘치지 않는다) · 누르면 인물 확대 + 작은 무대(눌러도 창은 그대로·닫으면 치운다) · 도감 초상의 확대 · 없는 인물 · 자료 없음');
  } finally { await br.close(); server.close(); fs.rmSync(art, { recursive: true, force: true }); }
})().catch(e => { console.error(e); process.exit(1); });

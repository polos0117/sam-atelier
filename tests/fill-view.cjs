/* 크게 보기 「꽉 채우기」 · 휴대폰 가로(2026-11-24, lib/fill-view.js) — 화면 검사. 삼국지 · 원소 · 도시 · 포켓몬 공방이 같은 몸통을 쓰고 맨 아래 VIEW(어떻게 여나 · 무엇을 숨기나)만 다르다.
   · 폰 세로 390×844(터치): 1:1 그림이면 「꽉 채우기」 단추 → 누르면 그림 높이 = 칸 높이 · 옆으로 구른다 · 가운데부터 · 옆으로 밀어도 그림이 안 바뀐다 → 단추 · 두 번 누르기로 맞춤.
     맞춤에선 밀면 넘어간다 · 꽉 채운 채 → 로 넘기면 맞춤으로. 2:3 그림이면 단추 없음.
   · PC 1280×800: 1:1 이어도 단추 없음.
   · 폰 가로 844×390(터치): 그림만 화면 가득(높이 ≈ 화면 높이 − 둘레), 위 줄 · 아래 막대는 숨고 닫기만 — 닫힌다.
   그림은 SVG 로 대신한다(FILL_IMG_DIR 에 img-1x1.webp · img-2x3.webp 가 있으면 그것). SHOT_DIR 를 주면 <공방>-fit · -fill · -landscape.png 를 찍는다.
   Run: ESM_DIR=<preact 가 든 node_modules> node tests/fill-view.cjs   (PORT 로 자리 바꾸기, 기본 8899. ESM_DIR 이 없으면 esm.sh 에서 받는다) */
const assert = require('node:assert/strict'), http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), PORT = +(process.env.PORT || 8899), BASE = 'http://127.0.0.1:' + PORT;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.md': 'text/markdown', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((q, s) => {
  const p = decodeURIComponent(new URL(q.url, BASE).pathname), file = path.join(ROOT, p === '/' ? 'index.html' : p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(s);
});
const ESM = { 'https://esm.sh/preact@10.24.3': 'preact/dist/preact.mjs', 'https://esm.sh/preact@10.24.3/hooks': 'preact/hooks/dist/hooks.mjs', 'https://esm.sh/htm@3.1.1': 'htm/dist/htm.mjs',
  'https://cdn.jsdelivr.net/npm/pixi.js@8.19.0/dist/pixi.min.mjs': 'pixi.js/dist/pixi.min.mjs' };   /* 홀로(원소 · 포켓몬) — ESM_DIR 에 pixi 가 있으면 켠 채로 본다 */
const RATIO = { '1x1': [1024, 1024], '2x3': [1024, 1536], '3x2': [1536, 1024] };
let n = 0;
const svg = (r, i) => { const [w, h] = RATIO[r], c = ['#6a8', '#a86', '#68a', '#a6a'][i % 4];
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><rect width="100%" height="100%" fill="' + c + '"/><circle cx="' + w / 2 + '" cy="' + h / 2 + '" r="' + Math.min(w, h) / 3 + '" fill="#fff8"/><rect x="0" y="0" width="' + w / 10 + '" height="' + h + '" fill="#0004"/><rect x="' + w * 0.9 + '" y="0" width="' + w / 10 + '" height="' + h + '" fill="#0004"/></svg>'; };
const real = r => process.env.FILL_IMG_DIR && path.join(process.env.FILL_IMG_DIR, 'img-' + r + '.webp');

async function context(br, ratio, opt) {
  const ctx = await br.newContext(opt); let k = 0;
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => {
    const u = r.request().url(), file = process.env.ESM_DIR && ESM[u.split('?')[0]];
    if (file && fs.existsSync(path.join(process.env.ESM_DIR, file)))
      return r.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(process.env.ESM_DIR, file), 'utf8').replace(/from"preact"/g, 'from"https://esm.sh/preact@10.24.3"') });
    if (/^https:\/\/esm\.sh\//.test(u)) return r.continue();
    if (/\.(webp|png|jpe?g)(\?.*)?$/i.test(u)) { const f = real(ratio);
      return f && fs.existsSync(f) ? r.fulfill({ contentType: 'image/webp', headers: { 'Access-Control-Allow-Origin': '*' }, body: fs.readFileSync(f) })
        : r.fulfill({ contentType: 'image/svg+xml', headers: { 'Access-Control-Allow-Origin': '*' }, body: svg(ratio, k++) }); }
    return r.abort();
  });
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  return { ctx, page, errors };
}
const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 };
const LAND = { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 };
const DESK = { viewport: { width: 1280, height: 800 } };
const shot = async (page, name) => { if (process.env.SHOT_DIR) await page.screenshot({ path: path.join(process.env.SHOT_DIR, VIEW.name + '-' + name + '.png') }); };
const loaded = page => page.waitForFunction(sel => { const i = document.querySelector(sel); return i && i.complete && i.naturalWidth > 0; }, VIEW.img, { timeout: 15000 });
const src = page => page.locator(VIEW.img).first().getAttribute('src');
const settle = page => page.waitForTimeout(350);
async function swipe(page, x0, x1, y) {
  const c = await page.context().newCDPSession(page);
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });
  for (let i = 1; i <= 10; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / 10, y }] }); await page.waitForTimeout(16); }
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await c.detach();
}
async function doubleTap(page) {
  const b = await page.locator(VIEW.img).first().boundingBox(), x = b.x + b.width / 2, y = b.y + b.height / 2;
  await page.touchscreen.tap(x, y); await page.waitForTimeout(90); await page.touchscreen.tap(x, y);
}
/* 맞춤 보기에서 그림이 받을 수 있는 높이 — lib/fill-view.js fitBox 와 같은 셈 */
const fitH = page => page.evaluate(([st, im]) => { const s = document.querySelector(st), i = document.querySelector(im), mh = getComputedStyle(i).maxHeight, sc = getComputedStyle(s);
  return /px$/.test(mh) ? parseFloat(mh) : s.clientHeight - parseFloat(sc.paddingTop) - parseFloat(sc.paddingBottom); }, [VIEW.stage, VIEW.img]);
const fillState = page => page.evaluate(im => { const sc = document.querySelector('.fill-scroll'), i = document.querySelector(im); if (!sc) return null;
  const r = i.getBoundingClientRect(); return { h: r.height, w: r.width, ch: sc.clientHeight, cw: sc.clientWidth, sw: sc.scrollWidth, sl: sc.scrollLeft }; }, VIEW.img);

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const br = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  try {
    /* ① 폰 세로 · 1:1 */
    { const { page, errors } = await context(br, '1x1', PHONE);
      await VIEW.open(page); await loaded(page); await settle(page);
      const btn = page.locator('.fill-toggle');
      await btn.waitFor({ timeout: 5000 });
      assert.equal(await btn.getAttribute('aria-pressed'), 'false'); assert.match(await btn.textContent(), /꽉 채우기/);
      const bb = await btn.boundingBox(); assert(bb.height >= 44, '단추 높이 44 이상 ' + bb.height); n += 3;
      /* 맞춤 보기에서 보이는 그림 크기 — object-fit: contain 이면 칸 안에 든 몫 */
      const fit = await page.evaluate(im => { const i = document.querySelector(im), r = i.getBoundingClientRect();
        if (getComputedStyle(i).objectFit !== 'contain') return { width: r.width, height: r.height };
        const k = Math.min(r.width / i.naturalWidth, r.height / i.naturalHeight); return { width: i.naturalWidth * k, height: i.naturalHeight * k }; }, VIEW.img), want = await fitH(page);
      await shot(page, 'fit');
      const s0 = await src(page), holo = await page.locator('canvas.holo-layer').count();   /* 홀로(원소 · 포켓몬, pixi 가 있을 때) */
      await btn.click(); await page.waitForSelector('.fill-scroll img'); await loaded(page); await settle(page);
      assert.equal(await btn.getAttribute('aria-pressed'), 'true'); assert.match(await btn.textContent(), /맞춰 보기/);
      let f = await fillState(page);
      assert(Math.abs(f.h - want) <= 2 && Math.abs(f.ch - want) <= 2, '그림 높이 = 칸 높이 ' + JSON.stringify(f) + ' / ' + want);
      assert(f.h > fit.height * 1.3, '맞춤보다 뚜렷이 크다 ' + f.h + ' > ' + fit.height);
      assert(f.sw > f.cw + 10, '옆으로 구른다 ' + f.sw + ' > ' + f.cw);
      assert(Math.abs(f.sl - (f.sw - f.cw) / 2) <= 3, '가운데부터 ' + f.sl);
      assert.equal(await src(page), s0, '같은 그림'); n += 6;
      if (holo) { assert.equal(await page.locator('canvas.holo-layer').count(), 0, '꽉 채우기 동안 홀로는 쉰다'); n++; }
      await shot(page, 'fill');
      /* 옆으로 밀면 그림이 굴러가고 다음 장으로 안 넘어간다 */
      const y = f.h > 0 ? (await page.locator('.fill-scroll').boundingBox()).y + f.ch / 2 : 400;
      await swipe(page, 300, 80, y); await settle(page);
      assert.equal(await src(page), s0, '꽉 채운 채 밀어도 그림은 그대로');
      assert.equal(await btn.getAttribute('aria-pressed'), 'true', '밀어도 꽉 채우기 그대로');
      const f2 = await fillState(page); assert(f2.sl > f.sl + 20, '밀면 옆으로 구른다 ' + f.sl + ' → ' + f2.sl); n += 3;
      /* 단추로 맞춤 */
      await btn.click(); await page.waitForSelector('.fill-scroll', { state: 'detached' });
      assert.equal(await btn.getAttribute('aria-pressed'), 'false'); n++;
      if (holo) { await page.locator('canvas.holo-layer').waitFor({ timeout: 10000 }); n++; }   /* 맞춤으로 오면 홀로가 다시 */
      /* 두 번 누르기로 펴고 · 접고 */
      await loaded(page); await settle(page);
      await doubleTap(page); await page.waitForSelector('.fill-scroll img', { timeout: 3000 });
      assert.equal(await btn.getAttribute('aria-pressed'), 'true', '두 번 누르면 꽉 채우기'); await settle(page);
      await doubleTap(page); await page.waitForSelector('.fill-scroll', { state: 'detached', timeout: 3000 });
      assert.equal(await page.locator(VIEW.root).count(), 1, '두 번 누르기는 크게 보기를 닫지 않는다');
      if (VIEW.afterDouble) await VIEW.afterDouble(page);
      n += 2;
      if (VIEW.steps) {
        /* 맞춤에선 밀면 넘어간다(그대로) */
        await loaded(page); await settle(page);
        await swipe(page, 320, 60, 420); await page.waitForFunction(([sel, s]) => document.querySelector(sel).getAttribute('src') !== s, [VIEW.img, s0], { timeout: 3000 });
        n++;
        /* 꽉 채운 채 → 로 넘기면 맞춤으로 */
        await loaded(page); await settle(page);
        await btn.click(); await page.waitForSelector('.fill-scroll img');
        const s1 = await src(page);
        await page.keyboard.press('ArrowRight'); await page.waitForSelector('.fill-scroll', { state: 'detached', timeout: 3000 });
        assert.notEqual(await src(page), s1, '→ 로 넘어간다'); n++;
      }
      /* 마우스 두 번 누르기도(손가락 뒤 1초 넘게 지나서) */
      await loaded(page); await page.waitForTimeout(1100);
      await page.locator(VIEW.img).first().dblclick(); await page.waitForSelector('.fill-scroll img', { timeout: 3000 });
      await page.waitForTimeout(400); await page.locator(VIEW.img).first().dblclick(); await page.waitForSelector('.fill-scroll', { state: 'detached', timeout: 3000 }); n += 2;
      assert.deepEqual(errors, [], '오류 없음'); n++;
      await page.context().close(); }
    /* ② 폰 세로 · 2:3 — 단추 없음 */
    { const { page, errors } = await context(br, '2x3', PHONE);
      await VIEW.open(page); await loaded(page); await settle(page);
      assert.equal(await page.locator('.fill-toggle').count(), 0, '2:3 은 단추 없음'); assert.deepEqual(errors, []); n += 2;
      await page.context().close(); }
    /* ③ PC · 1:1 — 단추 없음 */
    { const { page, errors } = await context(br, '1x1', DESK);
      await VIEW.open(page); await loaded(page); await settle(page);
      assert.equal(await page.locator('.fill-toggle').count(), 0, 'PC 는 단추 없음'); assert.deepEqual(errors, []); n += 2;
      await page.context().close(); }
    /* ④ 폰 가로 · 1:1 · 3:2 — 그림만 가득, 닫기는 된다 */
    for (const r of ['1x1', '3x2']) {
      const { page, errors } = await context(br, r, LAND);
      await VIEW.open(page); await loaded(page); await settle(page);
      const b = await page.locator(VIEW.img).first().boundingBox();
      assert(b.height >= 390 - 12 - 3, r + ' 가로: 그림 높이 ≈ 화면 높이 ' + b.height);
      assert(b.y >= 0 && b.y + b.height <= 390 + 1 && b.x >= 0 && b.x + b.width <= 844 + 1, r + ' 가로: 화면 안 ' + JSON.stringify(b));
      for (const sel of VIEW.hidden) assert.equal(await page.locator(sel).first().isVisible(), false, r + ' 가로: 숨김 ' + sel);
      assert.equal(await page.locator('.fill-toggle').count(), 0, r + ' 가로: 꽉 채우기 없음');
      const c = page.locator(VIEW.close); assert(await c.isVisible(), '닫기는 보인다'); const cb = await c.boundingBox(); assert(cb.height >= 44 && cb.width >= 44, '닫기 44 ' + JSON.stringify(cb));
      if (r === '1x1') await shot(page, 'landscape');
      await c.click(); await page.waitForSelector(VIEW.root, { state: 'detached', timeout: 3000 });
      assert.deepEqual(errors, [], '오류 없음'); n += 6 + VIEW.hidden.length;
      await page.context().close();
    }
    console.log('fill-view ok ' + n);
  } finally { await br.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });

/* ── 이 공방의 크게 보기 ── 목록 도감에서 첫 세계 그림 칸을 눌러 연다 */
const VIEW = {
  name: 'sam',
  open: async page => { await page.goto(BASE + '/dex.html?faction=wei'); await page.locator('.dx-slots button.dx-slot').first().click(); await page.waitForSelector('.lightbox'); },
  root: '.lightbox', stage: '.lightbox .lb-stage', img: '.lightbox .lb-stage img', close: '.lightbox .lb-close',
  hidden: ['.lightbox .lb-top', '.lightbox .fav-heart'], steps: true,
};

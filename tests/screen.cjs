/* 화면 검사 — 도감 · 생성기를 브라우저로 연다. 폰(390)과 PC(1280). 게임(index.html)은 tests/regression.cjs 가 맡는다 — 여기선 안 연다.
   도감: 세력 넷 · 고른 세력의 장수 수 = 설계표 · 장수마다 세계 셋(빈 칸은 생성기로) · 역할로 바로 가기 · 이름 찾기 · 그림 있는 것만 · 주소 ?faction=&q= · ★ 손 설계.
   생성기: 세력 › 장수 › 갈래 › 단계. 세계 그림은 세계 → … → 다 골랐다 — 지시문이 조립기(lib/prompt-sam.js)와 같고 파일 이름이 <장수>_<세계>_<화풍>_f.webp.
   일상컷은 트리 버전2 — 처음부터 랜덤으로 다 골랐다까지, 시대 넷 · 역사의 자리 장소. 주소 ?card=&o=&world=. 콘솔 오류 없음 · 옆으로 넘치지 않음.
   Run: ESM_DIR=<preact 가 든 node_modules> CHROMIUM_PATH=<chrome> node tests/screen.cjs   (PORT 로 자리 바꾸기, 기본 8796) */
const assert = require('node:assert/strict'), http = require('node:http'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), PORT = +(process.env.PORT || 8796), BASE = 'http://127.0.0.1:' + PORT;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.md': 'text/markdown', '.webp': 'image/webp', '.png': 'image/png' };
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
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/prompt-sam.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx0);
const P = ctx0.window.AtelierPrompt;

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const br = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  let checks = 0;
  const open = async (url, viewport) => {
    const ctx = await br.newContext({ viewport });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => {
      const file = process.env.ESM_DIR && ESM[r.request().url().split('?')[0]];
      if (!file || !fs.existsSync(path.join(process.env.ESM_DIR, file))) return r.abort();
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
    /* ── 도감 ── */
    let v = await open('/dex.html', vp);
    await v.page.waitForSelector('.sam-card');
    assert.equal(await v.page.locator('.dex-pick a').count(), D.factions.length, '세력 넷');
    assert.equal(await v.page.locator('.sam-card').count(), count(D.factions[0].key), '첫 세력의 장수 수');
    const one = v.page.locator('.sam-card').first();
    assert.equal(await one.locator('.worlds.main .slot').count(), 3, '세계 셋');
    assert.match(await one.locator('.worlds.main .slot').first().getAttribute('href'), /^prompt\.html\?card=.+&world=samguk$/, '빈 칸은 생성기로');
    assert.equal(await v.page.locator('.toc-jump .jump').count(), new Set(D.generals.filter(g => g.faction === D.factions[0].key).map(g => g.role)).size, '역할로 바로 가기');
    checks += 4;
    /* 촉 — 관우는 손 설계(★), 찾기 · 주소 */
    await v.page.click('.dex-pick a[href="dex.html?faction=shu"]');
    await v.page.waitForSelector('.sam-card[data-card="관우"]');
    assert.equal(await v.page.locator('.sam-card').count(), count('shu'), '촉 장수 수');
    assert.match(await v.page.locator('.sam-card[data-card="관우"]').textContent(), /손 설계/);
    assert.match(await v.page.locator('.sam-card[data-card="관우"] .stats').textContent(), /무력97/);
    await v.page.fill('#dex-find', 'zhuge');
    assert.equal(await v.page.locator('.sam-card').count(), D.generals.filter(g => g.faction === 'shu' && /zhuge/i.test(g.en)).length, '병음으로 찾기');
    assert.match(v.page.url(), /q=zhuge/);
    await v.page.fill('#dex-find', '');
    await v.page.check('#dex-only');
    const withArt = await v.page.locator('.sam-card').count();
    assert(withArt <= count('shu'), '그림 있는 것만');
    if (!withArt) assert(await v.page.locator('#dex-none').count(), '없으면 알림');
    await v.page.uncheck('#dex-only');
    await noOverflow(v.page, vp.width + ' 도감');
    assert.deepEqual(v.errors, [], '도감 콘솔'); checks += 7; await v.ctx.close();

    /* ── 생성기 — 세력 › 장수 › 세계 그림 ── */
    v = await open('/prompt.html', vp);
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
    assert.match(got, /Guan Yu/); assert.match(got, /WORLD — THREE KINGDOMS ERA/); assert.match(got, /Green Dragon Crescent Blade/);
    assert.match(await v.page.locator(mob ? '.hres .file' : '#file-name').textContent(), /관우_samguk_game_keyart_f\.webp/, '파일 이름');
    assert.match(v.page.url(), /card=%EA%B4%80%EC%9A%B0|card=관우/); assert.match(v.page.url(), /world=samguk/);
    await noOverflow(v.page, vp.width + ' 생성기 세계');
    checks += 8;
    /* 일상컷 — 처음부터 랜덤 → 다 골랐다 */
    await v.page.click('[data-open="out"]');
    await v.page.click('[data-out="casual"]');
    await v.page.click('#panel [data-pick="mecha"]');
    const ks = await v.page.evaluate(() => window.AtelierStudio.steps());
    await randAll(v.page, ks[1]);
    await toDone(v.page);
    const cp = await promptOf(v.page);
    assert.match(cp, /^INPUT: the attached image/); assert.match(cp, /female personification of Guan Yu/); assert.match(cp, /SCENE \(chosen\)/);
    assert.doesNotMatch(cp, /element|chemical symbol|atomic number/i, '원소 말이 남지 않았다');
    assert.match(await v.page.locator(mob ? '.hres .file' : '#file-name').textContent(), /관우_mecha_game_keyart_f_casual1\.webp/);
    await noOverflow(v.page, vp.width + ' 생성기 일상');
    assert.deepEqual(v.errors, [], '생성기 콘솔'); checks += 6; await v.ctx.close();
  }
  /* 시대 넷 — 역사의 자리 장소가 일상컷 트리에 산다 */
  const tree = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/casual-tree.json'), 'utf8'));
  assert.deepEqual(tree.eras.map(e => e.key), ['now', 'heritage', 'nation', 'fantasy']);
  assert.equal(tree.places.filter(p => p.key.startsWith('heritage_')).length, 10); checks += 2;
  await br.close(); server.close();
  console.log('PASS 화면: 도감(세력 넷 · 장수 수 · 세계 셋 · 빈 칸 → 생성기 · 손 설계 · 찾기 · 그림 있는 것만 · 주소) · 생성기(세력 › 장수 › 세계 그림 = 조립기 · 파일 이름 · 일상컷 랜덤 → 다 골랐다) · 폰 · PC — ' + checks + '가지');
})().catch(e => { console.error(e); server.close(); process.exit(1); });

/* 화면 검사 — 도감 · 생성기를 브라우저로 연다. 폰(390)과 PC(1280). 게임(draft.html)은 tests/regression.cjs 가 맡는다 — 여기선 안 연다.
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
    /* ── 타이틀(2026-11-02) — 메뉴 다섯 · 공간 ◀ ▶ · 배경 장면이 화면에 ── */
    let tv = await open('/index.html', vp);
    await tv.page.waitForSelector('#m-draft span');
    assert.deepEqual(await tv.page.locator('.menu-btn').evaluateAll(es => es.map(e => e.getAttribute('href'))), ['hall.html', 'draft.html', 'battle.html', 'dex.html', 'prompt.html'], '메뉴 다섯 — 머리 메뉴와 같은 차례');
    const t0 = await tv.page.evaluate(() => document.documentElement.dataset.theme);
    await tv.page.click('#next'); const t1 = await tv.page.evaluate(() => document.documentElement.dataset.theme);
    assert.notEqual(t0, t1, '◀ ▶ 로 공간이 바뀐다'); assert.match(await tv.page.locator('#s-name').textContent(), /공간 · /);
    await tv.page.keyboard.press('ArrowLeft'); assert.equal(await tv.page.evaluate(() => document.documentElement.dataset.theme), t0, '← 로 돌아온다');
    assert.match(await tv.page.evaluate(() => getComputedStyle(document.querySelector('.title-bg')).backgroundImage), /room-/, '배경 장면');
    assert.match(await tv.page.evaluate(() => [getComputedStyle(document.querySelector('.title-plaque')).backgroundImage, getComputedStyle(document.querySelector('.menu-btn.main')).backgroundImage, getComputedStyle(document.querySelector('.menu-btn:not(.main)')).backgroundImage, getComputedStyle(document.querySelector('#next')).backgroundImage].join(' ')), /ui-\w+-title.*ui-\w+-main.*ui-\w+-btn.*ui-\w+-round/, '현판 · 단추 그림');
    { const w = vp.width, empty = { x: w - 20, y: 20 };   /* 빈 곳 한 번 → 배경만, 한 번 더 → 메뉴 */
      await tv.page.mouse.click(empty.x, empty.y); await tv.page.waitForTimeout(450);
      assert.ok(await tv.page.evaluate(() => document.body.classList.contains('bg-only')), '빈 곳 → 배경만'); assert.equal(await tv.page.locator('#menu').isVisible(), false, '메뉴 숨김');
      await tv.page.mouse.click(empty.x, empty.y); await tv.page.waitForTimeout(450);
      assert.equal(await tv.page.evaluate(() => document.body.classList.contains('bg-only')), false, '다시 → 메뉴'); assert.ok(await tv.page.locator('#menu').isVisible());
      await tv.page.locator('#s-name').click(); assert.equal(await tv.page.evaluate(() => document.body.classList.contains('bg-only')), false, '메뉴 안은 그대로'); }
    await noOverflow(tv.page, vp.width + ' 타이틀');
    assert.deepEqual(tv.errors, [], '타이틀 콘솔'); await tv.ctx.close(); checks += 6;
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
    /* ── 군막(처음엔 첫 화면) — 문 셋 · 세력 넷 · 패치 기록 · 공간 아홉, 예전 게임 주소는 draft.html 로 ── */
    let hv = await open('/hall.html', vp);
    await hv.page.waitForSelector('.factions .nation-card');
    assert.deepEqual(await hv.page.locator('.home-doors a').evaluateAll(es => es.map(e => e.getAttribute('href'))), ['draft.html', 'dex.html', 'prompt.html'], '문 셋');
    assert.equal(await hv.page.locator('.factions .nation-card').count(), D.factions.length, '세력 넷');
    assert.match(await hv.page.locator('.factions .nation-card[data-fac="shu"]').textContent(), new RegExp('장수 ' + count('shu')));
    assert.equal(await hv.page.locator('.room-choice').count(), 9, '공간 아홉');
    await hv.page.click('.room-choice:has-text("네온 우중")');
    assert.equal(await hv.page.evaluate(() => document.documentElement.dataset.theme), 'neonrain');
    await hv.page.click('.patch-open'); await hv.page.waitForSelector('.patch-entry');
    await noOverflow(hv.page, vp.width + ' 첫 화면');
    assert.deepEqual(hv.errors, [], '첫 화면 콘솔'); await hv.ctx.close();
    for (const old of ['/?daily', '/index.html?local=1#sam-transfer=%7B%7D']) {
      hv = await open(old, vp); await hv.page.waitForURL(/draft\.html/); assert.match(hv.page.url(), /\/draft\.html/, old + ' → 게임'); await hv.ctx.close();
    }
    checks += 9;
    /* ── 도감 ── */
    let v = await open('/dex.html', vp);
    await v.page.waitForSelector('.sam-card');
    /* 그림이 있는 장수(조조) — 칸은 크게 보기 단추 */
    if (await v.page.locator('.sam-card[data-card="조조"] .worlds.main button.slot').count()) assert.equal(await v.page.locator('.sam-card[data-card="조조"] .worlds.main button.slot').count(), 3, '조조 세계 셋 그림');
    assert.equal(await v.page.locator('.dex-pick a').count(), D.factions.length, '세력 넷');
    assert.equal(await v.page.locator('.sam-card').count(), count(D.factions[0].key), '첫 세력의 장수 수');
    const one = v.page.locator('.sam-card').first(), bare = v.page.locator('.sam-card.bare').first();   /* 그림이 없는 장수 — 빈 칸이 생성기로 */
    assert.equal(await one.locator('.worlds.main .slot').count(), 3, '세계 셋');
    assert.match(await bare.locator('.worlds.main .slot').first().getAttribute('href'), /^prompt\.html\?card=.+&world=samguk$/, '빈 칸은 생성기로');
    assert.equal(await v.page.locator('.toc-jump .jump').count(), new Set(D.generals.filter(g => g.faction === D.factions[0].key).map(g => g.role)).size, '역할로 바로 가기');
    checks += 4;
    /* 촉 — 관우는 확정(★) · 설계 요약, 상태 거르기 · 찾기 · 주소 */
    await v.page.click('.dex-pick a[href="dex.html?faction=shu"]');
    await v.page.waitForSelector('.sam-card[data-card="관우"]');
    assert.equal(await v.page.locator('.sam-card').count(), count('shu'), '촉 장수 수');
    assert.match(await v.page.locator('.sam-card[data-card="관우"]').textContent(), /확정/);
    assert.match(await v.page.locator('.sam-card[data-card="관우"] .summary').textContent(), /청룡언월도/, '설계 요약');
    await v.page.selectOption('#dex-state', 'hand');
    assert.equal(await v.page.locator('.sam-card').count(), D.generals.filter(g => g.faction === 'shu' && g.designed === 'hand').length, '설계 상태 거르기');
    assert.match(v.page.url(), /st=hand/);
    await v.page.selectOption('#dex-state', '');
    assert.match(await v.page.locator('.sam-card[data-card="관우"] .stats').textContent(), /무력97/);
    await v.page.fill('#dex-find', 'zhuge');
    assert.equal(await v.page.locator('.sam-card').count(), D.generals.filter(g => g.faction === 'shu' && /zhuge/i.test(g.en)).length, '병음으로 찾기');
    assert.match(v.page.url(), /q=zhuge/);
    await v.page.fill('#dex-find', '');
    await v.page.click('#dex-only'); assert.equal(await v.page.getAttribute('#dex-only', 'aria-pressed'), 'true', '그림 있는 것만 — 누른 단추');
    const withArt = await v.page.locator('.sam-card').count();
    assert(withArt <= count('shu'), '그림 있는 것만');
    if (!withArt) assert(await v.page.locator('#dex-none').count(), '없으면 알림');
    await v.page.click('#dex-only'); assert.equal(await v.page.getAttribute('#dex-only', 'aria-pressed'), 'false');
    /* 화풍 고르개(2026-11-05) — 기본 화풍이 처음, 그림 있는 앞 화풍은 따로 */
    assert.equal(await v.page.inputValue('#dex-style'), S['default'], '처음은 기본 화풍');
    const stys = await v.page.locator('#dex-style option').evaluateAll(es => es.map(e => e.value));
    assert.equal(stys[0], S['default']);
    if (stys.includes('kr_mmorpg')) { await v.page.selectOption('#dex-style', 'kr_mmorpg'); assert.match(v.page.url(), /style=kr_mmorpg/); assert(await v.page.locator('.sam-card .worlds.main button.slot').count() > 0, '앞 화풍 그림');
      await v.page.selectOption('#dex-style', S['default']); assert.doesNotMatch(v.page.url(), /style=/); }
    await noOverflow(v.page, vp.width + ' 도감');
    assert.deepEqual(v.errors, [], '도감 콘솔'); checks += 7; await v.ctx.close();

    /* ── 화풍 비교(2026-11-07 「네비게이션바에 화풍탭을 추가해서 비교하기 쉽게」) — 항해에 화풍 탭, 화풍별 · 세계별 보기, 크게 보기 ── */
    { const W = ctx0.window.W, SC = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data/style-compare.json'), 'utf8')), n = SC.rounds[0].styles.length;
      const sv = await open('/styles.html', vp);
      await sv.page.waitForSelector('.sc-cell');
      assert.equal(await sv.page.locator('.workspace-nav a[aria-current="page"]').getAttribute('href'), 'styles.html', '화풍 탭');
      assert.equal(await sv.page.locator('.sc-style').count(), n, '화풍마다 한 칸');
      assert.equal(await sv.page.locator('.sc-cell').count(), n * 3 * 2, '세계 셋 × 세계 그림 · 일상컷');
      await sv.page.click('.sc-bar button:has-text("' + W('styles.view.world') + '")');
      assert.equal(await sv.page.locator('.sc-cell').count(), n * 2, '세계별 — 화풍이 한 줄로');
      await sv.page.click('.sc-bar button:has-text("' + W('styles.kind.old') + '")');
      assert.equal(await sv.page.locator('.sc-cell').count(), n * 3, '예전 줄 — 없는 화풍은 빈 칸');
      await sv.page.locator('.sc-cell button').first().click();
      assert(await sv.page.locator('.lightbox').isVisible(), '크게 보기'); await sv.page.keyboard.press('Escape');
      assert.match(sv.page.url(), /view=world/);
      await noOverflow(sv.page, vp.width + ' 화풍 비교');
      assert.deepEqual(sv.errors, [], '화풍 비교 콘솔'); checks += 9; await sv.ctx.close(); }
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
    assert.match(got, /Guan Yu/); assert.match(got, /COSTUME[^\n]*WUXIA/);   /* 기본 판 kv_kmmo_lock(2026-11-05) — 영문 네 칸 */ assert.match(got, /Green Dragon Crescent Blade/);
    assert.match(await v.page.locator(mob ? '.hres .file' : '#file-name').textContent(), new RegExp('관우_samguk_' + S['default'] + '_f\\.webp'), '파일 이름');
    assert.match(v.page.url(), /card=%EA%B4%80%EC%9A%B0|card=관우/); assert.match(v.page.url(), /world=samguk/);
    /* 화풍 고르개(2026-11-06 「생성기에 화풍추가해주고, 변경 기능 만들어줘」) — 맨 위가 기본(''), 고르면 지시문 · 파일 이름이 그 화풍, 기본으로 돌아오면 그대로 */
    { const ov = await v.page.$$eval('#st-style option', os => os.map(o => o.value));
      assert.equal(ov[0], '', '화풍 맨 위는 기본'); assert(ov.includes('kv_jp_paint') && ov.includes('kv_jp_mobile') && !ov.includes(S['default']), '화풍 목록');
      await v.page.selectOption('#st-style', 'kv_jp_paint');
      assert.match(await promptOf(v.page), /^Use case: stylized-concept\./, '고른 화풍 지시문');
      assert.match(await v.page.locator(mob ? '.hres .file' : '#file-name').textContent(), /관우_samguk_kv_jp_paint_f\.webp/, '고른 화풍 파일 이름');
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
    else { assert.match(cp, /^INPUT: the attached image/); assert.match(cp, /female personification of Guan Yu/); assert.match(cp, /SCENE \(chosen\)/); }
    assert.doesNotMatch(cp, /element|chemical symbol|atomic number/i, '원소 말이 남지 않았다');
    assert.match(await v.page.locator(mob ? '.hres .file' : '#file-name').textContent(), new RegExp('관우_mecha_' + S['default'] + '_f_casual1\\.webp'));
    await noOverflow(v.page, vp.width + ' 생성기 일상');
    assert.deepEqual(v.errors, [], '생성기 콘솔'); checks += 6; await v.ctx.close();
  }
  /* 시대 넷 — 역사의 자리 장소가 일상컷 트리에 산다 */
  const tree = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/casual-tree.json'), 'utf8'));
  assert.deepEqual(tree.eras.map(e => e.key), ['now', 'heritage', 'nation', 'fantasy']);
  assert.equal(tree.places.filter(p => p.key.startsWith('heritage_')).length, 19); checks += 2;   // 2026-11-03 「다 넣어줘」 — 관제묘 · 백제성 · 오장원 … 열을 더했다
  await br.close(); server.close();
  console.log('PASS 화면: 타이틀(메뉴 다섯 · 공간 넘기기 · 배경 장면 · 현판 · 단추 그림 · 빈 곳 누르면 배경만) · 전장(일곱 전장 · 세계마다 지도 · 진영 · 군웅 무리 · 이름표 → 미리 보기 → 배치 · 크게 보기 · 확대 축소 · 빼기) · 군막(문 셋 · 세력 넷 · 공간 아홉 · 패치 기록 · 옛 게임 주소 → draft.html) · 도감(세력 넷 · 장수 수 · 세계 셋 · 빈 칸 → 생성기 · 설계 상태 · 요약 · 상태 거르기 · 찾기 · 그림 있는 것만 · 주소) · 생성기(세력 › 장수 › 세계 그림 = 조립기 · 파일 이름 · 일상컷 랜덤 → 다 골랐다) · 폰 · PC — ' + checks + '가지');
})().catch(e => { console.error(e); server.close(); process.exit(1); });

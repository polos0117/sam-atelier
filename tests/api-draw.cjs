/* tools/api-draw.cjs — 가짜 그림 서버로 세계 그림 · GPT 설계 · 일상컷 · 막힘(한 번 더 → 건너뜀) · 사용량 · stage(webp · 기록 · 덮지 않음). node tests/api-draw.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), http = require('node:http'), cp = require('node:child_process');
const R = path.join(__dirname, '..'), TOOL = path.join(R, 'tools/api-draw.cjs'), tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'api-draw-'));
const png = cp.execFileSync('python3', ['-c', "import io,base64,sys\nfrom PIL import Image\nb=io.BytesIO();Image.new('RGB',(1024,1536),(200,80,80)).save(b,'PNG');sys.stdout.write(base64.b64encode(b.getvalue()).decode())"]).toString();
let calls = [], block = new Set();
const srv = http.createServer((q, s) => { let body = ''; q.on('data', d => body += d); q.on('end', () => {
  calls.push(q.url + ' ' + (q.headers['content-type'] || '').split(';')[0]);
  const blocked = [...block].some(b => body.includes(b));
  if (blocked) { s.writeHead(400, { 'content-type': 'application/json' }); return s.end(JSON.stringify({ error: { message: 'Your request was rejected by the safety system. safety_violations=[sexual]' } })); }
  s.writeHead(200, { 'content-type': 'application/json' }); s.end(JSON.stringify({ data: [{ b64_json: png }], usage: { output_tokens: 343, input_tokens: 1000 } })); }); });
/* 가짜 서버가 같은 프로세스라 동기 실행(spawnSync)은 서로를 막는다 — 비동기로 */
const run = args => new Promise(ok => { const c = cp.spawn(process.execPath, [TOOL, ...args], { env: { ...process.env, OPENAI_API_KEY: 'sk-test', API_DRAW_BASE: 'http://127.0.0.1:' + srv.address().port } }); let stdout = '', stderr = ''; c.stdout.on('data', d => stdout += d); c.stderr.on('data', d => stderr += d); c.on('close', status => ok({ status, stdout, stderr })); });
srv.listen(0, async () => {
  try {
    const out = path.join(tmp, 'out'), img = path.join(tmp, 'img'); fs.mkdirSync(path.join(img, 'img'), { recursive: true });
    let r = await run(['world', '조조', 'samguk', '--out', out, '--n', '2']); assert.equal(r.status, 0, r.stderr + r.stdout);
    const rec = JSON.parse(fs.readFileSync(path.join(out, 'samguk-ours1_record.json'), 'utf8'));
    assert(rec.style === 'api25' && rec.generation.model === 'gpt-image-2.5-sunburst' && rec.generation.endpoint === 'images/generations' && /tilting sharply upward/.test(rec.prompt) && rec.generation.png_sha256.length === 64, '세계 그림 기록');
    fs.writeFileSync(path.join(tmp, 'g1.txt'), 'A GPT FREE DESIGN PROMPT');
    r = await run(['free', '조조', 'samguk', '--text', path.join(tmp, 'g1.txt'), '--tag', 'gpt1', '--out', out]); assert.equal(r.status, 0, r.stderr);
    const fr = JSON.parse(fs.readFileSync(path.join(out, 'samguk-gpt1_record.json'), 'utf8'));
    assert(fr.generation.design === 'gpt_free' && fr.generation.free_prompt === 'A GPT FREE DESIGN PROMPT' && fr.prompt.startsWith('Design brief'), 'GPT 설계 기록 — 주문 · 쓴 글');
    /* 일상컷 — 계획(api25) 두 컷, 하나는 막힘 → 한 번 더 → 건너뜀(종료 3) */
    const planDir = path.join(tmp, 'plan'); cp.execFileSync(process.execPath, [path.join(R, 'tools/casual-plan.cjs'), '조조', '--world', 'samguk', '--style', 'api25', '--slots', '1,2', '--records', path.join(tmp, 'norec'), '--usage', 'none', '--out', planDir], { stdio: 'pipe' });
    const plan = JSON.parse(fs.readFileSync(path.join(planDir, 'plan.json'), 'utf8')); assert.equal(plan.style, 'api25', '계획기 --style');
    block = new Set(); calls = [];
    const p2 = JSON.parse(fs.readFileSync(path.join(planDir, 'samguk-casual2.api25-ui.json'), 'utf8')).prompt; const p1 = JSON.parse(fs.readFileSync(path.join(planDir, 'samguk-casual1.api25-ui.json'), 'utf8')).prompt, mk = p2.split('\n').find(l => /^Place: /.test(l)); assert(mk && !p1.includes(mk), '막을 줄은 2번에만'); block.add(mk);
    r = await run(['casual', path.join(planDir, 'plan.json'), '--ref', path.join(out, 'samguk-ours1.png'), '--out', out]);
    const c1rec = fs.existsSync(path.join(out, 'samguk-casual1_record.json')) ? JSON.parse(fs.readFileSync(path.join(out, 'samguk-casual1_record.json'), 'utf8')) : null;
    assert(c1rec && c1rec.generation.endpoint === 'images/edits' && c1rec.generation.ref_sent && c1rec.generation.ref_sent.size[0] === 768 && c1rec.generation.ref_sha256 && !/^LIGHT: natural light/m.test(c1rec.prompt), '일상컷 — 편집 API · 참고 그림 · 11-02 꼴');
    assert(r.status === 3 && /막혀 건너뛴 자리: samguk-casual2/.test(r.stdout) && calls.filter(c => c.startsWith('/images/edits')).length === 3, '막힌 컷은 한 번 더 뒤 건너뛴다(종료 3)');
    r = await run(['usage', out]); assert(/막힘 2/.test(r.stdout) && /gpt-image-2.5-sunburst · images\/generations — 3장/.test(r.stdout), '사용량 합계: ' + r.stdout);
    r = await run(['stage', '조조', '--img', img, path.join(out, 'samguk-ours1.png') + '=samguk', path.join(out, 'samguk-casual1.png') + '=samguk-casual1']); assert.equal(r.status, 0, r.stderr);
    assert(fs.existsSync(path.join(img, 'img', '조조_samguk_api25_f.webp')) && fs.existsSync(path.join(img, 'img', '조조_samguk_api25_f_casual1.webp')), 'stage — webp');
    const sr = JSON.parse(fs.readFileSync(path.join(img, 'records', '조조', 'samguk-casual1.api25-ui.json'), 'utf8')); assert(sr.ref === '조조_samguk_api25_f.webp' && sr.generation.webp.quality === 90, 'stage — 기록');
    r = await run(['stage', '조조', '--img', img, path.join(out, 'samguk-ours2.png') + '=samguk']); assert(r.status !== 0 && /덮지 않는다/.test(r.stderr), 'stage — 있으면 멈춘다');
    console.log('PASS 2.5 API 그리기 도구: 세계 그림 · GPT 설계 · 일상컷(편집 · 참고 그림) · 막힘 한 번 더 → 건너뜀 · 사용량 · stage(webp · 기록 · 덮지 않음)');
  } catch (e) { console.error(e); process.exitCode = 1; } finally { srv.close(); fs.rmSync(tmp, { recursive: true, force: true }); }
});

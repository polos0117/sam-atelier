#!/usr/bin/env node
/* 2.5 API 그리기 — 세계 그림 · GPT 설계 · 일상컷을 OpenAI 그림 API 로(2026-11-09 사용자 「2.5로 이미지 뽑는거 스킬로 만들어둘까?」 → 「응 만들어줘」, 스킬 .claude/skills/api25).
   키는 환경 변수 OPENAI_API_KEY 로만 읽는다(어디에도 적지 않는다). Node 는 NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=… 로(클라우드 세션).
   지시문은 생성기 조립부(lib/prompt-sam.js)가 짓는다 — 손으로 고치지 않는다. GPT 설계 글만 밖에서 온다(Claude · GPT 세션 · --text).

   node tools/api-draw.cjs brief  <장수> <세계> [--style api25]                       GPT 자유 설계 주문을 찍는다(Claude 가 읽고 지시문을 쓴다)
   node tools/api-draw.cjs world  <장수> <세계> --out <폴더> [--n 2] [--exposure moderate|low]   우리 설계 n 장 → <세계>-ours1.png …
   node tools/api-draw.cjs free   <장수> <세계> --text <글 파일> --tag gpt1 --out <폴더>        GPT 설계 글로 한 장 → <세계>-gpt1.png
   node tools/api-draw.cjs casual <plan.json> --ref <세계 그림 png|webp> --out <폴더> [--slots 1,2] [--free N=<글 파일>] [--exposure N=moderate|low] [--ref-size 768|0]
                                                                                     일상컷(편집 API) → <세계>-casualN.png. 자유 설계 컷(옷 자유 · 갈래 자유 — 계획의 ofree)은
                                                                                     --free 로 받은 채운 자유 설계 덩어리(FREE DESIGN … Outfit 줄 — 지시문 전체를 줘도 그 덩어리만 쓴다)를
                                                                                     지시문의 빈 덩어리 자리에 넣는다(2026-11-11 — 다른 줄은 늘 조립부 그대로). 기록 free_design · free_prompt
   node tools/api-draw.cjs usage  <폴더>                                              그 폴더의 호출 · 토큰 합계(usage.jsonl)
   node tools/api-draw.cjs sheet  <out.jpg> <그림>… [--labels a,b,…]                   붙여 보기(사용자에게 보여 줄 때)
   node tools/api-draw.cjs stage  <장수> --img <그림 저장소> <png>=<자리>…                 webp(품질 90) + 기록을 그림 저장소에 둔다(commit 은 하지 않는다)
                                                                                     자리 = <세계> | <세계>-casualN — 그 png 옆의 _record.json 을 기록으로. 같은 이름이 있으면 멈춘다
                                                                                     --img 는 열린 그림 저장소(2026-11-12 부터 ../sam-atelier-img-2, 안 주면 그것 — tools/img-repos.cjs).
                                                                                     닫힌 저장소(sam-atelier-img)엔 새 그림을 두지 않는다 · 같은 이름은 옆의 그림 저장소 모두에서 본다
   공통: [--style api25] [--model <그림 모델 — 기본 판의 model>] [--quality medium]
   필터: 안전 거절이면 같은 지시문으로 한 번 더, 또 막히면 그 자리를 건너뛰고 끝에 알린다(종료 코드 3). 노출 낮추기는 --exposure 로 다시 부른다(IMAGE_RULES 1절). */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto'), cp = require('node:child_process');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), REPOS = require('./img-repos.cjs');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-sam.js']) vm.runInContext(read(f), ctx);
const P = ctx.window.AtelierPrompt, T = ctx.window.AtelierSpec;
const D = JSON.parse(read('data/sam-design.json')), S = JSON.parse(read('data/style.json'));
const tree = JSON.parse(read('data/casual-tree.json')), tree2 = JSON.parse(read('data/casual-tree-v2.json'));
const BASE = process.env.API_DRAW_BASE || 'https://api.openai.com/v1';   /* 검사(tests/api-draw.cjs)는 가짜 서버로 */
const SIZE = '1024x1536', FIXED = { overall_intensity: 'strong', skin_exposure: 'bold' };

function parse(argv) {
  const o = { _: [], style: 'api25', quality: 'medium', n: 2, free: {}, exposure: {}, slots: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { o._.push(a); continue; }
    const k = a.slice(2), v = argv[i + 1];
    if (k === 'free' || (k === 'exposure' && /=/.test(v || ''))) { const [n, x] = v.split('='); o[k][n] = x; i++; continue; }
    if (k === 'force') { o.force = true; continue; }   /* 내린 화풍도 그린다 */
    if (k === 'slots') { o.slots = v.split(',').map(Number); i++; continue; }
    o[k] = v; i++;
  }
  return o;
}
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
function styleModel(st) { const r = S.styles[st] || {}, v = (r.versions || []).find(x => x.v === r.current) || {}; return v.model || 'gpt-image-2.5-sunburst'; }
function logUsage(out, row) { fs.appendFileSync(path.join(out, 'usage.jsonl'), JSON.stringify(row) + '\n'); }

async function call(url, body, isForm) {
  const key = process.env.OPENAI_API_KEY; if (!key) throw new Error('OPENAI_API_KEY 가 없다');
  const r = await fetch(url, { method: 'POST', headers: isForm ? { Authorization: 'Bearer ' + key } : { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key }, body: isForm ? body : JSON.stringify(body) });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) { /* 글 그대로 */ }
  if (!r.ok) { const e = new Error((j && j.error && j.error.message) || t.slice(0, 300)); e.status = r.status; e.safety = /safety|rejected/i.test(e.message); throw e; }
  return j;
}
/* 한 장 — 막히면 같은 지시문으로 한 번 더(retries 에 남긴다) */
/* 참고 그림은 줄여 보낸다 — 기본 768×1152(사용자 2026-11-09 「응 768로 기본값 넣어줘」 — 조조 무협 일상 1 시험: 입력 3,122 → 2,450, 얼굴 · 화풍은 같았다). --ref-size 0 이면 원본 그대로 */
function shrinkRef(ref, out, w) {
  if (!w) return ref;
  const h = Math.round(w * 1.5), dst = path.join(out, '.ref-' + w + '-' + path.basename(ref).replace(/\.(webp|png|jpe?g)$/i, '') + '.png');
  if (!fs.existsSync(dst)) py(`import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert('RGB').resize((int(sys.argv[3]),int(sys.argv[4])),Image.LANCZOS).save(sys.argv[2])`, [ref, dst, String(w), String(h)]);
  return dst;
}
async function draw({ model, quality, prompt, ref, out, name, exposure, refSize }) {
  const retries = [], sent = ref ? shrinkRef(ref, out, refSize) : null;
  for (let n = 1; n <= 2; n++) {
    const t0 = Date.now();
    try {
      let j, endpoint;
      if (ref) {
        const fd = new FormData(), buf = fs.readFileSync(sent);
        fd.append('model', model); fd.append('prompt', prompt); fd.append('size', SIZE); fd.append('quality', quality); fd.append('n', '1');
        fd.append('image[]', new Blob([buf], { type: sent.endsWith('.webp') ? 'image/webp' : 'image/png' }), path.basename(sent));
        j = await call(BASE + '/images/edits', fd, true); endpoint = 'images/edits';
      } else { j = await call(BASE + '/images/generations', { model, prompt, n: 1, size: SIZE, quality, output_format: 'png' }); endpoint = 'images/generations'; }
      const png = Buffer.from(j.data[0].b64_json, 'base64'), file = path.join(out, name + '.png');
      fs.writeFileSync(file, png);
      retries.push({ n, status: 'ok', exposure: exposure || 'bold' });
      const gen = { tool: 'tools/api-draw.cjs', model, endpoint, size: [1024, 1536], quality, usage: j.usage || null, seconds: (Date.now() - t0) / 1000, png_sha256: sha(png), prompt_sha256: sha(prompt), retries, date: new Date().toISOString().slice(0, 10) };
      if (ref) { gen.ref_sha256 = sha(fs.readFileSync(ref)); if (sent !== ref) gen.ref_sent = { size: [refSize, Math.round(refSize * 1.5)], sha256: sha(fs.readFileSync(sent)) }; }
      logUsage(out, { name, model, endpoint, output_tokens: (j.usage || {}).output_tokens || null, input_tokens: (j.usage || {}).input_tokens || null, seconds: gen.seconds, at: new Date().toISOString() });
      console.log(name + ' 받았다 ' + gen.seconds.toFixed(1) + '초 · 출력 ' + ((j.usage || {}).output_tokens || '?'));
      return gen;
    } catch (e) {
      retries.push({ n, status: e.safety ? 'safety' : 'error ' + (e.status || ''), exposure: exposure || 'bold' });
      logUsage(out, { name, model, blocked: e.safety, error: e.message.slice(0, 160), at: new Date().toISOString() });
      console.log(name + ' 막힘(' + n + ') — ' + e.message.slice(0, 140));
      if (!e.safety && n === 1) continue;
    }
  }
  return { blocked: true, retries };
}
/* 채운 덩어리가 틀을 지켰나 — 설계 다섯 줄(Place · Activity · Pose · Framing · Outfit)만 채우고 나머지 줄은 낱말 그대로. 틀린 것 목록 */
function freeBlockErrors(filled, tpl) {
  const trim = x => String(x || '').trim(); var errs = [], F = String(filled || '').split('\n'), Tl = String(tpl || '').split('\n'), design = /^(Place|Activity|Pose|Framing|Outfit): /;
  Tl.filter(function (l) { return !design.test(l); }).forEach(function (l) { if (F.indexOf(l) < 0) errs.push('고치면 안 되는 줄이 바뀌었다: ' + l.slice(0, 60)); });
  ['Place', 'Activity', 'Pose', 'Framing', 'Outfit'].forEach(function (h) {
    var l = F.filter(function (x) { return x.indexOf(h + ': ') === 0; })[0];
    if (!l) errs.push(h + ' 줄이 없다'); else if (/^…/.test(trim(l.slice(h.length + 2)))) errs.push(h + ' 줄을 안 채웠다');
  });
  return errs;
}
function writeRec(out, name, rec) { fs.writeFileSync(path.join(out, name + '_record.json'), JSON.stringify(rec, null, 1) + '\n'); }

async function cmdWorld(o) {
  const [card, world] = o._; const out = o.out; fs.mkdirSync(out, { recursive: true });
  const look = { params: {}, faceDesignOn: true, silhouetteOn: true, exposure: o.exposure && typeof o.exposure === 'string' ? o.exposure : T.EXPOSURE_DEFAULT };
  const opts = { style: o.style, notes: {}, look, shot: P.normShot(D, card, world, {}) }, prompt = P.build(D, S, card, world, opts), model = o.model || styleModel(o.style);
  const blocked = [];
  for (let i = 1; i <= Number(o.n); i++) {
    const name = world + '-ours' + i, gen = await draw({ model, quality: o.quality, prompt, out, name, exposure: look.exposure });
    if (gen.blocked) { blocked.push(name); continue; }
    writeRec(out, name, { ...P.record(D, S, card, world, opts), generation: { ...gen, design: 'ours' } });
  }
  return blocked;
}
async function cmdFree(o) {
  const [card, world] = o._; const out = o.out; fs.mkdirSync(out, { recursive: true });
  const text = fs.readFileSync(o.text, 'utf8').trim(), name = world + '-' + (o.tag || 'gpt1'), model = o.model || styleModel(o.style);
  const gen = await draw({ model, quality: o.quality, prompt: text, out, name });
  if (gen.blocked) return [name];
  const rec = { ...P.record(D, S, card, world, { style: o.style }), prompt: P.buildWorldFree(D, S, card, world, { style: o.style }) };
  writeRec(out, name, { ...rec, generation: { ...gen, design: 'gpt_free', free_prompt: text, free_by: o.by || 'claude' } });
  return [];
}
async function cmdCasual(o) {
  const plan = JSON.parse(fs.readFileSync(o._[0], 'utf8')), out = o.out; fs.mkdirSync(out, { recursive: true });
  const model = o.model || styleModel(o.style), blocked = [];
  for (const cut of plan.cuts.filter(c => !o.slots || o.slots.includes(c.n))) {
    const { n, ...sc } = cut, exp = o.exposure[n] || 'bold', name = plan.world + '-casual' + n;
    const scene = { ...sc, axes: { ...FIXED, ...(sc.axes || {}), skin_exposure: exp }, aspect: '2:3', unlocked: sc.unlocked || [] };
    const rec = P.casualRecord(D, S, plan.card, scene, { world: plan.world, style: o.style, tree, tree2 }, n);
    let prompt = rec.prompt;
    /* 자유 설계 컷(2026-11-11 사용자 「장소·활동·자세·구도·의상을 자유롭게 설계해줘 …」) — 채운 덩어리를 받아 빈 덩어리 자리에. 틀(머리 · 최근 장면 · 필수 갈래 · 상황 줄)은 낱말 그대로여야 한다 */
    let block = '';
    if (cut.ofree) {
      if (!o.free[n]) { console.log(name + ' — 자유 설계 컷: --free ' + n + '=<채운 덩어리 파일> 이 없어 건너뛴다'); blocked.push(name + '(글 없음)'); continue; }
      const tpl = P.freeBlockOf(prompt), got = fs.readFileSync(o.free[n], 'utf8').trim(); block = P.freeBlockOf(got) || '';
      const errs = !tpl ? ['지시문에 자유 설계 덩어리가 없다'] : !block ? ['--free ' + n + ' 글에 FREE DESIGN … Outfit 덩어리가 없다'] : freeBlockErrors(block, tpl);
      if (errs.length) { console.log(name + ' — 자유 설계 덩어리가 틀을 안 지켰다: ' + errs.join(' · ')); blocked.push(name + '(덩어리 틀림)'); continue; }
      prompt = prompt.replace(tpl, () => block);
    }
    const gen = await draw({ model, quality: o.quality, prompt, ref: o.ref, out, name, exposure: exp, refSize: o['ref-size'] == null ? 768 : Number(o['ref-size']) });
    if (gen.blocked) { blocked.push(name); continue; }
    if (cut.ofree) { gen.design = cut.ofreeFamily ? 'ofree_family' : 'ofree'; gen.free_design = block; gen.free_prompt = prompt; gen.free_by = o.by || 'claude'; }
    writeRec(out, name, { ...rec, generation: gen });
  }
  return blocked;
}
function cmdUsage(o) {
  const f = path.join(o._[0], 'usage.jsonl'); if (!fs.existsSync(f)) { console.log('기록 없음'); return; }
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').map(l => JSON.parse(l)), ok = rows.filter(r => !r.error);
  const by = {}; for (const r of ok) { const k = r.model + ' · ' + r.endpoint; by[k] = by[k] || { n: 0, out: 0, inp: 0 }; by[k].n++; by[k].out += r.output_tokens || 0; by[k].inp += r.input_tokens || 0; }
  console.log('호출 ' + rows.length + ' · 그림 ' + ok.length + ' · 막힘 ' + rows.filter(r => r.error).length);
  for (const [k, v] of Object.entries(by)) console.log('  ' + k + ' — ' + v.n + '장 · 출력 ' + v.out + ' · 입력 ' + v.inp);
}
function py(code, args) { const r = cp.spawnSync('python3', ['-c', code, ...args], { encoding: 'utf8' }); if (r.status) throw new Error(r.stderr || 'python 실패'); return r.stdout; }
function cmdSheet(o) {
  const [outFile, ...files] = o._, labels = (o.labels || '').split(',');
  py(`import sys
from PIL import Image, ImageDraw, ImageFont
out=sys.argv[1]; fs=sys.argv[3:]; lab=sys.argv[2].split(',') if sys.argv[2] else []
W,H,TOP=420,630,30
try: F=ImageFont.truetype('/usr/share/fonts/truetype/freefont/FreeSansBold.ttf',20)
except Exception: F=ImageFont.load_default()
im=Image.new('RGB',(W*len(fs),TOP+H),'white'); d=ImageDraw.Draw(im)
for i,f in enumerate(fs):
    im.paste(Image.open(f).convert('RGB').resize((W,H)),(i*W,TOP)); d.text((i*W+8,5),lab[i] if i<len(lab) and lab[i] else f.split('/')[-1],fill='black',font=F)
im.save(out,quality=88)`, [outFile, o.labels || '', ...files]);
  console.log('→ ' + outFile);
}
function cmdStage(o) {
  /* 새 그림 · 새 기록은 열린 저장소에만(2026-11-12 사용자 「원소쪽은 다른 작업중이라 삼국지 먼저 열자.」 — 첫 저장소가 약 1.0 GB 로 찼다) */
  const card = o._[0], img = path.resolve(o.img || REPOS.openPath()); if (!fs.existsSync(path.join(img, 'img'))) throw new Error('--img <그림 저장소> 가 아니다: ' + img);
  const at = REPOS.REPOS.indexOf(path.basename(img));
  if (at >= 0 && REPOS.REPOS[at] !== REPOS.OPEN) throw new Error(REPOS.REPOS[at] + ' 는 닫힌 그림 저장소다 — 새 그림은 ' + REPOS.OPEN + ' 에(--img ../' + REPOS.OPEN + ')');
  /* 같은 이름은 옆에 받아 둔 그림 저장소 모두에서 본다 — 두 저장소에 같은 이름이 있으면 등록이 멈춘다 */
  const twins = file => REPOS.REPOS.map(r => path.join(path.dirname(img), r, 'img', file)).filter(f => fs.existsSync(f));
  const pairs = o._.slice(1).map(x => { const i = x.lastIndexOf('='); return [x.slice(0, i), x.slice(i + 1)]; });
  for (const [png, slot] of pairs) {
    const m = slot.match(/^(samguk|fantasy|mecha)(?:-casual(\d+))?$/); if (!m) throw new Error('자리 꼴이 아니다: ' + slot);
    const recFile = png.replace(/\.png$/, '_record.json'); if (!fs.existsSync(recFile)) throw new Error('기록이 없다: ' + recFile);
    const rec = JSON.parse(fs.readFileSync(recFile, 'utf8'));
    const file = m[2] ? P.casualFile(card, m[1], o.style, Number(m[2])) : P.fileName(card, m[1], o.style);
    const dst = path.join(img, 'img', file), recDst = path.join(img, 'records', card, m[2] ? `${m[1]}-casual${m[2]}.${o.style}-ui.json` : `${m[1]}.${o.style}-ui.json`);
    const hit = [dst, recDst, ...twins(file)].find(f => fs.existsSync(f));
    if (hit) throw new Error('이미 있다 — 덮지 않는다: ' + hit);
    py(`import sys
from PIL import Image
im=Image.open(sys.argv[1]).convert('RGB')
assert im.size==(1024,1536), im.size
im.save(sys.argv[2],'WEBP',quality=90,method=6)`, [png, dst]);
    rec.file = file; if (m[2]) { rec.slot = 'casual' + m[2]; rec.ref = P.fileName(card, m[1], o.style); }
    rec.generation = { ...rec.generation, webp: { quality: 90 } }; rec.imported = new Date().toISOString().slice(0, 10);
    fs.mkdirSync(path.dirname(recDst), { recursive: true }); fs.writeFileSync(recDst, JSON.stringify(rec, null, 1) + '\n');
    console.log('  + img/' + file + ' · ' + path.relative(img, recDst));
  }
}
async function main() {
  const [cmd, ...rest] = process.argv.slice(2), o = parse(rest);
  if (!S.styles[o.style]) throw new Error('화풍이 없다: ' + o.style);
  if (S.styles[o.style].retired && !o.force) throw new Error('내린 화풍이다(' + S.styles[o.style].retired + '): ' + o.style + ' — 그래도 그리려면 --force');
  if (cmd === 'brief') { process.stdout.write(P.buildWorldFree(D, S, o._[0], o._[1], { style: o.style }) + '\n'); return 0; }
  if (cmd === 'usage') { cmdUsage(o); return 0; }
  if (cmd === 'sheet') { cmdSheet(o); return 0; }
  if (cmd === 'stage') { cmdStage(o); return 0; }
  const fn = { world: cmdWorld, free: cmdFree, casual: cmdCasual }[cmd];
  if (!fn) { console.error(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 18).join('\n')); return 2; }
  if (!o.out) throw new Error('--out <폴더> 가 필요하다');
  const blocked = await fn(o);
  if (blocked.length) { console.log('막혀 건너뛴 자리: ' + blocked.join(' · ') + ' — 노출 한 단계 낮춰 다시(--exposure)'); return 3; }
  return 0;
}
main().then(c => process.exit(c), e => { console.error(e.message); process.exit(1); });

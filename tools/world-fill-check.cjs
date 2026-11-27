#!/usr/bin/env node
/* 세계컷 GPT 설계 칸 채우기 검사(2026-11-18 사용자 「세계컷은 gpt한테 너무 위임하면 안되겠다」 → 「응 이대로 진행해줘」).
   설계 주문(lib/prompt-sam.js buildWorldFree)의 우리 설계 지시문에서 표시한 칸([HAIRSTYLE: …] · [COSTUME SILHOUETTE: …] · [BUILD: …](우리 체형 목록 글 그대로) · 얼굴 칸 여덟(우리 것 뺀 목록 글 그대로, 두 장도 칸마다 다르게 — 2026-11-19) · Design idea · Stance and hands · Setting detail)과
   얼굴 · 표정 줄만 바뀌었는지, 헤어스타일이 우리와 다른지, 실루엣이 목록 글 그대로인지, 첫 줄이 SUMMARY 인지 본다. 틀리면 1.

   다른 세계 GPT 설계(2026-11-27 「3가지 세계에서 겹치지 않게」 → 「얼굴 조합만 다르게」) — 채운 글과 같은 폴더(--prior-dir 이면 거기)의 <세계>-gpt1.txt · <세계>.<화풍>-gpt1.txt 꼴과
   헤어스타일 · 실루엣이 같거나 얼굴 여덟 칸 중 넷 이상 같으면 틀린다.

   node tools/world-fill-check.cjs <장수> <세계> <채운 글> [--style <화풍>] [--other <다른 GPT 설계 글>] [--prior-dir <폴더>] */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-sam.js']) vm.runInContext(read(f), ctx);
const P = ctx.window.AtelierPrompt, D = JSON.parse(read('data/sam-design.json')), S = JSON.parse(read('data/style.json'));
const a = process.argv.slice(2), opt = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
const [card, world, file] = a.filter((x, i) => !x.startsWith('--') && !(i > 0 && a[i - 1].startsWith('--')));
if (!card || !world || !file) { console.error('node tools/world-fill-check.cjs <장수> <세계> <채운 글> [--style <화풍>] [--other <글>] [--prior-dir <폴더>]'); process.exit(2); }
const prior = require('./gpt-prior.cjs').priorFrom(opt('--prior-dir') || path.dirname(path.resolve(file)), P.worldsOf(D, card), world);
const errs = P.worldFillErrors(D, S, card, world, fs.readFileSync(file, 'utf8'), { style: opt('--style') || S.default, prior }, opt('--other') ? fs.readFileSync(opt('--other'), 'utf8') : null);
if (errs.length) { console.log('✗ ' + errs.join('\n✗ ')); process.exit(1); }
console.log('통과 — 칸만 채웠다');

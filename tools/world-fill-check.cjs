#!/usr/bin/env node
/* 세계컷 GPT 설계 칸 채우기 검사(2026-11-18 사용자 「세계컷은 gpt한테 너무 위임하면 안되겠다」 → 「응 이대로 진행해줘」).
   설계 주문(lib/prompt-sam.js buildWorldFree)의 우리 설계 지시문에서 표시한 칸([HAIRSTYLE: …] · [COSTUME SILHOUETTE: …] · [BUILD: …](우리 체형 목록 글 그대로) · Design idea · Stance and hands · Setting detail)과
   얼굴 · 표정 줄만 바뀌었는지, 헤어스타일이 우리와 다른지, 실루엣이 목록 글 그대로인지, 첫 줄이 SUMMARY 인지 본다. 틀리면 1.

   node tools/world-fill-check.cjs <장수> <세계> <채운 글> [--style <화풍>] [--other <다른 GPT 설계 글>] */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-sam.js']) vm.runInContext(read(f), ctx);
const P = ctx.window.AtelierPrompt, D = JSON.parse(read('data/sam-design.json')), S = JSON.parse(read('data/style.json'));
const a = process.argv.slice(2), opt = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
const [card, world, file] = a.filter((x, i) => !x.startsWith('--') && !(i > 0 && a[i - 1].startsWith('--')));
if (!card || !world || !file) { console.error('node tools/world-fill-check.cjs <장수> <세계> <채운 글> [--style <화풍>] [--other <글>]'); process.exit(2); }
const errs = P.worldFillErrors(D, S, card, world, fs.readFileSync(file, 'utf8'), { style: opt('--style') || S.default }, opt('--other') ? fs.readFileSync(opt('--other'), 'utf8') : null);
if (errs.length) { console.log('✗ ' + errs.join('\n✗ ')); process.exit(1); }
console.log('통과 — 칸만 채웠다');

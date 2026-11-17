/* 일상컷 한 줄(2026-11-17) — 도감에서 일상컷을 크게 보기 · 상세로 열었을 때만, 그 컷이 무엇으로 그려졌는지 작은 글 한 줄.
   사용자 「전체 목록리스트에서 보는건 지저분하니까, 상세보기나 크게보기 일 때만 보이도록」 — 목록(격자) 칸은 이 모듈을 부르지 않는다.
   자료는 data/casual-index.json(tools/casual-index.cjs 가 쓴다 — 허브 「일상컷 목록」 과 같은 꼴). 크게 보기를 처음 열 때 한 번만 받고,
   받기가 실패하거나 맞는 줄이 없으면 아무것도 안 보인다.
   그림 파일 ↔ 색인 줄: 파일 이름 규칙 <카드>_[<세계>_]<화풍>_f_casualN.webp 를 줄에서 거꾸로 지어 맞춘다(pkm 은 세계가 비어 있다).
   한글은 색인의 *Ko(우리가 고른 값), GPT 가 지은 글(자유 설계 Outfit 줄 · 옛 코스프레 캐릭터)은 영어 그대로 —
   사용자 「우리쪽에서 고르는건 한글로 표시되게 해줘. gpt 쪽은 영어로 설계하니까 그건 어쩔 수 없이 놔두고」.
   sam-atelier · element-atelier · pkm-atelier 가 글자 하나 다르지 않게 같이 쓴다. 말은 각 공방 lib/words.js 의 dex.cnote.req · gpt · more · less */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect } from 'https://esm.sh/preact@10.24.3/hooks';

const URL_ = 'data/casual-index.json', CUT = 90;
let once = null;
/* 색인 한 줄이 가리키는 그림 파일 이름 */
export const rowFile = r => String(r.card).replace(/ /g, '_') + '_' + (r.world ? r.world + '_' : '') + r.style + '_f_casual' + r.n + '.webp';
/* 색인 — {파일: 줄}. 한 번만 받는다(실패하면 빈 표) */
export function loadIndex(url) {
  if (!once) once = fetch(url || URL_, { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => {
    const m = new Map();
    for (const r of (j && Array.isArray(j.rows) ? j.rows : [])) if (r && r.card && r.style && r.n) m.set(rowFile(r), r);
    return m;
  }).catch(() => new Map());
  return once;
}
const join = (l, s) => l.filter(Boolean).join(s);
/* 한 줄의 몫 — {lead, rest, gpt, outfit}. 보일 것이 없으면 null */
export function noteOf(r) {
  const W = window.W, req = W('dex.cnote.req'), c = r.cosplay, f = r.free;
  let lead = '', rest = '', gpt = false, outfit = null;
  if (r.required === 'own') { lead = r.requiredKo || ''; rest = r.itemKo || ''; }
  else if (c) {
    lead = r.required ? join([req, r.requiredKo || r.familyKo], ' · ') : (r.familyKo || '');
    rest = join([c.gameKo || c.game, c.characterKo || c.character, c.cutKo || r.itemKo], ' · ');
    gpt = c.by === 'gpt';
  } else if (f) { lead = join([f.kindKo || f.kind, r.familyKo], ' · '); rest = join([r.itemKo, r.shadeKo], ' · '); outfit = f.outfit || null; }
  else { lead = r.required ? join([req, r.requiredKo], ' · ') : (r.familyKo || ''); rest = join([r.itemKo, r.shadeKo], ' · '); }
  if (!lead && !rest && !outfit) return null;
  return { lead, rest, gpt, outfit };
}
/* 작은 글 한 줄 — file 이 색인에 있으면. cls 는 그 도감의 자리 이름(꼴은 그 도감의 CSS 가 정한다) */
export function CasualNote({ file, cls }) {
  const [map, setMap] = useState(null), [open, setOpen] = useState(false);
  useEffect(() => { let on = true; loadIndex().then(m => { if (on) setMap(m); }); return () => { on = false; }; }, []);
  useEffect(() => setOpen(false), [file]);
  const r = map && file && map.get(file), n = r && noteOf(r);
  if (!n) return null;
  const W = window.W, o = n.outfit, long = !!o && o.length > CUT;
  const outfit = o && (long
    /* 단추 요소는 줄 안에 흘러가지 않아(늘 inline-block) 앞 글 뒤에서 통째로 다음 줄로 떨어진다 — 글 줄에 이어지게 span 에 단추 몫(role · tabindex · Enter/Space) */
    ? h('span', { class: 'cnote-more', role: 'button', tabIndex: 0, lang: 'en', 'aria-expanded': open, title: open ? W('dex.cnote.less') : W('dex.cnote.more'),
        onClick: e => { e.stopPropagation(); setOpen(!open); }, onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setOpen(!open); } } },
        open ? o : o.slice(0, CUT).replace(/\s+\S*$/, '') + ' …')
    : h('span', { lang: 'en' }, o));
  const tail = n.rest;
  return h('p', { class: 'cnote' + (cls ? ' ' + cls : ''), 'data-cnote': r.required || (r.free ? 'free' : 'casual') },
    n.lead && h('b', null, n.lead),
    n.lead && (tail || outfit) ? ' — ' : null,
    tail || null, tail && outfit ? ' · ' : null, outfit || null,
    n.gpt && h('small', { class: 'cnote-gpt' }, W('dex.cnote.gpt')));
}

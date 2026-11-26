/* 일상컷 설명(2026-11-17 한 줄 → 2026-11-25 두 줄 + 더 보기) — 도감에서 일상컷을 크게 보기 · 상세로 열었을 때만, 그 컷이 무엇으로 그려졌는지 작은 글.
   사용자 2026-11-17 「전체 목록리스트에서 보는건 지저분하니까, 상세보기나 크게보기 일 때만 보이도록」 — 목록(격자) 칸은 이 모듈을 부르지 않는다.
   사용자 2026-11-25 「… 조금 더 세부내용을 추가해줬으면 해. 가령, 장소나 포즈, 표정, 구도 등인데 어디까지 하는게 좋을지 검토해줘」 → 「응 그 범위로 진행해줘」:
     늘 보이는 두 줄 — (1) 갈래 · 의상 · 색(필수 · 코스프레 · 자유 설계 표시) (2) 장소 · 하는 일 · 구도
     「더 보기」 — 표정 · 시선 · 몸 방향 · 카메라 · 렌즈 · 빛 · 시간대 · 계절 · 날씨 · 순간 · 화면 구성 · 상황 노출 · 옷 꾸밈 · 자유 설계 · 세계 · 시대 · 화면비(있는 칸만).
     2026-11-26 사용자 「이미지 상세보기에서 gpt 설계문이나 길이가 긴 텍스트가 나오면 이미지가 작아지거나 아래로 밀려서 버튼 클릭을 못하는데」 → 「응 1~3 진행해줘」:
       (1) 두 줄 칸은 높이 한도(넘치면 그 칸 안에서만 굴림) — 그림 · 단추 자리는 글 길이와 상관없다
       (2) 「더 보기」 는 그림을 밀지 않고 문서 맨 위(body)에 겹치는 판으로 — 판 안에서 굴림, 바깥 · 닫기 · Esc 로 닫는다(Esc 는 크게 보기까지 닫지 않는다)
       (3) 펼침을 기억하지 않는다 — 다른 그림으로 넘기면 접힌 채.
   자료는 data/casual-index.json(tools/casual-index.cjs 가 쓴다 — 줄 끝 s 가 장면 풀이, tools/casual-detail.cjs). 크게 보기를 처음 열 때 한 번만 받고,
   받기가 실패하거나 맞는 줄이 없으면 아무것도 안 보인다. 옛 줄(s 없음)은 첫 줄만.
   그림 파일 ↔ 색인 줄: 파일 이름 규칙 <카드>_[<세계>_]<화풍>_f_casualN.webp 를 줄에서 거꾸로 지어 맞춘다(pkm 은 세계가 비어 있다).
   한글은 색인의 *Ko · s(우리가 고른 값), GPT 가 지은 글(자유 설계 Outfit 줄 · 장소 · 하는 일 · 구도 · 옛 코스프레 캐릭터)은 영어 그대로 —
   사용자 「우리쪽에서 고르는건 한글로 표시되게 해줘. gpt 쪽은 영어로 설계하니까 그건 어쩔 수 없이 놔두고」.
   sam-atelier · element-atelier · pkm-atelier · city-atelier 가 글자 하나 다르지 않게 같이 쓴다. 말은 각 공방 lib/words.js 의 dex.cnote.* .
   기본 꼴(단추 44px · 더 보기 칸 줄)은 여기서 한 번 넣고, 색 · 크기는 그 도감의 CSS(cls 자리)가 정한다. */
import { h, render } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useRef } from 'https://esm.sh/preact@10.24.3/hooks';

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
/* 첫 줄의 몫 — {lead, rest, gpt, outfit}. 보일 것이 없으면 null */
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
/* 둘째 줄 — 장소 · 하는 일 · 구도. en 이면 GPT 가 지은 영어 */
export function sceneOf(r) { const s = r.s || {}, t = join([s.pl, s.act, s.fr], ' · '); return t ? { text: t, en: !!s.en } : null; }
/* 더 보기 칸 — [[이름, 값, 영어?]] (있는 칸만). 차례: 얼굴 · 몸 → 카메라 → 때 → 장면 → 옷 → 자유 설계 → 세계 */
const MORE = ['ex', 'gz', 'bd', 'cam', 'ln', 'lt', 'tm', 'ss', 'wt', 'mo', 'cp', 'si', 'os'];
export function moreOf(r) {
  const W = window.W, s = r.s || {}, out = MORE.filter(k => s[k]).map(k => [W('dex.cnote.f.' + k), s[k]]);
  if (r.free) out.push([W('dex.cnote.f.free'), join([r.free.kindKo || r.free.kind, W('dex.cnote.f.gptmade')], ' — ')]);
  const own = out.length;
  if (r.worldKo) out.push([W('dex.cnote.f.world'), r.worldKo]);
  if (s.era) out.push([W('dex.cnote.f.era'), s.era]);
  if (s.ar) out.push([W('dex.cnote.f.ar'), s.ar]);
  return own || s.era || s.ar ? out : [];   /* 세계 이름 하나뿐이면 더 볼 것이 없다(위 줄 · 도감이 이미 말한다) */
}
/* 기본 꼴 — 한 번만. 도감 CSS 가 더 구체적인 자리(.lightbox .lb-cnote …)로 덮는다 */
function css() {
  if (typeof document === 'undefined' || document.getElementById('cnote-css')) return;
  const st = document.createElement('style'); st.id = 'cnote-css';
  st.textContent = '.cnote>p{margin:0}.cnote .cnote-l2{margin-top:2px}' +
    '.cnote .cnote-tag{display:inline-block;margin-inline-end:6px;padding:0 5px;border:1px solid currentColor;border-radius:4px;font-size:10px;line-height:1.5;opacity:.8;vertical-align:1px}' +
    '.cnote .cnote-more{display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:44px;margin:0;padding:0 14px;border:0;border-radius:10px;background:none;color:inherit;font:inherit;font-weight:700;' +
    'text-decoration:underline dotted;text-underline-offset:3px;white-space:nowrap;cursor:pointer;touch-action:manipulation}' +
    '.cnote .cnote-more:focus-visible{outline:2px solid currentColor;outline-offset:-6px}' +
    '.cnote .cnote-list[hidden]{display:none}.cnote .cnote-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,11em),1fr));gap:2px 16px;margin:0 0 6px;padding:0;text-align:start}' +
    '.cnote .cnote-list>div{display:flex;gap:6px;min-width:0}.cnote .cnote-list dt{flex:none;opacity:.7}.cnote .cnote-list dd{margin:0;min-width:0;overflow-wrap:anywhere}' +
    /* (1) 두 줄 칸 — 높이 한도, 넘치면 이 칸 안에서만 굴림 */
    '.cnote .cnote-body{max-height:4.8em;overflow-y:auto;overscroll-behavior:contain}' +
    /* (2) 더 보기 판 — body 에 붙는 층(크게 보기의 투명도 · 쌓임 맥락 밖), 아래에서 올라와 그림 위에 겹친다 */
    '.cnote-back{position:fixed;inset:0;z-index:2147483000;background:#0007}' +
    '.cnote-sheet{position:fixed;left:0;right:0;bottom:0;z-index:2147483001;box-sizing:border-box;width:min(100%,760px);max-height:70vh;max-height:70dvh;margin:0 auto;overflow-y:auto;overscroll-behavior:contain;' +
    'padding:4px 16px calc(14px + env(safe-area-inset-bottom));border-radius:14px 14px 0 0;background:#16181df5;color:#f3f1ea;font:13px/1.55 system-ui,-apple-system,\'Noto Sans KR\',sans-serif;text-align:start;word-break:keep-all;overflow-wrap:anywhere;box-shadow:0 -10px 32px #000a}' +
    '.cnote-sheet .cnote-top{position:sticky;top:-4px;display:flex;justify-content:flex-end;margin:0 -8px 4px;background:inherit}' +
    '.cnote-sheet .cnote-l1,.cnote-sheet .cnote-l2{margin:0 0 6px}.cnote-sheet .cnote-list{margin-top:8px}';
  document.head.appendChild(st);
}
/* body 에 붙는 층 — 크게 보기 안(투명도 · 쌓임 맥락 · 클릭 닫기)과 떨어져 그림 위에 겹친다 */
function Layer({ children }) {
  const [el] = useState(() => { const d = document.createElement('div'); d.className = 'cnote-layer'; return d; });
  useEffect(() => { document.body.appendChild(el); return () => { render(null, el); el.remove(); }; }, []);
  useEffect(() => { render(children, el); });
  return null;
}
/* 판이 떠 있는 동안의 키 — 모듈을 불러올 때 한 번 건다(크게 보기들이 열 때 거는 창 키보다 먼저 받게 — 포켓몬 크게 보기는 Esc 를 창 앞단에서 받아 닫는다).
   Esc 는 판만 닫고, Tab 은 판 안에, ← → 는 그림을 넘기지 않는다 */
let active = null;
if (typeof window !== 'undefined') addEventListener('keydown', e => {
  if (!active) return;
  if (e.key === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); active.shut(); }
  else if (e.key === 'Tab') { e.stopImmediatePropagation(); e.preventDefault(); active.focus(); }
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.stopImmediatePropagation();
}, true);
let uid = 0;
/* 두 줄 + 더 보기 — file 이 색인에 있으면. cls 는 그 도감의 자리 이름(색 · 크기는 그 도감의 CSS 가 정한다).
   더 보기 판에는 다 펼친 첫 줄(옷 글 통째) · 둘째 줄 · 더 보기 칸 */
export function CasualNote({ file, cls }) {
  const [map, setMap] = useState(null), [open, setOpen] = useState(false), [id] = useState(() => 'cnote-' + (++uid)), moreBtn = useRef(null), closeBtn = useRef(null);
  useEffect(() => { css(); let on = true; loadIndex().then(m => { if (on) setMap(m); }); return () => { on = false; }; }, []);
  useEffect(() => { setOpen(false); }, [file]);   /* (3) 다른 그림이면 접힌 채 */
  useEffect(() => {
    if (!open) return;
    const me = { shut: () => shut(), focus: () => { if (closeBtn.current) closeBtn.current.focus(); } };
    active = me; me.focus();
    return () => { if (active === me) active = null; };
  }, [open]);
  const r = map && file && map.get(file), n = r && noteOf(r);
  if (!n) return null;
  const W = window.W, o = n.outfit, sc = sceneOf(r), more = moreOf(r), can = (!!o && o.length > CUT) || (!!sc && sc.text.length > CUT) || more.length > 0;
  function shut() { active = null; setOpen(false); if (moreBtn.current) moreBtn.current.focus(); }   /* 키를 곧바로 놓아 준다(효과 정리는 다음 그림에서 돈다) */
  const stop = e => e.stopPropagation();
  const l1 = full => h('p', { class: 'cnote-l1' },
    n.lead && h('b', null, n.lead),
    n.lead && (n.rest || o) ? ' — ' : null,
    n.rest || null, n.rest && o ? ' · ' : null,
    o ? h('span', { lang: 'en' }, !full && o.length > CUT ? o.slice(0, CUT).replace(/\s+\S*$/, '') + ' …' : o) : null,
    n.gpt && h('small', { class: 'cnote-gpt' }, W('dex.cnote.gpt')));
  const l2 = sc && h('p', { class: 'cnote-l2' }, sc.en && h('small', { class: 'cnote-tag' }, W('dex.cnote.gptscene')), sc.en ? h('span', { lang: 'en' }, sc.text) : sc.text);
  return h('div', { class: 'cnote' + (cls ? ' ' + cls : ''), 'data-cnote': r.required || (r.free ? 'free' : 'casual') },
    h('div', { class: 'cnote-body' }, l1(false), l2),
    can && h('button', { type: 'button', class: 'cnote-more', ref: moreBtn, 'aria-expanded': open ? 'true' : 'false', 'aria-controls': id, 'aria-haspopup': 'dialog',
      onClick: e => { stop(e); setOpen(true); } }, W('dex.cnote.more')),
    open && h(Layer, null,
      h('div', { class: 'cnote-back', onClick: e => { stop(e); shut(); } }),
      h('div', { class: 'cnote cnote-sheet', id, role: 'dialog', 'aria-label': W('dex.cnote.more'), 'data-cnote': r.required || (r.free ? 'free' : 'casual'), onClick: stop },
        h('div', { class: 'cnote-top' }, h('button', { type: 'button', class: 'cnote-more cnote-close', ref: closeBtn, onClick: e => { stop(e); shut(); } }, W('dex.cnote.less'))),
        l1(true), l2,
        more.length ? h('dl', { class: 'cnote-list' }, more.map(([k, v]) => h('div', { key: k }, h('dt', null, k), h('dd', null, v)))) : null)));
}

/* 일상컷 설명(2026-11-17 한 줄 → 2026-11-25 두 줄 + 더 보기) — 도감에서 일상컷을 크게 보기 · 상세로 열었을 때만, 그 컷이 무엇으로 그려졌는지 작은 글.
   사용자 2026-11-17 「전체 목록리스트에서 보는건 지저분하니까, 상세보기나 크게보기 일 때만 보이도록」 — 목록(격자) 칸은 이 모듈을 부르지 않는다.
   사용자 2026-11-25 「… 조금 더 세부내용을 추가해줬으면 해. 가령, 장소나 포즈, 표정, 구도 등인데 어디까지 하는게 좋을지 검토해줘」 → 「응 그 범위로 진행해줘」:
     늘 보이는 두 줄 — (1) 갈래 · 의상 · 색(필수 · 코스프레 · 자유 설계 표시) (2) 장소 · 하는 일 · 구도
     「더 보기」 — 표정 · 시선 · 몸 방향 · 카메라 · 렌즈 · 빛 · 시간대 · 계절 · 날씨 · 순간 · 화면 구성 · 상황 노출 · 옷 꾸밈 · 자유 설계 · 세계 · 시대 · 화면비(있는 칸만).
     펼침은 이 탭이 열려 있는 동안 기억한다(sessionStorage — 막히면 이 쪽 안에서만).
   자료는 data/casual-index.json(tools/casual-index.cjs 가 쓴다 — 줄 끝 s 가 장면 풀이, tools/casual-detail.cjs). 크게 보기를 처음 열 때 한 번만 받고,
   받기가 실패하거나 맞는 줄이 없으면 아무것도 안 보인다. 옛 줄(s 없음)은 첫 줄만.
   그림 파일 ↔ 색인 줄: 파일 이름 규칙 <카드>_[<세계>_]<화풍>_f_casualN.webp 를 줄에서 거꾸로 지어 맞춘다(pkm 은 세계가 비어 있다).
   한글은 색인의 *Ko · s(우리가 고른 값), GPT 가 지은 글(자유 설계 Outfit 줄 · 장소 · 하는 일 · 구도 · 옛 코스프레 캐릭터)은 영어 그대로 —
   사용자 「우리쪽에서 고르는건 한글로 표시되게 해줘. gpt 쪽은 영어로 설계하니까 그건 어쩔 수 없이 놔두고」.
   sam-atelier · element-atelier · pkm-atelier · city-atelier 가 글자 하나 다르지 않게 같이 쓴다. 말은 각 공방 lib/words.js 의 dex.cnote.* .
   기본 꼴(단추 44px · 더 보기 칸 줄)은 여기서 한 번 넣고, 색 · 크기는 그 도감의 CSS(cls 자리)가 정한다. */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect } from 'https://esm.sh/preact@10.24.3/hooks';

const URL_ = 'data/casual-index.json', CUT = 90, KEY = 'cnote-open';
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
    '.cnote .cnote-list>div{display:flex;gap:6px;min-width:0}.cnote .cnote-list dt{flex:none;opacity:.7}.cnote .cnote-list dd{margin:0;min-width:0;overflow-wrap:anywhere}';
  document.head.appendChild(st);
}
/* 펼침 기억 — 이 탭 동안(막히면 이 쪽 안에서만) */
let openMem = null;
function remembered() { if (openMem == null) { try { openMem = sessionStorage.getItem(KEY) === '1'; } catch (e) { openMem = false; } } return openMem; }
function remember(v) { openMem = v; try { sessionStorage.setItem(KEY, v ? '1' : '0'); } catch (e) { /* 이 쪽 안에서만 */ } }
let uid = 0;
/* 두 줄 + 더 보기 — file 이 색인에 있으면. cls 는 그 도감의 자리 이름(색 · 크기는 그 도감의 CSS 가 정한다) */
export function CasualNote({ file, cls }) {
  const [map, setMap] = useState(null), [open, setOpen] = useState(remembered), [id] = useState(() => 'cnote-' + (++uid));
  useEffect(() => { css(); let on = true; loadIndex().then(m => { if (on) setMap(m); }); return () => { on = false; }; }, []);
  const r = map && file && map.get(file), n = r && noteOf(r);
  if (!n) return null;
  const W = window.W, o = n.outfit, cut = !!o && o.length > CUT, sc = sceneOf(r), more = moreOf(r), can = cut || more.length > 0;
  const toggle = e => { e.stopPropagation(); const v = !open; remember(v); setOpen(v); };
  const outfit = o && h('span', { lang: 'en' }, cut && !open ? o.slice(0, CUT).replace(/\s+\S*$/, '') + ' …' : o);
  return h('div', { class: 'cnote' + (cls ? ' ' + cls : ''), 'data-cnote': r.required || (r.free ? 'free' : 'casual') },
    h('p', { class: 'cnote-l1' },
      n.lead && h('b', null, n.lead),
      n.lead && (n.rest || outfit) ? ' — ' : null,
      n.rest || null, n.rest && outfit ? ' · ' : null, outfit || null,
      n.gpt && h('small', { class: 'cnote-gpt' }, W('dex.cnote.gpt'))),
    sc && h('p', { class: 'cnote-l2' }, sc.en && h('small', { class: 'cnote-tag' }, W('dex.cnote.gptscene')), sc.en ? h('span', { lang: 'en' }, sc.text) : sc.text),
    can && h('button', { type: 'button', class: 'cnote-more', 'aria-expanded': open ? 'true' : 'false', 'aria-controls': more.length ? id : undefined,
      onClick: toggle }, open ? W('dex.cnote.less') : W('dex.cnote.more')),
    more.length ? h('dl', { class: 'cnote-list', id, hidden: !open }, more.map(([k, v]) => h('div', { key: k }, h('dt', null, k), h('dd', null, v)))) : null);
}

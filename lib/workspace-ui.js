import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useRef } from 'https://esm.sh/preact@10.24.3/hooks';

/* Appearance is shared between pages; generation settings are independent. */
function useAppearance() {
  const [appearance, setAppearance] = useState(() => window.AtelierAppearance.get());
  useEffect(() => {
    const sync = () => setAppearance(window.AtelierAppearance.get());
    addEventListener('atelier-appearance', sync);
    sync();
    return () => removeEventListener('atelier-appearance', sync);
  }, []);
  return appearance;
}
/* 설정 — 메뉴 줄의 ⚙ 하나. 누르면 배경·화면 밀도가 같은 폭 두 칸으로 펼쳐지고, 아랫줄에 머리 조작이 붙는다.
   바깥을 누르거나 Esc 면 닫힌다. 펼침은 저장하지 않는다 */
export function AppearanceControls({children}) {
  const appearance = useAppearance(), W = window.W;
  const [open, setOpen] = useState(false), ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const away = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = e => { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('.appearance-toggle')?.focus(); } };
    addEventListener('pointerdown', away); addEventListener('keydown', esc);
    return () => { removeEventListener('pointerdown', away); removeEventListener('keydown', esc); };
  }, [open]);
  return h('div', {class:'appearance-controls' + (open ? ' open' : ''), ref},
    h('button', {type:'button', class:'appearance-toggle', 'aria-expanded':open, 'aria-label':W('ui.settings'), title:W('ui.settings'),
      onClick:() => setOpen(v => !v)}, h('span', {class:'theme-dot', 'aria-hidden':'true'}), h('span', {'aria-hidden':'true'}, '\u2699')),
    open && h('div', {class:'appearance-panel', role:'group', 'aria-label':W('ui.settings')},
      h('label', {class:'room-control'}, W('ui.theme'),
        h('select', {'aria-label':W('ui.theme'), value:appearance.theme,
          onChange:e => window.AtelierAppearance.set('theme', e.target.value)},
          window.AtelierAppearance.themes.map(key => h('option', {key, value:key}, W('theme.' + key))))),
      h('label', {class:'background-control'}, W('ui.background'),
        h('select', {'aria-label':W('ui.background'), value:appearance.background,
          onChange:e => window.AtelierAppearance.set('background', e.target.value)},
          ['on','off'].map(key => h('option', {key, value:key}, W('ui.background.' + key))))),
      h('label', null, W('ui.density'),
        h('select', {'aria-label':W('ui.density'), value:appearance.density,
          onChange:e => window.AtelierAppearance.set('density', e.target.value)},
          ['compact', 'relaxed'].map(key => h('option', {key, value:key}, W('ui.density.' + key))))),
      children && h('div', {class:'appearance-extra'}, children)));
}

/* 공방 문양 — 공간마다 그 이야기의 물건 하나를 작은 선으로(2026-11-02 공간 아홉): 강호 객잔의 등롱 · 도화검무의 검과 꽃 · 주칠 궁전의 지붕 ·
   금서고의 펼친 책 · 요정 숲의 버섯 · 용의 대장간의 모루와 불 · 네온 우중의 간판과 비 · 정비 격납고의 해저드 줄 · 궤도 일출의 행성과 해 */
const CREST_MARK = {jianghu:[
  ['M18 10h12M24 6v4M16 14c0-2 3-4 8-4s8 2 8 4v14c0 2-3 4-8 4s-8-2-8-4Z','line'],
  ['M16 21h16','signal'],
  ['M22 36h4v6h-4Z','primary']
],peachsword:[
  ['M10 38L34 14M30 10l8 8M14 34l-4-4','line'],
  ['M36 34m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0','signal'],
  ['M10 10h3v3h-3Z','primary']
],lacquer:[
  ['M6 18l18-10 18 10M12 18v22M36 18v22M8 40h32','line'],
  ['M18 26h12','signal'],
  ['M22 30h4v4h-4Z','primary']
],grimoire:[
  ['M24 12c-4-3-10-3-14-1v27c4-2 10-2 14 1c4-3 10-3 14-1V11c-4-2-10-2-14 1v27','line'],
  ['M30 20h4M32 18v4','signal'],
  ['M14 20h4v4h-4Z','primary']
],feywood:[
  ['M10 24c0-8 6-12 14-12s14 4 14 12ZM20 24v14h8V24','line'],
  ['M18 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M30 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0','signal'],
  ['M22 40h4v3h-4Z','primary']
],dragonforge:[
  ['M10 26h28l-6 6H16ZM20 32v8h8v-8','line'],
  ['M24 22c-4-4 0-8-2-14 5 3 7 8 4 14','signal'],
  ['M12 40h3v3h-3Z','primary']
],neonrain:[
  ['M12 8h24v16H12Z','line'],
  ['M16 30l-2 7M24 30l-2 7M32 30l-2 7','signal'],
  ['M22 14h4v4h-4Z','primary']
],hangar:[
  ['M8 40V18l16-10 16 10v22','line'],
  ['M12 40l6-8M20 40l6-8M28 40l6-8','signal'],
  ['M22 20h4v4h-4Z','primary']
],orbit:[
  ['M12 30a12 12 0 0 1 24 0M6 30h36','line'],
  ['M24 16v-7M15 20l-5-5M33 20l5-5','signal'],
  ['M22 35h4v4h-4Z','primary']
]};
const MARK_STYLE = {
  line:{stroke:'currentColor','stroke-width':2,'stroke-linejoin':'round','stroke-linecap':'round'},
  paint:{fill:'var(--signal)'},
  primary:{fill:'var(--accent)'},
  signal:{stroke:'var(--signal)','stroke-width':2.5,'stroke-linecap':'round','stroke-linejoin':'round'},
  surface:{fill:'var(--card)',stroke:'currentColor','stroke-width':2}
};
function Crest({theme}) {
  return h('svg',{class:'crest-mark',viewBox:'0 0 48 48',fill:'none','aria-hidden':'true'},
    (CREST_MARK[theme]||CREST_MARK.peachsword).map(([d,kind],i)=>h('path',{key:i,d,...MARK_STYLE[kind]})));
}
export function WorkspaceHeading({title,subtitle}) {
  const {theme}=useAppearance(),W=window.W;
  /* 문양은 첫 화면(index.html)으로 가는 링크 — 제목은 그 화면의 이름이라 링크가 아니다. 항해의 첫 화면 탭도 늘 있다 */
  return h('div',{class:'workspace-heading'},
    h('div',{class:'workspace-title'},h('a',{class:'workspace-home',href:'index.html','aria-label':W('nav.index')},h(Crest,{theme})),
      h('div',null,h('h1',null,title),h('p',null,subtitle))),
    h('div',{class:'crest-signature','aria-hidden':'true'},
      h('span',{class:'crest-name'},W('theme.' + theme)),h('i')));
}
/* The header folds: the title block hides, the navigation row (with its settings button) stays.
   The choice is a per-viewer convenience kept in this browser only — it can be missing or blocked. */
const FOLD_KEY='samguk_header_fold';
/* 화면 차례 — 머리의 항해. 화면을 더하면 여기 한 줄과 낱말 표(nav.*)를 같이 고친다 */
export const PAGES=['hall','draft','draft2','battle','dex','styles','prompt','promptapi','api'];   /* draft2 = 새 판 「삼국지 쟁탈전 · 전장」(Phaser, 2026-11-12 사용자 「네비에 안붙어있던데」) — 머리가 없는 화면이라 가기만 한다 */   /* promptapi · api = 2.5 API 프롬프트 · API 생성(2026-11-09) */   /* styles = 화풍 비교(2026-11-07) */   /* prompt2(프롬프트 v2 · 구조판, 2026-11-05)는 2026-11-11 지웠다 — 사용자 「구조판은 지워줘」 */   /* battle = 전장(2026-11-02) */   /* hall = 군막(공방 안내판) — 문양은 타이틀 화면(index.html)으로 간다(2026-11-02) */   /* draft = 게임(삼국지 쟁탈전) — 머리가 없는 화면이라 가기만 한다(2026-11-02) */   /* 화면 셋. 더하면 여기 한 줄과 낱말 표(nav.*)를 같이 고친다 */
const SUBTITLED=['prompt','promptapi','api'];
function readFold(){ try { return localStorage.getItem(FOLD_KEY)==='1'; } catch(e){ return false; } }
function writeFold(v){ try { if(v) localStorage.setItem(FOLD_KEY,'1'); else localStorage.removeItem(FOLD_KEY); } catch(e){} }
/* Every page uses the same header markup and navigation order. */
export function WorkspaceHeader({page}) {
  const W=window.W;
  const [folded,setFolded]=useState(readFold);
  const toggle=()=>setFolded(v=>{ writeFold(!v); return !v; });
  const title=page==='index'||page==='hall'?'app.title':page+'.title';
  return h('div',{class:'workspace-header'+(folded?' folded':'')},
    h(WorkspaceHeading,{title:W(title),
      subtitle:W(SUBTITLED.includes(page)?page+'.subtitle':'app.subtitle')}),
    h('div',{class:'workspace-nav-row'},
      h('nav',{class:'workspace-nav'},PAGES.map(key=>
        h('a',{key,href:key+'.html','aria-current':key===page?'page':undefined},
          W('nav.'+key)))),
      h(AppearanceControls,null,
        h('button',{type:'button',class:'header-fold','aria-expanded':!folded,
          'aria-label':W(folded?'ui.header.unfold':'ui.header.fold'),title:W(folded?'ui.header.unfold':'ui.header.fold'),onClick:toggle},
          W(folded?'ui.header.unfold':'ui.header.fold.short')))));
}
export function ThemeGallery() {
  const {theme,background}=useAppearance(),W=window.W;
  return h('section',{class:'room-preview','aria-label':W('home.themes')},
    h('div',{class:'room-preview-art','aria-hidden':'true'}),
    h('div',{class:'room-preview-copy'},
      h('p',{class:'editorial-kicker'},W('home.themes')),
      h('h2',null,W('theme.'+theme)),h('p',null,W('theme.note.'+theme)),
      h('div',{class:'room-choices',role:'group','aria-label':W('ui.theme')},
        window.AtelierAppearance.themes.map(key=>h('button',{key,type:'button',
          class:'room-choice','aria-pressed':theme===key,
          onClick:()=>window.AtelierAppearance.set('theme',key)},W('theme.'+key)))),
      h('button',{type:'button',class:'room-background-toggle',
        onClick:()=>window.AtelierAppearance.set('background',background==='on'?'off':'on')},
        W(background==='on'?'ui.background.hide':'ui.background.show'))));
}

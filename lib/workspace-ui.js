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

/* 공방 문양 — 공간마다 삼국지의 물건 하나를 작은 선으로 그린다(군막의 깃발 · 성루의 달 · 서고의 죽간 · 대숲의 대 · 지휘소의 레이더 · 적벽의 불배 · 도원의 복사꽃 · 설원의 눈꽃 · 동작대의 누대와 참새, 2026-11-02) */
const CREST_MARK = {sunlit:[
  ['M14 42V6','line'],
  ['M14 8h22l-5 7 5 7H14','line'],
  ['M20 12h8','signal'],
  ['M12 40h4v3h-4Z','primary']
],moonlit:[
  ['M30 8a12 12 0 1 0 8 20A10 10 0 0 1 30 8Z','line'],
  ['M6 42V34h6v3h6v-3h6v3h6v-3h6v3h6v5','signal'],
  ['M20 20h3v3h-3Z','primary']
],hanok:[
  ['M10 10h28v28H10Z','line'],
  ['M16 10v28M22 10v28M28 10v28M34 10v28','signal'],
  ['M8 24h4v3H8Z','primary']
],forest:[
  ['M20 44V4M20 16h0M20 28h0','line'],
  ['M17 16h6M17 28h6','signal'],
  ['M20 18c6-2 10-6 14-12M20 30c-6-2-10-6-14-10','line'],
  ['M32 6h3v3h-3Z','primary']
],phosphor:[
  ['M24 24m-17 0a17 17 0 1 0 34 0a17 17 0 1 0-34 0','line'],
  ['M24 24m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0','line'],
  ['M24 24L36 12','signal'],
  ['M30 30h3v3h-3Z','primary']
],redcliff:[
  ['M10 30c4-3 8 3 12 0s8-3 12 0 6 2 6 2','line'],
  ['M24 26c-5-6 1-10-1-18 6 4 9 10 5 18','signal'],
  ['M8 38h32','line'],
  ['M22 34h4v3h-4Z','primary']
],peach:[
  ['M24 14m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M15 22m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M33 22m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M18 32m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M30 32m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0','line'],
  ['M24 23m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0','signal'],
  ['M23 40h3v3h-3Z','primary']
],snow:[
  ['M24 6v36M8 15l32 18M8 33l32-18','line'],
  ['M20 9l4 4 4-4M20 39l4-4 4 4','signal'],
  ['M22 22h4v4h-4Z','primary']
],bronze:[
  ['M12 40h24M16 40V22h16v18M14 22l10-10 10 10','line'],
  ['M24 6c3 0 5 2 5 4s-2 3-5 3-5-1-5-3 2-4 5-4Z','signal'],
  ['M22 30h4v4h-4Z','primary']
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
    (CREST_MARK[theme]||CREST_MARK.sunlit).map(([d,kind],i)=>h('path',{key:i,d,...MARK_STYLE[kind]})));
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
export const PAGES=['index','draft','dex','prompt'];   /* draft = 게임(삼국지 쟁탈전) — 머리가 없는 화면이라 가기만 한다(2026-11-02) */   /* 화면 셋. 더하면 여기 한 줄과 낱말 표(nav.*)를 같이 고친다 */
const SUBTITLED=['prompt'];
function readFold(){ try { return localStorage.getItem(FOLD_KEY)==='1'; } catch(e){ return false; } }
function writeFold(v){ try { if(v) localStorage.setItem(FOLD_KEY,'1'); else localStorage.removeItem(FOLD_KEY); } catch(e){} }
/* Every page uses the same header markup and navigation order. */
export function WorkspaceHeader({page}) {
  const W=window.W;
  const [folded,setFolded]=useState(readFold);
  const toggle=()=>setFolded(v=>{ writeFold(!v); return !v; });
  const title=page==='index'?'app.title':page+'.title';
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

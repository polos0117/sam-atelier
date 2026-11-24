/* 크게 보기 「꽉 채우기」(2026-11-24 사용자 「1:1이 모바일에선 티가 잘 안나는것같네. 크게보기가 전체화면이 아니라서 그런가」 → 「2번만 할까 그럼?」).
   휴대폰 세로 화면에서 크게 보기는 그림을 너비에 맞춰 1:1 · 3:2 그림이 작다 — 그 그림을 칸 높이에 맞춰 크게 펴고, 옆으로 밀어 본다.
   삼국지 · 원소 · 도시 · 포켓몬 공방이 글자 하나 다르지 않게 나눠 쓴다(고치면 네 저장소에 같이).

   const F = useFill(file, { box, off });
   · 칸(stage)에 ref: F.stageRef — 맞춤 보기에서 그림이 받을 수 있는 칸(너비 × 높이)을 잰다.
       box 'parent' = 칸이 그림 크기만큼 줄어드는 꼴(너비는 칸을 담은 부모의 안쪽 너비), 'stage' = 칸이 제 자리를 다 차지하는 꼴(칸의 안쪽 너비).
       높이는 그림의 max-height 가 px 이면 그것, 아니면(100% 따위) 칸의 안쪽 높이.
   · 그림이 그 칸보다 뚜렷이 넓을 때만(가로세로 비가 칸의 비 × MARGIN 보다 클 때) F.can — 단추를 보인다. 2:3 · 데스크톱 · 펼친 폴드 · 가로 화면은 안 뜬다.
   · F.on 이면 그림을 F.frame(h, 그림) 으로 감싼다 — 감싼 칸(.fill-scroll)이 칸 높이 · 옆으로 굴림, 그림은 높이에 맞춘 크기(CSS 변수 --fill-w · --fill-h).
     맞춤 보기에선 감싸지 않으니 모양이 그대로다.
   · 두 번 누르기(손가락) · 두 번 누르기(마우스)는 F.tap 을 칸에 펼쳐 붙인다(그림 위에서만 듣는다). 단추는 F.toggle.
   · 그림이 바뀌면(file) · 화면 크기가 바뀌면 맞춤으로 돌아가고 다시 잰다. off 면 내놓지 않는다(원본 크기 · 확대 같은 다른 보기가 켜졌을 때). */
import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'https://esm.sh/preact@10.24.3/hooks';

export const MARGIN = 1.4;
const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
/* 맞춤 보기에서 그림이 받을 수 있는 칸 */
export function fitBox(stage, img, mode) {
  const par = mode === 'stage' ? stage : stage.parentElement || stage, pc = getComputedStyle(par), sc = getComputedStyle(stage);
  const w = par.clientWidth - num(pc.paddingLeft) - num(pc.paddingRight);
  const mh = getComputedStyle(img).maxHeight;
  const h = /px$/.test(mh) ? num(mh) : stage.clientHeight - num(sc.paddingTop) - num(sc.paddingBottom);
  return { w: Math.floor(w), h: Math.floor(h) };
}
export const wide = (nat, box) => !!(nat && box && box.w > 0 && box.h > 0 && nat.h > 0 && nat.w / nat.h > (box.w / box.h) * MARGIN);

export function useFill(file, opt) {
  const o = opt || {}, off = !!o.off;
  const [st, setSt] = useState({ can: false, box: null, nat: null, file: null });
  const [onFile, setOnFile] = useState(null);
  const can = !off && st.can && st.file === file;
  const on = can && onFile === file;
  const stage = useRef(null), scroll = useRef(null), live = useRef({}), tapAt = useRef({ t: 0, x: 0, y: 0, touch: 0 });
  live.current = { file, on, can, off, mode: o.box };
  const measure = () => {
    const L = live.current, el = stage.current;
    if (!el || L.on) return;
    const img = el.querySelector('img');
    if (!img || !img.naturalWidth || !img.isConnected) { setSt(s => s.can || s.file !== L.file ? { can: false, box: null, nat: null, file: L.file } : s); return; }
    const box = fitBox(el, img, L.mode), nat = { w: img.naturalWidth, h: img.naturalHeight }, c = wide(nat, box);
    setSt(s => s.can === c && s.file === L.file && s.box && s.box.w === box.w && s.box.h === box.h && s.nat && s.nat.w === nat.w && s.nat.h === nat.h ? s : { can: c, box, nat, file: L.file });
  };
  live.current.measure = measure;
  /* 칸의 그림이 다 오면(load 는 거품이 안 올라와 잡아채기로) 잰다 */
  const stageRef = useMemo(() => {
    const load = () => live.current.measure();
    return el => { if (stage.current) stage.current.removeEventListener('load', load, true); stage.current = el; if (el) el.addEventListener('load', load, true); };
  }, []);
  useLayoutEffect(() => { measure(); }, [file, on, off]);
  useEffect(() => {
    const r = () => { if (live.current.on) setOnFile(null); else live.current.measure(); };
    addEventListener('resize', r); addEventListener('orientationchange', r);
    return () => { removeEventListener('resize', r); removeEventListener('orientationchange', r); };
  }, []);
  /* 펴면 가운데부터 */
  useLayoutEffect(() => { const sc = scroll.current; if (on && sc) sc.scrollLeft = Math.max(0, (sc.scrollWidth - sc.clientWidth) / 2); }, [on]);
  const toggle = () => { const L = live.current; if (!L.can && !L.on) return; setOnFile(L.on ? null : L.file); };
  live.current.toggle = toggle;
  const onImg = e => !!(e.target && e.target.closest && (e.target.tagName === 'IMG' || e.target.closest('.fill-scroll')) && !e.target.closest('button'));
  const tap = {
    onPointerUp: e => {
      if (e.pointerType === 'touch') tapAt.current.up = Date.now();
      if (e.pointerType !== 'touch' || !onImg(e)) return;
      const T = tapAt.current, now = Date.now();
      if (now - T.t < 350 && Math.hypot(e.clientX - T.x, e.clientY - T.y) < 30) { T.t = 0; T.touch = now; live.current.toggle(); }
      else { T.t = now; T.x = e.clientX; T.y = e.clientY; }
    },
    onPointerCancel: () => { tapAt.current.t = 0; },
    /* 마우스의 두 번 누르기만 — 손가락 두 번은 위에서 센다. 손가락으로 느리게 두 번(한 번 누르기 둘) 누르면 브라우저가 dblclick 을 또 쏘아 두 배 반 뒤에 꽉 채우기가 켜졌다 */
    onDblClick: e => { const T = tapAt.current; if (!onImg(e) || Date.now() - Math.max(T.touch, T.up || 0) < 1000 || (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents)) return; e.preventDefault(); live.current.toggle(); },
  };
  const frame = (h, child) => {
    if (!on || !st.box || !st.nat) return child;
    const hh = st.box.h, ww = Math.round(hh * st.nat.w / st.nat.h);
    return h('div', { class: 'fill-scroll', ref: scroll, style: { '--fill-h': hh + 'px', '--fill-w': ww + 'px' } }, child);
  };
  /* 단추가 쓰는 꼴 — 낱말은 공방마다의 표에서 */
  const button = (h, labels, cls) => can ? h('button', { type: 'button', class: 'fill-toggle' + (cls ? ' ' + cls : ''), 'aria-pressed': on ? 'true' : 'false', onClick: toggle }, on ? labels[1] : labels[0]) : null;
  return { can, on, toggle, stageRef, tap, frame, button, reset: () => setOnFile(null) };
}

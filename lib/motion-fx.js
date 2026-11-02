/* 움직임 모음(2026-11-02, 사용자 「Framer Motion 으로 전장에 이펙트, 갤러리 모션을 더 다듬기」).
   Framer Motion 은 React 전용이라 같은 팀의 Motion 작은 판(lib/vendor/motion-mini.mjs — animate + spring, 압축 5KB)을 쓴다.
   - 위치 · 크기 · 투명도만 움직인다(브라우저 합성만 — 전시관의 뷰 전환이 폰에서 3초 넘게 터치를 붙잡던 일을 되풀이하지 않는다)
   - 움직임 줄이기면 아무것도 하지 않는다. 움직임이 실패해도 화면은 끝 상태 그대로다(애니메이션은 꾸밈일 뿐)
   sam-atelier · element-atelier 가 글자 하나 다르지 않게 같이 쓴다 — 고치면 둘 다. */
import { animate, spring } from './vendor/motion-mini.mjs';

export const reduce = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
const SPRING = { type: spring, stiffness: 460, damping: 32 };   /* 빨리 자리 잡는 쪽 — 움직이는 동안 누르기를 오래 막지 않게 */
const SOFT = { type: spring, stiffness: 320, damping: 32 };
const run = (el, kf, opt) => { if (!el || reduce()) return null; try { return animate(el, kf, opt); } catch (e) { return null; } };

/* 깃발 꽂기 — 위에서 떨어져 꽂히며 살짝 튕긴다 */
export function plant(el) {
  return run(el, { transform: ['translateY(-46px) scale(1.18)', 'translateY(0) scale(1)'], opacity: [0, 1] }, { type: spring, stiffness: 420, damping: 15 });
}
/* 툭 나타나기 — 판 · 창 */
export function pop(el, from = 0.94) {
  return run(el, { transform: [`scale(${from})`, 'scale(1)'], opacity: [0, 1] }, SPRING);
}
/* 차례로 나타나기 — 이름표들. 너무 길어지지 않게 전체 0.45초 안에 */
export function stagger(els, { y = 10, each = 0.018, max = 0.45 } = {}) {
  if (reduce()) return;
  const list = Array.from(els || []), step = Math.min(each, max / Math.max(1, list.length));
  list.forEach((el, i) => run(el, { transform: [`translateY(${y}px)`, 'translateY(0)'], opacity: [0, 1] }, { duration: 0.32, delay: i * step, ease: [0.2, 0.7, 0.2, 1] }));
}
/* 날아와 커지기 — from(누른 것의 자리, DOMRect)에서 el 의 제자리로. FLIP 한 장만(뷰 전환 대신) */
export function flyFrom(from, el) {
  if (!from || !el || reduce()) return null;
  const to = el.getBoundingClientRect();
  if (!to.width || !to.height) return null;
  const dx = from.left + from.width / 2 - (to.left + to.width / 2), dy = from.top + from.height / 2 - (to.top + to.height / 2);
  const s = Math.max(0.05, Math.min(from.width / to.width, from.height / to.height));
  el.style.transformOrigin = '50% 50%';
  return run(el, { transform: [`translate(${dx}px,${dy}px) scale(${s})`, 'translate(0,0) scale(1)'], opacity: [0.4, 1] }, SOFT);
}
/* 가운데에서 퍼지기 — 궤도 이름표가 핵에서 튀어나와 제자리로. center 는 퍼지는 중심(DOMRect) */
export function burst(els, center, { each = 0.035 } = {}) {
  if (!center || reduce()) return;
  const cx = center.left + center.width / 2, cy = center.top + center.height / 2;
  Array.from(els || []).forEach((el, i) => {
    const r = el.getBoundingClientRect(), dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
    const base = getComputedStyle(el).transform, keep = base && base !== 'none' ? base + ' ' : '';
    run(el, { transform: [`${keep}translate(${dx}px,${dy}px) scale(.3)`, `${keep}translate(0,0) scale(1)`], opacity: [0, 1] }, { type: spring, stiffness: 400, damping: 28, delay: 0.04 + i * each });
  });
}
/* 선 그리기 — pathLength=1 인 선을 처음부터 끝까지 */
export function draw(path, { delay = 0 } = {}) {
  if (!path || reduce()) return null;
  return run(path, { strokeDashoffset: [1, 0] }, { duration: 0.7, delay, ease: [0.3, 0.6, 0.2, 1] });
}

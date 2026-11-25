/* 일상컷 장면 풀이(2026-11-25) — 색인 한 줄(data/casual-index.json rows[].s)에 「이 그림이 어떤 장면으로 그려졌나」 를 한글로.
   사용자 2026-11-25 「크게보기에서 이 그림이 어떤 갈래에 어떤 의상과 색상으로 만들어졌는지 … 조금 더 세부내용을 추가해줬으면 해. 가령, 장소나 포즈, 표정, 구도 등인데
   어디까지 하는게 좋을지 검토해줘」 → 「응 그 범위로 진행해줘」:
     늘 보이는 둘째 줄 — pl 장소 · act 하는 일(소품 동작 → 자세 이름 → 자세) · fr 구도
     「더 보기」 — ex 표정 · gz 시선 · bd 몸 방향 · cam 카메라 · ln 렌즈 · lt 빛 · tm 시간대 · ss 계절 · wt 날씨 · mo 순간 · cp 화면 구성 · si 상황 노출 · os 옷 꾸밈 · era 시대 · ar 화면비
     뺀 것 — 왼손 · 오른손 따로 · 받침 · 고개 방향 같은 속 값.
   자유 설계 컷(장소 · 하는 일 · 구도를 GPT 가 지은 컷)은 우리 장면 값이 그림자라 싣지 않고, 기록에 GPT 가 채운 줄(Place · Activity · Framing)이 있으면 그 영어 그대로(en: 1).
   옛 기록은 있는 칸만 — 표에 없는 값 · 빈 값은 칸째 뺀다(화면에 undefined 가 나오지 않게).
   네 공방(sam · element · pkm · city)이 글자 하나 다르지 않게 같이 쓴다 — 공방마다 다른 것은 표(lib/prompt-spec.js · data/casual-tree*.json · 도시 data/city-life.json)가 정한다.

     const detail = require('./casual-detail.cjs')(ROOT);   // 표를 한 번 읽는다
     row.s = detail(scene, rec, card) || undefined;         // 보일 것이 없으면 null */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');

const FRAME_KO = { face_close: '얼굴 클로즈업', detail: '디테일', chest_up: '가슴 위', waist_up: '허리 위', three_quarter: '3/4', full_body: '전신', environmental: '환경' };
const AXES = ['material', 'wear', 'fit', 'layer', 'acc'];

module.exports = function make(root) {
  const read = f => { try { return fs.readFileSync(path.join(root, f), 'utf8'); } catch (e) { return null; } };
  const json = f => { const t = read(f); try { return t ? JSON.parse(t) : null; } catch (e) { return null; } };
  const ctx = { window: {}, console }; vm.createContext(ctx);
  for (const f of ['lib/prompt-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js']) { const t = read(f); if (t) vm.runInContext(t, ctx); }
  const S = ctx.window.AtelierSpec || {}, C2 = ctx.window.AtelierCasualTreeV2;
  const tree = json('data/casual-tree.json') || {}, tree2 = json('data/casual-tree-v2.json') || {}, life = json('data/city-life.json'), own = (json('data/casual-own.json') || {}).cards || {};
  let T2 = null; try { T2 = C2 && C2.make(tree2, tree); } catch (e) { T2 = null; }
  const CA = S.CASUAL || {};

  const str = v => (typeof v === 'string' ? v.trim() : '');
  const by = (list, k) => (Array.isArray(list) && k ? list.find(x => x && x.key === k) : null) || null;
  const ko = x => (x && str(x.ko)) || '';
  const first = (...xs) => xs.find(Boolean) || '';
  const head = s => String(s || '').split(' — ')[0].trim();   /* 「젖은 옷 — 비 · 물 튐」 → 앞 이름 */

  const cityOf = card => { const c = life && life.cities || {}; return c[card] ? card : c[String(card || '').split('-')[0]] ? String(card).split('-')[0] : ''; };
  function placeKo(k, card) {
    if (!k) return '';
    if (life && life.cities) for (const [city, c] of Object.entries(life.cities)) { const sc = (c.scenes || []).find(x => city + '_' + x.key === k); if (sc) return ko(sc); }
    let p = null; try { p = T2 && C2.place(T2, k); } catch (e) { p = null; }
    return first(ko(p), ko(by(tree.places, k)), ko(by(tree2.extra_places, k)));
  }
  const exprKo = k => { if (!k) return ''; const o = (S.EXPRESSION_OPTIONS || []).find(x => x[0] === k); return o ? (String(o[1]).split(' — ')[1] || '').trim() : ''; };
  const lensKo = k => { const g = (S.LENS_GUIDES || {})[k]; return g ? String(g[0]).split(':')[0].trim() : ''; };
  const list = name => [CA[name], S[name.toUpperCase()], tree2[name], tree[name]].filter(Array.isArray);
  const inLists = (name, k) => { for (const l of list(name)) { const x = by(l, k); if (ko(x)) return ko(x); } return ''; };
  function actKo(s) {
    const u = s.use && by(tree2.prop_uses, s.use), pr = s.preset && by(tree2.presets, s.preset), po = s.posture && by(tree2.postures, s.posture);
    return first(ko(u), ko(pr), ko(po), ko(by(tree.activities, s.act)));
  }
  function ostyleKo(o) {
    if (!o || typeof o !== 'object') return '';
    const ax = (tree2.outfit_style || {}).axes || {};
    return AXES.concat(Object.keys(o).filter(k => !AXES.includes(k))).map(a => o[a] && ko(by((ax[a] || {}).options, o[a]))).filter(Boolean).join(' · ');
  }
  function eraKo(k) { if (!k) return ''; let e = null; try { e = T2 && C2.era(T2, k); } catch (x) { e = null; } return first(ko(e), ko(by(tree.eras, k))); }

  /* GPT 가 채운 자유 설계 줄 — free_design { Place … } · [Place, Activity, Pose, Framing, Outfit] · 글 속 「Place: …」. 「…」 로 시작하는 빈 틀은 건너뛴다 */
  const filled = v => { v = str(v); return v && !/^…/.test(v) ? v : ''; };
  function gptDesign(r) {
    const g = r.generation || {}, fd = g.free_design, out = { pl: '', act: '', fr: '' };
    if (fd && typeof fd === 'object' && !Array.isArray(fd)) { out.pl = filled(fd.Place || fd.place); out.act = filled(fd.Activity || fd.activity) || filled(fd.Pose || fd.pose); out.fr = filled(fd.Framing || fd.framing); }
    else if (Array.isArray(fd)) { out.pl = filled(fd[0]); out.act = filled(fd[1]) || filled(fd[2]); out.fr = filled(fd[3]); }
    const texts = [typeof fd === 'string' ? fd : '', g.free_prompt, g.prompt, r.prompt].filter(t => typeof t === 'string');
    /* 한 줄에 칸 여럿을 이은 꼴(「Place: a bath. Composition: … Outfit: …」)은 다음 「Xxx:」 앞까지 */
    const cut = v => String(v).replace(/\s+[A-Z][A-Za-z ]{0,24}:\s[\s\S]*$/, '').trim();
    const line = name => { for (const t of texts) for (const m of t.matchAll(new RegExp('(?:^|\\n)[ \\t]*' + name + ':[ \\t]*([^\\n]*)', 'g'))) { const v = filled(cut(m[1])); if (v) return v; } return ''; };
    if (!out.pl) out.pl = line('Place');
    if (!out.act) out.act = line('Activity') || line('Pose');
    if (!out.fr) out.fr = line('Framing');
    return out;
  }
  const promptText = r => { const g = r.generation || {}; return [g.free_design, g.free_prompt, g.prompt, r.prompt].filter(t => typeof t === 'string').join('\n'); };

  return function detail(scene, rec, card) {
    const s = scene && typeof scene === 'object' ? scene : {}, r = rec || {};
    const fd = (r.generation || {}).free_design, gpt = !!(s.sfree || s.xfree) || !!(fd && typeof fd === 'object') || /design the place/i.test(promptText(r));
    const city = cityOf(card), out = {};
    const put = (k, v) => { v = str(v); if (v) out[k] = v; };
    const ownCut = !gpt && !!(s.own || s.placeText);
    if (gpt) {
      const d = gptDesign(r);
      put('pl', d.pl); put('act', d.act); put('fr', d.fr);
      if (out.pl || out.act || out.fr) out.en = 1;
    } else {
      if (ownCut) {
        /* 캐릭터만의 컷 — 장소는 직업 표의 글(영어)이 정하고 장면 장소는 받침일 뿐이라 싣지 않는다. 하는 일은 그 직업 */
        const w = (own[card] || {}).worlds || {}, job = str((r.own || {}).job_ko) || str((w[r.world] || w.all || {}).job_ko);
        put('act', job ? job + ' 일' : '');
      } else { put('pl', placeKo(s.place, card)); put('act', actKo(s)); }
      put('fr', FRAME_KO[s.frame] || '');
      put('ex', exprKo(s.expr)); put('gz', ko(by(tree2.gaze, s.gaze))); put('bd', ko(by(tree2.body, s.body))); put('cam', ko(by(tree2.camera, s.camera)));
      put('ln', lensKo(s.lens || (s.frame && (tree2.lens || {})[s.frame]) || ''));
      put('lt', ko(by(tree2.light, s.light)));
      put('mo', ko(by(tree2.moments, s.moment)));
      put('cp', ['spot', 'depth', 'view'].map(k => ko(by(tree2[k], s[k]))).filter(Boolean).join(' · '));
      if (s.situ && s.situ !== 'free') put('si', head(inLists('situations', s.situ)));
      if (!ownCut) put('os', ostyleKo(s.ostyle));
    }
    /* 시간 · 철 · 날씨는 자유 설계 컷에도 우리가 정해 싣는다(「Time of day (fixed)」) */
    put('tm', first(city && ko(by(life.times, s.time)), inLists('times', s.time)));
    if (city) { put('ss', ko(by((life.seasons || {})[city], s.season))); put('wt', ko(by((life.weather || {})[city], s.cityWeather))); }
    if (!out.wt) put('wt', ko(by(tree2.weather, s.weather)));
    if (!gpt && !ownCut) put('era', eraKo(s.era));
    put('ar', /^\d+:\d+$/.test(str(s.aspect)) ? s.aspect : '');
    return Object.keys(out).length ? out : null;
  };
};

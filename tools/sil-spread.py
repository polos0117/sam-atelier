#!/usr/bin/env python3
"""실루엣 고르게 나누기 — 장수마다 세계별 실루엣(worlds.<세계>.sil)을 정한다(사용자 2026-11-06 「우리 실루엣 추가했잖아. 그것도 장수마다 고르게 분배하자」).

  python3 tools/sil-spread.py           비어 있는 장수 · 세계만 채운다(이미 적힌 값은 건드리지 않는다)
  python3 tools/sil-spread.py --check   모든 장수 · 세계에 표에 있는 실루엣이 있는지, 갈래마다 몇 명인지만 본다(안 쓴다)
  python3 tools/sil-spread.py --rebalance   갈래마다 수의 차(가장 많은 - 가장 적은)가 2 를 넘는 세계만 다시 고르게(2026-11-24):
                                            그 세계 그림이 없는 시안 장수(draft)만, 가장 많이 쓴 갈래에서 역할 묶음 안의 가장 덜 쓴 갈래로 한 명씩 옮긴다
                                            (같은 무리 — 군웅은 camp, 나머지는 세력 — 에서 덜 쓴 갈래 먼저). 그린 장수 · 확정(hand) 장수는 그대로

나누는 법 — 역할마다 어울리는 갈래 묶음(lib/prompt-spec.js SIL_POOLS) 안에서, 지금까지 가장 적게 쓰인 갈래를 고른다
(같으면 그 세력에서 덜 쓰인 것, 그래도 같으면 열쇠 해시). 장수 순서도 해시라 다시 돌려도 같은 결과.
실루엣 열쇠는 lib/prompt-spec.js 의 SAMGUK_SILHOUETTES · FANTASY_SILHOUETTES · MECHA_SILHOUETTES 에서 읽는다.
"""
import hashlib, json, re, sys, collections, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESIGN = os.path.join(ROOT, 'data', 'sam-design.json')
SPEC = os.path.join(ROOT, 'lib', 'prompt-spec.js')
WORLDS = {'samguk': 'SAMGUK_SILHOUETTES', 'fantasy': 'FANTASY_SILHOUETTES', 'mecha': 'MECHA_SILHOUETTES'}

# 역할 → 세계 → 어울리는 갈래 — lib/prompt-spec.js 의 SIL_POOLS 한 곳에서 읽는다(GPT 임의 설계 주문의 의상 목록도 같은 묶음, 2026-11-09).
# 모든 갈래가 적어도 한 역할에 들어 있어야 한다(검사).


def spec_pools():
    src = open(SPEC, encoding='utf-8').read()
    m = re.search(r'var SIL_POOLS = (\{.*?\n  \});', src, re.S)
    body = re.sub(r'/\*.*?\*/', '', m.group(1), flags=re.S)
    return json.loads(re.sub(r'(\w+):', r'"\1":', body.replace("'", '"')))


POOLS = spec_pools()


def spec_keys():
    src = open(SPEC, encoding='utf-8').read()
    out = {}
    for w, name in WORLDS.items():
        m = re.search(r'var ' + name + r' = \[(.*?)\n  \];', src, re.S)
        out[w] = re.findall(r"\{ key: '([a-z_]+)'", m.group(1))
    return out


def h(s):
    return hashlib.sha1(s.encode('utf-8')).hexdigest()


SPREAD_MAX = 2   # --rebalance 가 맞추는 차 — tests/prompt-v2.cjs 는 3 까지 받는다(새 묶음이 한 칸 기울 여유)


def drawn_in(img, key, w):
    """그 장수가 그 세계 그림을 어느 화풍으로든 가졌나 — 그린 그림과 설계가 어긋나지 않게 옮기지 않는다."""
    for st in ((img.get(key) or {}).get('byStyle') or {}).values():
        if (((st.get('byForm') or {}).get(w)) or {}).get('f'):
            return True
    return False


def rebalance(G, keys, img):
    moved = []
    for w in WORLDS:
        grp = lambda g: g.get('camp') or g['faction'] if g['faction'] == 'qun' else g['faction']
        cnt, gcnt = collections.Counter({k: 0 for k in keys[w]}), collections.Counter()
        for g in G:
            s = g['worlds'][w]['sil']
            cnt[s] += 1
            gcnt[(grp(g), s)] += 1
        free = [g for g in G if g.get('designed') != 'hand' and not drawn_in(img, g['key'], w)]
        while max(cnt.values()) - min(cnt.values()) > SPREAD_MAX:
            hi, lo = max(cnt.values()), min(cnt.values())
            best = None
            for g in free:
                src = g['worlds'][w]['sil']
                for dst in POOLS[g['role']][w]:
                    if cnt[src] - cnt[dst] < 2 or (cnt[src] != hi and cnt[dst] != lo):
                        continue
                    rank = (-(cnt[src] - cnt[dst]), gcnt[(grp(g), dst)] - gcnt[(grp(g), src)], h(g['key'] + '|' + w + '|' + dst))
                    if best is None or rank < best[0]:
                        best = (rank, g, src, dst)
            if best is None:
                break
            _, g, src, dst = best
            g['worlds'][w]['sil'] = dst
            cnt[src] -= 1; cnt[dst] += 1
            gcnt[(grp(g), src)] -= 1; gcnt[(grp(g), dst)] += 1
            free.remove(g)   # 한 장수는 세계마다 한 번만 옮긴다
            moved.append('%s %s: %s → %s' % (g['key'], w, src, dst))
    return moved


def main():
    check = '--check' in sys.argv
    if '--rebalance' in sys.argv:
        raw = open(DESIGN, encoding='utf-8').read()
        D = json.loads(raw)
        img = json.load(open(os.path.join(ROOT, 'data', 'img.json'), encoding='utf-8'))['img']
        moved = rebalance(D['generals'], spec_keys(), img)
        if moved:
            ind = 1 if raw.startswith('{\n "') else 2
            open(DESIGN, 'w', encoding='utf-8').write(json.dumps(D, ensure_ascii=False, indent=ind) + ('\n' if raw.endswith('\n') else ''))
        print('\n'.join(moved))
        print('옮김 %d' % len(moved))
        sys.argv = [sys.argv[0], '--check']
        check = True
    keys = spec_keys()
    errs = []
    for role, ws in POOLS.items():
        for w, ks in ws.items():
            errs += ['%s %s: 표에 없는 갈래 %s' % (role, w, k) for k in ks if k not in keys[w]]
    for w, ks in keys.items():
        used = set(k for ws in POOLS.values() for k in ws[w])
        errs += ['%s: 어느 역할에도 없는 갈래 %s' % (w, k) for k in ks if k not in used]
    raw = open(DESIGN, encoding='utf-8').read()
    D = json.loads(raw)
    G = D['generals']
    filled = 0
    counts = {}
    for w in WORLDS:
        cnt, fcnt = collections.Counter(), collections.Counter()
        for g in G:
            s = ((g.get('worlds') or {}).get(w) or {}).get('sil')
            if s:
                cnt[s] += 1
                fcnt[(g['faction'], s)] += 1
        for g in sorted(G, key=lambda g: h(g['key'] + '|' + w)):
            gw = g.setdefault('worlds', {}).setdefault(w, {})
            if gw.get('sil'):
                if gw['sil'] not in keys[w]:
                    errs.append('%s %s: 표에 없는 실루엣 %s' % (g['key'], w, gw['sil']))
                continue
            if check:
                errs.append('%s %s: 실루엣 없음' % (g['key'], w))
                continue
            pool = POOLS[g['role']][w]
            pick = min(pool, key=lambda k: (cnt[k], fcnt[(g['faction'], k)], h(g['key'] + '|' + k)))
            gw['sil'] = pick
            cnt[pick] += 1
            fcnt[(g['faction'], pick)] += 1
            filled += 1
        counts[w] = cnt
    for g in G:   # 빈 worlds 자리는 남기지 않는다
        if g.get('worlds') == {}:
            del g['worlds']
    if errs:
        print('\n'.join(errs))
        sys.exit(1)
    if not check and filled:
        ind = 1 if raw.startswith('{\n "') else 2
        open(DESIGN, 'w', encoding='utf-8').write(json.dumps(D, ensure_ascii=False, indent=ind) + ('\n' if raw.endswith('\n') else ''))
    for w in WORLDS:
        c = counts[w]
        print('%s — 갈래 %d · 최소 %d · 최대 %d — %s' % (w, len(keys[w]), min(c[k] for k in keys[w]), max(c.values()), ' '.join('%s %d' % (k, c[k]) for k in keys[w])))
    print('채움 %d' % filled if not check else '실루엣 맞음 — 장수 %d' % len(G))


if __name__ == '__main__':
    main()

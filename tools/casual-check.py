"""일상컷 묶음 검사(2026-11-02) — 세계마다 여섯 장 중 세 장은 정해 둔 갈래로(2026-11-09 — 전엔 다섯 장 중 두 장)(사용자 「란제리풍·수영복·역할극, 세계 안의 방·목욕·지붕·여관·서재·부엌·군영 이거는 각각 1장해서 2장은 확정으로」).

  노출 갈래 한 장  — 의상 계열이 란제리풍 · 수영복 · 역할극 (casual-tree.json required.outfits)
  세계 안 갈래 한 장 — 시대 「세계 안」 의 방 · 목욕탕 · 지붕 · 여관 · 서재 · 부엌 · 군영 · 정원 · 다리 · 사당 · 숲길 · 나루에서 홈웨어 · 란제리 · 목욕 차림 · 수영복 (required.world)
  상황 노출 한 장   — 젖은 옷 · 바람 · 반쯤 푼 차림 · 흘러내린 어깨끈(scene.situ, 2026-11-09 「1번 내용을 필수갈래에」), 위 두 갈래가 아닌 컷
  세 장은 서로 다른 컷이어야 한다(한 장이 둘 다 맞아도 한 갈래만 채운다). 나머지 세 장은 자유. 옛 묶음(상황 갈래 전 — 기록 scene 에 situ 칸이 아예 없다)은 상황 칸이 없어도 된다.

그림 저장소(sam-atelier-img)의 기록 records/<장수>/<세계>-casualN.<화풍>-ui.json 의 scene 을 읽는다.
  python3 tools/casual-check.py                 # 일상컷이 있는 장수 전부
  python3 tools/casual-check.py 관우 조운        # 몇 명만
  python3 tools/casual-check.py --plan 관우      # 아직 안 그린 칸에 무엇을 넣어야 하나
세계 사이 겹침도 함께 본다(사용자 2026-11-02 「무협·판타지·메카가 다 같은 구도의 장면」) — 세 세계가 같은 장면을 쓰면 안 된다:
  같은 장소(세계 안 nation_* 장소는 세계마다 다른 곳이 되니 옷 계열까지 같을 때만) · 같은 자세 추천(= 같은 구도).
  계획기(tools/casual-plan.cjs)와 같은 규칙이다. 옛 묶음의 겹침은 알리기만 하고 실패로 치지 않는다(덮지 않고 새 묶음을 더한다).
그림 저장소 자리는 SAM_IMG 환경 변수(기본 ../sam-atelier-img)."""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMGR = os.environ.get('SAM_IMG') or os.path.join(os.path.dirname(ROOT), 'sam-atelier-img')
REQ = json.load(open(os.path.join(ROOT, 'data/casual-tree.json'), encoding='utf-8'))['required']
WORLDS = ['samguk', 'fantasy', 'mecha']
PER_WORLD = 6   # 사용자 2026-11-09 「일상컷 생성수를 6장으로」 — 옛 묶음(기록에 situ 칸이 없다)은 상황 갈래 전이라 상황 칸이 비어도 실패로 치지 않는다


def kind(scene):
    """한 컷이 맞는 갈래 — {'expose', 'inworld'} 의 부분집합"""
    s = scene or {}
    out = set()
    if s.get('ofam') in REQ['outfits']:
        out.add('expose')
    w = REQ['world']
    if s.get('era') == w['era'] and s.get('place') in w['places'] and s.get('ofam') in w['outfits']:
        out.add('inworld')
    if s.get('situ') and not out:
        out.add('situ')   # 셋째 필수(2026-11-09) — 상황 노출, 노출 · 세계 안 갈래 컷과 다른 컷
    return out


new = {}   # (장수, 세계) → 그 세계에 상황 칸(scene.situ)이 있는 기록이 있나 — 옛 기록엔 그 칸 자체가 없다


def cuts(card):
    by = {}
    for f in glob.glob(os.path.join(IMGR, 'records', card, '*-casual*-ui.json')):
        m = re.match(r'(\w+)-casual(\d+)\.', os.path.basename(f))
        if not m or m.group(1) not in WORLDS:
            continue
        d = json.load(open(f, encoding='utf-8'))
        by.setdefault(m.group(1), {})[int(m.group(2))] = kind(d.get('scene'))
        if 'situ' in (d.get('scene') or {}):
            new[(card, m.group(1))] = True
    return by


def scenes(card):
    out = []
    for f in sorted(glob.glob(os.path.join(IMGR, 'records', card, '*-casual*-ui.json'))):
        m = re.match(r'(\w+)-casual(\d+)\.', os.path.basename(f))
        if not m or m.group(1) not in WORLDS:
            continue
        s = json.load(open(f, encoding='utf-8')).get('scene') or {}
        out.append((m.group(1), int(m.group(2)), s.get('place'), s.get('ofam'), s.get('preset')))
    return out


def clash(a, b):
    """다른 세계의 두 컷이 같은 장면인가(계획기 check 의 others 규칙과 같다)"""
    _, _, pa, oa, ra = a
    _, _, pb, ob, rb = b
    if pa and pa == pb and (not pa.startswith('nation_') or oa == ob):
        return '장소 %s' % pa + (' · ' + oa if pa.startswith('nation_') else '')
    if ra and ra == rb:
        return '자세 %s' % ra
    return None


def cross(card):
    sc = scenes(card)
    hits = []
    for i, a in enumerate(sc):
        for b in sc[i + 1:]:
            if a[0] != b[0]:
                why = clash(a, b)
                if why:
                    hits.append('%s casual%d = %s casual%d (%s)' % (a[0], a[1], b[0], b[1], why))
    return hits


def fill(ks):
    """서로 다른 두 컷으로 두 갈래를 채울 수 있나 — 채운 컷 번호 (노출, 세계 안)"""
    for a, ka in ks.items():
        if 'expose' not in ka:
            continue
        for b, kb in ks.items():
            if b != a and 'inworld' in kb:
                return a, b
    a = next((n for n, k in ks.items() if 'expose' in k), None)
    b = next((n for n, k in ks.items() if 'inworld' in k and n != a), None)
    return a, b


def main(argv):
    plan = '--plan' in argv
    names = [a for a in argv if not a.startswith('--')]
    if not names:
        names = sorted({os.path.basename(os.path.dirname(f)) for f in glob.glob(os.path.join(IMGR, 'records', '*', '*-casual*-ui.json'))})
    bad = dup = 0
    for card in names:
        by = cuts(card)
        for w in WORLDS:
            ks = by.get(w)
            if not ks:
                continue
            a, b = fill(ks)
            c = next((n for n, k in ks.items() if 'situ' in k), None)
            left = PER_WORLD - len(ks)
            need = [x for x, ok in (('노출 갈래(란제리풍·수영복·역할극)', a), ('세계 안 갈래(방·목욕·지붕·여관·서재·부엌·군영·정원·다리·사당·숲길·나루)', b)) if not ok]
            if not c and any('situ' in k for k in ks.values()) is False and new.get((card, w)):
                need.append('상황 노출(젖은 옷 · 바람 · 반쯤 푼 차림 · 흘러내린 어깨끈)')
            state = '맞음' if not need else ('남은 %d칸에 %s' % (left, ' · '.join(need)) if len(need) <= left else '모자람 — ' + ' · '.join(need))
            if need and len(need) > left:
                bad += 1
            line = '%s %s — %d장 · 노출 %s · 세계 안 %s · 상황 %s · %s' % (card, w, len(ks), 'casual%d' % a if a else '없음', 'casual%d' % b if b else '없음', 'casual%d' % c if c else '없음', state)
            if plan or need or len(argv) > 0:
                print(line)
        hits = cross(card)
        dup += bool(hits)
        if hits:
            print('%s 세계 사이 같은 장면 %d — %s' % (card, len(hits), ' · '.join(hits[:6]) + (' …' if len(hits) > 6 else '')))
    print('일상컷 묶음 — 갈래를 다시 그려야 하는 세계 %d · 세계 사이 같은 장면이 있는 장수 %d(알림)' % (bad, dup))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))

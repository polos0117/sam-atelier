#!/usr/bin/env python3
"""화풍 비교 묶음(data/style-compare.json · styles.html) 도우미 — 묶음은 더하기만 한다(사용자 2026-11-07 「추가되게」).
세션이 세계 하나씩(무협 · 판타지 · 메카) 따로 그려도 같은 묶음 열쇠로 올리면 한 묶음에 합쳐진다(사용자 「세션별로 메카, 판타지, 무협 다 따로 만들었는데」).

  python3 tools/style-compare.py next [날짜]
      다음 묶음 열쇠 — 그 날짜(기본 오늘, KST)에 묶음이 없으면 날짜, 있으면 날짜-2 · 날짜-3 …(목록 · 그림 저장소 폴더 둘 다 본다).
      세션 여럿이 한 묶음을 나눠 그릴 때는 열쇠를 먼저 하나 정해 모두에게 같이 준다.

  python3 tools/style-compare.py put <열쇠> --card <장수> --style <화풍> --world <samguk|fantasy|mecha>
          [--world-img <세계 그림>] [--casual-img <근접 일상컷>] [--far-img <원거리 일상컷>]
          [--casual-note <근접 장면 한 줄>] [--far-note <원거리 장면 한 줄>] [--note <화풍 한 줄>]
      그림을 webp(+ thumb)로 그림 저장소 style-test/compare/<열쇠>/ 에 넣고 목록의 그 묶음을 맞춘다(없으면 만든다).
      같은 파일이 이미 있으면 멈춘다(덮어쓰지 않음 — 일부러 바꿀 때만 --replace).

  python3 tools/style-compare.py sync <열쇠>
      그림 저장소 폴더에 있는 파일로 그 묶음의 화풍 목록을 다시 맞춘다 — 목록 파일이 git 에서 부딪쳤을 때
      (`git checkout --theirs data/style-compare.json` 뒤 이것을 돌리면 내 몫도 다시 들어간다).

  python3 tools/style-compare.py check [그림 저장소] [--strict]
      열쇠 꼴 · 겹침 · 목록에 적힌 화풍마다 그림이 하나라도 있나. --strict 면 화풍 × 세계 × 갈래가 다 있어야 한다.
그림 저장소는 기본 옆의 ../sam-atelier-img. put · sync 뒤 두 저장소를 따로 올린다(그림 저장소 먼저).
"""
import json, os, re, sys, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data', 'style-compare.json')
IMG = os.environ.get('SAM_IMG') or os.path.join(os.path.dirname(ROOT), 'sam-atelier-img')   # 검사용 — 다른 자리 그림 저장소
WORLDS, KINDS = ['samguk', 'fantasy', 'mecha'], ['world', 'casual', 'far']   # casual = 근접 일상컷, far = 원거리 일상컷(2026-11-07 「원거리 일상컷도 있는데」)
KEY_RE = r'\d{4}-\d{2}-\d{2}(-\d+)?'
STYLE_ORDER = None


def load():
    return json.load(open(DATA, encoding='utf-8'))


def save(d):
    with open(DATA, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
        f.write('\n')


def styles_json():
    return json.load(open(os.path.join(ROOT, 'data', 'style.json'), encoding='utf-8'))


def folder(key, img=IMG):
    return os.path.join(img, 'style-test', 'compare', key)


def taken(img=IMG):
    keys = {r['key'] for r in load()['rounds']}
    d = os.path.join(img, 'style-test', 'compare')
    if os.path.isdir(d):
        keys |= {k for k in os.listdir(d) if os.path.isdir(os.path.join(d, k))}
    return keys


def next_key(date, img=IMG):
    keys = taken(img)
    if date not in keys:
        return date
    n = 2
    while f'{date}-{n}' in keys:
        n += 1
    return f'{date}-{n}'


def files_in(key, img=IMG):
    d = folder(key, img)
    out = {}
    if not os.path.isdir(d):
        return out
    for f in os.listdir(d):
        m = re.fullmatch(r'(.+)_(samguk|fantasy|mecha)_(world|casual|far)\.webp', f)
        if m:
            out.setdefault(m.group(1), set()).add((m.group(2), m.group(3)))
    return out


def round_of(d, key, card=None):
    for r in d['rounds']:
        if r['key'] == key:
            return r
    r = {'key': key, 'date': key[:10], 'card': card or '', 'model': 'gpt-image-2.6', 'title': '', 'kinds': [], 'casual': {}, 'far': {}, 'styles': []}
    d['rounds'].append(r)
    return r


def sync_round(d, key, img=IMG):
    """폴더에 있는 화풍은 목록에 넣고(이름 · 기본 여부는 style.json 에서), 적어 둔 한 줄 설명은 지킨다. 차례는 style.json 차례"""
    S = styles_json()
    r = round_of(d, key)
    have = files_in(key, img)
    old = {s['key']: s for s in r['styles']}
    order = list(S['styles'].keys())
    keys = sorted(set(old) | set(have), key=lambda k: order.index(k) if k in order else 999)
    got = {kind for v in have.values() for _, kind in v} | set(r.get('kinds') or [])
    r['kinds'] = [k for k in KINDS if k in got]   # 이 묶음에 있는 갈래 — 화면은 이것만 단추로 보인다
    r['styles'] = [{'key': k, 'name': (S['styles'].get(k) or {}).get('name', k), 'default': k == S['default'],
                    'note': (old.get(k) or {}).get('note', ''), 'old': (old.get(k) or {}).get('old')} for k in keys]
    return r


def to_webp(src, dst_full, dst_thumb):
    from PIL import Image
    im = Image.open(src).convert('RGB')
    im.save(dst_full, 'WEBP', quality=88)
    t = im.copy(); t.thumbnail((360, 540)); t.save(dst_thumb, 'WEBP', quality=80)


def put(a):
    opt = {}
    i = 0
    key = a[0]
    rest = a[1:]
    while i < len(rest):
        if rest[i] == '--replace':
            opt['replace'] = True; i += 1
        else:
            opt[rest[i].lstrip('-').replace('-', '_')] = rest[i + 1]; i += 2
    if not re.fullmatch(KEY_RE, key):
        sys.exit('묶음 열쇠 꼴이 아니다: ' + key)
    S = styles_json()
    st, w = opt.get('style'), opt.get('world')
    if st not in S['styles']:
        sys.exit('없는 화풍: %s — %s' % (st, ' · '.join(S['styles'])))
    if w not in WORLDS:
        sys.exit('세계는 samguk · fantasy · mecha')
    pics = [(k, opt.get(k + '_img')) for k in KINDS if opt.get(k + '_img')]
    if not pics:
        sys.exit('--world-img · --casual-img · --far-img 가운데 하나는 있어야 한다')
    d = load()
    r = round_of(d, key, opt.get('card'))
    if opt.get('card') and r.get('card') and r['card'] != opt['card']:
        sys.exit('이 묶음의 장수는 %s — 다른 장수(%s)는 다른 열쇠로' % (r['card'], opt['card']))
    if opt.get('card'):
        r['card'] = opt['card']
    os.makedirs(os.path.join(folder(key), 'thumb'), exist_ok=True)
    for kind, src in pics:
        name = f'{st}_{w}_{kind}.webp'
        full, thumb = os.path.join(folder(key), name), os.path.join(folder(key), 'thumb', name)
        if os.path.exists(full) and not opt.get('replace'):
            sys.exit(f'이미 있다: style-test/compare/{key}/{name} — 덮어쓰지 않는다(일부러 바꿀 때만 --replace)')
        to_webp(src, full, thumb)
        print('넣음', f'style-test/compare/{key}/{name}')
    if opt.get('casual_note'):
        r.setdefault('casual', {})[w] = opt['casual_note']
    if opt.get('far_note'):
        r.setdefault('far', {})[w] = opt['far_note']
    sync_round(d, key)
    if opt.get('note'):
        for s in r['styles']:
            if s['key'] == st:
                s['note'] = opt['note']
    save(d)
    print('목록 맞춤 — 묶음 %s · 화풍 %d' % (key, len(r['styles'])))


def check(img, strict):
    d, errs, warns, seen = load(), [], [], set()
    for r in d['rounds']:
        k = r.get('key', '')
        if not re.fullmatch(KEY_RE, k):
            errs.append(f'묶음 열쇠 꼴이 아니다: {k!r}')
        if k in seen:
            errs.append(f'묶음 열쇠 겹침: {k}')
        seen.add(k)
        have = files_in(k, img)
        for s in r['styles']:
            if not have.get(s['key']):
                errs.append(f'{k}: 목록의 화풍 {s["key"]} 그림이 하나도 없다')
            for w in WORLDS:
                for kind in (r.get('kinds') or KINDS):
                    f = f"{s['key']}_{w}_{kind}.webp"
                    for sub in ('', 'thumb/'):
                        if not os.path.exists(os.path.join(folder(k, img), sub + f)):
                            (errs if strict else warns).append(f'없는 파일: style-test/compare/{k}/{sub}{f}')
        for sk in have:
            if sk not in {s['key'] for s in r['styles']}:
                errs.append(f'{k}: 폴더에 있는 화풍 {sk} 이 목록에 없다(sync {k})')
    if warns:
        print(f'빈 칸 {len(warns)}(아직 안 올린 세계 · 갈래 — 화면엔 「그림 없음」)')
    if errs:
        print('\n'.join(errs)); sys.exit(1)
    print(f'화풍 비교 맞음 — 묶음 {len(seen)}')


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a or a[0] not in ('next', 'put', 'sync', 'check'):
        print(__doc__); sys.exit(2)
    if a[0] == 'next':
        date = a[1] if len(a) > 1 else (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=9)).date().isoformat()
        print(next_key(date))
    elif a[0] == 'put':
        put(a[1:])
    elif a[0] == 'sync':
        d = load(); r = sync_round(d, a[1]); save(d); print('목록 맞춤 — 묶음 %s · 화풍 %d' % (a[1], len(r['styles'])))
    else:
        rest = [x for x in a[1:] if x != '--strict']
        check(rest[0] if rest else IMG, '--strict' in a)

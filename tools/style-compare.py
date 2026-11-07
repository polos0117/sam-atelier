#!/usr/bin/env python3
"""화풍 비교 묶음(data/style-compare.json · styles.html) 도우미 — 묶음은 더하기만 한다(사용자 2026-11-07 「추가되게」).

  python3 tools/style-compare.py next [날짜]     다음 묶음 열쇠 — 그 날짜(기본 오늘, KST)에 묶음이 없으면 날짜, 있으면 날짜-2 · 날짜-3 …
                                                 (목록과 그림 저장소 style-test/compare/ 의 폴더 둘 다 본다)
  python3 tools/style-compare.py check [그림 저장소]   열쇠가 겹치지 않나 · 묶음마다 화풍 × 세계 × 갈래 파일과 thumb 가 다 있나
그림 저장소는 기본 옆의 ../sam-atelier-img.
"""
import json, os, re, sys, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data', 'style-compare.json')
WORLDS, KINDS = ['samguk', 'fantasy', 'mecha'], ['world', 'casual']


def load():
    return json.load(open(DATA, encoding='utf-8'))


def taken(img):
    keys = {r['key'] for r in load()['rounds']}
    d = os.path.join(img, 'style-test', 'compare')
    if os.path.isdir(d):
        keys |= {k for k in os.listdir(d) if os.path.isdir(os.path.join(d, k))}
    return keys


def next_key(date, img):
    keys = taken(img)
    if date not in keys:
        return date
    n = 2
    while f'{date}-{n}' in keys:
        n += 1
    return f'{date}-{n}'


def check(img):
    d, errs, seen = load(), [], set()
    for r in d['rounds']:
        k = r.get('key', '')
        if not re.fullmatch(r'\d{4}-\d{2}-\d{2}(-\d+)?', k):
            errs.append(f'묶음 열쇠 꼴이 아니다: {k!r}')
        if k in seen:
            errs.append(f'묶음 열쇠 겹침: {k}')
        seen.add(k)
        for s in r['styles']:
            for w in WORLDS:
                for kind in KINDS:
                    f = f"{s['key']}_{w}_{kind}.webp"
                    for sub in ('', 'thumb/'):
                        if not os.path.exists(os.path.join(img, 'style-test', 'compare', k, sub + f)):
                            errs.append(f'없는 파일: style-test/compare/{k}/{sub}{f}')
    if errs:
        print('\n'.join(errs)); sys.exit(1)
    print(f'화풍 비교 맞음 — 묶음 {len(seen)}')


if __name__ == '__main__':
    a = sys.argv[1:]
    img = os.path.join(os.path.dirname(ROOT), 'sam-atelier-img')
    if not a or a[0] not in ('next', 'check'):
        print(__doc__); sys.exit(2)
    if a[0] == 'next':
        date = a[1] if len(a) > 1 else (datetime.datetime.utcnow() + datetime.timedelta(hours=9)).date().isoformat()
        print(next_key(date, img))
    else:
        check(a[1] if len(a) > 1 else img)

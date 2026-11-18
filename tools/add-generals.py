# -*- coding: utf-8 -*-
"""새 장수 묶음을 표 넷에 끼운다(2026-11-18 — 사용자 「3묶음까지」, 게임 표에 없는 공방 장수 · AGENTS.md 1절 「새 장수 묶음을 더하는 차례」).

  python -I tools/add-generals.py tools/batches/<묶음>.py

끼우는 곳 — 설계표(data/sam-design.json: 시안 draft · extra{why, src, career} · 외형은 자동 돌림 auto_look 위에 묶음이 적은 색 · 인상 · 표정 · 체형 · 겹친 헤어 · 실루엣)
· 새 판 표(data/draft2-generals.json — 설계표와 같은 차례, 한 줄) · 직업 표(data/casual-own.json — same_job) · 직업 목록(docs/casual-own-list.md).
이미 든 장수는 건너뛴다(다시 돌려도 같다). 묶음 파일의 꼴은 tools/batches/2026-11-18-add1.py 가 본보기다.
여기서 안 하는 것(손으로) — 추가 명단 data/draft2-roster.json · 세력 표 data/draft2-factions.json · 지도 data/tianxia.json · 글꼴 줄 · 이 파일 위 tools/sam-design.py 의 ROMAN.
"""
import importlib.util, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def mod(name, path):
    sp = importlib.util.spec_from_file_location(name, path)
    m = importlib.util.module_from_spec(sp)
    sp.loader.exec_module(m)
    return m


S = mod('spec', os.path.abspath(sys.argv[1]))
SD = mod('samdesign', os.path.join(ROOT, 'tools', 'sam-design.py'))
DATE = S.DATE
BODY_KO = {'hourglass': '모래시계형', 'voluptuous': '풍만형', 'curvy_athletic': '탄탄한 굴곡형', 'busty_slender': '가늘고 풍만한 형', 'curvy': '굴곡형',
           'tall_curvy': '장신 굴곡형', 'strong_curvy': '건장한 굴곡형', 'petite_curvy': '아담한 굴곡형', 'pear_curvy': '골반 굴곡형',
           'willowy_curvy': '낭창한 굴곡형', 'lean_toned': '슬림 근육형', 'petite_voluptuous': '아담한 풍만형'}
BODY = getattr(S, 'BODY', {})   # 체형을 손으로 바꾼 장수


def insert_after(lst, key_of, after, item):
    at = next(i for i, x in enumerate(lst) if key_of(x) == after)
    lst.insert(at + 1, item)


# ── 설계표
d = SD.load()
have = {g['key'] for g in d['generals']}
for s in S.G:
    if s['key'] in have:
        continue
    g = {'key': s['key'], 'en': s['en'], 'faction': 'qun', 'role': s['role'], 'camp': s['camp'],
         'stats': dict(zip(('lead', 'war', 'int', 'pol'), s['stats'])), 'seal': s['seal'], 'lore': s['lore'],
         'designed': 'draft', 'design_by': 'claude', 'design_date': DATE}
    look = SD.auto_look(g)
    look['face'].update({'eye_color': s['eye'], 'impression': s['imp'], 'expr': s['expr']})
    look['silhouette']['hair_color'] = s['hair']
    if s['key'] in BODY:
        look['silhouette']['body'] = BODY[s['key']]
    for w, lw in getattr(S, 'WORLD_FIX', {}).get(s['key'], {}).items():   # 같은 묶음 · 같은 무리와 겹친 헤어를 손으로 바꾼 자리
        lw = dict(lw)
        look['worlds'][w]['silhouette'].update({k: lw.pop(k) for k in ('hair', 'bangs') if k in lw})
        look['worlds'][w]['face'].update(lw)
    SD.fix_eye_clash(look)
    look['why'] = ('시안(claude %s) — %s에서 이름 설명 · 물건 · 인상(%s) · 표정(%s)을 잡았다. 말 · 짐승은 넣지 않았다. '
                   '머리 색(%s) · 눈 색(%s)은 같은 묶음 14명 · 같은 무리의 기존 장수와 겹치지 않게 덜 쓴 색에서 손으로 골랐다. '
                   '체형 · 이목구비 · 헤어 · 얼굴형 · 눈 모양(세계마다)은 자동 돌림(tools/sam-design.py auto_look)%s.'
                   % (DATE, s['fact'].split(' — ')[0], s['imp_ko'], s['expr_ko'], s['hair_ko'].replace(' 머리', ''), s['eye_ko'].replace(' 눈', ''),
                      ' 에서 겹친 자리만 바꿨다' if s['key'] in getattr(S, 'WORLD_FIX', {}) or s['key'] in BODY else ' 그대로'))
    g['summary'] = {'ko': '%s — %s · %s · %s · %s · %s · %s' % (s['tag'], s['bits'], s['hair_ko'], s['eye_ko'], s['imp_ko'], s['expr_ko'], BODY_KO[look['silhouette']['body']])}
    g['title'] = {'en': s['title']}
    g['traits'] = {'en': s['traits']}
    g['hold'] = {'en': s['hold']}
    g['look'] = look
    g['extra'] = {'why': S.EXTRA + ' — ' + s['fact'], 'src': s['src']}
    if s['key'] in getattr(S, 'CAREER', {}):
        g['extra']['career'] = S.CAREER[s['key']]
    if s['key'] in getattr(S, 'SIL', {}):
        g['worlds'] = {w: {'sil': v} for w, v in zip(('samguk', 'fantasy', 'mecha'), S.SIL[s['key']])}
    insert_after(d['generals'], lambda x: x['key'], s['after'], g)
SD.save(d)

# ── 새 판 표 — 한 줄에 한 장수, 설계표와 같은 차례
p = os.path.join(ROOT, 'data', 'draft2-generals.json')
lines = open(p, encoding='utf-8').read().split('\n')
for s in S.G:
    if any(l.startswith('  {"key": "%s",' % s['key']) for l in lines):
        continue
    row = {'key': s['key'], 'stats': dict(zip(('lead', 'war', 'int', 'pol'), s['stats'])), 'class': s.get('cls'), 'sub': s.get('sub'), 'trait': s.get('trait'), 'why': s['d2why']}
    at = next(i for i, l in enumerate(lines) if l.startswith('  {"key": "%s",' % s['after']))
    if not lines[at].endswith(','):
        lines[at] += ','
        lines.insert(at + 1, '  ' + json.dumps(row, ensure_ascii=False))
    else:
        lines.insert(at + 1, '  ' + json.dumps(row, ensure_ascii=False) + ',')
open(p, 'w', encoding='utf-8').write('\n'.join(lines))

# ── 직업 표
ERA = {'samguk': ('a Han-era ', ', all cut as Han-era Chinese dress — cross-collared wraps, sashes, silk and hemp'),
       'fantasy': ('a high-fantasy ', ', all styled as high-fantasy dress — laced leather, embroidered cloth and metal clasps'),
       'mecha': ('a far-future ', ', all made as sleek far-future wear — smooth technical fabric, glossy panels and thin glowing trim')}
p = os.path.join(ROOT, 'data', 'casual-own.json')
c = json.load(open(p, encoding='utf-8'))
cards = list(c['cards'].items())
for s in S.G:
    if s['key'] in c['cards']:
        continue
    j = S.JOB[s['key']]
    worlds = {}
    for (w, (pre, suf)), (base, preset, use, act, prop) in zip(ERA.items(), j['w']):
        row = {'job_ko': s['job'], 'base': base, 'place': pre + j['place'], 'activity': act, 'preset': preset}
        if use:
            row['use'] = use
            row['prop'] = prop
        row['outfit'] = {'bold': '%s look fitted to her body — %s%s' % (j['look'], j['o'][0], suf),
                         'moderate': '%s look — %s%s' % (j['look'], j['o'][1], suf), 'low': '%s look — %s%s' % (j['look'], j['o'][2], suf)}
        worlds[w] = row
    insert_after(cards, lambda x: x[0], s['after'], (s['key'], {'root': {'ko': s['root'], 'from': s['frm']}, 'mode': 'same_job', 'worlds': worlds}))
c['cards'] = dict(cards)
with open(p, 'w', encoding='utf-8') as f:
    json.dump(c, f, ensure_ascii=False, indent=1)
    f.write('\n')

# ── 직업 목록
p = os.path.join(ROOT, 'docs', 'casual-own-list.md')
lines = open(p, encoding='utf-8').read().split('\n')
for s in S.G:
    if any(l.startswith('- **%s** ' % s['key']) for l in lines):
        continue
    at = next(i for i, l in enumerate(lines) if l.startswith('- **%s** ' % s['after']))
    lines.insert(at + 1, '- **%s** %s — %s' % (s['key'], s['root'], s['job']))
open(p, 'w', encoding='utf-8').write('\n'.join(lines))
print('ok', len(d['generals']))

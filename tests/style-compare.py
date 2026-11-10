"""화풍 비교 묶음 — 열쇠 꼴 · 겹침 없음 · 그림 저장소에 파일이 다 있나(옆에 sam-atelier-img 가 있을 때만 파일까지).
   Run: python3 tests/style-compare.py"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(ROOT, 'data', 'style-compare.json'), encoding='utf-8'))
keys = [r['key'] for r in d['rounds']]
assert len(keys) == len(set(keys)), '묶음 열쇠 겹침'
assert all(re.fullmatch(r'\d{4}-\d{2}-\d{2}(-\d+)?', k) for k in keys), keys
S = json.load(open(os.path.join(ROOT, 'data', 'style.json'), encoding='utf-8'))
for r in d['rounds']:
    for s in r['styles']:
        assert s['key'] in S['styles'], s['key']
img = os.path.join(os.path.dirname(ROOT), 'style-atelier-img')   # 화풍 시험 그림 자리(2026-11-10 옮김)
if os.path.isdir(img):
    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'style-compare.py'), 'check', img], check=True)
    # 세션마다 세계 하나씩 — 빈 칸은 괜찮다(--strict 아님)
    nk = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'style-compare.py'), 'next', keys[0][:10]], check=True, capture_output=True, text=True).stdout.strip()
    assert nk not in keys and nk.startswith(keys[0][:10] + '-'), nk
print('PASS 화풍 비교 묶음: ' + str(len(keys)))

# 머리색 다시 나누기(2026-11-18 사용자 「머리색 더 다양하게 넣어주고, 지금 기본화풍 없는 그림 위주로 분배해줘. 기본화풍 있는 그림 중에 겹치는 색 있는 케릭터 위주로」 → 「7명도 바꿔줘」) — 기본 화풍 그림 없는 장수만, 그림 있는 장수와 겹치는 색부터 덜어 낸다. 초안 plan.json 을 쓰고, 설계표에 넣는 것은 따로 했다
import json, hashlib, sys, collections
ROOT='/home/user/sam-atelier'
D=json.load(open(ROOT+'/data/sam-design.json')); IMG=json.load(open(ROOT+'/data/img.json'))
import re
LS=open(ROOT+'/lib/look-spec.js').read(); blk=LS[LS.index('"hair_color": {'):]; blk=blk[:blk.index('}')]
COLS=re.findall(r'"(\w+)": "',blk)
KEEP_OTHER=set(sys.argv[1].split(',')) if len(sys.argv)>1 and sys.argv[1] else set()
def st(k): return ((IMG.get('img') or {}).get(k) or {}).get('byStyle') or {}
def drawn(k):
    s=st(k).get('kr_drawn_rim_dewy'); return bool(s and any((f or {}).get('f') for f in (s.get('byForm') or {}).values()))
G=D['generals']
fixed=[g for g in G if drawn(g['key'])]
other=[g for g in G if not drawn(g['key']) and st(g['key'])]
keep=fixed+[g for g in other if g['key'] in KEEP_OTHER]
free=[g for g in G if g not in keep]
hc=lambda g:g['look']['silhouette']['hair_color']; eye=lambda g:g['look']['face'].get('eye_color')
dcnt=collections.Counter(hc(g) for g in fixed)
cnt=collections.Counter(hc(g) for g in keep)
fac=collections.defaultdict(collections.Counter); combo=collections.Counter()
for g in keep: fac[g['faction']][hc(g)]+=1; combo[(hc(g),eye(g))]+=1
CAP=7
free.sort(key=lambda g:(-dcnt[hc(g)], hashlib.md5(g['key'].encode()).hexdigest()))
out={}
for g in free:
    cur=hc(g)
    def cost(c):
        return (100 if cnt[c]>=CAP else 0)+3*dcnt[c]+1.0*cnt[c]+2*fac[g['faction']][c]+3*combo[(c,eye(g))]-(0.8 if c==cur and dcnt[c]==0 else 0)+int(hashlib.md5((g['key']+c).encode()).hexdigest()[:4],16)/65536/10
    c=min(COLS,key=cost); out[g['key']]=(cur,c)
    cnt[c]+=1; fac[g['faction']][c]+=1; combo[(c,eye(g))]+=1
json.dump({k:list(v) for k,v in out.items()},open('/tmp/claude-0/-home-user/24d517e4-a080-5979-b624-292e1b5663f6/scratchpad/hair/plan.json','w'),ensure_ascii=False,indent=0)
ch=sum(1 for a,b in out.values() if a!=b)
print('colours',len(COLS),'fixed',len(fixed),'kept other',len(keep)-len(fixed),'free',len(free),'changed',ch)
print('final count min/max',min(cnt[c] for c in COLS),max(cnt[c] for c in COLS))
over=sum(1 for g in free if dcnt[out[g['key']][1]]>0); print('free still sharing with drawn',over)
newc=COLS[-16:]; print('new colour use',{c:cnt[c] for c in newc})
print('dist',sorted(collections.Counter(cnt[c] for c in COLS).items()))
print('same faction dup max',max(max(v.values()) for v in fac.values()), 'hair+eye combo max',max(combo.values()))

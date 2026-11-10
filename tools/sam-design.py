#!/usr/bin/env python3
"""삼국지 설계표(data/sam-design.json) — 장수 목록을 게임(draft.html)에서 받아 채우고, 칸이 다 찼는지 본다(2026-11-02).

  python3 tools/sam-design.py seed    게임의 장수 표(C)·일화(LORE)·낙관(SEAL)에서 장수를 받는다.
                                      손으로 적은 칸(en·title·traits·hold·look·worlds·designed)은 지키고, 비었으면 채운다.
                                      외형(look)이 없는 장수는 세력 팔레트·역할·능력치로 돌려 적는다(designed: "auto").
  python3 tools/sam-design.py check   어휘(lib/look-spec.js · lib/prompt-spec.js 의 FACE_DESIGN)와 칸을 본다.
  python3 tools/sam-design.py approve <장수>…        시안(draft)을 확정(hand)으로 — 사용자가 「좋아」 한 장수
  python3 tools/sam-design.py redo <장수> <까닭>      다시 설계 요청 — redo 칸에 까닭. 다음 설계자가 까닭을 읽고 새 시안을 쓴다
  python3 tools/sam-design.py status                 상태별 수 · 다시 설계 요청 목록

설계 상태(사용자 2026-11-02 「손 설계가 마음에 안 들면 다시 설계」 · 「가로 진행」 — 시안 상태로도 그린다):
  auto  — 자동 설계(seed 가 세력 팔레트 · 역할 · 열쇠로 돌렸다). 그리기 전에 시안으로 올린다
  draft — 시안. title · traits · hold · look(+why) · summary.ko 를 손으로 적었고 사용자가 아직 안 봤다. 그려도 된다
  hand  — 확정. 사용자가 보고 좋다고 했다
  redo  — {why, date} 가 있으면 다시 설계 요청. 새 시안을 쓸 때 앞 설계를 history 에 넣고 redo 를 지운다

게임 파일은 읽기만 한다 — 게임은 그대로 둔다(사용자 2026-11-02 「기존 게임은 그대로 두고」).
사실(이름·세력·역할·능력치·일화·낙관)은 게임 표에서만 온다. 영문 이름(en)은 한어 병음 표기, 이 파일의 ROMAN 에 있다.
"""
import datetime, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESIGN = os.path.join(ROOT, 'data', 'sam-design.json')
GAME = os.path.join(ROOT, 'draft.html')   # 게임 — 2026-11-02 첫 화면(index.html)을 세우며 내용 그대로 옮겼다
WORLDS = ['samguk', 'fantasy', 'mecha']
STATES = ['auto', 'draft', 'hand']   # 자동 · 시안 · 확정
FACTION_OF = {'위': 'wei', '촉': 'shu', '오': 'wu', '군웅': 'qun'}
ROLE_OF = {'군주': 'lord', '무장': 'general', '책사': 'strategist', '문관': 'official'}

# 한어 병음 — 게임의 한글 이름 그대로 열쇠(성씨 한자는 게임 SEAL 과 맞다). 부인·씨 칭호는 Lady 로.
ROMAN = {
 '유비': 'Liu Bei', '관우': 'Guan Yu', '장비': 'Zhang Fei', '조운': 'Zhao Yun', '마초': 'Ma Chao', '황충': 'Huang Zhong', '제갈량': 'Zhuge Liang', '방통': 'Pang Tong',
 '법정': 'Fa Zheng', '서서': 'Xu Shu', '강유': 'Jiang Wei', '위연': 'Wei Yan', '마대': 'Ma Dai', '관평': 'Guan Ping', '장포': 'Zhang Bao', '관흥': 'Guan Xing', '왕평': 'Wang Ping',
 '유봉': 'Liu Feng', '왕보': 'Wang Fu', '조루': 'Zhao Lei', '요화': 'Liao Hua', '엄안': 'Yan Yan', '장익': 'Zhang Yi', '진식': 'Chen Shi', '관색': 'Guan Suo', '종예': 'Zong Yu',
 '이적': 'Yi Ji', '제갈첨': 'Zhuge Zhan', '주창': 'Zhou Cang', '간옹': 'Jian Yong', '미부인': 'Lady Mi', '감부인': 'Lady Gan', '미축': 'Mi Zhu', '손건': 'Sun Qian', '이엄': 'Li Yan',
 '마량': 'Ma Liang', '마속': 'Ma Su', '비의': 'Fei Yi', '동윤': 'Dong Yun', '장완': 'Jiang Wan', '황월영': 'Huang Yueying', '유선': 'Liu Shan',
 '조조': 'Cao Cao', '하후돈': 'Xiahou Dun', '하후연': 'Xiahou Yuan', '조창': 'Cao Zhang', '조앙': 'Cao Ang', '조인': 'Cao Ren', '조홍': 'Cao Hong', '장료': 'Zhang Liao',
 '서황': 'Xu Huang', '장합': 'Zhang He', '악진': 'Yue Jin', '우금': 'Yu Jin', '전위': 'Dian Wei', '허저': 'Xu Chu', '방덕': 'Pang De', '순욱': 'Xun Yu', '순유': 'Xun You',
 '곽가': 'Guo Jia', '가후': 'Jia Xu', '정욱': 'Cheng Yu', '사마의': 'Sima Yi', '등애': 'Deng Ai', '종회': 'Zhong Hui', '조비': 'Cao Pi', '조예': 'Cao Rui', '조식': 'Cao Zhi',
 '유엽': 'Liu Ye', '장춘화': 'Zhang Chunhua', '왕원희': 'Wang Yuanji', '신헌영': 'Xin Xianying', '왕이': 'Wang Yi', '견씨': 'Lady Zhen', '진군': 'Chen Qun', '전예': 'Tian Yu',
 '만총': 'Man Chong', '이전': 'Li Dian', '문빙': 'Wen Pin', '하후현': 'Xiahou Xuan', '학소': 'Hao Zhao', '조휴': 'Cao Xiu', '조환': 'Cao Huan', '장패': 'Zang Ba', '조진': 'Cao Zhen',
 '화흠': 'Hua Xin', '왕랑': 'Wang Lang', '장수': 'Zhang Xiu',
 '손견': 'Sun Jian', '손책': 'Sun Ce', '손권': 'Sun Quan', '주유': 'Zhou Yu', '노숙': 'Lu Su', '여몽': 'Lü Meng', '육손': 'Lu Xun', '태사자': 'Taishi Ci', '감녕': 'Gan Ning',
 '황개': 'Huang Gai', '조무': 'Zu Mao', '정보': 'Cheng Pu', '한당': 'Han Dang', '주태': 'Zhou Tai', '서성': 'Xu Sheng', '문호': 'Wen Hu', '당자': 'Tang Zi', '정봉': 'Ding Feng',
 '능통': 'Ling Tong', '능조': 'Ling Cao', '장흠': 'Jiang Qin', '육항': 'Lu Kang', '장소': 'Zhang Zhao', '고옹': 'Gu Yong', '제갈근': 'Zhuge Jin', '우번': 'Yu Fan', '감택': 'Kan Ze',
 '여범': 'Lü Fan', '보즐': 'Bu Zhi', '장굉': 'Zhang Hong', '전종': 'Quan Cong', '손환': 'Sun Huan', '주방': 'Zhou Fang', '손상향': 'Sun Shangxiang', '오국태': 'Lady Wu',
 '대교': 'Da Qiao', '소교': 'Xiao Qiao', '진무': 'Chen Wu', '여대': 'Lü Dai', '하제': 'He Qi', '주치': 'Zhu Zhi', '동습': 'Dong Xi', '반장': 'Pan Zhang',
 '여포': 'Lü Bu', '동탁': 'Dong Zhuo', '원소': 'Yuan Shao', '원술': 'Yuan Shu', '엄강': 'Yan Gang', '관정': 'Guan Jing', '전해': 'Tian Kai', '공손범': 'Gongsun Fan',
 '공손찬': 'Gongsun Zan', '유표': 'Liu Biao', '유장': 'Liu Zhang', '마등': 'Ma Teng', '한수': 'Han Sui', '장각': 'Zhang Jiao', '채옹': 'Cai Yong', '채문희': 'Cai Wenji',
 '초선': 'Diaochan', '진궁': 'Chen Gong', '공융': 'Kong Rong', '원담': 'Yuan Tan', '원희': 'Yuan Xi', '원상': 'Yuan Shang', '봉기': 'Feng Ji', '신평': 'Xin Ping', '전풍': 'Tian Feng',
 '저수': 'Ju Shou', '심배': 'Shen Pei', '곽도': 'Guo Tu', '안량': 'Yan Liang', '문추': 'Wen Chou', '고람': 'Gao Lan', '장연': 'Zhang Yan', '화웅': 'Hua Xiong', '노식': 'Lu Zhi',
 '황보숭': 'Huangfu Song', '주준': 'Zhu Jun', '올돌골': 'Wutugu', '타사대왕': 'King Duosi', '맹우': 'Meng You', '엄여': 'Yan Yu', '맹획': 'Meng Huo', '축융': 'Lady Zhurong',
 '좌자': 'Zuo Ci', '화타': 'Hua Tuo', '관녕': 'Guan Ning', '사마휘': 'Sima Hui', '관로': 'Guan Lu', '이유': 'Li Ru', '이각': 'Li Jue', '곽사': 'Guo Si', '서영': 'Xu Rong',
 '왕윤': 'Wang Yun', '황조': 'Huang Zu', '왕광': 'Wang Kuang', '장훈': 'Zhang Xun', '교유': 'Qiao Rui', '양강': 'Yang Gang', '한윤': 'Han Yin', '기령': 'Ji Ling',
 '순우경': 'Chunyu Qiong', '호거아': "Hu Che'er", '염포': 'Yan Pu', '양송': 'Yang Song', '장로': 'Zhang Lu', '고순': 'Gao Shun', '국의': 'Qu Yi', '진규': 'Chen Gui', '진등': 'Chen Deng',
 '포신': 'Bao Xin', '도겸': 'Tao Qian', '한복': 'Han Fu', '관해': 'Guan Hai', '장보': 'Zhang Bao', '장량': 'Zhang Liang', '우길': 'Yu Ji', '엄백호': 'Yan Baihu', '장제': 'Zhang Ji',
 '번조': 'Fan Chou', '추씨': 'Lady Zou', '장선': 'Zhang Xian', '동승': 'Dong Cheng', '염행': 'Yan Xing', '하진': 'He Jin', '장막': 'Zhang Miao', '순심': 'Xun Chen', '유우': 'Liu Yu',
 '한현': 'Han Xuan', '유요': 'Liu Yao', '장임': 'Zhang Ren', '황권': 'Huang Quan', '오의': 'Wu Yi', '맹달': 'Meng Da', '장송': 'Zhang Song', '허유': 'Xu You', '진림': 'Chen Lin',
 '괴량': 'Kuai Liang', '괴월': 'Kuai Yue', '채모': 'Cai Mao', '유기': 'Liu Qi', '후성': 'Hou Cheng', '송헌': 'Song Xian', '위속': 'Wei Xu', '문앙': 'Wen Yang', '문흠': 'Wen Qin',
 '곽회': 'Guo Huai', '진태': 'Chen Tai', '사마사': 'Sima Shi', '사마소': 'Sima Zhao', '관구검': 'Guanqiu Jian', '왕기': 'Wang Ji', '양호': 'Yang Hu', '두예': 'Du Yu', '가충': 'Jia Chong',
 '가규': 'Jia Kui', '사마염': 'Sima Yan', '하후패': 'Xiahou Ba', '제갈각': 'Zhuge Ke', '주환': 'Zhu Huan', '등지': 'Deng Zhi', '이회': 'Li Hui', '나헌': 'Luo Xian', '유심': 'Liu Chen',
 '부첨': 'Fu Qian', '마충': 'Ma Zhong', '장억': 'Zhang Ni', '육개': 'Lu Kai', '손호': 'Sun Hao', '주연': 'Zhu Ran', '손등': 'Sun Deng', '손준': 'Sun Jun', '손침': 'Sun Chen',
 '종요': 'Zhong Yao', '여건': 'Lü Qian', '제갈탄': 'Zhuge Dan', '미방': 'Mi Fang', '여령기': 'Lü Lingqi', '진도': 'Chen Dao', '유파': 'Liu Ba', '양의': 'Yang Yi', '동소': 'Dong Zhao',
 '유복': 'Liu Fu', '신비': 'Xin Pi', '낙통': 'Luo Tong', '고담': 'Gu Tan', '장승': 'Zhang Cheng', '장양': 'Zhang Yang', '사섭': 'Shi Xie', '왕준': 'Wang Jun',
}
# 남만 — 피부 톤을 남방으로 기운다(외형 자동 돌림만)
SOUTH = {'올돌골', '타사대왕', '맹우', '맹획', '축융'}

# ── 자동 외형 — 세력 팔레트에서 머리·눈 색, 역할에서 인상, 열쇠로 돌림. 손으로 적은 look 은 건드리지 않는다 ──
HAIR_COLOR = {
 'wei': ['jet_black', 'blue_black', 'navy', 'silver_white', 'ash_gray', 'royal_blue', 'ink_blue'],
 'shu': ['jet_black', 'ink_green', 'chestnut', 'grass_green', 'teal', 'jade_green', 'dark_brown'],
 'wu': ['crimson', 'wine_red', 'dark_auburn', 'flame_orange', 'bright_red', 'copper', 'jet_black'],
 'qun': ['plum_black', 'violet', 'royal_purple', 'antique_gold', 'silver_white', 'bronze', 'jet_black', 'sunset_pink'],
}
EYE_COLOR = {
 'wei': ['steel_blue', 'ice_blue', 'navy', 'graphite_grey', 'violet'],
 'shu': ['emerald', 'forest_green', 'leaf_green', 'amber', 'gold'],
 'wu': ['crimson', 'amber', 'ember', 'gold', 'coral'],
 'qun': ['violet', 'gold', 'amber', 'crimson', 'teal'],
}
# 볼륨 · 굴곡이 있는 체형만(사용자 2026-11-02 「체형을 전체적으로 볼륨감과 굴곡감이 느껴지게」). check 가 이 밖의 체형을 막는다
# 2026-11-03 사용자 「외형 관련 분류가 부족하면 더 추가해도 괜찮아 … 돌려쓰는 입장이라 겹치는게 있을 수 밖에」 — 체형 · 머리 · 앞머리 · 얼굴형 · 눈매 · 눈썹 · 코 · 입술을 늘렸다
BODY = ['hourglass', 'voluptuous', 'curvy_athletic', 'busty_slender', 'curvy', 'tall_curvy', 'strong_curvy', 'petite_curvy', 'pear_curvy', 'willowy_curvy']
BODY_W = [5, 5, 4, 3, 3, 3, 1, 1, 3, 3]
IMPRESSION = {
 'lord': ['regal', 'glamorous', 'elegant', 'mature', 'cool', 'fierce'],
 'general': ['fierce', 'rugged', 'sharp', 'stoic', 'boyish', 'cool', 'cheerful', 'glamorous'],
 'strategist': ['cool', 'elegant', 'languid', 'sharp', 'mature', 'melancholic', 'androgynous'],
 'official': ['soft', 'elegant', 'stoic', 'innocent', 'cheerful', 'mature', 'cute'],
}
EXPR = {
 'lord': ['confident', 'proud', 'calm', 'cold_smile', 'determined'],
 'general': ['determined', 'confident', 'serious', 'smug', 'proud', 'focused'],   # laughing 은 뺐다(2026-11-03 「호탕하게 웃는 얼굴은 빼자」)
 'strategist': ['calm', 'half_smile', 'pensive', 'smug', 'curious', 'cold_smile'],
 'official': ['gentle', 'calm', 'soft_smile', 'serious', 'focused', 'pensive'],
}
SKIN = ['fair', 'porcelain', 'warm_beige', 'olive', 'golden_tan', 'fair', 'warm_beige']
SKIN_SOUTH = ['golden_tan', 'bronze', 'deep_brown']
AXES = {
 'age': ['early_20s', 'mid_20s', 'late_20s'],   # 2026-11-08 사용자 「장수들 기본 나이 설계를 지금보다 한단계 어리게」 — early_30s 를 뺐다(있던 장수는 한 단계씩 내림)
 'eye_size': ['small', 'medium', 'large'], 'eye_tilt': ['up', 'level', 'down'],
 'mark': ['bare', 'mole_eye', 'winged_liner', 'red_lip', 'freckles', 'blush', 'smoky', 'gloss', 'scar', 'dark_lip'],
 'brows': ['straight_thick', 'arched_thin', 'soft_round', 'angled_sharp', 'low_heavy', 'feathered', 'straight_thin', 'high_arched'],
 'nose': ['small_button', 'straight_narrow', 'aquiline', 'broad_soft', 'upturned', 'high_bridge', 'petite_straight'],
 'lips': ['full_wide', 'thin_long', 'small_bow', 'heart_full', 'plush_pout', 'thin_bow', 'soft_medium'],   # wide_smile(크게 웃는 입)은 뺐다 — 2026-11-03 「호탕하게 웃는 얼굴은 빼자」
}
PER_WORLD = {
 'hair': ['long_straight', 'long_wavy', 'ponytail', 'braids', 'voluminous', 'side_swept', 'bob', 'twin_tails', 'short_crop', 'updo_bun',
          'half_up', 'low_ponytail', 'side_ponytail', 'side_braid', 'braided_crown', 'hime_cut', 'wolf_cut', 'pixie', 'double_buns', 'chignon', 'long_layered', 'lob', 'messy_bun'],
 # 길고 각진 쪽(long · square_soft · angular)은 돌림에서 뺀다 — 어휘엔 남는다(2026-11-03 「손책 … 일상컷 얼굴이 길고 각지고 못생기게」)
 'face_shape': ['oval', 'heart', 'diamond', 'round', 'v_line', 'inverted_triangle'],
 'eyes': ['almond_wide', 'narrow_upturned', 'round_large', 'droopy_soft', 'deep_set', 'monolid_long', 'phoenix', 'hooded', 'cat', 'peach_blossom'],
 'bangs': ['none', 'straight', 'side_swept', 'curtain', 'one_eye', 'parted', 'choppy', 'wispy', 'baby', 'side_locks', 'asymmetric', 'swept_back'],
}


def hkey(s):
    x = 0
    for ch in s:
        x = (x * 31 + ord(ch)) % 1000003
    return x


def pick(lst, key, salt):
    return lst[(hkey(key) + salt * 7919) % len(lst)]


def weighted(lst, w, key, salt):
    tot = sum(w)
    r = (hkey(key) + salt * 104729) % tot
    for v, k in zip(lst, w):
        if r < k:
            return v
        r -= k
    return lst[-1]


# 눈 크기 · 눈꼬리가 세계별 눈 모양과 부딪치면 그 세계에서만 맞춘다 — 모양을 살린다
# (사용자 2026-11-10 「크고 둥근 눈으로」 · 「삼국지 설계표도 다 수정해줘」 — 문앙 eye_size small + 무협 round_large 가
#  「smaller, narrower eyes … — large round eyes」 로 한 줄에 나갔다. tests/look-spec.cjs 가 같은 규칙을 본다)
EYE_SIZE_FIX = {('small', 'round_large'): 'large', ('small', 'almond_wide'): 'medium',
                ('large', 'narrow_upturned'): 'medium', ('large', 'phoenix'): 'medium', ('large', 'monolid_long'): 'medium'}
EYE_TILT_FIX = {('down', 'narrow_upturned'): 'up', ('down', 'phoenix'): 'up', ('down', 'cat'): 'up', ('up', 'droopy_soft'): 'down'}


def fix_eye_clash(look):
    """look.worlds.<세계>.face 에 eye_size · eye_tilt 를 덮어 써서 부딪침을 없앤다. 고친 자리 목록을 돌려준다"""
    out = []
    for w, lw in (look.get('worlds') or {}).items():
        f = dict(look.get('face') or {}, **(lw.get('face') or {}))
        for key, table in (('eye_size', EYE_SIZE_FIX), ('eye_tilt', EYE_TILT_FIX)):
            to = table.get((f.get(key), f.get('eyes')))
            if to:
                lw.setdefault('face', {})[key] = to
                out.append((w, key, f.get(key), to, f.get('eyes')))
    return out


def auto_look(g):
    k, fac, role = g['key'], g['faction'], g['role']
    face = {'eye_color': pick(EYE_COLOR[fac], k, 2), 'impression': pick(IMPRESSION[role], k, 3), 'expr': pick(EXPR[role], k, 4),
            'skin_tone': pick(SKIN_SOUTH if k in SOUTH else SKIN, k, 5)}
    for i, (a, lst) in enumerate(AXES.items()):
        face[a] = pick(lst, k, 11 + i)
    sil = {'body': weighted(BODY, BODY_W, k, 1), 'hair_color': pick(HAIR_COLOR[fac], k, 6)}
    worlds = {}
    for wi, w in enumerate(WORLDS):
        # 세계마다 다른 사람 — 헤어·얼굴형·눈·앞머리를 세계마다 다른 칸으로(세 세계가 겹치지 않게 걸음을 띄운다)
        ws = {}
        for j, (a, lst) in enumerate(PER_WORLD.items()):
            base = (hkey(k) + 31 * j) % len(lst)
            ws[a] = lst[(base + wi * (2 + j % 2)) % len(lst)]
        worlds[w] = {'silhouette': {'hair': ws['hair'], 'bangs': ws['bangs']}, 'face': {'face_shape': ws['face_shape'], 'eyes': ws['eyes']}}
        if w == 'mecha' and ws['hair'] == 'updo_bun':
            worlds[w]['silhouette']['hair'] = 'ponytail'
    look = {'face': face, 'silhouette': sil, 'worlds': worlds}
    fix_eye_clash(look)
    return {'face': face, 'silhouette': sil, 'worlds': look['worlds'],
            'why': '자동 — 세력 팔레트에서 머리·눈 색, 역할에서 인상·표정, 나머지는 장수 열쇠로 돌렸다. 세계마다 헤어·앞머리·얼굴형·눈이 다르다(세계마다 다른 사람). 손으로 고치면 designed 를 hand 로.'}


def read_game():
    s = open(GAME, encoding='utf-8').read()
    def grab_obj(name):
        i = s.index('var ' + name + '=')
        j = s.index('\n', i)
        line = s[i + len('var ' + name + '='):j].strip().rstrip(';')
        return json.loads(line)
    i = s.index('var C=[')
    j = s.index('];', i)
    body = s[i + 6:j + 1]
    rows = json.loads(body)
    return rows, grab_obj('LORE'), grab_obj('SEAL')


def load():
    with open(DESIGN, encoding='utf-8') as f:
        return json.load(f)


def save(d):
    with open(DESIGN, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
        f.write('\n')


def seed():
    d = load()
    rows, lore, seal = read_game()
    old = {g['key']: g for g in d.get('generals', [])}
    out = []
    for r in rows:
        name, fac, role, lead, war, intel, pol = r
        g = old.get(name, {})
        g.update({'key': name, 'faction': FACTION_OF[fac], 'role': ROLE_OF[role],
                  'stats': {'lead': lead, 'war': war, 'int': intel, 'pol': pol}})
        if lore.get(name):
            g['lore'] = lore[name]
        if seal.get(name):
            g['seal'] = seal[name]
        g.setdefault('en', ROMAN.get(name, ''))
        if not g.get('look'):
            g['look'] = auto_look(g)
            g['designed'] = 'auto'
        g.setdefault('designed', 'auto')
        out.append(g)
    order = ['key', 'en', 'faction', 'role', 'camp', 'stats', 'seal', 'lore', 'designed', 'design_by', 'design_date', 'redo', 'summary', 'title', 'traits', 'hold', 'look', 'worlds', 'history']
    d['generals'] = [{k: g[k] for k in order if k in g} | {k: v for k, v in g.items() if k not in order} for g in out]
    save(d)
    print('장수 %d — %s' % (len(out), ' · '.join('%s %d' % (st, sum(1 for g in out if g['designed'] == st)) for st in STATES)))


def vocab():
    js = "global.window=global;require('./lib/prompt-spec.js');require('./lib/look-spec.js');const T=window.AtelierSpec;" \
         "const F=T.FACE_DESIGN||{};const o={};for(const k in T.VOCAB_EN)o[k]=Object.keys(T.VOCAB_EN[k]);" \
         "for(const k of ['age','impression','skin_tone','eye_size','eye_tilt','mark','bangs'])o[k]=Object.keys(F[k]||{});o.expr=Object.keys(T.EXPRESSION_DETAIL||{});" \
         "console.log(JSON.stringify(o))"
    return json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT))


def check():
    d = load()
    V = vocab()
    errs = []
    facs = {f['key']: f for f in d.get('factions', [])}
    roles = d.get('roles', {})
    if sorted(facs) != sorted(FACTION_OF.values()):
        errs.append('세력은 wei·shu·wu·qun 넷')
    for f in facs.values():
        for k in ('ko', 'en', 'hanja', 'palette'):
            if not f.get(k):
                errs.append('세력 %s 의 %s' % (f['key'], k))
        for w in WORLDS:
            fw = (f.get('worlds') or {}).get(w) or {}
            if not fw.get('en') or not fw.get('ko'):
                errs.append('세력 %s 세계 %s 글' % (f['key'], w))
            if len(fw.get('scenes') or []) < 3:
                errs.append('세력 %s 세계 %s 장면 셋' % (f['key'], w))
            if w == 'mecha' and not fw.get('design'):
                errs.append('세력 %s 메카 설계 문장' % f['key'])
    for r in ROLE_OF.values():
        ro = roles.get(r) or {}
        if not ro.get('ko') or not ro.get('en'):
            errs.append('역할 %s 이름' % r)
        for w in WORLDS:
            if not ((ro.get('worlds') or {}).get(w) or {}).get('en'):
                errs.append('역할 %s 세계 %s 차림' % (r, w))
        if not (ro.get('hold') or {}).get('en'):
            errs.append('역할 %s hold' % r)
    rows, _, _ = read_game()
    keys = [g['key'] for g in d.get('generals', [])]
    if keys != [r[0] for r in rows]:
        errs.append('장수 목록이 게임 표(C)와 다르다 — seed 를 돌린다')
    if len(set(keys)) != len(keys):
        errs.append('장수 열쇠가 겹친다')
    fv = {'face_shape', 'eyes', 'brows', 'nose', 'lips', 'eye_color', 'age', 'impression', 'skin_tone', 'eye_size', 'eye_tilt', 'mark', 'expr'}
    for g in d.get('generals', []):
        k = g['key']
        if g.get('faction') not in facs:
            errs.append('%s 세력' % k)
        if g.get('role') not in roles:
            errs.append('%s 역할' % k)
        # 군웅은 소속 진영(camp)으로 나눈다 — 전장 화면이 이걸로 진영을 고른다(2026-11-02)
        camps = {c['key'] for c in (facs.get('qun') or {}).get('camps') or []}
        if g.get('faction') == 'qun' and g.get('camp') not in camps:
            errs.append('%s 군웅 소속(camp) — %s' % (k, ' · '.join(sorted(camps))))
        # 장수 몫 색(2026-11-05 초선 연핑크) — 있으면 en · ko 둘 다
        if 'palette' in g and not ((g['palette'] or {}).get('en') and (g['palette'] or {}).get('ko')):
            errs.append('%s palette 는 en · ko' % k)
        if g.get('faction') != 'qun' and 'camp' in g:
            errs.append('%s camp 는 군웅만' % k)
        if not g.get('en'):
            errs.append('%s 영문 이름' % k)
        if g.get('designed') not in STATES:
            errs.append('%s designed 는 %s' % (k, ' · '.join(STATES)))
        lk = g.get('look') or {}
        if g.get('designed') in ('draft', 'hand'):
            for c in ('title', 'traits', 'hold'):
                if not (g.get(c) or {}).get('en'):
                    errs.append('%s(%s) %s.en' % (k, g['designed'], c))
            if not (g.get('summary') or {}).get('ko'):
                errs.append('%s(%s) summary.ko — 도감에 보일 한국어 설계 요약' % (k, g['designed']))
            if (lk.get('why') or '').startswith('자동'):
                errs.append('%s(%s) look.why 가 자동 설계 그대로' % (k, g['designed']))
            if g.get('design_by') not in ('claude', 'gpt'):
                errs.append('%s(%s) design_by 는 claude 또는 gpt' % (k, g['designed']))
            if not re.match(r'^\d{4}-\d{2}-\d{2}$', g.get('design_date') or ''):
                errs.append('%s(%s) design_date' % (k, g['designed']))
        r = g.get('redo')
        if r is not None and (not (r or {}).get('why') or not (r or {}).get('date')):
            errs.append('%s redo 는 {why, date}' % k)
        for h in g.get('history') or []:
            if not h.get('date') or not h.get('summary'):
                errs.append('%s history 칸(date · summary)' % k)
        for grp in ('face', 'silhouette'):
            for a, v in (lk.get(grp) or {}).items():
                axis = 'expr' if a == 'expr' else a
                if axis in V and v not in V[axis]:
                    errs.append('%s look.%s.%s=%s 어휘에 없다' % (k, grp, a, v))
        for a in ('eye_color', 'impression', 'skin_tone', 'age', 'expr'):
            if not (lk.get('face') or {}).get(a):
                errs.append('%s look.face.%s' % (k, a))
        if (lk.get('face') or {}).get('lips') == 'wide_smile':   # 2026-11-03 「호탕하게 웃는 얼굴은 빼자」 — 돌림 목록만 빼서 넷이 남았다(2026-11-04)
            errs.append('%s look.face.lips=wide_smile — 크게 웃는 입은 뺐다' % k)
        if (lk.get('silhouette') or {}).get('body') and lk['silhouette']['body'] not in BODY:
            errs.append('%s look.silhouette.body=%s — 볼륨 · 굴곡 체형(%s)만' % (k, lk['silhouette']['body'], ' · '.join(BODY)))
        for a in ('body', 'hair_color'):
            if not (lk.get('silhouette') or {}).get(a):
                errs.append('%s look.silhouette.%s' % (k, a))
        seen = []
        for w in WORLDS:
            lw = (lk.get('worlds') or {}).get(w) or {}
            sw, fw = lw.get('silhouette') or {}, lw.get('face') or {}
            for a, v in list(sw.items()) + list(fw.items()):
                if a in V and v not in V[a]:
                    errs.append('%s look.worlds.%s.%s=%s 어휘에 없다' % (k, w, a, v))
            if not sw.get('hair') or not fw.get('face_shape') or not fw.get('eyes'):
                errs.append('%s look.worlds.%s 헤어·얼굴형·눈' % (k, w))
            seen.append((sw.get('hair'), fw.get('face_shape'), fw.get('eyes')))
        if len(set(seen)) < len(seen):
            errs.append('%s 세계끼리 같은 사람(헤어·얼굴형·눈이 같다)' % k)
        for w, gw in (g.get('worlds') or {}).items():
            if w not in WORLDS:
                errs.append('%s worlds.%s 모르는 세계' % (k, w))
            if gw.get('traits') is not None and not (gw.get('traits') or {}).get('en'):
                errs.append('%s worlds.%s.traits.en' % (k, w))
            for sc in gw.get('scenes') or []:
                if not sc.get('key') or not sc.get('ko') or not sc.get('en'):
                    errs.append('%s worlds.%s 장면 칸' % (k, w))
    if errs:
        print('\n'.join(errs[:60]))
        print('틀림 %d' % len(errs))
        sys.exit(1)
    gs = d['generals']
    print('설계표 맞음 — 장수 %d(%s · 다시 설계 요청 %d) · 세력 %d · 역할 %d · 세계 %d' % (len(gs), ' · '.join('%s %d' % (st, sum(1 for g in gs if g['designed'] == st)) for st in STATES), sum(1 for g in gs if g.get('redo')), len(facs), len(roles), len(WORLDS)))


def approve(names):
    d = load(); G = {g['key']: g for g in d['generals']}; done = []
    for n in names:
        g = G.get(n)
        if not g:
            sys.exit('없는 장수: %s' % n)
        if g['designed'] != 'draft':
            sys.exit('%s 은 시안이 아니다(%s) — 시안만 확정한다' % (n, g['designed']))
        if g.get('redo'):
            sys.exit('%s 은 다시 설계 요청이 걸려 있다 — 새 시안부터' % n)
        g['designed'] = 'hand'; done.append(n)
    save(d); print('확정', ' · '.join(done))


def redo(name, why):
    d = load(); g = next((x for x in d['generals'] if x['key'] == name), None)
    if not g:
        sys.exit('없는 장수: %s' % name)
    g['redo'] = {'why': why, 'date': datetime.date.today().isoformat()}
    save(d); print('다시 설계 요청', name, '—', why)


def status():
    d = load(); gs = d['generals']
    for st in STATES:
        print('%-5s %d' % (st, sum(1 for g in gs if g['designed'] == st)))
    for g in gs:
        if g.get('redo'):
            print('다시 설계 요청 %s — %s (%s)' % (g['key'], g['redo']['why'], g['redo']['date']))


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'check'
    if cmd == 'approve':
        approve(sys.argv[2:])
    elif cmd == 'redo':
        redo(sys.argv[2], ' '.join(sys.argv[3:]))
    else:
        {'seed': seed, 'check': check, 'status': status}[cmd]()

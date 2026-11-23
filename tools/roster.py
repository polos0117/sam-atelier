# -*- coding: utf-8 -*-
"""자료 파일 읽기·쓰기. game-atelier → element-atelier 의 tools/roster.py 에서 왔다(2026-11-02).

삼국지는 data/sam-design.json 한 곳에 있다 — 세력 › 장수. 카드 열쇠는 장수 이름(게임 표 그대로, 예: 관우)이고
그림 파일 이름 맨 앞에 들어간다. 세계(폼) 열쇠는 vocab.worlds(samguk · fantasy · mecha), 화풍은 data/style.json 의 styles 열쇠다."""
import json, os, re

DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
ART_SIZE = (1024, 1536)          # 2:3 세로. 모든 그림은 이 크기로 맞춘다
# 밑줄(_)은 파일 이름 칸 사이에 쓰므로 장수 열쇠 안에는 못 쓴다(tools/sam-design.py 가 본다)


def path(name):
    return os.path.join(DIR, name if name.endswith(".json") else name + ".json")


def read(name):
    with open(path(name), encoding="utf-8") as f:
        return json.load(f)


def design():
    return read("sam-design")


def worlds():
    """세계 열쇠 → 한국어 이름. 차례가 화면 차례라 dict 로 돌려준다."""
    v = design().get("vocab") or {}
    return {k: (v.get("world_ko") or {}).get(k, k) for k in v.get("worlds") or []}


def cards():
    """{카드 열쇠: {faction, role, ko}} — 장수 전부, 설계표(게임 표) 차례 그대로."""
    return {g["key"]: {"faction": g.get("faction"), "role": g.get("role"), "ko": g["key"]} for g in design().get("generals") or []}


def forms():
    """폼 = 세계. 등록기가 파일 이름에서 떼어 내는 열쇠 목록."""
    return worlds()


def styles():
    """화풍 열쇠 → 이름. data/style.json 의 styles."""
    return {k: v.get("name") or k for k, v in (read("style").get("styles") or {}).items()}


def one_line(v):
    """줄바꿈 없이 한 줄로. 항목 하나가 한 줄이면 diff 로 바로 읽힌다."""
    return json.dumps(v, ensure_ascii=False, separators=(", ", ": "))


def _render(obj):
    def val(v, pad):
        if isinstance(v, list) and v and isinstance(v[0], dict):
            return "[\n" + ",\n".join(pad + " " + one_line(x) for x in v) + "\n" + pad + "]"
        if isinstance(v, dict) and len(v) > 8:
            return ("{\n" + ",\n".join('%s "%s": %s' % (pad, k, val(x, pad + " "))
                                       for k, x in v.items()) + "\n" + pad + "}")
        return one_line(v)
    return "{\n" + ",\n".join(' "%s": %s' % (k, val(v, " "))
                              for k, v in obj.items()) + "\n}\n"


def write(name, obj):
    open(path(name), "w", encoding="utf-8").write(_render(obj))


def _webp_size(rel):
    """webp 머리말에서 가로·세로만 읽는다. 외부 꾸러미 없이."""
    try:
        b = open(os.path.join(os.path.dirname(DIR), rel), "rb").read(64)
    except OSError:
        return None
    if b[:4] != b"RIFF" or b[8:12] != b"WEBP":
        return None
    if b[12:16] == b"VP8X":
        return (int.from_bytes(b[24:27], "little") + 1,
                int.from_bytes(b[27:30], "little") + 1)
    if b[12:16] == b"VP8L":
        n = int.from_bytes(b[21:25], "little")
        return ((n & 0x3FFF) + 1, ((n >> 14) & 0x3FFF) + 1)
    if b[12:16] == b"VP8 ":
        return (int.from_bytes(b[26:28], "little") & 0x3FFF,
                int.from_bytes(b[28:30], "little") & 0x3FFF)
    return None


# 일상컷 화면비(2026-11-23) — 계획(기록 scene.aspect)이 정한다: 눕는 자세 · 환경 컷 3:2, 허리 위 · 3/4 1:1, 나머지 2:3.
# 그림 API 가 받는 크기 셋뿐. 세계 그림(초상)은 ART_SIZE 하나, 이미 그린 일상컷은 2:3 그대로
ASPECT_SIZES = {"2:3": (1024, 1536), "1:1": (1024, 1024), "3:2": (1536, 1024)}
CASUAL_FILE = re.compile(r"_casual\d+\.webp$")
CASUAL_RECORD = re.compile(r"-casual\d+\.[A-Za-z0-9_]+-ui\.json$")


def planned_aspects(dirs=("img",)):
    """{webp 이름: 화면비} — 그림 저장소의 일상컷 기록(img/ 옆 records/ 의 file · scene.aspect). 기록이 없으면 빈 것"""
    root, out = os.path.dirname(DIR), {}
    for d in dirs:
        full = d if os.path.isabs(d) else os.path.join(root, d)
        rec = os.path.join(os.path.dirname(os.path.realpath(full)), "records")
        if not os.path.isdir(rec):
            continue
        for base, _, files in os.walk(rec):
            for f in files:
                if not CASUAL_RECORD.search(f):
                    continue
                try:
                    r = json.load(open(os.path.join(base, f), encoding="utf-8"))
                except (OSError, ValueError):
                    continue
                a = (r.get("scene") or {}).get("aspect") if isinstance(r, dict) else None
                if isinstance(r, dict) and r.get("file") and a in ASPECT_SIZES:
                    out[r["file"]] = a
    return out


def art_size(dirs=("img",)):
    """[(이름, 가로, 세로, 왜)…] — 크기가 안 맞는 그림. 세계 그림은 ART_SIZE(2:3) 하나, 일상컷은 ASPECT_SIZES 셋 가운데 하나이고
    기록(계획)에 화면비가 있으면 그 크기(2026-11-23)."""
    root, bad, plan = os.path.dirname(DIR), [], None
    for d in dirs:
        full = d if os.path.isabs(d) else os.path.join(root, d)
        if not os.path.isdir(full):
            continue
        for f in sorted(os.listdir(full)):
            if not f.lower().endswith(".webp"):
                continue
            s = _webp_size(os.path.join(d, f))
            if not s:
                continue
            s = tuple(s)
            if not CASUAL_FILE.search(f):
                if s != ART_SIZE:
                    bad.append((f, s[0], s[1], "세계 그림은 %d×%d" % ART_SIZE))
                continue
            if s not in ASPECT_SIZES.values():
                bad.append((f, s[0], s[1], "일상컷은 " + " · ".join("%d×%d" % v for v in ASPECT_SIZES.values())))
                continue
            if plan is None:
                plan = planned_aspects(dirs)
            a = plan.get(f)
            if a and ASPECT_SIZES[a] != s:
                bad.append((f, s[0], s[1], "계획 화면비 %s 는 %d×%d" % ((a,) + ASPECT_SIZES[a])))
    return bad

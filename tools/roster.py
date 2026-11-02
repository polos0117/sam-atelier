# -*- coding: utf-8 -*-
"""자료 파일 읽기·쓰기. game-atelier → element-atelier 의 tools/roster.py 에서 왔다(2026-11-02).

삼국지는 data/sam-design.json 한 곳에 있다 — 세력 › 장수. 카드 열쇠는 장수 이름(게임 표 그대로, 예: 관우)이고
그림 파일 이름 맨 앞에 들어간다. 세계(폼) 열쇠는 vocab.worlds(samguk · fantasy · mecha), 화풍은 data/style.json 의 styles 열쇠다."""
import json, os

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


def art_size(dirs=("img",)):
    """[(이름, 가로, 세로)…] — 그림 자리 안에서 ART_SIZE 가 아닌 그림."""
    bad = []
    for d in dirs:
        full = os.path.join(os.path.dirname(DIR), d)
        if not os.path.isdir(full):
            continue
        for f in sorted(os.listdir(full)):
            if not f.lower().endswith(".webp"):
                continue
            s = _webp_size(os.path.join(d, f))
            if s and tuple(s) != ART_SIZE:
                bad.append((f, s[0], s[1]))
    return bad

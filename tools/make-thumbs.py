#!/usr/bin/env python3
"""img/ 의 그림 webp 로 목록용 썸네일을 만든다.

도감 목록(.face)은 2:3 비율에 96px 안팎으로 그리는데, 그대로 두면 원본(평균 140KB)을
배경 이미지로 받는다. 여기서 만든 작은 파일을 대신 쓰면 목록 트래픽이
10분의 1 아래로 떨어진다.

  img/<카드>_....webp  ->  img/thumb/<같은 이름>

전신 비율을 유지한 채 긴 변 기준으로 줄인다. 얼굴만 잘라내지 않는 이유는
목록에서 실루엣이 보여야 장수를 구분하기 때문이다.

원본이 2:3 이 아닌 것(예: 1122x1402)도 비율 그대로 줄인다. 목록 CSS 가
cover 로 잘라 보여주므로 여기서 굳이 맞추지 않는다.

이미 있고 원본보다 새 것이면 건너뛴다. 그래서 워크플로가 매번 돌아도
새로 올라온 것만 처리한다. 다만 CI 의 체크아웃은 모든 파일의 시각이 같아서
"덮어쓴 원본" 을 이 규칙으로는 못 알아본다 — 워크플로가 이번 푸시에서 달라진
파일을 --redo 로 넘겨 주고, 그것은 시각과 상관없이 다시 만든다.

    python3 tools/make-thumbs.py --redo img/a.webp img/b.webp
    python3 tools/make-thumbs.py --all        # 전부 다시

화풍 견본(style-*.webp)은 목록에 안 쓰이므로 제외한다.

열리지 않는 원본(업로드가 덜 된 0바이트 파일 등)은 건너뛰고 나머지를 다 만든 뒤 2 로 끝난다.
GitHub Actions 에는 그 파일을 ::error:: 로 적는다(pkm 2026-10-27 — 깨진 그림 하나에 그 뒤 실행이 다 멈췄다).
game-atelier 의 같은 도구에서 왔다(2026-10-30).
"""
import sys
from pathlib import Path
from PIL import Image

SRC = Path("img")
DST = SRC / "thumb"
LONG_EDGE = 512          # 2:3 이면 341x512. 갤러리(.gal, 120~200px 폭) 기준으로 잡았다
QUALITY = 72


def targets():
    for p in sorted(SRC.glob("*.webp")):
        if p.name.startswith("style-"):
            continue
        yield p


def stale(src: Path, dst: Path) -> bool:
    if not dst.exists():
        return True
    return src.stat().st_mtime > dst.stat().st_mtime


def build(src: Path, dst: Path) -> int:
    im = Image.open(src).convert("RGB")
    w, h = im.size
    scale = LONG_EDGE / max(w, h)
    if scale < 1:
        im = im.resize((max(1, round(w * scale)), max(1, round(h * scale))),
                       Image.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, "WEBP", quality=QUALITY, method=6)
    return dst.stat().st_size


def main() -> int:
    check = "--check" in sys.argv
    redo_all = "--all" in sys.argv
    redo = set()
    if "--redo" in sys.argv:
        for a in sys.argv[sys.argv.index("--redo") + 1:]:
            if a.startswith("--"):
                break
            redo.add(Path(a).name)
    if not SRC.is_dir():
        print("img/ 가 없다", file=sys.stderr)
        return 1

    made = skipped = total = 0
    broken = []
    for src in targets():
        dst = DST / src.name
        if not (redo_all or src.name in redo) and not stale(src, dst):
            skipped += 1
            continue
        if check:
            print("생성 예정:", dst)
            made += 1
            continue
        try:
            total += build(src, dst)
        except (OSError, ValueError) as e:   # PIL 의 UnidentifiedImageError 도 OSError 다
            broken.append(src)
            print(f"::error file={src}::열리지 않는 그림 — 썸네일을 건너뛴다({src.stat().st_size}바이트, {e.__class__.__name__})")
            continue
        made += 1

    # 원본이 사라진 썸네일은 치운다
    removed = 0
    if DST.is_dir() and not check:
        names = {p.name for p in targets()}
        for p in DST.glob("*.webp"):
            if p.name not in names:
                p.unlink()
                removed += 1

    print(f"썸네일 {made}장 생성, {skipped}장 유지, {removed}장 삭제"
          + (f", 합계 {total/1024:.0f}KB" if total else "")
          + (f", 열리지 않는 그림 {len(broken)}장" if broken else ""))
    for p in broken:
        print("  열리지 않음:", p, file=sys.stderr)
    return 2 if broken else 0


if __name__ == "__main__":
    raise SystemExit(main())

"""썸네일 도구 — 열리지 않는 원본은 건너뛰고 나머지는 다 만든 뒤 2 로 끝난다. python3 tests/make-thumbs.py
   (pkm 2026-10-27 — 0바이트 하나에 썸네일 실행 12번이 다 멈췼다). game-atelier 의 같은 검사에서 왔다(2026-10-30)"""
import os, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as d:
    img = Path(d) / "img"; img.mkdir()
    Image.new("RGB", (1024, 1536), (200, 120, 80)).save(img / "fe_fantasy_game_keyart_f.webp", "WEBP")
    (img / "fe-steel_steampunk_game_keyart_f.webp").write_bytes(b"")                 # 덜 올라간 파일
    Image.new("RGB", (1024, 1536), (80, 120, 200)).save(img / "og_mecha_game_keyart_f.webp", "WEBP")
    r = subprocess.run([sys.executable, str(ROOT / "tools" / "make-thumbs.py")], cwd=d, capture_output=True, text=True)
    assert r.returncode == 2, (r.returncode, r.stdout, r.stderr)
    assert "::error file=img/fe-steel_steampunk_game_keyart_f.webp::" in r.stdout, r.stdout
    thumbs = sorted(p.name for p in (img / "thumb").glob("*.webp"))
    assert thumbs == ["fe_fantasy_game_keyart_f.webp", "og_mecha_game_keyart_f.webp"], thumbs
    assert Image.open(img / "thumb" / thumbs[0]).size == (341, 512)
    r = subprocess.run([sys.executable, str(ROOT / "tools" / "make-thumbs.py")], cwd=d, capture_output=True, text=True)
    assert r.returncode == 2 and "2장 유지" in r.stdout, r.stdout                     # 다시 돌려도 멀쩡한 것은 그대로, 깨진 것은 계속 알린다
# --redo — 시각이 새 것이어도 이름을 준 원본은 다시 만든다(체크아웃은 모든 파일의 시각이 같다)
    t0 = (img / "thumb" / thumbs[0]).stat().st_mtime_ns
    import time; time.sleep(0.01)
    r = subprocess.run([sys.executable, str(ROOT / "tools" / "make-thumbs.py"), "--redo", "img/" + thumbs[0]], cwd=d, capture_output=True, text=True)
    assert (img / "thumb" / thumbs[0]).stat().st_mtime_ns > t0 and "1장 생성" in r.stdout, r.stdout
print("PASS 썸네일 도구: 열리지 않는 원본은 건너뛰고 나머지는 만든다 · 2 로 끝나고 ::error:: 를 적는다 · 다시 돌려도 계속 알린다 · --redo")

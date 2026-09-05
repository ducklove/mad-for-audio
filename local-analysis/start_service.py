"""로그인 자동 실행용 진입점. PowerShell 실행 정책을 변경하지 않는다."""
import os
from pathlib import Path
import subprocess
import sys
import time

import httpx
from server import DATA, load_config


def start():
    config = load_config()
    headers = {"Authorization": "Bearer " + config["token"]}
    try:
        response = httpx.get("http://127.0.0.1:8766/health", headers=headers, timeout=2)
    except httpx.ConnectError:
        response = None
    if response is not None:
        if response.status_code == 200 and response.json().get("ok"):
            return
        raise RuntimeError("8766 포트에 다른 서비스가 있습니다.")
    base = Path(__file__).resolve().parent
    python = base / ".venv" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    with (DATA / "service.log").open("wb") as out, (DATA / "service-error.log").open("wb") as err:
        process = subprocess.Popen([str(python), str(base / "server.py")], cwd=base,
            stdout=out, stderr=err, creationflags=0x08000000 if os.name == "nt" else 0)
    for _ in range(40):
        if process.poll() is not None:
            raise RuntimeError("PC 분석 서버 시작 실패. service-error.log를 확인하세요.")
        try:
            response = httpx.get("http://127.0.0.1:8766/health", headers=headers, timeout=1)
            if response.status_code == 200 and response.json().get("ok"):
                (DATA / "service.pid").write_text(str(process.pid), encoding="utf-8")
                return
        except httpx.RequestError:
            pass
        time.sleep(.25)
    raise RuntimeError("PC 분석 서버 준비 시간이 초과됐습니다.")


if __name__ == "__main__":
    try:
        start()
    except Exception as error:
        DATA.mkdir(parents=True, exist_ok=True)
        (DATA / "startup-error.log").write_text(type(error).__name__ + ": PC 서버 시작 실패", encoding="utf-8")
        sys.exit(1)

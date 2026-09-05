"""로그인 자동 실행용 진입점. PowerShell 실행 정책을 변경하지 않는다."""
import os
from pathlib import Path
import subprocess
import sys
import time
from datetime import datetime

import httpx
from server import DATA, load_config


def start():
    config = load_config()
    headers = {"Authorization": "Bearer " + config["token"]}
    try:
        response = httpx.get("http://127.0.0.1:8766/health", headers=headers, timeout=2)
    except (httpx.ConnectError, httpx.ConnectTimeout):
        response = None
    if response is not None:
        if response.status_code == 200 and response.json().get("ok"):
            return
        raise RuntimeError("8766 포트에 다른 서비스가 있습니다.")
    base = Path(__file__).resolve().parent
    python = base / ".venv" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    with (DATA / "service.log").open("ab") as out, (DATA / "service-error.log").open("ab") as err:
        process = subprocess.Popen([str(python), str(base / "server.py")], cwd=base,
            stdout=out, stderr=err, creationflags=0x08000000 if os.name == "nt" else 0)
    for _ in range(40):
        if process.poll() is not None:
            raise RuntimeError("PC 분석 서버 시작 실패. service-error.log를 확인하세요.")
        try:
            response = httpx.get("http://127.0.0.1:8766/health", headers=headers, timeout=1)
            if response.status_code == 200 and response.json().get("ok"):
                (DATA / "service.pid").write_text(str(process.pid), encoding="utf-8")
                record("PC 분석 서버 시작 완료 · PID " + str(process.pid))
                return
        except httpx.RequestError:
            pass
        time.sleep(.25)
    raise RuntimeError("PC 분석 서버 준비 시간이 초과됐습니다.")


def watch():
    """중복 감시를 잠금으로 막고, 연결이 거부된 서버만 재실행한다."""
    DATA.mkdir(parents=True, exist_ok=True)
    with (DATA / "watchdog.lock").open("a+b") as lock:
        if not lock.tell():
            lock.write(b"0")
            lock.flush()
        lock.seek(0)
        try:
            if os.name == "nt":
                import msvcrt
                msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError:
            return
        (DATA / "watchdog.pid").write_text(str(os.getpid()), encoding="utf-8")
        record("자동 복구 감시 시작")
        while not (DATA / "service.stopped").exists():
            try:
                # 응답이 느리거나 인증이 실패한 서버는 강제로 종료하지 않는다.
                start()
            except Exception as error:
                record(type(error).__name__ + ": 서버 확인 실패 · 30초 뒤 재시도")
            time.sleep(30)
        record("사용자 요청으로 자동 복구 감시 종료")


def record(message):
    with (DATA / "watchdog.log").open("a", encoding="utf-8") as log:
        log.write(datetime.now().isoformat(timespec="seconds") + " " + message + "\n")


def launch():
    """로그인 및 수동 실행 모두 감시 프로세스를 통해 서버를 시작한다."""
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / "service.stopped").unlink(missing_ok=True)
    base = Path(__file__).resolve().parent
    python = base / ".venv" / ("Scripts/pythonw.exe" if os.name == "nt" else "bin/python")
    subprocess.Popen([str(python), str(Path(__file__).resolve()), "--watch"], cwd=base,
        stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        creationflags=(0x00000008 | 0x00000200) if os.name == "nt" else 0,
        start_new_session=os.name != "nt")


if __name__ == "__main__":
    try:
        if "--watch" in sys.argv:
            watch()
        else:
            launch()
    except Exception as error:
        DATA.mkdir(parents=True, exist_ok=True)
        (DATA / "startup-error.log").write_text(type(error).__name__ + ": PC 서버 시작 실패", encoding="utf-8")
        sys.exit(1)

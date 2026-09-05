"""브라우저와 별도 저장소를 쓰는 설치 앱에도 일회용 PC 연결을 전달한다."""
import argparse
import os
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import urlsplit
import webbrowser

import httpx
import psutil

from server import load_config
from start_service import start


def installed_app():
    candidates = [
        Path(os.environ.get("LOCALAPPDATA", str(Path.home() / "AppData/Local"))) / "Programs/Mad for Audio/Mad for Audio.exe",
        Path(os.environ.get("ProgramFiles", "C:/Program Files")) / "Mad for Audio/Mad for Audio.exe",
    ] if os.name == "nt" else [Path("/Applications/Mad for Audio.app/Contents/MacOS/Mad for Audio")]
    return next((path for path in candidates if path.is_file()), None)


def check_app_closed(executable):
    expected = os.path.normcase(str(executable.resolve()))
    for process in psutil.process_iter(["exe"]):
        try:
            actual = process.info.get("exe")
            if actual and os.path.normcase(str(Path(actual).resolve())) == expected:
                raise RuntimeError("라디오 트레이 메뉴의 ‘종료’로 앱을 완전히 종료한 뒤 다시 실행하세요. PC 서버 녹음은 계속됩니다.")
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue


def validate_link(value):
    url = urlsplit(value)
    if (url.scheme != "https" or url.netloc != "ducklove.github.io" or
            url.path != "/mad-for-audio/" or url.query or
            not re.fullmatch(r"pc-analysis-pair=[A-Za-z0-9_-]{43}", url.fragment)):
        raise RuntimeError("PC 서버의 연결 링크가 올바르지 않습니다.")
    return value


def launch_desktop(executable, url):
    check_app_closed(executable)
    # API 키는 앱으로 넘기지 않는다. 일회용 링크는 명령줄·파일에 기록하지 않는다.
    environment = {key: value for key, value in os.environ.items()
                   if key not in ("OPENROUTER_API_KEY", "GEMINI_API_KEY")}
    environment["MFA_TRAY_HOME"] = validate_link(url)
    subprocess.Popen([str(executable)], env=environment, close_fds=True,
                     creationflags=0x08000000 if os.name == "nt" else 0)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    target = parser.add_mutually_exclusive_group()
    target.add_argument("--desktop", action="store_true", help="설치된 라디오 앱 연결")
    target.add_argument("--browser", action="store_true", help="기본 브라우저 연결")
    target.add_argument("--url-only", action="store_true", help="일회용 연결 링크만 출력")
    parser.add_argument("--app", type=Path, help="사용자 지정 설치 경로의 라디오 실행 파일")
    args = parser.parse_args()
    executable = args.app or installed_app()
    if args.desktop and executable is None:
        raise RuntimeError("설치된 라디오 앱을 찾지 못했습니다. --app으로 실행 파일 경로를 지정하세요.")
    use_desktop = executable is not None and not (args.browser or args.url_only)
    if use_desktop:
        if not executable.is_file():
            raise RuntimeError("라디오 실행 파일을 찾지 못했습니다.")
        check_app_closed(executable)
    start()
    config = load_config()
    response = httpx.post("http://127.0.0.1:8766/connection-link",
                          headers={"Authorization": "Bearer " + config["token"]}, timeout=5)
    response.raise_for_status()
    url = validate_link(response.json()["url"])
    if args.url_only:
        print(url)
    elif use_desktop:
        launch_desktop(executable, url)
        print("설치 앱을 열었습니다. 2분 안에 ‘오디오 시스템’ 보기로 전환하면 PC 연결을 저장합니다.")
    else:
        webbrowser.open(url)
        print("기본 브라우저에서 이 PC 연결을 진행합니다.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(str(error) if isinstance(error, RuntimeError) else "PC 연결에 실패했습니다. 서버 실행 상태를 확인하세요.", file=sys.stderr)
        sys.exit(1)

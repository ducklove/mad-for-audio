#!/bin/bash
# webOS 래퍼 앱 패키징 — 사용법: ./package.sh [디바이스이름]
# 디바이스 이름을 주면 패키징 후 TV에 설치·실행까지 한다 (ares-setup-device로 등록해 둔 이름).
set -euo pipefail
cd "$(dirname "$0")"
# keep-alive.sh가 launchd(최소 PATH)에서 부를 수 있다 — ares-* 와 node 경로를 보장한다.
export PATH="/opt/homebrew/bin:$PATH"

ares-package app -o dist
IPK=$(ls -t dist/*.ipk | head -1)
echo "패키징 완료: $IPK"

if [ $# -ge 1 ]; then
    DEVICE="$1"
    ares-install --device "$DEVICE" "$IPK"
    ares-launch --device "$DEVICE" com.ducklove.madforaudio
fi

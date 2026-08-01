#!/bin/bash
# keep-alive.sh를 하루 한 번 도는 launchd 작업으로 등록한다.
# 해제: ./install-keepalive.sh --uninstall
set -euo pipefail

LABEL="com.ducklove.madforaudio.keepalive"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ "${1:-}" = "--uninstall" ]; then
    launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
    rm -f "$PLIST"
    echo "자동 연장 작업을 해제했습니다."
    exit 0
fi

mkdir -p "$HOME/Library/LaunchAgents"
cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key><string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>$SCRIPT_DIR/keep-alive.sh</string>
    </array>
    <!-- 매일 13시. 잠들어 있었으면 깨어난 직후 한 번 실행된다. -->
    <key>StartCalendarInterval</key>
    <dict><key>Hour</key><integer>13</integer><key>Minute</key><integer>0</integer></dict>
    <key>RunAtLoad</key><true/>
    <key>StandardErrorPath</key><string>$HOME/.config/mad-for-audio/keep-alive.err</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "등록 완료: 매일 13시에 세션을 연장하고 앱 설치 상태를 확인합니다."
echo "로그: ~/.config/mad-for-audio/keep-alive.log"

#!/bin/bash
# 개발자 모드 세션 자동 연장 + 앱 상재(常在) 확인.
# launchd가 하루 한 번 부른다 (webos/install-keepalive.sh 참고).
#
# 왜 필요한가: 이 TV(webOS 25)는 알려진 루팅 경로가 모두 막혀 있어 Homebrew Channel
# 영구 설치가 불가능하다. 대신 개발자 모드 세션(1000시간)을 만료 전에 계속 되감아
# 실질적으로 만료를 없앤다. 세션 리셋은 LG 클라우드 API라 TV가 꺼져 있어도 된다.
#
# 세션 토큰은 저장소가 아니라 ~/.config/mad-for-audio/devmode-token(600)에 있다.
# TV에서 개발자 모드를 껐다 켜면 토큰이 바뀌므로 --refresh-token 으로 다시 받는다.

set -uo pipefail

DEVICE="${DEVICE:-tv}"
TV_HOST="${TV_HOST:-192.168.68.70}"
APP_ID="com.ducklove.madforaudio"
TOKEN_FILE="$HOME/.config/mad-for-audio/devmode-token"
LOG="$HOME/.config/mad-for-audio/keep-alive.log"
ARES_BIN="/opt/homebrew/bin"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# launchd는 최소 PATH로 부른다. ares-* 는 `#!/usr/bin/env node` 라 node까지 필요하므로
# 절대 경로만으로는 부족하다 — PATH를 먼저 세운다.
export PATH="$ARES_BIN:$PATH"

mkdir -p "$(dirname "$LOG")"
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG"; }

# TV에서 현재 세션 토큰을 다시 읽어 온다 (개발자 모드를 재활성화한 뒤 필요).
refresh_token() {
    local key="$HOME/.ssh/tv_webos"
    [ -f "$key" ] || { log "ERROR: SSH 키 없음 ($key)"; return 1; }
    ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
        -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa \
        -o ConnectTimeout=10 -p 9922 "prisoner@$TV_HOST" \
        "cat /var/luna/preferences/devmode_enabled" 2>/dev/null | tr -d '\r\n ' > "$TOKEN_FILE.new"
    if [ -s "$TOKEN_FILE.new" ]; then
        mv "$TOKEN_FILE.new" "$TOKEN_FILE"
        chmod 600 "$TOKEN_FILE"
        log "토큰 갱신됨"
        return 0
    fi
    rm -f "$TOKEN_FILE.new"
    log "ERROR: 토큰을 읽지 못함 (TV 꺼짐 또는 개발자 모드 off)"
    return 1
}

if [ "${1:-}" = "--refresh-token" ]; then
    refresh_token && echo "토큰을 다시 받았습니다." || { echo "토큰 갱신 실패 — TV와 개발자 모드 상태를 확인하세요."; exit 1; }
fi

[ -f "$TOKEN_FILE" ] || { log "토큰 파일 없음 — 최초 1회 --refresh-token 필요"; exit 1; }
TOKEN=$(cat "$TOKEN_FILE")

# 1) 세션 되감기. 토큰이 무효하면(개발자 모드 재활성화 등) 한 번 다시 받아 재시도한다.
reset_session() {
    curl -s -m 25 "https://developer.lge.com/secure/ResetDevModeSession.dev?sessionToken=$1"
}
RESP=$(reset_session "$TOKEN")
if ! echo "$RESP" | grep -q '"result":"success"'; then
    log "리셋 실패 ($RESP) — 토큰 재취득 시도"
    if refresh_token; then
        TOKEN=$(cat "$TOKEN_FILE")
        RESP=$(reset_session "$TOKEN")
    fi
fi

if echo "$RESP" | grep -q '"result":"success"'; then
    LEFT=$(curl -s -m 25 "https://developer.lge.com/secure/CheckDevModeSession.dev?sessionToken=$TOKEN" \
        | sed -n 's/.*"errorMsg":"\([0-9:]*\)".*/\1/p')
    log "세션 연장 OK (남은 시간 ${LEFT:-?})"
else
    log "ERROR: 세션 연장 실패 — $RESP"
fi

# 2) 앱이 아직 설치돼 있는지 확인하고, 사라졌으면 다시 넣는다.
#    TV가 꺼져 있으면 조용히 넘어간다 (다음 실행에서 다시 확인).
if ! nc -z -G 4 "$TV_HOST" 9922 2>/dev/null; then
    log "TV 응답 없음 — 설치 확인 건너뜀"
    exit 0
fi

# 조회 자체가 실패한 경우(도구·네트워크 문제)를 '앱 없음'으로 오인하면 매일 헛
# 재설치를 돈다 — 목록을 정상적으로 받아왔을 때만 부재를 판정한다.
LIST=$("$ARES_BIN/ares-install" --device "$DEVICE" --list 2>&1)
if [ $? -ne 0 ]; then
    log "설치 목록 조회 실패 — 건너뜀 ($(echo "$LIST" | tail -1))"
elif echo "$LIST" | grep -q "$APP_ID"; then
    log "앱 설치 상태 정상"
else
    log "앱이 없음 — 재설치 시도"
    if "$SCRIPT_DIR/package.sh" "$DEVICE" >> "$LOG" 2>&1; then
        log "재설치 완료"
    else
        log "ERROR: 재설치 실패"
    fi
fi

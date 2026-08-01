#!/bin/bash
# 개발자 모드 세션 자동 연장 + 앱 상재(常在) 확인. 여러 대를 함께 관리한다.
# launchd가 하루 한 번 부른다 (webos/install-keepalive.sh 참고).
#
# 왜 필요한가: webOS 25 기기는 알려진 루팅 경로가 모두 막혀 있어 Homebrew Channel
# 영구 설치가 불가능하다. 대신 개발자 모드 세션(1000시간)을 만료 전에 계속 되감아
# 실질적으로 만료를 없앤다. 세션 리셋은 LG 클라우드 API라 기기가 꺼져 있어도 된다.
#
# 사용법:
#   ./keep-alive.sh                     등록된 기기(토큰 있는 것) 전부 처리
#   ./keep-alive.sh tv tv2              특정 기기만
#   ./keep-alive.sh --refresh-token tv2 해당 기기에서 세션 토큰을 새로 받는다
#
# 세션 토큰은 저장소가 아니라 ~/.config/mad-for-audio/devmode-token-<기기>(600)에 둔다.

set -uo pipefail

APP_ID="com.ducklove.madforaudio"
CONF_DIR="$HOME/.config/mad-for-audio"
LOG="$CONF_DIR/keep-alive.log"
ARES_BIN="/opt/homebrew/bin"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# launchd는 최소 PATH로 부른다. ares-* 는 `#!/usr/bin/env node` 라 node까지 필요하므로
# 절대 경로만으로는 부족하다 — PATH를 먼저 세운다.
export PATH="$ARES_BIN:$PATH"

mkdir -p "$CONF_DIR"
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG"; }

token_file() { echo "$CONF_DIR/devmode-token-$1"; }

# 주소·키·패스프레이즈는 ares 등록 정보를 그대로 쓴다 — 같은 값을 두 곳에 적어 두면
# 언젠가 어긋난다. (emulator 항목은 indelible 표시가 있어 걸러진다.)
REGISTRY="$HOME/.webos/tv/novacom-devices.json"
device_field() {
    python3 -c '
import json, sys, os
name, field = sys.argv[1], sys.argv[2]
try:
    entries = json.load(open(os.path.expanduser(sys.argv[3])))
except Exception:
    sys.exit(0)
for d in entries:
    if d.get("name") == name and not d.get("indelible"):
        v = d.get(field) or ""
        if field == "privateKey":
            v = (v or {}).get("openSsh", "") if isinstance(v, dict) else ""
        print(v)
        break
' "$1" "$2" "$REGISTRY" 2>/dev/null
}
device_host() { device_field "$1" host; }

# 기기에서 현재 세션 토큰을 다시 읽어 온다 (개발자 모드를 재활성화한 뒤 필요).
# TV는 ssh-rsa만 제공하므로 최신 OpenSSH에서는 레거시 알고리즘을 명시해야 하고,
# 개발자 모드 키에는 패스프레이즈가 걸려 있어 askpass로 넣어 준다 (대화형 프롬프트가
# 뜨면 launchd에서 그대로 멎는다).
refresh_token() {
    local dev="$1" host pass key askpass out
    host=$(device_host "$dev")
    [ -n "$host" ] || { log "$dev: ares에 등록되지 않은 기기"; return 1; }
    key="$HOME/.ssh/$(device_field "$dev" privateKey)"
    [ -f "$key" ] || key="$HOME/.ssh/${dev}_webos"
    [ -f "$key" ] || { log "$dev: SSH 키 없음"; return 1; }
    pass=$(device_field "$dev" passphrase)

    askpass=$(mktemp "${TMPDIR:-/tmp}/mfa-askpass.XXXXXX")
    printf '#!/bin/sh\nprintf "%%s\\n" "$MFA_PASS"\n' > "$askpass"
    chmod 700 "$askpass"
    out=$(MFA_PASS="$pass" SSH_ASKPASS="$askpass" SSH_ASKPASS_REQUIRE=force DISPLAY=:0 \
        ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
        -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa \
        -o ConnectTimeout=10 -i "$key" -p 9922 "prisoner@$host" \
        "cat /var/luna/preferences/devmode_enabled" 2>/dev/null | tr -d '\r\n ')
    rm -f "$askpass"

    if [ -n "$out" ]; then
        printf '%s' "$out" > "$(token_file "$dev")"
        chmod 600 "$(token_file "$dev")"
        log "$dev: 토큰 갱신됨"
        return 0
    fi
    log "$dev: 토큰을 읽지 못함 (기기 꺼짐 또는 개발자 모드 off)"
    return 1
}

if [ "${1:-}" = "--refresh-token" ]; then
    dev="${2:-tv}"
    if refresh_token "$dev"; then echo "$dev: 토큰을 다시 받았습니다."; exit 0; fi
    echo "$dev: 토큰 갱신 실패 — 기기와 개발자 모드 상태를 확인하세요."; exit 1
fi

# 단일 기기 시절의 토큰 파일을 새 이름으로 옮긴다.
[ -f "$CONF_DIR/devmode-token" ] && [ ! -f "$(token_file tv)" ] \
    && mv "$CONF_DIR/devmode-token" "$(token_file tv)"

# 대상 기기: 인자로 받거나, 토큰이 있는 기기 전부.
if [ $# -gt 0 ]; then
    DEVICES=("$@")
else
    DEVICES=()
    for f in "$CONF_DIR"/devmode-token-*; do
        [ -e "$f" ] && DEVICES+=("$(basename "$f" | sed 's/^devmode-token-//')")
    done
fi
[ ${#DEVICES[@]} -gt 0 ] || { log "대상 기기 없음 — 최초 1회 --refresh-token <기기> 필요"; exit 1; }

for DEVICE in "${DEVICES[@]}"; do
    TF=$(token_file "$DEVICE")
    [ -f "$TF" ] || { log "$DEVICE: 토큰 파일 없음 — 건너뜀"; continue; }
    TOKEN=$(cat "$TF")

    # 1) 세션 되감기. 토큰이 무효하면(개발자 모드 재활성화 등) 한 번 다시 받아 재시도한다.
    RESP=$(curl -s -m 25 "https://developer.lge.com/secure/ResetDevModeSession.dev?sessionToken=$TOKEN")
    if ! echo "$RESP" | grep -q '"result":"success"'; then
        log "$DEVICE: 리셋 실패 ($RESP) — 토큰 재취득 시도"
        if refresh_token "$DEVICE"; then
            TOKEN=$(cat "$TF")
            RESP=$(curl -s -m 25 "https://developer.lge.com/secure/ResetDevModeSession.dev?sessionToken=$TOKEN")
        fi
    fi
    if echo "$RESP" | grep -q '"result":"success"'; then
        LEFT=$(curl -s -m 25 "https://developer.lge.com/secure/CheckDevModeSession.dev?sessionToken=$TOKEN" \
            | sed -n 's/.*"errorMsg":"\([0-9:]*\)".*/\1/p')
        log "$DEVICE: 세션 연장 OK (남은 시간 ${LEFT:-?})"
    else
        log "$DEVICE: ERROR 세션 연장 실패 — $RESP"
    fi

    # 2) 앱이 아직 설치돼 있는지 확인하고, 사라졌으면 다시 넣는다.
    HOST=$(device_host "$DEVICE")
    if [ -z "$HOST" ] || ! nc -z -G 4 "$HOST" 9922 2>/dev/null; then
        log "$DEVICE: 응답 없음 — 설치 확인 건너뜀"
        continue
    fi
    # 조회 자체가 실패한 경우(도구·네트워크 문제)를 '앱 없음'으로 오인하면 매일 헛
    # 재설치를 돈다 — 목록을 정상적으로 받아왔을 때만 부재를 판정한다.
    if ! LIST=$("$ARES_BIN/ares-install" --device "$DEVICE" --list 2>&1); then
        log "$DEVICE: 설치 목록 조회 실패 — 건너뜀 ($(echo "$LIST" | tail -1))"
    elif echo "$LIST" | grep -q "$APP_ID"; then
        log "$DEVICE: 앱 설치 상태 정상"
    else
        log "$DEVICE: 앱이 없음 — 재설치 시도"
        if "$SCRIPT_DIR/package.sh" "$DEVICE" >> "$LOG" 2>&1; then
            log "$DEVICE: 재설치 완료"
        else
            log "$DEVICE: ERROR 재설치 실패"
        fi
    fi
done

# LG 스마트 TV (webOS) 래퍼 앱

`app/`은 GitHub Pages 본체(https://ducklove.github.io/mad-for-audio/)로 넘어가는
얇은 래퍼다. 본체 업데이트는 지금처럼 `git push`만 하면 TV 앱에도 즉시 반영되므로,
이 래퍼는 사실상 한 번만 설치하면 된다.

대상 기기: OLED48C2ENA, webOS 25 (Chromium 계열 최신 엔진 — 트랜스파일 불필요).
조작은 매직 리모컨 포인터 기준.

## 1회 준비 (TV + 계정)

1. https://webostv.developer.lge.com 에서 LG 개발자 계정 가입 (무료).
2. TV의 LG Content Store에서 **Developer Mode** 앱 설치 → 개발자 계정으로 로그인.
3. Developer Mode 앱에서 **Dev Mode Status ON** (TV 재부팅됨) → 재부팅 후 **Key Server ON**.
   화면에 표시되는 TV IP와 Passphrase를 메모.

## 1회 준비 (PC)

CLI는 전역 설치돼 있다 (`npm install -g @webos-tools/cli`).

```bash
ares-setup-device
```
- add 선택 → 이름 `tv`, IP는 Developer Mode 앱에 표시된 주소, port `9922`, username `prisoner`.

```bash
ares-novacom --device tv --getkey
```
- Developer Mode 앱의 Passphrase 입력.

## 설치 / 업데이트

```bash
./package.sh tv        # 패키징 + TV 설치 + 실행
./package.sh           # 패키징만 (dist/*.ipk)
```

## 만료 대책 — 자동 세션 연장 (설정 완료)

개발자 모드 세션은 최대 1000시간(약 41일)이고, 만료되면 설치한 앱이 지워진다.
`keep-alive.sh`가 LG 세션 API로 이 타이머를 매일 1000시간으로 되감아 실질적으로
만료를 없앤다. 세션 리셋은 클라우드 API라 **TV가 꺼져 있어도 동작한다.**

```bash
./install-keepalive.sh            # 매일 13시 실행하는 launchd 작업 등록
./install-keepalive.sh --uninstall
./keep-alive.sh                   # 수동 1회 실행
./keep-alive.sh --refresh-token   # TV에서 개발자 모드를 껐다 켠 뒤
```

- 하는 일: ① 세션 1000시간으로 연장 ② 앱이 사라졌으면 자동 재설치.
- 로그: `~/.config/mad-for-audio/keep-alive.log`
- 세션 토큰은 저장소가 아니라 `~/.config/mad-for-audio/devmode-token`(600)에 둔다.
  TV에서 개발자 모드를 재활성화하면 토큰이 바뀌므로 `--refresh-token`으로 다시 받는다.
- Mac이 자고 있었으면 깨어난 직후 한 번 실행된다. 41일 넘게 Mac을 켜지 않으면
  세션이 만료되므로, 그때는 TV에서 개발자 모드를 다시 켜고 재설치하면 된다.

## Homebrew Channel(루팅)이 안 되는 이유

이 TV(OLED48C2ENA, webOS 25 / 펌웨어 10.3.1-3006)는 **알려진 루팅 경로가 모두 막혀
있다.** RootMyTV가 쓰는 취약점은 2022년 중반 이후 펌웨어에서 패치됐고, 후속 익스플로잇
dejavuln도 webOS 22~25 최신 펌웨어에서는 패치된 것으로 보고돼 있다. 따라서 만료 없는
영구 설치(root 권한이 필요한 Homebrew Channel)는 현재 이 기기에서 불가능하고,
위의 자동 세션 연장이 실질적 대안이다.

참고: 루팅 목적의 펌웨어 다운그레이드는 벽돌 위험이 크고 보안 패치를 되돌리므로
권하지 않는다.
- 앱 스토어 정식 등록은 방송 스트림 재배포 권리 문제로 하지 않는다 (개인 사용 전제).
- 리모컨 '뒤로' 버튼은 래퍼가 히스토리를 남기지 않으므로 곧장 앱 종료다.
- OLED 특성상 장시간 오디오만 들을 때는 TV 스크린세이버가 뜰 수 있는데, 번인 방지
  측면에서는 오히려 그대로 두는 편이 낫다.

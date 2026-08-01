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

## 알아둘 것

- **개발자 모드는 50시간 타이머**로 만료된다. Developer Mode 앱에서 연장 버튼을 누르면
  1000시간까지 늘어난다. 만료되면 앱이 지워지므로 가끔 연장할 것.
- 만료 없이 영구 설치하려면 **webOS Homebrew Channel** (dev-manager-desktop) 경로가 있다.
- 앱 스토어 정식 등록은 방송 스트림 재배포 권리 문제로 하지 않는다 (개인 사용 전제).
- 리모컨 '뒤로' 버튼은 래퍼가 히스토리를 남기지 않으므로 곧장 앱 종료다.
- OLED 특성상 장시간 오디오만 들을 때는 TV 스크린세이버가 뜰 수 있는데, 번인 방지
  측면에서는 오히려 그대로 두는 편이 낫다.

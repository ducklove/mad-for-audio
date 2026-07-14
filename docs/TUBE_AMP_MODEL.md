# 진공관 앰프 동작 모델

이 문서는 Mad for Audio의 진공관 앰프가 단순 EQ 프리셋이 아니라 회로 계통별로 다른 비선형·동적 응답을 내도록 만든 근거와 구현값을 기록한다.

## 조사 자료

- Russell O. Hamm, *Tubes Versus Transistors—Is There an Audible Difference*, JAES 21(4), 1973. 정상 선형 영역보다 과부하 트랜지언트에서 증폭 소자별 고조파 분포 차이가 커진다는 측정 결과.
  https://secure.aes.org/forum/pubs/journal/?elib=1980
- RCA, *Receiving Tube Manual RC-16*, 1950. 단일 삼극관의 부하선과 2차 고조파 계산, 푸시풀 Class A/AB 동작 및 왜율 계산.
  https://www.worldradiohistory.com/BOOKSHELF-ARH/Technology/RCA-Books/RCA-Receiving-Tube-Manual-1950-RC-16-OCR.pdf
- Western Electric, *300B Specifications and Data Sheet*. 300B의 플레이트 저항, 동작점별 출력과 2차·3차 고조파 관계.
  https://www.westernelectric.com/300b/
- JJ Electronic, *EL34/E34L Data Sheet*. EL34 전달·플레이트 특성 곡선.
  https://www.jj-electronic.com/images/stories/product/power_tubes/pdf/el34_e34l.pdf
- General Electric, *6L6-GC Data Sheet*. 6L6GC 푸시풀 Class AB의 무신호/최대신호 전류 변화, 부하와 THD.
  https://www.r-type.org/pdfs/6l6gc.pdf
- *KT88 Beam Power Pentode Data Sheet*. 울트라리니어 푸시풀 조건과 출력/왜율.
  https://docs.rs-online.com/6095/0900766b8002ba9b.pdf
- Robert M. Mitchell, *Audio Amplifier Damping*, Electronics, 1951. 댐핑 팩터를 부하 임피던스/출력 임피던스로 정의하고 피드백 전후의 실제 값(2 → 27)을 비교.
  https://www.worldradiohistory.com/Archive-Electronics/50s/Electronics-1951-09.pdf
- Neville Thiele, *Loudspeakers in Vented Boxes: Part 1*, JAES 19(5), 1971. 앰프 댐핑 팩터가 스피커 시스템의 Q와 저역 응답에 들어가는 관계.
  https://secure.aes.org/forum/pubs/journal/?elib=2173
- DAGA 2018, *Audibility of Different Power Supplies in a Guitar Amplifier*. 정류관의 내부 저항과 같은 동적 새그를 유지하면서 리플만 제거한 전원 비교 실험.
  https://pub.dega-akustik.de/DAGA_2018/data/articles/000119.pdf
- Analog Devices, *SHARC Audio Module Audio Elements and Effects*. 공식 `audio_processing.zip`의 tube distortion 예제는 `입력 필터 → 드라이브 → smootherstep 클리퍼 → 출력 게인 → 출력 필터` 구조와 8배 리샘플링 클리퍼를 제공한다.
  https://wiki.analog.com/resources/tools-software/sharc-audio-module/baremetal/audio-elements
- McIntosh, *MA2375 Vacuum Tube Integrated Amplifier*. KT88 ×4, 12AT7 드라이버 ×4, 올튜브 프리앰프, 75W/ch, Unity Coupled 출력 트랜스, THD 0.5% 이하, 10Hz–50kHz(-3dB), 댐핑 팩터 22 이상을 모델의 기준으로 삼았다.
  https://www.mcintoshlabs.com/products/integrated-amplifiers/MA2375

## 구현 구조

신호는 다음 순서로 흐른다.

`EQ → 입력 드라이브 → 전압 증폭관 전달함수 → 5단 톤 회로 → 출력관 드라이브 → 출력관 전달함수 → 전원 새그 → 출력 트랜스 대역 제한 → 스피커 부하/댐핑 → 출력`

- 전압 증폭관과 출력관은 각각 독립된 4096포인트 WaveShaper이며 4배 오버샘플링한다.
- Analog Devices의 5차 smootherstep 개념을 중앙 구간이 정확히 선형인 C² 소프트 니로 변형했다. 임계점부터 파형의 위·아래 기울기가 연속적으로 줄어 ±1에서 수평으로 닫히므로 모서리가 생기지 않는다.
- 입력 드라이브를 1 미만으로 낮춰 일반 음악 레벨은 선형 헤드룸 안에 두고, 큰 피크만 소프트 클리핑 구간에 진입시킨다. 포화 뒤의 출력 게인은 별도로 보정한다.
- 300B에는 작은 제곱항만 더해 싱글엔디드의 2차 배음을 만들고, 함께 생기는 DC 성분은 출력 트랜스 고역통과단에서 차단한다.
- 푸시풀 출력단은 거의 대칭인 전달함수와 작은 Class AB gm 전환부를 사용해 홀수 배음과 저레벨 결을 남긴다.
- 전원 새그는 attack/release가 있는 동적 압축 단계다. 평균 전류 변화가 작은 300B Class A에는 거의 적용하지 않고, 6L6GC Class AB에 가장 크게 적용한다.
- 출력 트랜스는 모델별 고역·저역 한계와 Q를 갖는다.
- 낮은 댐핑 팩터는 스피커 저역 공진과 고역 임피던스 상승을 더 통과시키는 필터로 근사한다.

## 모델별 차이

| 모델 | 출력단 | 주 배음/클리핑 | 새그 | OPT 대역 | 댐핑 모델 |
|---|---|---|---|---|---|
| 300B · 91E | 싱글엔디드 삼극관 Class A | 강한 2차, 비대칭 소프트 포화 | 거의 없음 | 38Hz–16.5kHz | DF 2.5, 저역 공진 큼 |
| EL34 · 8B | 울트라리니어 푸시풀 AB | 3차 중심, 완만한 AB 포화 | 중간, 280ms 회복 | 28Hz–21kHz | DF 8 |
| 6L6GC · AU-111 | 빔관 푸시풀 AB | 굵은 3차, AB 전환부 | 가장 큼, 340ms 회복 | 30Hz–19kHz | DF 5 |
| KT88 · 275 | 유니티 커플드 푸시풀 AB | 낮은 왜곡, 가장 대칭적 | 약함, 빠른 회복 | 18Hz–28kHz | DF 15, 저역 제어 강함 |
| KT88 · MA2375 | 유니티 커플드 푸시풀 AB + SGS | 가장 높은 선형 헤드룸, 보호 소프트 리미팅 | 매우 약함, 120ms 회복 | 10Hz–50kHz | DF 22, 가장 강한 제동 |

볼륨 노드는 비선형 스테이지 앞에 있으므로 볼륨을 올리면 단순히 최종 음량만 커지는 것이 아니라 실제 앰프처럼 전압 증폭단과 출력단의 포화점에 가까워진다.

자동 테스트는 중앙 선형 구간, 양·음 피크에서 모두 감소하는 기울기, 0.98FS 배음 스펙트럼을 검사한다. 300B는 2차가 3차보다 크고, 푸시풀 EL34·6L6GC는 3차가 2차보다 크며, KT88의 총 고조파는 EL34보다 낮아야 한다. 또한 네 모델의 새그·댐핑·출력 트랜스 범위와 재생 중 실시간 회로 전환을 확인한다.

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

`소스 기준 레벨 → EQ → 전압 증폭관 → 5단 톤 회로 → 출력관 → 전원 새그 → 출력 트랜스 → 스피커 부하/댐핑 메모리 → 모델별 출력 보정 → 청취 볼륨`

- 전압 증폭관과 출력관은 각각 독립된 4096포인트 WaveShaper이며 4배 오버샘플링한다.
- Analog Devices의 5차 smootherstep 개념을 중앙 구간이 정확히 선형인 C² 소프트 니로 변형했다. 임계점부터 파형의 위·아래 기울기가 연속적으로 줄어 ±1에서 수평으로 닫히므로 모서리가 생기지 않는다.
- 청취 볼륨을 모든 비선형·동적 회로 뒤로 옮겼다. 작은 소리로 들어도 앰프 입력은 기준 레벨로 구동되므로 관종별 배음과 제동 차이가 사라지지 않으며, 최종 출력 게인으로 모델 간 체감 음량을 맞춘다.
- 소프트 니 아래에도 매우 작은 3차 곡률(`body`)을 남겨 정상 음악 레벨에서 EL34·6L6GC·KT88의 gm 특성이 구분된다. 0.65FS에서는 300B의 2차가 가장 크고, AU-111과 EL34의 3차가 MC275와 MA2375보다 뚜렷하다.
- 300B에는 작은 제곱항만 더해 싱글엔디드의 2차 배음을 만들고, 함께 생기는 DC 성분은 출력 트랜스 고역통과단에서 차단한다.
- 푸시풀 출력단은 거의 대칭인 전달함수와 작은 Class AB gm 전환부를 사용해 홀수 배음과 저레벨 결을 남긴다.
- 전원 새그는 attack/release가 있는 동적 압축 단계다. 평균 전류 변화가 작은 300B Class A에는 거의 적용하지 않고, 6L6GC Class AB에 가장 크게 적용한다. 풀스케일에서도 파형은 하드클립되지 않고 C² 소프트 니로 닫힌다.
- 출력 트랜스는 모델별 고역·저역 한계와 Q를 갖는다.
- 댐핑 팩터는 더 이상 표시용 숫자가 아니다. DF 2.5~22를 62~76Hz 우퍼 공진의 Q, 6~12ms 지연, 5~54% 피드백, 1.3~13.7% 병렬 에너지 경로로 변환한다. 낮은 DF일수록 짧은 저역 꼬리가 오래 남고, MA2375처럼 높은 DF는 거의 즉시 멈춘다.
- 이 시간축 경로는 방 울림을 더하는 리버브가 아니라, Analog Devices의 저역통과 피드백 지연 원리를 짧은 밴드 제한 루프로 사용해 출력 임피던스가 높은 앰프에 물린 우퍼의 에너지 저장을 근사한다.

## 모델별 차이

| 모델 | 출력단 | 주 배음/클리핑 | 새그 | OPT 대역 | 댐핑 모델 |
|---|---|---|---|---|---|
| 300B · 91E | 싱글엔디드 삼극관 Class A | 강한 2차, 비대칭 소프트 포화 | 거의 없음 | 38Hz–16.5kHz | DF 2.5, 저역 공진 큼 |
| EL34 · 8B | 울트라리니어 푸시풀 AB | 3차 중심, 완만한 AB 포화 | 중간, 260ms 회복 | 28Hz–21kHz | DF 8, 10ms 저역 꼬리 |
| 6L6GC · AU-111 | 빔관 푸시풀 AB | 굵은 3차, AB 전환부 | 가장 큼, 320ms 회복 | 30Hz–19kHz | DF 5, 11ms 저역 꼬리 |
| KT88 · 275 | 유니티 커플드 푸시풀 AB | 낮은 왜곡, 가장 대칭적 | 약함, 빠른 회복 | 18Hz–28kHz | DF 15, 저역 제어 강함 |
| KT88 · MA2375 | 유니티 커플드 푸시풀 AB + SGS | 가장 높은 선형 헤드룸, 보호 소프트 리미팅 | 매우 약함, 120ms 회복 | 10Hz–50kHz | DF 22, 가장 강한 제동 |

볼륨 노드는 앰프 출력 뒤에 있다. 따라서 20%로 조용히 들어도 300B의 2차 배음과 느슨한 저역, AU-111의 새그, MC275와 MA2375의 단단한 제동 차이는 그대로 유지된다. 포노처럼 원본 레벨이 낮은 소스의 보정만 앰프 입력 앞에서 수행한다.

자동 테스트는 0.65FS 정상 레벨과 0.98FS 피크를 분리해 검사한다. 정상 레벨에서는 300B의 2차, EL34·6L6GC의 3차, KT88 두 모델의 저왜율 순서를 검증하고, 피크에서는 모든 모델이 과도하게 찌그러지지 않는 상한을 둔다. DF가 낮을수록 피드백·wet·공진 Q가 커지는지, 20% 청취 볼륨에서도 앰프 입력이 1.0으로 유지되는지, 재생 중 전환이 끊기지 않는지도 확인한다.

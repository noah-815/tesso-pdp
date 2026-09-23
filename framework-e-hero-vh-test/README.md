# 모바일 히어로 높이 실기기 테스트

Framework E `productHighlightSection/variant1` (Figma `13117:191153`) 을 모바일 히어로로 놓고,
**브라우저 바와 헤더를 뺀 보이는 영역에 딱 맞는지 · 바가 숨으면 늘어나는지** 확인하는 페이지.

```css
height: calc(100vh  - var(--header-h));   /* 폴백 */
height: calc(100dvh - var(--header-h));   /* 100dvh 자리 = vh / svh / lvh / dvh 토글 */
```

`--header-h` 는 ResizeObserver 가 `.site-header` 실제 높이를 재서 `:root` 에 넣습니다.

## 링크

| 단위 | 링크 |
|---|---|
| vh  | https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test/?unit=vh |
| svh | https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test/?unit=svh |
| lvh | https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test/?unit=lvh |
| dvh | https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test/?unit=dvh |

`&banner=1` 을 붙이면 띠배너가 켜진 상태(헤더 약 93px)로 열립니다.

### 주소창 영역 포함 (iOS Safari 전용)

최신 iOS 사파리는 하단 주소창이 콘텐츠 위에 반투명하게 떠 있습니다. 그 뒤까지 보이는 영역으로 보고
히어로를 채우는 버전입니다. **아이폰·아이패드 사파리로 접속했을 때만** 패널에 토글이 나타납니다
(크롬·카카오톡·네이버 인앱에서는 숨김). `&bar=include` 로 링크 공유 가능.

```css
height: calc(100lvh - var(--header-h));                    /* 바가 모두 사라졌을 때 높이 = 주소창 뒤까지 */
padding-bottom: calc(mid-40 + max(100lvh - 100dvh, env(safe-area-inset-bottom)));
                                                           /* 카드는 주소창 높이만큼 올린다 */
```

- 바가 보이는 동안 `100lvh − 100dvh` 가 바 높이 → 카드가 바 위에 뜨고, 스크롤로 바가 줄면 따라 내려옵니다.
- 켜져 있으면 단위 선택은 무시됩니다 (버튼에 `dvh+바` 처럼 표시).
- 디버그에 `주소창 크기 (lvh − dvh)` 가 추가됐습니다.

링크: https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test/?unit=dvh&bar=include

### 히어로가 두 곳에 있습니다 — 최상단 · 섹션 중간

같은 히어로가 **맨 위**와 **섹션 사이(첫 더미 섹션 뒤)** 두 곳에 들어 있습니다.
패널의 **상단 히어로 / 중간 히어로** 버튼으로 각각 헤더 바로 아래에 맞물리는 위치로 이동합니다.
`?pos=mid` 로 열면 중간 히어로에서 시작합니다.

판정은 **헤더 바로 아래에 맞물린 히어로**를 대상으로 하며, 디버그 첫 줄 `판정 대상` 에
상단/중간 중 어느 쪽인지 표시됩니다. 맞물리지 않은 동안은 `스크롤 중` 입니다.

- 중간 히어로 · dvh: https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test/?unit=dvh&pos=mid
- 중간 히어로 · vh: https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test/?unit=vh&pos=mid

## 히어로 위치 — 최상단 / 섹션 중간

히어로가 첫 화면이 아니라 **다른 섹션들 사이**에 오는 케이스도 패널에서 전환할 수 있습니다 (`?pos=mid`).
링크로 열면 히어로가 헤더 바로 아래에 맞물린 위치에서 시작하고, 패널의 **히어로 맞추기** 버튼으로 언제든 그 위치로 이동합니다.

판정 기준은 **히어로 상단이 헤더 바로 아래에 맞물렸을 때**로, 최상단 케이스의 첫 화면도 같은 조건입니다.
디버그의 `hero 상단 − header` 가 0 (맞물림) 일 때만 카드 가림 여부를 판정합니다.

- 섹션 중간 · dvh: https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test/?unit=dvh&pos=mid
- 섹션 중간 · vh: https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test/?unit=vh&pos=mid

## 화면 구성

- **우하단 버튼** — 단위 선택 패널 (vh / svh / lvh / dvh, 띠배너, 현재 설정 링크 복사).
  선택하면 URL `?unit=` 도 바뀝니다. 브라우저가 지원하지 않는 단위는 비활성으로 표시.
- **좌상단 디버그** (탭하면 접힘, 상태 기억)
  - 맨 위 배지: 스크롤 0 일 때 **카드 보임 +N / 카드 가림 Npx** — 카드 하단과 `visualViewport` 하단의 차이
  - unit · `--header-h` · 히어로 실제 높이 · `innerHeight` · `visualViewport.height/offsetTop` · `clientHeight`
  - `100vh / svh / lvh / dvh` 가 이 기기에서 각각 몇 px 인지 (측정용 숨은 요소)
  - scrollY · 폭 · DPR · UA 요약 (OS · 카카오톡/네이버 인앱 · Safari/Chrome 등)
  - resize · scroll · visualViewport 이벤트마다 갱신
- 히어로 아래 더미 섹션 3개 (각 `min-height: 100vh`)

## 확인 방법

1. 링크를 연 첫 화면에서 배지가 **카드 보임** 인지 (히어로 하단 padding 40 이 있어 정상이면 `+40` 근처)
2. 아래로 스크롤해 브라우저 바를 숨긴 뒤 맨 위로 → `hero 높이` 가 늘었는지
3. 같은 기기에서 `vh` ↔ `dvh` 번갈아 비교

## 로컬 검증 (390 × 790, 브라우저 바 없음)

| 항목 | 시안 | 구현 |
|---|---|---|
| 헤더 | 60 | 60 (`--header-h` 측정값) |
| 히어로 | 730 | 730 |
| 타이틀 y (히어로 상단 + mid-40) | 100 | 100 |
| 카드 하단 (히어로 하단 − mid-40) | 750 | 750 |
| 카드 높이 | 124 | 125.2 |

카드는 텍스트 합(카테고리 14.4 + 8 + 상품명 24 + 8 + 가격 20.8 + 화살표 24 + 상단 2 = 101.2)이
썸네일 100 보다 커서 1.2px 높습니다. 시안은 Figma 가 텍스트 높이를 반올림한 결과입니다.
띠배너를 켜면 `--header-h` 가 92.8 로 바뀌고 히어로가 그만큼 줄어 카드 위치가 유지됩니다.

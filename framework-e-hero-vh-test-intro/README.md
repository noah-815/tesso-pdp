# 모바일 히어로 높이 실기기 테스트 — Intro

Framework E `introSection/variant3` (Figma `13117:191273`) 버전. 동작·패널·디버그는
[상품 카드 버전](../framework-e-hero-vh-test/) 과 같고, 히어로 내용만 다릅니다.

- 배경 이미지 + 하단 정렬 콘텐츠: `New Collection` / 타이틀 / **Shop now** 버튼
- 하단에 붙는 요소가 버튼이라 디버그 배지는 **버튼 보임 +N / 버튼 가림 Npx** 로 판정합니다.

| 단위 | 링크 |
|---|---|
| vh  | https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test-intro/?unit=vh |
| svh | https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test-intro/?unit=svh |
| lvh | https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test-intro/?unit=lvh |
| dvh | https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test-intro/?unit=dvh |
| 주소창 영역 포함 (iOS Safari) | https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test-intro/?unit=dvh&bar=include |

### 히어로가 두 곳에 있습니다 — 최상단 · 섹션 중간

같은 히어로가 **맨 위**와 **섹션 사이(첫 더미 섹션 뒤)** 두 곳에 들어 있습니다.
패널의 **상단 히어로 / 중간 히어로** 버튼으로 각각 헤더 바로 아래에 맞물리는 위치로 이동합니다.
`?pos=mid` 로 열면 중간 히어로에서 시작합니다.

판정은 **헤더 바로 아래에 맞물린 히어로**를 대상으로 하며, 디버그 첫 줄 `판정 대상` 에
상단/중간 중 어느 쪽인지 표시됩니다. 맞물리지 않은 동안은 `스크롤 중` 입니다.

- 중간 히어로 · dvh: https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test-intro/?unit=dvh&pos=mid
- 중간 히어로 · vh: https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test-intro/?unit=vh&pos=mid

## 히어로 위치 — 최상단 / 섹션 중간

히어로가 첫 화면이 아니라 **다른 섹션들 사이**에 오는 케이스도 패널에서 전환할 수 있습니다 (`?pos=mid`).
링크로 열면 히어로가 헤더 바로 아래에 맞물린 위치에서 시작하고, 패널의 **히어로 맞추기** 버튼으로 언제든 그 위치로 이동합니다.

판정 기준은 **히어로 상단이 헤더 바로 아래에 맞물렸을 때**로, 최상단 케이스의 첫 화면도 같은 조건입니다.
디버그의 `hero 상단 − header` 가 0 (맞물림) 일 때만 버튼 가림 여부를 판정합니다.

- 섹션 중간 · dvh: https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test-intro/?unit=dvh&pos=mid
- 섹션 중간 · vh: https://noah-815.github.io/tesso-pdp/framework-e-hero-vh-test-intro/?unit=vh&pos=mid

## 토큰

| 요소 | 값 |
|---|---|
| 히어로 padding | `mid-40` / `mid-16` |
| 텍스트 ↔ 버튼 | `mid-32` |
| eyebrow ↔ 타이틀 | `mid-12` |
| 버튼 padding | `em-13` / `em-26` @ label 13 → `1em 2em` + 투명 선 1px (높이 44) |

## 로컬 검증 (390 × 790)

| 항목 | 시안 | 구현 |
|---|---|---|
| 헤더 / 히어로 | 60 / 730 | 60 / 730 |
| 버튼 y / 크기 | 706 / 115 × 44 | 706.4 / 114 × 43.6 |
| 버튼 하단 (히어로 하단 − mid-40) | 750 | 750 |

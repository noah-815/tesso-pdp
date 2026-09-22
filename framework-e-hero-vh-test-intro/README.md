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

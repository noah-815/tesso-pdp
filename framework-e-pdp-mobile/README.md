# Framework E — 상품 상세 (모바일)

Figma `productDetail/mobile` (`8410:219315`) 구현.
시안 프레임 393 / **디자인 기준 폭 390** / **1rem = 14px**.

---

## 1. 단위 체계

### 1-1. Typography — 전부 가변

```
font-size = size value × 100vw / 390        (size value = rem, 1rem = 14px)
· 450px 이후 고정  →  --tw: min(100vw, 450px)
· "size value ≤ 1rem 은 고정" 예외는 모바일에서 적용하지 않음
```

```css
--tw: min(100vw, 450px);      /* 타이포 기준 폭 */
--ut: calc(var(--tw) / 390);  /* 타이포 1px */
```

| 토큰 | @390 | 375 | 450↑ (고정) |
|---|---|---|---|
| `--fs-p1` paragraph-1 | 16 | 15.38 | 18.46 |
| `--fs-p3` paragraph-3 | 14 | 13.46 | 16.15 |
| `--fs-p4` paragraph-4 | 13 | 12.50 | 15.00 |
| `--fs-c1` caption-1 | 12 | 11.53 | 13.85 |
| `--fs-btn-l/m/s` | 14 / 13 / 13 | — | — |

> 데스크탑 P1 은 18px 인데 **모바일 P1 은 16px** 입니다.

**가변 로직 제외** — `BRAND` 로고 20px 고정. (statusBar 시간은 구현에서 제외)

### 1-2. Spacing — `mid-*`

```
(값 − 8) × 100vw / 390 + 8
· 값 < 8 인 토큰은 공식 제외 — 값 그대로 px 고정
```

```css
--us: calc(100vw / 390);
--mid-16: calc( 8 * var(--us) + 8px);
--mid-24: calc(16 * var(--us) + 8px);
--mid-40: calc(32 * var(--us) + 8px);
```

| 토큰 | @390 | 375 | 600 |
|---|---|---|---|
| `--mid-4` / `--mid-6` | 4 / 6 (고정) | 4 / 6 | 4 / 6 |
| `--mid-16` | 16 | 15.69 | 20.30 |
| `--mid-24` | 24 | 23.38 | 32.62 |
| `--mid-40` | 40 | 38.77 | 57.23 |

`mid-*` 는 타이포와 달리 **450px 고정 없이 100vw 로 계속 증가**합니다(명세 그대로).
타이포와 함께 멈추려면 `--us` 를 `calc(var(--tw) / 390)` 으로 바꾸면 됩니다.

### 1-3. `px-*` — 뷰포트 무관 고정

`--px-16: 16px` — 화면 좌우 여백. 모바일 시안은 모든 섹션이 `px-16` 을 씁니다.
하단 CTA 바의 `padding: 0 16px 16px` 도 시안이 px 고정입니다.

### 1-4. em

**버튼류 padding 은 전부 em** (프레임워크 공통 규칙).

| 요소 | @em base | 시안 px | em |
|---|---|---|---|
| 하단 CTA `구매하기` | button-large 14 | 15 / 22 | `1.0714em 1.5714em` |
| `더보기` | button-medium 13 | 14 / 16 | `1.0769em 1.2308em` |
| `문의하기` | button-small 13 | 9 / 13 | `0.6923em 1em` |
| `수정` · `삭제` (text) | button-small 13 | 9 / 0 | `0.6923em 0` |
| `badge` (내 리뷰 / 내 문의) | caption-1 12 | 7 / 9 | `0.5833em 0.75em` |

**컴포넌트 어노테이션(`data-spacing-em-annotations`) 기준**

| 컴포넌트 | 어노테이션 | @em base | 값 |
|---|---|---|---|
| `productDetailInfoItem` | 아이콘 버튼 컨테이너 크기 : em | p4 13 | 16px → `1.2308em` |
| `productDetailInfo > content` | padding : em | p4 13 | 24px → `1.8462em` |

### 추가 — `reviewItem` / `inquiryItem` 어노테이션

컴포넌트 문서(`8406:74028` reviewItem, `8406:73933` inquiryItem)에서 확인한 규칙입니다.
**gap 과 divider height 가 px/mid 가 아니라 em** 입니다.

| 위치 | 어노테이션 | @em base | 시안 px | em |
|---|---|---|---|---|
| `reviewItem > option` (250ml ㅣ 오렌지 ㅣ 텀블러) | gap : em | p4 (option name) 13 | 6 | `0.4615em` |
| ↳ divider | divider height : em | 〃 | 12 | `0.9231em` |
| `inquiryItem > meta` (미답변 ㅣ nickname ㅣ 날짜) | gap : em | p4 (meta) 13 | 6 | `0.4615em` |
| ↳ divider | divider height : em | 〃 | 12 | `0.9231em` |
| `buttonGroup` (수정 · 삭제) | gap : em | button label (small) 13 | 12 | `0.9231em` |
| ↳ divider | divider height : em | 〃 | 10 | `0.7692em` |
| `reply > infoArea` (판매자 답변 ㅣ 날짜) | gap : em | p4 13 | 8 | `0.6154em` |
| ↳ divider | divider height : em | 〃 | 10 | `0.7692em` |

em 이 풀리도록 `.option` · `.reply .r-info` 에 `font-size: var(--fs-p4)`,
`.text-btn-group` 에 `font-size: var(--fs-btn-s)` 를 명시했습니다.

> `reply > infoArea` 는 Figma 에 어노테이션이 붙어 있지 않지만
> 같은 성격의 메타 행이라 em 이 맞다고 확인받아 적용했습니다.

**`ch` 어노테이션**

| 컴포넌트 | 어노테이션 | 구현 |
|---|---|---|
| `pagination / pageCounter` | current, total : `min-width = 2ch` | `min-width: 2ch` (390 에서 17.6px) |

### 1-5. 그 외 = px

썸네일 상단 여백 12 / 하단 16, 헤더 높이 60 · 좌우 20, 별점 20, 체크박스 16,
`iconButton/default` 32 (아이콘 24), `iconButton/contained` padding 6 (아이콘 16),
dot 5, `productDetail` `max-height: 1000px`, 더보기 그라디언트 360, radius 토큰.

---

## 2. 데스크탑과 다른 점

같은 컴포넌트라도 모바일에서 값이 다른 곳입니다.

| 항목 | 데스크탑 | 모바일 |
|---|---|---|
| 섹션 타이틀 (P1) | 18px | **16px** |
| 좌우 여백 | 그리드 마진 19vw/1920 | **`px-16` 고정** |
| `productDetail` `max-height` | 2000px | **1000px** |
| `productDetailInfo` gap | `mid-48` | **`mid-32`** |
| `productDetailInfoItem` gap | `mid-8` | **`mid-6`** |
| `InfoIconButton` 크기 | 20px (+ 내부 `mid-1`) | **16px (내부 padding 없음)** |
| 리뷰 이미지 슬롯 | **9칸** | **4칸** |
| `reviewItem` 상하 padding | `mid-28` | **`mid-24`** |
| `reviewItem > textArea` gap | `mid-16` / `mid-6` | 동일 |
| filterBar 체크박스 gap | `mid-10` | **`mid-8`** |
| 문의 filterBar 라벨 | P3 | **P4** |
| `inquiryItem > textArea` gap | `mid-12` | **`mid-16`** |
| 답변(reply) 좌우 padding | `mid-28` | **`mid-20`** |
| pagination | 번호 나열 (`3ch`) | **`pageCounter` 1 / 10 (`2ch`)** |
| pagination 상하 padding | `mid-48` | **`mid-36`** |
| 하단 CTA | 패널 안 버튼 2개 | **화면 하단 고정 버튼 1개** |
| 상세 이미지 영역 | 6컬럼 | 전체 폭 − `px-16` |

---

## 3. 세부 플로우 (`10104:199425`)

플로우 시안의 화면 구성입니다.

| 그룹 | 케이스 | 노드 |
|---|---|---|
| **이미지** | 상품 이미지 1장만 등록 시 | `8410:221739` |
| | 상품 이미지 복수 개 등록 시 | `8410:221284` |
| **카테고리** | 카테고리 있을 때 / 없을 때 | `8410:222194` / `8410:222649` |
| **구매 불가 상태** | 품절 / 판매중지 | `8410:223559` / `8410:224017` |
| **옵션 유무에 따른 화면** | 옵션이 있을 때 / 없을 때 | `8410:224472` / `8410:224707` |
| **옵션 선택 화면** | 옵션 선택 시 | `8410:224649` 외 2 |
| | 콘텐츠 영역 내 스크롤 발생 시 | `8410:224989` |
| | 옵션명 한 줄 초과 시 | `8410:225552` |
| | 옵션 항목명 한 줄 초과 시 | `8410:225610` / `8410:225702` |
| **상품 정보 탭** | 기본 / 콘텐츠가 정해진 영역을 초과할 경우 | `8406:75178` / `9029:101998` |

### 3-1. note — 이미지 동작

> - 이미지 전환 트리거 : 스와이프
> - 이미지 전환 방식 : 가로 슬라이드 (이전 이미지가 왼쪽으로 밀려나가고 다음 이미지가
>   오른쪽에서 밀려들어옴, translateX)
> - **dot 은 4개까지만 표시** — 진행 방향에 이미지가 더 남아 있으면 활성 바가
>   맨 마지막이 아니라 **끝에서 두 번째에 머묾**
> - 루프 : 없음 (첫 이미지, 마지막 이미지는 이어지지 않음)
> - 이미지 뷰어 : 제공 (이미지 클릭 시 크게 보여줌)

6장일 때 활성 dot 인덱스 — `0 · 1 · 2 · 2 · 2 · 3` (마지막 장에서만 마지막 dot).
**상품 이미지 1장만 등록 시 indicator 미노출.**

### 3-2. note — 콘텐츠 영역 내 스크롤 발생 시

> - 타이틀과 버튼 영역은 고정됨
> - 전체 시트 높이 max height 는 **85dvh** (브라우저창·status bar 제외한 영역 높이의 85%)

### 3-3. productOption — 옵션 선택 바텀시트

| 영역 | 시안 |
|---|---|
| `dim` | `rgba(0,0,0,0.5)` (Dim / opacity=50) |
| `bottomSheet` | `max-height: 85dvh`, bg #fff |
| `header` | gap 8 · `padding: 20 8 2 16` (px 고정) · 타이틀 P1 semibold · 닫기 `iconButton/default` 32 |
| `contentArea` | `px 16` · **여기만 스크롤** |
| `content` | gap 20 · pt 20 · pb `mid-12` |
| `optionGroup` | `select/Field` × 3, gap `mid-10` |
| `selectedOption` | 아래 표 참고 |
| `buttonArea` | `padding: 12 16 16` (px 고정) · buttonGroup gap `mid-8` |

`selectedOptionItem` — 어노테이션대로 padding·gap·아이콘이 em (@em base p3)

| 요소 | 시안 px | em |
|---|---|---|
| item padding | 20 / 20 / 21 | `1.4286em 1.4286em 1.5em` |
| 옵션명 ↔ 가격 gap | 24 | `1.7143em` |
| 닫기 아이콘 | 20 | `1.4286em` |
| summary padding | 18 / 20 | `1.2857em 1.4286em` |
| `numberInput` 숫자 | `3ch` / min 32px | `width: 3ch; min-width: 32px` |
| `numberInputItem` | 28px (medium) · 내부 `mid-2` | px 고정 |
| summary 합계 | **P2 15px** semibold | `--fs-p2` |

**옵션이 없을 때** — 셀렉트 없이 `selectedOption` 만 노출 (상품명 + 수량 + 금액).

### 3-4. 구매 불가 상태

CTA 가 비활성 — `background: #ebebeb`, `color: #c5c5c5`, 라벨은 `품절` / `판매중지`.

## 4. 구현에서 제외한 것

- **statusBar** (9:41 / 배터리) — 이전 모바일 화면들과 동일하게 제외
- **하단 브라우저 바** — 동일하게 제외
- **옵션명 / 옵션 항목명 한 줄 초과 시** — 별도 처리 없이 자연 줄바꿈으로 뒀습니다
  (시안도 말줄임이 아니라 2줄 표시)

## 5. 확인 필요

`mobileH_header` 컴포넌트는 텍스트 색이 **흰색**(`text-white`)으로 잡혀 있는데,
바로 위 `statusBar` 의 시간은 검정입니다. 헤더 배경 토큰이
`main.section.header.background` 라 값이 확정되지 않아, 데스크탑 PDP 와 동일하게
**흰 배경 + `#111` 텍스트**로 구현했습니다. 헤더가 어두운 배경이 맞다면 알려주세요.

---

## 6. 데모 컨트롤

우측 하단 패널 (시안에 없는 요소 — 삭제해도 무방)

- **CASE** — 이미지(복수 / 1장) · 카테고리(있음 / 없음)
- **STATE** — 판매중 / 품절 / 판매중지 · 옵션(있음 / 없음)
- **TYPE** — P1 / P3 / P4 / C1 크기 조절 + reset (모바일 수식 `size × 100vw / 390` 유지)
- **readout** — viewport, 타이포 1px(`--ut`, 450 고정 여부 표시), spacing 1px(`--us`),
  `mid-16` / `mid-24` / `mid-40` / `px-16`, 각 폰트의 실제 px
- `–` 버튼으로 접기 / 펴기 (localStorage 저장)

## 7. 검증 (390 기준)

| 항목 | 시안 | 실측 |
|---|---|---|
| P1 / P3 / P4 / C1 | 16 / 14 / 13 / 12 | **16 / 14 / 13 / 12** |
| mid-16 / mid-24 / mid-40 | 16 / 24 / 40 | **16 / 24 / 40** |
| px-16 | 16 | **16** |
| 메인 이미지 | 361×361 (393 프레임) | **358×358** (390 기준 = 390−32) |
| 리뷰 이미지 칸 | 84.25 | **83.5** |
| productDetailInfo 아이콘 | 16 | **16×16** |
| productDetailInfo textArea padding | 24 | **24.00** |
| CTA padding | 15 / 22 | **15.00 / 22.00** |
| 문의하기 padding | 9 / 13 | **9.00 / 13.00** |
| badge padding | 7 / 9 | **7.00 / 9.00** |
| 더보기 padding | 14 / 16 | **14.00 / 16.00** |
| pageCounter 숫자 min-width | 2ch | **17.6** |

가로 오버플로 없음, 콘솔 에러 없음.


## 8. 플로우 검증 (390 × 844)

| 항목 | 결과 |
|---|---|
| 시트 높이 (아이템 6개) | 717.4 / 844 = **0.850** = 85dvh ✓ |
| 타이틀·버튼 고정, 콘텐츠만 스크롤 | ✓ |
| 시트 열림 시 뒤 화면 스크롤 잠금 | ✓ |
| select 펼침 — 보이는 옵션 수 | 214.48 ÷ 38.98 = **5.5** ✓ |
| select 펼칠 때 글자 이동 | **0px / 0px** ✓ |
| dot 규칙 (6장) | 활성 인덱스 `0·1·2·2·2·3` ✓ |
| 이미지 1장 | 슬라이드 1개 · indicator `display:none` ✓ |
| 카테고리 없음 | `display:none` ✓ |
| 품절 | 라벨 `품절` · disabled · `#ebebeb` / `#c5c5c5` ✓ |
| 판매중지 | 라벨 `판매중지` ✓ |
| 옵션 없을 때 | 타이틀 `수량 선택` · 셀렉트 미노출 · selectedOption 1행 ✓ |
| 이미지 뷰어 | 클릭 → 열림(4장) · 닫힘 ✓ |

가로 오버플로 없음, 콘솔 에러 없음.

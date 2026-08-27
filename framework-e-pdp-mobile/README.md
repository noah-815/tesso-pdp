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
| `--fs-p2` paragraph-2 | 15 | 14.42 | 17.31 |
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

### 토큰 재검수 (`get_variable_defs` 교차 확인)

Figma MCP 의 Tailwind 출력은 **padding · gap 은 변수를 물면 `var(...)` 래퍼가 보이지만
`size-` / `w-` / `h-` 는 raw px 로 나올 수 있습니다.** 그래서 크기 계열은
`get_variable_defs` 로 따로 확인해야 합니다.

전 컴포넌트를 훑은 결과 — **px 로 두는 게 맞는 것 (변수 바인딩 없음, 확인 완료)**

| 요소 | 값 | 확인 노드 |
|---|---|---|
| `thumbnail` (1:1 / 4:5 / 3:4) | 120 / 150 / 160 | `8394:59347` → 변수 없음 |
| `iconButton/default` | 32 · 아이콘 24 | `8394:59126` → `radius-xs` 뿐 |
| `iconButton/contained` | padding 6 · 아이콘 16 | `8400:4881` → 없음 |
| `numberInput` large / medium | 아이템 36 / 28 | `8394:74626` · `8643:92544` → `mid-6`·`mid-2` (내부 padding) 뿐 |
| `rating` | 별 20 | `8406:72011` → 없음 |
| `checkBox` | 16 | `8394:59228` → 없음 |
| `dotIndicator` | dot 5 (gap 은 `mid-4`) | `8394:74595` → `radius-full`·`mid-4` |
| `tab/productDetail` | 상하 17/16 · 텍스트 10/4 (gap 은 `mid-100`) | `8394:59332` → `mid-100` 뿐 |
| 캐러셀 썸네일 · 메인 | 142 / 775 (= 1컬럼 / 5컬럼) | `8406:74850` → `radius-sm`·`mid-16` 뿐 |
| 캐러셀 gradient | 120 | 〃 |
| `productDetail` 더보기 gradient · 버튼 | 360 / 286 | `8406:74113` → `mid-24`·`mid-48` 뿐 |

**px 로 굳어 있던 `mid` 토큰 (수정함)**

| 위치 | 이전 | 시안 토큰 |
|---|---|---|
| `productImage` 상 / 하 여백 | 12px / 16px | **`mid-12` / `mid-16`** |
| `indicator` 하단 오프셋 | 20px | **`mid-20`** |
| 바텀시트 header padding · gap | 20 / 8 / 2px | **`mid-20` / `mid-8` / `mid-2`** |
| 바텀시트 content gap · pt | 20px | **`mid-20`** |

바텀시트 `buttonArea` 의 상 12 / 하 16 은 각각 **`px-12` · `px-16`** 이라 고정이 맞습니다
(같은 12·16 이어도 `productImage` 쪽은 `mid`, 시트 쪽은 `px` — 토큰이 다릅니다).

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

### inquiryItem 구조 — 시안 대조 수정

컴포넌트(`8406:73933`)의 구조가 **답변 여부에 따라 다릅니다.** 이전 구현은 두 경우를
같은 마크업으로 쓰고 있어서 바로잡았습니다.

```
미답변                                답변완료
inquiryItem  gap mid-16               inquiryItem  gap mid-24
  ├ titleArea (내 문의일 때)            ├ question  gap mid-16
  └ textArea                           │   ├ titleArea (내 문의일 때)
      ├ infoArea                       │   └ textArea
      ├ content                        │       ├ infoArea
      └ private                        │       ├ content
                                       │       └ private
                                       └ reply
```

| 항목 | 이전 | 시안 |
|---|---|---|
| `question` 래퍼 | 항상 있음 | **답변완료에만** |
| `titleArea`(배지 + 수정·삭제) | `question` 밖 | **답변완료 시 `question` 안** |
| 컨테이너 gap | 답변 유무 무관 `mid-16` (reply 있으면 24) | 미답변 `mid-16` / **답변완료 `mid-24`** |
| 구분선 | 전부 `rgba(0,0,0,.12)` | 미답변 `.12` / **답변완료 `rgba(0,0,0,.1)`** |

앞서 "시안의 실수 같아 `.12` 로 통일했다" 고 적었는데, 컴포넌트 정의를 보니
**의도된 구분**이었습니다. `is-answered` 클래스로 분기하도록 되돌렸습니다.

### `numberInput` — Figma stroke 보정 (medium 92×30 → 90×30)

Figma 의 stroke 는 크기를 밀지 않는데 CSS `border` 를 써서 2px 커져 있었습니다.
`box-shadow: inset 0 0 0 1px` 로 옮겨 **시안 90 × 30** 과 일치시켰습니다
(아이템 28 · 내부 `mid-2` · 아이콘 고정 24).

> 참고 — `large` 사이즈는 시안이 조정되어 **102 × 36**(아이템 34 · 내부 `mid-4`) 입니다.
> 이 화면들은 `medium` 만 쓰므로 영향 없습니다.

### Figma stroke → CSS inset box-shadow (전체 적용)

Figma 의 stroke 는 **inside** 라 요소 크기를 밀지 않습니다. CSS `border` 는 좌우·상하로
1px 씩 밀어서 **높이가 padding 으로 결정되는 박스가 2px 커집니다.**
그래서 크기가 auto 인 보더 박스는 전부 `box-shadow: inset 0 0 0 1px` 로 옮겼습니다.
보이는 선(두께·색·위치·`border-radius`)은 동일하고 크기만 시안과 맞습니다.

| 요소 | 시안 | `border` 사용 시 | 적용 후 |
|---|---|---|---|
| `select/Field` | 41 | 42.78 | **40.78** |
| `badge` | 28 | 30.38 | **28.38** |
| `문의하기` 버튼 | 34 | 35.58 | **33.58** |
| pagination 화살표 | 28 | 30.00 | **28.00** |
| `장바구니 담기` · `구매하기` | 47 | 48.78 | **46.78** |
| `더보기` 버튼 | 44 | 45.58 | **43.58** |
| `numberInput` (medium) | 90 × 30 | 92 × 30 | **90 × 30** |
| `selectedOption` 컨테이너 | — | +2 | **−2** |

`select/Field` 는 펼침 상태(`is-open`)의 래퍼도 함께 옮겨서 **여닫을 때 글자 이동 0/0** 을
유지합니다 (닫힘 40.78 = 펼침 래퍼 padding 2 + 필드 38.78).

> 크기를 명시한 요소(`check-box` 16×16 등)는 `box-sizing: border-box` 라 `border` 가
> 크기를 밀지 않으므로 그대로 뒀습니다.

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

구현은 기존 인터랙션 프로토타입
([framework-e-pdp/mobile.html](https://noah-815.github.io/tesso-pdp/framework-e-pdp/mobile.html))
과 **동일한 방식**으로 맞췄습니다.

| 항목 | 값 |
|---|---|
| 전환 | pointer 드래그 1:1 추종 → 릴리즈 시 스냅 |
| 커밋 판정 | 폭의 **20%** 이상, 또는 플릭 **0.5px/ms** 이상 |
| 방향 잠금 | `|dx| > 8px` 이고 `|dx| > |dy| × 1.2` 일 때만 수평 — 세로는 브라우저에 양보 |
| 이징 | `transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| 1회 드래그 | 최대 1장 · 루프 없음 · 끝단 러버밴딩 없음 |
| dot 창 | 4슬롯(32px = 5×4 + 4×3) 마스크 + **트랙 전체가 미끄러짐** |
| dot 상태 | 활성 `opacity .8` / 기본 `.3` / 창 경계 `scale(.8)` / 창 밖 `opacity 0 · scale(.4)` |

**dot 동작 실측** (8장 기준, 활성 인덱스별 dot 클래스)

```
0 : ●○○◦ ····      3 : ·◦○●◦ ···      7 : ···· ◦○○●
    트랙 0px           트랙 −9px          트랙 −36px
```

진행 방향에 이미지가 남아 있으면 활성 dot 이 창 끝이 아니라 **끝에서 두 번째**에 머물고,
창 경계 dot 은 축소, 창 밖 dot 은 작아지며 사라집니다. 끝단에서 더 끌어도 움직이지 않습니다.

드래그 직후의 클릭은 삼켜서 스와이프가 이미지 뷰어를 열지 않습니다.

> dot 창 동작을 볼 수 있도록 **슬라이드를 8장**(product-1~4 두 번 순환)으로 두었습니다.
> 4장 이하면 창 없이 전부 노출되고, 1장이면 indicator 자체가 미노출입니다.

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

**옵션이 없을 때** (`8410:224707`) — 셀렉트 없이 `selectedOption` 만 노출합니다.
시안에서 아래 두 요소가 `hidden` 입니다.

| 요소 | 옵션 있을 때 | 옵션 없을 때 |
|---|---|---|
| 상품명 우측 아이콘 버튼(닫기) | 노출 | **미노출** |
| `summary` (총 N개 상품 금액) | 노출 | **미노출** |

지울 옵션이 없고 합계가 단일 금액과 같아서 둘 다 빠지는 구조입니다.
`summary` 가 없을 때 마지막 아이템의 하단 구분선이 컨테이너 보더와 겹치지 않도록
`.so-item:last-child { border-bottom: 0 }` 을 걸었습니다.

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

- **SPACING** — 여백 버전 3가지 (아래 표)
- **CASE** — 체크박스 3개 : `카테고리` · `옵션` · `품절`
  (이미지는 복수 개 기준 고정, 판매중지 케이스는 제외)
- **TYPE** — `P1 · P2 · P3 · P4 · C1` 크기 조절 (모바일 수식 `size × 100vw / 390` 유지)
  - 각 줄마다 `−` / `+` 스테퍼 (26px 탭 타깃) — 폰에서 손가락으로 조절
  - `전체 −` / `전체 +` 로 5개를 한 번에 증감, `reset` 으로 기본값 복귀
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
| 카테고리 없음 | `display:none` ✓ |
| 품절 | 라벨 `품절` · disabled · `#ebebeb` / `#c5c5c5` ✓ |
| 옵션 없을 때 | 타이틀 `수량 선택` · 셀렉트 미노출 · 아이템 1개 · **닫기 아이콘 0 · summary 0** ✓ |
| 이미지 뷰어 | 클릭 → 열림(4장) · 닫힘 ✓ |

가로 오버플로 없음, 콘솔 에러 없음.


## 9. 여백 버전 3가지 (SPACING 토글)

가로 여백(화면 좌우)과 세로 padding 을 각각 고정 / 가변으로 바꿔 비교합니다.
**PDP 본문뿐 아니라 이어지는 플로우(옵션 바텀시트)에도 동일하게 적용**됩니다.

| 버전 | 가로 여백 | 세로 padding | 비고 |
|---|---|---|---|
| **A `px / mid`** | `px-16` 고정 16px | `mid` 가변 | 기본 · 시안 바인딩 그대로 |
| **B `px / px`** | `px-16` 고정 16px | `px` 고정 | 세로도 뷰포트와 무관 |
| **C `mid / mid`** | `mid-16` 가변 | `mid` 가변 | 전부 가변 |

```css
:root {
  --pad-x: var(--px-16);        /* 가로 여백 */
  --v-16: var(--mid-16); --v-20: var(--mid-20); --v-24: var(--mid-24);
  --v-28: var(--mid-28); --v-36: var(--mid-36); --v-40: var(--mid-40);
}
body[data-vpad="px"]  { --v-16: 16px; --v-20: 20px; --v-24: 24px;
                        --v-28: 28px; --v-36: 36px; --v-40: 40px; }
body[data-hpad="mid"] { --pad-x: var(--mid-16); }
```

375 실측

| | 가로 여백 | `v-24` | `v-40` | 시트 좌우 |
|---|---|---|---|---|
| A px / mid | 16.00 | 23.38 | 38.77 | 16.00 |
| B px / px | 16.00 | **24.00** | **40.00** | 16.00 |
| C mid / mid | **15.69** | 23.38 | 38.77 | **15.69** |

> `em` 으로 정의된 곳(`productDetailInfo` textArea, `selectedOptionItem`, 버튼 padding)과
> 시안이 원래 px 인 곳(썸네일 상하 12/16, 시트 header 20/2, buttonArea 12/16)은
> 버전과 무관하게 그대로입니다.

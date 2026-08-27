# Tesso — Framework E · Product Detail (Desktop)

Framework E 상품 상세 페이지의 데스크탑(뷰포트 ≥ 768) 구현. **템플릿 A / B** 를 토글로 전환합니다.

- 화면: `9922:116425` — `9922:115358` (A) · `9922:115359` (B)
- 플로우/단위 정의: `8406:73881`
- 컴포넌트 정의: `9922:116426`

의존성 없는 단일 HTML 파일입니다. 우하단 패널에서 템플릿(A/B)과 상품 패널 고정 여부를 바꿀 수 있고,
읽기값에 col · margin · gutter · span6 · paragraph-1 계산값이 표시됩니다.

## 템플릿 차이

| | A | B |
|---|---|---|
| 상단 | 좌 6컬럼 캐러셀 + 우 6컬럼 상품 패널 | 동일 |
| 하위 섹션 | 좌 6컬럼(1~6)에 그대로 이어짐 | **중앙 6컬럼(4~9)** 으로 이동 |
| 하단 탭바 | 없음 | `tab/productDetail` sticky |

## 단위 체계

디자인 기준 폭 **1920** · **1rem = 14px**

### 1. 그리드 — 마진 vw / 거터 px

토큰 `global/desktop-margin-vw = 19`, `global/desktop-gutter-px = 16` 을 그대로 따릅니다.

```css
--grid-margin: calc(19 * 100vw / 1920);   /* vw 가변 */
--grid-gutter: 16px;                      /* px 고정 */
--grid-col: calc((100vw - 2*var(--grid-margin) - 11*var(--grid-gutter)) / 12);
```

레이아웃 자체는 **컨테이너 기준 12컬럼 그리드**로 짰습니다 (`repeat(12, minmax(0,1fr))`).
`--grid-col` 을 폭 계산에 직접 쓰면 세로 스크롤바가 생겼을 때 `100vw` 와 실제 콘텐츠 폭이
어긋나 7px 씩 밀립니다. 캐러셀도 부모 6컬럼을 다시 6등분한 그리드로 배치했습니다
(썸네일 1컬럼 / 메인 5컬럼 + 4거터).

1920 기준 실측: col 142.16px · span5 774.83px · span6 933px — 시안과 일치.

### 2. 타이포그래피

`font-size = (size value − 1) × 0.0083 × screen width + 1rem`, size value ≤ 1rem 은 고정.

| 토큰 | 값 | 처리 |
|---|---|---|
| `caption-1` | 12px (0.857rem) | 고정 |
| `paragraph-4` · `button-label-small` · `button-label-medium` | 13px (0.929rem) | 고정 |
| `paragraph-3` · `button-label-large` | 14px (1rem) | 고정 |
| `paragraph-1` | 18px (1.2857rem) | **가변** — 1920 에서 18.55px |

line-height 도 변수로 뺐습니다 (`--lh-c1` 1.2 / `--lh-p4` 1.6 / `--lh-p3` 1.6 /
`--lh-p2` 1.5 / `--lh-p1` 1.5). 옵션 리스트 높이 공식이 `lh` 단위를 쓰기 때문입니다.

이 페이지에서 가변인 것은 `paragraph-1` 하나뿐입니다 (상품명 · 섹션 타이틀 · 별점 점수).

#### paragraph-1 ~ 4 사이즈 조절

우하단 패널 `type` 행에서 네 토큰의 사이즈 값을 직접 입력할 수 있습니다 (8~48px, 범위 밖은
확정 시 보정). **입력값에 따라 고정/가변이 자동으로 갈립니다.**

```js
size ≤ 14 (1rem)  →  `${size}px`                                   // 고정
size >  14        →  calc((size/14 − 1) * 0.83vw + 1rem)           // 가변
```

| 토큰 | 기본값 | @1280 | @1920 | 쓰임 |
|---|---|---|---|---|
| P1 | 18px | 17.03 (가변) | 18.55 (가변) | 상품명 · 섹션 타이틀 · 별점 점수 |
| P2 | 16px | 15.52 (가변) | 16.27 (가변) | 옵션 합계 금액 (`selectedOption` summary) |
| P3 | 14px | 14 (고정) | 14 (고정) | 상세 설명 · 리뷰 닉네임 · 주문 정보 본문 |
| P4 | 13px | 13 (고정) | 13 (고정) | 상품 설명 · 옵션 · 리뷰/문의 본문 |

읽기값에 계산된 px 과 `고정`/`가변` 이 함께 표시되므로, 예컨대 **P3 를 15 이상으로 올리면
그 자리에서 고정 → 가변으로 바뀌는 것**을 확인할 수 있습니다 (P3 = 18 → 1280 에서 17.03px).
`reset` 으로 시안값(18 / 16 / 14 / 13)으로 되돌립니다. 값은 localStorage 에 저장됩니다.

P2 는 옵션을 하나 이상 추가했을 때 나타나는 **합계 금액**에 쓰입니다.

### 3. spacing — `mid/mid-*`

`(값 − 8) × 100vw / 1920 + 8`, 값 < 8 이면 값 그대로 고정.

```css
--us: calc(100vw / 1920);
--mid-1: 1px; --mid-2: 2px; --mid-4: 4px; --mid-6: 6px;   /* 값 < 8 → 고정 */
--mid-8: 8px;                                             /* 공식 결과도 8px */
--mid-10:  calc(  2 * var(--us) + 8px);
--mid-12:  calc(  4 * var(--us) + 8px);
--mid-16:  calc(  8 * var(--us) + 8px);
--mid-20:  calc( 12 * var(--us) + 8px);
--mid-24:  calc( 16 * var(--us) + 8px);
--mid-28:  calc( 20 * var(--us) + 8px);
--mid-32:  calc( 24 * var(--us) + 8px);
--mid-40:  calc( 32 * var(--us) + 8px);
--mid-48:  calc( 40 * var(--us) + 8px);
--mid-56:  calc( 48 * var(--us) + 8px);
--mid-64:  calc( 56 * var(--us) + 8px);
--mid-100: calc( 92 * var(--us) + 8px);
--mid-120: calc(112 * var(--us) + 8px);
```

주요 적용 (1920 실측 = 시안값):

| 영역 | 값 |
|---|---|
| productInfo | 상하 padding `mid-120` · 패널 gap `mid-100` |
| mainArea / overview | gap `mid-64` / `mid-32` |
| titleArea · titleText · nameBlock | gap `mid-24` / `mid-12` / `mid-16` |
| optionArea · optionGroup | gap `mid-56` / `mid-10`, 버튼 그룹 `mid-8` |
| productDetailInfo 탭 | row `mid-16` · column `mid-20`, 항목 내부 `mid-8`, 아이콘 padding `mid-1` |
| productImageCarousel | 상단 `mid-28`, 썸네일 gap `mid-16` |
| productDetail | 상단 `mid-40`, 블록 gap `mid-48`, 텍스트 좌우 `mid-48` |
| 섹션 head / filterBar / pagination | `mid-24` / `mid-20` / `mid-48` |
| review · inquiry item | 상하 `mid-28`, 내부 gap `mid-24` / `mid-16` / `mid-12` / `mid-6` |
| inquiry reply | padding `mid-24` `mid-28` |
| orderInfo | head `mid-24`, content `mid-40` |

### 4. em — 컴포넌트 어노테이션(`data-spacing-em-annotations`) 기준

Figma 의 토큰 바인딩(px / mid)이 아니라 **컴포넌트에 붙은 어노테이션이 우선**입니다.
같은 값이라도 어노테이션이 em 이라고 하면 em 으로 씁니다 (텍스트 크기를 바꾸면 여백이
같이 따라오게 하기 위함).

| 컴포넌트 | 어노테이션 | @em base |
|---|---|---|
| `select/Field` | padding · 아이콘 크기 | p4 (option name) 13px |
| `selectedOptionItem` | padding · 옵션명↔가격 gap · 아이콘 버튼 크기 | p3 (option name) 14px |
| `summary` | padding | p3 (option name) 14px |
| `productDetailInfoItem` | 아이콘 버튼 컨테이너 크기 | p4 (title) 13px |
| `productDetailInfo > content` | padding | p4 (description) 13px |
| `numberInput` (별도) | 숫자 영역 `3ch` / `min-width: 32px` | — |

em 이 기준 사이즈로 풀리려면 **해당 값을 쓰는 요소 자신에 `font-size` 를 걸어야** 합니다
(`.so-item { font-size: var(--fs-p3) }` 등).

| 요소 | 시안 px | em |
|---|---|---|
| selectedOptionItem padding | 24 / 20 / 25px | `1.7143em 1.4286em 1.7857em` |
| selectedOptionItem gap | 24px | `1.7143em` |
| selectedOptionItem 닫기 버튼 | 20px | `1.4286em` |
| summary padding | 20px | `1.4286em` |
| select/Field padding | 10 / 13 / 17px | `0.7692em 1em 0.7692em 1.3077em` |
| select/Field chevron | 20px | `1.5385em` |
| productDetailInfoItem 아이콘 | 20px | `1.5385em` |
| productDetailInfo textArea padding | 24px | `1.8462em` |

1920 · 기본 사이즈에서 위 값들이 전부 시안 px 와 일치하는 것을 실측했고, P3/P4 를 20 으로
올리면 비례해서 커지는 것(예: 닫기 버튼 20 → 29.76px)도 확인했습니다.

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

> **펼침 상태의 필드 선.** 시안(`8394:59460`)에서 펼쳐진 select 는 **바깥 테두리 하나뿐**이고
> 필드와 옵션 목록 사이에는 선이 없습니다(내부 필드는 `border-0 border-transparent`).
> border → inset box-shadow 변환 때 `.select-wrap.is-open .select-field { border: 0 }` 이
> box-shadow 를 지우지 못해 **필드 하단에 선이 생겼던 것을 `box-shadow: none` 으로 제거**했습니다.
> 래퍼에는 시안의 `overflow-clip` 에 맞춰 `overflow: hidden` 을 추가했습니다.
> (펼침 높이 255.26 — 시안 255, 여닫을 때 글자 이동 0/0 유지)

### `iconArea` — 상품명 1줄 높이 정사각 프레임

시안 정의 (`8406:74654` titleArea)

> iconArea = 상품명 1줄 길이 높이와 동일한 높이의 프레임으로 아이콘 버튼 영역을 감싸서
> 상품명과 정렬 맞춤
> *폰트 사이즈가 바뀌더라도 정렬이 틀어져 보이지 않도록 함

```css
.icon-area {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-p1);
  line-height: var(--lh-p1);
  width: 1lh;      /* = 상품명 한 줄 높이 */
  height: 1lh;
}
.icon-btn { flex-shrink: 0; width: 32px; height: 32px; }   /* 프레임보다 커서 밖으로 넘침 */
```

**`1lh`** 로 잡아야 P1 이 바뀌어도 프레임이 자동으로 같이 움직입니다.
(px 로 27 / 24 를 박아두면 폰트를 키웠을 때 정렬이 틀어집니다.)

실측 — 프레임 크기가 상품명 한 줄 높이와 항상 일치

| P1 | 상품명 1줄 | `iconArea` | 아이콘 버튼 |
|---|---|---|---|
| 12 | 18.00 | **18 × 18** | 32 × 32 |
| 기본 | 27.83 / 24.00 | **27.82 × 27.82 / 24 × 24** | 32 × 32 |
| 26 · 30 | 39 / 45 | **39 × 39 / 45 × 45** | 32 × 32 |

버튼은 프레임보다 커서 밖으로 넘치는 게 정상입니다(시안 27 프레임 안에 32 버튼).
`flex-shrink: 0` 이 없으면 프레임이 작을 때 버튼이 눌려 찌그러집니다.

### 4-2. ch — `data-spacing-ch-annotations`

| 컴포넌트 | 어노테이션 | 구현 |
|---|---|---|
| `numberInput` 숫자 영역 | `3ch` / `min-width: 32px` | `width: 3ch; min-width: 32px` |
| `paginationItem` 숫자 영역 | number min width & height : `3ch` | `min-width: 3ch; min-height: 3ch` |

1920 · P4 13px 에서 `3ch` = 26.7px (시안 27px), 컨테이너 padding `mid-2` 를 더해 30.7px
(시안 31px). P4 를 20px 로 올리면 41.73px 로 같이 커집니다.

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

### 4-3. 어노테이션이 **없는** 컴포넌트 (= 시안 px 그대로)

문서 프레임을 확인했지만 spacing 어노테이션이 붙어 있지 않은 컴포넌트들입니다.
토큰 바인딩(px / mid) 과 시안 실측값을 그대로 씁니다.

| 컴포넌트 | 값 |
|---|---|
| `rating` / `ratingItem` | 별 20×20px, gap 0 |
| `checkBox` / `radioButton` | 16×16px, `radius-3xs` 2px |
| `iconButton/default` | 32×32px 박스 · 아이콘 24px · `radius-xs` |
| `iconButton/contained` | padding 6px · 아이콘 L 24 / M 20 / S 16px |
| `thumbnail` | 비율 박스만 (1:1 / 4:5 / 3:4) |
| `productDetailTabItem` | 상하 17 / 16px · 텍스트 박스 10 / 4px · 폰트 **P3** |
| `tab/productDetail` | 아이템 gap `mid-100` |
| `pagination` | 화살표↔번호 gap `mid-8` · 번호 사이 gap `mid-2` |
| `buttonGroup` | gap `mid-8` · 버튼 `flex: 1` |

> `defaultTabItem` 에는 `padding : em (@em base p3)` 어노테이션이 있지만
> 이 화면에서는 `tab/productDetail` 만 쓰기 때문에 해당 없음.

**Button 문서의 서술형 주석**
> 버튼의 폰트 사이즈가 조절 가능하기 때문에 버튼 높이 자체는 hug 로 처리
> (Icon size — 텍스트 박스의 높이와 동일하게 적용).
> 데스크탑, 모바일 버튼의 패딩은 각각 정의 가능함.

→ 버튼 높이는 전부 hug, 아이콘을 넣을 때는 `width/height: 1lh` (텍스트 박스 높이).

> **알려진 차이** — `productDetailTabItem` 은 시안에서 높이가 57px 로 **고정**돼 있는데,
> 선언된 padding(17/16) + P3 라인박스(14×1.6 = 22.4) + 텍스트 박스 padding(4×2) 을
> 그대로 쌓으면 63.4px 이라 시안 프레임보다 큽니다(그래서 시안에도 `overflow: clip` 이
> 걸려 있음). 폰트 크기가 가변인 프레임워크라 **높이는 hug** 로 두었고, 기본값에서
> 탭바 높이는 57px 이 아니라 65.4px 입니다.

### 4-1. 버튼 padding = em

label 사이즈 기준 em 입니다. 컴포넌트 문서의 *"버튼 높이 자체는 hug로 처리"* 를 따릅니다.

| 요소 | 시안 px | em (@base) |
|---|---|---|
| 장바구니/구매 버튼 | 15 / 22px | `1.0714em 1.5714em` (@ button-label-large 14px) |
| 더보기 버튼 | 14 / 16px | `1.0769em 1.2308em` (@ button-label-medium 13px) |
| 문의하기 버튼 | 8 / 8.5px | `0.6154em 0.6538em` (@ button-label-small 13px) |
| select/Field | 10 / 17 / 13px | `0.7692em 1em 0.7692em 1.3077em` (@ paragraph-4 13px) |

데스크탑에서는 label 이 모두 ≤ 1rem 이라 고정이므로 계산 결과는 시안 px 와 동일합니다.
1920 실측: 버튼 `15.00 / 22.00px`, 셀렉트 `10.00 / 17.00 / 10.00 / 13.00px`.

#### select 펼침 (`select/Field expanded=on` · 8394:59460)

펼치면 **필드 자체가 컨테이너**가 됩니다 — border `#111` · radius `xs` · padding 1px,
헤더 padding 9 / 12 / 16px (접힘 10 / 13 / 17px 에서 컨테이너 border+padding 2px 만큼 뺀 값),
스크롤바 4px `#d4d4d4` radius 16px.

**옵션 높이는 상수로 두지 않고 폰트·라인하이트에서 파생시킵니다.**

```css
/* 옵션 항목 */
font-size:   var(--fs-p4);      /* 텍스트 사이즈 변수 */
line-height: var(--lh-p4);      /* line height 변수 */
padding:     0.7em (상하);
→ 항목 높이 = 1lh + 1.4em

/* 옵션 리스트 */
max-height: calc((1lh + 1.4em) * 5.5);   /* 초과 시 스크롤바 */
```

리스트에도 같은 `font-size` / `line-height` 를 걸어야 `lh` 와 `em` 이 항목과 같은 값으로
풀립니다. 결과적으로 **어떤 조합에서도 정확히 5.5개가 노출**됩니다.

##### 펼칠 때 글자가 밀리지 않게

Figma 의 stroke 는 콘텐츠를 밀지 않지만 **CSS border 는 밉니다.** 시안은 컨테이너의 1px
padding 을 감안해 내부 padding 을 17→16 / 10→9 로 줄여 두 상태의 텍스트 위치를 맞춰
놓았는데, 여기에 CSS 에서 내부 필드의 border 를 `transparent` 로 남겨두면 1px 이 더해져
펼칠 때 글자가 1px 씩 밀립니다. 펼침 상태에서는 테두리를 `.select-wrap` 이 그리므로
내부 필드의 border 를 **완전히 제거**(`border: 0`)해야 합니다.

```
접힘  : field border 1 + padding-left 17           = 18px
펼침  : wrap border 1 + wrap padding 1 + padding-left 16 = 18px   ✓
```

실측: 접힘/펼침 모두 라벨 left 18px · top 10.99px, chevron right 14px — 이동량 0.

| P4 | 항목 높이 | 리스트 높이 | 노출 개수 |
|---|---|---|---|
| 10px | 30.00px | 165.00px | **5.5** |
| 13px (시안) | 38.98px | 214.48px | **5.5** |
| 18px | 55.66px | 306.05px | **5.5** |

시안의 `max-height: 215px` 는 13px 기준 계산값(214.48)과 일치합니다.

- 그룹당 옵션 **10개**, 품절 항목은 `(품절)` 접두 + disabled (클릭 무반응).
- **`+N원` 은 마지막 그룹(추가옵션)에서만 노출**됩니다. 앞 그룹의 금액차는 표시하지 않고
  합계에만 반영합니다 (시안의 용량 드롭다운에 + 금액이 없는 것과 동일).

#### selectedOption / numberInput

| 요소 | 값 |
|---|---|
| selectedOption | border `rgba(0,0,0,.1)` · radius `sm` · padding 1px |
| selectedOptionItem | padding `24 / 20 / 25px` (토큰 미바인딩 → px), gap `mid-24` |
| nameArea / quantityPrice | gap `mid-16` / 12px |
| numberInput | border `rgba(0,0,0,.08)` · radius `xs` · padding 1px, 버튼 28px · 아이콘 padding `mid-2` |
| numberInput 숫자 영역 | **`width: 3ch` · `min-width: 32px`** (컴포넌트 정의 그대로) |
| summary | padding 20px, gap `mid-24` |
| 총 금액 | **`paragraph-2` 16px SemiBold — 이 화면에서 P2 를 쓰는 유일한 자리** |

1920 실측: 박스 548px · 아이템 padding 24/20/25 · numberInput 92×32 · 숫자 영역 32px ·
총 금액 16.27px(가변).

### 5. 그 외 px

header 54px · 좌우 30px, 상품 패널 548px, 썸네일 radius `sm`/메인 `md`,
그라디언트 120px·360px, 별 20px, 위시리스트 32px·아이콘 24px, InfoIconButton 20px,
페이지네이션 아이템 31px, 리뷰 이미지 radius `xs`, 탭바 57px.

### 6. 폰트

```css
--font: "DM Sans", "Pretendard Variable", Pretendard, sans-serif;   /* 본문 */
--font-header: "Inter", ...;                                        /* 헤더 (시안 지정) */
```

`40,000`, `2026. 12. 31.` 같은 영문·숫자는 DM Sans, 국문은 Pretendard 로 문자 단위 분기됩니다.

## 동작

- **캐러셀** — 썸네일 클릭 시 메인 이미지 즉시 교체(전환 효과 없음), 선택 썸네일로 스크롤.
  하단 그라디언트, 비활성 썸네일 opacity 40%.
- **상품 메인 이미지** — `aspect-ratio: 1 / 1` 고정. 썸네일 열은 `position: relative` 래퍼
  안에 스크롤러를 `absolute` 로 넣어 in-flow 높이가 0 이 되게 했습니다. 그래야 행 높이를
  메인 이미지가 결정하고(1:1 유지), 썸네일 열이 거기에 맞춰 늘어납니다.
  위/아래에 남은 이미지가 있을 때만 해당 방향 그라디언트가 뜹니다.
- **옵션 선택 · 추가** (`selectedOption` · `9922:122495`) — 용량 → 맛 → 추가옵션 순으로
  활성화되고, 다음 그룹이 자동으로 열립니다. 세 값이 모두 정해지면 목록에 한 줄이 추가되고
  셀렉트는 placeholder 로 돌아갑니다. 같은 조합을 다시 고르면 새 줄 대신 **수량 +1**.
  줄마다 수량 스테퍼(최소 1)와 `×` 삭제가 있고, 하단 summary 에 총 수량·금액이 갱신됩니다.
  금액은 기본가 40,000원 + 옵션별 추가금(500ml +15,000 / 자몽 +2,000 / 보틀 +8,000 …).
- **productDetail** — `max-height: 2000px` + 하단 그라디언트 + `더보기`. 클릭 시 전체 노출.
  (시안 주석: *주문 정보·리뷰·상품 문의 미노출 상태인 경우에 한해 더보기 없이 전체 노출*)
- **상품 문의** — 행 클릭 시 아코디언 펼침/접힘, chevron 회전.

## 검증 (1920)

| | 결과 |
|---|---|
| col / margin / gutter | 142.16 / 19 / 16px |
| media · panel 컬럼 | 각 6컬럼, x = 19 / 960.5 |
| 템플릿 B 하위 섹션 | 중앙 6컬럼, x = 489.8 |
| productDetail 높이 | 2040px (시안 2040) |
| orderInfo 높이 | 1410.3px (시안 1413) |
| 버튼/셀렉트 padding | 15·22 / 10·17·13px |
| 가로 스크롤 | 없음 |
| 콘솔 에러 | 없음 |

## 참고 · 판단한 것

- **상품 패널 sticky** — 시안은 정적 배치(A 에서 우측 패널이 상단에만 있음)라 기본값은
  `static` 입니다. 7,400px 짜리 좌측 컬럼과 함께 쓰는 실제 동작을 보려면 패널에서
  `sticky` 로 전환할 수 있게 해뒀습니다.
- **상품 패널 폭 548px** — 시안 고정값입니다. 좁은 뷰포트에서 6컬럼보다 넓어지면 넘치므로
  `min(548px, 100%)` 로 상한만 걸었습니다.
- **문의하기 버튼 padding** — 컴포넌트 문서에 small 버튼의 px 정의가 없어 시안 인스턴스
  (71×34)에서 역산했습니다.
- **드롭다운 좌우 padding** — 가이드가 상하(0.7em)만 정의해서, 좌우는 펼침 헤더와 맞춰
  16 / 12px 을 em 으로 환산했습니다 (`1.2308em` / `0.9231em`).
- **옵션 항목과 추가금** — 시안의 용량 목록(`250ml`, `(품절) 250ml x 3`, `250ml x 6` …)은
  그대로 쓰고, 맛·추가옵션은 10개 가정에 맞춰 임의로 채웠습니다. 금액도 임의값입니다.
  실제 데이터는 `OPTION_GROUPS` 배열만 교체하면 됩니다.
- **섹션 titleArea / filterBar / pagination 여백** — 컴포넌트 주석이 아니라 시안 좌표에서
  역산했고, 모두 mid 토큰값과 정확히 맞아떨어집니다 (24 / 20 / 48).
- **리뷰·문의 본문** — 시안의 더미 텍스트를 그대로 쓰되 항목별로 길이를 달리해
  이미지 유무·답변 유무 케이스를 함께 넣었습니다. 그래서 섹션 전체 높이는 시안과 다릅니다.
- 우하단 데모 패널은 시안에 없는 요소입니다. `.demo-nav` 계열 CSS 와 `#demoNav` 마크업,
  스크립트의 해당 블록을 지우면 됩니다.


---

## 시안 대조 수정 이력

Figma 시안(`productDetail/desktop` 템플릿 A/B)과 1:1 대조해 다르게 구현돼 있던 부분을
바로잡은 기록입니다.

| # | 항목 | 잘못 구현돼 있던 것 | 시안 | 수정 |
|---|---|---|---|---|
| 1 | 섹션 `titleArea` | 하단 선 **없음** | `border-bottom 1px rgba(0,0,0,.1)` | 추가 |
| 2 | `filterBar` | 하단 선 **없음** | `border-bottom 1px rgba(0,0,0,.1)` | 추가 |
| 3 | 섹션 타이틀 굵기 | 500 | P1 **SemiBold** | 600 |
| 4 | `reviewItem` 구분선 | `rgba(0,0,0,.1)` | `rgba(0,0,0,.12)` | 수정 |
| 5 | `inquiryItem` 구분선 | `rgba(0,0,0,.1)` | `rgba(0,0,0,.12)` | 수정 |
| 6 | `inquiryItem` gap | 전부 `mid-24` | 기본 `mid-16`, 답변 있는 항목만 `mid-24` | `:has(.reply)` 로 분기 |
| 7 | **리뷰 이미지** | `flex:1` → 1장이면 한 칸이 폭 전체(611px)를 먹음 | 항상 **9칸 슬롯**(빈 칸은 투명) | `grid-template-columns: repeat(9, 1fr)` |
| 8 | 문의하기 버튼 padding | `0.6154em 0.6538em` (8 / 8.5px) | 13 / 9px | `0.6923em 1em` |
| 9 | `optionArea` 중첩 | optionGroup ↔ selectedOption 사이가 `mid-56` | 사이는 `mid-16`, 버튼그룹만 `mid-56` | `.option-stack` 한 겹 추가 |
| 10 | pagination 컨테이너 | `padding: mid-48 0` | `px mid-8 / py mid-48` | 수정 |
| 11 | pagination 화살표 | 번호와 같은 스타일 | `iconButton/contained` (흰 배경 + 1px 보더 + p6 + 16px 아이콘) | 교체 |
| 12 | pagination 현재 페이지 | 배경 채움 | opacity 0.8 vs 0.48 | 수정 |
| 13 | 탭바 폰트 | P4 (13px) | **P3 (14px)** | 수정 |
| 14 | 탭바 아이템 gap | `mid-40` | `mid-100` | 수정 |
| 15 | `select/text` chevron | 16px + opacity .6 | `h-full` + 1:1 (= 라인박스 높이) | `1lh` |
| 16 | 문의 filterBar 라벨 | P4 | **P3** (리뷰는 P4 유지) | 수정 |
| 17 | 배지 · 수정/삭제 · 비밀글 | **없음** | `badge` / `buttonGroup` / `private` | 추가 |
| 18 | 리뷰 필터 라벨 텍스트 | "포토리뷰 보기" | "포토리뷰만 보기" | 수정 |

**17번 상세** — 시안에 있는데 통째로 빠져 있던 요소들입니다.

- `badge` : 내 리뷰 / 내 문의 — `border 1px rgba(17,17,17,.1)`, `radius-2xs`, C1 12px,
  padding 9 / 7px → em(`0.75em 0.5833em`)
- `buttonGroup` : 수정 · 삭제 — gap `mid-12`, 사이에 `1px × 10px` divider,
  버튼은 text 타입(좌우 padding 없음, 상하 9px → `0.6923em 0`), 삭제는 `#ef0000`
- `private` : 비밀글 — gap `mid-4`, lock 아이콘 20px, 텍스트 P3 `#6a6a6a`

**7번 상세** — 시안 `imageArea` 는 썸네일이 몇 장이든 항상 9칸이고 남는 칸은
`opacity: 0` 인 빈 슬롯입니다. `flex: 1 0 0` 으로 옮기면 장수가 줄어들 때 칸이 커지므로
9열 그리드로 바꿔야 칸 크기가 장수와 무관해집니다. (1440 기준 69.6×69.6px, 1장짜리
항목도 동일)

> ~~시안 자체의 불일치~~ → **정정.** `inquiryItem` 구분선이 항목마다 다른 것은 실수가
> 아니라 **답변 여부에 따른 구분**이었습니다 (미답변 `.12` / 답변완료 `.1`).
> 위 "inquiryItem 구조 — 시안 대조 수정" 참고.


---

## productPanel 폭 — 28.5vw (min 400px)

시안은 548px 고정이지만, 뷰포트가 커질수록 좌측 미디어와의 비중 차가 벌어져
**가변(vw)** 으로 전환했습니다.

```css
:root {
  --panel-w-raw: 28.5vw;   /* 1920 에서 547.2px ≈ 시안 548 */
  --panel-w-min: 400px;    /* min off → 0px   */
  --panel-w-max: 100vw;    /* max off → 100vw */
}
.product-panel {
  width: min(
    max(var(--panel-w-min), min(var(--panel-w-raw), var(--panel-w-max))),
    100%
  );
}
```

안쪽부터 읽으면 — `min(raw, max)` 로 상한, `max(min, …)` 로 하한, 바깥 `min(…, 100%)` 는
6컬럼 칼럼 밖으로 못 나가게 하는 안전장치입니다. min 과 max 가 서로 뒤집힌 값이면
(예: min 400 / max 300) `clamp()` 와 같은 규칙으로 **min 이 이깁니다.**

데모 패널의 `panel w` 줄에서 vw 값, min on/off + 값, max on/off + 값을 조정할 수 있고
localStorage 에 저장됩니다. (`reset` → 28.5vw / min 400 on / max off)
기존 `panel static·sticky` 토글은 이 자리로 대체했습니다 — sticky 는 `<body data-sticky="on">`
으로 수동 전환합니다.

| 뷰포트 | 패널 칼럼(6컬럼) | 패널 | 이전(548 고정) |
|---|---|---|---|
| 1280 | 611.8 | **400.0** (min) | 548 |
| 1366 | 654.0 | **400.0** (min) | 548 |
| 1440 | 690.3 | **410.4** | 548 |
| 1512 | 725.5 | **430.9** | 548 |
| 1920 | 925.5 | **547.2** | 548 |
| 2560 | 1239.2 | **729.6** | 548 |

min 400px 이 걸리는 구간은 **뷰포트 1404px 아래**(400 ÷ 0.285)입니다.
칼럼 폭은 항상 `0.49vw − 8` 이라 28.5vw 가 칼럼을 넘는 경우는 없습니다.


---

## productImageCarousel 간격 — 16px 고정 / mid-16 비교

썸네일 리스트의 **row gap** 과 **썸네일 리스트 ↔ 메인 이미지 간격**, 두 곳을 한 변수로 묶어
데모 패널(`carousel`)에서 전환합니다.

```css
:root {
  --carousel-gap-x: var(--mid-16);   /* 리스트 ↔ 메인 — 거터 성격 */
  --carousel-gap-y: var(--mid-16);   /* 썸네일 사이 — 리듬 성격 */
}
body[data-cgap="px"]    { --carousel-gap-x: 16px; --carousel-gap-y: 16px; }
body[data-cgap="split"] { --carousel-gap-x: 16px; --carousel-gap-y: var(--mid-16); }

.carousel             { column-gap: var(--carousel-gap-x); }
.carousel .thumb-list { gap: var(--carousel-gap-y); }
```

데모 패널 `carousel` 에서 **16px · mid-16 · split** 세 가지를 전환합니다 (기본 = 시안 `mid-16`).

데모 패널 `case` 의 **카테고리** 체크박스로 `categoryName` 노출 여부를 확인할 수 있습니다
(모바일과 동일한 케이스).

| 뷰포트 | mid-16 | 16px | 썸네일:간격 비 (mid / px) |
|---|---|---|---|
| 1280 | 13.33 | 16 | 6.8 / 5.5 |
| 1440 | 14.00 | 16 | 7.4 / 6.4 |
| 1920 | 16.00 | 16 | 8.8 / 8.8 |
| 2560 | 18.67 | 16 | 10.2 / 12.1 |

**둘의 진짜 차이는 간격 자체가 아니라 그리드 정합입니다.** 캐러셀은 6컬럼 그리드로
썸네일 1컬럼 + 메인 5컬럼을 잡는데, column-gap 이 페이지 거터(16px 고정)와 달라지면
캐러셀 컬럼이 페이지 컬럼과 어긋납니다.

1440 실측:

| | gap | 썸네일 컬럼 | 페이지 컬럼 | 차이 |
|---|---|---|---|---|
| 16px | 16.00 | 101.70 | 101.70 | **0** |
| mid-16 | 14.00 | 103.38 | 101.70 | **+1.68px** |

즉 `mid-16` 은 시안에 충실하지만 1920 아래에서 메인 이미지 좌측 모서리가 아래 섹션의
그리드선보다 조금씩 오른쪽으로 밀립니다. `16px` 은 그리드는 정확히 맞고 대신 넓은
뷰포트에서 간격이 상대적으로 좁아 보입니다.


### 결론 — `mid-16` 통일 (시안 그대로)

`split`(가로 px-16 / 세로 mid-16) 도 토글로 남겨 뒀지만, **`mid-16` 통일을 채택**합니다.

처음엔 "가로는 거터니까 16px 고정이어야 한다" 고 봤는데, 실제 수치를 재 보니 그 논거가
약합니다. 2560 기준:

| | 위치 | 폭 |
|---|---|---|
| 캐러셀 안쪽 이음새 | x 216 ~ 235 | 18.66px |
| 페이지 이음새 (`.col-media ↔ .col-panel`) | x 1264 ~ 1280 | 16.00px |
| **두 이음새 사이 거리** | | **1029.5px** |

2.66px 차이인데 두 이음새가 1000px 넘게 떨어져 있어 나란히 비교되지 않습니다.
썸네일 컬럼도 그리드 컬럼보다 2.2px 넓어질 뿐이고, **그 어긋난 세로선(메인 이미지 좌측,
x 234.96)에 맞춰지는 요소가 아래에 없습니다** — 하단 상세 이미지·섹션은 모두 컬럼 1
좌측(x 25.33)에서 시작하고, 이건 썸네일 좌측과 항상 일치합니다.

반면 통일의 이득은 확실합니다.

- **시안과 코드가 일치** — 벗어난 이유를 따로 설명할 필요가 없음
- **규칙이 한 문장** — "캐러셀 내부 간격은 mid-16". `split` 은 각주가 필요하고,
  각주가 필요한 규칙은 시간이 지나면 무너짐
- **리듬 유지** — 썸네일이 완전 가변이라 간격도 가변인 쪽이 비율이 안정적
  (1280 → 2560 에서 썸네일:간격 비 6.8 → 10.2, 고정이면 5.5 → 12.1)

> 다만 이건 캐러셀 내부 컬럼이 페이지 12컬럼과 **정확히 같지는 않다**는 뜻이므로,
> 나중에 메인 이미지 좌측 모서리에 맞춰야 하는 요소(캡션·배지 등)가 생기면 그때
> `split` 을 다시 검토하면 됩니다.

### 참고 — split 의 논거



두 간격은 이름만 같지 `16` 이지 성격이 다릅니다.

**리스트 ↔ 메인 = 거터.** 캐러셀은 썸네일 1컬럼 + 메인 5컬럼이고 이 간격은 두 컬럼 사이
이음새입니다. 프레임워크가 `global/desktop-gutter-px = 16` 을 고정으로 선언해 뒀는데
여기만 다르면, 2560 에서 `.col-media ↔ .col-panel` 이음새는 16px 인데 캐러셀 안쪽
이음새는 18.67px 이 됩니다 — **같은 가로줄에 나란한 두 이음새가 다른 값**이 됩니다.

**썸네일 row gap = 리듬.** 썸네일은 컬럼의 1/6 이라 완전 가변(1280 → 89px,
2560 → 193px)인데 간격만 고정이면 비율이 무너집니다.

| 뷰포트 | 썸네일:간격 비 (mid-16) | (16px 고정) |
|---|---|---|
| 1280 | 6.8 | **5.5** |
| 1920 | 8.8 | 8.8 |
| 2560 | 10.2 | **12.1** |

고정은 5.5 → 12.1 로 2.2배 벌어지고, mid-16 은 6.8 → 10.2 로 절반쯤 잡아줍니다.

2560 실측 (`split`) — 가로 `16px` (페이지 거터와 일치, 썸네일 컬럼 193.2px = 그리드 컬럼),
세로 `18.67px` (비 10.3). 두 성질을 다 가져갑니다.

> Figma 는 두 곳 모두 `mid-16` 바인딩입니다. 1920 에서는 둘 다 16 이라 구분할 계기가
> 없었을 가능성이 큽니다. 시안을 임의로 벗어나지 않도록 **기본값은 `mid-16` 유지**,
> `split` 은 토글로만 열어 뒀습니다.

# Framework E — 주문 플로우 (데스크탑)

Figma `10127:91606` 의 `cart` · `checkout` · `paySuccess` 구현.
기준 폭 **1920** / **1rem = 14px**.

```
cart.html  ──[주문하기]──▶  checkout.html  ──[결제하기]──▶  paysuccess.html
                                                              └─[쇼핑 계속하기]─▶ cart.html
```

| 파일 | 화면 |
|---|---|
| `cart.html` | 장바구니 |
| `checkout.html` | 주문/결제 |
| `paysuccess.html` | 주문완료 |
| `order.css` · `order.js` | 세 화면 공통 |

---

## 1. 단위 체계

### 1-1. Typography

```
font-size = (size value − 1) × 0.0083 × screen width + 1rem
· size value ≤ 1rem 이면 뷰포트와 무관하게 고정
```

| 토큰 | 값 | 비고 |
|---|---|---|
| `--fs-c1` | 12px | 고정 |
| `--fs-p4` | 13px | 고정 |
| `--fs-p3` | 14px | = 1rem, 고정 |
| `--fs-p2` | `calc((1.1429 − 1) × 0.83vw + 1rem)` | **가변** (1920 → 16) |
| `--fs-p1` | `calc((1.2857 − 1) × 0.83vw + 1rem)` | **가변** (1920 → 18) |
| `--fs-btn-l / s` | 14 / 13px | 고정 |

이 세 화면에서 가변인 타이포는 **P1 · P2 둘뿐**입니다. 데모 패널에서 조절합니다.

### 1-2. Spacing — `mid-*`

`(값 − 8) × 100vw / 1920 + 8` · 값 < 8 은 값 그대로 고정.

사용 토큰 — `mid-1 / 2 / 4 / 6 / 8 / 10 / 12 / 16 / 20 / 24 / 32 / 56 / 80 / 120 / 144`

**상품 이미지 크기도 `mid`** 입니다. `get_variable_defs` 로 확인한 바인딩:

| 위치 | 토큰 | @1920 | 1440 | 2560 |
|---|---|---|---|---|
| cart 썸네일 | `mid-144` | 144 | 110 | 189.33 |
| checkout · paySuccess 썸네일 | `mid-120` | 120 | 92 | 157.33 |
| `contentArea` pt / pb | `mid-80` / `mid-120` | 80 / 120 | 62 / 92 | 104 / 157.33 |
| `contentArea` row-gap | `mid-20` | 20 | — | — |
| 블록 padding | `mid-32` | 32 | — | — |
| `buttonArea` pt / pb | `mid-16` / `mid-56` | 16 / 56 | — | — |
| `agree` 좌우 | `mid-8` | 8 (고정) | — | — |

> Figma 의 Tailwind 출력이 `size-[144px]` 처럼 raw px 로 보여도 실제로는 변수가 물려 있는
> 경우가 있습니다. **`get_variable_defs` 로 교차 확인**해야 합니다.

### 1-3. 그리드

```css
.content-area {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: 16px;                     /* global/desktop-gutter-px */
  row-gap: 20px;
  padding: 80px var(--grid-margin) 120px;   /* margin = 19vw/1920 */
}
.page-title  { grid-column: 2 / span 11; }
.col-main    { grid-column: 2 / span 5;  }
.col-summary { grid-column: 8 / span 4;  }
```

1920 실측 — 타이틀 `x 177.16 · w 1723.84`, 좌측 `774.84`, 우측 `x 1126.16 · w 616.66`
(시안 177.17 / 1723.83 / 774.83 / 1126.17 / 616.67).

### 1-4. em

**버튼류 padding 은 전부 em.** 여기에 더해 컴포넌트 어노테이션이 em 이라고 한 곳:

| 컴포넌트 | 어노테이션 | @em base | 시안 px | em |
|---|---|---|---|---|
| `button` (CTA) | 공통 규칙 | button-label-large 14 | 15 / 22 | `1.0714em 1.5714em` |
| `payment > paymentOption` | **padding : em** | option label = P3 14 | 11 / 21 | `0.7857em 1.5em` |
| `couponSelector > textField` | **padding : em** | field text = P4 13 | 11 / 17 | `0.8462em 1.3077em` |
| `couponSelectorButton` | 버튼 공통 규칙 | P4 13 | 11 / 17 | `0.8462em 1.3077em` |

`couponSelector` 에는 서술형 어노테이션도 있습니다 — **"필드의 높이는 버튼 높이와 동일한 값을 적용"**.
필드와 버튼이 같은 em 값을 쓰고 `align-items: stretch` 라 자동으로 맞습니다.

### 1-5. `ch` 어노테이션

`numberInput` 숫자 영역 — 기본 `width: 3ch`, `min-width: 32px` (fixed). 1920 에서 32px.

### 1-6. 그 외 = px

체크박스 16, 닫기 아이콘 20, **`numberInputItem` 36 · 아이콘 24**(변수 바인딩 없음 — 확인함),
divider 12 / 10, 헤더 54 · 좌우 24, radius 토큰.

### 1-7. 브라우저 스크롤바 숨김

```css
html { scrollbar-width: none; -ms-overflow-style: none; }
html::-webkit-scrollbar { display: none; }
```

스크롤은 그대로 동작하고 스크롤바만 보이지 않습니다.
**세로 스크롤바가 없어야 `100vw` 와 실제 콘텐츠 폭이 같아져** `19vw` 마진과 12컬럼 계산이
시안과 정확히 맞습니다 (스크롤바가 있으면 컬럼이 최대 1.25px 씩 어긋납니다).

1920 실측 — `innerWidth 1920` = `clientWidth 1920`, 스크롤바 폭 **0**, 스크롤 동작 정상.

---

## 2. 인터랙션 어노테이션

> **우측 정보 영역 스크롤 시 고정 X** (장바구니, 주문/결제, 주문완료 모두 동일함)
> 프레임워크 B처럼 영역이 명확히 분리된 경우를 제외하고는 고정하지 않음

→ `orderSummary` 에 `position: sticky` 를 **걸지 않았습니다.**

---

## 3. 화면별 구성

### cart

| 영역 | 구성 |
|---|---|
| 좌측 | `productList/checkbox` × 3 — 썸네일 위 체크박스 · 닫기 · `numberInput` · 금액 |
| 우측 | `paymentInfo` (상품 금액 / 배송비 / 무료 안내 / 총 결제 금액) + CTA `주문하기` |

체크 해제·수량 변경·삭제가 **결제 정보에 실시간 반영**되고, 전부 해제하면 CTA 가 비활성됩니다.
배송비는 200,000원 이상이면 0원으로 계산합니다.

`price` 는 시안대로 숫자가 **P4 13**, `원` 이 **P3 14** 입니다 (같은 행에서 크기가 다릅니다).

### checkout

| 블록 | 구성 |
|---|---|
| 배송지 정보 | 주소 · 이름/연락처 · 배송 요청사항 + `변경` (underline 버튼) |
| 주문 상품 | `productList/default` × 2 |
| 할인 | `사용 가능 쿠폰 N장` + `couponSelector` (필드 + 쿠폰 선택 버튼) |
| 결제 수단 | `paymentOption` 2개 (선택 시 보더 `#000`) |
| 우측 | `paymentInfo` + CTA `{금액}원 결제하기` + `개인정보 수집/이용 및 처리 동의 [보기]` |

`쿠폰 선택` 을 누르면 필드가 선택 상태(쿠폰명 + 할인액)로 바뀌고,
**결제 정보에 `쿠폰 할인` 행이 나타나며 총액·CTA 금액이 함께 갱신**됩니다.

### paySuccess

| 영역 | 구성 |
|---|---|
| 타이틀 | `주문이 완료되었습니다` + `주문번호 20241231ABCDE` |
| 좌측 | 배송지 정보(변경 버튼 없음) · 주문 상품 |
| 우측 | `paymentInfo` (쿠폰 할인 · 결제 수단 포함) + `주문 상세보기` / `쇼핑 계속하기` |

---

### 1-8. Figma stroke → CSS inset box-shadow

Figma 의 stroke 는 **inside** 라 요소 크기를 밀지 않습니다. CSS `border` 를 쓰면
높이가 padding 으로 결정되는 박스가 2px 씩 커집니다. 그래서 **크기가 auto 인 보더 박스는
`box-shadow: inset 0 0 0 1px` 로** 옮겼습니다 (`box-sizing: border-box` 라 크기를 명시한
체크박스 등은 `border` 그대로 두어도 무방).

| 요소 | 시안 | border 사용 시 | inset 적용 후 |
|---|---|---|---|
| `numberInput` (large, 조정 후) | 102 × 36 | 104 × 38 | **102 × 36** |
| `button` (CTA) | 47 | 48.78 | **46.78** |
| `couponSelector` | 43 | 44.80 | **42.80** |
| `paymentOption` | 44 | 46.38 | **44.38** |

---

## 4. 수정 이력

**`paymentInfo` 상하 여백 누락.** 컴포넌트(`8477:125518`) 정의에는 padding 이 없어서 0 으로 두었는데,
화면 인스턴스를 재보니 **타이틀이 y=20 에서 시작하고 블록 하단에도 20 이 남습니다.**

```
paymentInfo 286  =  20(pt) + 24(title) + 20(gap mid-20) + 202(content) + 20(pb)
```

`padding: var(--mid-20) 0` 을 추가했습니다. 이 20 이 빠져 있어서
**결제 정보와 버튼 사이 간격이 36 이어야 하는데 16 으로 보였습니다.**

**`.head` 안의 블록 타이틀이 P2 를 못 받음.** 선택자를 `.block > .b-title` 로 써서
`배송지 정보` · `할인` 처럼 우측에 버튼이 붙어 `.head` 로 한 겹 감싼 타이틀이
14px 로 렌더됐습니다. `.block .b-title` 로 바꿨습니다.
(블록 높이 173.79 → **179.6**, 147.59 → **151.2** — 시안 178 / 151)

**`numberInput` 크기.** 위 1-8 참고 — 108×40 → 106×38.
그 뒤 **시안이 조정되어(large 36 → 34) 최종 102 × 36**. 아래 표 참고.
### `numberInput` 시안 변경 반영 (large 36 → 34)

| | 이전 | 변경 후 |
|---|---|---|
| `numberInputItem` (large) | 36 | **34** |
| 내부 padding | `mid-6` | **`mid-4`** |
| 아이콘 | 컨테이너 꽉 채움(24) | **고정 24 + 가운데 정렬** |
| 전체 (large) | 106 × 38 | **102 × 36** |

`medium` 은 변경 없음 — 아이템 28 · 내부 `mid-2` · 아이콘 24 · 전체 **90 × 30**.
숫자 영역 어노테이션(`3ch` / `min-width 32px`)도 그대로입니다.

**px 로 굳어 있던 `mid` 토큰들.** Figma Tailwind 출력이 raw px 로 나와서 고정으로 옮겼는데
`get_variable_defs` 로 확인하니 변수가 물려 있었습니다 — **상품 이미지(144 · 120)**,
`contentArea` 상하 여백(80 · 120), row-gap 20, 블록 padding 32, `buttonArea`(16 · 56),
`agree` 좌우 8. 전부 `mid` 로 되돌렸습니다. 이제 뷰포트에 따라 썸네일도 같이 커집니다
(1440 → 110 / 1920 → 144 / 2560 → 189.33).

---

## 5. 알려진 차이

**P2 가 16.28px.** 프레임워크 수식 `(size − 1) × 0.0083 × 1920 + 1rem` 의 계수 0.0083 이
1/120(0.008333) 의 반올림값이라 1920 에서 정확히 16 이 아니라 16.28 이 나옵니다.
시안 값과 0.28px 차이이며 PDP 데스크탑도 동일합니다 (수식을 그대로 따른 결과).

**첫 블록 상단 여백.** 시안의 `shippingAddress` 블록 높이가 178 인데 컴포넌트 자체는 126 입니다.
나머지 블록이 모두 `py 32` 인 것에 맞춰 첫 블록만 `padding: 20px 0 32px` 로 두어 178 을 재현했습니다.

---

## 6. 데모 컨트롤

우측 하단 패널 (시안에 없는 요소 — 삭제해도 무방)

- **SCREEN** — 장바구니 / 주문/결제 / 주문완료 이동
- **TYPE** — P1 · P2 · P3 · P4 크기 조절 + reset
  (P3 14 / P4 13 은 ≤ 1rem 이라 입력값이 그대로 px 고정으로 들어갑니다)
- **readout** — viewport · margin · gutter · `mid-20` · P1~P4 실제 px

## 7. 검증 (1920)

| 항목 | 시안 | 실측 |
|---|---|---|
| 타이틀 x / w | 177.17 / 1723.83 | **177.16 / 1723.84** |
| 좌측 컬럼 | 774.83 | **774.84** |
| 우측 컬럼 x / w | 1126.17 / 616.67 | **1126.16 / 616.66** |
| cart 아이템 높이 | 185 | **185.00** |
| cart 썸네일 | 144 | **144×144** |
| order 썸네일 | 120 | **120×120** |
| `numberInput` | 108×40 (버튼 36 · 숫자 32) | **108×40 / 36 / 32** |
| CTA padding | 15 / 22 | **15.00 / 22.00** |
| buttonArea padding | 16 / 56 | **16 / 0 / 56** |
| `paymentInfo` 자체 여백 | 상 20 / 하 20 | **20 / 0** |
| `paymentInfo` 높이 (cart · checkout) | 228 | **229.01** |
| `paymentInfo` 높이 (paySuccess) | 286 | **287.80** |
| `orderSummary` 높이 (cart / checkout / paySuccess) | 347 / 388 / 405 | **349.79 / 390.59 / 408.59** |
| 총 결제 금액 → 버튼 간격 | 36 | **36.00** |
| contentArea padding | 80 / 19 / 120 | **80 / 19 / 120** |
| paySuccess 버튼 2개 + gap | 616.67 | **304.33 × 2 + 8** |
| `numberInput` (large) | 102 × 36 | **102 × 36** |
| ↳ 버튼 / 숫자 / 아이콘 | 34 / 32 / 24 | **34 / 32 / 24** |
| cart 아이템 top / quantityPrice | 47 / 38 | **47.20 / 38.00** |
| ↳ 상품명 → 옵션 | 4 | **4** |
| ↳ 텍스트 → 닫기 | 24 | **24** |
| ↳ 이미지 → 콘텐츠 | 20 | **20** |
| ↳ quantityPrice 위치 | y 106 | **106** |
| checkout 블록 높이 | 178 / 364 / 151 / 152 | **179.60 / 364.41 / 151.20 / 152.79** |
| `couponSelector` / `paymentOption` | 43 / 44 | **42.80 / 44.38** |
| paySuccess titleArea | 55 (27 + 6 + 22) | **56.23 (27.83 + 6 + 22.4)** |

가로 오버플로 없음, 콘솔 에러 없음.

/* ==========================================================================
   Framework E — 주문 플로우 (데스크탑) · 공통 스크립트
   · 데모 패널 : P1 / P2 폰트 크기 조절 + 화면 이동
   · 장바구니 : 체크박스 · 수량 · 삭제 → 결제 정보 실시간 반영
   · 주문/결제 : 쿠폰 선택 · 결제 수단 선택 · 동의 → 결제 금액 반영
   ========================================================================== */
(() => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const FS_KEY = 'fw-e-order-fs';
  const won = n => n.toLocaleString('ko-KR');

  /* ── 데모 — 폰트 크기 (가변인 P1 · P2 만) ─────────────────── */
  const ROOT = 14;                       /* 1rem = 14px */
  const FS_DEFAULT = { p1: 18, p2: 16, p3: 14, p4: 13 };
  const FS_KEYS = ['p1', 'p2', 'p3', 'p4'];
  const fsVal = k => {
    const el = $(`#fs${k.toUpperCase()}`);
    if (!el) return FS_DEFAULT[k];
    const v = parseInt(el.value, 10);
    return Number.isFinite(v) ? Math.min(48, Math.max(8, v)) : FS_DEFAULT[k];
  };
  /* 데스크탑 수식 : (size/14 − 1) × 0.83vw + 1rem, ≤ 1rem 은 고정 */
  const fsExpr = v => (v <= ROOT ? `${v}px` : `calc((${(v / ROOT).toFixed(4)} - 1) * 0.83vw + 1rem)`);

  function px(k) {
    const d = document.createElement('div');
    d.style.width = `var(${k})`;
    document.body.appendChild(d);
    const v = parseFloat(getComputedStyle(d).width);
    d.remove();
    return v;
  }

  function readout() {
    const out = $('#readout');
    if (!out) return;
    const type = FS_KEYS
      .map(k => `${k.toUpperCase()} <b>${px('--fs-' + k).toFixed(2)}</b>`).join(' · ');
    out.innerHTML =
      `viewport <b>${innerWidth}px</b> · margin <b>${px('--grid-margin').toFixed(2)}</b> · ` +
      `gutter <b>16.00</b> · mid-20 <b>${px('--mid-20').toFixed(2)}</b><br>${type}`;
  }

  function applyFs() {
    const vals = {};
    FS_KEYS.forEach(k => {
      const v = fsVal(k);
      vals[k] = v;
      document.body.style.setProperty(`--fs-${k}`, fsExpr(v));
    });
    try { localStorage.setItem(FS_KEY, JSON.stringify(vals)); } catch (e) {}
    readout();
  }

  if ($('#typeFields')) {
    $('#typeFields').addEventListener('input', e => {
      if (e.target.matches('input[type="number"]')) applyFs();
    });
    $('#typeFields').addEventListener('change', e => {
      if (!e.target.matches('input[type="number"]')) return;
      e.target.value = fsVal(e.target.id.slice(2).toLowerCase());
      applyFs();
    });
    $('#fsReset').addEventListener('click', () => {
      Object.entries(FS_DEFAULT).forEach(([k, v]) => { $(`#fs${k.toUpperCase()}`).value = v; });
      applyFs();
    });
    try {
      const saved = JSON.parse(localStorage.getItem(FS_KEY) || 'null');
      if (saved) Object.entries(saved).forEach(([k, v]) => { const el = $(`#fs${k.toUpperCase()}`); if (el) el.value = v; });
    } catch (e) {}
    applyFs();
  }
  window.addEventListener('resize', readout);

  /* ── 장바구니 ───────────────────────────────────────────────── */
  const cart = $('#cartList');
  if (cart) {
    const SHIP = 3000, FREE_OVER = 200000;

    function syncCart() {
      let amount = 0;
      $$('.cart-item', cart).forEach(item => {
        const on = $('input[type="checkbox"]', item).checked;
        const qty = +$('.value', item).textContent;
        const unit = +item.dataset.price;
        $('.price .num', item).textContent = won(qty * unit);
        $('[data-act="minus"]', item).disabled = qty <= 1;
        if (on) amount += qty * unit;
      });
      const ship = amount === 0 || amount >= FREE_OVER ? 0 : SHIP;
      $('#sumAmount').textContent = won(amount);
      $('#sumShip').textContent = won(ship);
      $('#sumTotal').textContent = won(amount + ship);
      $('#cta').textContent = '주문하기';
      $('#cta').classList.toggle('is-disabled', amount === 0);
    }

    cart.addEventListener('click', e => {
      const item = e.target.closest('.cart-item');
      if (!item) return;
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'remove') { item.remove(); syncCart(); return; }
      if (act === 'plus' || act === 'minus') {
        const v = $('.value', item);
        v.textContent = Math.max(1, +v.textContent + (act === 'plus' ? 1 : -1));
        syncCart();
      }
    });
    cart.addEventListener('change', e => {
      if (e.target.matches('input[type="checkbox"]')) syncCart();
    });
    syncCart();
  }

  /* ── 주문/결제 ──────────────────────────────────────────────── */
  const checkout = $('#checkoutForm');
  if (checkout) {
    const AMOUNT = 80000, SHIP = 3000;
    let coupon = 0;

    function syncCheckout() {
      const total = AMOUNT + SHIP - coupon;
      $('#sumTotal').textContent = won(total);
      $('#cta').textContent = `${won(total)}원 결제하기`;
      const row = $('#couponRow');
      if (row) row.hidden = coupon === 0;
      if (coupon) $('#sumCoupon').textContent = `-${won(coupon)}`;
    }

    $('#couponBtn').addEventListener('click', () => {
      const field = $('#couponField');
      if (coupon) {
        coupon = 0;
        field.classList.remove('is-selected');
        field.innerHTML = '<span class="label">선택 안 함</span>';
        $('#couponBtn').textContent = '쿠폰 선택';
      } else {
        coupon = 5000;
        field.classList.add('is-selected');
        field.innerHTML = '<span class="label">첫 구매 5,000원 할인</span>' +
          '<span class="discount"><span class="num">-5,000</span>원</span>';
        $('#couponBtn').textContent = '쿠폰 변경';
      }
      syncCheckout();
    });

    $('#payOptions').addEventListener('click', e => {
      const b = e.target.closest('.pay-option');
      if (!b) return;
      $$('.pay-option').forEach(x => x.classList.toggle('is-on', x === b));
    });

    syncCheckout();
  }
})();

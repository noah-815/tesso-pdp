// 상품 설명 더보기
const btnMore = document.getElementById('btnMore');
const detailClamp = document.getElementById('detailClamp');
if (btnMore && detailClamp) {
  btnMore.addEventListener('click', () => {
    detailClamp.classList.add('expanded');
  });
}

// 페이지네이션 active 토글
document.querySelectorAll('.pagination .pages').forEach((group) => {
  group.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      group.querySelector('.active')?.classList.remove('active');
      btn.classList.add('active');
    });
  });
});

// 체크박스 토글 (시각적 데모)
document.querySelectorAll('.checkbox-label').forEach((label) => {
  label.addEventListener('click', () => {
    const box = label.querySelector('.box');
    const on = box.dataset.on === '1';
    box.dataset.on = on ? '' : '1';
    box.style.background = on ? '' : '#111';
    box.style.borderColor = on ? '' : '#111';
  });
});

// ============ Dialogs ============
document.querySelectorAll('[data-open-dialog]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    // 다른 다이얼로그 위에서 열 때 기존 것 닫기
    document.querySelectorAll('.dialog-backdrop.open').forEach((d) => d.classList.remove('open'));
    const dlg = document.getElementById(btn.dataset.openDialog);
    if (dlg) dlg.classList.add('open');
  });
});
document.querySelectorAll('[data-close-dialog]').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.closest('.dialog-backdrop')?.classList.remove('open');
  });
});
document.querySelectorAll('.dialog-backdrop').forEach((backdrop) => {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.classList.remove('open');
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.dialog-backdrop.open').forEach((d) => d.classList.remove('open'));
  }
});

// 쿠폰 카드 선택 토글
document.querySelectorAll('#dlgCoupon .coupon-card, #dlgCoupon .option-selector').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('#dlgCoupon .selected').forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');
  });
});

// 결제 수단 선택 토글
document.querySelectorAll('.radio-button-group .payment-option').forEach((opt) => {
  opt.addEventListener('click', () => {
    opt.parentElement.querySelectorAll('.selected').forEach((o) => o.classList.remove('selected'));
    opt.classList.add('selected');
  });
});

// 배송지 선택 토글
document.querySelectorAll('#dlgAddressList .btn-select').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#dlgAddressList .btn-select').forEach((b) => {
      b.classList.remove('selected');
      b.innerHTML = '선택';
    });
    btn.classList.add('selected');
    btn.innerHTML = '<span class="ic ic-check"><img src="assets/check.svg" alt=""></span>선택됨';
  });
});

// ============ Auth (login / signup / password) ============
// 필드 입력 시 버튼 활성화
document.querySelectorAll('[data-watch]').forEach((btn) => {
  const ids = btn.dataset.watch.split(',');
  const update = () => {
    const filled = ids.every((id) => document.getElementById(id)?.value.trim());
    btn.classList.toggle('disabled', !filled);
  };
  ids.forEach((id) => document.getElementById(id)?.addEventListener('input', update));
});

// 스텝 전환
function goStep(n) {
  document.querySelectorAll('.auth-step').forEach((s) => {
    s.hidden = s.dataset.step !== String(n);
  });
  window.scrollTo(0, 0);
}
document.querySelectorAll('[data-next-step]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('disabled')) return;
    goStep(btn.dataset.nextStep);
  });
});

// 이메일 에코 (step1 → step2)
document.querySelectorAll('[data-watch="suEmail"],[data-watch="cpEmail"]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('disabled')) return;
    const v = (document.getElementById('suEmail') || document.getElementById('cpEmail'))?.value.trim();
    const echo = document.getElementById('suEmailEcho') || document.getElementById('cpEmailEcho');
    if (v && echo) echo.textContent = v;
    const done = document.getElementById('suEmailDone');
    if (v && done) done.value = v;
  });
});

// OTP: 자동 포커스 이동 + 6자리 입력 시 버튼 활성화
document.querySelectorAll('.otp-fields').forEach((group) => {
  const inputs = [...group.querySelectorAll('input')];
  const submit = group.closest('.auth-step')?.querySelector('[data-otp-submit]');
  const update = () => {
    const full = inputs.every((i) => i.value.length === 1);
    submit?.classList.toggle('disabled', !full);
  };
  inputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      if (input.value && i < inputs.length - 1) inputs[i + 1].focus();
      update();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && i > 0) inputs[i - 1].focus();
    });
  });
});

// 비밀번호 표시 토글
document.querySelectorAll('[data-toggle-password]').forEach((eye) => {
  eye.addEventListener('click', () => {
    const input = document.getElementById(eye.dataset.togglePassword);
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
  });
});

// 이름 글자수 카운트
const suName = document.getElementById('suName');
if (suName) {
  suName.addEventListener('input', () => {
    document.getElementById('suNameCount').textContent = `${suName.value.length}/20`;
  });
}

// OTP 타이머
document.querySelectorAll('.otp-box .timer').forEach((timer) => {
  let sec = 299;
  setInterval(() => {
    if (sec > 0) sec -= 1;
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    timer.textContent = `${m}:${s}`;
  }, 1000);
});

// 마케팅 수신 토글
document.querySelectorAll('.toggle').forEach((t) => {
  t.addEventListener('click', () => t.classList.toggle('on'));
});

// ============ Cart : 체크박스 선택 + 수량 조절 + 합계 재계산 + 주문하기 ============
const cartList = document.querySelector('.cart-list');
if (cartList) {
  const FREE_SHIPPING = 50000;
  const SHIPPING_FEE = 3500;
  const fmt = (n) => n.toLocaleString('ko-KR');

  const items = [...cartList.querySelectorAll('.cart-item')].map((el) => {
    const valueEl = el.querySelector('.number-input .value');
    const priceEl = el.querySelector('.price .num');
    const qty = parseInt(valueEl.textContent, 10);
    const line = parseInt(priceEl.textContent.replace(/,/g, ''), 10);
    const [minusBtn, plusBtn] = el.querySelectorAll('.number-input button');
    return { el, box: el.querySelector('.checkbox-area .box'), valueEl, priceEl, minusBtn, plusBtn, unit: line / qty, qty };
  });

  const amountEl = document.querySelectorAll('.grid-aside .rows-top .row .val .num')[0];
  const shippingEl = document.querySelectorAll('.grid-aside .rows-top .row .val .num')[1];
  const totalEl = document.querySelector('.grid-aside .total .val .num');
  const orderBtn = document.getElementById('cartOrderBtn');

  function recalc() {
    const checked = items.filter((i) => i.el.classList.contains('checked'));
    const sum = checked.reduce((a, i) => a + i.unit * i.qty, 0);
    const shipping = sum === 0 ? 0 : (sum >= FREE_SHIPPING ? 0 : SHIPPING_FEE);
    amountEl.textContent = fmt(sum);
    shippingEl.textContent = fmt(shipping);
    totalEl.textContent = fmt(sum + shipping);
    orderBtn.classList.toggle('disabled', checked.length === 0);
  }

  function render(i) {
    i.valueEl.textContent = i.qty;
    i.priceEl.textContent = fmt(i.unit * i.qty);
    i.minusBtn.classList.toggle('disabled', i.qty <= 1);
  }

  items.forEach((i) => {
    // 기본 전체 선택
    i.el.classList.add('checked');
    i.box.classList.add('checked');
    i.minusBtn.classList.toggle('disabled', i.qty <= 1);

    i.box.addEventListener('click', () => {
      const on = !i.el.classList.contains('checked');
      i.el.classList.toggle('checked', on);
      i.box.classList.toggle('checked', on);
      recalc();
    });

    // 수량 조절 — 체크된 상품만 가능 (미체크 시 pointer-events 차단 + 가드)
    i.minusBtn.addEventListener('click', () => {
      if (!i.el.classList.contains('checked') || i.qty <= 1) return;
      i.qty -= 1; render(i); recalc();
    });
    i.plusBtn.addEventListener('click', () => {
      if (!i.el.classList.contains('checked')) return;
      i.qty += 1; render(i); recalc();
    });
  });
  recalc();

  orderBtn.addEventListener('click', () => {
    if (orderBtn.classList.contains('disabled')) return;
    location.href = 'checkout.html';
  });
}

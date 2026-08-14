/* ==========================================================================
   Framework D · PDP Mobile 인터랙션
   인터랙션 값은 framework-a-pdp-mobile과 동일하게 맞춤:
   - 상품 이미지: 가로 스와이프 페이징 (scroll-snap, 루프 없음)
   - 끝단 러버밴딩: 지수 감쇠, 최대 폭의 12%, 복귀 320ms
   - 도트 인디케이터: 최대 4개 노출 + 진행 방향 선반영(끝에서 두 번째 유지)
   - 이미지: 기존 10장 + 추가 무드컷 9장 = 19장
   ========================================================================== */
(function () {
  /* 기존 10장(제품 정면 → 흑백 패션 → 패브릭 → 램프/안경/자동차 → 나머지)
     뒤에 추가 무드컷 9장을 이어붙여 총 19장 */
  var FILES = ['product-1.png', 'product-10.png', 'product-9.png', 'product-6.png', 'product-7.png',
               'product-8.png', 'product-2.png', 'product-3.png', 'product-4.png', 'product-5.png',
               'extra-5.webp', 'extra-6.webp', 'extra-7.webp', 'extra-8.webp', 'extra-9.webp',
               'extra-10.webp', 'extra-11.webp', 'extra-12.webp', 'extra-13.webp'];
  var IMAGES = FILES.map(function (f, i) {
    return {
      src: 'assets/img/' + f,
      alt: '매일 산책하는 강아지를 위한 샴푸 — 상품 이미지 ' + (i + 1)
    };
  });

  var scroller = document.querySelector('.js-scroller');
  var indicator = document.querySelector('.js-indicator');

  /* ---------- 렌더 ---------- */
  IMAGES.forEach(function (img, k) {
    var slide = document.createElement('div');
    slide.className = 'm-gallery__slide';
    slide.innerHTML = '<img src="' + img.src + '" alt="' + img.alt + '"' + (k > 0 ? ' loading="lazy"' : '') + '>';
    scroller.appendChild(slide);
  });

  var dots = IMAGES.map(function (_, k) {
    var d = document.createElement('span');
    d.className = 'm-gallery__dot' + (k === 0 ? ' is-active' : '');
    indicator.appendChild(d);
    return d;
  });

  /* ---------- 페이지 ↔ 도트 동기화 (다이내믹 도트) ---------- */
  var N = IMAGES.length;
  var WINDOW = 4;            // 도트는 4개까지만 표시
  var current = 0;
  var winStart = 0;

  function renderDots() {
    /* 진행 방향에 이미지가 더 남아 있으면 활성 바가 창 경계가 아닌
       "끝에서 두 번째"에 머물도록 창을 한 칸 먼저 민다.
       창 경계 너머에 항목이 더 있으면 경계 도트는 축소 표시 */
    var hi = current - (current > 0 ? 1 : 0);                    // 뒤(이전)에 남아 있으면 활성은 두 번째 이상
    var lo = current - (WINDOW - 1) + (current < N - 1 ? 1 : 0); // 앞(다음)에 남아 있으면 활성은 끝에서 두 번째 이하
    winStart = Math.max(lo, Math.min(hi, winStart));
    winStart = Math.max(0, Math.min(N - WINDOW, winStart));
    var winEnd = winStart + WINDOW - 1;
    dots.forEach(function (d, k) {
      d.className = 'm-gallery__dot';
      if (k < winStart || k > winEnd) { d.classList.add('is-hidden'); return; }
      if (k === current) { d.classList.add('is-active'); return; }
      if ((k === winStart && winStart > 0) || (k === winEnd && winEnd < N - 1)) {
        d.classList.add('is-small');
      }
    });
  }

  function updateCurrent() {
    var w = scroller.clientWidth;
    if (!w) return;
    var idx = Math.round(scroller.scrollLeft / w);
    idx = Math.min(N - 1, Math.max(0, idx));
    if (idx !== current) {
      current = idx;
      renderDots();
    }
  }

  scroller.addEventListener('scroll', updateCurrent, { passive: true });
  window.addEventListener('resize', updateCurrent);

  renderDots();

  /* 데스크탑 프리뷰용 마우스 드래그 스와이프 (framework-a-pdp-mobile과 동일) */
  var dragging = false, startX = 0, startScroll = 0;
  scroller.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;
    dragging = true;
    startX = e.clientX;
    startScroll = scroller.scrollLeft;
    scroller.style.scrollSnapType = 'none';
    scroller.setPointerCapture(e.pointerId);
  });
  scroller.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var target = startScroll - (e.clientX - startX);
    var max = maxScroll();
    var cap = scroller.clientWidth * RUBBER_MAX_RATIO;
    if (target < 0) {                       /* 첫 장 너머 */
      scroller.scrollLeft = 0;
      setRubber(rubber(-target, cap));
    } else if (target > max) {              /* 마지막 장 너머 */
      scroller.scrollLeft = max;
      setRubber(-rubber(target - max, cap));
    } else {
      if (rubberOffset) setRubber(0);
      scroller.scrollLeft = target;
    }
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    releaseRubber();
    var w = scroller.clientWidth;
    var idx = Math.max(0, Math.min(N - 1, Math.round(scroller.scrollLeft / w)));
    scroller.style.scrollSnapType = '';
    scroller.scrollTo({ left: idx * w, behavior: 'smooth' });
  }
  scroller.addEventListener('pointerup', endDrag);
  scroller.addEventListener('pointercancel', endDrag);

  /* ---------- 엣지 러버밴딩 (framework-a-pdp-mobile과 동일 값) ----------
     중간 스크롤은 네이티브 스냅 그대로 두고, 끝단을 넘어서는 제스처만
     지수 감쇠(최대 폭의 12%) transform으로 반응시킨다. */
  var RUBBER_MAX_RATIO = 0.12;
  var rubberOffset = 0;
  function rubber(d, max) { return max * (1 - Math.exp(-d / max)); }
  function maxScroll() { return scroller.scrollWidth - scroller.clientWidth; }
  function setRubber(px) {
    rubberOffset = px;
    scroller.style.transition = '';
    scroller.style.transform = px ? 'translate3d(' + px.toFixed(2) + 'px,0,0)' : '';
  }
  function releaseRubber() {
    if (!rubberOffset) return;
    rubberOffset = 0;
    scroller.style.transition = 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)';
    scroller.style.transform = 'translate3d(0,0,0)';
    scroller.addEventListener('transitionend', function h() {
      scroller.removeEventListener('transitionend', h);
      scroller.style.transition = '';
      scroller.style.transform = '';
    });
  }

  /* 터치: 끝단에서 시작한 수평 제스처만 가로챈다 (Android 등 네이티브 바운스 없는 환경 대응) */
  var tStartX = 0, tStartY = 0, tActive = false, tLocked = false;
  scroller.addEventListener('touchstart', function (e) {
    tStartX = e.touches[0].clientX;
    tStartY = e.touches[0].clientY;
    tActive = true; tLocked = false;
  }, { passive: true });
  scroller.addEventListener('touchmove', function (e) {
    if (!tActive) return;
    var dx = e.touches[0].clientX - tStartX;
    var dy = e.touches[0].clientY - tStartY;
    if (!tLocked && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy) * 1.2) tLocked = true;
    if (!tLocked) return;
    var cap = scroller.clientWidth * RUBBER_MAX_RATIO;
    if (scroller.scrollLeft <= 0 && dx > 0) {
      if (e.cancelable) e.preventDefault();
      setRubber(rubber(dx, cap));
    } else if (scroller.scrollLeft >= maxScroll() - 1 && dx < 0) {
      if (e.cancelable) e.preventDefault();
      setRubber(-rubber(-dx, cap));
    } else if (rubberOffset) {
      setRubber(0);
    }
  }, { passive: false });
  function touchEnd() { tActive = false; releaseRubber(); }
  scroller.addEventListener('touchend', touchEnd);
  scroller.addEventListener('touchcancel', touchEnd);
})();

/* ==================== 상품 상세 · 더보기 ==================== */
(function () {
  var detail = document.querySelector('.js-detail');
  var btn = document.querySelector('.js-detail-more');
  if (btn) btn.addEventListener('click', function () {
    detail.classList.add('is-expanded');
  });
})();

/* ==================== 상품 문의 · 아코디언 ==================== */
(function () {
  document.querySelectorAll('.js-inquiry').forEach(function (item) {
    var info = item.querySelector('.inquiry-item__info');
    info.addEventListener('click', function () {
      item.classList.toggle('is-open');
    });
    info.style.cursor = 'pointer';
  });
})();

/* ==================== 상세 정보 · 아코디언 ==================== */
(function () {
  document.querySelectorAll('.js-acc').forEach(function (item) {
    item.querySelector('.acc-item__head').addEventListener('click', function () {
      item.classList.toggle('is-open');
    });
  });
})();

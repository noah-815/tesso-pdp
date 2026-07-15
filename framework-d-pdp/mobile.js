/* ==========================================================================
   Framework D · PDP Mobile 인터랙션
   - 상품 이미지: 가로 스와이프 페이징 (scroll-snap, 루프 없음)
   - 도트 인디케이터: #ffffff + mix-blend-mode: difference,
     현재 페이지에 맞춰 실시간 갱신 (활성 도트는 14px 필 형태)
   - 이미지 15장: 데스크탑과 동일한 에셋 사용
   ========================================================================== */
(function () {
  var IMAGES = [];
  for (var i = 0; i < 15; i++) {
    var n = (i % 5) + 1;
    IMAGES.push({
      src: 'assets/img/product-' + n + '.png',
      alt: '매일 산책하는 강아지를 위한 샴푸 — 상품 이미지 ' + (i + 1)
    });
  }

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

  /* ---------- 페이지 ↔ 도트 동기화 ---------- */
  var current = 0;

  function updateDots(idx) {
    if (idx === current) return;
    current = idx;
    dots.forEach(function (d, k) {
      d.classList.toggle('is-active', k === idx);
    });
  }

  var ticking = false;
  scroller.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var idx = Math.round(scroller.scrollLeft / scroller.clientWidth);
      updateDots(Math.min(IMAGES.length - 1, Math.max(0, idx)));
    });
  }, { passive: true });

  /* 데스크탑 브라우저 확인용: 마우스 드래그로도 스와이프 가능
     (터치는 네이티브 스크롤+스냅 사용, 마우스는 드래그 동안 스냅을 끄고
     놓는 순간 드래그 방향 기준으로 페이지 스냅) */
  var drag = null;
  scroller.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch') return;
    drag = { x: e.clientX, startLeft: scroller.scrollLeft, startPage: Math.round(scroller.scrollLeft / scroller.clientWidth) };
    scroller.style.scrollSnapType = 'none';
    scroller.setPointerCapture(e.pointerId);
  });
  scroller.addEventListener('pointermove', function (e) {
    if (!drag) return;
    scroller.scrollLeft = drag.startLeft - (e.clientX - drag.x);
  });
  function endDrag(e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    var target = drag.startPage;
    if (dx <= -40) target += 1;
    else if (dx >= 40) target -= 1;
    target = Math.min(IMAGES.length - 1, Math.max(0, target));
    scroller.scrollTo({ left: target * scroller.clientWidth, behavior: 'smooth' });
    /* 스무스 스크롤이 끝난 뒤 스냅 복원 */
    setTimeout(function () { scroller.style.scrollSnapType = ''; }, 400);
    drag = null;
  }
  scroller.addEventListener('pointerup', endDrag);
  scroller.addEventListener('pointercancel', endDrag);
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

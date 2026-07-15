/* ==========================================================================
   Framework D · 상품 이미지 캐러셀
   루프 없음 + 선택 섬네일 중앙 정렬 (framework-c A 방식)
   - 레일: 휠 스크롤/드래그 자유 탐색, 양 끝 클램프, 상/하단 그라데이션 반영
   - 메인: 잔상 없는 전환 — 나가는 이미지는 불투명하게 아래에 깔리고
     들어오는 이미지만 위에서 300ms 페이드인
   ========================================================================== */
(function () {
  var SPEED = 300;
  var IMAGES = [];
  for (var i = 0; i < 15; i++) {
    var n = (i % 5) + 1;
    IMAGES.push({
      src: 'assets/img/product-' + n + '.png',
      alt: '매일 산책하는 강아지를 위한 샴푸 — 상품 이미지 ' + (i + 1)
    });
  }

  var N = IMAGES.length;
  var track = document.querySelector('.js-track');
  var rail = document.querySelector('.js-rail');
  var main = document.querySelector('.js-main');

  /* ---------- 렌더 ---------- */
  var thumbs = [];
  IMAGES.forEach(function (img, v) {
    var b = document.createElement('button');
    b.className = 'gallery__thumb' + (v === 0 ? ' is-active' : '');
    b.dataset.v = v;
    b.setAttribute('aria-label', '상품 이미지 ' + (v + 1));
    b.innerHTML = '<img src="' + img.src + '" alt="">';
    track.appendChild(b);
    thumbs.push(b);
  });

  var photos = [];
  IMAGES.forEach(function (img, k) {
    var el = document.createElement('img');
    el.className = 'gallery__photo' + (k === 0 ? ' is-visible' : '');
    el.src = img.src;
    el.alt = img.alt;
    if (k > 0) el.loading = 'lazy';
    main.appendChild(el);
    photos.push(el);
  });

  /* ---------- 상태 ---------- */
  var current = 0;           // 선택된 인덱스
  var scroll = 0;            // 레일 스크롤 오프셋(px)
  var STEP = 150, SLIDE = 134, railH = 0, maxScroll = 0;

  function measure() {
    var t = thumbs[0];
    /* offsetHeight는 정수 반올림이라 끝단이 어긋날 수 있어 소수점 그대로 측정 */
    SLIDE = t.getBoundingClientRect().height;
    STEP = SLIDE + parseFloat(getComputedStyle(t).marginBottom);
    railH = rail.getBoundingClientRect().height;
    maxScroll = Math.max(0, STEP * N - parseFloat(getComputedStyle(t).marginBottom) - railH);
  }

  function clamp(px) {
    return Math.min(maxScroll, Math.max(0, px));
  }

  /* 선택 섬네일이 레일 중앙에 오는 오프셋 (양 끝에서는 경계에 맞춰 멈춤) */
  function centerOffset(i) {
    return clamp(i * STEP - (railH - SLIDE) / 2);
  }

  function setScroll(px, animate) {
    scroll = px;
    track.classList.toggle('is-animating', !!animate);
    track.style.transform = 'translate3d(0,' + -scroll + 'px,0)';
    /* 양 끝 도달 여부에 따라 상/하단 그라데이션 표시 갱신 */
    rail.classList.toggle('at-top', scroll <= 2);
    rail.classList.toggle('at-bottom', scroll >= maxScroll - 2);
  }

  /* ---------- 전환 효과 없는 즉시 교체 ---------- */
  function swapPhoto(next) {
    photos.forEach(function (p, k) {
      p.classList.toggle('is-visible', k === next);
    });
  }

  function updateActive() {
    thumbs.forEach(function (t, v) {
      t.classList.toggle('is-active', v === current);
    });
  }

  function select(i) {
    i = Math.min(N - 1, Math.max(0, i));
    if (i === current) return;
    swapPhoto(i);
    current = i;
    setScroll(centerOffset(current), true);
    updateActive();
  }

  /* ---------- 레일: 클릭 + 세로 드래그 ---------- */
  var drag = null;

  rail.addEventListener('pointerdown', function (e) {
    /* pointer capture 이후에는 e.target이 rail로 고정되므로 눌린 섬네일을 미리 기억 */
    drag = { y: e.clientY, startScroll: scroll, moved: false, pressed: e.target.closest('.gallery__thumb') };
    rail.setPointerCapture(e.pointerId);
  });

  rail.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dy = e.clientY - drag.y;
    if (Math.abs(dy) > 5) drag.moved = true;
    if (drag.moved) setScroll(clamp(drag.startScroll - dy), false);
  });

  rail.addEventListener('pointerup', function () {
    if (!drag) return;
    if (!drag.moved && drag.pressed) select(+drag.pressed.dataset.v);
    drag = null;
  });

  rail.addEventListener('pointercancel', function () { drag = null; });

  /* 휠 스크롤: 레일 위에서는 페이지 대신 섬네일 목록을 스크롤.
     선택(활성 섬네일)은 바뀌지 않는다 — 드래그와 동일한 자유 탐색 */
  rail.addEventListener('wheel', function (e) {
    e.preventDefault();
    setScroll(clamp(scroll + e.deltaY), false);
  }, { passive: false });

  /* ---------- 메인 이미지: 가로 스와이프 → 이전/다음 ---------- */
  var swipe = null;

  main.addEventListener('pointerdown', function (e) {
    swipe = { x: e.clientX };
    main.classList.add('is-dragging');
    main.setPointerCapture(e.pointerId);
  });

  main.addEventListener('pointerup', function (e) {
    if (!swipe) return;
    var dx = e.clientX - swipe.x;
    if (dx <= -50) select(current + 1);
    else if (dx >= 50) select(current - 1);
    main.classList.remove('is-dragging');
    swipe = null;
  });

  main.addEventListener('pointercancel', function () {
    main.classList.remove('is-dragging');
    swipe = null;
  });

  /* ---------- 초기화 ---------- */
  window.addEventListener('resize', function () {
    measure();
    setScroll(centerOffset(current), false);
  });

  measure();
  setScroll(0, false);
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

/* ==================== 우측 상세 정보 · 아코디언 ==================== */
(function () {
  document.querySelectorAll('.js-acc').forEach(function (item) {
    item.querySelector('.acc-item__head').addEventListener('click', function () {
      item.classList.toggle('is-open');
    });
  });
})();

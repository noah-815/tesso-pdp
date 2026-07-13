/* ==========================================================================
   상품 이미지 캐러셀 — 2가지 인터랙션 모드 (body[data-gallery-mode])
   · loop-top : 논픽션(nonfiction.kr) 방식.
                무한 루프 + 클릭한 섬네일이 맨 위로 슬라이드(300ms),
                메인 크로스페이드, 양방향 동기화
   · center   : 루프 없음 + 클릭(선택)한 섬네일이 레일 중앙 정렬.
                레일은 양 끝에서 멈추고, 메인 크로스페이드는 동일
   ========================================================================== */
(function () {
  var MODE = document.body.dataset.galleryMode || 'loop-top';
  var SPEED = 300;            // nonfiction swiper speed
  var IMAGES = [];
  for (var i = 0; i < 15; i++) {
    var n = (i % 3) + 1;
    IMAGES.push({
      src: 'assets/img/product-' + n + '.png',
      alt: '브와 드 일랑 오 드 퍼퓸 — 상품 이미지 ' + (i + 1)
    });
  }

  var N = IMAGES.length;      // 실제 슬라이드 수
  var track = document.querySelector('.js-track');
  var rail = document.querySelector('.js-rail');
  var main = document.querySelector('.js-main');

  /* ---------- 공통 렌더 ---------- */
  function renderThumbs(total) {
    var list = [];
    for (var v = 0; v < total; v++) {
      var real = v % N;
      var b = document.createElement('button');
      b.className = 'gallery__thumb';
      b.dataset.v = v;
      b.setAttribute('aria-label', '상품 이미지 ' + (real + 1));
      b.innerHTML = '<img src="' + IMAGES[real].src + '" alt="">';
      track.appendChild(b);
      list.push(b);
    }
    return list;
  }

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

  function crossfade(current) {
    photos.forEach(function (p, k) {
      p.classList.toggle('is-visible', k === current);
    });
  }

  /* 메인 이미지 가로 스와이프 공통 바인딩 */
  function bindMainSwipe(onPrev, onNext) {
    var swipe = null;
    main.addEventListener('pointerdown', function (e) {
      swipe = { x: e.clientX };
      main.classList.add('is-dragging');
      main.setPointerCapture(e.pointerId);
    });
    main.addEventListener('pointerup', function (e) {
      if (!swipe) return;
      var dx = e.clientX - swipe.x;
      if (dx <= -50) onNext();
      else if (dx >= 50) onPrev();
      main.classList.remove('is-dragging');
      swipe = null;
    });
    main.addEventListener('pointercancel', function () {
      main.classList.remove('is-dragging');
      swipe = null;
    });
  }

  /* ======================================================================
     모드 A · loop-top (논픽션 방식)
     ====================================================================== */
  function initLoopTop() {
    var COPIES = 3;
    var thumbs = renderThumbs(N * COPIES);
    var pos = N;               // 레일 맨 위 가상 슬라이드 인덱스 (가운데 세트에서 시작)
    var STEP = 153;

    function measure() {
      var t = thumbs[0];
      STEP = t.offsetHeight + parseFloat(getComputedStyle(t).marginBottom);
    }

    function setTranslate(animate) {
      track.classList.toggle('is-animating', !!animate);
      track.style.transform = 'translate3d(0,' + (-pos * STEP) + 'px,0)';
    }

    /* 트랜지션 후 가운데 세트로 순간 이동 (무한 루프) */
    function normalize() {
      var moved = false;
      while (pos < N) { pos += N; moved = true; }
      while (pos >= N * 2) { pos -= N; moved = true; }
      if (moved) setTranslate(false);
    }

    function updateActive() {
      var topV = Math.round(pos);
      thumbs.forEach(function (t, v) {
        t.classList.toggle('is-active', v === topV);
      });
      crossfade(((topV % N) + N) % N);
    }

    var normalizeTimer;
    function goTo(targetV) {
      pos = targetV;
      setTranslate(true);
      updateActive();
      clearTimeout(normalizeTimer);
      normalizeTimer = setTimeout(function () {
        normalize();
        updateActive();
      }, SPEED + 30);
    }

    var drag = null;
    rail.addEventListener('pointerdown', function (e) {
      clearTimeout(normalizeTimer);
      normalize();
      /* pointer capture 이후에는 e.target이 rail로 고정되므로 눌린 섬네일을 미리 기억 */
      drag = { y: e.clientY, startPos: pos, moved: false, pressed: e.target.closest('.gallery__thumb') };
      rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dy = e.clientY - drag.y;
      if (Math.abs(dy) > 5) drag.moved = true;
      if (drag.moved) {
        pos = drag.startPos - dy / STEP;
        setTranslate(false);
      }
    });
    rail.addEventListener('pointerup', function (e) {
      if (!drag) return;
      if (drag.moved) {
        goTo(Math.round(pos));
      } else if (drag.pressed) {
        var v = +drag.pressed.dataset.v;
        if (v !== Math.round(pos)) goTo(v);
      }
      drag = null;
    });
    rail.addEventListener('pointercancel', function () {
      if (drag && drag.moved) goTo(Math.round(pos));
      drag = null;
    });

    bindMainSwipe(
      function () { normalize(); goTo(Math.round(pos) - 1); },
      function () { normalize(); goTo(Math.round(pos) + 1); }
    );

    window.addEventListener('resize', function () {
      measure();
      setTranslate(false);
    });

    measure();
    setTranslate(false);
    updateActive();
  }

  /* ======================================================================
     모드 B · center (루프 없음 + 선택 섬네일 중앙 정렬)
     ====================================================================== */
  function initCenter() {
    var thumbs = renderThumbs(N);
    var current = 0;           // 선택된 실제 인덱스
    var scroll = 0;            // 레일 스크롤 오프셋(px)
    var STEP = 153, SLIDE = 141, railH = 0, maxScroll = 0;

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

    function updateActive() {
      thumbs.forEach(function (t, v) {
        t.classList.toggle('is-active', v === current);
      });
      crossfade(current);
    }

    function select(i) {
      current = Math.min(N - 1, Math.max(0, i));
      setScroll(centerOffset(current), true);
      updateActive();
    }

    var drag = null;
    rail.addEventListener('pointerdown', function (e) {
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
      if (!drag.moved && drag.pressed) {
        var v = +drag.pressed.dataset.v;
        if (v !== current) select(v);
      }
      drag = null;
    });
    rail.addEventListener('pointercancel', function () { drag = null; });

    /* 휠 스크롤: 레일 위에서는 페이지 대신 섬네일 목록을 스크롤 (B 전용).
       선택(활성 섬네일)은 바뀌지 않는다 — 드래그와 동일한 자유 탐색 */
    rail.addEventListener('wheel', function (e) {
      e.preventDefault();
      setScroll(clamp(scroll + e.deltaY), false);
    }, { passive: false });

    bindMainSwipe(
      function () { select(current - 1); },
      function () { select(current + 1); }
    );

    window.addEventListener('resize', function () {
      measure();
      setScroll(centerOffset(current), false);
    });

    measure();
    setScroll(0, false);
    updateActive();
  }

  if (MODE === 'center') initCenter();
  else initLoopTop();
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

/* ==================== 상세 정보 탭 ==================== */
(function () {
  var CONTENTS = [
    '<p>[배송 안내]<br>주문하신 상품은 결제 완료 후 순차적으로 출고되며, 배송은 영업일 기준으로 진행됩니다.<br>배송 기간은 지역 및 택배사 사정에 따라 차이가 있을 수 있습니다.</p><p>[반품 안내]<br>상품 수령 후 일정 기간 내에 반품 신청이 가능하며, 상품은 미사용 상태로 포장되어야 합니다.<br>단순 변심에 의한 반품의 경우 배송비는 고객 부담이며, 상품 하자 또는 오배송의 경우 배송비는 당사에서 부담합니다.</p>',
    '<p>손목, 귀 뒤, 목선 등 맥박이 느껴지는 부위에 가볍게 분사해 주세요.<br>향이 머무는 동안 문지르지 않아야 잔향이 오래 유지됩니다.</p>',
    '<p>화기 및 직사광선을 피해 서늘한 곳에 보관해 주세요.<br>눈에 닿았을 경우 즉시 물로 씻어내고, 이상이 있을 경우 사용을 중단해 주세요.</p>',
    '<p>용량: 50mL / 1.69FL.OZ<br>제조국: 프랑스<br>사용기한: 제조일로부터 36개월</p>'
  ];
  var tabs = document.querySelectorAll('.detail-info__tab');
  var body = document.querySelector('.js-tab-body');
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      body.innerHTML = CONTENTS[i];
    });
  });
})();

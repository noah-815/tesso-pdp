/* ==========================================================================
   Framework E — PDP Mobile · 상품 이미지 캐러셀
   · 전환 트리거 : 스와이프
   · 전환 방식   : 가로 슬라이드 (translateX) — 이전 이미지는 왼쪽으로 밀려나가고
                   다음 이미지가 오른쪽에서 밀려들어옴
   · 루프        : 없음 (첫/마지막은 이어지지 않음)
   · 도트        : 인스타그램식 슬라이딩 인디케이터.
                   4슬롯 창(시안 31px)을 마스크로 두고 트랙 전체가 미끄러진다.
                   진행 방향에 이미지가 더 남아 있으면 활성 도트가 창의 끝이 아니라
                   끝에서 두 번째에 머물고, 창 경계 도트는 4px로 축소(시안 5px/4px),
                   창 밖으로 나가는 도트는 더 작아지며 사라진다 (튀지 않는 연속 모션)
   · 끝단        : 러버밴딩 없음 — 이전/다음 이미지가 없으면 더 끌어도 움직이지 않음
   ========================================================================== */
(function () {
  'use strict';

  /* 데스크톱(carousel.js)과 동일한 14종을 순환해 15장 구성 */
  var ORDER = [
    'thumb-product.png', 'thumb-2.jpg', 'thumb-3.png', 'thumb-product.png', 'thumb-4.jpg',
    'thumb-5.webp', 'thumb-6.webp', 'thumb-7.webp', 'thumb-8.webp', 'thumb-9.webp',
    'thumb-10.webp', 'thumb-11.webp', 'thumb-12.webp', 'thumb-13.webp'
  ];
  var TOTAL = 15;
  var FILES = [];
  for (var i = 0; i < TOTAL; i++) FILES.push(ORDER[i % ORDER.length]);

  var hero = document.querySelector('.js-hero');
  var track = document.querySelector('.js-track');
  var dotsWrap = document.querySelector('.js-dots');
  var dotsTrack = document.querySelector('.js-dots-track');
  if (!hero || !track || !dotsWrap || !dotsTrack) return;

  /* ---------- 렌더 ---------- */
  FILES.forEach(function (file, k) {
    var slide = document.createElement('div');
    slide.className = 'hero__slide';
    var img = document.createElement('img');
    img.src = 'assets/' + file;
    img.alt = '전해질 보충 음료 블러드 오렌지 — 상품 이미지 ' + (k + 1);
    img.draggable = false;
    if (k > 0) img.loading = 'lazy';
    slide.appendChild(img);
    track.appendChild(slide);

    var dot = document.createElement('span');
    dot.className = 'dot';
    dotsTrack.appendChild(dot);
  });

  var slides = track.children;
  var dots = dotsTrack.querySelectorAll('.dot');
  var N = slides.length;

  /* ---------- 상태 ---------- */
  var index = 0;
  var W = hero.clientWidth || 1;

  /* 커밋 판정 */
  var COMMIT_RATIO = 0.2;    // 폭의 20% 이상 끌면 전환
  var FLICK_VEL = 0.5;       // px/ms — 짧고 빠른 스와이프도 전환
  var DIR_LOCK = 8;          // 수평 제스처로 인정하는 최소 이동(px)
  var DIR_RATIO = 1.2;       // |dx| > |dy| × 1.2 이면 수평 우세

  function setX(px, animate) {
    track.classList.toggle('is-animating', !!animate);
    track.style.transform = 'translate3d(' + px + 'px,0,0)';
  }

  /* ---------- 도트 : 인스타그램식 슬라이딩 인디케이터 ----------
     창(4슬롯)은 고정된 마스크이고 트랙 전체가 미끄러진다.
     활성 도트가 창 끝에 닿기 전에 창을 한 칸 미리 옮겨, 진행 방향에 이미지가
     더 남아 있으면 활성이 끝에서 두 번째에 머문다.
     창 밖 도트는 사라지는 대신 작아지며 페이드아웃 → 튀는 느낌이 없다. */
  var WINDOW = 4;
  var winStart = 0;
  var DOT_STEP = 9;                                     /* 도트 5 + 간격 4 */

  function measureDots() {
    if (!dots.length) return;
    var gap = parseFloat(getComputedStyle(dotsTrack).columnGap || getComputedStyle(dotsTrack).gap) || 4;
    DOT_STEP = dots[0].offsetWidth + gap;               /* offsetWidth는 scale의 영향을 받지 않는다 */
  }

  function renderDots() {
    if (N <= WINDOW) {                                  /* 4장 이하면 전부 노출 */
      dotsTrack.style.transform = 'translate3d(0,0,0)';
      for (var j = 0; j < dots.length; j++) {
        dots[j].className = 'dot' + (j === index ? ' is-active' : '');
      }
      return;
    }
    var hi = index - (index > 0 ? 1 : 0);               /* 이전이 남아 있으면 활성은 두 번째 이후 */
    var lo = index - (WINDOW - 1) + (index < N - 1 ? 1 : 0); /* 다음이 남아 있으면 끝에서 두 번째 이전 */
    winStart = Math.max(lo, Math.min(hi, winStart));
    winStart = Math.max(0, Math.min(N - WINDOW, winStart));
    var winEnd = winStart + WINDOW - 1;

    /* 창이 아니라 트랙을 움직인다 — 도트가 미끄러져 들어오고 나간다 */
    dotsTrack.style.transform = 'translate3d(' + (-winStart * DOT_STEP) + 'px,0,0)';

    for (var k = 0; k < dots.length; k++) {
      var d = dots[k];
      if (k < winStart || k > winEnd) { d.className = 'dot is-out'; continue; }
      if (k === index) { d.className = 'dot is-active'; continue; }
      /* 창 경계 너머에 더 있으면 그 경계 도트를 축소 표시 */
      var isEdge = (k === winStart && winStart > 0) || (k === winEnd && winEnd < N - 1);
      d.className = 'dot' + (isEdge ? ' is-small' : '');
    }
  }

  function render(animate) {
    setX(-index * W, animate);
    renderDots();
  }

  /* ---------- 스와이프 ---------- */
  var drag = null;

  hero.addEventListener('pointerdown', function (e) {
    W = hero.clientWidth || 1;
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), locked: false, dx: 0 };
  });

  hero.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    var dy = e.clientY - drag.y;

    if (!drag.locked) {
      if (Math.abs(dx) > DIR_LOCK && Math.abs(dx) > Math.abs(dy) * DIR_RATIO) {
        drag.locked = true;                       /* 수평 확정 후에만 캡처 */
        hero.classList.add('is-dragging');
        try { hero.setPointerCapture(e.pointerId); } catch (_) {}
      } else if (Math.abs(dy) > DIR_LOCK && Math.abs(dy) >= Math.abs(dx)) {
        drag = null;                              /* 세로 스크롤에 양보 */
        return;
      } else {
        return;
      }
    }

    /* 이전/다음 이미지가 없으면 더 끌어도 움직이지 않는다 (러버밴딩 없음) */
    if ((index === 0 && dx > 0) || (index === N - 1 && dx < 0)) dx = 0;
    drag.dx = dx;
    setX(-index * W + dx, false);
  });

  function release() {
    if (!drag) return;
    var wasLocked = drag.locked;
    var dx = drag.dx;
    var dt = Math.max(performance.now() - drag.t, 1);
    hero.classList.remove('is-dragging');

    if (wasLocked) {
      var commit = Math.abs(dx) > W * COMMIT_RATIO || Math.abs(dx) / dt >= FLICK_VEL;
      if (commit) {
        /* 드래그 1회 = 최대 1장, 루프 없음 */
        if (dx < 0 && index < N - 1) index++;
        else if (dx > 0 && index > 0) index--;
      }
      render(true);                               /* 미달·끝단은 제자리 복귀 */
    }
    drag = null;
  }

  hero.addEventListener('pointerup', release);
  hero.addEventListener('pointercancel', release);

  /* 드래그 직후의 클릭은 삼킨다 */
  hero.addEventListener('click', function (e) {
    if (Math.abs((drag && drag.dx) || 0) > 3) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  /* ---------- 초기화 / 리사이즈 ---------- */
  window.addEventListener('resize', function () {
    W = hero.clientWidth || 1;
    measureDots();
    render(false);                                /* 애니메이션 없이 재정렬 */
  });

  measureDots();
  render(false);
})();

/* ==================== 상품 상세 · 더보기 ==================== */
(function () {
  var clip = document.querySelector('.js-detail-clip');
  var btn = document.querySelector('.js-detail-more');
  if (btn && clip) btn.addEventListener('click', function () { clip.classList.add('expanded'); });
})();

/* ==================== 상품 문의 · 아코디언 ==================== */
document.querySelectorAll('.js-inquiry').forEach(function (item) {
  item.querySelector('.info').addEventListener('click', function () {
    item.classList.toggle('is-open');
  });
});

/* ==================== 체크박스 토글 (시각적 데모) ==================== */
document.querySelectorAll('.checkbox-label').forEach(function (label) {
  label.addEventListener('click', function () {
    var box = label.querySelector('.box');
    var on = box.dataset.on === '1';
    box.dataset.on = on ? '' : '1';
    box.style.background = on ? '' : '#111';
    box.style.borderColor = on ? '' : '#111';
  });
});

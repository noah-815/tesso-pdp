/* ==========================================================================
   Framework E — PDP Mobile · 상품 이미지 캐러셀
   · 전환 트리거 : 스와이프
   · 전환 방식   : 가로 슬라이드 (translateX) — 이전 이미지는 왼쪽으로 밀려나가고
                   다음 이미지가 오른쪽에서 밀려들어옴
   · 루프        : 없음 (첫/마지막은 이어지지 않음)
   · 도트        : 최대 4개만 노출. 진행 방향에 이미지가 더 남아 있으면
                   활성 도트가 창의 끝이 아니라 끝에서 두 번째에 머문다
   · 러버밴딩    : iOS UIScrollView와 동일한 곡선
                   f(x) = (1 − 1 / (x·c/W + 1)) · W ,  c = 0.55
                   → 처음엔 55% 따라오다 점점 뻑뻑해지고 컨테이너 폭(W)에 점근
                   (rarify.co 모바일 갤러리 = 네이티브 오버스크롤 바운스와 동일)
   ========================================================================== */
(function () {
  'use strict';

  /* 데스크톱(carousel.js)과 동일하게 원본 순서를 순환해 15장 구성 */
  var ORDER = ['thumb-product.png', 'thumb-2.jpg', 'thumb-3.png', 'thumb-product.png', 'thumb-4.jpg'];
  var TOTAL = 15;
  var FILES = [];
  for (var i = 0; i < TOTAL; i++) FILES.push(ORDER[i % ORDER.length]);

  var hero = document.querySelector('.js-hero');
  var track = document.querySelector('.js-track');
  var dotsWrap = document.querySelector('.js-dots');
  if (!hero || !track || !dotsWrap) return;

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
    dotsWrap.appendChild(dot);
  });

  var slides = track.children;
  var dots = dotsWrap.querySelectorAll('.dot');
  var N = slides.length;

  /* ---------- 상태 ---------- */
  var index = 0;
  var W = hero.clientWidth || 1;

  /* 커밋 판정 */
  var COMMIT_RATIO = 0.2;    // 폭의 20% 이상 끌면 전환
  var FLICK_VEL = 0.5;       // px/ms — 짧고 빠른 스와이프도 전환
  var DIR_LOCK = 8;          // 수평 제스처로 인정하는 최소 이동(px)
  var DIR_RATIO = 1.2;       // |dx| > |dy| × 1.2 이면 수평 우세

  /* iOS 러버밴딩 곡선 — 초기 추종률 0.55, 폭(dim)에 점근 */
  function rubber(over, dim) {
    return (1 - 1 / (over * 0.55 / dim + 1)) * dim;
  }

  function setX(px, animate) {
    track.classList.toggle('is-animating', !!animate);
    track.style.transform = 'translate3d(' + px + 'px,0,0)';
  }

  /* ---------- 도트 : 최대 4개 노출 + 진행 방향 선반영 ----------
     활성 도트가 창의 끝에 닿기 전에 창을 한 칸 미리 옮겨,
     진행 방향에 이미지가 더 남아 있으면 활성이 끝에서 두 번째에 머문다. */
  var WINDOW = 4;
  var winStart = 0;

  function renderDots() {
    if (N <= WINDOW) {                                  /* 4장 이하면 전부 노출 */
      for (var j = 0; j < dots.length; j++) {
        dots[j].classList.remove('is-hidden');
        dots[j].classList.toggle('is-active', j === index);
      }
      return;
    }
    var hi = index - (index > 0 ? 1 : 0);               /* 이전이 남아 있으면 활성은 두 번째 이후 */
    var lo = index - (WINDOW - 1) + (index < N - 1 ? 1 : 0); /* 다음이 남아 있으면 끝에서 두 번째 이전 */
    winStart = Math.max(lo, Math.min(hi, winStart));
    winStart = Math.max(0, Math.min(N - WINDOW, winStart));
    var winEnd = winStart + WINDOW - 1;
    for (var k = 0; k < dots.length; k++) {
      var inWin = k >= winStart && k <= winEnd;
      dots[k].classList.toggle('is-hidden', !inWin);
      dots[k].classList.toggle('is-active', inWin && k === index);
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

    drag.dx = dx;
    var px = -index * W + dx;
    /* 양 끝을 넘어서면 러버밴딩 (이동은 막되 입력은 받아 반응) */
    if (index === 0 && dx > 0) {
      px = -index * W + rubber(dx, W);
    } else if (index === N - 1 && dx < 0) {
      px = -index * W - rubber(-dx, W);
    }
    setX(px, false);
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
    render(false);                                /* 애니메이션 없이 재정렬 */
  });

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

/* ============================================================
   Framework A — Product Detail 공통 스크립트
   (문의 토글 / 상세 더보기 / 스낵바 / 위시리스트·공유 /
    페이지네이션 / 반응형 패널 이동)
   ※ 옵션 셀렉트·우측 아코디언은 정적 표시 (인터랙션 없음)
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 스낵바 ---------- */
  var snackbar = document.querySelector('.snackbar');
  var snackbarTimer = null;
  window.showSnackbar = function (msg, withThumb) {
    if (!snackbar) return;
    snackbar.querySelector('.msg').textContent = msg;
    var thumb = snackbar.querySelector('img.thumb');
    if (thumb) thumb.style.display = withThumb ? 'block' : 'none';
    snackbar.classList.add('is-visible');
    clearTimeout(snackbarTimer);
    snackbarTimer = setTimeout(function () {
      snackbar.classList.remove('is-visible');
    }, 2600);
  };

  /* ---------- 구매 버튼 (데모 피드백만) ---------- */
  var btnCart = document.querySelector('.btn-cart');
  var btnBuy = document.querySelector('.btn-buy');
  if (btnCart) btnCart.addEventListener('click', function () {
    showSnackbar('장바구니에 상품을 담았어요.', true);
  });
  if (btnBuy) btnBuy.addEventListener('click', function () {
    showSnackbar('구매 페이지로 이동합니다. (데모)', false);
  });

  /* ---------- 위시리스트 / 공유 ---------- */
  var wishBtn = document.querySelector('.js-wishlist');
  if (wishBtn) {
    wishBtn.addEventListener('click', function () {
      var img = wishBtn.querySelector('img');
      var on = wishBtn.classList.toggle('is-on');
      img.src = on ? 'assets/icons/wishlistFilled.svg' : 'assets/icons/wishlist.svg';
      showSnackbar(on ? '위시리스트에 저장했어요.' : '위시리스트에서 삭제했어요.', false);
    });
  }
  var shareBtn = document.querySelector('.js-share');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).catch(function () {});
      showSnackbar('링크를 복사했어요.', false);
    });
  }

  /* ---------- 상세 더보기 ---------- */
  var detailClip = document.querySelector('.detail__clip');
  var btnMore = document.querySelector('.btn-more');
  if (btnMore) {
    btnMore.addEventListener('click', function () {
      detailClip.style.maxHeight = detailClip.scrollHeight + 'px';
      requestAnimationFrame(function () {
        detailClip.classList.add('is-open');
        detailClip.style.maxHeight = 'none';
      });
    });
  }

  /* ---------- 문의 아코디언 ---------- */
  document.querySelectorAll('.inquiry-item[data-collapsible]').forEach(function (item) {
    var toggle = item.querySelector('.inquiry-item__toggle');
    toggle.addEventListener('click', function () {
      item.classList.toggle('is-open');
      var q = item.querySelector('.inquiry-item__q');
      if (q) q.classList.toggle('inquiry-item__q--clamp');
    });
  });

  /* ---------- 페이지네이션 (데모) ---------- */
  document.querySelectorAll('.pagination').forEach(function (pg) {
    pg.querySelectorAll('.pagination__page').forEach(function (p) {
      p.addEventListener('click', function () {
        pg.querySelector('.pagination__page.is-active').classList.remove('is-active');
        p.classList.add('is-active');
        var prev = pg.querySelector('.pagination__arrow--prev');
        if (prev) prev.disabled = p.textContent.trim() === '1';
      });
    });
  });

  /* ---------- 반응형: 1024 이하에서 정보 패널을 갤러리 아래로 ---------- */
  var mq = window.matchMedia('(max-width: 1024px)');
  var infoPanel = document.querySelector('.info-panel');
  var colInfo = document.querySelector('.col-info');
  var gallerySection = document.querySelector('.js-gallery-section');

  function relocate() {
    if (!infoPanel || !gallerySection) return;
    if (mq.matches) {
      if (infoPanel.parentNode !== gallerySection.parentNode) {
        gallerySection.after(infoPanel);
      }
    } else if (infoPanel.parentNode !== colInfo) {
      colInfo.appendChild(infoPanel);
    }
  }
  mq.addEventListener ? mq.addEventListener('change', relocate) : mq.addListener(relocate);
  relocate();
})();

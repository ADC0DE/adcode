/* SNS works (design-sns.html, design-detail.html)
   - Desktop/tablet (≥761): static grid (CSS)
   - Mobile (≤760): Swiper 1-slide loop
*/
(function () {
  const mqMobile = window.matchMedia('(max-width: 760px)');
  const swiperRoot = document.querySelector('.sns-works-swiper');
  if (!swiperRoot) return;

  let swiper = null;

  function enableSwiper() {
    if (swiper || typeof Swiper === 'undefined') return;
    swiper = new Swiper(swiperRoot, {
      slidesPerView: 1,
      spaceBetween: 14,
      loop: true,
      speed: 450,
      grabCursor: true,
      watchOverflow: true,
      pagination: {
        el: swiperRoot.querySelector('.sns-works-pagination'),
        clickable: true,
      },
    });
  }

  function disableSwiper() {
    if (!swiper) return;
    swiper.destroy(true, true);
    swiper = null;
  }

  function sync() {
    if (mqMobile.matches) {
      disableSwiper();
      enableSwiper();
    } else {
      disableSwiper();
    }
  }

  function onChange() {
    sync();
  }

  if (typeof mqMobile.addEventListener === 'function') {
    mqMobile.addEventListener('change', onChange);
  } else {
    mqMobile.addListener(onChange);
  }

  sync();
})();

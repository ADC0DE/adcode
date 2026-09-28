/* SNS works (design-sns.html, design-detail.html)
   - Desktop/tablet (≥761): static grid (CSS)
   - Mobile (≤760): Swiper 1-slide loop
*/
(function () {
  const mqMobile = window.matchMedia('(max-width: 760px)');
  const swiperRoot = document.querySelector('.sns-works-swiper');
  if (!swiperRoot) return;

  let swiper = null;
  const grid = swiperRoot.querySelector('.sns-works-grid');
  const moreCards = grid ? [...grid.querySelectorAll('.sns-card--more')] : [];
  const moreBtn = document.getElementById('snsWorksMore');
  const moreFoot = moreBtn ? moreBtn.closest('.sns-works-more-foot') : null;
  const parked = document.createDocumentFragment();

  moreCards.forEach((card) => parked.appendChild(card));

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

  let revealed = false;

  function revealMore() {
    if (revealed || !grid || !moreCards.length) return;
    revealed = true;
    if (mqMobile.matches) disableSwiper();
    moreCards.forEach((card) => {
      card.hidden = false;
      card.classList.add('reveal');
      grid.appendChild(card);
    });
    if (moreFoot) moreFoot.hidden = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        moreCards.forEach((card) => card.classList.add('in-view'));
      });
    });
    if (mqMobile.matches) enableSwiper();
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

  if (moreBtn) {
    moreBtn.addEventListener('click', revealMore);
  }
})();

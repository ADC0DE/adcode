/* Magazine channels
   - PC (≥1101): 2-row infinite marquee (4 + 4, opposite directions)
   - Tablet (761–1100): static 2-col grid
   - Mobile (≤760): Swiper 1-slide loop
*/
(function () {
  const mqMobile = window.matchMedia('(max-width: 760px)');
  const mqPc = window.matchMedia('(min-width: 1101px)');
  const section = document.querySelector('.mag-channels');
  const swiperRoot = document.querySelector('.mag-channels-swiper');
  const marquee = document.querySelector('.mag-channels-marquee');
  if (!section || !swiperRoot || !marquee) return;

  const sourceSlides = [...swiperRoot.querySelectorAll('.mag-channels-item')];
  const tracks = [
    marquee.querySelector('[data-mag-track="0"]'),
    marquee.querySelector('[data-mag-track="1"]'),
  ];
  if (!tracks[0] || !tracks[1] || sourceSlides.length < 8) return;

  let swiper = null;
  let marqueeReady = false;

  function fillMarquee() {
    if (marqueeReady) return;
    const rows = [sourceSlides.slice(0, 4), sourceSlides.slice(4, 8)];
    rows.forEach((items, i) => {
      const track = tracks[i];
      track.innerHTML = '';
      // 원본 1세트 + 복제 1세트 → -50% 루프
      [0, 1].forEach(() => {
        items.forEach((item) => {
          const clone = item.cloneNode(true);
          clone.classList.remove('swiper-slide');
          clone.removeAttribute('role');
          clone.removeAttribute('aria-label');
          track.appendChild(clone);
        });
      });
    });
    marqueeReady = true;
  }

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
        el: swiperRoot.querySelector('.mag-channels-pagination'),
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
      marquee.setAttribute('aria-hidden', 'true');
      disableSwiper();
      enableSwiper();
      return;
    }

    disableSwiper();

    if (mqPc.matches) {
      fillMarquee();
      marquee.setAttribute('aria-hidden', 'false');
    } else {
      marquee.setAttribute('aria-hidden', 'true');
    }
  }

  function onChange() {
    sync();
  }

  if (typeof mqMobile.addEventListener === 'function') {
    mqMobile.addEventListener('change', onChange);
    mqPc.addEventListener('change', onChange);
  } else {
    mqMobile.addListener(onChange);
    mqPc.addListener(onChange);
  }

  sync();
})();

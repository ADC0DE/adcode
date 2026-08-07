/* Magazine channels
   - Desktop/tablet (≥761): static grid (CSS)
   - Mobile (≤760): Swiper 1-slide loop
   - Optional: #magChannelsMore loads +8 from /public/main/add per click (×2)
*/
(function () {
  const mqMobile = window.matchMedia('(max-width: 760px)');
  const swiperRoot = document.querySelector('.mag-channels-swiper');
  if (!swiperRoot) return;

  const grid = swiperRoot.querySelector('.mag-channels-grid');
  const moreBtn = document.getElementById('magChannelsMore');
  const moreFoot = moreBtn && moreBtn.closest('.mag-channels-foot');

  let swiper = null;

  const MORE_ITEMS = [
    { file: '매거진 목업_01_몬도 매거진.png', alt: '몬도 매거진' },
    { file: '매거진 목업_02_오르비안매거진.png', alt: '오르비안매거진' },
    { file: '매거진 목업_03_세모트.png', alt: '세모트' },
    { file: '매거진 목업_04_트렌드 레터.png', alt: '트렌드 레터' },
    { file: '매거진 목업_05_케이나우.png', alt: '케이나우' },
    { file: '매거진 목업_06_컬쳐픽.png', alt: '컬쳐픽' },
    { file: '매거진 목업_07_컬쳐인덱스.png', alt: '컬쳐인덱스' },
    { file: '매거진 목업_08_팝버스 매거진.png', alt: '팝버스 매거진' },
    { file: '매거진 목업_09_모티브 매거진.png', alt: '모티브 매거진' },
    { file: '매거진 목업_10_컬트립 매거진.png', alt: '컬트립 매거진' },
    { file: '매거진 목업_11_프리즘 씨네.png', alt: '프리즘 씨네' },
    { file: '매거진 목업_12_픽스피어 매거진.png', alt: '픽스피어 매거진' },
    { file: '매거진 목업_13_XP 매거진.png', alt: 'XP 매거진' },
    { file: '매거진 목업_14_플릭스톤.png', alt: '플릭스톤' },
    { file: '매거진 목업_15_찹떡맨.png', alt: '찹떡맨' },
    { file: '매거진 목업_16_이사님 키우기.png', alt: '이사님 키우기' },
  ];

  const BATCH = 8;
  let shown = 0;

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
      disableSwiper();
      enableSwiper();
    } else {
      disableSwiper();
    }
  }

  function onChange() {
    sync();
  }

  function makeItem(item, delay) {
    const el = document.createElement('div');
    el.className = 'swiper-slide mag-channels-item mag-channels-item--more reveal in-view';
    el.setAttribute('data-delay', String(delay));

    const img = document.createElement('img');
    img.src = '/public/main/add/' + encodeURIComponent(item.file);
    img.alt = item.alt;
    img.loading = 'lazy';
    img.draggable = false;

    el.appendChild(img);
    return el;
  }

  function loadMore() {
    if (!grid || shown >= MORE_ITEMS.length) return;

    const batch = MORE_ITEMS.slice(shown, shown + BATCH);
    const wasMobile = mqMobile.matches;

    if (wasMobile) disableSwiper();

    batch.forEach((item, i) => {
      grid.appendChild(makeItem(item, (i % 8) + 1));
    });

    shown += batch.length;

    if (wasMobile) enableSwiper();

    if (shown >= MORE_ITEMS.length && moreFoot) {
      moreFoot.hidden = true;
    }
  }

  if (typeof mqMobile.addEventListener === 'function') {
    mqMobile.addEventListener('change', onChange);
  } else {
    mqMobile.addListener(onChange);
  }

  sync();

  if (moreBtn) {
    moreBtn.addEventListener('click', loadMore);
  }
})();

/* Magazine channels
   - Desktop/tablet (≥761): static grid + VIEW MORE (+8 × 2)
   - Mobile (≤760): Swiper — 24개 전부 노출, 더보기 버튼 숨김
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
    { file: '매거진 목업_01_몬도 매거진.png', alt: '몬도 매거진', href: 'https://www.instagram.com/mondo__magazine/' },
    { file: '매거진 목업_02_오르비안매거진.png', alt: '오르비안매거진', href: 'https://www.instagram.com/orvian_magazine/' },
    { file: '매거진 목업_03_세모트.png', alt: '세모트', href: 'https://www.instagram.com/se__mot__/' },
    { file: '매거진 목업_04_트렌드 레터.png', alt: '트렌드 레터', href: 'https://www.instagram.com/trend_letter_/' },
    { file: '매거진 목업_05_케이나우.png', alt: '케이나우', href: 'https://www.instagram.com/k___now_/' },
    { file: '매거진 목업_06_컬쳐픽.png', alt: '컬쳐픽', href: 'https://www.instagram.com/culture_pick/' },
    { file: '매거진 목업_07_컬쳐인덱스.png', alt: '컬쳐인덱스', href: 'https://www.instagram.com/culture_index_/' },
    { file: '매거진 목업_08_팝버스 매거진.png', alt: '팝버스 매거진', href: 'https://www.instagram.com/popverse_mag/' },
    { file: '매거진 목업_09_모티브 매거진.png', alt: '모티브 매거진', href: 'https://www.instagram.com/motif_mag_/' },
    { file: '매거진 목업_10_컬트립 매거진.png', alt: '컬트립 매거진', href: 'https://www.instagram.com/cultrip_mag/' },
    { file: '매거진 목업_11_프리즘 씨네.png', alt: '프리즘 씨네', href: 'https://www.instagram.com/prism_cine/' },
    { file: '매거진 목업_12_픽스피어 매거진.png', alt: '픽스피어 매거진', href: 'https://www.instagram.com/picksphere_mag/' },
    { file: '매거진 목업_13_XP 매거진.png', alt: 'XP 매거진', href: 'https://www.instagram.com/xpmagazine_/' },
    { file: '매거진 목업_14_플릭스톤.png', alt: '플릭스톤', href: 'https://www.instagram.com/flix.tone/' },
    { file: '매거진 목업_15_찹떡맨.png', alt: '찹떡맨', href: 'https://www.instagram.com/chapddukman/' },
    { file: '매거진 목업_16_이사님 키우기.png', alt: '이사님 키우기', href: 'https://www.instagram.com/24levelup/' },
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
        dynamicBullets: true,
        dynamicMainBullets: 3,
      },
    });
  }

  function disableSwiper() {
    if (!swiper) return;
    swiper.destroy(true, true);
    swiper = null;
  }

  function makeItem(item, delay) {
    const el = document.createElement('a');
    el.className = 'swiper-slide mag-channels-item mag-channels-item--more reveal in-view';
    el.href = item.href;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
    el.setAttribute('data-delay', String(delay));

    const img = document.createElement('img');
    img.src = '/public/main/add/' + encodeURIComponent(item.file);
    img.alt = item.alt;
    img.loading = 'lazy';
    img.draggable = false;

    el.appendChild(img);
    return el;
  }

  function batchLeadCount() {
    if (mqMobile.matches) return 0;
    if (window.matchMedia('(max-width: 1100px)').matches) return 2;
    return 4;
  }

  function appendMore(count) {
    if (!grid || !moreBtn || shown >= MORE_ITEMS.length) return 0;

    const batch = MORE_ITEMS.slice(shown, shown + count);
    const lead = batchLeadCount();
    batch.forEach((item, i) => {
      const el = makeItem(item, (i % 8) + 1);
      if (i < lead) el.classList.add('mag-channels-item--more-lead');
      grid.appendChild(el);
    });
    shown += batch.length;
    return batch.length;
  }

  function updateMoreFoot() {
    if (!moreFoot) return;
    moreFoot.hidden = mqMobile.matches || shown >= MORE_ITEMS.length;
  }

  function scrollToNewStart(el) {
    if (!el) return;
    // fixed GNB 여유 + 추가 구간 시작이 바로 보이게
    const offset = 96;
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  function loadMore() {
    if (mqMobile.matches) return;

    const startIndex = grid.children.length;
    const added = appendMore(BATCH);
    updateMoreFoot();
    if (!added) return;

    // 레이아웃(리드 마진 등) 반영 후 추가 구간 시작점으로 스크롤
    requestAnimationFrame(() => {
      scrollToNewStart(grid.children[startIndex]);
    });
  }

  function sync() {
    if (mqMobile.matches) {
      disableSwiper();
      appendMore(MORE_ITEMS.length - shown);
      updateMoreFoot();
      enableSwiper();
    } else {
      disableSwiper();
      updateMoreFoot();
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

  if (moreBtn) {
    moreBtn.addEventListener('click', loadMore);
  }
})();

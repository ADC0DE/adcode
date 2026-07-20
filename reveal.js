/* scroll-reveal — 뷰포트 진입 시마다 .in-view 토글 (스크롤할 때마다 반복) */
(function () {
  if (!('IntersectionObserver' in window)) return;

  function bindReveal(selector, options) {
    document.querySelectorAll(selector).forEach((el) => {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('in-view', entry.isIntersecting);
        });
      }, options);
      io.observe(el);
    });
  }

  bindReveal('.reveal:not(.reveal-late)', {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px',
  });

  bindReveal('.reveal-late', {
    threshold: 0.5,
  });
})();

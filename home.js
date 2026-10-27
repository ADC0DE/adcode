(function () {
  document.querySelectorAll('.home-service__rail-item[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('[data-open-contact]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (el.closest('.rail') && window.matchMedia('(max-width: 760px)').matches) {
        window.location.href = 'tel:0537216061';
        return;
      }
      window.__openModal?.('modal-contact');
    });
  });

  if (window.location.hash === '#contact') {
    window.__openModal?.('modal-contact');
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }

  const valueAccent = document.querySelector('[data-home-value-accent]');
  const valueTabs = document.querySelectorAll('.home-value__tab[data-value-phrase]');
  if (valueAccent && valueTabs.length) {
    valueTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const phrase = tab.getAttribute('data-value-phrase');
        if (!phrase) return;

        valueAccent.textContent = phrase;
        valueTabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
      });
    });
  }
})();

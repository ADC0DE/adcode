(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function observeSection(el, { onEnter, onLeave, threshold = 0.2, rootMargin = '0px 0px -8% 0px' } = {}) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      onEnter?.();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) onEnter?.();
          else onLeave?.();
        });
      },
      { threshold, rootMargin }
    );
    io.observe(el);
  }

  const heroSection = document.querySelector('.home-hero');
  const heroWordEl = document.querySelector('[data-home-hero-word]');
  const heroWords = ['BRANDS', 'IDEAS', 'CULTURE', 'TRENDS'];
  let heroWordIndex = 0;
  let heroWordTimer = null;

  /* Hero 이미지 좌측선 → GNB BRAND PACKAGE 텍스트 끝 */
  const syncHeroSplit = () => {
    if (!heroSection) return;
    if (window.matchMedia('(max-width: 1100px)').matches) {
      heroSection.style.removeProperty('--home-hero-split');
      return;
    }
    const brandLink = document.querySelector('.gnb .nav > .nav-item:first-child > a');
    if (!brandLink || getComputedStyle(brandLink).display === 'none') {
      heroSection.style.removeProperty('--home-hero-split');
      return;
    }
    const right = Math.round(brandLink.getBoundingClientRect().right);
    if (right < 120) {
      heroSection.style.removeProperty('--home-hero-split');
      return;
    }
    heroSection.style.setProperty(
      '--home-hero-split',
      `${right}px minmax(0, 1fr)`
    );
  };
  syncHeroSplit();
  window.addEventListener('resize', syncHeroSplit);
  if (document.fonts?.ready) {
    document.fonts.ready.then(syncHeroSplit);
  }

  const stopHeroWordCycle = () => {
    if (heroWordTimer) {
      window.clearInterval(heroWordTimer);
      heroWordTimer = null;
    }
  };

  const startHeroWordCycle = () => {
    if (reducedMotion || !heroWordEl || heroWordTimer) return;
    const heroWordHoldMs = 2200;
    const heroWordAnimMs = 360;

    const swapHeroWord = () => {
      const nextIndex = (heroWordIndex + 1) % heroWords.length;
      heroWordEl.dataset.nextWord = heroWords[nextIndex];
      heroWordEl.classList.add('is-changing');

      window.setTimeout(() => {
        heroWordIndex = nextIndex;
        heroWordEl.classList.add('is-resetting');
        heroWordEl.textContent = heroWords[heroWordIndex];
        heroWordEl.classList.remove('is-changing');
        delete heroWordEl.dataset.nextWord;
        void heroWordEl.offsetWidth;
        heroWordEl.classList.remove('is-resetting');
      }, heroWordAnimMs);
    };

    heroWordTimer = window.setInterval(swapHeroWord, heroWordHoldMs);
  };

  if (heroSection) {
    observeSection(heroSection, {
      threshold: 0.25,
      onEnter: () => {
        heroSection.classList.add('is-section-in-view');
        startHeroWordCycle();
      },
      onLeave: () => {
        heroSection.classList.remove('is-section-in-view');
        stopHeroWordCycle();
      },
    });
  }

  const aboutSection = document.getElementById('about');
  const aboutTitleBlock = document.querySelector('[data-home-about-title]');
  if (aboutTitleBlock && aboutSection) {
    if (reducedMotion) {
      aboutTitleBlock.classList.add('is-title-in-view');
    } else {
      observeSection(aboutSection, {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px',
        onEnter: () => aboutTitleBlock.classList.add('is-title-in-view'),
        onLeave: () => aboutTitleBlock.classList.remove('is-title-in-view'),
      });
    }
  }

  const serviceRail = document.querySelector('[data-home-service-rail]');
  const serviceLinks = serviceRail
    ? [...serviceRail.querySelectorAll('.home-service__rail-item[data-service-section]')]
    : [];
  const serviceSections = serviceLinks
    .map((link) => document.getElementById(link.getAttribute('data-service-section')))
    .filter(Boolean);
  const serviceIndicator = serviceRail?.querySelector('.home-service__rail-indicator');
  const servicesRoot = document.querySelector('.home-services');
  let activeServiceId = '';

  const isServiceRailMobile = () => window.matchMedia('(max-width: 1100px)').matches;

  /* 좌측 메뉴는 첫 섹션 설명 높이에서 시작하고, 스크롤 중 일정한 위치에 고정 */
  const syncServiceRailAlign = () => {
    if (!serviceRail) return;
    if (isServiceRailMobile()) {
      serviceRail.style.removeProperty('--home-service-rail-shift');
      serviceRail.style.removeProperty('--home-service-rail-sticky');
      return;
    }

    const firstSection = serviceSections[0];
    if (!firstSection) return;

    const firstDesc = firstSection.querySelector('.home-desc');
    if (!firstDesc) return;

    /* margin-top: 첫 섹션(VIRAL) 문서 흐름 기준 */
    const firstShift = Math.max(
      0,
      Math.round(firstDesc.getBoundingClientRect().top - firstSection.getBoundingClientRect().top)
    );
    serviceRail.style.setProperty('--home-service-rail-shift', `${firstShift}px`);
    serviceRail.style.removeProperty('--home-service-rail-sticky');
  };
  syncServiceRailAlign();
  window.addEventListener('resize', () => syncServiceRailAlign());
  if (document.fonts?.ready) document.fonts.ready.then(() => syncServiceRailAlign());

  const moveServiceIndicator = (link) => {
    if (!serviceIndicator || !serviceRail || !link) return;
    const railRect = serviceRail.getBoundingClientRect();
    const itemRect = link.getBoundingClientRect();
    if (isServiceRailMobile()) {
      const x = itemRect.left - railRect.left;
      const y = itemRect.bottom - railRect.top - 2;
      serviceIndicator.style.transform = `translate(${x}px, ${y}px)`;
    } else {
      const y = itemRect.top - railRect.top + itemRect.height / 2 - 1;
      serviceIndicator.style.transform = `translate(0px, ${y}px)`;
    }
    serviceRail.classList.add('is-indicator-ready');
  };

  const setServiceActive = (sectionId) => {
    if (!sectionId || activeServiceId === sectionId) return;
    activeServiceId = sectionId;
    serviceLinks.forEach((link) => {
      const match = link.getAttribute('data-service-section') === sectionId;
      link.classList.toggle('is-active', match);
      if (match) {
        link.setAttribute('aria-current', 'true');
        moveServiceIndicator(link);
      } else {
        link.removeAttribute('aria-current');
      }
    });
    syncServiceRailAlign();
  };

  const resolveServiceSection = () => {
    if (!serviceSections.length) return;
    const probe = window.innerHeight * 0.4;
    let bestId = null;
    let bestScore = Infinity;
    serviceSections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      const anchor = rect.top + rect.height * 0.32;
      const score = Math.abs(anchor - probe);
      if (score < bestScore) {
        bestScore = score;
        bestId = sec.id;
      }
    });
    if (bestId) setServiceActive(bestId);
  };

  if (serviceRail && serviceSections.length) {
    serviceLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href?.startsWith('#')) return;
        const el = document.querySelector(href);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    let serviceRailTick = false;
    const syncServiceRail = () => {
      if (serviceRailTick) return;
      serviceRailTick = true;
      requestAnimationFrame(() => {
        if (servicesRoot) {
          const servicesRect = servicesRoot.getBoundingClientRect();
          const isOutside =
            servicesRect.top >= window.innerHeight ||
            servicesRect.bottom <= window.innerHeight * 0.4;
          serviceRail.classList.toggle('is-outside', isOutside);
        }
        resolveServiceSection();
        syncServiceRailAlign();
        const link =
          serviceLinks.find((l) => l.getAttribute('data-service-section') === activeServiceId) ||
          serviceLinks[0];
        moveServiceIndicator(link);
        serviceRailTick = false;
      });
    };

    requestAnimationFrame(syncServiceRail);
    window.addEventListener('scroll', syncServiceRail, { passive: true });
    window.addEventListener('resize', syncServiceRail);
  }

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

  function easeOutQuart(t) {
    return 1 - (1 - t) ** 4;
  }

  function formatHomeCount(value, el) {
    const suffix = el.getAttribute('data-count-suffix') || '';
    const format = el.getAttribute('data-count-format');
    const text = format === 'comma' ? value.toLocaleString('en-US') : String(value);
    return `${text}${suffix}`;
  }

  function cancelHomeCountUp(el) {
    if (el._countDelay) {
      window.clearTimeout(el._countDelay);
      el._countDelay = null;
    }
    if (el._countRaf) {
      cancelAnimationFrame(el._countRaf);
      el._countRaf = null;
    }
  }

  function resetHomeCountUp(el) {
    cancelHomeCountUp(el);
    el.textContent = formatHomeCount(0, el);
  }

  function runHomeCountUp(el, { delay = 0 } = {}) {
    const to = Number(el.getAttribute('data-count-to'));
    if (!Number.isFinite(to)) return;

    cancelHomeCountUp(el);

    const duration = 2200;
    const startCount = () => {
      const startAt = performance.now();
      el.textContent = formatHomeCount(0, el);

      const tick = (now) => {
        const progress = Math.min((now - startAt) / duration, 1);
        const value = Math.round(easeOutQuart(progress) * to);
        el.textContent = formatHomeCount(value, el);
        if (progress < 1) {
          el._countRaf = requestAnimationFrame(tick);
        } else {
          el.textContent = formatHomeCount(to, el);
          el._countRaf = null;
        }
      };

      el._countRaf = requestAnimationFrame(tick);
    };

    if (delay > 0) el._countDelay = window.setTimeout(startCount, delay);
    else startCount();
  }

  const worksSection = document.getElementById('works');
  const worksStatsBlock = document.querySelector('[data-home-works-stats]');
  const worksCollage = document.querySelector('[data-home-works-collage]');
  const worksStatValues = document.querySelectorAll('[data-home-works-stats] [data-count-to]');

  if (worksCollage && worksSection) {
    observeSection(worksSection, {
      threshold: 0.18,
      onEnter: () => worksCollage.classList.add('is-collage-in-view'),
      onLeave: () => worksCollage.classList.remove('is-collage-in-view'),
    });
  }

  if (worksStatsBlock && worksStatValues.length) {
    const playWorksCountUp = () => {
      if (reducedMotion) return;
      worksStatValues.forEach((el) => resetHomeCountUp(el));
      requestAnimationFrame(() => {
        worksStatValues.forEach((el, index) => {
          runHomeCountUp(el, { delay: index * 140 });
        });
      });
    };

    const resetWorksCountUp = () => {
      if (reducedMotion) return;
      worksStatValues.forEach((el) => resetHomeCountUp(el));
    };

    /* 통계 영역 기준 — Works 전체가 화면에 남아 있어도 재진입 시 매번 카운트 */
    observeSection(worksStatsBlock, {
      threshold: 0.45,
      rootMargin: '0px 0px -12% 0px',
      onEnter: playWorksCountUp,
      onLeave: resetWorksCountUp,
    });
  }

  const valueAccent = document.querySelector('[data-home-value-accent]');
  const valueTabsRoot = document.querySelector('[data-home-value-tabs]');
  const valueTabs = valueTabsRoot
    ? [...valueTabsRoot.querySelectorAll('.home-value__tab[data-value-phrase]')]
    : [];
  const valueIndicator = valueTabsRoot?.querySelector('.home-value__tab-indicator');
  const valueSection = document.querySelector('.home-value');

  if (valueAccent && valueTabs.length && valueTabsRoot) {
    let valueIndex = Math.max(
      0,
      valueTabs.findIndex((tab) => tab.classList.contains('is-active'))
    );
    let valueCycleTimer = null;
    const valueHoldMs = 2600;
    const valueAnimMs = 450;
    let valueTransitionLock = false;

    const moveValueIndicator = (tab) => {
      if (!valueIndicator || !tab) return;
      const rootRect = valueTabsRoot.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      valueIndicator.style.width = `${tabRect.width}px`;
      valueIndicator.style.height = `${tabRect.height}px`;
      valueIndicator.style.transform = `translate(${tabRect.left - rootRect.left}px, ${tabRect.top - rootRect.top}px)`;
      valueTabsRoot.classList.add('is-indicator-ready');
    };

    const renderValuePhrase = (phrase, target = valueAccent) => {
      const suffix = phrase.endsWith('으로') ? '으로' : phrase.endsWith('로') ? '로' : '';
      const keyword = suffix ? phrase.slice(0, -suffix.length) : phrase;
      target.textContent = keyword;
      if (suffix) {
        const suffixEl = document.createElement('span');
        suffixEl.className = 'home-value__phrase-suffix';
        suffixEl.textContent = suffix;
        target.appendChild(suffixEl);
      }
    };

    const setValueActive = (index, { animatePhrase = true } = {}) => {
      const tab = valueTabs[index];
      if (!tab) return;
      const phrase = tab.getAttribute('data-value-phrase');
      if (!phrase) return;

      valueIndex = index;
      valueTabs.forEach((t, i) => {
        const active = i === index;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      moveValueIndicator(tab);

      if (!animatePhrase || reducedMotion) {
        renderValuePhrase(phrase);
        valueAccent.classList.remove('is-leaving', 'is-resetting');
        return;
      }

      if (valueAccent.textContent === phrase) return;

      valueTransitionLock = true;
      const incomingPhrase = document.createElement('span');
      incomingPhrase.className = 'accent home-value__phrase-word home-value__phrase-word--incoming';
      incomingPhrase.setAttribute('aria-hidden', 'true');
      renderValuePhrase(phrase, incomingPhrase);
      valueAccent.parentElement.appendChild(incomingPhrase);
      void incomingPhrase.offsetWidth;

      valueAccent.classList.add('is-leaving');
      incomingPhrase.classList.add('is-active');
      window.setTimeout(() => {
        renderValuePhrase(phrase);
        valueAccent.classList.add('is-resetting');
        valueAccent.classList.remove('is-leaving');
        incomingPhrase.remove();
        void valueAccent.offsetWidth;
        valueAccent.classList.remove('is-resetting');
        valueTransitionLock = false;
      }, valueAnimMs);
    };

    const stepValueCycle = () => {
      if (valueTransitionLock) return;
      setValueActive((valueIndex + 1) % valueTabs.length);
    };

    const startValueCycle = () => {
      if (reducedMotion || valueCycleTimer) return;
      valueCycleTimer = window.setInterval(stepValueCycle, valueHoldMs);
    };

    const stopValueCycle = () => {
      if (!valueCycleTimer) return;
      window.clearInterval(valueCycleTimer);
      valueCycleTimer = null;
    };

    const syncValueIndicator = () => moveValueIndicator(valueTabs[valueIndex]);

    valueTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        stopValueCycle();
        setValueActive(index);
        startValueCycle();
      });
    });

    requestAnimationFrame(() => {
      setValueActive(valueIndex, { animatePhrase: false });
      syncValueIndicator();
    });

    window.addEventListener('resize', syncValueIndicator);

    if (valueSection) {
      observeSection(valueSection, {
        threshold: 0.25,
        onEnter: startValueCycle,
        onLeave: stopValueCycle,
      });
    } else {
      startValueCycle();
    }
  }
})();

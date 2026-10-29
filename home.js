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
    const heroWordHoldMs = 2600;
    const heroWordAnimMs = 450;

    const swapHeroWord = () => {
      heroWordEl.classList.add('is-leaving');
      window.setTimeout(() => {
        heroWordIndex = (heroWordIndex + 1) % heroWords.length;
        heroWordEl.textContent = heroWords[heroWordIndex];
        heroWordEl.classList.remove('is-leaving');
        heroWordEl.classList.add('is-entering');
        void heroWordEl.offsetWidth;
        heroWordEl.classList.remove('is-entering');
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
  let activeServiceId = '';

  const isServiceRailMobile = () => window.matchMedia('(max-width: 1100px)').matches;

  /* 시안: 좌측 메뉴 상단 = 활성 섹션 설명 문구 상단 (VIRAL/SNS/DESIGN 공통) */
  const syncServiceRailAlign = (sectionId) => {
    if (!serviceRail) return;
    if (isServiceRailMobile()) {
      serviceRail.style.removeProperty('--home-service-rail-shift');
      serviceRail.style.removeProperty('--home-service-rail-sticky');
      return;
    }

    const firstSection = serviceSections[0];
    const activeSection =
      (sectionId && document.getElementById(sectionId)) ||
      (activeServiceId && document.getElementById(activeServiceId)) ||
      firstSection;
    if (!firstSection || !activeSection) return;

    const firstDesc = firstSection.querySelector('.home-desc');
    const activeDesc = activeSection.querySelector('.home-desc');
    if (!firstDesc || !activeDesc) return;

    /* margin-top: 첫 섹션(VIRAL) 문서 흐름 기준 */
    const firstShift = Math.max(
      0,
      Math.round(firstDesc.getBoundingClientRect().top - firstSection.getBoundingClientRect().top)
    );
    serviceRail.style.setProperty('--home-service-rail-shift', `${firstShift}px`);

    /* sticky: 현재 보이는 섹션의 설명 문구 viewport Y에 고정 → VIRAL/SNS/DESIGN 모두 동일 */
    const descTop = Math.round(activeDesc.getBoundingClientRect().top);
    const sectionRect = activeSection.getBoundingClientRect();
    const inView = sectionRect.bottom > 120 && sectionRect.top < window.innerHeight - 80;
    if (inView && descTop > 0) {
      serviceRail.style.setProperty('--home-service-rail-sticky', `${descTop}px`);
    } else {
      const fallback = Math.max(
        0,
        Math.round(activeDesc.getBoundingClientRect().top - activeSection.getBoundingClientRect().top)
      );
      serviceRail.style.setProperty('--home-service-rail-sticky', `${fallback}px`);
    }
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
    syncServiceRailAlign(sectionId);
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
        resolveServiceSection();
        syncServiceRailAlign(activeServiceId);
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
  const worksFallStage = worksCollage?.querySelector('[data-works-fall]');
  const worksStatValues = document.querySelectorAll('[data-home-works-stats] [data-count-to]');
  const worksCards = worksFallStage
    ? [...worksFallStage.querySelectorAll('.home-works__card')]
    : [];
  let worksFallTimer = 0;
  let worksFallActive = false;
  let worksFallLayoutIdx = 0;
  const worksFallAnims = [];

  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  /* 시안처럼 겹치고 기울어진 콜라주 자리 (정규화 좌표) */
  const worksCollageLayouts = [
    [
      { x: 0.02, y: 0.0, w: 0.38, rot: -7, z: 2 },
      { x: 0.34, y: 0.06, w: 0.44, rot: 2, z: 5 },
      { x: 0.58, y: -0.04, w: 0.36, rot: 6, z: 3 },
      { x: 0.0, y: 0.4, w: 0.4, rot: -3, z: 4 },
      { x: 0.42, y: 0.36, w: 0.38, rot: 4, z: 3 },
      { x: 0.22, y: 0.22, w: 0.34, rot: -5, z: 1 },
    ],
    [
      { x: 0.1, y: -0.06, w: 0.36, rot: 5, z: 2 },
      { x: 0.4, y: 0.02, w: 0.42, rot: -2, z: 5 },
      { x: 0.62, y: 0.12, w: 0.34, rot: -6, z: 3 },
      { x: -0.02, y: 0.3, w: 0.38, rot: 3, z: 4 },
      { x: 0.28, y: 0.38, w: 0.4, rot: -4, z: 3 },
      { x: 0.52, y: 0.42, w: 0.36, rot: 7, z: 2 },
    ],
    [
      { x: 0.0, y: 0.08, w: 0.4, rot: -5, z: 3 },
      { x: 0.3, y: -0.02, w: 0.4, rot: 3, z: 4 },
      { x: 0.55, y: 0.04, w: 0.42, rot: -2, z: 5 },
      { x: 0.08, y: 0.36, w: 0.36, rot: 6, z: 2 },
      { x: 0.38, y: 0.34, w: 0.38, rot: -3, z: 3 },
      { x: 0.6, y: 0.4, w: 0.34, rot: 4, z: 1 },
    ],
  ];

  const clearWorksFall = () => {
    if (worksFallTimer) {
      window.clearTimeout(worksFallTimer);
      worksFallTimer = 0;
    }
    worksFallAnims.splice(0).forEach((anim) => {
      try {
        anim.cancel();
      } catch (_) {}
    });
    worksCards.forEach((card) => {
      card.getAnimations?.().forEach((a) => a.cancel());
      card.style.opacity = '0';
      card.style.transform = '';
      card.style.filter = 'none';
      card.style.left = '';
      card.style.top = '';
      card.style.zIndex = '';
      card.style.width = '';
    });
  };

  /* 위에서 시안형 콜라주 자리로 낙하 — 흐림 없이 또렷하게, 1회만 */
  const runWorksFallCycle = () => {
    if (!worksFallStage || !worksCards.length || reducedMotion || !worksFallActive) return;
    clearWorksFall();

    const stageH = worksFallStage.clientHeight || 560;
    const stageW = worksFallStage.clientWidth || 600;
    const layout = worksCollageLayouts[worksFallLayoutIdx % worksCollageLayouts.length];
    worksFallLayoutIdx += 1;

    const order = worksCards
      .map((card, index) => ({ card, index }))
      .sort(() => Math.random() - 0.5);

    let cycleEnd = 0;

    order.forEach(({ card }, i) => {
      const slot = layout[i % layout.length];
      const jitterX = rand(-0.03, 0.03) * stageW;
      const jitterY = rand(-0.02, 0.03) * stageH;
      const left = clamp(slot.x * stageW + jitterX, -stageW * 0.04, stageW * 0.68);
      const restY = clamp(slot.y * stageH + jitterY, -stageH * 0.06, stageH * 0.5);
      const rot = slot.rot + rand(-2, 2);
      const widthPct = slot.w * 100 + rand(-1.5, 1.5);
      const delay = rand(40, 280) + i * rand(90, 220);
      const duration = rand(1100, 1800);
      const startY = restY - stageH * rand(0.55, 0.85);

      card.style.left = `${left}px`;
      card.style.top = '0';
      card.style.width = `${widthPct.toFixed(1)}%`;
      card.style.zIndex = String(slot.z + Math.floor(rand(0, 2)));
      card.style.filter = 'none';
      card.style.opacity = '0';

      const anim = card.animate(
        [
          {
            transform: `translate3d(0, ${startY}px, 0) rotate(${rot * 0.35}deg)`,
            opacity: 0,
          },
          {
            offset: 0.12,
            transform: `translate3d(0, ${startY + (restY - startY) * 0.15}px, 0) rotate(${rot * 0.55}deg)`,
            opacity: 1,
          },
          {
            transform: `translate3d(0, ${restY}px, 0) rotate(${rot}deg)`,
            opacity: 1,
          },
        ],
        {
          duration,
          delay,
          easing: 'cubic-bezier(0.22, 0.7, 0.25, 1)',
          fill: 'forwards',
        }
      );
      worksFallAnims.push(anim);
      cycleEnd = Math.max(cycleEnd, delay + duration);
    });

    worksFallTimer = window.setTimeout(() => {
      worksFallActive = false;
    }, cycleEnd + 80);
  };

  const startWorksFall = () => {
    if (reducedMotion || worksFallActive) return;
    worksFallActive = true;
    runWorksFallCycle();
  };

  const stopWorksFall = () => {
    worksFallActive = false;
    clearWorksFall();
  };

  if (worksCollage && worksSection) {
    observeSection(worksSection, {
      threshold: 0.18,
      onEnter: () => {
        worksCollage.classList.add('is-collage-in-view');
        startWorksFall();
      },
      onLeave: () => {
        worksCollage.classList.remove('is-collage-in-view');
        stopWorksFall();
      },
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
        valueAccent.textContent = phrase;
        valueAccent.classList.remove('is-leaving', 'is-entering');
        return;
      }

      if (valueAccent.textContent === phrase) return;

      valueTransitionLock = true;
      valueAccent.classList.add('is-leaving');
      window.setTimeout(() => {
        valueAccent.textContent = phrase;
        valueAccent.classList.remove('is-leaving');
        valueAccent.classList.add('is-entering');
        void valueAccent.offsetWidth;
        valueAccent.classList.remove('is-entering');
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

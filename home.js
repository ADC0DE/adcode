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
  let worksFallPatternIdx = 0;
  const worksFallAnims = [];

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const worksFallPatterns = ['columns', 'cascadeL', 'cascadeR', 'centerOut', 'scatter', 'rain', 'drift'];

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
      card.style.filter = '';
      card.style.left = '';
      card.style.zIndex = '';
      card.style.width = '';
    });
  };

  /* 사이클마다 다른 낙하 패턴 (위 선명 → 아래 축소·블러) */
  const runWorksFallCycle = () => {
    if (!worksFallStage || !worksCards.length || reducedMotion || !worksFallActive) return;
    clearWorksFall();

    const stageH = worksFallStage.clientHeight || 560;
    const stageW = worksFallStage.clientWidth || 600;
    const cardWRatio = 0.32;
    const cardW = stageW * cardWRatio;

    const pattern = worksFallPatterns[worksFallPatternIdx % worksFallPatterns.length];
    worksFallPatternIdx += 1 + Math.floor(Math.random() * 2);

    const shuffled = worksCards
      .map((card, index) => ({ card, index }))
      .sort(() => Math.random() - 0.5);

    const easings = [
      'cubic-bezier(0.33, 0.05, 0.55, 1)',
      'cubic-bezier(0.22, 0.61, 0.36, 1)',
      'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
      'cubic-bezier(0.25, 0.1, 0.25, 1)',
    ];

    let cycleEnd = 0;

    shuffled.forEach(({ card, index }, i) => {
      let left;
      let delay;
      let duration;
      let driftX = 0;
      let rot = rand(-4, 4);
      let endScale = rand(0.62, 0.74);
      let endBlur = rand(4.5, 7.5);

      if (pattern === 'columns') {
        const col = i % 3;
        left = col * (stageW * 0.34) + rand(-0.05, 0.05) * stageW;
        delay = rand(0, 900) + Math.floor(i / 3) * rand(180, 420);
        duration = rand(2400, 4000);
      } else if (pattern === 'cascadeL') {
        left = (i % 3) * (stageW * 0.34) + rand(-0.03, 0.03) * stageW;
        delay = i * rand(160, 320) + rand(0, 200);
        duration = rand(2100, 3800);
      } else if (pattern === 'cascadeR') {
        left = ((2 - (i % 3)) * (stageW * 0.34)) + rand(-0.03, 0.03) * stageW;
        delay = i * rand(140, 300) + rand(0, 180);
        duration = rand(2100, 3800);
      } else if (pattern === 'centerOut') {
        const dist = Math.abs(index - (worksCards.length - 1) / 2);
        left = rand(0.05, 0.63) * stageW;
        delay = dist * rand(220, 380) + rand(0, 250);
        duration = rand(2300, 4100);
        driftX = rand(-40, 40);
      } else if (pattern === 'scatter') {
        left = rand(0.02, 0.66) * stageW;
        delay = rand(0, 1600);
        duration = rand(2000, 4500);
        driftX = rand(-55, 55);
        rot = rand(-8, 8);
      } else if (pattern === 'rain') {
        left = rand(0.02, 0.66) * stageW;
        delay = rand(0, 700) + i * rand(40, 120);
        duration = rand(1600, 2800);
        endScale = rand(0.58, 0.7);
        endBlur = rand(5, 8);
      } else {
        /* drift — 살짝 가로로 휘며 낙하 */
        const col = Math.floor(rand(0, 3));
        left = col * (stageW * 0.34) + rand(-0.06, 0.06) * stageW;
        delay = rand(0, 1100) + i * rand(60, 180);
        duration = rand(2600, 4800);
        driftX = rand(-70, 70);
        rot = rand(-6, 6);
      }

      left = clamp(left, 0, stageW - cardW);
      const startY = -stageH * rand(0.2, 0.48);
      const midY = startY + stageH * rand(0.28, 0.45);
      const endY = stageH * rand(0.95, 1.22);
      const midX = driftX * rand(0.3, 0.6);
      const widthPct = 30 + rand(-2, 3);

      card.style.left = `${left}px`;
      card.style.width = `${widthPct.toFixed(1)}%`;
      card.style.zIndex = String(8 + Math.floor(rand(0, 8)));
      card.style.opacity = '0';

      const anim = card.animate(
        [
          {
            transform: `translate3d(0, ${startY}px, 0) scale(1) rotate(${rot * 0.2}deg)`,
            filter: 'blur(0px)',
            opacity: 0,
          },
          {
            offset: 0.1,
            transform: `translate3d(${midX * 0.2}px, ${startY + stageH * 0.1}px, 0) scale(0.99) rotate(${rot * 0.4}deg)`,
            filter: 'blur(0px)',
            opacity: 1,
          },
          {
            offset: 0.55,
            transform: `translate3d(${midX}px, ${midY}px, 0) scale(${(1 - (1 - endScale) * 0.45).toFixed(3)}) rotate(${rot * 0.7}deg)`,
            filter: `blur(${(endBlur * 0.35).toFixed(1)}px)`,
            opacity: 0.85,
          },
          {
            transform: `translate3d(${driftX}px, ${endY}px, 0) scale(${endScale.toFixed(3)}) rotate(${rot}deg)`,
            filter: `blur(${endBlur.toFixed(1)}px)`,
            opacity: 0.15,
          },
        ],
        {
          duration,
          delay,
          easing: pick(easings),
          fill: 'forwards',
        }
      );
      worksFallAnims.push(anim);
      cycleEnd = Math.max(cycleEnd, delay + duration);
    });

    worksFallTimer = window.setTimeout(() => {
      if (!worksFallActive) return;
      worksCards.forEach((card) => {
        card.style.opacity = '0';
      });
      worksFallTimer = window.setTimeout(() => {
        if (worksFallActive) runWorksFallCycle();
      }, 280);
    }, cycleEnd + 200);
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

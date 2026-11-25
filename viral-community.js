/* 커뮤니티 바이럴 마케팅 서브페이지 — 동작(애니메이션 · 아코디언)
   외부 라이브러리 없음. <body> 맨 끝에서 불러옵니다. */
(() => {
  const d = document, root = d.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const fmt = n => Math.round(n).toLocaleString('ko-KR');

  const tween = (from, to, ms, step) => {
    if (reduce) return step(to);
    const t0 = performance.now();
    const frame = t => {
      const p = Math.min(1, Math.max(0, (t - t0) / ms));
      step(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

    /* GNB: 사이트 nav.js 사용 */

  d.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    if (a.hasAttribute('data-open-contact')) {
      return; // contact-modal.js 가 모달 오픈
    }
    if (a.getAttribute('href') === '#') {
      e.preventDefault();
    }
  });
/* ---------- HERO: 로드 시퀀스 + 인기글 보드 ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-loaded')));

  const board = $('.cv-board__list');
  if (board) {
    const rows = $$('.cv-row', board), brand = $('.cv-row--brand', board), me = rows.indexOf(brand);
    const order = rows.map((_, i) => i);                               // order[순위] = 행 번호
    const vEl = $('[data-views]', brand), cEl = $('[data-cmts]', brand);
    const up = $('.cv-row__up', brand), upN = $('span', up);
    const VIEWS = [52340, 45600, 39200, 33800, 26300, 20400, 9204];    // TODO: 순위별 임시 조회수
    const CMTS = [336, 298, 240, 188, 152, 104, 58];                   // TODO: 순위별 임시 댓글수
    const last = rows.length - 1;
    let v = VIEWS[last], c = CMTS[last], seen = true;

    const place = () => order.forEach((r, rank) => rows[r].style.setProperty('--i', rank));
    const count = (nv, nc, ms) => {
      tween(v, nv, ms, x => { vEl.textContent = fmt(x); });
      tween(c, nc, ms, x => { cEl.textContent = fmt(x); });
      v = nv; c = nc;
    };
    const mark = pos => { upN.textContent = last - pos; up.classList.toggle('is-on', pos < last); };
    const idle = () => setInterval(() => {                             // 1위에 오른 뒤에도 조회수는 천천히 오름
      if (d.hidden || !seen) return;
      count(v + 20 + Math.floor(Math.random() * 90), c + (Math.random() < .35 ? 1 : 0), 700);
    }, 1900);
    const climb = () => {
      const pos = order.indexOf(me);
      if (pos === 0) return idle();
      order[pos] = order[pos - 1]; order[pos - 1] = me;
      place(); mark(pos - 1); count(VIEWS[pos - 1], CMTS[pos - 1], 800);
      setTimeout(climb, 1050);
    };

    new IntersectionObserver(es => { seen = es[0].isIntersecting; }).observe(board);
    if (reduce) {
      order.splice(order.indexOf(me), 1); order.unshift(me);
      place(); mark(0);
      vEl.textContent = fmt(VIEWS[0]); cEl.textContent = fmt(CMTS[0]);
    } else {
      setTimeout(climb, 1900);
    }
  }

  /* ---------- 섹션 머리 리빌 ---------- */
  const rio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px', threshold: .05 });
  $$('.cv-reveal').forEach(el => rio.observe(el));

  /* ---------- WHY: 스크롤에 따라 채워지는 문장 ---------- */
  const st = $('.cv-statement');
  if (st) {
    const split = (text, cls) => {
      const frag = d.createDocumentFragment();
      text.split(/(\s+)/).forEach(t => {
        if (!t) return;
        if (/^\s+$/.test(t)) { frag.appendChild(d.createTextNode(' ')); return; }
        const s = d.createElement('span');
        s.className = cls; s.textContent = t;
        frag.appendChild(s);
      });
      return frag;
    };
    const walker = d.createTreeWalker(st, NodeFilter.SHOW_TEXT), texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(n => {
      if (!n.textContent.trim()) return;
      n.parentNode.replaceChild(split(n.textContent, n.parentElement.closest('em') ? 'w r' : 'w'), n);
    });
    const words = $$('.w', st);
    let ticking = false;
    const paint = () => {
      ticking = false;
      const r = st.getBoundingClientRect(), vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * .86 - r.top) / (r.height + vh * .36)));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    };
    if (reduce) {
      words.forEach(w => w.classList.add('on'));
    } else {
      const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
      addEventListener('scroll', request, { passive: true });
      addEventListener('resize', request);
      paint();
    }
  }

  /* ---------- 숫자 카운트업 (메인 OUR WORKS 와 같은 방식) ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    tween(0, +e.target.dataset.count, 1400, x => { e.target.textContent = fmt(x); });
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- CHANNEL: 행 → 제목의 [말머리] 교체 ---------- */
  const ch = $('.cv-ch');
  if (ch) {
    const box = $('.cv-slot__box', ch), items = $$('.cv-ch__row', ch);
    let cur = 0, touched = 0, inView = false, hovering = false;
    const live = () => $$('.cv-slot__word:not(.is-out)', box);
    const fit = () => { const w = live().pop(); if (w) box.style.width = w.offsetWidth + 'px'; };
    const show = (i, byUser) => {
      if (byUser) touched = Date.now();
      if (i === cur) return;
      cur = i;
      items.forEach((it, k) => it.classList.toggle('is-active', k === i));
      const old = live();
      const next = d.createElement('span');
      next.className = 'cv-slot__word is-in';
      next.textContent = items[i].dataset.slot;
      box.appendChild(next);
      box.style.width = next.offsetWidth + 'px';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        next.classList.remove('is-in');
        old.forEach(o => { o.classList.add('is-out'); setTimeout(() => o.remove(), 650); });
      }));
    };
    items.forEach((it, i) => {
      it.addEventListener('mouseenter', () => show(i, true));
      it.addEventListener('click', () => show(i, true));
    });
    const list = $('.cv-ch__list', ch);
    list.addEventListener('mouseenter', () => { hovering = true; });
    list.addEventListener('mouseleave', () => { hovering = false; touched = Date.now(); });
    new IntersectionObserver(es => { inView = es[0].isIntersecting; }, { rootMargin: '-15% 0px -15% 0px' }).observe(ch);
    /* 자동 진행: 화면에 보이는 동안 3초마다 한 단계씩 아래 행으로 (마지막 다음은 처음으로).
       목록에 마우스를 올린 동안과 직접 고른 직후 3초는 멈춤. 간격을 바꾸려면 아래 3000 을 수정 */
    setInterval(() => {
      if (!inView || d.hidden || hovering || Date.now() - touched < 3000) return;
      show((cur + 1) % items.length);
    }, 3000);
    fit();
    addEventListener('resize', fit);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(fit);
  }

  /* ---------- PROCESS: 현재 단계 + 눈금자 ---------- */
  const steps = $$('.cv-step');
  if (steps.length) {
    const now = $('.cv-ruler__count b'), pin = $('.cv-ruler__bar em');
    const activate = i => {
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      now.textContent = String(i + 1).padStart(2, '0');
      pin.style.left = (i / (steps.length - 1) * 100) + '%';
    };
    const sio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) activate(steps.indexOf(e.target));
    }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(s => sio.observe(s));
  }

  /* ---------- CASE / FAQ: 하나씩 열리는 아코디언 ---------- */
  $$('[data-acc]').forEach(group => {
    const items = $$('[data-acc-item]', group);
    items.forEach(it => {
      const btn = $('[aria-expanded]', it);
      btn.addEventListener('click', () => {
        const open = !it.classList.contains('is-open');
        items.forEach(o => { o.classList.remove('is-open'); $('[aria-expanded]', o).setAttribute('aria-expanded', 'false'); });
        it.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  });

})();

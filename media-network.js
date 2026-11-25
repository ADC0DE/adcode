(function () {
  var d = document;
  var root = d.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var assetBase = '/public/media-network/';

  function guard(v) {
    v.addEventListener('error', function () {
      var url = v.dataset.cur;
      if (!url || v.dataset.blob) return;
      v.dataset.blob = '1';
      fetch(url)
        .then(function (r) {
          return r.blob();
        })
        .then(function (b) {
          v.src = URL.createObjectURL(b);
          if (!v.dataset.paused) v.play().catch(function () {});
        })
        .catch(function () {});
    });
  }

  function load(v, url) {
    if (v.dataset.cur === url) return;
    v.dataset.cur = url;
    delete v.dataset.blob;
    v.src = url;
  }

  var hv = d.getElementById('heroVideo');
  var toggle = d.getElementById('heroToggle');
  if (hv && toggle) {
    var mq = window.matchMedia('(max-width: 760px)');
    function heroSource() {
      load(hv, assetBase + (mq.matches ? 'media/hero-m.mp4' : 'media/hero.mp4'));
      if (!reduce && !hv.dataset.paused) hv.play().catch(function () {});
    }
    guard(hv);
    heroSource();
    if (mq.addEventListener) mq.addEventListener('change', heroSource);

    function setPaused(p) {
      if (p) {
        hv.dataset.paused = '1';
        hv.pause();
      } else {
        delete hv.dataset.paused;
        hv.play().catch(function () {});
      }
      toggle.classList.toggle('is-paused', p);
      toggle.setAttribute('aria-label', p ? '배경 영상 재생' : '배경 영상 일시정지');
    }

    toggle.addEventListener('click', function () {
      setPaused(!hv.dataset.paused);
    });
    if (reduce) {
      hv.removeAttribute('autoplay');
      setPaused(true);
    }
  }

  var lazy = [].slice.call(d.querySelectorAll('.mn video[data-src]'));
  lazy.forEach(guard);
  if ('IntersectionObserver' in window) {
    var near = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          var v = e.target;
          if (e.isIntersecting) {
            load(v, v.dataset.src);
            if (!reduce) v.play().catch(function () {});
          } else if (v.dataset.cur) {
            v.pause();
          }
        });
      },
      { rootMargin: '200px 0px' }
    );
    lazy.forEach(function (v) {
      near.observe(v);
    });

    if (hv) {
      var heroSeen = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (hv.dataset.paused || reduce) return;
          if (e.isIntersecting) hv.play().catch(function () {});
          else hv.pause();
        });
      });
      heroSeen.observe(hv);
    }
  }

  function fmt(n, dec) {
    return n.toLocaleString('ko-KR', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    });
  }

  function count(el) {
    var to = parseFloat(el.dataset.count);
    var dec = +(el.dataset.dec || 0);
    var t0 = null;
    var dur = 1400;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(to * e, dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var rvs = [].slice.call(d.querySelectorAll('.mn .rv'));
  if (reduce || !('IntersectionObserver' in window)) {
    rvs.forEach(function (el) {
      el.classList.add('in');
    });
  } else {
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          el.classList.add('in');
          [].forEach.call(el.querySelectorAll('[data-count]'), count);
          io.unobserve(el);
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' }
    );
    rvs.forEach(function (el) {
      io.observe(el);
    });
  }

  (function () {
    var row = d.getElementById('chRow');
    if (!row) return;
    var items = [].slice.call(row.querySelectorAll('.ch__i'));
    if (!items.length) return;
    var STEP = 2400;
    var cur = -1;
    var timer = null;
    var seen = false;
    var hovering = false;

    function show(i) {
      cur = i;
      items.forEach(function (el, n) {
        el.classList.toggle('is-on', n === i);
      });
    }

    function next() {
      show((cur + 1) % items.length);
    }

    function start() {
      if (timer || reduce || !seen || hovering) return;
      timer = setInterval(next, STEP);
    }

    function stop() {
      clearInterval(timer);
      timer = null;
    }

    items.forEach(function (el, i) {
      el.addEventListener('mouseenter', function () {
        hovering = true;
        stop();
        show(i);
      });
    });
    row.addEventListener('mouseleave', function () {
      hovering = false;
      start();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        function (es) {
          seen = es[0].isIntersecting;
          if (seen) {
            if (cur < 0 && !reduce) show(0);
            start();
          } else {
            stop();
          }
        },
        { threshold: 0.4 }
      ).observe(row);
    } else {
      seen = true;
      show(0);
      start();
    }
  })();

  var flow = d.getElementById('logoFlow');
  if (flow && !reduce) {
    var set = flow.querySelector('.ww__row');
    if (!set) return;
    var track = d.createElement('div');
    track.className = 'ww__track';
    flow.insertBefore(track, set);
    track.appendChild(set);
    flow.classList.add('is-flow');

    var buildFlow = function () {
      while (track.children.length > 1) track.removeChild(track.lastChild);
      var w = set.getBoundingClientRect().width;
      if (!w) return;
      var copies = Math.ceil(flow.clientWidth / w) + 1;
      for (var i = 1; i < copies; i++) {
        var c = set.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        [].forEach.call(c.querySelectorAll('img'), function (im) {
          im.alt = '';
        });
        track.appendChild(c);
      }
      track.style.setProperty('--shift', w + 'px');
      track.style.setProperty('--dur', (w / 42).toFixed(1) + 's');
    };

    buildFlow();
    var flowTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(flowTimer);
      flowTimer = setTimeout(buildFlow, 200);
    });
  }
})();

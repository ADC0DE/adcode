/* 마우스(터치)를 따라 강조 옮기기 — SERVICE SCOPE · OUR PROCESS
   포인터가 올라간 항목에 is-active 를 옮겨 붙입니다. 포인터가 떠나도 마지막 항목이 강조된 채로 남습니다. */
(function () {
  var over = window.PointerEvent ? 'pointerover' : 'mouseover';
  function follow(root, pick, set) {
    if (!root) return;
    root.addEventListener(over, function (e) { var i = pick(e.target); if (i > -1) set(i); });
  }
  function activeIndex(items) {
    for (var i = 0; i < items.length; i++) if (items[i].classList.contains('is-active')) return i;
    return 0;
  }

  /* SERVICE SCOPE: 피라미드 칸 + 오른쪽 설명이 한 줄로 묶여 같이 바뀜 */
  var stage = document.getElementById('nw-stage');
  if (stage) {
    var list = stage.querySelector('.nw-tiers');
    var tiers = [].slice.call(list.children);
    var hot = list.cloneNode(true);
    hot.classList.add('nw-tiers--hot');
    hot.setAttribute('aria-hidden', 'true');
    hot.setAttribute('inert', '');
    [].forEach.call(hot.children, function (t) { t.classList.remove('is-active'); });
    stage.appendChild(hot);
    var setTier = function (i) {
      tiers.forEach(function (t, k) { t.classList.toggle('is-active', k === i); });
      stage.setAttribute('data-active', i);
    };
    setTier(activeIndex(tiers));
    stage.classList.add('is-live');
    follow(list, function (el) { return tiers.indexOf(el.closest('.nw-tier')); }, setTier);
  }

  /* OUR PROCESS: 카드와 아래 점 목록이 같은 순서로 묶여 같이 바뀜 */
  var proc = document.querySelector('.nw-proc');
  if (proc) {
    var steps = [].slice.call(proc.querySelectorAll('.nw-step'));
    var marks = [].slice.call(proc.querySelectorAll('.nw-timeline li'));
    var current = activeIndex(steps);
    var setStep = function (i) {
      if (i === current) return;
      current = i;
      proc.classList.add('is-touched');
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      marks.forEach(function (m, k) { m.classList.toggle('is-active', k === i); });
    };
    follow(proc.querySelector('.nw-steps'), function (el) { return steps.indexOf(el.closest('.nw-step')); }, setStep);
    follow(proc.querySelector('.nw-timeline'), function (el) { return marks.indexOf(el.closest('li')); }, setStep);
  }
})();

/* 창 크기를 바꾸는 동안에는 전환을 꺼 둠 */
(function () {
  var root = document.querySelector('.nw'), timer;
  if (!root) return;
  window.addEventListener('resize', function () {
    root.classList.add('is-resizing');
    clearTimeout(timer);
    timer = setTimeout(function () { root.classList.remove('is-resizing'); }, 250);
  });
})();

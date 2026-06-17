// 공통 마퀴 — 모든 페이지(index/about/business/portfolio)에서 동일하게 사용.
// 점·색·속도는 여기 한 곳에서만 수정하면 전체에 반영됨(통일성).
// 문구만 페이지별로 다르게: 트랙 요소에 data-marquee="ADCODE PORTFOLIO" 처럼 지정.
//   - 미지정 시 기본값 "ADCODE BRAND OPERATING".
//   - 첫 단어(ADCODE)는 빨강, 나머지는 흰색으로 자동 처리.
// 사용법: <div class="marquee-track" id="marquee-track" data-marquee="..."></div>
(function () {
  const track = document.getElementById('marquee-track');
  if (!track) return;
  const phrase = (track.dataset.marquee || 'ADCODE BRAND OPERATING').trim();
  const parts = phrase.split(/\s+/);
  const first = parts.shift();
  const rest = parts.join('&nbsp;'); // 줄바꿈 방지(원본 BRAND&nbsp;OPERATING와 동일)
  const unit = `
  <div class="item">
    <span class="sep" aria-hidden="true">&middot;</span>
    <span class="word red">${first}</span>
    <span class="word">${rest}</span>
  </div>`;

  // 한 세트(절반)가 항상 화면폭 이상이 되도록 반복 수를 계산.
  // 트랙은 동일한 두 세트로 구성되고 CSS가 -50%까지 이동 → 문구 길이와 무관하게 빈틈없이 무한 반복.
  track.innerHTML = unit; // 1개만 먼저 넣어 폭 측정
  const unitW = track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width : 0;
  const viewW = (track.parentElement || track).getBoundingClientRect().width || window.innerWidth;
  const perHalf = unitW > 0 ? Math.max(2, Math.ceil(viewW / unitW) + 1) : 4;
  track.innerHTML = unit.repeat(perHalf * 2);
})();

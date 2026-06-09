// 공통 마퀴 — 모든 페이지(index/about/business)에서 동일하게 사용.
// 문구·구분점·반복 횟수를 여기 한 곳에서만 수정하면 전체에 반영됨.
// 사용법: 페이지에 <div class="marquee-track" id="marquee-track"></div> 만 두고 이 파일을 include.
(function () {
  const track = document.getElementById('marquee-track');
  if (!track) return;
  const unit = `
  <div class="item">
    <span class="sep" aria-hidden="true">·</span>
    <span class="word red">ADCODE</span>
    <span class="word">BRAND&nbsp;OPERATING</span>
  </div>`;
  track.innerHTML = unit.repeat(4);
})();

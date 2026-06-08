// 공통 GNB 스크립트 — index·about·business 공유.
// 모바일 전환 기준을 CSS(@media max-width:760px)와 "동일"하게 맞춰
// CSS는 햄버거인데 JS는 hover로 판단하던 불일치(드롭다운이 안 열리던 버그)를 제거.
(function () {
  const MOBILE = "(max-width: 760px)";
  const gnb = document.querySelector(".gnb");
  if (!gnb) return;

  // 드롭다운("애드코드") — 모바일: 탭하면 펼침/접힘(이동 안 함, 홈은 로고로) / 데스크톱: hover(CSS)
  gnb.querySelectorAll(".nav-item.has-dropdown").forEach((item) => {
    const trigger = item.querySelector(":scope > a");
    if (!trigger) return;
    trigger.addEventListener("click", (e) => {
      if (window.matchMedia(MOBILE).matches) {
        e.preventDefault();
        item.classList.toggle("open");
      }
    });
  });

  // 바깥 영역 탭 시 열린 드롭다운 닫기
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-item.has-dropdown")) {
      gnb
        .querySelectorAll(".nav-item.has-dropdown.open")
        .forEach((el) => el.classList.remove("open"));
    }
  });

  // 모바일 햄버거 토글
  const toggle = gnb.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = gnb.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // 실제 이동 링크 클릭 시 메뉴 닫기 (애드코드 토글 트리거는 제외)
    gnb.querySelectorAll(".nav a[href]").forEach((a) => {
      if (a.parentElement.classList.contains("has-dropdown")) return;
      a.addEventListener("click", () => gnb.classList.remove("nav-open"));
    });
  }
})();

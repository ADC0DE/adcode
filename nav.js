// 공통 GNB 스크립트 — index·about·design·portfolio 공유.
// 모바일 전환 기준을 CSS(@media max-width:760px)와 "동일"하게 맞춰
// CSS는 햄버거인데 JS는 hover로 판단하던 불일치(드롭다운이 안 열리던 버그)를 제거.
(function () {
  const MOBILE = "(max-width: 760px)";
  const gnb = document.querySelector(".gnb");
  if (!gnb) return;

  // 드롭다운(DESIGN 등) — 모바일: 탭하면 펼침/접힘 / 데스크톱: hover(CSS), 클릭 시 이동 없음
  gnb.querySelectorAll(".nav-item.has-dropdown").forEach((item) => {
    const trigger = item.querySelector(":scope > a");
    if (!trigger) return;
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.matchMedia(MOBILE).matches) {
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
    // 실제 이동 링크 클릭 시 메뉴 닫기 (드롭다운 트리거는 제외)
    gnb.querySelectorAll(".nav a[href]").forEach((a) => {
      const navItem = a.closest(".nav-item.has-dropdown");
      if (navItem && navItem.querySelector(":scope > a") === a) return;
      a.addEventListener("click", () => gnb.classList.remove("nav-open"));
    });
  }
})();

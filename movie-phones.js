(function () {
  const root = document.querySelector(".movie-phones-swiper");
  if (!root || typeof Swiper === "undefined") return;
  if (root.swiper) return;

  new Swiper(root, {
    slidesPerView: 1.25,
    spaceBetween: 14,
    loop: true,
    speed: 500,
    grabCursor: true,
    watchOverflow: true,
    navigation: {
      nextEl: ".movie-phones-next",
      prevEl: ".movie-phones-prev",
    },
    breakpoints: {
      761: { slidesPerView: 3, spaceBetween: 18 },
      1101: { slidesPerView: 4, spaceBetween: 24 },
    },
  });
})();

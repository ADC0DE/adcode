document.addEventListener("DOMContentLoaded", function () {
    // 캐시 방지를 위한 타임스탬프
    const v = new Date().getTime();

    // 1. 공통 헤더 로드
    fetch("/components/header.html?v=" + v)
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-placeholder").innerHTML = data;

            // 헤더가 로드된 후 스크롤 이벤트 및 모바일 메뉴 리스너 수동 재부착
            initHeaderEvents();
        });

    // 2. 공통 문의하기 + 푸터 묶음 + 각종 모달 로드
    fetch("/components/footer-contact.html?v=" + v)
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-contact-placeholder").innerHTML = data;

            // 푸터와 모달이 로드된 후 관련 이벤트 수동 재부착
            initFooterEvents();

            // 새로 로드된 DOM에 대해 스크롤 애니메이션 페이드인 요소를 다시 인식하고 적용
            if (typeof window.updateFadeIn === 'function') {
                window.updateFadeIn();
            }
        });
});

// 헤더 관련 이벤트 초기화
function initHeaderEvents() {
    const header = document.querySelector('.header');

    // 스크롤 이벤트 (헤더 고정 스타일 변경)
    if (header) {
        // 기존 스크롤 상태 체크
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        }

        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 모바일 메뉴 토글
    const mobileMenuBtn = document.querySelector('.mobile-trigger');
    const mobileMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.toggle('active');
            if (mobileMenu.classList.contains('active')) {
                mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // 헤더 내부 링크(앵커) 클릭 시 부드러운 스크롤 여부 판단 및 모바일 메뉴 닫기 처리
    document.querySelectorAll('.header a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const currentUrl = new URL(window.location.href);
            const targetUrl = new URL(this.href, window.location.href);

            // 다른 페이지로 이동하는 링크면 부드러운 스크롤 무시하고 기본 동작 실행
            if (currentUrl.pathname !== targetUrl.pathname && !(currentUrl.pathname === '/' && targetUrl.pathname === '/index.html')) {
                return;
            }

            // 같은 페이지 내의 해시(#) 이동일 경우 부드러운 스크롤 적용
            if (targetUrl.hash && targetUrl.hash !== '#') {
                e.preventDefault();

                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    if (mobileMenuBtn) mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }

                const targetElement = document.querySelector(targetUrl.hash);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// 푸터, 문의폼, 모달 관련 이벤트 초기화
function initFooterEvents() {
    initModals();

    // 문의폼 제출 이벤트 재부착
    const contactForm = document.getElementById('contactForm');
    const contactSuccessModal = document.getElementById('contact-success-modal');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            const iframe = document.createElement('iframe');
            iframe.name = 'contact-submit-frame';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            contactForm.target = 'contact-submit-frame';

            iframe.addEventListener('load', function () {
                if (contactSuccessModal) {
                    contactSuccessModal.style.display = 'block';
                    setTimeout(() => {
                        contactSuccessModal.classList.add('show');
                    }, 10);
                    document.body.style.overflow = 'hidden';
                }

                contactForm.reset();
                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                }, 500);
            });
        });
    }
}

// 기존 main.js 에 있던 모달 초기화 함수 복원/재정의 (동적 로드시 호출 필요)
function initModals() {
    const termsModal = document.getElementById('terms-modal');
    const privacyModal = document.getElementById('privacy-modal');
    const cookieModal = document.getElementById('cookie-modal');
    const contactSuccessModal = document.getElementById('contact-success-modal');

    const termsLink = document.getElementById('terms-link');
    const privacyLink = document.getElementById('privacy-link');
    const cookieLink = document.getElementById('cookie-link');
    const contactSuccessCloseBtn = document.getElementById('contact-success-close');

    const closeButtons = document.querySelectorAll('.close-modal');

    function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }

    if (termsLink) termsLink.addEventListener('click', function (e) { e.preventDefault(); openModal(termsModal); });
    if (privacyLink) privacyLink.addEventListener('click', function (e) { e.preventDefault(); openModal(privacyModal); });
    if (cookieLink) cookieLink.addEventListener('click', function (e) { e.preventDefault(); openModal(cookieModal); });
    if (contactSuccessCloseBtn) contactSuccessCloseBtn.addEventListener('click', function () { closeModal(contactSuccessModal); });

    closeButtons.forEach(button => {
        button.addEventListener('click', function () {
            const modal = this.closest('.policy-modal');
            closeModal(modal);
        });
    });

    window.addEventListener('click', function (e) {
        if (e.target.classList.contains('policy-modal')) {
            closeModal(e.target);
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.policy-modal.show');
            openModals.forEach(modal => {
                closeModal(modal);
            });
        }
    });
}

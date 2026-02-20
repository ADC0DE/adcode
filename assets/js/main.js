



// Fade In Animation on Scroll
const fadeInOnScroll = function () {
    const fadeElements = document.querySelectorAll('.fade-in:not(.active)');
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const isVisible = (elementTop < window.innerHeight - 100) && (elementBottom > 0);

        if (isVisible) {
            element.classList.add('active');
        }
    });
};

document.addEventListener('DOMContentLoaded', function () {
    // Initial check
    fadeInOnScroll();

    // Scroll event
    window.addEventListener('scroll', fadeInOnScroll);

    // 전역 스코프에 노출하여 다른 곳에서 호출 가능하게 설정
    window.updateFadeIn = fadeInOnScroll;
});

// 숫자 카운트업 애니메이션
function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');

    statNumbers.forEach(statNumber => {
        const originalText = statNumber.textContent;
        const hasPercent = originalText.includes('%');
        const targetValueText = originalText.replace(/[^\d.]/g, ''); // 숫자와 소수점만 추출
        const targetValue = parseFloat(targetValueText);

        // 접미사 판별
        let suffix = '';
        if (hasPercent) suffix = '%';
        else if (originalText.includes('+')) suffix = '+';
        else if (originalText.includes('∞')) suffix = '∞';

        const decimal = originalText.includes('.') ? 1 : 0;
        const duration = 2000; // 애니메이션 지속 시간 (ms)

        let startValue = 0;
        let startTime = null;

        function updateNumber(timestamp) {
            if (!startTime) startTime = timestamp;

            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = ease(progress);

            let currentValue;
            if (suffix === '∞') {
                currentValue = '∞';
            } else {
                currentValue = (startValue + easedProgress * (targetValue - startValue)).toFixed(decimal);
                if (decimal === 0) currentValue = parseInt(currentValue);
                currentValue = currentValue + suffix;
            }

            statNumber.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }

        // 이징 함수
        function ease(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        // 해당 요소가 뷰포트에 들어올 때 애니메이션 시작
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(updateNumber);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        observer.observe(statNumber);
    });
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function () {
    animateNumbers();
});

// 드롭다운 토글 함수
function toggleDropdown(element) {
    // 현재 클릭한 항목의 활성 상태 토글
    element.classList.toggle('active');

    // 다음 형제 요소(dropdown-content)를 찾아 표시/숨김 처리
    const content = element.nextElementSibling;

    if (element.classList.contains('active')) {
        content.style.display = 'block';
    } else {
        content.style.display = 'none';
    }

    // 다른 활성화된 드롭다운 닫기 (선택적)
    const otherItems = document.querySelectorAll('.result-item.active');
    otherItems.forEach(item => {
        if (item !== element) {
            item.classList.remove('active');
            item.nextElementSibling.style.display = 'none';
        }
    });
}

// 페이지 로드 시 모든 드롭다운 콘텐츠 숨기기
document.addEventListener('DOMContentLoaded', function () {
    const dropdownContents = document.querySelectorAll('.dropdown-content');
    dropdownContents.forEach(content => {
        content.style.display = 'none';
    });
});

// 모달 관련 스크립트
document.addEventListener('DOMContentLoaded', function () {
    // 모달 요소
    const termsModal = document.getElementById('terms-modal');
    const privacyModal = document.getElementById('privacy-modal');
    const cookieModal = document.getElementById('cookie-modal');
    const contactSuccessModal = document.getElementById('contact-success-modal');

    // 버튼 요소
    const termsLink = document.getElementById('terms-link');
    const privacyLink = document.getElementById('privacy-link');
    const cookieLink = document.getElementById('cookie-link');
    const contactSuccessCloseBtn = document.getElementById('contact-success-close');

    // 닫기 버튼
    const closeButtons = document.querySelectorAll('.close-modal');

    // 모달 열기 함수
    function openModal(modal) {
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    }

    // 모달 닫기 함수
    function closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // 스크롤 복원
        }, 300);
    }

    // 이벤트 리스너 설정
    termsLink.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(termsModal);
    });

    privacyLink.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(privacyModal);
    });

    cookieLink.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(cookieModal);
    });

    // 닫기 버튼에 이벤트 연결
    closeButtons.forEach(button => {
        button.addEventListener('click', function () {
            const modal = this.closest('.policy-modal');
            closeModal(modal);
        });
    });

    // 모달 외부 클릭시 닫기
    window.addEventListener('click', function (e) {
        if (e.target.classList.contains('policy-modal')) {
            closeModal(e.target);
        }
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.policy-modal.show');
            openModals.forEach(modal => {
                closeModal(modal);
            });
        }
    });

    // 문의폼 제출 이벤트 처리
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            // 폼이 제출되는 것을 허용하지만, 제출 완료 후 팝업창을 표시하기 위해 이벤트 리스너 추가
            // FormSubmit은 페이지를 이동시키므로 iframe을 통해 제출 처리
            const iframe = document.createElement('iframe');
            iframe.name = 'contact-submit-frame';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            // 폼 타겟을 iframe으로 변경
            contactForm.target = 'contact-submit-frame';

            // iframe이 로드되면 성공 모달 표시
            iframe.addEventListener('load', function () {
                // 제출 성공 모달 표시
                openModal(contactSuccessModal);

                // 폼 리셋
                contactForm.reset();

                // iframe 제거
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 500);
            });
        });
    }

    // 성공 모달 닫기 버튼 이벤트
    if (contactSuccessCloseBtn) {
        contactSuccessCloseBtn.addEventListener('click', function () {
            closeModal(contactSuccessModal);
        });
    }


});

function createConnections() {
    const brandNode = document.querySelector('.brand-node');
    if (!brandNode) return; // 바이럴 마케팅 페이지(viral.html) 외의 곳에서 실행 시 에러 방지
    const channelNodes = document.querySelectorAll('.channel-node');
    const secondaryNodes = document.querySelectorAll('.secondary-node');
    const tertiaryNodes = document.querySelectorAll('.tertiary-node');
    const container = document.querySelector('.viral-network');

    // 브랜드 -> 채널 노드 연결
    channelNodes.forEach(node => {
        createConnection(brandNode, node, 'primary-connection', container);
    });

    // 채널 -> 2차 노드 연결
    const communityNode = document.querySelector('.node-community');
    createConnection(communityNode, document.querySelector('.node-cafe'), 'secondary-connection', container);
    createConnection(communityNode, document.querySelector('.node-community-site'), 'secondary-connection', container);

    const snsNode = document.querySelector('.node-sns');
    createConnection(snsNode, document.querySelector('.node-instagram'), 'secondary-connection', container);
    createConnection(snsNode, document.querySelector('.node-youtube'), 'secondary-connection', container);

    const expNode = document.querySelector('.node-experience');
    createConnection(expNode, document.querySelector('.node-blog'), 'secondary-connection', container);
    createConnection(expNode, document.querySelector('.node-review'), 'secondary-connection', container);

    // 2차 -> 3차 노드 연결
    createConnection(document.querySelector('.node-cafe'), document.querySelector('.node-user1'), 'tertiary-connection', container);
    createConnection(document.querySelector('.node-instagram'), document.querySelector('.node-user2'), 'tertiary-connection', container);
    createConnection(document.querySelector('.node-community-site'), document.querySelector('.node-user3'), 'tertiary-connection', container);
    createConnection(document.querySelector('.node-blog'), document.querySelector('.node-user4'), 'tertiary-connection', container);
    createConnection(document.querySelector('.node-review'), document.querySelector('.node-user5'), 'tertiary-connection', container);
    createConnection(document.querySelector('.node-youtube'), document.querySelector('.node-user6'), 'tertiary-connection', container);
}

function createConnection(from, to, className, container) {
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // 컨테이너 기준 상대 좌표 계산
    const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
    const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
    const toX = toRect.left + toRect.width / 2 - containerRect.left;
    const toY = toRect.top + toRect.height / 2 - containerRect.top;

    // 거리와 각도 계산
    const dX = toX - fromX;
    const dY = toY - fromY;
    const length = Math.sqrt(dX * dX + dY * dY);
    const angle = Math.atan2(dY, dX) * 180 / Math.PI;

    // 연결선 생성
    const connection = document.createElement('div');
    connection.className = `connection ${className}`;
    connection.style.width = `${length}px`;
    connection.style.left = `${fromX}px`;
    connection.style.top = `${fromY}px`;
    connection.style.transform = `rotate(${angle}deg)`;

    container.appendChild(connection);
}


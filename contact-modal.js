/* Shared CONTACT modal — inject + open/close for all pages */
(function () {
  var SERVICES = ['미디어 네트워크', '종합 마케팅', '바이럴', '병원 마케팅', '나무위키'];
  var PAGE_SERVICE = {
    'page-media-network': '미디어 네트워크',
    'page-total-marketing': '종합 마케팅',
    'page-viral': '바이럴',
    'page-namuwiki': '나무위키'
  };

  function pageDefaultService() {
    var fromData = document.body.getAttribute('data-contact-service');
    if (fromData) return fromData;
    for (var cls in PAGE_SERVICE) {
      if (document.body.classList.contains(cls)) return PAGE_SERVICE[cls];
    }
    return '';
  }

  function modalHtml(defaultService) {
    var serviceItems = SERVICES.map(function (name) {
      var checked = name === defaultService ? ' checked' : '';
      return (
        '<label class="service-item">' +
          '<input type="checkbox" value="' + name + '"' + checked + ' />' +
          '<span class="service-check" aria-hidden="true"></span>' +
          '<span class="service-name">' + name + '</span>' +
        '</label>'
      );
    }).join('');

    var servicesValue = defaultService || '';

    return (
      '<div class="policy-modal contact-modal" id="modal-contact" role="dialog" aria-modal="true" aria-label="상담문의하기">' +
        '<div class="modal-box modal-box--contact">' +
          '<div class="contact-modal__chrome">' +
            '<button type="button" class="modal-close" data-close aria-label="닫기">&times;</button>' +
          '</div>' +
          '<div class="contact-modal__grid">' +
            '<div class="contact-left">' +
              '<p class="contact-eyebrow">CONTACT</p>' +
              '<h2 class="contact-heading">상담문의하기</h2>' +
              '<p class="contact-desc">간단한 정보만 남겨주시면<br>담당자가 빠르게 연락드립니다.</p>' +
            '</div>' +
            '<form class="form" id="contactForm">' +
              '<input type="hidden" name="희망서비스" id="services-input" value="' + servicesValue + '" />' +
              '<input type="hidden" name="연락방법" id="contact-method-input" value="전화" />' +
              '<div class="row-2">' +
                '<div class="field field--inline"><span class="field-label">상호명</span><input type="text" name="상호명" required placeholder="상호명을 입력해주세요." /></div>' +
                '<div class="field field--inline"><span class="field-label">성함</span><input type="text" name="성함" required placeholder="성함을 입력해주세요." /></div>' +
                '<div class="field field--inline"><span class="field-label">연락처</span><input type="tel" name="연락처" required placeholder="010-0000-0000" /></div>' +
                '<div class="field field--inline"><span class="field-label">이메일</span><input type="email" name="이메일" required placeholder="contact@example.com" /></div>' +
              '</div>' +
              '<div class="field field--box field--textarea"><span class="field-label">문의내용</span><textarea name="문의내용" placeholder="문의 내용을 입력해주세요."></textarea></div>' +
              '<div class="form-block form-block--boxed">' +
                '<p class="form-block-title">원하는 서비스를 선택해주세요.</p>' +
                '<div class="service-grid" id="service-grid">' + serviceItems + '</div>' +
              '</div>' +
              '<div class="form-block form-block--boxed">' +
                '<p class="form-block-title">연락받을 방법을 선택해주세요.</p>' +
                '<div class="method-grid" id="method-grid" role="radiogroup" aria-label="연락방법">' +
                  '<button type="button" class="method-item is-active" data-method="전화" aria-pressed="true">' +
                    '<span class="method-check" aria-hidden="true"></span>' +
                    '<span class="method-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>' +
                    '<span class="method-text"><span class="method-name">전화</span><span class="method-desc">유선으로 빠르게 상담</span></span>' +
                  '</button>' +
                  '<button type="button" class="method-item" data-method="카카오톡" aria-pressed="false">' +
                    '<span class="method-check" aria-hidden="true"></span>' +
                    '<span class="method-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4C7 4 3 7.2 3 11.2c0 2.5 1.6 4.7 4.1 6L6 21l4-2.6c.7.1 1.3.2 2 .2 5 0 9-3.2 9-7.4S17 4 12 4Z"/></svg></span>' +
                    '<span class="method-text"><span class="method-name">카카오톡</span><span class="method-desc">카톡으로 편하게 상담</span></span>' +
                  '</button>' +
                  '<button type="button" class="method-item" data-method="이메일" aria-pressed="false">' +
                    '<span class="method-check" aria-hidden="true"></span>' +
                    '<span class="method-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></span>' +
                    '<span class="method-text"><span class="method-name">이메일</span><span class="method-desc">이메일로 자세한 안내</span></span>' +
                  '</button>' +
                  '<button type="button" class="method-item" data-method="상관없음" aria-pressed="false">' +
                    '<span class="method-check" aria-hidden="true"></span>' +
                    '<span class="method-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg></span>' +
                    '<span class="method-text"><span class="method-name">상관없음</span><span class="method-desc">편한 방법으로 연락</span></span>' +
                  '</button>' +
                '</div>' +
              '</div>' +
              '<div class="consents">' +
                '<label class="consent"><input type="checkbox" name="개인정보_동의" required /><span class="cbox" aria-hidden="true"></span><span class="ctxt">개인정보 수집 및 이용에 동의합니다</span></label>' +
                '<label class="consent"><input type="checkbox" name="정보제공_동의" required /><span class="cbox" aria-hidden="true"></span><span class="ctxt">원활한 상담 진행을 위해 정보 제공에 동의합니다</span></label>' +
                '<label class="brochure-note">회사소개서가 필요하신가요? 이메일을 남겨주시면 회사소개서를 보내드립니다.</label>' +
              '</div>' +
              '<div class="form-submit"><button type="submit" class="submit-btn submit-btn--block"><span>문의하기</span><span class="arrow" aria-hidden="true">→</span></button></div>' +
            '</form>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function ensureSuccessModal() {
    if (document.getElementById('modal-success')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="policy-modal" id="modal-success" role="dialog" aria-modal="true" aria-label="전송 완료">' +
        '<div class="modal-box modal-box--center">' +
          '<button class="modal-close" data-close aria-label="닫기">&times;</button>' +
          '<h2>전송이 완료되었습니다</h2>' +
          '<p>문의해주셔서 감사합니다.<br>빠른 시일 내에 답변 드리겠습니다.</p>' +
          '<button class="submit-btn" data-close style="margin-top:20px;">확인</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap.firstElementChild);
  }

  function ensureModal() {
    ensureSuccessModal();
    var existing = document.getElementById('modal-contact');
    if (existing) return existing;
    var wrap = document.createElement('div');
    wrap.innerHTML = modalHtml(pageDefaultService());
    var modal = wrap.firstElementChild;
    document.body.appendChild(modal);
    return modal;
  }

  function syncServices() {
    var grid = document.getElementById('service-grid');
    var input = document.getElementById('services-input');
    if (!grid || !input) return;
    input.value = [...grid.querySelectorAll('input[type="checkbox"]:checked')]
      .map(function (el) { return el.value; })
      .join(', ');
  }

  function bindFormExtras(modal) {
    var serviceGrid = modal.querySelector('#service-grid');
    if (serviceGrid && !serviceGrid.dataset.bound) {
      serviceGrid.dataset.bound = '1';
      serviceGrid.addEventListener('change', syncServices);
      syncServices();
    }

    var methodGrid = modal.querySelector('#method-grid');
    var methodInput = modal.querySelector('#contact-method-input');
    if (methodGrid && methodInput && !methodGrid.dataset.bound) {
      methodGrid.dataset.bound = '1';
      methodGrid.addEventListener('click', function (e) {
        var btn = e.target.closest('.method-item');
        if (!btn) return;
        [...methodGrid.querySelectorAll('.method-item')].forEach(function (el) {
          var on = el === btn;
          el.classList.toggle('is-active', on);
          el.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        methodInput.value = btn.dataset.method || '';
      });
    }
  }

  function openModal(id) {
    if (id === 'modal-success') {
      document.getElementById('modal-contact')?.classList.remove('open');
    }
    var el = document.getElementById(id);
    if (el) el.classList.add('open');
  }

  function closeAll() {
    document.querySelectorAll('.policy-modal.open').forEach(function (m) {
      m.classList.remove('open');
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-open-contact]');
    if (a) {
      e.preventDefault();
      if (a.closest('.rail') && window.matchMedia('(max-width: 760px)').matches) {
        window.location.href = 'tel:0537216061';
        return;
      }
      var modal = ensureModal();
      bindFormExtras(modal);
      openModal('modal-contact');
      return;
    }

    var policy = e.target.closest('.policy-modal');
    if (policy && (e.target === policy || e.target.closest('[data-close]'))) {
      closeAll();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });

  // Prefer shared opener; keep existing page openers working
  var prevOpen = window.__openModal;
  window.__openModal = function (id) {
    if (id === 'modal-contact') {
      var modal = ensureModal();
      bindFormExtras(modal);
    }
    if (typeof prevOpen === 'function' && id !== 'modal-contact') {
      prevOpen(id);
      if (id === 'modal-success') ensureSuccessModal();
      document.getElementById(id)?.classList.add('open');
      return;
    }
    if (id === 'modal-success') ensureSuccessModal();
    openModal(id);
  };

  // If page already has modal markup, just bind extras
  var existing = document.getElementById('modal-contact');
  if (existing) bindFormExtras(existing);
})();

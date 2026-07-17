(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const defaultBtnHtml = submitBtn ? submitBtn.innerHTML : '';

  function syncHiddenFields() {
    const servicesInput = document.getElementById('services-input');
    const serviceGrid = document.getElementById('service-grid');
    if (serviceGrid && servicesInput) {
      const selected = [...serviceGrid.querySelectorAll('input[type="checkbox"]:checked')]
        .map((el) => el.value);
      servicesInput.value = selected.join(', ');
    }

    const methodInput = document.getElementById('contact-method-input');
    const methodGrid = document.getElementById('method-grid');
    if (methodGrid && methodInput) {
      const active = methodGrid.querySelector('.method-item.is-active');
      if (active) methodInput.value = active.dataset.method || '';
    }
  }

  function resetFormExtras() {
    const servicesInput = document.getElementById('services-input');
    const serviceGrid = document.getElementById('service-grid');
    if (serviceGrid && servicesInput) {
      serviceGrid.querySelectorAll('input[type="checkbox"]').forEach((el) => {
        el.checked = el.value === '상세페이지 제작';
      });
      servicesInput.value = '상세페이지 제작';
    }

    const methodInput = document.getElementById('contact-method-input');
    const methodGrid = document.getElementById('method-grid');
    if (methodInput) methodInput.value = '전화';
    if (methodGrid) {
      [...methodGrid.querySelectorAll('.method-item')].forEach((el) => {
        const on = el.dataset.method === '전화';
        el.classList.toggle('is-active', on);
        el.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    if (loading) {
      submitBtn.innerHTML = '<span>전송 중...</span>';
    } else {
      submitBtn.innerHTML = defaultBtnHtml;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    syncHiddenFields();

    const client = window.adcodeSupabase;
    if (!client) {
      alert('문의 시스템 설정이 완료되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const fd = new FormData(form);
    const payload = {
      company_name: String(fd.get('상호명') || '').trim(),
      name: String(fd.get('성함') || '').trim(),
      phone: String(fd.get('연락처') || '').trim(),
      email: String(fd.get('이메일') || '').trim(),
      message: String(fd.get('문의내용') || '').trim(),
      services: String(fd.get('희망서비스') || '').trim(),
      contact_method: String(fd.get('연락방법') || '전화').trim(),
      privacy_agreed: fd.get('개인정보_동의') === 'on',
      info_agreed: fd.get('정보제공_동의') === 'on',
      status: 'new',
    };

    if (!payload.company_name || !payload.name || !payload.phone || !payload.email) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    if (!payload.privacy_agreed || !payload.info_agreed) {
      alert('약관에 동의해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await client.from('inquiries').insert([payload]).select().single();
      if (error) throw error;

      // 관리자 메일 알림 (실패해도 문의 접수는 성공 처리)
      try {
        await fetch('/api/notify-inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data || payload),
        });
      } catch (mailErr) {
        console.warn('[ADCODE] notify mail skipped', mailErr);
      }

      form.reset();
      resetFormExtras();
      window.__openModal && window.__openModal('modal-success');
    } catch (err) {
      console.error('[ADCODE] inquiry insert failed', err);
      alert('문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  });
})();

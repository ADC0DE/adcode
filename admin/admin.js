(function () {
  const STATUS_LABEL = {
    new: '신규',
    in_progress: '진행중',
    done: '완료',
    archived: '보관',
  };

  const loginView = document.getElementById('login-view');
  const appView = document.getElementById('app-view');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const adminEmail = document.getElementById('admin-email');
  const tbody = document.getElementById('inquiry-tbody');
  const listStatus = document.getElementById('list-status');
  const searchInput = document.getElementById('search-input');
  const refreshBtn = document.getElementById('refresh-btn');
  const drawer = document.getElementById('detail-drawer');
  const detailBody = document.getElementById('detail-body');
  const detailStatus = document.getElementById('detail-status');
  const detailNote = document.getElementById('detail-note');
  const detailMsg = document.getElementById('detail-msg');
  const saveDetailBtn = document.getElementById('save-detail-btn');
  const deleteDetailBtn = document.getElementById('delete-detail-btn');

  let rows = [];
  let filterStatus = 'all';
  let selectedId = null;
  let searchQuery = '';

  function client() {
    return window.adcodeSupabase;
  }

  function formatDate(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function showLogin() {
    loginView.hidden = false;
    appView.hidden = true;
    closeDrawer();
  }

  function showApp(session) {
    loginView.hidden = true;
    appView.hidden = false;
    adminEmail.textContent = session?.user?.email || '';
  }

  function setLoginError(msg) {
    if (!msg) {
      loginError.hidden = true;
      loginError.textContent = '';
      return;
    }
    loginError.hidden = false;
    loginError.textContent = msg;
  }

  function setDetailMsg(msg, isError) {
    if (!msg) {
      detailMsg.hidden = true;
      detailMsg.textContent = '';
      detailMsg.style.color = '';
      return;
    }
    detailMsg.hidden = false;
    detailMsg.textContent = msg;
    detailMsg.style.color = isError ? '' : '#9be7b4';
  }

  function filteredRows() {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      if (filterStatus !== 'all' && row.status !== filterStatus) return false;
      if (!q) return true;
      const hay = [row.company_name, row.name, row.phone, row.email, row.services, row.message]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }

  function renderTable() {
    const list = filteredRows();
    listStatus.textContent = `총 ${list.length}건`;
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="color:#6b6b6b;padding:28px 16px;">문의가 없습니다.</td></tr>';
      return;
    }

    tbody.innerHTML = list.map((row) => `
      <tr data-id="${row.id}">
        <td>${formatDate(row.created_at)}</td>
        <td><span class="badge badge-${row.status}">${STATUS_LABEL[row.status] || row.status}</span></td>
        <td>${escapeHtml(row.company_name)}</td>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.phone)}</td>
        <td>${escapeHtml(row.services || '-')}</td>
        <td>${escapeHtml(row.contact_method || '-')}</td>
      </tr>
    `).join('');
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function loadInquiries() {
    const sb = client();
    if (!sb) {
      listStatus.textContent = 'Supabase 설정이 필요합니다.';
      return;
    }
    listStatus.textContent = '불러오는 중...';
    const { data, error } = await sb
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      listStatus.textContent = '목록을 불러오지 못했습니다.';
      return;
    }
    rows = data || [];
    renderTable();
  }

  function openDrawer(id) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    selectedId = id;
    detailStatus.value = row.status;
    detailNote.value = row.admin_note || '';
    setDetailMsg('');
    detailBody.innerHTML = `
      <div class="detail-row"><span>접수일시</span><strong>${formatDate(row.created_at)}</strong></div>
      <div class="detail-row"><span>상호명</span><strong>${escapeHtml(row.company_name)}</strong></div>
      <div class="detail-row"><span>성함</span><strong>${escapeHtml(row.name)}</strong></div>
      <div class="detail-row"><span>연락처</span><strong>${escapeHtml(row.phone)}</strong></div>
      <div class="detail-row"><span>이메일</span><strong>${escapeHtml(row.email)}</strong></div>
      <div class="detail-row"><span>희망서비스</span><strong>${escapeHtml(row.services || '-')}</strong></div>
      <div class="detail-row"><span>연락방법</span><strong>${escapeHtml(row.contact_method || '-')}</strong></div>
      <div class="detail-row"><span>문의내용</span><strong>${escapeHtml(row.message || '-')}</strong></div>
    `;
    drawer.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    selectedId = null;
    drawer.hidden = true;
    drawer.setAttribute('aria-hidden', 'true');
  }

  async function init() {
    const sb = client();
    if (!sb) {
      setLoginError('supabase-config.js 에 anonKey 를 설정해주세요.');
      return;
    }

    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      showApp(session);
      await loadInquiries();
    } else {
      showLogin();
    }

    sb.auth.onAuthStateChange(async (_event, nextSession) => {
      if (nextSession) {
        showApp(nextSession);
        await loadInquiries();
      } else {
        showLogin();
      }
    });
  }

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const sb = client();
    if (!sb) return;

    setLoginError('');
    loginBtn.disabled = true;
    loginBtn.textContent = '로그인 중...';

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const { error } = await sb.auth.signInWithPassword({ email, password });
    loginBtn.disabled = false;
    loginBtn.textContent = '로그인';

    if (error) {
      setLoginError(error.message || '로그인에 실패했습니다.');
      return;
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    const sb = client();
    if (!sb) return;
    await sb.auth.signOut();
    rows = [];
    renderTable();
  });

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((el) => el.classList.remove('is-active'));
      btn.classList.add('is-active');
      filterStatus = btn.dataset.status || 'all';
      renderTable();
    });
  });

  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    renderTable();
  });

  refreshBtn?.addEventListener('click', () => loadInquiries());

  tbody?.addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]');
    if (!tr) return;
    openDrawer(tr.dataset.id);
  });

  drawer?.querySelectorAll('[data-close-drawer]').forEach((el) => {
    el.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) closeDrawer();
  });

  saveDetailBtn?.addEventListener('click', async () => {
    if (!selectedId) return;
    const sb = client();
    if (!sb) return;

    saveDetailBtn.disabled = true;
    setDetailMsg('');
    const { error } = await sb
      .from('inquiries')
      .update({
        status: detailStatus.value,
        admin_note: detailNote.value.trim(),
      })
      .eq('id', selectedId);

    saveDetailBtn.disabled = false;
    if (error) {
      setDetailMsg(error.message || '저장 실패', true);
      return;
    }
    setDetailMsg('저장되었습니다.', false);
    await loadInquiries();
    openDrawer(selectedId);
  });

  deleteDetailBtn?.addEventListener('click', async () => {
    if (!selectedId) return;
    if (!confirm('이 문의를 삭제할까요?')) return;
    const sb = client();
    if (!sb) return;

    deleteDetailBtn.disabled = true;
    const { error } = await sb.from('inquiries').delete().eq('id', selectedId);
    deleteDetailBtn.disabled = false;

    if (error) {
      setDetailMsg(error.message || '삭제 실패', true);
      return;
    }
    closeDrawer();
    await loadInquiries();
  });

  init();
})();

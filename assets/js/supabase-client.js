(function () {
  const cfg = window.ADCODE_SUPABASE;
  if (!cfg || !cfg.url || !cfg.anonKey || cfg.anonKey === 'PASTE_YOUR_ANON_KEY_HERE') {
    console.error('[ADCODE] supabase-config.js 에 anonKey 를 설정해주세요.');
    return;
  }
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('[ADCODE] @supabase/supabase-js 가 로드되지 않았습니다.');
    return;
  }
  window.adcodeSupabase = window.supabase.createClient(cfg.url, cfg.anonKey);
})();

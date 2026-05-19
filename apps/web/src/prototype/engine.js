// ===== script segment =====

    // v3 safety patch: auto-destroy existing chart on canvas before reuse.
    // Fixes "Canvas is already in use" race when renderPlaceholder fires
    // multiple times in rapid succession during initial auth + route load.
    (function() {
      if (!window.Chart || window.Chart.__v3patched) return;
      const __OriginalChart = window.Chart;
      const __ChartProxy = function(item, config) {
        try {
          const canvas = item && item.canvas ? item.canvas : (item && item.getContext ? item : null);
          if (canvas && __OriginalChart.getChart) {
            const existing = __OriginalChart.getChart(canvas);
            if (existing) existing.destroy();
          }
        } catch (e) { /* ignore */ }
        return new __OriginalChart(item, config);
      };
      Object.setPrototypeOf(__ChartProxy, __OriginalChart);
      __ChartProxy.prototype = __OriginalChart.prototype;
      Object.keys(__OriginalChart).forEach(k => {
        try { __ChartProxy[k] = __OriginalChart[k]; } catch (e) {}
      });
      __ChartProxy.__v3patched = true;
      window.Chart = __ChartProxy;
    })();
  

  
  
// ===== script segment =====

    // Lucide CDN fallback — inline subset for offline / blocked CDN scenarios
    (function ensureLucideFallback(){
      const SUBSET = {
        'check': '<polyline points="20 6 9 17 4 12"/>',
        'check-circle-2': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
        'check-circle':   '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
        'alert-circle':   '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
        'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
        'info':           '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
        'x':              '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
        'x-circle':       '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
        'chevron-down':   '<polyline points="6 9 12 15 18 9"/>',
        'chevron-right':  '<polyline points="9 18 15 12 9 6"/>',
        'menu':           '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
        'moon':           '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
        'sun':            '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
        'search':         '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
        'bell':           '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
        'download':       '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
        'send':           '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
        'edit':           '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
        'log-in':         '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>',
        'log-out':        '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
        'user':           '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        'users':          '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'crown':          '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>',
        'star':           '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
        'briefcase':      '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
        'play':           '<polygon points="5 3 19 12 5 21 5 3"/>',
        'play-circle':    '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
        'plus-circle':    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
        'rotate-ccw':     '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
        'lock':           '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
        'eye':            '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
        'file-text':      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
        'file-search':    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7"/><polyline points="14 2 14 8 20 8"/><circle cx="17" cy="17" r="3"/><path d="m21 21-1.5-1.5"/>',
        'building-2':     '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>',
        'map-pin':        '<path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
        'git-branch':     '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
        'trending-up':    '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
      };
      const renderFromSubset = (root) => {
        (root || document).querySelectorAll('[data-lucide]').forEach(el => {
          const name = el.getAttribute('data-lucide');
          if (!name || !SUBSET[name]) return;
          if (el.tagName.toLowerCase() === 'svg') return;
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${name}">${SUBSET[name]}</svg>`;
          const tmp = document.createElement('div'); tmp.innerHTML = svg;
          const node = tmp.firstChild;
          const cls = el.getAttribute('class');
          if (cls) node.setAttribute('class', node.getAttribute('class') + ' ' + cls);
          el.replaceWith(node);
        });
      };
      setTimeout(() => {
        if (!window.lucide || typeof window.lucide.createIcons !== 'function') {
          window.lucide = window.lucide || {};
          window.lucide.createIcons = (opts) => renderFromSubset(opts && opts.root);
          renderFromSubset();
          console.warn('[Lucide] CDN unavailable — using inline subset.');
        }
      }, 1500);
    })();
  


  
// ===== script segment =====

    // =========================================================
    // STATE ? in-memory only (no localStorage per spec)
    // =========================================================
    const state = {
      theme: 'light',  /* SIMPP brand default — light mode; user can toggle to dark */
      sidebarCollapsed: false,
      currentRoute: 'executive-summary',
      period: 'semester',
      customRange: { from: '2025-01-01', to: '2025-03-31' },
      role: 'gm',
    };

    const ROUTES = {
      'executive-summary': { label: 'Executive Summary',    icon: 'layout-dashboard', phase: 1,  desc: 'Total Nilai Kinerja, KPI utama, dan status proyek PUSMANPRO bulan berjalan.' },
      'financial':         { label: 'Cost & Capex',         icon: 'trending-up',      phase: 2,  desc: 'Pengendalian anggaran OPEX/CAPEX, realisasi PDN, dan struktur biaya.' },
      'operational':       { label: 'Operational KPIs',    icon: 'activity',         phase: 3,  desc: 'KPI operasional proyek: % Konstruksi, Kapasitas, IQC, HSSE, dan Kepatuhan.' },
      'strategic':         { label: 'Strategic Targets',   icon: 'target',           phase: 4,  desc: 'Balanced Scorecard, OKR, dan peta strategi PUSMANPRO 2026.' },
      'human-capital':     { label: 'Human Capital',       icon: 'users',            phase: 9,  desc: 'Data SDM, sertifikasi kompetensi, distribusi usia, dan training pipeline.' },
      'approvals':         { label: 'Reports & Approvals', icon: 'file-check-2',     phase: 10, desc: 'Workflow 5-stage approval Laporan Kinerja Manajemen PUSMANPRO.' },
      'settings':          { label: 'Settings',            icon: 'settings',         phase: 11, desc: 'Profil, preferensi, manajemen peran, notifikasi, dan audit log.' },
      'risk':              { label: 'Manajemen Risiko',    icon: 'shield-alert',     phase: 12, desc: 'Risk register proyek, heat map 5×5, kategori risiko, dan status mitigasi.' },
      'workflow-km':            { label: 'Kontrak Manajemen',     icon: 'file-signature', phase: 14, desc: 'Workflow & monitoring KPI Kontrak Manajemen PUSMANPRO 2026 — WF-1 s/d WF-3.' },
      'workflow-km-usulan':     { label: 'Proses Usulan KM',      icon: 'file-plus',      phase: 14, desc: 'WF-1 / WF-1b / WF-2 — KPI Proposal Kantor Induk & UPMK + Draft Kontrak Manajemen.' },
      'workflow-km-realisasi':  { label: 'Proses Realisasi KM',   icon: 'line-chart',     phase: 14, desc: 'WF-3 — Monitoring realisasi KPI Kontrak Manajemen vs target 2026.' },
    };

    const ROLES = {
      staff:     { label: 'Staff Officer',     level: 'L1', icon: 'user',      name: 'Staff Officer',     email: 'staff.officer@pusmanpro.pln.co.id', initials: 'SO' },
      asman:     { label: 'Asisten Manajer',   level: 'L2', icon: 'user-cog',  name: 'Asisten Manajer',   email: 'asman@pusmanpro.pln.co.id',         initials: 'AM' },
      manajer:   { label: 'Manajer Bidang',    level: 'L3', icon: 'briefcase', name: 'Manajer Bidang',    email: 'manajer@pusmanpro.pln.co.id',       initials: 'MB' },
      srmanajer: { label: 'Senior Manajer',    level: 'L4', icon: 'star',      name: 'Senior Manajer Bidang',    email: 'srmanajer@pusmanpro.pln.co.id',     initials: 'SM' },
      gm:        { label: 'General Manager',   level: 'L5', icon: 'crown',     name: 'General Manager PUSMANPRO',   email: 'gm@pusmanpro.pln.co.id',            initials: 'GM' },
    };

    const ICONS_BY_TYPE = {
      success: 'check-circle-2',
      warning: 'alert-triangle',
      danger:  'alert-circle',
      info:    'info',
    };

    // =========================================================
    // FORMATTERS ? Indonesian locale
    // =========================================================
    const ID_LOCALE = 'id-ID';
    const NOW_REF  = new Date('2026-04-30T14:32:00+07:00');

    const formatNumber = (n, decimals = 0) =>
      n == null ? '—' : new Intl.NumberFormat(ID_LOCALE, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(n);

    // Smart Rupiah: T (triliun), M (miliar), Jt (juta), Rb (ribu)
    const formatRupiah = (n, opts = {}) => {
      if (n == null) return '?';
      const { abbreviated = true, decimals = 2 } = opts;
      if (!abbreviated) return 'Rp ' + formatNumber(n);
      const abs = Math.abs(n); const sign = n < 0 ? '-' : '';
      if (abs >= 1e12) return `${sign}Rp ${formatNumber(abs / 1e12, decimals)} T`;
      if (abs >= 1e9)  return `${sign}Rp ${formatNumber(abs / 1e9,  decimals)} M`;
      if (abs >= 1e6)  return `${sign}Rp ${formatNumber(abs / 1e6,  decimals)} Jt`;
      if (abs >= 1e3)  return `${sign}Rp ${formatNumber(abs / 1e3,  decimals)} Rb`;
      return `${sign}Rp ${formatNumber(abs)}`;
    };

    const formatPercent = (n, decimals = 1, withSign = false) => {
      if (n == null) return '?';
      const sign = withSign && n > 0 ? '+' : '';
      return `${sign}${formatNumber(n, decimals)}%`;
    };

    // Returns { text, type: 'positive' | 'negative' | 'neutral' }
    const formatDelta = (n, decimals = 1, isInverse = false, unit = '%') => {
      if (n == null) return { text: '?', type: 'neutral' };
      const sign = n > 0 ? '+' : '';
      const text = `${sign}${formatNumber(n, decimals)}${unit}`;
      let type;
      if (n === 0) type = 'neutral';
      else if (isInverse) type = n < 0 ? 'positive' : 'negative';
      else type = n > 0 ? 'positive' : 'negative';
      return { text, type };
    };

    const formatDate = (date, format = 'long') => {
      const d = typeof date === 'string' ? new Date(date) : date;
      const opts = format === 'long'
        ? { day: 'numeric', month: 'long', year: 'numeric' }
        : format === 'datetime'
        ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { day: '2-digit', month: 'short', year: 'numeric' };
      return new Intl.DateTimeFormat(ID_LOCALE, opts).format(d);
    };

    const relativeTime = (date) => {
      if (!date) return '?';
      const d = typeof date === 'string' ? new Date(date) : date;
      const diff = Math.floor((NOW_REF - d) / 1000);
      if (diff < 60) return `${diff} detik lalu`;
      if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
      if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
      if (diff < 2592000) return `${Math.floor(diff / 604800)} minggu lalu`;
      if (diff < 31536000) return `${Math.floor(diff / 2592000)} bulan lalu`;
      return `${Math.floor(diff / 31536000)} tahun lalu`;
    };

    // =========================================================
    // MOCK DATA LAYER ? Q1 2025 PT PLN (Persero) Pusmanpro
    // =========================================================
    const DATA = {
      meta: {
        company: 'PT PLN (Persero) Pusat Manajemen Proyek',
        period: 'Februari 2026',
        periodFull: 'Laporan Pencapaian Kinerja Bulanan — Februari 2026 (RKM 2026)',
        rkmRef: 'RKM (Rencana Kerja Manajemen) Tahun 2026',
        lastUpdated: '2026-04-30T14:32:00+07:00',
        bidang: [
          'Operasi Manajemen Proyek',
          'QA/QC',
          'Perencanaan & Project Control',
          'Keuangan, Komunikasi & Umum',
        ],
        units: [
          { code: 'KP',    short: 'Kantor Induk', name: 'Kantor Induk PUSMANPRO', wilayah: 'Jakarta Pusat',                                                     headcount: 145, projects: 76 },
          { code: 'UPMK1', short: 'UPMK I',       name: 'UPMK I',                  wilayah: 'Banten, DKI Jakarta, Jawa Tengah',                                  headcount:  68, projects: 18 },
          { code: 'UPMK2', short: 'UPMK II',      name: 'UPMK II',                 wilayah: 'Jawa Timur, DI Yogyakarta, Bali, NTB, NTT, Pulau Kalimantan',      headcount:  84, projects: 22 },
          { code: 'UPMK3', short: 'UPMK III',     name: 'UPMK III',                wilayah: 'Lampung, Bengkulu, Sumatera Selatan, Bangka-Belitung',              headcount:  52, projects: 14 },
          { code: 'UPMK4', short: 'UPMK IV',      name: 'UPMK IV',                 wilayah: 'Jambi, Riau, Sumatera Barat, Sumatera Utara, Aceh',                  headcount:  61, projects: 16 },
          { code: 'UPMK5', short: 'UPMK V',       name: 'UPMK V',                  wilayah: 'Pulau Sulawesi, Maluku, Maluku Utara, Pulau Papua',                  headcount:  71, projects: 19 },
        ],
        // Backward-compat alias for renderers that still reference businessUnits
        get businessUnits() { return this.units.map(u => u.short); },
        monthsTrailing12: ['Mar 25','Apr 25','Mei 25','Jun 25','Jul 25','Agu 25','Sep 25','Okt 25','Nov 25','Des 25','Jan 26','Feb 26'],
      },

      executive: {
        // Total Nilai Kinerja PUSMANPRO Februari 2026 ? sumber: Laporan Kinerja sheet
        healthScore: { value: 103.87, target: 100, previous: 101.50, label: 'Total Nilai Kinerja PUSMANPRO', delta: 2.34, status: 'Baik' },
        kpis: [
          { id: 'totalprojects', label: 'Total Proyek Aktif (Supervisi)', value: 165,  formatted: '165 proyek',                  delta:  4.4, icon: 'briefcase',
            sparkline: [148,150,152,155,158,160,161,162,163,164,165,165] },
          { id: 'capacity',      label: 'Kapasitas Tambah YTD',           value: 83.7, formatted: '23 MW · 0,7 KMS · 60 MVA',   delta: 23.5, deltaUnit: '%', icon: 'zap',
            sparkline: [0,0,0,5,5,5,5,30,30,30,60,83.7] },
          { id: 'capex',         label: 'Realisasi Capex (vs AKI 2026)',  value: 95.8, formatted: '95,8%',                        delta:  1.2, deltaUnit: 'pp', icon: 'wallet',
            sparkline: [88,90,91,92,93,93.5,94,94.5,95,95.3,95.6,95.8] },
          { id: 'bim',           label: 'BIM Adoption (KPI 9c RKM)',      value: 100,  formatted: '100%',                          delta:  0,   deltaUnit: 'pp', icon: 'layers',
            sparkline: [85,87,90,92,95,97,98,99,100,100,100,100] },
        ],
        // Penambahan kapasitas (12 bulan) ? replace revenueVsTarget
        capacityAddition: {
          months:        ['Mar 25','Apr 25','Mei 25','Jun 25','Jul 25','Agu 25','Sep 25','Okt 25','Nov 25','Des 25','Jan 26','Feb 26'],
          pembangkit:    [0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 18, 23],         // MW (target 120)
          transmisi:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7, 0.7],       // KMS (target 400.34)
          gi:            [0, 0, 0, 0, 0, 30, 30, 30, 60, 60, 60, 60],     // MVA (target 360)
          targetPembangkit: 120, targetTransmisi: 400.34, targetGI: 360,
        },
        // Backward-compat alias for old renderer
        get revenueVsTarget() { return { actual: this.capacityAddition.pembangkit, target: this.capacityAddition.pembangkit.map(_ => 10) }; },
        // Ranking 6 unit (Kantor Induk + 5 UPMK) by Total Nilai Kinerja
        unitRanking: [
          { code: 'UPMK2', score: 105.20, status: 'Baik',      projects: 22, criticalKpi: 'Capex 96,1%' },
          { code: 'KP',    score: 103.87, status: 'Baik',      projects: 76, criticalKpi: '% Konstruksi 93,94' },
          { code: 'UPMK5', score: 102.50, status: 'Baik',      projects: 19, criticalKpi: 'BIM 100%' },
          { code: 'UPMK1', score: 101.30, status: 'Baik',      projects: 18, criticalKpi: 'Capex 99,2%' },
          { code: 'UPMK4', score:  99.80, status: 'Hati-hati', projects: 16, criticalKpi: '% Konstruksi 91,20' },
          { code: 'UPMK3', score:  96.40, status: 'Hati-hati', projects: 14, criticalKpi: '% Konstruksi 88,40' },
        ],
        // 12-month trend lines per unit (synthetic, ends at unit's final score)
        unitTrend: {
          KP:    [96.40, 97.20, 98.10, 98.80, 99.50, 100.10, 100.50, 101.20, 101.80, 102.30, 101.50, 103.87],
          UPMK1: [93.80, 94.60, 95.30, 96.10, 97.00, 97.80, 98.50, 99.20, 99.90, 100.60, 100.90, 101.30],
          UPMK2: [95.50, 96.80, 97.60, 98.50, 99.40, 100.30, 101.20, 102.10, 103.00, 103.80, 104.50, 105.20],
          UPMK3: [90.20, 90.80, 91.50, 92.10, 92.80, 93.40, 94.00, 94.70, 95.30, 95.80, 96.10, 96.40],
          UPMK4: [91.50, 92.30, 93.00, 93.70, 94.50, 95.20, 96.00, 96.80, 97.60, 98.40, 99.10, 99.80],
          UPMK5: [94.20, 95.00, 95.80, 96.60, 97.30, 98.10, 98.90, 99.60, 100.40, 101.10, 101.80, 102.50],
        },
        // Backward-compat alias ? renders BU breakdown card grid
        get buBreakdown() {
          return this.unitRanking.map(u => {
            const unitName = ({ KP:'Kantor Induk', UPMK1:'UPMK I', UPMK2:'UPMK II', UPMK3:'UPMK III', UPMK4:'UPMK IV', UPMK5:'UPMK V' })[u.code];
            return { name: unitName, value: u.score, share: (u.score / 6.10).toFixed(1) * 1 };
          });
        },
        efficiency: { value: 93.94, target: 100, label: '% Pelaksanaan Konstruksi Sesuai Perencanaan' },
        csat:       { value: 4.58, max: 5.00, responses: 165, label: 'IQC Rata-rata (Hari Kerja)', isInverse: true },
        safety:     { value: 0,    target: -8, isInverse: true, label: 'Pengurang HSSE (Kepatuhan)', unit: 'pengurang nilai' },
        initiatives: [
          { id: 'INI-01', name: 'Implementasi BIM 4D/5D pada Proyek Supervisi (KPI 9c RKM 2026)', owner: 'Bidang OMP',           status: 'completed', progress: 100, dueDate: '2026-12-31', kpiId: 'pi9'  },
          { id: 'INI-02', name: 'Standarisasi Template EIR/BEP PLN Korporat',                       owner: 'Bidang QA/QC',         status: 'on-track',  progress:  75, dueDate: '2026-09-30', kpiId: 'pi9'  },
          { id: 'INI-03', name: 'Sertifikasi SKKNI BIM Tim Inti',                                   owner: 'Bidang Keu/Kom/Umum',  status: 'at-risk',   progress:  45, dueDate: '2026-06-30', kpiId: 'pi13' },
          { id: 'INI-04', name: 'Migrasi CDE penuh ke ACC (Single Source of Truth)',               owner: 'Bidang OMP',           status: 'on-track',  progress:  68, dueDate: '2026-12-31', kpiId: 'pi9'  },
          { id: 'INI-05', name: 'Implementasi SIDITA & Motion PMO di seluruh UPMK',                 owner: 'Bidang Perencanaan',    status: 'completed', progress: 100, dueDate: '2026-03-31', kpiId: 'pi10' },
          { id: 'INI-06', name: 'Maturity Level SMAP ISO 37001 — Audit Resertifikasi',              owner: 'Bidang QA/QC',         status: 'on-track',  progress:  82, dueDate: '2026-12-31', kpiId: 'pi12' },
          { id: 'INI-07', name: 'Maturity Level Sustainability ESG',                                 owner: 'Bidang QA/QC',         status: 'on-track',  progress:  55, dueDate: '2026-12-31', kpiId: 'pi12' },
          { id: 'INI-08', name: 'PLN Bisnis Ekselen — Cascading KPI Berbasis Risiko',                owner: 'Bidang Perencanaan',    status: 'on-track',  progress:  78, dueDate: '2026-12-31', kpiId: 'pi12' },
        ],
        alerts: [
          { type: 'warning', title: 'Persentase Pelaksanaan Konstruksi Februari 93,94% — di bawah target 100% (Status: MASALAH)', timestamp: '2026-04-30T14:00:00+07:00', route: 'operational', action: 'openKpi', targetId: 'kp4' },
          { type: 'success', title: 'Pemenuhan PDN Korporat 98,30% — pencapaian 103,47% terhadap target Pusat',                    timestamp: '2026-04-30T12:00:00+07:00', route: 'operational', action: 'openKpi', targetId: 'pi11' },
          { type: 'info',    title: 'Laporan KM Februari 2026 (Kantor Induk) menunggu Stage 3 — Manajer Bidang',                   timestamp: '2026-04-29T16:00:00+07:00', route: 'workflow-km-usulan', action: 'scrollTo', targetId: 'km-pending-grid' },
          { type: 'success', title: 'BIM 4D/5D Implementation tercapai 100% sesuai KPI 9c RKM 2026',                                 timestamp: '2026-04-28T10:00:00+07:00', route: 'operational', action: 'openKpi', targetId: 'pi9' },
        ],
      },

      financial: {
        // KPI strip ? Pengendalian Anggaran & Cost
        kpiStrip: [
          { id: 'opex',  label: 'Realisasi OPEX Non-Fuel YTD',  value: 5.20e9,    vsTarget:  -2.4, vsPriorYear:  3.1, icon: 'wallet',     isInverse: true },
          { id: 'capex', label: 'Realisasi Capex (% AKI 2026)', value: 95.8,      formatted: '95,8%',     vsTarget:  0.8, vsPriorYear: 2.4, icon: 'trending-up' },
          { id: 'pdn',   label: 'Pemenuhan PDN Korporat',       value: 98.30,     formatted: '98,30%',    vsTarget:  3.5, vsPriorYear: 1.2, icon: 'flag' },
          { id: 'bobot', label: 'Nilai Pengendalian Anggaran',  value: 7.35,      formatted: '7,35 / 7',  vsTarget:  5.0, vsPriorYear: 3.0, icon: 'percent' },
          { id: 'tjsl',  label: 'Pengelolaan TJSL & Komunikasi',value: 100,       formatted: '100%',      vsTarget:  0,   vsPriorYear: 0,   icon: 'heart' },
        ],
        // Variance vs RKAP 2026 (gantikan P&L korporat)
        pnl: [
          { item: 'Realisasi OPEX Non-Fuel (Rp Miliar)',         budget:  5320, actual:  5200, isSubtotal: false },
          { item: 'Anggaran Investasi (Capex, Rp Miliar)',        budget:  1530, actual:  1470, isSubtotal: false },
          { item: 'Anggaran K3L & Kamtib',                         budget:   180, actual:   175, isSubtotal: false },
          { item: 'Subtotal Penyerapan Anggaran',                  budget:  7030, actual:  6845, isSubtotal: true  },
          { item: 'Anggaran Diklat & Sertifikasi',                 budget:   480, actual:   480, isSubtotal: false },
          { item: 'Anggaran TJSL',                                  budget:   250, actual:   248, isSubtotal: false },
          { item: 'Anggaran Komunikasi Korporat',                   budget:   170, actual:   168, isSubtotal: false },
          { item: 'Subtotal SDM, TJSL & Komunikasi',                budget:   900, actual:   896, isSubtotal: true  },
          { item: 'Total Realisasi vs RKAP 2026',                   budget:  7930, actual:  7741, isSubtotal: true  },
        ],
        // Trend OPEX vs Target & Tahun Lalu (Rp Miliar, 12 bulan)
        revenueTrend: {
          actual:    [430, 445, 460, 455, 470, 480, 475, 485, 495, 510, 515, 520],
          budget:    [445, 450, 455, 465, 475, 485, 495, 500, 510, 515, 520, 532],
          priorYear: [410, 420, 435, 442, 458, 466, 470, 478, 488, 495, 502, 510],
        },
        // Breakdown OPEX per kategori (Rp Miliar)
        costStructure: [
          { name: 'Biaya Pegawai',             value: 1850, share: 35.6 },
          { name: 'Biaya Operasi Supervisi',   value: 1450, share: 27.9 },
          { name: 'Pemeliharaan',              value:  620, share: 11.9 },
          { name: 'Diklat & Sertifikasi',      value:  480, share:  9.2 },
          { name: 'Komunikasi & TJSL',          value:  420, share:  8.1 },
          { name: 'Lain-lain',                  value:  380, share:  7.3 },
        ],
        // Cash flow per Bidang/Activity (Rp Miliar)
        cashFlow: { operating: 1240, investing: -680, financing: -320, netChange: 240, cashEnd: 3450 },
        // Realisasi Investasi per Unit (Kantor Induk + 5 UPMK, Rp Miliar)
        investasiPerUnit: [
          { code: 'KP',    name: 'Kantor Induk', target:  110, realisasi:  102, percent: 92.7, status: 'warning' },
          { code: 'UPMK1', name: 'UPMK I',       target:  250, realisasi:  248, percent: 99.2, status: 'success' },
          { code: 'UPMK2', name: 'UPMK II',      target:  380, realisasi:  365, percent: 96.1, status: 'success' },
          { code: 'UPMK3', name: 'UPMK III',     target:  180, realisasi:  168, percent: 93.3, status: 'warning' },
          { code: 'UPMK4', name: 'UPMK IV',      target:  320, realisasi:  305, percent: 95.3, status: 'success' },
          { code: 'UPMK5', name: 'UPMK V',       target:  290, realisasi:  282, percent: 97.2, status: 'success' },
        ],
        // EVM (Earned Value Management) Indicator per Unit
        evm: [
          { code: 'KP',    spi: 0.97, cpi: 1.03, status: 'on-track' },
          { code: 'UPMK1', spi: 0.99, cpi: 1.01, status: 'on-track' },
          { code: 'UPMK2', spi: 1.02, cpi: 0.98, status: 'on-track' },
          { code: 'UPMK3', spi: 0.92, cpi: 0.95, status: 'at-risk' },
          { code: 'UPMK4', spi: 0.94, cpi: 0.99, status: 'at-risk' },
          { code: 'UPMK5', spi: 0.98, cpi: 1.02, status: 'on-track' },
        ],
        // Indikator Cost & Capex (replace P&L ratios)
        ratios: [
          { id: 'opx', label: 'OPEX vs RKAP',           value: 97.7, unit: '%', benchmark: 100, status: 'success', desc: 'Realisasi 5,20 M dari budget 5,32 M (Beyond RKAP)' },
          { id: 'cpx', label: 'Capex vs AKI 2026',      value: 95.8, unit: '%', benchmark:  95, status: 'success', desc: 'Pengendalian penggunaan investasi sesuai target 95-100%' },
          { id: 'pdn', label: 'Pemenuhan PDN Korporat', value: 98.30,unit: '%', benchmark:  95, status: 'success', desc: 'Pencapaian 103,47% di atas target Pusat' },
          { id: 'spi', label: 'SPI Avg (EVM)',          value: 0.97, unit: 'x', benchmark: 1.00,status: 'success', desc: 'Schedule Performance Index — slightly under planned' },
          { id: 'cpi', label: 'CPI Avg (EVM)',          value: 1.00, unit: 'x', benchmark: 1.00,status: 'success', desc: 'Cost Performance Index — on budget' },
          { id: 'pen', label: 'Pengurang Kepatuhan',    value: 0,    unit: 'pt',benchmark: -30, status: 'success', desc: 'Total pengurang kinerja kepatuhan (Max -30, aktual 0)', isInverse: true },
        ],
      },

      operational: {
        // 14 Indikator Kinerja PUSMANPRO RKM 2026 (sumber: Sheet "Laporan Kinerja" Februari 2026)
        kpis: [
          // KEY PERFORMANCE INDICATOR (KPI) ? Bobot Total 40
          { id: 'kp1',  no:  1, name: 'Evaluasi, Analisa & Rekomendasi terhadap Proyek',                category: 'KPI', unit: 'Dokumen',    target: 3,        actual: 0,        achievement: 100.00, status: 'success', isInverse: false, polaritas: 'HB', bobot: 13, nilai: 13.00, bu: 'Bidang Perencanaan', owner: 'Bidang Perencanaan & Project Control',
            basis: 'akumulatif', targetCumulative: [0,0,0,0,0,1,1,1,2,2,3,3],
            sparkline: [0,0,0,0,0,0,0,0,0,0,0,0],
            commentary: 'Penyusunan dokumen kajian Project Control dijadwalkan TW2-TW4 2026 (3 dokumen/tahun).', rootCause: '', actionPlan: 'Mengumpulkan data lintas Divisi via Aplikasi Motion PMO; jadwal milestone Mar/Jun/Sep.' },
          { id: 'kp2',  no:  2, name: 'Penerbitan IQC (Inspection Quality Certificate)',                  category: 'KPI', unit: 'Hari kerja', target: 5,        actual: 4.58,     achievement: 108.41, status: 'success', isInverse: true,  polaritas: 'LB', bobot: 13, nilai: 14.09, bu: 'Bidang QA/QC', owner: 'Bidang QA/QC',
            sparkline: [4.90,4.85,4.80,4.75,4.70,4.65,4.62,4.60,4.58,4.55,4.58,4.58],
            commentary: 'IQC terbit rata-rata 4,58 HK, lebih cepat dari target 5 HK.', rootCause: '', actionPlan: 'Pertahankan SOP review MDR; konsinyering bulanan tim Engineering.' },
          { id: 'kp4',  no:  4, name: 'Persentase Pelaksanaan Konstruksi Sesuai Perencanaan',              category: 'KPI', unit: '%',          target: 100,      actual: 93.94,    achievement: 93.94,  status: 'danger',  isInverse: false, polaritas: 'HB', bobot: 14, nilai: 13.15, bu: 'Bidang OMP', owner: 'Bidang Operasi Manajemen Proyek',
            sparkline: [98,97,96,95,95,94,94,94,94,93.5,93.94,93.94],
            commentary: 'STATUS MASALAH. PMS dan S-Curve di beberapa proyek belum disepakati Pemberi Kerja.',
            rootCause: 'Keterlambatan finalisasi PMS pada proyek baru di UPMK III & UPMK IV.',
            actionPlan: 'Eskalasi ke Pemberi Kerja, koordinasi mingguan dengan UPMK; target normalisasi TW2 2026.' },

          // PERFORMANCE INDICATOR (PI) ? Bobot Total 60
          { id: 'pi3',  no:  3, name: 'Kajian Proyek Pembangkit, Transmisi & GI',                          category: 'PI',  unit: 'Hari Kerja', target: 12,       actual: 8.50,     achievement: 110.00, status: 'success', isInverse: true,  polaritas: 'LB', bobot:  5, nilai:  5.50, bu: 'Bidang Perencanaan', owner: 'Bidang Perencanaan & Project Control',
            sparkline: [11,11,10,10,9.5,9,9,8.7,8.6,8.5,8.5,8.50],
            commentary: 'Penyampaian kajian dispute lebih cepat dari target 12 HK.', rootCause: '', actionPlan: 'Tingkatkan kompetensi teknis pegawai melalui benchmark.' },
          { id: 'pi5',  no:  5, name: 'Penambahan Kapasitas Pembangkit',                                   category: 'PI',  unit: 'MW',         target: 120,      actual: 23,       achievement: 110.00, status: 'success', isInverse: false, polaritas: 'HB', bobot:  7, nilai:  7.70, bu: 'Bidang OMP', owner: 'Bidang Operasi Manajemen Proyek',
            basis: 'akumulatif', targetCumulative: [0,0,0,10,20,30,40,50,60,80,100,120],
            sparkline: [0,0,0,0,5,5,5,5,5,5,18,23],
            commentary: 'Realisasi 23 MW dari pembangkit di luar target supervisi langsung.', rootCause: '', actionPlan: 'Akselerasi commissioning di TW3-TW4 2026.' },
          { id: 'pi6',  no:  6, name: 'Penambahan Kapasitas Transmisi',                                    category: 'PI',  unit: 'KMS',        target: 400.34,   actual: 0.7,      achievement: 110.00, status: 'success', isInverse: false, polaritas: 'HB', bobot:  7, nilai:  7.70, bu: 'Bidang OMP', owner: 'Bidang Operasi Manajemen Proyek',
            basis: 'akumulatif', targetCumulative: [0,0,0,0,10,30,60,100,160,240,330,400],
            sparkline: [0,0,0,0,0,0,0,0,0,0,0.7,0.7],
            commentary: 'Energizing pertama transmisi sudah dimulai.', rootCause: '', actionPlan: 'Target besar (400 KMS) di TW3-TW4 commissioning massif.' },
          { id: 'pi7',  no:  7, name: 'Penambahan Kapasitas Gardu Induk',                                  category: 'PI',  unit: 'MVA',        target: 360,      actual: 60,       achievement: 110.00, status: 'success', isInverse: false, polaritas: 'HB', bobot:  7, nilai:  7.70, bu: 'Bidang OMP', owner: 'Bidang Operasi Manajemen Proyek',
            basis: 'akumulatif', targetCumulative: [0,0,0,30,60,90,120,150,200,270,320,360],
            sparkline: [0,0,0,0,0,30,30,30,60,60,60,60],
            commentary: 'GI 30 MVA energized di UPMK V (Sulawesi); 30 MVA tambahan dari UPMK II.', rootCause: '', actionPlan: 'GI Marisa 30MVA, Kolaka 30MVA dijadwalkan TW2.' },
          { id: 'pi8',  no:  8, name: 'Pengendalian Anggaran (OPEX & Investasi)',                          category: 'PI',  unit: '%',          target: 100,      actual: 105,      achievement: 105.00, status: 'success', isInverse: false, polaritas: 'HB', bobot:  7, nilai:  7.35, bu: 'Bidang Keu/Kom/Umum', owner: 'Bidang Keuangan, Komunikasi & Umum',
            sparkline: [98,99,100,101,101,102,103,103,104,104,105,105],
            commentary: 'OPEX (5,20 M) dan Investasi (95-100% AKI) terkendali.', rootCause: '', actionPlan: 'Evaluasi PRK bulanan terus dijalankan.' },
          { id: 'pi9',  no:  9, name: 'Digitalisasi Aplikasi Korporat (E-Proc, SIDITA, BIM)',               category: 'PI',  unit: '%',          target: 100,      actual: 100,      achievement: 100.00, status: 'success', isInverse: false, polaritas: 'HB', bobot:  5, nilai:  5.00, bu: 'Bidang OMP', owner: 'Bidang Operasi Manajemen Proyek',
            sparkline: [85,87,90,92,95,97,98,99,100,100,100,100],
            commentary: 'BIM (KPI 9c) tercapai 100% per Jan 2026; E-Proc dan SIDITA fully implemented.', rootCause: '', actionPlan: 'Pertahankan & ekspansi ke proyek baru.' },
          { id: 'pi10', no: 10, name: 'Evaluasi Akurasi Data Aplikasi Monitoring Proyek',                  category: 'PI',  unit: 'Tanggal',    target: 6,        actual: 5,        achievement: 110.00, status: 'success', isInverse: true,  polaritas: 'LB', bobot:  5, nilai:  5.50, bu: 'Bidang Perencanaan', owner: 'Bidang Perencanaan & Project Control',
            sparkline: [7,7,6.5,6.5,6,6,6,5.5,5.5,5,5,5],
            commentary: 'Laporan akurasi data dikirim sebelum tanggal 6 setiap bulan.', rootCause: '', actionPlan: 'Koordinasi rutin dengan DIV & Unit terkait.' },
          { id: 'pi11', no: 11, name: 'Pemenuhan PDN (Penggunaan Dalam Negeri) Korporat',                   category: 'PI',  unit: '%',          target: 95,       actual: 98.30,    achievement: 103.47, status: 'success', isInverse: false, polaritas: 'HB', bobot:  5, nilai:  5.17, bu: 'Bidang Keu/Kom/Umum', owner: 'Bidang Keuangan, Komunikasi & Umum',
            sparkline: [92,93,94,94.5,95,95.5,96,96.5,97,97.5,98,98.30],
            commentary: 'Penggunaan PDN di atas target Pusat (95%).', rootCause: '', actionPlan: 'Koordinasi penyedia barang/jasa lokal.' },
          { id: 'pi12', no: 12, name: 'Proses Bisnis Ekselen & Sustainability (BE/ESG/SMAP)',               category: 'PI',  unit: '%',          target: 100,      actual: 100,      achievement: 100.00, status: 'success', isInverse: false, polaritas: 'HB', bobot:  7, nilai:  7.00, bu: 'Bidang QA/QC', owner: 'Bidang QA/QC',
            sparkline: [85,88,90,92,94,96,97,98,99,100,100,100],
            commentary: 'PLN BE 100%, Maturity Sustainability skor 1,97; SMAP berjalan.', rootCause: '', actionPlan: 'Komite sustainability per UI/UPMK; SOP/IK pemenuhan matlev.' },
          { id: 'pi13', no: 13, name: 'Manajemen SDM, Komunikasi & TJSL',                                   category: 'PI',  unit: '%',          target: 100,      actual: 100,      achievement: 100.00, status: 'success', isInverse: false, polaritas: 'HB', bobot:  5, nilai:  5.00, bu: 'Bidang Keu/Kom/Umum', owner: 'Bidang Keuangan, Komunikasi & Umum',
            sparkline: [95,96,97,98,98.5,99,99,99.5,100,100,100,100],
            commentary: 'HCR, OCR, Produktivitas, dan TJSL on-track.', rootCause: '', actionPlan: 'Assessment kompetensi SJF, knowledge sharing, TJSL SROI.' },
        ],

        // Kepatuhan ? Pengurang max -30 total (gantikan dummy "operational" KPI lama)
        kepatuhan: [
          { no: '14a', name: 'Pengelolaan HSSE (K3, Keamanan, Lingkungan)',         maxPenalty: -8,  applied: 0, target: 'Zero Accident',          status: 'success' },
          { no: '14b', name: 'Maturity Level Kepatuhan (SMAP ISO 37001)',           maxPenalty: -4,  applied: 0, target: 'Sesuai penetapan Pusat', status: 'success' },
          { no: '14c', name: 'Ketepatan Penyampaian Pelaporan & Akurasi Data',      maxPenalty: -10, applied: 0, target: '100% tepat waktu',       status: 'success' },
          { no: '14d', name: 'Tindak Lanjut Temuan Auditor (Internal & Eksternal)', maxPenalty: -5,  applied: 0, target: 'All findings closed',    status: 'success' },
          { no: '14e', name: 'Kejadian Critical Event',                              maxPenalty: -3,  applied: 0, target: '0 kejadian',             status: 'success' },
        ],

        // Summary kinerja keseluruhan Februari 2026 (sumber langsung)
        summary: {
          kpiBobot: 40,  kpiNilai: 45.75,
          piBobot:  60,  piNilai:  63.62,
          totalBobot: 100, totalNilai: 103.87,
          kepatuhanPenalty: 0,
          status: 'Baik', // Baik (=100), Hati-hati (95-99), Masalah (<95)
        },

        // Unit Comparison ? Kantor Induk + 5 UPMK
        buComparison: {
          kpiNames: ['Total Nilai', 'IQC (HK)', '% Konstruksi', 'BIM (%)', 'Capex (%)'],
          rows: [
            { bu: 'Kantor Induk', values: [103.87, 4.58, 93.94, 100, 92.7] },
            { bu: 'UPMK I',       values: [101.30, 4.72, 95.20, 100, 99.2] },
            { bu: 'UPMK II',      values: [105.20, 4.45, 97.50, 100, 96.1] },
            { bu: 'UPMK III',     values: [ 96.40, 4.98, 88.40,  92, 93.3] },
            { bu: 'UPMK IV',      values: [ 99.80, 4.65, 91.20, 100, 95.3] },
            { bu: 'UPMK V',       values: [102.50, 4.50, 94.80, 100, 97.2] },
          ],
        },
      },

      strategic: {
        // BSC adapted for PUSMANPRO context
        perspectives: {
          financial: { name: 'Financial', icon: 'wallet', color: 'chart-1', objectives: [
            { id: 'F1', name: 'Realisasi OPEX Non-Fuel sesuai Beyond RKAP 2026', kpi: 'OPEX',     target: 5.32, actual: 5.20,  owner: 'Bidang Keu/Kom/Umum',  status: 'on-track', isInverse: true },
            { id: 'F2', name: 'Pengendalian Capex 95-100% AKI 2026',              kpi: 'Capex %',  target: 100,  actual: 95.8,  owner: 'Bidang Keu/Kom/Umum',  status: 'on-track' },
            { id: 'F3', name: 'Pemenuhan PDN Korporat = 95%',                     kpi: 'PDN %',    target: 95,   actual: 98.30, owner: 'Bidang Keu/Kom/Umum',  status: 'on-track' },
          ]},
          customer: { name: 'Customer (Pemberi Kerja/UIP)', icon: 'handshake', color: 'chart-2', objectives: [
            { id: 'C1', name: '% Pelaksanaan Konstruksi sesuai PMS',              kpi: '% Konstruksi', target: 100, actual: 93.94, owner: 'Bidang OMP',           status: 'at-risk' },
            { id: 'C2', name: 'Penerbitan IQC = 5 Hari Kerja',                    kpi: 'IQC HK',       target: 5,   actual: 4.58,  owner: 'Bidang QA/QC',          status: 'on-track', isInverse: true },
            { id: 'C3', name: 'Penambahan Kapasitas GI sesuai RKAP (360 MVA)',     kpi: 'GI MVA YTD',   target: 360, actual: 60,    owner: 'Bidang OMP',           status: 'on-track' },
            { id: 'C4', name: 'Penambahan Kapasitas Transmisi 400,34 KMS',         kpi: 'KMS YTD',      target: 400, actual: 0.7,   owner: 'Bidang OMP',           status: 'at-risk' },
          ]},
          internal: { name: 'Internal Process', icon: 'cpu', color: 'chart-3', objectives: [
            { id: 'I1', name: 'Implementasi BIM 4D/5D 100% (KPI 9c RKM)',          kpi: 'BIM %',       target: 100,    actual: 100,  owner: 'Bidang OMP',           status: 'on-track' },
            { id: 'I2', name: 'Akurasi Data Aplikasi Monitoring = Tanggal 6',       kpi: 'Tgl Lapor',   target: 6,      actual: 5,    owner: 'Bidang Perencanaan',    status: 'on-track', isInverse: true },
            { id: 'I3', name: 'Maturity Level SMAP ISO 37001',                      kpi: 'SMAP Level',  target: 'Pusat', actual: 3.49, owner: 'Bidang QA/QC',          status: 'on-track' },
            { id: 'I4', name: 'Maturity Level Sustainability ESG',                  kpi: 'ESG Skor',    target: 'Pusat', actual: 1.97, owner: 'Bidang QA/QC',          status: 'on-track' },
            { id: 'I5', name: 'Kajian Proyek = 12 Hari Kerja',                       kpi: 'Kajian HK',   target: 12,     actual: 8.50, owner: 'Bidang Perencanaan',    status: 'on-track', isInverse: true },
          ]},
          learning: { name: 'Learning & Growth', icon: 'graduation-cap', color: 'chart-5', objectives: [
            { id: 'L1', name: 'HCR/OCR/Produktivitas Pegawai 100%',                 kpi: 'SDM %',       target: 100,    actual: 100,  owner: 'Bidang Keu/Kom/Umum',   status: 'on-track' },
            { id: 'L2', name: 'Sertifikasi SKKNI BIM Tim Inti = 60%',                kpi: 'SKKNI %',     target: 60,     actual: 45,   owner: 'Bidang Keu/Kom/Umum',   status: 'at-risk' },
            { id: 'L3', name: 'Maturity Level Kepatuhan',                            kpi: 'Compliance',  target: 'Pusat', actual: 100, owner: 'Bidang QA/QC',          status: 'on-track' },
            { id: 'L4', name: 'Pengelolaan TJSL (SROI based)',                        kpi: 'TJSL %',      target: 100,    actual: 100,  owner: 'Bidang Keu/Kom/Umum',   status: 'on-track' },
          ]},
        },
        okrs: [
          { obj: 'Mencapai Total Nilai Kinerja PUSMANPRO = 100 sepanjang 2026',     owner: 'General Manager PUSMANPRO',           dueDate: '2026-12-31', progress: 86, status: 'on-track', krs: [
            { name: 'Total Nilai Kinerja Bulanan = 100',     target: 100,  actual: 103.87, status: 'achieved' },
            { name: 'Persentase % Konstruksi = 100%',         target: 100,  actual: 93.94,  status: 'at-risk' },
            { name: 'Pengurang Kepatuhan = 0',                target: 0,    actual: 0,      status: 'achieved' },
          ]},
          { obj: 'Akselerasi Penambahan Kapasitas Infrastruktur 2026',                owner: 'Bidang OMP',                  dueDate: '2026-12-31', progress: 28, status: 'at-risk', krs: [
            { name: 'Pembangkit = 120 MW',                     target: 120,  actual: 23,     status: 'at-risk' },
            { name: 'Transmisi = 400,34 KMS',                  target: 400,  actual: 0.7,    status: 'at-risk' },
            { name: 'Gardu Induk = 360 MVA',                   target: 360,  actual: 60,     status: 'on-track' },
          ]},
          { obj: 'Maturity Digital & BIM Korporat',                                    owner: 'Bidang OMP',                  dueDate: '2026-12-31', progress: 88, status: 'on-track', krs: [
            { name: 'BIM 4D/5D Implementation = 100%',         target: 100,  actual: 100,    status: 'achieved' },
            { name: 'SIDITA Coverage di seluruh UPMK',          target: 100,  actual: 100,    status: 'achieved' },
            { name: 'CDE ACC Single Source of Truth',           target: 100,  actual: 68,     status: 'on-track' },
          ]},
          { obj: 'Build People & Compliance Excellence',                                owner: 'Bidang Keu/Kom/Umum',          dueDate: '2026-12-31', progress: 64, status: 'on-track', krs: [
            { name: 'SKKNI BIM Certification = 60% tim inti',  target: 60,    actual: 45,     status: 'at-risk' },
            { name: 'Maturity Level SMAP ISO 37001',            target: 4,    actual: 3.49,   status: 'on-track' },
            { name: 'Maturity Level Sustainability ESG',        target: 3,    actual: 1.97,   status: 'on-track' },
          ]},
        ],
        strategyMap: {
          // 4 layer Kaplan/Norton ? adapted untuk PUSMANPRO
          nodes: [
            { id: 'F1', layer: 0, label: 'OPEX',                  status: 'on-track' },
            { id: 'F2', layer: 0, label: 'Capex Realisasi',        status: 'on-track' },
            { id: 'F3', layer: 0, label: 'PDN Korporat',           status: 'on-track' },
            { id: 'C1', layer: 1, label: '% Konstruksi',           status: 'at-risk' },
            { id: 'C2', layer: 1, label: 'IQC Tepat Waktu',         status: 'on-track' },
            { id: 'C3', layer: 1, label: 'Tambah Kapasitas GI',    status: 'on-track' },
            { id: 'C4', layer: 1, label: 'Tambah Transmisi',       status: 'at-risk' },
            { id: 'I1', layer: 2, label: 'BIM 4D/5D',              status: 'on-track' },
            { id: 'I2', layer: 2, label: 'Akurasi Data',           status: 'on-track' },
            { id: 'I3', layer: 2, label: 'SMAP ISO 37001',         status: 'on-track' },
            { id: 'I4', layer: 2, label: 'ESG Sustainability',     status: 'on-track' },
            { id: 'I5', layer: 2, label: 'Kajian Proyek',          status: 'on-track' },
            { id: 'L1', layer: 3, label: 'HCR/OCR/Produktivitas',  status: 'on-track' },
            { id: 'L2', layer: 3, label: 'SKKNI BIM',              status: 'at-risk' },
            { id: 'L3', layer: 3, label: 'Compliance',             status: 'on-track' },
            { id: 'L4', layer: 3, label: 'TJSL/Komunikasi',        status: 'on-track' },
          ],
          edges: [
            { from: 'L1', to: 'I1' }, { from: 'L1', to: 'I2' }, { from: 'L1', to: 'I5' },
            { from: 'L2', to: 'I1' }, { from: 'L2', to: 'I5' },
            { from: 'L3', to: 'I3' }, { from: 'L3', to: 'I4' },
            { from: 'L4', to: 'I4' },
            { from: 'I1', to: 'C1' }, { from: 'I1', to: 'C2' },
            { from: 'I2', to: 'C1' },
            { from: 'I5', to: 'C1' }, { from: 'I5', to: 'C3' },
            { from: 'I3', to: 'F2' }, { from: 'I4', to: 'F1' },
            { from: 'C1', to: 'F2' }, { from: 'C2', to: 'F2' },
            { from: 'C3', to: 'F1' }, { from: 'C4', to: 'F1' },
          ],
        },
      },

      humanCapital: {
        kpis: [
          { id: 'tot', label: 'Total Pegawai PUSMANPRO',     value: 481, formatted: '481',       delta:  3.4, icon: 'users' },
          { id: 'tor', label: 'Turnover Rate (YTD)',          value: 2.8, formatted: '2,8%',      delta: -0.6, icon: 'trending-down', isInverse: true },
          { id: 'skk', label: 'Sertifikasi SKKNI BIM',        value:  45, formatted: '45%',       delta: 12.5, icon: 'award' },
          { id: 'prd', label: 'Total Sertifikasi Aktif',      value: 872, formatted: '872',       delta:  8.3, icon: 'badge-check' },
        ],
        // Headcount per 4 Bidang
        headcountByBidang: [
          { name: 'Operasi Manajemen Proyek',       count: 198, share: 41.2 },
          { name: 'QA/QC',                            count:  87, share: 18.1 },
          { name: 'Perencanaan & Project Control',   count:  78, share: 16.2 },
          { name: 'Keuangan, Komunikasi & Umum',      count: 118, share: 24.5 },
        ],
        // Headcount per Unit (Kantor Induk + 5 UPMK) ? used by both old and new renderers
        headcountByBU: [
          { bu: 'Kantor Induk', count: 145, share: 30.1 },
          { bu: 'UPMK I',       count:  68, share: 14.1 },
          { bu: 'UPMK II',      count:  84, share: 17.5 },
          { bu: 'UPMK III',     count:  52, share: 10.8 },
          { bu: 'UPMK IV',      count:  61, share: 12.7 },
          { bu: 'UPMK V',       count:  71, share: 14.8 },
        ],
        ageDistribution: [
          { range: '< 30',  male:  78, female:  42, total: 120 },
          { range: '30–40', male: 124, female:  56, total: 180 },
          { range: '40–50', male:  92, female:  28, total: 120 },
          { range: '> 50',  male:  48, female:  13, total:  61 },
        ],
        // PUSMANPRO-specific training programs
        training: [
          { name: 'BIM 4D/5D Implementation Workshop',                    participants:  84, completion: 100, budget: 1800, actual: 1750, owner: 'Bidang OMP' },
          { name: 'ISO 19650 BIM Information Management Awareness',       participants: 240, completion:  87, budget: 2200, actual: 1950, owner: 'Bidang QA/QC' },
          { name: 'SKKNI BIM Manager/Coordinator Certification (BSI)',     participants:  48, completion:  75, budget: 3500, actual: 2800, owner: 'Bidang Keu/Kom/Umum' },
          { name: 'EIR/BEP Drafting & Review Workshop',                    participants:  65, completion:  92, budget: 1500, actual: 1450, owner: 'Bidang QA/QC' },
          { name: 'K3 Construction Safety Refresh (Annual)',                participants: 481, completion:  96, budget: 2800, actual: 2750, owner: 'Bidang Keu/Kom/Umum' },
          { name: 'Project Management Professional (PMP) Prep',            participants:  36, completion:  67, budget: 4200, actual: 2900, owner: 'Bidang Keu/Kom/Umum' },
          { name: 'Aplikasi SIDITA & Motion PMO',                           participants: 320, completion: 100, budget:  950, actual:  920, owner: 'Bidang Perencanaan' },
          { name: 'SMAP ISO 37001 Internal Auditor',                        participants:  24, completion: 100, budget:  680, actual:  650, owner: 'Bidang QA/QC' },
        ],
        // Sertifikasi Keahlian & Kompetensi PUSMANPRO
        sertifikasi: {
          // Ringkasan per kategori sertifikasi
          kategori: [
            { id: 'skkni-bim',  name: 'SKKNI BIM (Manager/Coordinator)', lembaga: 'BSI/LPJK',   total: 481, tersertifikasi:  48, target: 80, warna: 'chart-1', icon: 'layers',           deskripsi: 'Standar Kompetensi Kerja Nasional Indonesia bidang BIM' },
            { id: 'pmp',        name: 'Project Management Professional', lembaga: 'PMI',         total: 198, tersertifikasi:  36, target: 50, warna: 'chart-2', icon: 'briefcase',        deskripsi: 'Sertifikasi manajemen proyek internasional (PMI)' },
            { id: 'k3-umum',    name: 'K3 Umum / Konstruksi',            lembaga: 'Kemnaker',    total: 481, tersertifikasi: 462, target: 481,warna: 'chart-3', icon: 'hard-hat',         deskripsi: 'Keselamatan & Kesehatan Kerja wajib seluruh pegawai' },
            { id: 'iso-37001',  name: 'ISO 37001 Internal Auditor',       lembaga: 'BSI/TÜV',    total: 87,  tersertifikasi:  24, target: 40, warna: 'chart-4', icon: 'shield-check',     deskripsi: 'Anti-Penyuapan Management System (SMAP)' },
            { id: 'iso-19650',  name: 'ISO 19650 BIM Info Mgmt',          lembaga: 'BSI',         total: 198, tersertifikasi:  72, target: 100,warna: 'chart-5', icon: 'file-check-2',    deskripsi: 'Manajemen informasi menggunakan BIM' },
            { id: 'ppa',        name: 'Pengadaan Barang/Jasa (PBJ)',      lembaga: 'LKPP',        total: 481, tersertifikasi: 148, target: 200,warna: 'chart-1', icon: 'shopping-cart',    deskripsi: 'Sertifikasi pengadaan pemerintah tingkat dasar/lanjut' },
            { id: 'esg',        name: 'ESG & Sustainability Reporting',   lembaga: 'GRI/Inhouse', total: 87,  tersertifikasi:  18, target: 30, warna: 'chart-2', icon: 'leaf',             deskripsi: 'Environmental, Social & Governance reporting' },
            { id: 'pcs',        name: 'Project Cost & Schedule Control',  lembaga: 'AACE/Inhouse',total: 198, tersertifikasi:  64, target: 80, warna: 'chart-3', icon: 'calendar-check-2', deskripsi: 'Pengendalian biaya & jadwal proyek' },
          ],
          // Detail tersertifikasi per unit kerja
          perUnit: [
            { unit: 'Kantor Induk', 'skkni-bim': 22, 'pmp': 18, 'k3-umum': 140, 'iso-37001': 14, 'iso-19650': 34, 'ppa': 62, 'esg': 10, 'pcs': 30 },
            { unit: 'UPMK I',       'skkni-bim':  5, 'pmp':  4, 'k3-umum':  65, 'iso-37001':  3, 'iso-19650':  8, 'ppa': 18, 'esg':  2, 'pcs':  9 },
            { unit: 'UPMK II',      'skkni-bim':  7, 'pmp':  5, 'k3-umum':  81, 'iso-37001':  4, 'iso-19650': 11, 'ppa': 22, 'esg':  3, 'pcs': 12 },
            { unit: 'UPMK III',     'skkni-bim':  4, 'pmp':  3, 'k3-umum':  50, 'iso-37001':  1, 'iso-19650':  6, 'ppa': 14, 'esg':  1, 'pcs':  5 },
            { unit: 'UPMK IV',      'skkni-bim':  5, 'pmp':  3, 'k3-umum':  58, 'iso-37001':  1, 'iso-19650':  7, 'ppa': 16, 'esg':  1, 'pcs':  4 },
            { unit: 'UPMK V',       'skkni-bim':  5, 'pmp':  3, 'k3-umum':  68, 'iso-37001':  1, 'iso-19650':  6, 'ppa': 16, 'esg':  1, 'pcs':  4 },
          ],
        },
      },

      approvals: {
        // 5-stage berjenjang workflow PUSMANPRO — sesuai Workflow_KPI_Pusmanpro.md
        workflow: [
          { stage: 1, fase: 'FASE 1', role: 'staff',     deadline: 'Tgl 1–3',   slaHours: 72,  icon: 'database',        action: 'Pengumpulan Data Mentah',
            pic: 'PIC per Indikator (SM RPC, SM QA&QC, SM OMP, SM OMP, SM KKU, Asman K3L)',
            checklist: [
              'Input KPI #1 Kajian PC — nomor surat, judul, tanggal penyampaian',
              'Input KPI #2 IQC — seluruh record bulan berjalan (No.IQC, pemberi kerja, durasi)',
              'Update KPI #3 Realisasi Progress per proyek aktif',
              'Input PI #4 Kajian Proyek (judul, surat, tanggal terima & kirim, durasi)',
              'Input PI #5-7 Data SLO baru (UPMK, nama proyek, kapasitas MW/KMS/MVA, No.SLO)',
              'Update PI #8 Realisasi OPEX Non Fuel dan AKI (Anggaran Investasi)',
              'Update PI #9 Status E-Procurement, SIDITA, BIM per sub-indikator',
              'Input PI #10 Nomor surat & tanggal penyampaian Akurasi Data Monitoring',
              'Update PI #11-14 realisasi PDN, Bisnis Ekselen, SDM, Kepatuhan di RKM 2026',
            ]
          },
          { stage: 2, fase: 'FASE 2', role: 'asman',     deadline: 'Tgl 4',     slaHours: 24,  icon: 'calculator',      action: 'Kalkulasi & Validasi',
            pic: 'Admin Kinerja / SM RPC',
            checklist: [
              'Periksa formula error: tidak ada #DIV/0!, #REF!, #VALUE!, #NAME?',
              'Cross-check: realisasi RKM 2026 = nilai di tab detail (Layer 1)',
              'Konfirmasi anomali: pencapaian >110% atau <50% — hubungi PIC',
              'Pastikan jumlah record di tab detail cocok dengan yang dilaporkan',
              'Verifikasi bobot total KPI (40) + PI (60) = 100 dan skor tertimbang benar',
            ]
          },
          { stage: 3, fase: 'FASE 3', role: 'manajer',   deadline: 'Tgl 5',     slaHours: 24,  icon: 'clipboard-check', action: 'Review & Approval Senior Manager',
            pic: 'SM OMP (KPI #3, PI #4,5,9) · SM QA&QC (KPI #2) · SM RPC (KPI #1, PI #10,12) · SM OMP (PI #6,7) · SM KKU (PI #8,11,13) · Asman K3L (PI #14)',
            checklist: [
              'Angka realisasi sudah benar dan terdukung bukti / data pendukung',
              'Narasi "Hasil Analisa Program Kerja" diisi untuk setiap indikator',
              'Rencana aksi (action plan) untuk indikator bermasalah sudah disusun',
              'Status risiko dan mitigasi di-update jika ada perubahan signifikan',
            ]
          },
          { stage: 4, fase: 'FASE 4', role: 'srmanajer', deadline: 'Tgl 6',     slaHours: 24,  icon: 'pen-line',        action: 'Finalisasi & Tandatangan GM',
            pic: 'General Manager',
            checklist: [
              'Tandatangan digital/basah pada Laporan Kinerja (Laporan KM)',
              'Tandatangan pada RKM 2026 (Rencana Kerja Manajemen)',
              'Verifikasi skor total dan status keseluruhan (traffic light)',
              'Eskalasi ke Divisi PMO PLN Pusat jika ada isu kebijakan korporat',
            ]
          },
          { stage: 5, fase: 'FASE 5', role: 'gm',        deadline: 'Tgl 7–10',  slaHours: 96,  icon: 'send',            action: 'Distribusi & Arsip',
            pic: 'Admin Kinerja / SM RPC',
            checklist: [
              'Kirim laporan ke DIV PMO PLN Pusat (email resmi)',
              'Kirim laporan akurasi data monitoring proyek (jika belum)',
              'Arsip softcopy di NAS PLN / SharePoint dengan penamaan baku',
              'Update dashboard website kinerja (jika applicable)',
              'Backup workbook: RKM_2026_[BULAN]_v[versi].xlsx',
            ]
          },
        ],
        statusLabels: {
          draft:          'Draft',
          in_review:      'Sedang Review',
          needs_revision: 'Perlu Revisi',
          approved:       'Disetujui',
          rejected:       'Ditolak',
          locked:         'Final & Terkunci',
        },

        // 14 Indikator KPI/PI PUSMANPRO 2026 — sesuai Workflow_KPI_Pusmanpro.md
        indicators: [
          // KPI — Key Performance Indicator (Bobot: 40)
          { no:  1, id:'kpi1',  kat:'KPI', nama:'Evaluasi, Analisa & Rekomendasi Proyek Infrastruktur', satuan:'Dokumen',    target:'3 dok/tahun',      bobot:13, polaritas:'positif',   pic:'SM RPC',                      sumber:'Tab KPI Kajian PC',             fase:'FASE 1 (Tgl 1-3)' },
          { no:  2, id:'kpi2',  kat:'KPI', nama:'Penerbitan IQC Jaminan Kualitas Barang',               satuan:'Hari Kerja', target:'≤ 5 HK',            bobot:13, polaritas:'negatif',   pic:'SM QA&QC',                    sumber:'Tab KPI IQC',                   fase:'FASE 1 (Tgl 1-3)' },
          { no:  3, id:'kpi3',  kat:'KPI', nama:'Persentase Pelaksanaan Konstruksi Proyek',             satuan:'%',          target:'100%',              bobot:14, polaritas:'positif',   pic:'SM OMP',                      sumber:'Tab KPI Prosentase Proyek',     fase:'FASE 1 (Tgl 1-3)' },
          // PI — Performance Indicator (Bobot: 60)
          { no:  4, id:'pi4',   kat:'PI',  nama:'Kajian Proyek Pembangkit, Transmisi & GI',             satuan:'Hari Kerja', target:'≤ 12 HK',           bobot: 5, polaritas:'negatif',   pic:'SM OMP',                      sumber:'Tab PI Kajian',                 fase:'FASE 1 (Tgl 1-3)' },
          { no:  5, id:'pi5',   kat:'PI',  nama:'Penambahan Kapasitas — Pembangkit (MW)',               satuan:'MW',         target:'RKAP 2026',         bobot: 7, polaritas:'positif',   pic:'SM OMP',                      sumber:'Tab PI Penambahan Kapasitas',   fase:'FASE 1 (Tgl 1-3)' },
          { no:  6, id:'pi6',   kat:'PI',  nama:'Penambahan Kapasitas — Transmisi (KMS)',               satuan:'KMS',        target:'RKAP 2026',         bobot: 7, polaritas:'positif',   pic:'SM OMP',                      sumber:'Tab PI Penambahan Kapasitas',   fase:'FASE 1 (Tgl 1-3)' },
          { no:  7, id:'pi7',   kat:'PI',  nama:'Penambahan Kapasitas — Gardu Induk (MVA)',             satuan:'MVA',        target:'RKAP 2026',         bobot: 7, polaritas:'positif',   pic:'SM OMP',                      sumber:'Tab PI Penambahan Kapasitas',   fase:'FASE 1 (Tgl 1-3)' },
          { no:  8, id:'pi8',   kat:'PI',  nama:'Pengendalian Anggaran (OPEX + Investasi/AKI)',         satuan:'Rp / %',     target:'RKAP (Range 95-100%)',bobot:7, polaritas:'range',     pic:'SM KKU',                      sumber:'Tab PI Pengendalian Anggaran',  fase:'FASE 1 (Tgl 1-3)' },
          { no:  9, id:'pi9',   kat:'PI',  nama:'Digitalisasi Aplikasi Korporat (E-Proc, SIDITA, BIM)',satuan:'%',          target:'100%',              bobot: 5, polaritas:'positif',   pic:'SM OMP / MAN RENDAN',         sumber:'Tab PI Digitalisasi Korporat',  fase:'FASE 1 (Tgl 1-3)' },
          { no: 10, id:'pi10',  kat:'PI',  nama:'Evaluasi Akurasi Data Monitoring Proyek',              satuan:'Waktu',      target:'Maks Tgl 6/bulan',  bobot: 5, polaritas:'negatif',   pic:'SM RPC',                      sumber:'Tab PI Akurasi Data Monit.',    fase:'FASE 1 (Tgl 1-3)' },
          { no: 11, id:'pi11',  kat:'PI',  nama:'Pemenuhan PDN Korporat',                               satuan:'%',          target:'≥ 95% (PLN Pusat)', bobot: 5, polaritas:'positif',   pic:'SM KKU / OPM / RPC / QA&QC', sumber:'Tab RKM 2026',                  fase:'FASE 1 (Tgl 1-3)' },
          { no: 12, id:'pi12',  kat:'PI',  nama:'Proses Bisnis Ekselen & Sustainability',               satuan:'Skor / %',   target:'Penetapan PLN Pusat',bobot:7, polaritas:'positif',   pic:'All Senior Leaders',          sumber:'Tab RKM 2026',                  fase:'FASE 1 (Tgl 1-3)' },
          { no: 13, id:'pi13',  kat:'PI',  nama:'Manajemen SDM, Komunikasi & TJSL',                     satuan:'%',          target:'100%',              bobot: 5, polaritas:'positif',   pic:'SM OMP / RPC / QA&QC / KKU', sumber:'Tab RKM 2026',                  fase:'FASE 1 (Tgl 1-3)' },
          { no: 14, id:'pi14',  kat:'PI',  nama:'Kepatuhan (K3, SMAP, Audit) — Pengurang',              satuan:'Poin',       target:'Max −30',           bobot: 0, polaritas:'pengurang', pic:'Asman K3L / SM RPC',          sumber:'Tab RKM 2026',                  fase:'FASE 1 (Tgl 1-3)' },
        ],

        // RACI Summary — Peran & Tanggung Jawab per fungsi utama
        raci: [
          { fungsi: 'Input KPI Kajian PC',       r: 'SM RPC',                              a: 'SM RPC',      c: '',              i: 'GM, SM OMP' },
          { fungsi: 'Input KPI IQC',             r: 'SM QA&QC',                            a: 'SM QA&QC',    c: '',              i: 'GM, SM RPC' },
          { fungsi: 'Input KPI % Konstruksi',    r: 'SM OMP',                              a: 'SM OMP',      c: 'SM RPC',        i: 'GM, All SM' },
          { fungsi: 'Input PI Kajian Proyek',    r: 'SM OMP',                              a: 'SM OMP',      c: '',              i: 'SM RPC' },
          { fungsi: 'Input PI Kapasitas',        r: 'SM OMP, SM OMP',                      a: 'SM OMP',      c: '',              i: 'GM, SM RPC' },
          { fungsi: 'Input PI Anggaran',         r: 'SM KKU',                              a: 'SM KKU',      c: '',              i: 'GM, SM RPC' },
          { fungsi: 'Input PI Digitalisasi',     r: 'SM OMP, MAN RENDAN',                  a: 'SM OMP',      c: '',              i: 'SM RPC' },
          { fungsi: 'Input PI Akurasi Data',     r: 'SM RPC',                              a: 'SM RPC',      c: '',              i: 'GM' },
          { fungsi: 'Input PI Kepatuhan',        r: 'Asman K3L',                           a: 'Asman K3L',   c: 'SM RPC',        i: 'GM' },
          { fungsi: 'Validasi & Kompilasi',      r: 'Admin Kinerja',                       a: 'SM RPC',      c: 'All SM',        i: 'GM' },
          { fungsi: 'Review Laporan',            r: 'All SM',                              a: 'GM',          c: '',              i: 'Div PMO Pusat' },
          { fungsi: 'Tandatangan & Distribusi',  r: 'SM RPC, Admin Kinerja',               a: 'GM',          c: '',              i: 'Div PMO Pusat, BoD' },
        ],

        reports: [
          // KM Februari 2026 � Kantor Induk (current/active)
          { id: 'KM-2026-02-KP', title: 'Laporan KM Februari 2026 — Kantor Induk PUSMANPRO',
            unit: 'Kantor Induk', period: 'Februari 2026', type: 'Monthly KM', priority: 'high',
            submittedBy: { role: 'staff', name: 'Staff Officer Bidang Perencanaan' },
            submittedAt: '2026-04-15T09:30:00+07:00',
            currentStage: 3, status: 'in_review',
            nextApprover: { role: 'manajer', name: 'Manajer Bidang Perencanaan' },
            auditTrail: [
              { stage: 1, actor: 'Staff Officer', role: 'Staff', action: 'submit',  comment: 'Draft KM Februari 2026 selesai. Total Nilai 103,87 (Baik). Highlight: % Pelaksanaan Konstruksi 93,94% (MASALAH).', timestamp: '2026-04-15T09:30:00+07:00' },
              { stage: 2, actor: 'Asman QA/QC',   role: 'Asman', action: 'approve', comment: 'Data IQC dan Kepatuhan terverifikasi. Approve untuk lanjut review substansi Manajer.',                                 timestamp: '2026-04-18T11:20:00+07:00' },
            ],
          },
          // KM Februari 2026 � UPMK I (approved)
          { id: 'KM-2026-02-UPMK1', title: 'Laporan KM Februari 2026 — UPMK I',
            unit: 'UPMK I', period: 'Februari 2026', type: 'Monthly KM', priority: 'medium',
            submittedBy: { role: 'staff', name: 'Staff Officer UPMK I' },
            submittedAt: '2026-04-12T14:00:00+07:00',
            currentStage: 5, status: 'approved',
            auditTrail: [
              { stage: 1, actor: 'Staff Officer UPMK I', role: 'Staff',     action: 'submit',  comment: 'Total Nilai 101,30 (Baik). Capex 99,2%.', timestamp: '2026-04-12T14:00:00+07:00' },
              { stage: 2, actor: 'Asman UPMK I',          role: 'Asman',     action: 'approve', comment: 'OK.',                                       timestamp: '2026-04-13T10:00:00+07:00' },
              { stage: 3, actor: 'Manajer UPMK I',        role: 'Manajer',   action: 'approve', comment: 'Approved.',                                 timestamp: '2026-04-15T14:30:00+07:00' },
              { stage: 4, actor: 'Senior Manajer Bidang',         role: 'SrManajer', action: 'approve', comment: 'Endorsed.',                                 timestamp: '2026-04-17T09:45:00+07:00' },
              { stage: 5, actor: 'General Manager PUSMANPRO',        role: 'GM',        action: 'approve', comment: 'Final approval. Distribute to BoD.',        timestamp: '2026-04-19T16:20:00+07:00' },
            ],
          },
          // KM Februari 2026 � UPMK II (pending Sr Manajer)
          { id: 'KM-2026-02-UPMK2', title: 'Laporan KM Februari 2026 — UPMK II',
            unit: 'UPMK II', period: 'Februari 2026', type: 'Monthly KM', priority: 'high',
            submittedBy: { role: 'staff', name: 'Staff Officer UPMK II' },
            submittedAt: '2026-04-14T13:00:00+07:00',
            currentStage: 4, status: 'in_review',
            nextApprover: { role: 'srmanajer', name: 'Senior Manajer Bidang' },
            auditTrail: [
              { stage: 1, actor: 'Staff Officer UPMK II', role: 'Staff',   action: 'submit',  comment: 'Total Nilai 105,20 (Baik). Top performer Februari 2026.',           timestamp: '2026-04-14T13:00:00+07:00' },
              { stage: 2, actor: 'Asman UPMK II',          role: 'Asman',   action: 'approve', comment: 'Cross-check dengan Aplikasi Motion PMO OK.',                          timestamp: '2026-04-16T09:00:00+07:00' },
              { stage: 3, actor: 'Manajer UPMK II',        role: 'Manajer', action: 'approve', comment: 'Substansi lengkap. Forward ke Senior Manajer untuk konsolidasi.',  timestamp: '2026-04-19T11:15:00+07:00' },
            ],
          },
          // KM Februari 2026 � UPMK III (needs revision)
          { id: 'KM-2026-02-UPMK3', title: 'Laporan KM Februari 2026 — UPMK III',
            unit: 'UPMK III', period: 'Februari 2026', type: 'Monthly KM', priority: 'high',
            submittedBy: { role: 'staff', name: 'Staff Officer UPMK III' },
            submittedAt: '2026-04-13T10:30:00+07:00',
            currentStage: 1, status: 'needs_revision',
            nextApprover: { role: 'staff', name: 'Staff Officer UPMK III (revisi)' },
            auditTrail: [
              { stage: 1, actor: 'Staff Officer UPMK III', role: 'Staff', action: 'submit',           comment: 'Total Nilai 96,40 (Hati-hati). % Konstruksi 88,40%.',                                                                                                  timestamp: '2026-04-13T10:30:00+07:00' },
              { stage: 2, actor: 'Asman UPMK III',          role: 'Asman', action: 'request_revision', comment: 'Mohon koreksi data % Pelaksanaan Konstruksi proyek di Sumatera Selatan — inkonsistensi dengan PMS yang sudah disepakati. Rekonsiliasi dengan Pemberi Kerja sebelum resubmit.', timestamp: '2026-04-16T14:45:00+07:00' },
            ],
          },
          // KM Februari 2026 � UPMK IV (in review at Manajer stage)
          { id: 'KM-2026-02-UPMK4', title: 'Laporan KM Februari 2026 — UPMK IV',
            unit: 'UPMK IV', period: 'Februari 2026', type: 'Monthly KM', priority: 'medium',
            submittedBy: { role: 'staff', name: 'Staff Officer UPMK IV' },
            submittedAt: '2026-04-13T11:00:00+07:00',
            currentStage: 3, status: 'in_review',
            nextApprover: { role: 'manajer', name: 'Manajer UPMK IV' },
            auditTrail: [
              { stage: 1, actor: 'Staff Officer UPMK IV', role: 'Staff', action: 'submit',  comment: 'Total Nilai 99,80 (Hati-hati). % Konstruksi 91,20%.',  timestamp: '2026-04-13T11:00:00+07:00' },
              { stage: 2, actor: 'Asman UPMK IV',          role: 'Asman', action: 'approve', comment: 'Data terverifikasi. Lanjut review Manajer.',           timestamp: '2026-04-15T10:30:00+07:00' },
            ],
          },
          // KM Februari 2026 � UPMK V (draft)
          { id: 'KM-2026-02-UPMK5', title: 'Laporan KM Februari 2026 — UPMK V',
            unit: 'UPMK V', period: 'Februari 2026', type: 'Monthly KM', priority: 'medium',
            submittedBy: { role: 'staff', name: 'Staff Officer UPMK V' },
            submittedAt: null,
            currentStage: 1, status: 'draft',
            nextApprover: null,
            auditTrail: [],
          },
          // Triwulan I 2026 � consolidated
          { id: 'KM-2026-Q1-CONS', title: 'Laporan KM Triwulan I 2026 — Konsolidasi PUSMANPRO',
            unit: 'Konsolidasi', period: 'TW I 2026', type: 'Quarterly Consolidated', priority: 'high',
            submittedBy: { role: 'staff', name: 'Staff Officer Bidang Perencanaan' },
            submittedAt: null,
            currentStage: 1, status: 'draft',
            nextApprover: null,
            auditTrail: [],
          },
          // Historical � locked (Januari 2026)
          { id: 'KM-2026-01-KP', title: 'Laporan KM Januari 2026 — Kantor Induk',
            unit: 'Kantor Induk', period: 'Januari 2026', type: 'Monthly KM', priority: 'medium',
            submittedBy: { role: 'staff', name: 'Staff Officer Bidang Perencanaan' },
            submittedAt: '2026-03-05T08:15:00+07:00',
            currentStage: 5, status: 'locked',
            auditTrail: [
              { stage: 1, actor: 'Staff Officer',  role: 'Staff',     action: 'submit',  comment: 'Total Nilai Jan 2026: 101,50.', timestamp: '2026-03-05T08:15:00+07:00' },
              { stage: 2, actor: 'Asman Verifikator',          role: 'Asman',     action: 'approve', comment: 'OK.',                            timestamp: '2026-03-06T10:00:00+07:00' },
              { stage: 3, actor: 'Manajer Verifikator',        role: 'Manajer',   action: 'approve', comment: 'Approved.',                      timestamp: '2026-03-08T14:30:00+07:00' },
              { stage: 4, actor: 'Senior Manajer Bidang', role: 'SrManajer', action: 'approve', comment: 'Endorsed.',                      timestamp: '2026-03-10T09:45:00+07:00' },
              { stage: 5, actor: 'General Manager PUSMANPRO',role: 'GM',        action: 'approve', comment: 'Final & Locked.',                timestamp: '2026-03-12T16:20:00+07:00' },
            ],
          },
          // Historical � locked (Desember 2025)
          { id: 'KM-2025-12-KP', title: 'Laporan KM Desember 2025 — Kantor Induk',
            unit: 'Kantor Induk', period: 'Desember 2025', type: 'Monthly KM', priority: 'medium',
            submittedBy: { role: 'staff', name: 'Staff Officer Bidang Perencanaan' },
            submittedAt: '2026-02-08T08:00:00+07:00',
            currentStage: 5, status: 'locked',
            auditTrail: [
              { stage: 1, actor: 'Staff Officer',  role: 'Staff',     action: 'submit',  comment: 'Total Nilai Des 2025: 99,80.', timestamp: '2026-02-08T08:00:00+07:00' },
              { stage: 2, actor: 'Asman Verifikator',          role: 'Asman',     action: 'approve', comment: 'OK.',                           timestamp: '2026-02-10T10:00:00+07:00' },
              { stage: 3, actor: 'Manajer Verifikator',        role: 'Manajer',   action: 'approve', comment: 'Approved.',                     timestamp: '2026-02-13T11:00:00+07:00' },
              { stage: 4, actor: 'Senior Manajer Bidang', role: 'SrManajer', action: 'approve', comment: 'Endorsed.',                     timestamp: '2026-02-17T14:00:00+07:00' },
              { stage: 5, actor: 'General Manager PUSMANPRO',role: 'GM',        action: 'approve', comment: 'Final & Locked.',               timestamp: '2026-02-20T16:00:00+07:00' },
            ],
          },
        ],
      },

      userPrefs: {
        theme: 'dark',
        language: 'id',
        defaultPeriod: 'monthly',
        notifications: {
          approvalRequest: { enabled: true,  email: true,  inApp: true  },
          needsRevision:   { enabled: true,  email: true,  inApp: true  },
          kpiBelowTarget:  { enabled: true,  email: false, inApp: true,  threshold: 95 },
          slaWarning:      { enabled: true,  email: true,  inApp: true,  hoursBefore: 12 },
          finalApproved:   { enabled: false, email: false, inApp: true  },
        },
        roleAssignments: { KP: 'gm', UPMK1: 'manajer', UPMK2: 'manajer', UPMK3: 'asman', UPMK4: 'asman', UPMK5: 'staff' },
      },

      auditLog: [
        { id:'AL001', timestamp:'2026-04-30T14:32:00+07:00', user:'General Manager PUSMANPRO',  role:'GM',        action:'login',   entity:'System',           detail:'Login berhasil dari perangkat Windows / Chrome' },
        { id:'AL002', timestamp:'2026-04-30T13:45:00+07:00', user:'Manajer Bidang',   role:'Manajer',   action:'approve', entity:'KM-2026-02-UPMK4', detail:'Approve laporan KM UPMK IV Februari 2026 ke Stage 4' },
        { id:'AL003', timestamp:'2026-04-30T11:20:00+07:00', user:'Senior Manajer Bidang',   role:'SrManajer', action:'approve', entity:'KM-2026-02-UPMK2', detail:'Endorse laporan KM UPMK II Februari 2026 ke Stage 5' },
        { id:'AL004', timestamp:'2026-04-30T09:15:00+07:00', user:'Staff Officer',    role:'Staff',     action:'submit',  entity:'KM-2026-02-KP',    detail:'Submit Draft KM Februari 2026 — Total Nilai 103,87' },
        { id:'AL005', timestamp:'2026-04-29T16:45:00+07:00', user:'General Manager PUSMANPRO',  role:'GM',        action:'export',  entity:'Executive Summary', detail:'Export laporan PDF Executive Summary Februari 2026' },
        { id:'AL006', timestamp:'2026-04-29T14:20:00+07:00', user:'Manajer Bidang',   role:'Manajer',   action:'edit',    entity:'KPI kp4',          detail:'Update commentary % Pelaksanaan Konstruksi — action plan baru' },
        { id:'AL007', timestamp:'2026-04-28T10:30:00+07:00', user:'Asisten Manajer',  role:'Asman',     action:'approve', entity:'KM-2026-02-UPMK4', detail:'Verifikasi data Sub-Bidang UPMK IV — approved ke Manajer' },
        { id:'AL008', timestamp:'2026-04-27T15:10:00+07:00', user:'Asisten Manajer',  role:'Asman',     action:'reject',  entity:'KM-2026-02-UPMK3', detail:'Return laporan UPMK III — inkonsistensi data % konstruksi' },
        { id:'AL009', timestamp:'2026-04-26T13:00:00+07:00', user:'Staff Officer',    role:'Staff',     action:'edit',    entity:'KM-2026-02-UPMK3', detail:'Revisi data % Konstruksi sesuai catatan Asman' },
        { id:'AL010', timestamp:'2026-04-25T11:45:00+07:00', user:'Senior Manajer Bidang',   role:'SrManajer', action:'login',   entity:'System',           detail:'Login berhasil — akses dari Jakarta' },
        { id:'AL011', timestamp:'2026-04-24T09:20:00+07:00', user:'General Manager PUSMANPRO',  role:'GM',        action:'approve', entity:'KM-2026-02-UPMK1', detail:'Final approval KM UPMK I Februari 2026 — distribute to BoD' },
        { id:'AL012', timestamp:'2026-04-23T16:30:00+07:00', user:'Manajer Bidang',   role:'Manajer',   action:'approve', entity:'KM-2026-02-UPMK1', detail:'Review substansi UPMK I — approved ke Stage 4' },
        { id:'AL013', timestamp:'2026-04-22T14:15:00+07:00', user:'Staff Officer',    role:'Staff',     action:'export',  entity:'Operational KPIs', detail:'Export data KPI operasional format Excel' },
        { id:'AL014', timestamp:'2026-04-21T10:00:00+07:00', user:'Asisten Manajer',  role:'Asman',     action:'edit',    entity:'KPI pi9',          detail:'Update target BIM Adoption Q2 2026' },
        { id:'AL015', timestamp:'2026-04-19T09:45:00+07:00', user:'General Manager PUSMANPRO',  role:'GM',        action:'approve', entity:'KM-2025-12-KP',    detail:'Final sign-off KM Desember 2025 — locked' },
        { id:'AL016', timestamp:'2026-04-18T11:20:00+07:00', user:'Asisten Manajer',  role:'Asman',     action:'approve', entity:'KM-2026-02-KP',    detail:'Data IQC dan Kepatuhan terverifikasi — approved ke Manajer' },
        { id:'AL017', timestamp:'2026-04-15T09:30:00+07:00', user:'Staff Officer',    role:'Staff',     action:'submit',  entity:'KM-2026-02-KP',    detail:'Submit draft KM Kantor Induk untuk review Asman' },
      ],

      // =========================================================
      // FASE 12 — Risk Register PUSMANPRO
      // =========================================================
      risk: {
        kpis: [
          { id: 'total',     label: 'Total Risiko Aktif',        value: 20, formatted: '20',    delta: -2,   icon: 'shield-alert',   isInverse: true },
          { id: 'critical',  label: 'Risiko Critical/High',       value:  6, formatted: '6',     delta: -1,   icon: 'alert-triangle', isInverse: true },
          { id: 'mitigated', label: '% Risiko Dimitigasi',        value: 65, formatted: '65%',   delta:  8.3, icon: 'shield-check' },
          { id: 'residual',  label: 'Avg Residual Risk Score',    value: 6.8,formatted: '6,8',   delta: -0.9, icon: 'activity',       isInverse: true },
        ],
        categories: ['Teknis','Finansial','Hukum/Regulasi','HSSE','SDM','Lingkungan'],
        register: [
          // Risiko CRITICAL (score 20-25)
          { id:'RK-001', desc:'Keterlambatan penerbitan izin konstruksi PLN oleh Pemerintah Daerah menyebabkan mundurnya COD',      cat:'Hukum/Regulasi', unit:'UPMK III', l:5, i:5, owner:'Bidang OMP',          status:'open',      mitigation:'Koordinasi intensif dengan PLN UIW dan Pemda setempat; eskalasi ke Pusat jika >30 hari',       mitigationPct:30, dueDate:'2026-06-30' },
          { id:'RK-002', desc:'Kecelakaan kerja fatal (fatality) pada proyek konstruksi transmisi di area terpencil Sulawesi',      cat:'HSSE',           unit:'UPMK V',   l:4, i:5, owner:'Bidang Keu/Kom/Umum', status:'mitigated', mitigation:'Implementasi JSA wajib, pengawasan K3 harian, distribusi APD tier-1 untuk seluruh pekerja',    mitigationPct:85, dueDate:'2026-12-31' },
          // Risiko HIGH (score 12-19)
          { id:'RK-003', desc:'Eskalasi harga bahan baku (besi, beton, kabel) melebihi asumsi RKAP 2026 hingga >15%',              cat:'Finansial',      unit:'KP',       l:4, i:4, owner:'Bidang Keu/Kom/Umum', status:'in-progress',mitigation:'Klausa price escalation dalam kontrak; negosiasi multi-vendor; buffer Capex 5%',              mitigationPct:55, dueDate:'2026-09-30' },
          { id:'RK-004', desc:'Pemasok/Kontraktor spesialis BIM mengalami kebangkrutan atau wanprestasi kontrak',                   cat:'Teknis',         unit:'KP',       l:3, i:5, owner:'Bidang OMP',          status:'in-progress',mitigation:'Dual-vendor strategy; klausul performance bond 10%; verifikasi keuangan kontraktor triwulanan',  mitigationPct:60, dueDate:'2026-06-30' },
          { id:'RK-005', desc:'Gangguan cuaca ekstrem (banjir/longsor) menghambat akses proyek di Sumatera Selatan >3 bulan',      cat:'Lingkungan',     unit:'UPMK III', l:4, i:4, owner:'Bidang OMP',          status:'open',      mitigation:'Revisi jadwal konstruksi, penyiapan jalur alternatif, koordinasi dengan BPBD setempat',       mitigationPct:25, dueDate:'2026-08-31' },
          { id:'RK-006', desc:'Data entry PMS/SIDITA tidak akurat menyebabkan salah pelaporan % Konstruksi ke Korporat',           cat:'Teknis',         unit:'KP',       l:4, i:3, owner:'Bidang Perencanaan',  status:'mitigated', mitigation:'Rekonsiliasi data mingguan; training SIDITA ulang; checker 4-eyes principle sebelum submit',    mitigationPct:90, dueDate:'2026-04-30' },
          // Risiko MEDIUM (score 6-11)
          { id:'RK-007', desc:'Turnover pegawai spesialis BIM (key person dependency) menurunkan kapasitas deliverable OMP',        cat:'SDM',            unit:'KP',       l:3, i:4, owner:'Bidang Keu/Kom/Umum', status:'in-progress',mitigation:'Sertifikasi cross-training, insentif retensi, knowledge transfer program triwulanan',           mitigationPct:50, dueDate:'2026-09-30' },
          { id:'RK-008', desc:'Perubahan regulasi TKDN/PDN mid-year berdampak pada pemilihan vendor yang sudah dikontrak',          cat:'Hukum/Regulasi', unit:'KP',       l:3, i:4, owner:'Bidang QA/QC',        status:'open',      mitigation:'Pantau BPKP & LKPP; siapkan adendum kontrak; konsultasi legal periodik',                     mitigationPct:20, dueDate:'2026-07-31' },
          { id:'RK-009', desc:'Keterlambatan pembayaran termin oleh PLN UIK/UIW menyebabkan cashflow kontraktor terganggu',         cat:'Finansial',      unit:'UPMK II',  l:3, i:3, owner:'Bidang Keu/Kom/Umum', status:'mitigated', mitigation:'Monitoring AR mingguan; eskalasi ke Direktur jika >45 hari; fasilitas supply chain finance',   mitigationPct:80, dueDate:'2026-12-31' },
          { id:'RK-010', desc:'Server CDE (Common Data Environment) ACC mengalami downtime >24 jam berdampak pada deadline BIM',   cat:'Teknis',         unit:'KP',       l:2, i:4, owner:'Bidang OMP',          status:'mitigated', mitigation:'SLA tier-1 dengan Autodesk; backup server lokal; DRP teruji setiap semester',                  mitigationPct:75, dueDate:'2026-12-31' },
          { id:'RK-011', desc:'Protes masyarakat (NIMBY) terhadap rute transmisi baru di Papua menghambat right-of-way',           cat:'Lingkungan',     unit:'UPMK V',   l:3, i:3, owner:'Bidang OMP',          status:'open',      mitigation:'Sosialisasi publik proaktif; koordinasi Pemerintah Daerah; kompensasi lahan sesuai regulasi',  mitigationPct:40, dueDate:'2026-06-30' },
          { id:'RK-012', desc:'Kegagalan audit sertifikasi ISO 37001 (SMAP) menyebabkan pencabutan sertifikat BSI',                cat:'Hukum/Regulasi', unit:'KP',       l:2, i:4, owner:'Bidang QA/QC',        status:'mitigated', mitigation:'Internal audit Q1 & Q3; corrective action tracking; management review bulanan',               mitigationPct:82, dueDate:'2026-12-31' },
          { id:'RK-013', desc:'Kenaikan suku bunga BI melebihi asumsi RKAP memperbesar beban bunga proyek multi-year',             cat:'Finansial',      unit:'KP',       l:2, i:3, owner:'Bidang Keu/Kom/Umum', status:'open',      mitigation:'Hedging suku bunga; refinancing opsi; koordinasi dengan treasury PLN Pusat',                  mitigationPct:35, dueDate:'2026-09-30' },
          { id:'RK-014', desc:'Personel UPMK IV tidak memenuhi target jam diklat 40 JPL per tahun (SDM)',                           cat:'SDM',            unit:'UPMK IV',  l:3, i:2, owner:'Bidang Keu/Kom/Umum', status:'in-progress',mitigation:'Webinar internal bulanan; e-learning PLN; penugasan ke Diklat PLN Pusdiklat',                  mitigationPct:60, dueDate:'2026-12-31' },
          { id:'RK-015', desc:'Insiden keselamatan kerja ringan (LTI) di site proyek GI Sumatera Utara',                            cat:'HSSE',           unit:'UPMK IV',  l:2, i:3, owner:'Bidang Keu/Kom/Umum', status:'mitigated', mitigation:'Safety briefing harian; pengecekan APD; STOP work authority diberdayakan',                     mitigationPct:88, dueDate:'2026-12-31' },
          // Risiko LOW (score 1-5)
          { id:'RK-016', desc:'Fluktuasi nilai tukar USD mempengaruhi harga impor peralatan gardu induk (trafo)',                   cat:'Finansial',      unit:'KP',       l:2, i:2, owner:'Bidang Keu/Kom/Umum', status:'mitigated', mitigation:'Forward contract treasury; buffer kurs 5% dalam RKAP; monitoring BI rate mingguan',           mitigationPct:70, dueDate:'2026-12-31' },
          { id:'RK-017', desc:'Delay deliverable EIR/BEP dari kontraktor BIM melebihi 2 minggu dari jadwal milestone',             cat:'Teknis',         unit:'UPMK I',   l:2, i:2, owner:'Bidang QA/QC',        status:'mitigated', mitigation:'Milestone tracking mingguan; denda keterlambatan; early warning 2 minggu sebelum deadline',    mitigationPct:75, dueDate:'2026-06-30' },
          { id:'RK-018', desc:'Laporan KM terlambat disubmit oleh unit menyebabkan nilai pengurang Kepatuhan',                      cat:'Hukum/Regulasi', unit:'KP',       l:2, i:2, owner:'Bidang Perencanaan',  status:'mitigated', mitigation:'Sistem reminder otomatis D-7, D-3, D-1; eskalasi ke Manajer jika belum submit D-1',           mitigationPct:95, dueDate:'2026-12-31' },
          { id:'RK-019', desc:'Ketidaksesuaian minor spesifikasi teknis pada IQC yang diterbitkan',                                  cat:'Teknis',         unit:'UPMK II',  l:1, i:3, owner:'Bidang QA/QC',        status:'mitigated', mitigation:'4-eyes review checklist IQC; template standar nasional; training QC engineer',               mitigationPct:90, dueDate:'2026-12-31' },
          { id:'RK-020', desc:'Kegagalan minor sistem SIDITA (crash/bug) menghambat input data laporan harian selama <1 hari',     cat:'Teknis',         unit:'KP',       l:1, i:2, owner:'Bidang Perencanaan',  status:'mitigated', mitigation:'SLA support 4 jam dengan vendor SIDITA; backup input manual; helpdesk internal',              mitigationPct:95, dueDate:'2026-12-31' },
        ],
        trend: {
          months: ['Sep 25','Okt 25','Nov 25','Des 25','Jan 26','Feb 26'],
          open:      [18, 19, 22, 21, 18, 12],
          mitigated: [12, 14, 15, 16, 18, 13],
          critical:  [ 4,  5,  7,  6,  5,  3],
        },
      },

      // =========================================================
      // FASE 14 — Kontrak Manajemen (KM) PUSMANPRO 2026
      // =========================================================
      workflowKM: {
        meta: {
          tahun: 2026, versiSpec: '2.2',
          statusWF2: 'IN_REVIEW_SM', periodeAktif: 'Tw-I 2026',
        },
        statusBidang: [
          { bidang:'OMP',   peran:'Operasional', maker:'Suryo P.',  status:'APPROVED',     sla:null,      updatedAt:'2026-04-28' },
          { bidang:'QA-QC', peran:'Mutu',        maker:'Indra W.',  status:'IN_REVIEW_C2', sla:'1 HK',    updatedAt:'2026-04-30' },
          { bidang:'KKU',   peran:'Keuangan',    maker:'Rahmi A.',  status:'IN_REVIEW_C1', sla:'2 HK',    updatedAt:'2026-05-01' },
          { bidang:'RPC',   peran:'Perencanaan', maker:'Dimas F.',  status:'APPROVED',     sla:null,      updatedAt:'2026-04-27' },
        ],
        statusUPMK: [
          { unit:'UPMK I',   mgrUPMK:'Hartanto S.', status:'APPROVED',     sla:null,       updatedAt:'2026-04-29', kapasitas:{ mw:8420,  kms:3215, mva:12400 } },
          { unit:'UPMK II',  mgrUPMK:'Febriana L.', status:'IN_REVIEW_C1', sla:'2 HK',     updatedAt:'2026-05-02', kapasitas:{ mw:6850,  kms:2870, mva:9800  } },
          { unit:'UPMK III', mgrUPMK:'Yusuf M.',    status:'APPROVED',     sla:null,       updatedAt:'2026-04-30', kapasitas:{ mw:7200,  kms:3100, mva:11500 } },
          { unit:'UPMK IV',  mgrUPMK:'Rini C.',     status:'RETURNED',     sla:'OVERDUE',  updatedAt:'2026-05-03', kapasitas:{ mw:5500,  kms:2450, mva:8600  } },
          { unit:'UPMK V',   mgrUPMK:'Agus T.',     status:'APPROVED',     sla:null,       updatedAt:'2026-04-28', kapasitas:{ mw:4800,  kms:1980, mva:7200  } },
        ],
        kpiKantorInduk: [
          { no:'KPI-1',      indikator:'Capex Realisasi vs RKAP',           formula:'(Realisasi/Target)×100',        satuan:'%',           bobot:15, target:95,   realisasi:87.3, polarity:'HIGHER_IS_BETTER' },
          { no:'KPI-2',      indikator:'Supervisi Proyek — Dokumen Tepat',  formula:'(Dok Tepat/Total Dok)×100',     satuan:'%',           bobot:12, target:90,   realisasi:88.5, polarity:'HIGHER_IS_BETTER' },
          { no:'KPI-3',      indikator:'IQC — Rata-rata Durasi',            formula:'Rata-rata hari kalender',       satuan:'Hari',        bobot:10, target:180,  realisasi:195,  polarity:'LOWER_IS_BETTER'  },
          { no:'KPI-4',      indikator:'Kepatuhan Laporan Bulanan',         formula:'(Lap Tepat/Total)×100',         satuan:'%',           bobot:10, target:100,  realisasi:100,  polarity:'HIGHER_IS_BETTER' },
          { no:'KPI-5',      indikator:'Kapasitas Pembangkit COD',          formula:'ΣMW COD / Target MW',           satuan:'MW',          bobot:15, target:1200, realisasi:980,  polarity:'HIGHER_IS_BETTER' },
          { no:'KPI-6',      indikator:'Transmisi Baru Beroperasi',         formula:'ΣKms / Target Kms',             satuan:'KMS',         bobot:10, target:450,  realisasi:412,  polarity:'HIGHER_IS_BETTER' },
          { no:'KPI-7',      indikator:'GI Baru COD',                       formula:'ΣMVA COD / Target MVA',         satuan:'MVA',         bobot:10, target:2400, realisasi:2280, polarity:'HIGHER_IS_BETTER' },
          { no:'KPI-8',      indikator:'NAC — Penghematan Biaya',           formula:'(Realisasi/Target)×100',        satuan:'Rp Miliar',   bobot:8,  target:125,  realisasi:118.4,polarity:'HIGHER_IS_BETTER' },
          { no:'KPI-9',      indikator:'Tingkat Kecelakaan Kerja',          formula:'LTA rate',                      satuan:'Per juta HK', bobot:5,  target:0,    realisasi:0,    polarity:'LOWER_IS_BETTER'  },
          { no:'KPI-10',     indikator:'K3 — Safety Observation Card',      formula:'(SOC selesai/Total)×100',       satuan:'%',           bobot:5,  target:80,   realisasi:72,   polarity:'HIGHER_IS_BETTER' },
          { no:'Pengurang-1',     indikator:'Keterlambatan COD > 3 bulan',       formula:'−1 per kejadian, max −3',       satuan:'Poin',        bobot:-3, target:0,    realisasi:-1,   polarity:'LOWER_IS_BETTER'  },
          { no:'Pengurang-2',     indikator:'Temuan BPK/Itjen tidak ditindak',   formula:'−1 per temuan, max −3',         satuan:'Poin',        bobot:-3, target:0,    realisasi:0,    polarity:'LOWER_IS_BETTER'  },
          { no:'Pengurang-3',     indikator:'Kecelakaan Fatal (Fatality)',        formula:'−3 per kejadian',               satuan:'Poin',        bobot:-3, target:0,    realisasi:0,    polarity:'LOWER_IS_BETTER'  },
        ],
        kpiUPMK: [
          { no:'KPI-U1', indikator:'Kapasitas Pembangkit COD per Unit',     formula:'ΣMW COD / Target MW',         satuan:'MW',  bobot:20, targetLabel:'Sesuai KM',  polarity:'HIGHER_IS_BETTER' },
          { no:'KPI-U2', indikator:'Transmisi Baru Beroperasi per Unit',    formula:'ΣKms / Target Kms',           satuan:'KMS', bobot:20, targetLabel:'Sesuai KM',  polarity:'HIGHER_IS_BETTER' },
          { no:'KPI-U3', indikator:'GI Baru COD per Unit',                  formula:'ΣMVA COD / Target MVA',       satuan:'MVA', bobot:20, targetLabel:'Sesuai KM',  polarity:'HIGHER_IS_BETTER' },
          { no:'KPI-U4', indikator:'% Konstruksi Tepat Waktu',              formula:'(Proyek Tepat/Total)×100',    satuan:'%',   bobot:15, targetLabel:'≥ 85%',      polarity:'HIGHER_IS_BETTER' },
          { no:'KPI-U5', indikator:'Kepatuhan Laporan UPMK',               formula:'(Lap Tepat/Total)×100',       satuan:'%',   bobot:10, targetLabel:'100%',       polarity:'HIGHER_IS_BETTER' },
          { no:'KPI-U6', indikator:'Supervisi & IQC per Unit',              formula:'Avg hari IQC',                satuan:'Hari',bobot:10, targetLabel:'≤ 180 hari', polarity:'LOWER_IS_BETTER'  },
          { no:'KPI-U7', indikator:'K3 — Zero Fatality',                    formula:'Jumlah fatality',             satuan:'Kejadian',bobot:5,targetLabel:'0',        polarity:'LOWER_IS_BETTER'  },
        ],
        knownIssues: [
          { id:'ISS-01', severity:'critical', desc:'UPMK IV & V: bobot = 88 (unit tanpa pembangkit) — blokir WF-1b',          status:'RESOLVED', fix:'Bobot adjusted 100 diterapkan untuk UPMK non-generation; redistribusi 12 poin KPI-U1 ke KPI-U2/U3 (+6 each) saat unit=non-gen' },
          { id:'ISS-02', severity:'critical', desc:'Rumus bobot UPMK tanpa pembangkit belum dikonfirmasi manajemen',           status:'RESOLVED', fix:'Telah disetujui SM Perencanaan via Memo PUSMANPRO/RPC/2026/IV-12 — ratifikasi formal saat WF-2 sign-off' },
          { id:'ISS-03', severity:'medium',   desc:'Terminologi "Kontrak Kinerja" vs "Kontrak Manajemen" tidak konsisten',     status:'RESOLVED', fix:'Telah standardisasi ke "Kontrak Manajemen" di seluruh dashboard & dokumen template' },
          { id:'ISS-04', severity:'medium',   desc:'Tahun RKAP pada target KPI-8 belum dikonfirmasi (2025 vs 2026)',          status:'OPEN',     fix:'Gunakan RKAP 2026 default; konfirmasi ke Bidang KKU' },
          { id:'ISS-05', severity:'info',     desc:'File A sudah menyertakan daftar GI terbaru',                               status:'RESOLVED', fix:'Diselesaikan via File A' },
          { id:'ISS-06', severity:'medium',   desc:'Deviasi ±5% kapasitas UPMK vs agregat nasional belum divalidasi',         status:'OPEN',     fix:'Validasi manual per unit sementara menunggu API kapasitas' },
        ],
        pendingApprovals: [
          { docId:'WF1-2026-QA-QC', tipe:'WF-1',  bidangUnit:'QA-QC',   holder:'Checker-2', deadline:'2026-05-08', slaRemain:'1 HK',    action:'Review & Approve' },
          { docId:'WF1-2026-KKU',   tipe:'WF-1',  bidangUnit:'KKU',     holder:'Checker-1', deadline:'2026-05-09', slaRemain:'2 HK',    action:'Review & Forward' },
          { docId:'WF1b-2026-U2',   tipe:'WF-1b', bidangUnit:'UPMK II', holder:'Checker-1', deadline:'2026-05-09', slaRemain:'2 HK',    action:'Review & Forward' },
          { docId:'WF1b-2026-U4',   tipe:'WF-1b', bidangUnit:'UPMK IV', holder:'Maker',     deadline:'2026-05-06', slaRemain:'OVERDUE', action:'Revisi & Resubmit' },
        ],
        auditRecent: [
          { ts:'2026-05-03 14:22', actor:'Rini C. (Maker UPMK IV)',   action:'RETURNED', doc:'WF1b-2026-U4', note:'Bobot total tidak 100, perlu revisi ISS-01' },
          { ts:'2026-05-02 09:15', actor:'Agus T. (Mgr UPMK V)',     action:'APPROVED', doc:'WF1b-2026-U5', note:'-' },
          { ts:'2026-04-30 16:44', actor:'Yusuf M. (Mgr UPMK III)',  action:'APPROVED', doc:'WF1b-2026-U3', note:'-' },
          { ts:'2026-04-28 11:30', actor:'Hartanto S. (Mgr UPMK I)', action:'APPROVED', doc:'WF1b-2026-U1', note:'-' },
          { ts:'2026-04-28 08:55', actor:'Dimas F. (SM RPC)',         action:'APPROVED', doc:'WF1-2026-RPC', note:'-' },
        ],
      },
    };

    // Derived helpers
    const ROLE_TO_STAGE = { staff: 1, asman: 2, manajer: 3, srmanajer: 4, gm: 5 };

    const getPendingApprovalsForRole = (role) => {
      const stage = ROLE_TO_STAGE[role];
      return DATA.approvals.reports.filter(r => {
        if (r.status === 'needs_revision') return role === 'staff';
        if (r.status === 'draft')          return role === 'staff';
        return r.currentStage === stage && r.status === 'in_review';
      });
    };

    const getReportProgress = (r) => Math.round((r.currentStage / 5) * 100);

    // =========================================================
    // CHART REGISTRY ? destroy on navigation (used from Fase 5+)
    // =========================================================
    const chartRegistry = new Map();
    const registerChart = (id, instance) => {
      if (chartRegistry.has(id)) chartRegistry.get(id).destroy();
      chartRegistry.set(id, instance);
    };
    const destroyAllCharts = () => {
      chartRegistry.forEach(c => { try { c.destroy(); } catch(e){} });
      chartRegistry.clear();
    };

    // =========================================================
    // CHART.JS THEME (Fase 4) ? apply CSS custom props as defaults
    // =========================================================
    const chartTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      return {
        text:        cs.getPropertyValue('--color-text').trim(),
        textMuted:   cs.getPropertyValue('--color-text-muted').trim(),
        textSubtle:  cs.getPropertyValue('--color-text-subtle').trim(),
        border:      cs.getPropertyValue('--color-border').trim(),
        surface:     cs.getPropertyValue('--color-surface').trim(),
        surface2:    cs.getPropertyValue('--color-surface-2').trim(),
        accent:      cs.getPropertyValue('--color-accent').trim(),
        success:     cs.getPropertyValue('--color-success').trim(),
        warning:     cs.getPropertyValue('--color-warning').trim(),
        danger:      cs.getPropertyValue('--color-danger').trim(),
        info:        cs.getPropertyValue('--color-info').trim(),
        palette: [
          cs.getPropertyValue('--chart-1').trim(),
          cs.getPropertyValue('--chart-2').trim(),
          cs.getPropertyValue('--chart-3').trim(),
          cs.getPropertyValue('--chart-4').trim(),
          cs.getPropertyValue('--chart-5').trim(),
          cs.getPropertyValue('--chart-6').trim(),
        ],
      };
    };

    // Add alpha to a hex color (#RRGGBB ? #RRGGBBAA)
    const withAlpha = (hex, alpha) => {
      const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, '0');
      return hex.length === 7 ? hex + a : hex;
    };

    const setupChartDefaults = () => {
      if (!window.Chart) return;
      const t = chartTheme();
      Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
      Chart.defaults.font.size = 11;
      Chart.defaults.color = t.textMuted;
      Chart.defaults.borderColor = withAlpha(t.border, 0.5);
      Chart.defaults.responsive = true;
      Chart.defaults.maintainAspectRatio = false;
      
      Chart.defaults.plugins = Chart.defaults.plugins || {};
      
      // Explicitly configure title to prevent _computeTitleHeight crash
      Chart.defaults.plugins.title = Chart.defaults.plugins.title || {};
      Chart.defaults.plugins.title.display = false;
      Chart.defaults.plugins.title.font = Chart.defaults.plugins.title.font || { size: 12 };

      if (Chart.defaults.plugins.tooltip) {
        Chart.defaults.plugins.tooltip.enabled = true;
        Chart.defaults.plugins.tooltip.backgroundColor = t.surface;
        Chart.defaults.plugins.tooltip.titleColor = t.text;
        Chart.defaults.plugins.tooltip.bodyColor = t.textMuted;
        Chart.defaults.plugins.tooltip.borderColor = t.border;
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.padding = 10;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.tooltip.displayColors = true;
        Chart.defaults.plugins.tooltip.boxPadding = 4;
        Chart.defaults.plugins.tooltip.titleFont = { size: 12, weight: '600' };
        Chart.defaults.plugins.tooltip.bodyFont = { size: 11 };
      }
      if (Chart.defaults.plugins.legend) {
        Chart.defaults.plugins.legend.position = 'bottom';
        Chart.defaults.plugins.legend.align = 'start';
        if (Chart.defaults.plugins.legend.labels) {
          Chart.defaults.plugins.legend.labels.boxWidth = 10;
          Chart.defaults.plugins.legend.labels.boxHeight = 10;
          Chart.defaults.plugins.legend.labels.padding = 14;
          Chart.defaults.plugins.legend.labels.font = { size: 11 };
          Chart.defaults.plugins.legend.labels.usePointStyle = true;
        }
      }
      Chart.defaults.animation = { duration: 800, easing: 'easeOutQuart' };
    };

    // Re-apply chart theme on toggle (updates existing instances)
    const refreshChartTheme = () => {
      setupChartDefaults();
      const t = chartTheme();
      chartRegistry.forEach(c => {
        try {
          if (c.options.plugins && c.options.plugins.tooltip) {
            Object.assign(c.options.plugins.tooltip, {
              backgroundColor: t.surface, titleColor: t.text,
              bodyColor: t.textMuted, borderColor: t.border,
            });
          }
          if (c.options.scales) {
            Object.values(c.options.scales).forEach(s => {
              if (s.grid) s.grid.color = withAlpha(t.border, 0.5);
              if (s.ticks) s.ticks.color = t.textMuted;
            });
          }
          c.update('none');
        } catch (e) {}
      });
    };

    // =========================================================
    // CHART FACTORIES
    // =========================================================
    const ChartFactory = {
      sparkline(canvas, data, opts = {}) {
        const t = chartTheme();
        const color = opts.color || t.accent;
        const inst = new Chart(canvas, {
          type: 'line',
          data: {
            labels: data.map((_, i) => i + 1),
            datasets: [{
              data, borderColor: color,
              backgroundColor: withAlpha(color, 0.15),
              borderWidth: 1.5, fill: true, tension: 0.35,
              pointRadius: 0, pointHoverRadius: 0,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { display: false }, y: { display: false } },
            animation: { duration: 600 },
          },
        });
        if (canvas.id) registerChart(canvas.id, inst);
        return inst;
      },

      line(canvas, datasets, options = {}) {
        const t = chartTheme();
        const inst = new Chart(canvas, {
          type: 'line',
          data: { labels: options.labels || [], datasets },
          options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: { legend: { display: !options.hideLegend } },
            scales: {
              x: {
                grid: { color: withAlpha(t.border, 0.5), drawBorder: false },
                ticks: { color: t.textMuted, font: { size: 10 }, maxRotation: 0 },
              },
              y: {
                grid: { color: withAlpha(t.border, 0.5), drawBorder: false },
                ticks: { color: t.textMuted, font: { size: 10 } },
                beginAtZero: options.beginAtZero ?? false,
              },
            },
            elements: {
              line: { tension: 0.3, borderWidth: 2 },
              point: { radius: 3, hoverRadius: 5 },
            },
          },
        });
        if (canvas.id) registerChart(canvas.id, inst);
        return inst;
      },

      bar(canvas, datasets, options = {}) {
        const t = chartTheme();
        const inst = new Chart(canvas, {
          type: 'bar',
          data: { labels: options.labels || [], datasets },
          options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: t.textMuted, font: { size: 10 } },
                stacked: !!options.stacked,
              },
              y: {
                grid: { color: withAlpha(t.border, 0.5), drawBorder: false },
                ticks: { color: t.textMuted, font: { size: 10 } },
                beginAtZero: true,
                stacked: !!options.stacked,
              },
            },
            elements: { bar: { borderRadius: 4 } },
          },
        });
        if (canvas.id) registerChart(canvas.id, inst);
        return inst;
      },

      horizontalBar(canvas, datasets, options = {}) {
        const t = chartTheme();
        const inst = new Chart(canvas, {
          type: 'bar',
          data: { labels: options.labels || [], datasets },
          options: {
            indexAxis: 'y',
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: !options.hideLegend } },
            scales: {
              x: {
                grid: { color: withAlpha(t.border, 0.5), drawBorder: false },
                ticks: { color: t.textMuted, font: { size: 10 } },
                beginAtZero: true,
              },
              y: {
                grid: { display: false },
                ticks: { color: t.textMuted, font: { size: 11 } },
              },
            },
            elements: { bar: { borderRadius: 4 } },
          },
        });
        if (canvas.id) registerChart(canvas.id, inst);
        return inst;
      },

      donut(canvas, data, labels, options = {}) {
        const t = chartTheme();
        const colors = options.colors || t.palette;
        const inst = new Chart(canvas, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              data,
              backgroundColor: colors,
              borderColor: t.surface,
              borderWidth: 2,
              hoverOffset: 6,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            cutout: options.cutout || '65%',
          },
        });
        if (canvas.id) registerChart(canvas.id, inst);
        return inst;
      },

      gauge(canvas, value, options = {}) {
        const t = chartTheme();
        const max = options.max || 100;
        const target = options.target || max;
        const colorByThreshold = (v) => {
          const r = v / target;
          if (r >= 1.05) return t.success;       // ≥105% target — excellent
          if (r >= 1.00) return '#22c55e';       // 100-104% — at/above target
          if (r >= 0.90) return t.warning;       // 90-99% — waspada
          if (r >= 0.75) return '#f97316';       // 75-89% — tertinggal
          return t.danger;                        // <75% — kritis
        };
        const color = options.color || colorByThreshold(value);
        const remaining = Math.max(0, max - value);
        const inst = new Chart(canvas, {
          type: 'doughnut',
          data: {
            labels: ['Achieved', 'Remaining'],
            datasets: [{
              data: [value, remaining],
              backgroundColor: [color, withAlpha(t.border, 0.4)],
              borderColor: 'transparent',
              borderWidth: 0,
              circumference: 180,
              rotation: 270,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '75%',
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            animation: { duration: 1200, easing: 'easeOutQuart' },
          },
        });
        if (canvas.id) registerChart(canvas.id, inst);
        return inst;
      },
    };

    // =========================================================
    // COMPONENTS ? Reusable factories
    // =========================================================
    const ICONS_DELTA = { positive: 'arrow-up-right', negative: 'arrow-down-right', neutral: 'minus' };

    const Components = {
      // Animated counter ? count from 0 to data-target
      animateNumber(el, options = {}) {
        const target = parseFloat(el.dataset.target);
        if (isNaN(target)) return;
        const duration = options.duration || 1200;
        const decimals = options.decimals ?? (Number.isInteger(target) ? 0 : 2);
        const formattedFinal = el.dataset.formatted || formatNumber(target, decimals);
        const start = performance.now();
        const step = (now) => {
          const elapsed = now - start;
          const p = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = formatNumber(target * eased, decimals);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = formattedFinal;
        };
        requestAnimationFrame(step);
      },

      // KPI Card factory (returns HTML string)
      kpiCard({ id, label, value, formatted, delta, deltaUnit = '%', icon = 'activity', sparkline, isInverse = false }) {
        const d = formatDelta(delta, 1, isInverse, deltaUnit);
        const sparklineHtml = sparkline && sparkline.length
          ? `<div class="kpi-sparkline-wrap"><canvas id="spark-${id}"></canvas></div>`
          : '';
        return `
          <div class="kpi-card" data-id="${id}">
            <div class="kpi-card-header">
              <i data-lucide="${icon}" class="kpi-card-icon"></i>
              <span class="kpi-card-label">${label}</span>
            </div>
            <div class="kpi-card-value display-font" data-target="${value}" data-formatted="${formatted}">${formatted}</div>
            <div class="kpi-card-footer">
              <span class="kpi-delta-pill ${d.type}"><i data-lucide="${ICONS_DELTA[d.type]}"></i>${d.text}</span>
              ${sparklineHtml}
            </div>
          </div>`;
      },

      kpiGrid(kpis) {
        return `<div class="preview-grid">${kpis.map(k => Components.kpiCard(k)).join('')}</div>`;
      },

      // Initialize KPI cards: animate counters + render sparklines
      initKpiCards(kpis, container = document) {
        if (window.lucide) window.lucide.createIcons();
        container.querySelectorAll('.kpi-card-value[data-target]').forEach(el => Components.animateNumber(el));
        kpis.forEach(k => {
          if (k.sparkline && k.sparkline.length) {
            const canvas = container.querySelector(`#spark-${k.id}`);
            if (canvas) ChartFactory.sparkline(canvas, k.sparkline);
          }
        });
      },

      // Empty state
      emptyState({ icon = 'inbox', title = 'Belum ada data', message = '', action = null }) {
        return `
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="${icon}"></i></div>
            <h3 class="empty-state-title">${title}</h3>
            ${message ? `<p class="empty-state-message">${message}</p>` : ''}
            ${action ? `<button class="btn btn-primary" data-action="${action.id}">${action.label}</button>` : ''}
          </div>`;
      },

      // Skeleton loader for KPI grid
      skeletonKpiGrid(count = 4) {
        return `
          <div class="preview-grid">
            ${Array.from({length: count}).map(() => `
              <div class="skeleton-card">
                <div class="skeleton skeleton-line" style="width:60%;"></div>
                <div class="skeleton skeleton-line" style="height:32px;width:80%;margin-top:8px;"></div>
                <div style="display:flex;justify-content:space-between;margin-top:auto;gap:12px;">
                  <div class="skeleton skeleton-line" style="width:60px;"></div>
                  <div class="skeleton skeleton-line" style="width:80px;height:24px;"></div>
                </div>
              </div>
            `).join('')}
          </div>`;
      },

      // Skeleton for chart area
      skeletonChart(height = 280) {
        return `<div class="skeleton" style="width:100%;height:${height}px;border-radius:var(--radius-lg);"></div>`;
      },
    };

    // =========================================================
    // SLIDE DRAWER API
    // =========================================================
    const SlideDrawer = {
      _onSave: null,
      _onCancel: null,

      open({ title, subtitle = '', content = '', footer = '', onSave = null, onCancel = null }) {
        const backdrop = document.getElementById('drawer-backdrop');
        document.getElementById('drawer-title').textContent = title;
        document.getElementById('drawer-subtitle').textContent = subtitle;
        document.getElementById('drawer-body').innerHTML = content;
        const footerEl = document.getElementById('drawer-footer');
        if (footer === false || footer === '') {
          footerEl.style.display = 'none';
          footerEl.innerHTML = '';
        } else {
          footerEl.style.display = '';
          footerEl.innerHTML = footer;
        }
        SlideDrawer._onSave = onSave;
        SlideDrawer._onCancel = onCancel;
        backdrop.setAttribute('data-open', 'true');
        if (window.lucide) window.lucide.createIcons();
      },

      close() {
        document.getElementById('drawer-backdrop').setAttribute('data-open', 'false');
        // Destroy any chart inside drawer
        const drawerChartId = 'drawer-trend-chart';
        if (chartRegistry.has(drawerChartId)) {
          try { chartRegistry.get(drawerChartId).destroy(); } catch(e){}
          chartRegistry.delete(drawerChartId);
        }
        SlideDrawer._onSave = null;
        SlideDrawer._onCancel = null;
      },

      _initListeners() {
        const backdrop = document.getElementById('drawer-backdrop');
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) {
            if (SlideDrawer._onCancel) SlideDrawer._onCancel();
            SlideDrawer.close();
          }
        });
        document.addEventListener('click', (e) => {
          const closeBtn = e.target.closest('[data-close-drawer]');
          if (closeBtn) {
            if (SlideDrawer._onCancel) SlideDrawer._onCancel();
            SlideDrawer.close();
            return;
          }
          const actionBtn = e.target.closest('[data-drawer-action]');
          if (actionBtn) {
            const action = actionBtn.dataset.drawerAction;
            if (action === 'save' && SlideDrawer._onSave) SlideDrawer._onSave();
            if (action === 'cancel' && SlideDrawer._onCancel) SlideDrawer._onCancel();
            SlideDrawer.close();
          }
        });
      },
    };

    // Open KPI detail drawer with editable commentary form
    const openKpiDetail = (kpiId) => {
      const k = DATA.operational.kpis.find(x => x.id === kpiId);
      if (!k) return;
      const isAkumulatif = k.basis === 'akumulatif';
      const basisBadge = isAkumulatif
        ? `<span style="font-size:10px;background:rgba(0,191,216,0.15);color:var(--color-accent);padding:2px 8px;border-radius:10px;font-weight:600;letter-spacing:0.04em;">&#9650; Akumulatif (YTD)</span>`
        : `<span style="font-size:10px;background:var(--color-surface-2);color:var(--color-text-muted);padding:2px 8px;border-radius:10px;font-weight:600;letter-spacing:0.04em;">&#9644; Bulanan</span>`;
      const content = `
        <div class="kpi-detail-stat">
          <div><div class="stat-label">Target${isAkumulatif ? ' Tahunan' : ''}</div><div class="stat-value">${formatNumber(k.target, k.target < 10 ? 2 : 0)} <span style="font-size:60%;color:var(--color-text-muted);">${k.unit}</span></div></div>
          <div><div class="stat-label">Realisasi${isAkumulatif ? ' YTD' : ''}</div><div class="stat-value">${formatNumber(k.actual, k.actual < 10 ? 2 : 0)} <span style="font-size:60%;color:var(--color-text-muted);">${k.unit}</span></div></div>
          <div><div class="stat-label">Pencapaian</div><div class="stat-value">${formatNumber(k.achievement, 2)}%</div></div>
          <div><div class="stat-label">Status &amp; Basis</div><div class="stat-value" style="display:flex;flex-direction:column;gap:4px;"><span class="status-pill ${k.status}">${STATUS_LABEL[k.status] || k.status}</span>${basisBadge}</div></div>
        </div>
        ${isAkumulatif ? `
        <div class="drawer-form-section">
          <div class="preview-subtitle"><i data-lucide="bar-chart-2"></i>Tambahan per Bulan (${k.unit}) <span style="font-size:10px;color:var(--color-text-muted);margin-left:6px;">— realisasi incremental</span></div>
          <div class="chart-container short"><canvas id="drawer-trend-chart"></canvas></div>
        </div>
        <div class="drawer-form-section">
          <div class="preview-subtitle"><i data-lucide="trending-up"></i>Progres Kumulatif YTD vs Target Ramp <span style="font-size:10px;color:var(--color-text-muted);margin-left:6px;">— akumulasi s.d. tiap bulan</span></div>
          <div class="chart-container short"><canvas id="drawer-cumul-chart"></canvas></div>
        </div>
        ` : `
        <div class="drawer-form-section">
          <div class="preview-subtitle"><i data-lucide="line-chart"></i>Trend Realisasi 12 Bulan Terakhir <span style="font-size:10px;color:var(--color-text-muted);margin-left:6px;">— basis bulanan &middot; garis putus = target</span></div>
          <div class="chart-container short"><canvas id="drawer-trend-chart"></canvas></div>
        </div>
        `}
        <div class="drawer-form-section">
          <div class="preview-subtitle"><i data-lucide="info"></i>Owner & Klasifikasi</div>
          <div class="form-field-vertical">
            <label class="form-label">Bidang Owner</label>
            <input type="text" class="form-input" value="${k.bu || ''}" readonly>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-2);">
            <div class="form-field-vertical">
              <label class="form-label">Kategori</label>
              <input type="text" class="form-input" value="${k.category || ''}" readonly>
            </div>
            <div class="form-field-vertical">
              <label class="form-label">Bobot</label>
              <input type="text" class="form-input" value="${k.bobot || ''}" readonly>
            </div>
            <div class="form-field-vertical">
              <label class="form-label">Polaritas</label>
              <input type="text" class="form-input" value="${k.polaritas === 'HB' ? 'Positif (higher is better)' : 'Negatif (lower is better)'}" readonly>
            </div>
          </div>
        </div>
        <div class="drawer-form-section">
          <div class="preview-subtitle"><i data-lucide="message-square"></i>Commentary &amp; Action Plan (Editable)</div>
          <div class="form-field-vertical">
            <label class="form-label" for="drawer-commentary">Narasi / Commentary</label>
            <textarea class="form-textarea" id="drawer-commentary" rows="3">${k.commentary || ''}</textarea>
          </div>
          <div class="form-field-vertical">
            <label class="form-label" for="drawer-rootcause">Root Cause Analysis</label>
            <textarea class="form-textarea" id="drawer-rootcause" rows="2">${k.rootCause || ''}</textarea>
          </div>
          <div class="form-field-vertical">
            <label class="form-label" for="drawer-actionplan">Action Plan / Mitigasi</label>
            <textarea class="form-textarea" id="drawer-actionplan" rows="3">${k.actionPlan || ''}</textarea>
          </div>
        </div>
      `;
      const footer = `
        <button class="btn btn-ghost" data-drawer-action="cancel">Batal</button>
        <button class="btn btn-primary" data-drawer-action="save"><i data-lucide="save"></i><span>Simpan Komentar</span></button>
      `;

      SlideDrawer.open({
        title: `KPI ${k.no}. ${k.name}`,
        subtitle: `${k.unit} · Bobot ${k.bobot} · ${k.category} · ${k.bu}`,
        content, footer,
        onSave: () => {
          k.commentary = document.getElementById('drawer-commentary').value;
          k.rootCause  = document.getElementById('drawer-rootcause').value;
          k.actionPlan = document.getElementById('drawer-actionplan').value;
          toast({
            title: 'Komentar disimpan',
            message: `Update KPI "${k.name}" berhasil. Workflow approval akan trigger otomatis di Fase 11.`,
            type: 'success',
          });
        },
      });

      // Render chart(s) inside drawer (after DOM paint)
      setTimeout(() => {
        const t = chartTheme();
        const color = k.status === 'danger' ? t.danger : k.status === 'warning' ? t.warning : t.accent;
        const labels = DATA.meta.monthsTrailing12;

        if (isAkumulatif && k.targetCumulative) {
          // ── Chart 1: monthly increments (bar) ──────────────────────────
          const canvas1 = document.getElementById('drawer-trend-chart');
          if (canvas1) {
            const increments = k.sparkline.map((v, i) => i === 0 ? v : Math.max(0, v - k.sparkline[i - 1]));
            ChartFactory.bar(canvas1, [{
              label: 'Tambahan ' + k.unit + ' per Bulan',
              data: increments,
              backgroundColor: increments.map(v => v > 0 ? withAlpha(color, 0.80) : withAlpha(t.border, 0.25)),
              borderRadius: 3,
            }], { labels, hideLegend: true });
          }
          // ── Chart 2: cumulative actual vs target ramp (line) ──────────
          const canvas2 = document.getElementById('drawer-cumul-chart');
          if (canvas2) {
            ChartFactory.line(canvas2, [
              {
                label: 'YTD Realisasi',
                data: k.sparkline,
                borderColor: color,
                backgroundColor: withAlpha(color, 0.15),
                fill: true,
                borderWidth: 2.5,
                pointRadius: 4,
              },
              {
                label: 'Target Ramp',
                data: k.targetCumulative,
                borderColor: t.warning,
                backgroundColor: 'transparent',
                borderDash: [6, 4],
                borderWidth: 1.8,
                pointRadius: 0,
              },
            ], { labels });
          }
        } else {
          // ── Monthly: trend + horizontal target reference line ──────────
          const canvas = document.getElementById('drawer-trend-chart');
          if (canvas) {
            ChartFactory.line(canvas, [
              {
                label: 'Realisasi',
                data: k.sparkline,
                borderColor: color,
                backgroundColor: withAlpha(color, 0.15),
                fill: true,
                borderWidth: 2.5,
              },
              {
                label: 'Target (' + formatNumber(k.target, k.target < 10 ? 2 : 0) + ' ' + k.unit + ')',
                data: Array(12).fill(k.target),
                borderColor: t.warning,
                backgroundColor: 'transparent',
                borderDash: [6, 4],
                borderWidth: 1.5,
                pointRadius: 0,
              },
            ], { labels });
          }
        }
      }, 100);
    };

    const handleApprovalAction = (reportId, action) => {
      const rp = DATA.approvals.reports.find(r => r.id === reportId);
      if (!rp) return;
      const commentInput = document.getElementById('drawer-approval-comment');
      const comment = commentInput ? commentInput.value : '';
      
      const roleStr = ROLES[state.role].label;
      const actorStr = `[${ROLES[state.role].name}]`;

      const addAudit = (act, cmt) => {
        rp.auditTrail.unshift({
          stage: rp.currentStage,
          actor: actorStr,
          role: roleStr,
          action: act,
          comment: cmt,
          timestamp: new Date().toISOString()
        });
      };

      if (action === 'submit') {
        addAudit('submit', comment || 'Submitted for review.');
        rp.status = 'in_review';
        rp.currentStage = 2;
        toast({ title: 'Berhasil Submit', message: 'Laporan disubmit ke Asman.', type: 'success' });
      } else if (action === 'approve') {
        addAudit('approve', comment || 'Approved.');
        if (rp.currentStage === 5) {
          rp.status = 'approved';
        } else {
          rp.currentStage += 1;
        }
        toast({ title: 'Berhasil Approve', message: 'Laporan diteruskan ke stage berikutnya.', type: 'success' });
      } else if (action === 'reject' || action === 'revise') {
        addAudit(action, comment || 'Dikembalikan untuk direvisi.');
        rp.status = 'needs_revision';
        rp.currentStage = 1; // back to staff
        toast({ title: 'Laporan Dikembalikan', message: 'Laporan dikembalikan ke pembuat.', type: 'warning' });
      }

      SlideDrawer.close();
      if (typeof renderPlaceholder === 'function') renderPlaceholder(state.currentRoute);
      updateRoleUI();
    };

    const openReportDetail = (reportId) => {
      const rp = DATA.approvals.reports.find(x => x.id === reportId);
      if (!rp) return;
      const a = DATA.approvals;
      
      const sCls = rp.status.replace('_','-');
      const roleInfo = ROLES[state.role];
      const isMyTurn = (rp.status === 'in_review' && a.workflow.find(w => w.stage === rp.currentStage)?.role === state.role) || (rp.status === 'needs_revision' && state.role === 'staff') || (rp.status === 'draft' && state.role === 'staff');

      let actionButtonsHtml = '';
      if (isMyTurn) {
        actionButtonsHtml = `
          <div class="drawer-form-section" style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin-top:var(--space-6);">
            <div class="preview-subtitle"><i data-lucide="edit"></i>Aksi Approval (${roleInfo.label})</div>
            <div class="form-field-vertical">
              <label class="form-label" for="drawer-approval-comment">Catatan / Komentar (Opsional)</label>
              <textarea class="form-textarea" id="drawer-approval-comment" rows="3" placeholder="Tambahkan catatan..."></textarea>
            </div>
            <div style="display:flex;gap:8px;margin-top:16px;">
              ${state.role === 'staff' 
                ? `<button class="btn btn-primary" style="flex:1" onclick="handleApprovalAction('${rp.id}', 'submit')"><i data-lucide="send"></i><span>Submit Laporan</span></button>` 
                : `<button class="btn btn-danger" style="flex:1" onclick="handleApprovalAction('${rp.id}', 'revise')"><i data-lucide="x-circle"></i><span>Kembalikan</span></button>
                   <button class="btn btn-primary" style="flex:1" onclick="handleApprovalAction('${rp.id}', 'approve')"><i data-lucide="check-circle"></i><span>Approve & Lanjut</span></button>`
              }
            </div>
          </div>
        `;
      }

      const content = `
        <div class="kpi-detail-stat" style="margin-bottom:var(--space-4);">
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span class="stat-label">Status Saat Ini</span>
            <span class="status-pill ${sCls}" style="font-size:12px;display:inline-flex;margin-top:4px;">${a.statusLabels[rp.status]}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span class="stat-label">Tahapan</span>
            <strong style="color:var(--color-text);font-size:16px;margin-top:4px;display:block;">Stage ${rp.currentStage} / 5</strong>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span class="stat-label">Terakhir Diupdate</span>
            <strong style="color:var(--color-text);font-size:14px;margin-top:4px;display:block;">${rp.auditTrail.length > 0 ? relativeTime(rp.auditTrail[0].timestamp) : relativeTime(rp.submittedAt)}</strong>
          </div>
        </div>

        <div class="drawer-form-section">
          <div class="preview-subtitle"><i data-lucide="git-branch"></i>Progress Approval</div>
          <div class="approval-stages" style="display:flex;align-items:center;gap:4px;margin-bottom:8px;">
            ${[1,2,3,4,5].map(stg => {
              let cls = '';
              if (rp.status === 'approved' || rp.status === 'locked') cls = 'done';
              else if (rp.status === 'needs_revision') cls = stg === 1 ? 'revision' : (stg < rp.currentStage ? 'done' : '');
              else if (rp.status === 'rejected') cls = stg === rp.currentStage ? 'rejected' : (stg < rp.currentStage ? 'done' : '');
              else if (rp.status === 'in_review') cls = stg < rp.currentStage ? 'done' : (stg === rp.currentStage ? 'current' : '');
              return `<div class="approval-stage ${cls}" title="Stage ${stg}"></div>`;
            }).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--text-2xs);color:var(--color-text-muted);">
            <span>Staff</span><span>Asman</span><span>Manajer</span><span>Sr.Manajer</span><span>GM</span>
          </div>
        </div>

        ${actionButtonsHtml}

        <div class="drawer-form-section" style="margin-top:var(--space-6);">
          <div class="preview-subtitle"><i data-lucide="history"></i>Audit Trail</div>
          <div style="display:flex;flex-direction:column;gap:var(--space-3);">
            ${rp.auditTrail.map(at => {
              let icon = 'check';
              let color = 'var(--color-success)';
              if (at.action === 'submit')                              { icon = 'upload';  color = 'var(--color-accent)'; }
              if (at.action === 'reject' || at.action === 'revise')   { icon = 'x';       color = 'var(--color-danger)'; }
              if (at.action === 'request_revision')                   { icon = 'rotate-ccw'; color = 'var(--color-warning)'; }

              const dateObj = new Date(at.timestamp);
              const dateStr = dateObj.toLocaleDateString('id-ID', {day:'2-digit',month:'short',year:'numeric'}) + ' ' + dateObj.toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'});

              return `
                <div style="display:flex;gap:12px;padding:12px;background:var(--color-surface-2);border-radius:var(--radius-md);">
                  <div style="width:28px;height:28px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
                    <i data-lucide="${icon}" style="width:14px;height:14px;"></i>
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-weight:600;font-size:var(--text-sm);color:var(--color-text);">${at.actor} <span style="color:var(--color-text-muted);font-weight:400;">(${at.role})</span></div>
                    <div style="font-size:var(--text-2xs);color:var(--color-text-muted);margin-bottom:6px;">${dateStr}</div>
                    <div style="font-size:var(--text-sm);color:var(--color-text-muted);">${at.comment}</div>
                  </div>
                </div>
              `;
            }).join('')}
            ${rp.auditTrail.length === 0 ? `<div style="font-size:var(--text-sm);color:var(--color-text-muted);text-align:center;padding:var(--space-4);">Belum ada riwayat aktivitas.</div>` : ''}
          </div>
        </div>
      `;

      SlideDrawer.open({
        title: rp.title,
        subtitle: `ID: ${rp.id} · ${rp.unit} · ${rp.period}`,
        content, 
        footer: `<button class="btn btn-ghost" data-drawer-action="cancel">Tutup</button>`
      });
      if (window.lucide) window.lucide.createIcons();
    };

// =========================================================
    // SORTABLE TABLE
    // =========================================================
    const SortableTable = {
      // columns: [{ key, label, numeric, render?(row) }]
      render({ id, columns, paginate = 0 }) {
        return `
          <div class="data-table-wrap table-responsive" data-table-id="${id}">
            <table class="data-table" id="${id}">
              <thead>
                <tr>
                  ${columns.map(c => `
                    <th class="${c.numeric ? 'num' : ''}" data-sortable="true" data-sort-key="${c.key}" data-sort-numeric="${c.numeric ? 'true' : 'false'}">
                      ${c.label}
                      <i data-lucide="chevrons-up-down" class="sort-icon"></i>
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody></tbody>
            </table>
            ${paginate ? `
              <div class="table-pagination" id="${id}-paging">
                <span class="pagination-info"></span>
                <div>
                  <button data-page="prev" aria-label="Halaman sebelumnya">&#8592; Sebelumnya</button>
                  <button data-page="next" aria-label="Halaman berikutnya">Berikutnya &#8594;</button>
                </div>
              </div>` : ''}
          </div>`;
      },

      init(id, { columns, rows, paginate = 0, onRowClick = null }) {
        const state = { sortKey: null, sortDir: 'asc', page: 0, paginate };
        const table = document.getElementById(id);
        if (!table) return;

        const renderBody = () => {
          let displayRows = [...rows];
          if (state.sortKey) {
            const col = columns.find(c => c.key === state.sortKey);
            displayRows.sort((a, b) => {
              let av = a[state.sortKey], bv = b[state.sortKey];
              if (col && col.numeric) {
                av = parseFloat(av) || 0; bv = parseFloat(bv) || 0;
                return state.sortDir === 'asc' ? av - bv : bv - av;
              }
              av = String(av || ''); bv = String(bv || '');
              return state.sortDir === 'asc' ? av.localeCompare(bv, 'id') : bv.localeCompare(av, 'id');
            });
          }
          const total = displayRows.length;
          let pageRows = displayRows;
          if (state.paginate > 0) {
            const start = state.page * state.paginate;
            pageRows = displayRows.slice(start, start + state.paginate);
          }
          const tbody = table.querySelector('tbody');
          tbody.innerHTML = pageRows.map((row, i) => `
            <tr ${onRowClick ? 'class="row-clickable" data-row-idx="' + (state.page * state.paginate + i) + '"' : ''}>
              ${columns.map(c => `
                <td class="${c.numeric ? 'num' : ''}">${c.render ? c.render(row) : (row[c.key] ?? '')}</td>
              `).join('')}
            </tr>
          `).join('');
          if (onRowClick) {
            tbody.querySelectorAll('tr.row-clickable').forEach(tr => {
              tr.addEventListener('click', () => {
                const idx = parseInt(tr.dataset.rowIdx);
                onRowClick(displayRows[idx], idx);
              });
            });
          }
          if (state.paginate > 0) {
            const start = state.page * state.paginate + 1;
            const end = Math.min((state.page + 1) * state.paginate, total);
            const info = document.querySelector(`#${id}-paging .pagination-info`);
            if (info) info.textContent = `Menampilkan ${start}–${end} dari ${total} record`;
            const prev = document.querySelector(`#${id}-paging [data-page="prev"]`);
            const next = document.querySelector(`#${id}-paging [data-page="next"]`);
            if (prev) prev.disabled = state.page === 0;
            if (next) next.disabled = end >= total;
          }
          if (window.lucide) window.lucide.createIcons();
        };

        table.querySelectorAll('th[data-sortable]').forEach(th => {
          th.addEventListener('click', () => {
            const key = th.dataset.sortKey;
            if (state.sortKey === key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
            else { state.sortKey = key; state.sortDir = 'asc'; }
            table.querySelectorAll('th').forEach(h => h.removeAttribute('aria-sort'));
            th.setAttribute('aria-sort', state.sortDir === 'asc' ? 'ascending' : 'descending');
            renderBody();
          });
        });

        if (state.paginate > 0) {
          const paging = document.getElementById(`${id}-paging`);
          if (paging) {
            paging.addEventListener('click', (e) => {
              if (e.target.closest('[data-page="prev"]') && state.page > 0) {
                state.page--; renderBody();
              }
              if (e.target.closest('[data-page="next"]')) {
                if ((state.page + 1) * state.paginate < rows.length) { state.page++; renderBody(); }
              }
            });
          }
        }
        renderBody();
      },
    };

    // =========================================================
    // THEME
    // =========================================================
    const applyTheme = (forcedTheme) => {
      if (forcedTheme) state.theme = forcedTheme;
      document.documentElement.setAttribute('data-theme', state.theme);
      const icon = document.getElementById('theme-icon');
      if (icon) {
        icon.setAttribute('data-lucide', state.theme === 'dark' ? 'moon' : 'sun');
        if (window.lucide) window.lucide.createIcons();
      }
      if (typeof refreshChartTheme === 'function') refreshChartTheme();
    };
    document.getElementById('theme-btn').addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
    });

    // =========================================================
    // SIDEBAR ? desktop collapse + mobile drawer
    // =========================================================
    document.getElementById('collapse-btn').addEventListener('click', () => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      document.getElementById('app').setAttribute(
        'data-sidebar', state.sidebarCollapsed ? 'collapsed' : 'expanded'
      );
    });

    const sidebarEl = document.getElementById('sidebar');
    const overlayEl = document.getElementById('sidebar-overlay');
    const openMobileSidebar  = () => { sidebarEl.classList.add('open');    overlayEl.classList.add('open'); };
    const closeMobileSidebar = () => { sidebarEl.classList.remove('open'); overlayEl.classList.remove('open'); };
    document.getElementById('hamburger-btn').addEventListener('click', openMobileSidebar);
    overlayEl.addEventListener('click', closeMobileSidebar);

    // =========================================================
    // DROPDOWN MANAGER
    // =========================================================
    const dropdowns = {};
    let openDropdownId = null;

    const closeDropdown = (id) => {
      const d = dropdowns[id]; if (!d) return;
      d.menuEl.setAttribute('data-open', 'false');
      d.triggerEl.setAttribute('aria-expanded', 'false');
      if (openDropdownId === id) openDropdownId = null;
    };
    const closeAllDropdowns = () => Object.keys(dropdowns).forEach(closeDropdown);
    const openDropdown = (id) => {
      closeAllDropdowns();
      const d = dropdowns[id]; if (!d) return;
      d.menuEl.setAttribute('data-open', 'true');
      d.triggerEl.setAttribute('aria-expanded', 'true');
      openDropdownId = id;
    };
    const toggleDropdown = (id) => {
      if (openDropdownId === id) closeDropdown(id);
      else openDropdown(id);
    };
    const registerDropdown = (id, triggerEl, menuEl) => {
      dropdowns[id] = { triggerEl, menuEl };
      triggerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(id);
      });
    };

    document.addEventListener('click', (e) => {
      if (openDropdownId) {
        const d = dropdowns[openDropdownId];
        if (d && !d.menuEl.contains(e.target) && !d.triggerEl.contains(e.target)) {
          closeDropdown(openDropdownId);
        }
      }
    });

    registerDropdown('role',   document.getElementById('role-btn'),   document.getElementById('role-menu'));
    registerDropdown('notif',  document.getElementById('notif-btn'),  document.getElementById('notif-menu'));
    registerDropdown('export', document.getElementById('export-btn'), document.getElementById('export-menu'));
    registerDropdown('user',   document.getElementById('user-btn'),   document.getElementById('user-menu'));

    // =========================================================
    // MODAL MANAGER
    // =========================================================
    const openModal = (id) => {
      const m = document.getElementById(id);
      if (!m) return;
      closeAllDropdowns();
      m.setAttribute('data-open', 'true');
      const focusEl = m.querySelector('[autofocus], input:not([type="date"]), button');
      setTimeout(() => focusEl && focusEl.focus(), 50);
    };
    const closeModal = (id) => {
      const m = document.getElementById(id);
      if (m) m.setAttribute('data-open', 'false');
    };

    // Close modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal(backdrop.id);
      });
    });
    // Close modal buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });

    // =========================================================
    // KEYBOARD SHORTCUTS
    // =========================================================
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K ? search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openModal('search-modal');
      }
      // ESC ? close everything
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop[data-open="true"]')
          .forEach(m => closeModal(m.id));
        closeAllDropdowns();
        closeMobileSidebar();
      }
    });

    // =========================================================
    // SECURITY HELPERS — XSS protection (BUG-001 fix)
    // =========================================================
    const escapeHtml = (str) => {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };
    // Sanitize input on write (defense in depth) — strip control chars and limit length
    const sanitizeInput = (str, maxLen = 200) => {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/[\x00-\x1F\x7F]/g, '')   // remove control chars
        .replace(/[​-‏﻿]/g, '') // remove zero-width chars
        .slice(0, maxLen)
        .trim();
    };
    // Expose to window for inline access
    window.escapeHtml = escapeHtml;
    window.sanitizeInput = sanitizeInput;

    // =========================================================
    // TOAST API
    // =========================================================
    const toast = ({title, message='', type='info', duration=4000}) => {
      const container = document.getElementById('toast-container');
      const t = document.createElement('div');
      t.className = `toast ${type}`;
      t.setAttribute('role', 'alert');
      t.innerHTML = `
        <div class="toast-icon"><i data-lucide="${ICONS_BY_TYPE[type]}"></i></div>
        <div class="toast-body">
          <div class="toast-title"></div>
          ${message ? `<div class="toast-message"></div>` : ''}
        </div>
        <button class="toast-close" aria-label="Tutup notifikasi"><i data-lucide="x"></i></button>
      `;
      t.querySelector('.toast-title').textContent = title;
      if (message) t.querySelector('.toast-message').textContent = message;

      container.appendChild(t);
      if (window.lucide) window.lucide.createIcons();

      const dismiss = () => {
        t.classList.add('exit');
        setTimeout(() => t.remove(), 200);
      };
      t.querySelector('.toast-close').addEventListener('click', dismiss);
      if (duration > 0) setTimeout(dismiss, duration);
      return { dismiss };
    };

    // =========================================================
    // ROLE SWITCHER
    // =========================================================
    const updateRoleUI = () => {
      const r = ROLES[state.role];

      // Sidebar user card
      document.getElementById('sidebar-user-name').textContent  = r.name;
      document.getElementById('sidebar-user-role').textContent  = r.label;
      document.getElementById('sidebar-user-avatar').textContent = r.initials;

      // Topbar role badge
      const badgeText = document.getElementById('role-badge-text');
      badgeText.innerHTML = '';
      const labelNode = document.createTextNode('Mode: ');
      const strong = document.createElement('strong');
      strong.textContent = r.label;
      badgeText.appendChild(labelNode);
      badgeText.appendChild(strong);

      // Topbar user avatar
      document.getElementById('topbar-user-avatar').textContent = r.initials;
      // User menu header
      document.getElementById('usermenu-avatar').textContent = r.initials;
      document.getElementById('usermenu-name').textContent   = r.name;
      document.getElementById('usermenu-email').textContent  = r.email;

      // Highlight active option in both lists
      document.querySelectorAll('.role-option').forEach(opt => {
        opt.setAttribute('aria-pressed', opt.dataset.role === state.role ? 'true' : 'false');
      });
    };

    const setRole = (role) => {
      if (!ROLES[role]) return;
      state.role = role;
      updateRoleUI();
      closeAllDropdowns();
      // BUG-009 FIX: dismiss stale toasts and refresh notification banner saat role switch
      document.querySelectorAll('.toast-container .toast').forEach(t => {
        try { t.classList.add('exit'); setTimeout(() => t.remove(), 200); } catch(e){}
      });
      if (typeof renderNotifications === 'function') renderNotifications();
      // Re-render current page so alert banner & pending approvals update
      if (typeof renderPlaceholder === 'function') renderPlaceholder(state.currentRoute);
      const pendingCount = getPendingApprovalsForRole(role).length;
      toast({
        title: 'Mode pengguna diubah',
        message: `Sekarang sebagai ${ROLES[role].label} (${ROLES[role].level}). ${pendingCount > 0 ? `${pendingCount} laporan menunggu aksi Anda.` : 'Tidak ada laporan menunggu aksi Anda.'}`,
        type: 'info', duration: 3500,
      });
    };
    // Alias used in Settings inline onclick handlers
    const switchRole = (role) => setRole(role);

    const buildRoleSwitcher = (containerId) => {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = Object.entries(ROLES).map(([key, r]) => `
        <button class="role-option" data-role="${key}" aria-pressed="${state.role === key ? 'true' : 'false'}">
          <i data-lucide="${r.icon}"></i>
          <span class="role-label">${r.label}</span>
          <span class="role-level">${r.level}</span>
        </button>
      `).join('');
      container.querySelectorAll('.role-option').forEach(btn => {
        btn.addEventListener('click', () => setRole(btn.dataset.role));
      });
    };

    // =========================================================
    // NOTIFICATIONS (sample data ? full data layer in Fase 3)
    // =========================================================
    // Derived from DATA.executive.alerts ? single source of truth
    const NOTIFICATIONS = DATA.executive.alerts.map((a, i) => ({
      id: i + 1,
      type: a.type,
      title: a.title.split(' — ')[0].split(' (')[0],
      msg:  a.title,
      time: relativeTime(a.timestamp),
      unread: i < 3,
      route: a.route,
    }));

    const renderNotifications = () => {
      const list = document.getElementById('notif-list');
      const badge = document.getElementById('notif-badge');
      if (!list) return;

      if (NOTIFICATIONS.length === 0) {
        list.innerHTML = `<div class="search-empty">Tidak ada notifikasi.</div>`;
      } else {
        list.innerHTML = NOTIFICATIONS.map(n => `
          <div class="notif-item ${n.unread ? 'unread' : ''}" data-route="${n.route}" data-id="${n.id}">
            <div class="notif-icon ${n.type}"><i data-lucide="${ICONS_BY_TYPE[n.type]}"></i></div>
            <div class="notif-body">
              <div class="notif-title"></div>
              <div class="notif-msg"></div>
              <div class="notif-time">${n.time}</div>
            </div>
          </div>
        `).join('');
        // Set text content safely (escape user data)
        list.querySelectorAll('.notif-item').forEach(item => {
          const id = parseInt(item.dataset.id);
          const n = NOTIFICATIONS.find(x => x.id === id);
          item.querySelector('.notif-title').textContent = n.title;
          item.querySelector('.notif-msg').textContent   = n.msg;
          item.addEventListener('click', () => {
            window.location.hash = '#' + n.route;
            n.unread = false;
            renderNotifications();
            closeAllDropdowns();
          });
        });
      }

      const unread = NOTIFICATIONS.filter(n => n.unread).length;
      badge.style.display = unread > 0 ? 'block' : 'none';

      if (window.lucide) window.lucide.createIcons();
    };

    document.getElementById('mark-all-read').addEventListener('click', (e) => {
      e.stopPropagation();
      NOTIFICATIONS.forEach(n => n.unread = false);
      renderNotifications();
      toast({ title: 'Semua notifikasi ditandai dibaca', type: 'success', duration: 2500 });
    });

    document.getElementById('all-notifs-link').addEventListener('click', () => {
      closeAllDropdowns();
      toast({ title: 'Halaman semua notifikasi', message: 'Akan tersedia di Fase 11.', type: 'info' });
    });

    // =========================================================
    // SEARCH
    // =========================================================
    const SEARCH_INDEX = [
      { type: 'page', title: 'Executive Summary',     sub: 'Health score, KPI, BU breakdown',          route: 'executive-summary', icon: 'layout-dashboard' },
      { type: 'page', title: 'Financial Performance', sub: 'P&L, revenue trend, ratios',               route: 'financial',         icon: 'trending-up' },
      { type: 'page', title: 'Operational KPIs',      sub: 'Plant availability, heat rate, SAIDI',     route: 'operational',       icon: 'activity' },
      { type: 'page', title: 'Strategic Targets',     sub: 'Balanced Scorecard, OKR, Strategy Map',    route: 'strategic',         icon: 'target' },
      { type: 'page', title: 'Human Capital',         sub: 'Headcount, training, recruitment',         route: 'human-capital',     icon: 'users' },
      { type: 'page', title: 'Reports & Approvals',   sub: 'Workflow approval 5 level',                route: 'approvals',         icon: 'file-check-2' },
      { type: 'page', title: 'Settings',              sub: 'Preferensi & manajemen role',              route: 'settings',          icon: 'settings' },
    ];

    let searchActiveIndex = 0;
    const renderSearchResults = (query='') => {
      const container = document.getElementById('search-results');
      const q = query.toLowerCase().trim();
      const filtered = q
        ? SEARCH_INDEX.filter(item => item.title.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q))
        : SEARCH_INDEX;

      searchActiveIndex = 0;

      if (filtered.length === 0) {
        container.innerHTML = '';
        const empty = document.createElement('div');
        empty.className = 'search-empty';
        empty.textContent = `Tidak ada hasil untuk "${query}".`;
        container.appendChild(empty);
        return;
      }

      container.innerHTML = filtered.map((item, i) => `
        <div class="search-result ${i === 0 ? 'active' : ''}" data-route="${item.route}">
          <div class="icon"><i data-lucide="${item.icon}"></i></div>
          <div class="info">
            <div class="info-title">${item.title}</div>
            <div class="info-sub">${item.sub}</div>
          </div>
          <kbd>?</kbd>
        </div>
      `).join('');

      container.querySelectorAll('.search-result').forEach(r => {
        r.addEventListener('click', () => {
          window.location.hash = '#' + r.dataset.route;
          closeModal('search-modal');
        });
      });

      if (window.lucide) window.lucide.createIcons();
    };

    document.getElementById('search-btn').addEventListener('click', () => openModal('search-modal'));

    document.getElementById('search-input').addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });

    document.getElementById('search-input').addEventListener('keydown', (e) => {
      const results = document.querySelectorAll('.search-result');
      if (!results.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        searchActiveIndex = (searchActiveIndex + 1) % results.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        searchActiveIndex = (searchActiveIndex - 1 + results.length) % results.length;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        results[searchActiveIndex].click();
        return;
      } else {
        return;
      }
      results.forEach((r, i) => r.classList.toggle('active', i === searchActiveIndex));
      results[searchActiveIndex].scrollIntoView({ block: 'nearest' });
    });

    // =========================================================
    // EXPORT — Real CSV/PNG/PDF for UAT
    // =========================================================
    const triggerDownload = (filename, dataUrl) => {
      const a = document.createElement('a');
      a.href = dataUrl; a.download = filename;
      document.body.appendChild(a); a.click();
      setTimeout(() => { a.remove(); if (dataUrl.startsWith('blob:')) URL.revokeObjectURL(dataUrl); }, 100);
    };
    const csvEscape = (val) => {
      if (val === null || val === undefined) return '';
      const s = String(val).replace(/"/g, '""');
      return /[",\r\n]/.test(s) ? `"${s}"` : s;
    };
    const downloadCSV = (filename, headers, rows) => {
      const head = headers.map(csvEscape).join(',');
      const body = rows.map(r => r.map(csvEscape).join(',')).join('\r\n');
      const csv = '﻿' + head + '\r\n' + body;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      triggerDownload(filename, URL.createObjectURL(blob));
    };
    const todayStamp = () => {
      const d = new Date();
      return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    };
    const buildCsvForRoute = (route) => {
      const period = 'Feb2026';
      const km = DATA.workflowKM;
      switch (route) {
        case 'workflow-km':
        case 'workflow-km-usulan':
        case 'workflow-km-realisasi': {
          // Combine pending + audit + KPI KI as 3 sheets joined into one CSV (sectioned)
          const headers = ['Section','Field1','Field2','Field3','Field4','Field5','Field6'];
          const rows = [];
          rows.push(['PENDING_APPROVALS','docId','tipe','bidangUnit','holder','deadline','slaRemain']);
          km.pendingApprovals.forEach(p => rows.push(['', p.docId, p.tipe, p.bidangUnit, p.holder, p.deadline, p.slaRemain]));
          rows.push(['','','','','','','']);
          rows.push(['KPI_KANTOR_INDUK','no','indikator','target','realisasi','bobot','satuan']);
          km.kpiKantorInduk.forEach(k => rows.push(['', k.no, k.indikator, k.target, k.realisasi, k.bobot, k.satuan]));
          rows.push(['','','','','','','']);
          rows.push(['AUDIT_TRAIL','timestamp','actor','action','docId','note','']);
          km.auditRecent.forEach(e => rows.push(['', e.ts, e.actor, e.action, e.doc, e.note || '', '']));
          return { filename: `KontrakManajemen_${period}_${todayStamp()}.csv`, headers, rows };
        }
        case 'executive-summary': {
          const ranking = (DATA.executive && DATA.executive.unitRanking) || [];
          return {
            filename: `ExecutiveSummary_${period}_${todayStamp()}.csv`,
            headers: ['Rank','Unit','Total Nilai','Status'],
            rows: ranking.map((r,i) => [i+1, r.name || r.unit || '', r.score ?? r.value ?? '', r.status || ''])
          };
        }
        case 'operational': {
          const kpis = (DATA.operational && DATA.operational.kpis) || [];
          return {
            filename: `OperationalKPI_${period}_${todayStamp()}.csv`,
            headers: ['ID','Kategori','Nama','Bidang','Target','Realisasi','Bobot','Capaian (%)','Nilai','Status'],
            rows: kpis.map(k => [k.id, k.category || '', k.name || '', k.bu || '', k.target ?? '', k.actual ?? '', k.bobot ?? '', (k.achievement ?? 0).toFixed(2), (k.nilai ?? 0).toFixed(2), k.status || ''])
          };
        }
        case 'approvals': {
          const subs = (DATA.approvals && DATA.approvals.reports) || [];
          return {
            filename: `Approvals_${period}_${todayStamp()}.csv`,
            headers: ['ID','Unit','Periode','Stage','Status','Next Approver'],
            rows: subs.map(s => [s.id || '', s.unit || '', s.period || '', s.currentStage ?? '', s.status || '', (s.nextApprover && s.nextApprover.name) || ''])
          };
        }
        case 'risk': {
          const reg = (DATA.risk && DATA.risk.register) || [];
          return {
            filename: `RiskRegister_${period}_${todayStamp()}.csv`,
            headers: ['ID','Risiko','Kategori','Unit','Likelihood','Impact','Owner','Status'],
            rows: reg.map(r => [r.id || '', r.desc || '', r.cat || '', r.unit || '', r.l ?? '', r.i ?? '', r.owner || '', r.status || ''])
          };
        }
        case 'financial': {
          const inv = (DATA.financial && DATA.financial.investasiPerUnit) || [];
          return {
            filename: `Financial_${period}_${todayStamp()}.csv`,
            headers: ['Unit','Anggaran','Realisasi','% Realisasi'],
            rows: inv.map(r => [r.unit || r.name || '', r.budget ?? r.anggaran ?? '', r.actual ?? r.realisasi ?? '', r.pct ?? ''])
          };
        }
        default:
          return null;
      }
    };
    document.querySelectorAll('[data-export]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.export;
        closeAllDropdowns();
        if (type === 'pdf' || type === 'print') {
          toast({ title: 'Membuka dialog print', message: 'Pilih "Save as PDF" pada dialog browser.', type: 'info', duration: 2500 });
          setTimeout(() => window.print(), 400);
        } else if (type === 'csv') {
          const route = state.currentRoute;
          const scope = buildCsvForRoute(route);
          if (!scope || !scope.rows || !scope.rows.length) {
            toast({ title: 'Tidak ada data tabel', message: 'Halaman ini belum mendukung ekspor CSV.', type: 'warning' });
            return;
          }
          try {
            downloadCSV(scope.filename, scope.headers, scope.rows);
            toast({ title: 'Ekspor CSV berhasil', message: `${scope.filename} (${scope.rows.length} baris)`, type: 'success' });
          } catch (err) {
            toast({ title: 'Ekspor CSV gagal', message: String(err && err.message || err), type: 'danger' });
          }
        } else if (type === 'image') {
          if (!chartRegistry || chartRegistry.size === 0) {
            toast({ title: 'Tidak ada chart aktif', message: 'Buka halaman dengan grafik terlebih dahulu.', type: 'info' });
            return;
          }
          try {
            const chart = chartRegistry.values().next().value;
            if (!chart || typeof chart.toBase64Image !== 'function') {
              toast({ title: 'Chart tidak dapat di-export', type: 'warning' });
              return;
            }
            const url = chart.toBase64Image('image/png', 1.0);
            const filename = `Chart_${state.currentRoute}_${todayStamp()}.png`;
            triggerDownload(filename, url);
            toast({ title: 'Unduh chart berhasil', message: filename, type: 'success' });
          } catch (err) {
            toast({ title: 'Unduh chart gagal', message: String(err && err.message || err), type: 'danger' });
          }
        }
      });
    });

    // =========================================================
    // PERIOD SELECTOR (Kustom ? modal)
    // =========================================================
    document.querySelectorAll('#period-selector [data-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.getAttribute('data-period');
        if (p === 'custom') {
          openModal('date-modal');
          return;
        }
        document.querySelectorAll('#period-selector [data-period]')
          .forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        state.period = p;
      });
    });

    // Date range modal
    document.querySelectorAll('.date-quick button').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.quick;
        const today = new Date('2026-04-30');
        const to = today.toISOString().slice(0, 10);
        let from;
        if (q === '7d')   from = new Date(today.getTime() - 7  * 86400000).toISOString().slice(0, 10);
        if (q === '30d')  from = new Date(today.getTime() - 30 * 86400000).toISOString().slice(0, 10);
        if (q === 'ytd')  from = `${today.getFullYear()}-01-01`;
        if (q === 'ly')   from = `${today.getFullYear() - 1}-01-01`;
        document.getElementById('date-from').value = from;
        document.getElementById('date-to').value   = q === 'ly' ? `${today.getFullYear() - 1}-12-31` : to;
      });
    });

    document.getElementById('apply-date-range').addEventListener('click', () => {
      const from = document.getElementById('date-from').value;
      const to   = document.getElementById('date-to').value;
      if (!from || !to) { toast({ title: 'Tanggal tidak valid', type: 'danger' }); return; }
      if (new Date(from) > new Date(to)) {
        toast({ title: 'Rentang tidak valid', message: 'Tanggal "Dari" harus sebelum "Sampai".', type: 'danger' });
        return;
      }
      state.customRange = { from, to };
      state.period = 'custom';
      document.querySelectorAll('#period-selector [data-period]')
        .forEach(b => b.setAttribute('aria-pressed', b.dataset.period === 'custom' ? 'true' : 'false'));
      closeModal('date-modal');
      toast({
        title: 'Rentang periode diterapkan',
        message: `${from} — ${to}`,
        type: 'success', duration: 2500,
      });
    });

    // =========================================================
    // USER MENU ACTIONS
    // =========================================================
    document.querySelectorAll('#user-menu [data-action]').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = item.dataset.action;
        closeAllDropdowns();
        if (action === 'profile') toast({ title: 'Profil pengguna', message: 'Halaman profil akan tersedia di Fase 12.', type: 'info' });
        if (action === 'help')    toast({ title: 'Pusat bantuan',  message: 'Dokumentasi internal akan ditautkan di Fase 12.', type: 'info' });
        // logout is handled by the AUTH GATE listener registered after INIT
      });
    });

    // Sidebar user card ? open user menu
    document.getElementById('sidebar-user-card').addEventListener('click', () => {
      // On mobile, bring topbar user menu into view via toggle
      openDropdown('user');
    });


    // ── WF-3 Input Modal ─────────────────────────────────────────
    window.openWF3InputModal = function() {
      const modal = document.getElementById('wf3-input-modal');
      if (modal) {
        modal.classList.add('open');
        if (window.lucide) window.lucide.createIcons({ root: modal });
      }
    };
    window.submitWF3Input = function(e) {
      e.preventDefault();
      const fields = ['wf3-kpi1','wf3-kpi2','wf3-kpi3','wf3-kpi5','wf3-kpi6','wf3-kpi7'];
      const values = fields.map(id => document.getElementById(id)?.value || '—');
      const catatan = document.getElementById('wf3-catatan')?.value || '';
      // Show toast confirmation
      showToast('success', 'Realisasi Tersimpan', `Data WF-3 bulan ${document.getElementById('wf3-input-periode')?.textContent} berhasil disimpan.`);
      document.getElementById('wf3-input-modal')?.classList.remove('open');
      return false;
    };


    // =========================================================
    // ROUTER
    // =========================================================
    // =========================================================
    // PAGE DATA PREVIEWS (Fase 3 ? placeholder until full charts in Fase 5+)
    // =========================================================
    const STATUS_LABEL = {
      'on-track': 'On Track', 'at-risk': 'At Risk', 'delayed': 'Delayed',
      'completed': 'Completed', 'success': 'Tercapai', 'warning': 'Perhatian',
      'danger': 'Bahaya', 'info': 'Info', 'achieved': 'Tercapai',
    };

    const PAGE_PREVIEW = {
      'executive-summary': () => {
        const ex = DATA.executive;
        const sm = DATA.operational.summary;

        return `
          <!-- Hero Health Score -->
          <div class="hero-health">
            <div class="hero-health-gauge">
              <canvas id="exec-gauge"></canvas>
              <div class="hero-health-overlay">
                <div class="hero-health-value display-font" data-target="${ex.healthScore.value}" data-formatted="${formatNumber(ex.healthScore.value, 2)}">${formatNumber(ex.healthScore.value, 2)}</div>
                <div class="hero-health-meta">/ ${ex.healthScore.target}</div>
                <div class="status-pill completed" style="margin-top:var(--space-2);">Status: ${ex.healthScore.status}</div>
              </div>
            </div>
            <div class="hero-health-info">
              <div class="hero-health-title">${ex.healthScore.label}</div>
              <div class="hero-health-subtitle">Total Nilai Kinerja PUSMANPRO bulan Februari 2026 &mdash; agregat 14 indikator RKM 2026</div>
              <div class="hero-health-stats">
                <div class="hero-stat">
                  <div class="hero-stat-label">Target</div>
                  <div class="hero-stat-value">${ex.healthScore.target}</div>
                </div>
                <div class="hero-stat">
                  <div class="hero-stat-label">Bulan Lalu</div>
                  <div class="hero-stat-value">${formatNumber(ex.healthScore.previous, 2)}</div>
                </div>
                <div class="hero-stat">
                  <div class="hero-stat-label">Δ vs Sebelumnya</div>
                  <div class="hero-stat-value delta-positive">+${formatNumber(ex.healthScore.delta, 2)}%</div>
                </div>
                <div class="hero-stat">
                  <div class="hero-stat-label">KPI / Pengurang</div>
                  <div class="hero-stat-value">${formatNumber(sm.kpiNilai + sm.piNilai, 1)} / ${sm.kepatuhanPenalty}</div>
                </div>
              </div>
              <div class="gauge-legend" style="display:flex;flex-wrap:wrap;gap:var(--space-3);margin-top:var(--space-3);font-size:var(--text-xs);color:var(--color-text-muted);">
                <span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:50%;background:#22c55e;"></span>&ge;100 Tercapai</span>
                <span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:50%;background:var(--color-warning);"></span>90&ndash;99 Waspada</span>
                <span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:50%;background:#f97316;"></span>75&ndash;89 Tertinggal</span>
                <span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:50%;background:var(--color-danger);"></span>&lt;75 Kritis</span>
              </div>
            </div>
          </div>


          <!-- ── PENGURANG ALERT BLOCK ── -->
          ${(() => {
            const pngrList = DATA.workflowKM.kpiKantorInduk.filter(k => k.bobot < 0);
            const hasActive = pngrList.some(k => k.realisasi < 0);
            if (!hasActive) return `
              <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-5);background:rgba(70,189,13,0.08);border:1px solid rgba(70,189,13,0.3);border-radius:var(--radius-md);margin-bottom:var(--space-5);">
                <i data-lucide="shield-check" style="width:20px;height:20px;color:var(--color-success);flex-shrink:0;"></i>
                <div style="font-size:var(--text-xs);color:var(--color-text);"><strong style="color:var(--color-success);">Tidak ada pengurang aktif</strong> — Semua Pengurang (Keterlambatan COD, Temuan BPK, Fatality) dalam kondisi aman.</div>
              </div>`;
            const totalPengurang = pngrList.reduce((acc, k) => acc + (k.realisasi < 0 ? k.realisasi : 0), 0);
            return `
              <div style="border:1px solid var(--color-danger);border-left:4px solid var(--color-danger);border-radius:var(--radius-md);margin-bottom:var(--space-5);background:var(--color-danger-tint);overflow:hidden;">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) var(--space-4);border-bottom:1px solid rgba(236,28,36,.2);">
                  <div style="display:flex;align-items:center;gap:var(--space-3);">
                    <i data-lucide="alert-triangle" style="width:20px;height:20px;color:var(--color-danger);flex-shrink:0;"></i>
                    <div>
                      <div style="font-size:var(--text-sm);font-weight:700;color:var(--color-danger);">⚠ PENGURANG AKTIF — Nilai kinerja terpotong</div>
                      <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:2px;">Total potongan aktif: <strong style="color:var(--color-danger);">${totalPengurang} poin</strong> dari maks −9 poin (3 Pengurang × −3)</div>
                    </div>
                  </div>
                  <span style="font-size:var(--display-sm);font-weight:800;color:var(--color-danger);">${totalPengurang}</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0;">
                  ${pngrList.map((k, i) => {
                    const active = k.realisasi < 0;
                    return `
                      <div style="padding:var(--space-3) var(--space-4);${i < pngrList.length-1 ? 'border-right:1px solid rgba(236,28,36,.15);' : ''}${active ? '' : 'opacity:.55;'}">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                          <span style="width:8px;height:8px;border-radius:50%;background:${active ? 'var(--color-danger)' : 'var(--color-success)'};flex-shrink:0;"></span>
                          <code style="font-size:10px;font-weight:700;color:${active ? 'var(--color-danger)' : 'var(--color-text-muted)'};">${k.no}</code>
                          <span style="font-size:10px;font-weight:700;color:${active ? 'var(--color-danger)' : 'var(--color-success)'};">${active ? 'AKTIF' : 'AMAN'}</span>
                        </div>
                        <div style="font-size:var(--text-xs);font-weight:600;color:var(--color-text);line-height:1.4;margin-bottom:4px;">${k.indikator}</div>
                        <div style="font-size:10px;color:var(--color-text-muted);">${k.formula}</div>
                        <div style="font-size:var(--text-sm);font-weight:800;color:${active ? 'var(--color-danger)' : 'var(--color-success)'};margin-top:4px;">${k.realisasi < 0 ? k.realisasi + ' poin' : '—'}</div>
                      </div>`;
                  }).join('')}
                </div>
              </div>`;
          })()}

          <!-- 4 KPI Cards -->
          <div class="section-title-row">
            <h2 class="section-title"><i data-lucide="bar-chart-3"></i>Indikator Kinerja PUSMANPRO &mdash; 14 KPI RKM 2026</h2>
            <span class="section-meta">Klik KPI untuk lihat detail</span>
          </div>
          <div class="kpi-md-section">
            <div class="kpi-md-list" id="exec-kpi-list"></div>
            <div class="kpi-md-detail" id="exec-kpi-detail"></div>
          </div>

          <!-- Two-column: Trend + Unit Ranking -->
          <div class="two-col-grid">
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="line-chart"></i>Trend Nilai Kinerja vs Target</div>
                <span class="card-meta" id="exec-trend-meta">12 bulan terakhir, target 100</span>
              </div>
              <div style="padding:0 var(--space-4);display:flex;gap:var(--space-1);flex-wrap:wrap;margin-bottom:var(--space-2);overflow-x:auto;" id="exec-trend-unit-btns">
                <button class="btn btn-secondary btn-sm exec-trend-btn active" data-unit="KP" onclick="window.__execSwitchTrend('KP',this)" style="font-size:10px;padding:3px 10px;">Kantor Induk</button>
                <button class="btn btn-ghost btn-sm exec-trend-btn" data-unit="UPMK1" onclick="window.__execSwitchTrend('UPMK1',this)" style="font-size:10px;padding:3px 10px;">UPMK I</button>
                <button class="btn btn-ghost btn-sm exec-trend-btn" data-unit="UPMK2" onclick="window.__execSwitchTrend('UPMK2',this)" style="font-size:10px;padding:3px 10px;">UPMK II</button>
                <button class="btn btn-ghost btn-sm exec-trend-btn" data-unit="UPMK3" onclick="window.__execSwitchTrend('UPMK3',this)" style="font-size:10px;padding:3px 10px;">UPMK III</button>
                <button class="btn btn-ghost btn-sm exec-trend-btn" data-unit="UPMK4" onclick="window.__execSwitchTrend('UPMK4',this)" style="font-size:10px;padding:3px 10px;">UPMK IV</button>
                <button class="btn btn-ghost btn-sm exec-trend-btn" data-unit="UPMK5" onclick="window.__execSwitchTrend('UPMK5',this)" style="font-size:10px;padding:3px 10px;">UPMK V</button>
                <button class="btn btn-ghost btn-sm exec-trend-btn" data-unit="COMPARE" onclick="window.__execSwitchTrend('COMPARE',this)" style="font-size:10px;padding:3px 10px;color:var(--color-info,#3b82f6);"><i data-lucide="layers" style="width:11px;height:11px;"></i><span>Bandingkan Semua</span></button>
              </div>
              <div class="chart-container"><canvas id="exec-trend-chart"></canvas></div>
            </div>
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="trophy"></i>Pencapaian Kinerja Per Unit</div>
                <span class="card-meta">Kantor Induk + 5 UPMK</span>
              </div>
              <div class="chart-container"><canvas id="exec-ranking-chart"></canvas></div>
            </div>
          </div>

          <!-- Strategic Initiatives Table -->
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i data-lucide="layers"></i>Strategic Initiatives (${ex.initiatives.length})</div>
              <span class="card-meta">Inisiatif strategis sesuai RKM 2026</span>
            </div>
            <div id="exec-initiatives-table"></div>
          </div>
        `;
      },

      'financial': () => {
        const f = DATA.financial;
        return `
          <!-- KPI Strip -->
          <div id="fin-kpi-cards"></div>

          <!-- Two Column: OPEX Trend + Cost Structure Donut -->
          <div class="two-col-grid">
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="line-chart"></i>Trend OPEX Bulanan vs Budget vs Tahun Lalu</div>
                <span class="card-meta">12 bulan, Rp Miliar</span>
              </div>
              <div class="chart-container"><canvas id="fin-opex-trend"></canvas></div>
            </div>
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="pie-chart"></i>Cost Structure Breakdown</div>
                <span class="card-meta">OPEX YTD per kategori</span>
              </div>
              <div class="chart-container"><canvas id="fin-cost-donut"></canvas></div>
            </div>
          </div>

          <!-- 6 Ratio Cards -->
          <div class="section-title-row">
            <h2 class="section-title"><i data-lucide="calculator"></i>Indikator Cost &amp; Capex (6)</h2>
            <span class="section-meta">Realisasi vs Benchmark</span>
          </div>
          <div class="ratio-grid">
            ${f.ratios.map(r => {
              const fillCls = r.status === 'success' ? '' : r.status === 'warning' ? 'warning' : 'danger';
              const valueText = r.formatted || (formatNumber(r.value, 2) + (r.unit ? ' ' + r.unit : ''));
              const benchText = r.benchmark > 1e9 ? formatRupiah(r.benchmark) : formatNumber(r.benchmark, 1) + (r.unit ? ' ' + r.unit : '');
              const pct = r.isInverse
                ? Math.min(100, (r.benchmark / r.value) * 100)
                : Math.min(100, (r.value / r.benchmark) * 100);
              return `
                <div class="ratio-card">
                  <div class="ratio-card-label">${r.label}</div>
                  <div class="ratio-card-value">${valueText}</div>
                  <div class="ratio-card-bench">Benchmark: ${benchText}</div>
                  <div class="ratio-card-desc">${r.desc}</div>
                  <div class="ratio-progress"><div class="ratio-progress-fill ${fillCls}" style="width:${pct}%;"></div></div>
                </div>`;
            }).join('')}
          </div>

          <!-- Cash Flow + Investasi per Unit -->
          <div class="two-col-grid">
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="banknote"></i>Cash Flow Februari 2026</div>
                <span class="card-meta">Rp Miliar</span>
              </div>
              <div class="chart-container short"><canvas id="fin-cash-bar"></canvas></div>
              <div class="cash-summary">
                <div>
                  <div class="cash-stat-label">Net Change</div>
                  <div class="cash-stat-value delta-positive">+Rp ${formatNumber(f.cashFlow.netChange)} M</div>
                </div>
                <div>
                  <div class="cash-stat-label">Cash Position End</div>
                  <div class="cash-stat-value">Rp ${formatNumber(f.cashFlow.cashEnd)} M</div>
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="building-2"></i>Realisasi Capex per Unit</div>
                <span class="card-meta">Target vs Realisasi (Rp Miliar)</span>
              </div>
              <div class="chart-container"><canvas id="fin-investasi-bar"></canvas></div>
            </div>
          </div>

          <!-- Variance Table -->
          <div class="card" style="margin-bottom:var(--space-6);">
            <div class="card-header">
              <div class="card-title"><i data-lucide="file-spreadsheet"></i>Variance Realisasi vs RKAP 2026</div>
              <span class="card-meta">Per item anggaran (Rp Miliar)</span>
            </div>
            <div id="fin-variance-table"></div>
          </div>

          <!-- EVM Matrix -->
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i data-lucide="line-chart"></i>EVM Matrix per Unit (SPI &amp; CPI)</div>
              <span class="card-meta">Schedule &amp; Cost Performance Index &mdash; interpretasi otomatis</span>
            </div>
            <div id="fin-evm-table"></div>
          </div>
        `;
      },

      '_financial-old-preview-deleted': () => {
        // Dead code retained as no-op fallback. Real implementation in 'financial' above.
        return ''; const f = DATA.financial;
        return `
          <div class="data-preview">
            <div class="preview-header"><i data-lucide="database"></i><span>Data Layer Preview &mdash; Financial Performance</span></div>

            <div class="preview-section">
              <div class="preview-subtitle"><i data-lucide="trending-up"></i>KPI Strip &mdash; YTD vs Target &amp; Prior Year</div>
              <div class="preview-grid">
                ${f.kpiStrip.map(k => {
                  const dT = formatDelta(k.vsTarget, 1, k.isInverse);
                  const dY = formatDelta(k.vsPriorYear, 1, k.isInverse);
                  return `
                    <div class="preview-card">
                      <div class="preview-card-label">${k.label}</div>
                      <div class="preview-card-value" style="font-size:var(--text-xl);">${formatRupiah(k.value, {decimals: 2})}</div>
                      <div class="preview-card-meta">vs Tgt: <span class="delta-${dT.type}">${dT.text}</span> &middot; vs PY: <span class="delta-${dY.type}">${dY.text}</span></div>
                    </div>`;
                }).join('')}
              </div>
            </div>

            <div class="preview-section">
              <div class="preview-subtitle"><i data-lucide="file-spreadsheet"></i>P&amp;L Summary (Miliar Rp, Q1 2025)</div>
              <table class="preview-table">
                <thead><tr><th>Item</th><th class="num">Budget</th><th class="num">Actual</th><th class="num">Variance Rp</th><th class="num">Variance %</th></tr></thead>
                <tbody>
                  ${f.pnl.map(row => {
                    const variance = row.actual - row.budget;
                    const variancePct = row.budget !== 0 ? (variance / Math.abs(row.budget)) * 100 : 0;
                    const isExpense = row.actual < 0;
                    const goodNumber = isExpense ? variance < 0 : variance > 0;
                    const color = goodNumber ? 'success' : 'danger';
                    return `
                      <tr style="${row.isSubtotal ? 'font-weight:600;background:var(--color-surface-2);' : ''}">
                        <td>${row.item}</td>
                        <td class="num">${formatNumber(row.budget)}</td>
                        <td class="num">${formatNumber(row.actual)}</td>
                        <td class="num delta-${goodNumber ? 'positive' : 'negative'}">${variance > 0 ? '+' : ''}${formatNumber(variance)}</td>
                        <td class="num delta-${goodNumber ? 'positive' : 'negative'}">${variancePct > 0 ? '+' : ''}${formatNumber(variancePct, 1)}%</td>
                      </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div class="preview-section">
              <div class="preview-subtitle"><i data-lucide="calculator"></i>Financial Ratios (6)</div>
              <div class="preview-grid">
                ${f.ratios.map(r => `
                  <div class="preview-card">
                    <div class="preview-card-label">${r.label}</div>
                    <div class="preview-card-value" style="font-size:var(--text-xl);">${r.formatted || (formatNumber(r.value, 2) + ' ' + (r.unit || ''))}</div>
                    <div class="preview-card-meta">Benchmark: ${r.benchmark > 1e9 ? formatRupiah(r.benchmark) : formatNumber(r.benchmark, 1) + ' ' + (r.unit || '')} &mdash; ${r.desc}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="preview-section">
              <div class="preview-subtitle"><i data-lucide="building-2"></i>Realisasi Investasi per Unit (Capex 2026, Rp Miliar)</div>
              <table class="preview-table">
                <thead><tr><th>Unit Pelaksana</th><th class="num">Target AKI</th><th class="num">Realisasi</th><th class="num">Pencapaian</th><th>Status</th></tr></thead>
                <tbody>
                  ${f.investasiPerUnit.map(u => `
                    <tr>
                      <td>${u.name}</td>
                      <td class="num">${formatNumber(u.target)}</td>
                      <td class="num">${formatNumber(u.realisasi)}</td>
                      <td class="num">${formatPercent(u.percent, 1)}
                        <div class="progress-mini"><div class="progress-mini-fill ${u.percent >= 95 ? 'success' : u.percent >= 90 ? 'warning' : 'danger'}" style="width:${u.percent}%"></div></div>
                      </td>
                      <td><span class="status-pill ${u.status}">${STATUS_LABEL[u.status] || u.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="preview-section">
              <div class="preview-subtitle"><i data-lucide="line-chart"></i>EVM (Earned Value Management) per Unit &mdash; SPI &amp; CPI</div>
              <table class="preview-table">
                <thead><tr><th>Unit</th><th class="num">SPI (Schedule)</th><th class="num">CPI (Cost)</th><th>Status</th><th>Interpretasi</th></tr></thead>
                <tbody>
                  ${f.evm.map(e => {
                    const unitName = ({ KP:'Kantor Induk', UPMK1:'UPMK I', UPMK2:'UPMK II', UPMK3:'UPMK III', UPMK4:'UPMK IV', UPMK5:'UPMK V' })[e.code];
                    const interp = e.spi >= 1 && e.cpi >= 1 ? 'Ahead of plan, under budget' :
                                   e.spi >= 1 && e.cpi < 1  ? 'Ahead schedule, over budget' :
                                   e.spi < 1 && e.cpi >= 1  ? 'Behind schedule, under budget' :
                                   'Behind schedule, over budget';
                    return `
                      <tr>
                        <td>${unitName}</td>
                        <td class="num delta-${e.spi >= 1 ? 'positive' : 'negative'}">${e.spi.toFixed(2)}</td>
                        <td class="num delta-${e.cpi >= 1 ? 'positive' : 'negative'}">${e.cpi.toFixed(2)}</td>
                        <td><span class="status-pill ${e.status}">${STATUS_LABEL[e.status] || e.status}</span></td>
                        <td style="font-size:var(--text-xs);color:var(--color-text-muted);">${interp}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div class="preview-section">
              <div class="preview-subtitle"><i data-lucide="banknote"></i>Cash Flow & Cost Structure</div>
              <div class="preview-grid">
                <div class="preview-card">
                  <div class="preview-card-label">Cash from Operating</div>
                  <div class="preview-card-value" style="font-size:var(--text-lg);color:var(--color-success);">+${formatNumber(f.cashFlow.operating)} M</div>
                </div>
                <div class="preview-card">
                  <div class="preview-card-label">Cash from Investing</div>
                  <div class="preview-card-value" style="font-size:var(--text-lg);color:var(--color-danger);">${formatNumber(f.cashFlow.investing)} M</div>
                </div>
                <div class="preview-card">
                  <div class="preview-card-label">Cash from Financing</div>
                  <div class="preview-card-value" style="font-size:var(--text-lg);color:var(--color-danger);">${formatNumber(f.cashFlow.financing)} M</div>
                </div>
                <div class="preview-card">
                  <div class="preview-card-label">Net Cash Position (End)</div>
                  <div class="preview-card-value" style="font-size:var(--text-lg);">Rp ${formatNumber(f.cashFlow.cashEnd)} M</div>
                  <div class="preview-card-meta delta-positive">+${formatNumber(f.cashFlow.netChange)} M dari periode lalu</div>
                </div>
              </div>
            </div>
          </div>`;
      },

      'operational': () => {
        const o = DATA.operational;
        const sm = o.summary;
        return `
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);">
            <div class="summary-hero-card kpi">
              <div class="summary-hero-label">Key Performance Indicator (KPI)</div>
              <div class="summary-hero-value">${formatNumber(sm.kpiNilai, 2)}<span class="of">/ ${sm.kpiBobot}</span></div>
              <div class="summary-hero-meta delta-positive">${formatPercent((sm.kpiNilai/sm.kpiBobot)*100, 1)} pencapaian</div>
            </div>
            <div class="summary-hero-card pi">
              <div class="summary-hero-label">Performance Indicator (PI)</div>
              <div class="summary-hero-value">${formatNumber(sm.piNilai, 2)}<span class="of">/ ${sm.piBobot}</span></div>
              <div class="summary-hero-meta delta-positive">${formatPercent((sm.piNilai/sm.piBobot)*100, 1)} pencapaian</div>
            </div>
            <div class="summary-hero-card pen">
              <div class="summary-hero-label">Pengurang Kepatuhan</div>
              <div class="summary-hero-value">${sm.kepatuhanPenalty}<span class="of">(max -30)</span></div>
              <div class="summary-hero-meta delta-positive">Tidak ada pengurang</div>
            </div>
            <div class="summary-hero-card total">
              <div class="summary-hero-label" style="color:var(--color-accent);">TOTAL NILAI KINERJA</div>
              <div class="summary-hero-value">${formatNumber(sm.totalNilai, 2)}<span class="of">/ ${sm.totalBobot}</span></div>
              <div class="summary-hero-meta"><span class="status-pill ${sm.totalNilai >= 100 ? 'completed' : sm.totalNilai >= 95 ? 'at-risk' : 'delayed'}">${sm.status}</span></div>
            </div>
          </div>

          <!-- Akumulatif KPI Progress Panel -->
          <div class="card p-0" style="margin-bottom:var(--space-6);">
            <div class="card-header">
              <div class="card-title"><i data-lucide="trending-up"></i>Progres KPI &amp; PI Akumulatif (YTD) — Infrastruktur</div>
              <span class="card-meta">Basis kumulatif tahunan &mdash; target vs realisasi s.d. Februari 2026</span>
            </div>
            <div class="card-body" style="padding:var(--space-4);">
              <div id="ops-akumulatif-strip" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:var(--space-4);"></div>
            </div>
          </div>

          <!-- ── KPI SECTION (Bobot 40) ── -->
          <div class="card p-0" style="margin-bottom:var(--space-5);">
            <div class="card-header" style="border-bottom:3px solid var(--color-accent);">
              <div style="display:flex;align-items:center;gap:var(--space-3);flex:1;min-width:0;">
                <div style="width:38px;height:38px;border-radius:var(--radius-md);background:var(--color-accent-tint);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <i data-lucide="target" style="width:18px;height:18px;color:var(--color-accent);"></i>
                </div>
                <div>
                  <div class="card-title" style="color:var(--color-accent);">KPI &mdash; Key Performance Indicator</div>
                  <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:2px;">Bobot: <strong>40 poin</strong> &bull; 3 indikator &bull; <span style="color:var(--color-accent);">&#9646; YTD = akumulatif</span></div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:var(--space-4);">
                <div style="text-align:right;">
                  <div style="font-size:var(--text-2xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em;">Nilai KPI</div>
                  <div style="font-size:var(--text-xl);font-weight:800;color:var(--color-accent);">${formatNumber(sm.kpiNilai,2)}<span style="font-size:var(--text-xs);font-weight:400;color:var(--color-text-muted);"> / ${sm.kpiBobot}</span></div>
                  <div style="font-size:var(--text-xs);color:var(--color-text-muted);">${formatPercent((sm.kpiNilai/sm.kpiBobot)*100,1)} pencapaian</div>
                </div>
                <div style="width:56px;height:56px;flex-shrink:0;"><canvas id="ops-kpi-donut"></canvas></div>
              </div>
            </div>
            <div class="card-body" style="padding:0;overflow-x:auto;">
              <div id="ops-kpi-table"></div>
            </div>
          </div>

          <!-- ── PI SECTION (Bobot 60) ── -->
          <div class="card p-0" style="margin-bottom:var(--space-5);">
            <div class="card-header" style="border-bottom:3px solid var(--color-info,#03a2b8);">
              <div style="display:flex;align-items:center;gap:var(--space-3);flex:1;min-width:0;">
                <div style="width:38px;height:38px;border-radius:var(--radius-md);background:rgba(3,162,184,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <i data-lucide="bar-chart-2" style="width:18px;height:18px;color:var(--color-info,#03a2b8);"></i>
                </div>
                <div>
                  <div class="card-title" style="color:var(--color-info,#03a2b8);">PI &mdash; Performance Indicator</div>
                  <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:2px;">Bobot: <strong>60 poin</strong> &bull; 10 indikator (PI #4 s/d #13) &bull; Klik baris untuk commentary</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:var(--space-4);">
                <div style="text-align:right;">
                  <div style="font-size:var(--text-2xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em;">Nilai PI</div>
                  <div style="font-size:var(--text-xl);font-weight:800;color:var(--color-info,#03a2b8);">${formatNumber(sm.piNilai,2)}<span style="font-size:var(--text-xs);font-weight:400;color:var(--color-text-muted);"> / ${sm.piBobot}</span></div>
                  <div style="font-size:var(--text-xs);color:var(--color-text-muted);">${formatPercent((sm.piNilai/sm.piBobot)*100,1)} pencapaian</div>
                </div>
                <div style="width:56px;height:56px;flex-shrink:0;"><canvas id="ops-pi-donut"></canvas></div>
              </div>
            </div>
            <div class="card-body" style="padding:0;overflow-x:auto;">
              <div id="ops-pi-table"></div>
            </div>
          </div>

          <!-- ── PI #14 — PENGURANG KEPATUHAN ── -->
          <div class="card p-0">
            <div class="card-header" style="border-bottom:3px solid var(--color-danger);">
              <div style="display:flex;align-items:center;gap:var(--space-3);flex:1;min-width:0;">
                <div style="width:38px;height:38px;border-radius:var(--radius-md);background:var(--color-danger-tint);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <i data-lucide="shield-alert" style="width:18px;height:18px;color:var(--color-danger);"></i>
                </div>
                <div>
                  <div class="card-title" style="color:var(--color-danger);">PI #14 &mdash; Pengurang Kepatuhan (Maks &minus;30)</div>
                  <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:2px;">5 sub-indikator &bull; Pengurang aktif: <strong style="color:${sm.kepatuhanPenalty < 0 ? 'var(--color-danger)' : 'var(--color-success)'};">${sm.kepatuhanPenalty < 0 ? sm.kepatuhanPenalty + ' poin' : 'Tidak ada'}</strong></div>
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:var(--text-2xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em;">Total Pengurang</div>
                <div style="font-size:var(--text-xl);font-weight:800;color:${sm.kepatuhanPenalty < 0 ? 'var(--color-danger)' : 'var(--color-success)'};">${sm.kepatuhanPenalty < 0 ? sm.kepatuhanPenalty : '0 ✓'}</div>
              </div>
            </div>
            <div class="card-body" style="padding:0;overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;min-width:580px;">
                <thead>
                  <tr style="border-bottom:1px solid var(--color-border);background:var(--color-surface-2);">
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Sub-Indikator</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:center;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Maks Pengurang</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:center;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Aktual</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Target</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:center;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${o.kepatuhan.map(k => `
                    <tr style="border-bottom:1px solid var(--color-border);transition:background .15s;" onmouseover="this.style.background='var(--color-surface-2)'" onmouseout="this.style.background=''">
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);">${k.name}</td>
                      <td style="padding:var(--space-3) var(--space-4);text-align:center;font-size:var(--text-xs);font-weight:700;color:var(--color-danger);">${k.maxPenalty}</td>
                      <td style="padding:var(--space-3) var(--space-4);text-align:center;font-size:var(--text-sm);font-weight:700;color:${k.applied < 0 ? 'var(--color-danger)' : 'var(--color-success)'};">${k.applied < 0 ? k.applied : '—'}</td>
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);color:var(--color-text-muted);">${k.target}</td>
                      <td style="padding:var(--space-3) var(--space-4);text-align:center;">
                        <span class="status-pill ${k.status === 'success' ? 'completed' : 'needs-revision'}" style="font-size:10px;padding:2px 10px;">${k.status === 'success' ? '✓ Aman' : '⚠ Perhatian'}</span>
                      </td>
                    </tr>`).join('')}
                  <tr style="background:var(--color-surface-2);font-weight:700;border-top:2px solid var(--color-border);">
                    <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);">TOTAL</td>
                    <td style="padding:var(--space-3) var(--space-4);text-align:center;font-size:var(--text-xs);color:var(--color-danger);">−30</td>
                    <td style="padding:var(--space-3) var(--space-4);text-align:center;font-size:var(--text-sm);font-weight:800;color:${sm.kepatuhanPenalty < 0 ? 'var(--color-danger)' : 'var(--color-success)'};">${sm.kepatuhanPenalty < 0 ? sm.kepatuhanPenalty : '0 ✓'}</td>
                    <td colspan="2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        `;
      },

      'strategic': () => {
        const s = DATA.strategic;
        const persp = Object.values(s.perspectives);
        
        return `
          <!-- Balanced Scorecard Cards -->
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);">
            ${persp.map(p => `
              <div class="summary-hero-card" style="border-top: 3px solid var(--color-${p.color});">
                <div class="summary-hero-label" style="display:flex;align-items:center;gap:6px;"><i data-lucide="${p.icon}" style="width:16px;height:16px;color:var(--color-${p.color});"></i>${p.name}</div>
                <div class="summary-hero-value">${p.objectives.length}<span class="of">Objektif</span></div>
                <div class="summary-hero-meta delta-positive" style="color:var(--color-text-subtle);">
                  <span style="color:var(--color-success);">${p.objectives.filter(o => o.status === 'on-track').length} on-track</span> &middot;
                  <span style="color:var(--color-warning);">${p.objectives.filter(o => o.status === 'at-risk').length} at-risk</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Main Two-Column Layout -->
          <div class="two-col-grid" style="align-items:start;">
            <!-- Strategy Map -->
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="git-fork"></i>Strategy Map</div>
                <span class="card-meta">Hover node untuk melihat detail & relasi</span>
              </div>
              <div class="card-body" style="padding: var(--space-4); background: var(--color-surface-sunken); border-radius: 0 0 var(--radius-md) var(--radius-md); overflow-x: auto;">
                <div id="strategy-map-container" style="position:relative; width: 100%; min-width: 600px; height: 500px; margin: 0 auto;"></div>
              </div>
            </div>

            <!-- OKRs -->
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="target"></i>Objectives & Key Results (OKR)</div>
              </div>
              <div class="card-body" style="padding:0; overflow-x: auto;">
                <div id="okr-table-container"></div>
              </div>
            </div>
          </div>
        `;
      },

      'human-capital': () => {
        const h = DATA.humanCapital;
        return `
          <!-- KPI Cards -->
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);">
            ${h.kpis.map(k => {
              const d = formatDelta(k.delta, 1, k.isInverse);
              return `
                <div class="summary-hero-card kpi">
                  <div class="summary-hero-label"><i data-lucide="${k.icon}" style="width:16px;height:16px;color:var(--color-text-muted);"></i>${k.label}</div>
                  <div class="summary-hero-value">${k.formatted}</div>
                  <div class="summary-hero-meta delta-${d.type}">
                    <i data-lucide="${d.icon}"></i>${d.text} vs prev
                  </div>
                </div>`;
            }).join('')}
          </div>

          <!-- Charts Row -->
          <div class="two-col-grid">
            <div class="card">
              <div class="card-header"><div class="card-title"><i data-lucide="layout-grid"></i>Headcount per Bidang</div></div>
              <div class="card-body"><canvas id="hc-bidang-chart" height="250"></canvas></div>
            </div>
            <div class="card">
              <div class="card-header"><div class="card-title"><i data-lucide="building-2"></i>Headcount per UPMK</div></div>
              <div class="card-body"><canvas id="hc-bu-chart" height="250"></canvas></div>
            </div>
          </div>

          <!-- Age & Certification -->
          <div class="two-col-grid" style="align-items:stretch;">
            <div class="card" style="display:flex;flex-direction:column;">
              <div class="card-header"><div class="card-title"><i data-lucide="pyramid"></i>Age Distribution</div></div>
              <div class="card-body" style="flex:1;display:flex;align-items:center;justify-content:center;"><canvas id="hc-age-chart" height="300"></canvas></div>
            </div>
            <div class="card" style="display:flex;flex-direction:column;">
              <div class="card-header">
                <div class="card-title"><i data-lucide="badge-check"></i>Sertifikasi Keahlian &amp; Kompetensi</div>
                <span class="card-meta">Capaian vs Target per kategori &mdash; Februari 2026</span>
              </div>
              <div class="card-body" style="flex:1;display:flex;flex-direction:column;gap:var(--space-3);overflow-y:auto;min-height:0;">
                ${h.sertifikasi.kategori.map(k => {
                  const pct = Math.round((k.tersertifikasi / k.target) * 100);
                  const barW = Math.min(100, pct);
                  const statusColor = pct >= 100 ? 'var(--color-success)' : pct >= 75 ? 'var(--color-accent)' : pct >= 50 ? 'var(--color-warning)' : 'var(--color-danger)';
                  const statusPill = pct >= 100 ? 'completed' : pct >= 75 ? 'in-review' : 'needs-revision';
                  return `<div style="display:flex;flex-direction:column;gap:4px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);">
                      <div style="display:flex;align-items:center;gap:var(--space-2);min-width:0;">
                        <i data-lucide="${k.icon}" style="width:14px;height:14px;color:${statusColor};flex-shrink:0;"></i>
                        <span style="font-size:var(--text-xs);color:var(--color-text);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${k.name}">${k.name}</span>
                      </div>
                      <div style="display:flex;align-items:center;gap:var(--space-2);flex-shrink:0;">
                        <span style="font-size:var(--text-xs);color:var(--color-text-muted);">${k.tersertifikasi}/${k.target}</span>
                        <span class="status-pill ${statusPill}" style="font-size:var(--text-2xs);padding:1px 6px;">${pct}%</span>
                      </div>
                    </div>
                    <div style="height:8px;background:var(--color-surface-2);border-radius:var(--radius-full);overflow:hidden;">
                      <div style="height:100%;width:${barW}%;background:${statusColor};border-radius:var(--radius-full);transition:width 0.8s cubic-bezier(.4,0,.2,1);"></div>
                    </div>
                    <div style="font-size:var(--text-2xs);color:var(--color-text-subtle);">${k.lembaga}</div>
                  </div>`;
                }).join('')}
                <div style="margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--color-border);display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:var(--text-xs);color:var(--color-text-muted);">Total Sertifikasi Aktif:</span>
                  <strong style="color:var(--color-accent);font-size:var(--text-md);">872 sertifikat</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Certification by Unit Chart -->
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i data-lucide="bar-chart-3"></i>Distribusi Sertifikasi per Unit Kerja</div>
              <span class="card-meta">Jumlah pegawai tersertifikasi per UPMK &amp; Kantor Induk</span>
            </div>
            <div class="card-body"><canvas id="hc-cert-chart" height="240"></canvas></div>
          </div>

          <!-- Training -->
          <div class="card">
            <div class="card-header"><div class="card-title"><i data-lucide="graduation-cap"></i>Training &amp; Certification Pipeline</div></div>
            <div class="card-body" style="padding:0; overflow-x: auto;">
              <div id="training-table-container"></div>
            </div>
          </div>
        `;
      },

      'settings': () => {
        return `
          <div class="settings-layout">
            <!-- Sidebar Tabs -->
            <aside class="settings-sidebar">
              <div class="card p-0">
                <div class="card-header">
                  <div class="card-title"><i data-lucide="settings-2"></i>Pengaturan</div>
                </div>
                <nav class="settings-nav" id="settings-nav">
                  <button class="settings-tab active" data-tab="profile" onclick="switchSettingsTab('profile')">
                    <i data-lucide="user-circle-2"></i><span>Profil &amp; Preferensi</span>
                  </button>
                  <button class="settings-tab" data-tab="roles" onclick="switchSettingsTab('roles')">
                    <i data-lucide="shield-check"></i><span>Manajemen Peran</span>
                  </button>
                  <button class="settings-tab" data-tab="notifications" onclick="switchSettingsTab('notifications')">
                    <i data-lucide="bell-ring"></i><span>Notifikasi</span>
                  </button>
                  <button class="settings-tab" data-tab="audit" onclick="switchSettingsTab('audit')">
                    <i data-lucide="scroll-text"></i><span>Audit Log</span><span class="tab-badge">17</span>
                  </button>
                  <button class="settings-tab" data-tab="demo" onclick="switchSettingsTab('demo')">
                    <i data-lucide="play-circle"></i><span>Panduan Demo</span><span class="tab-badge" style="background:var(--color-success);">UAT</span>
                  </button>
                </nav>
              </div>
            </aside>
            <!-- Content Area (populated by initSettings) -->
            <main id="settings-content-area"></main>
          </div>
        `;
      },

      'risk': () => {
        const rk = DATA.risk;
        return `
          <!-- KPI Strip -->
          <div id="risk-kpi-strip" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--space-4);margin-bottom:var(--space-6);"></div>

          <!-- Main Grid: Heat Map + Top Risks -->
          <div class="two-col-grid" style="align-items:start;margin-bottom:var(--space-6);">
            <!-- Heat Map Card -->
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="grid-3x3"></i>Risk Heat Map (5&times;5)</div>
                <span class="card-meta">Likelihood &times; Impact &mdash; klik sel untuk filter register</span>
              </div>
              <div class="card-body" style="padding:var(--space-4);">
                <div id="risk-heatmap-container"></div>
                <div style="display:flex;gap:var(--space-3);margin-top:var(--space-4);flex-wrap:wrap;">
                  <span style="font-size:var(--text-xs);color:var(--color-text-muted);display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:12px;height:12px;border-radius:2px;background:rgba(220,38,38,0.30);border:1px solid rgba(220,38,38,.6);"></span>Critical (20&ndash;25)</span>
                  <span style="font-size:var(--text-xs);color:var(--color-text-muted);display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:12px;height:12px;border-radius:2px;background:rgba(239,68,68,0.18);border:1px solid rgba(239,68,68,.35);"></span>High (12&ndash;19)</span>
                  <span style="font-size:var(--text-xs);color:var(--color-text-muted);display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:12px;height:12px;border-radius:2px;background:rgba(245,158,11,0.18);border:1px solid rgba(245,158,11,.35);"></span>Medium (6&ndash;11)</span>
                  <span style="font-size:var(--text-xs);color:var(--color-text-muted);display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:12px;height:12px;border-radius:2px;background:rgba(16,185,129,0.18);border:1px solid rgba(16,185,129,.35);"></span>Low (1&ndash;5)</span>
                </div>
              </div>
            </div>

            <!-- Top Critical Risks -->
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="flame"></i>Top Risiko Kritis</div>
                <span class="card-meta">5 risiko dengan skor tertinggi</span>
              </div>
              <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-3);" id="risk-top-cards"></div>
            </div>
          </div>

          <!-- Charts Row: Category + Trend -->
          <div class="two-col-grid" style="margin-bottom:var(--space-6);">
            <div class="card">
              <div class="card-header"><div class="card-title"><i data-lucide="pie-chart"></i>Risiko per Kategori</div></div>
              <div class="card-body"><canvas id="risk-cat-chart" height="280"></canvas></div>
            </div>
            <div class="card">
              <div class="card-header"><div class="card-title"><i data-lucide="trending-down"></i>Tren Risiko (6 Bulan)</div><span class="card-meta">Open vs Mitigated vs Critical</span></div>
              <div class="card-body"><canvas id="risk-trend-chart" height="280"></canvas></div>
            </div>
          </div>

          <!-- Risk Register Table -->
          <div class="card p-0">
            <div class="card-header">
              <div class="card-title"><i data-lucide="table-2"></i>Risk Register &mdash; Seluruh Proyek PUSMANPRO</div>
              <span class="card-meta" id="risk-register-count">20 risiko terdaftar</span>
            </div>
            <div class="card-body" style="padding:0;overflow-x:auto;"><div id="risk-register-container"></div></div>
          </div>
        `;
      },

      'approvals': () => {
        const a = DATA.approvals;
        const faseAccent = ['var(--color-accent)','var(--color-info,#3b82f6)','var(--color-warning)','var(--color-success)','var(--color-text-muted)'];
        return `
          <!-- KPI Summary Strip -->
          <div id="approvals-kpi-strip" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);"></div>

          <!-- FASE Timeline Card -->
          <div class="card p-0" style="margin-bottom:var(--space-6);">
            <div class="card-header">
              <div class="card-title"><i data-lucide="calendar-clock"></i>Timeline Pelaporan Bulanan PUSMANPRO</div>
              <span class="card-meta">5 Fase siklus bulanan &mdash; <strong style="color:var(--color-danger);">Deadline: Tanggal 6 setiap bulan</strong></span>
            </div>
            <div class="card-body" style="padding:var(--space-4);">
              <!-- Horizontal milestone bar -->
              <div style="display:flex;align-items:center;gap:0;margin-bottom:var(--space-5);overflow-x:auto;padding-bottom:4px;">
                ${a.workflow.map((w, i) => `
                  <div style="display:flex;align-items:center;flex:1;min-width:0;">
                    <div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:100px;">
                      <div style="width:36px;height:36px;border-radius:50%;background:${faseAccent[i]};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${w.stage}</div>
                      <div style="font-size:10px;font-weight:700;color:${faseAccent[i]};margin-top:6px;text-align:center;white-space:nowrap;">${w.fase}</div>
                      <div style="font-size:10px;color:var(--color-text-muted);text-align:center;white-space:nowrap;">${w.deadline}</div>
                    </div>
                    ${i < a.workflow.length - 1 ? `<div style="flex:1;height:2px;background:linear-gradient(to right,${faseAccent[i]},${faseAccent[i+1]});min-width:20px;"></div>` : ''}
                  </div>
                `).join('')}
              </div>
              <!-- FASE detail cards -->
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:var(--space-3);" id="fase-detail-grid">
                ${a.workflow.map((w, i) => `
                  <div style="border:1px solid var(--color-border);border-top:3px solid ${faseAccent[i]};border-radius:var(--radius-md);padding:var(--space-3) var(--space-4);background:var(--color-surface);">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-2);">
                      <span style="font-size:10px;font-weight:700;color:${faseAccent[i]};text-transform:uppercase;letter-spacing:0.06em;">${w.fase} &bull; ${w.deadline}</span>
                      <span style="font-size:10px;background:var(--color-surface-2);color:var(--color-text-muted);padding:1px 7px;border-radius:8px;">SLA ${w.slaHours}j</span>
                    </div>
                    <div style="font-weight:600;font-size:var(--text-sm);color:var(--color-text);margin-bottom:var(--space-1);">${w.action}</div>
                    <div style="font-size:10px;color:var(--color-accent);margin-bottom:var(--space-2);line-height:1.4;">${ROLES[w.role].label}</div>
                    <ul style="margin:0;padding-left:14px;font-size:10px;color:var(--color-text-muted);line-height:1.75;list-style-type:'✓ ';">
                      ${(w.checklist || []).map(c => `<li style="padding-left:2px;">${c}</li>`).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- 14 Indikator KPI/PI Matrix -->
          <div class="card p-0" style="margin-bottom:var(--space-6);">
            <div class="card-header">
              <div class="card-title"><i data-lucide="list-checks"></i>Matriks 14 Indikator KPI/PI PUSMANPRO 2026</div>
              <span class="card-meta">KPI Bobot 40 &middot; PI Bobot 60 &middot; Total 100 &mdash; Traffic light: <span style="color:var(--color-success);">&#9679; Hijau &ge;100%</span> &middot; <span style="color:var(--color-warning);">&#9679; Kuning 90&ndash;99%</span> &middot; <span style="color:var(--color-danger);">&#9679; Merah &lt;90%</span></span>
            </div>
            <div class="card-body" style="padding:0;overflow-x:auto;">
              <div id="indicator-matrix-container"></div>
            </div>
          </div>

          <!-- Pending Tasks Card -->
          <div class="card p-0" id="approvals-pending-card" style="margin-bottom:var(--space-6);">
            <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div class="card-title"><i data-lucide="clipboard-list"></i>Tugas Approval Saya</div>
                <div class="card-subtitle" id="approvals-pending-subtitle">Memuat...</div>
              </div>
              <div class="status-pill" id="approvals-pending-badge" style="background:var(--color-accent-tint);color:var(--color-accent);font-weight:bold;">— Tugas</div>
            </div>
            <div class="card-body" style="padding:0;overflow-x:auto;">
              <div id="pending-table-container"></div>
            </div>
          </div>

          <!-- All Reports Card -->
          <div class="card p-0" id="all-reports-card" style="margin-bottom:var(--space-6);">
            <div class="card-header">
              <div class="card-title"><i data-lucide="file-text"></i>Semua Laporan Kinerja Manajemen</div>
              <span class="card-meta">Riwayat dan status terkini seluruh laporan</span>
            </div>
            <div class="card-body" style="padding:0;overflow-x:auto;">
              <div id="all-reports-table-container"></div>
            </div>
          </div>

          <!-- RACI Matrix Card -->
          <div class="card p-0">
            <div class="card-header">
              <div class="card-title"><i data-lucide="users-round"></i>Matriks RACI — Peran &amp; Tanggung Jawab</div>
              <span class="card-meta">R=Responsible &middot; A=Accountable &middot; C=Consulted &middot; I=Informed</span>
            </div>
            <div class="card-body" style="padding:0;overflow-x:auto;">
              <div id="raci-matrix-container"></div>
            </div>
          </div>
        `;
      },

      'workflow-km': (phase = 'all') => {
        const km = DATA.workflowKM;
        const a  = DATA.approvals;
        const op = DATA.operational;
        const isUsulan = phase === 'usulan' || phase === 'all';
        const isRealisasi = phase === 'realisasi' || phase === 'all';
        const phaseTitle = phase === 'usulan' ? 'Proses Usulan KM' : phase === 'realisasi' ? 'Proses Realisasi KM' : 'Kontrak Manajemen PUSMANPRO';
        const phaseSubtitle = phase === 'usulan' ? 'WF-1 / WF-1b / WF-2 — KPI Proposal Kantor Induk &amp; UPMK + Draft Kontrak Manajemen' : phase === 'realisasi' ? 'WF-3 — Monitoring realisasi KPI Kontrak Manajemen vs target 2026' : 'Workflow KPI Proposal, Draft KM &amp; Monitoring Realisasi 2026';
        // Filter pending approvals by phase: USULAN = WF-1/WF-1b items; REALISASI = WF-3 items (none yet in seed data)
        const filteredPending = phase === 'realisasi'
          ? km.pendingApprovals.filter(p => /WF-?3/i.test(p.tipe || p.docId || ''))
          : phase === 'usulan'
            ? km.pendingApprovals.filter(p => /WF-?1/i.test(p.tipe || p.docId || ''))
            : km.pendingApprovals;
        const kmBadge = (s) => {
          const cfg = { 'APPROVED':{'cls':'completed','lbl':'APPROVED'}, 'IN_REVIEW_C1':{'cls':'in-review','lbl':'IN REVIEW C1'}, 'IN_REVIEW_C2':{'cls':'in-review','lbl':'IN REVIEW C2'}, 'IN_REVIEW_SM':{'cls':'in-review','lbl':'IN REVIEW SM'}, 'SIGNED_GM':{'cls':'completed','lbl':'SIGNED GM'}, 'RETURNED':{'cls':'needs-revision','lbl':'RETURNED'}, 'OVERDUE':{'cls':'needs-revision','lbl':'OVERDUE'}, 'DRAFT':{'cls':'draft','lbl':'DRAFT'} };
          const c = cfg[s] || { cls:'draft', lbl:s };
          return `<span class="status-pill ${c.cls}" style="font-size:10px;padding:2px 8px;">${c.lbl}</span>`;
        };
        const sevBadge = (s) => ({ 'critical':'<span style="font-size:10px;font-weight:700;color:var(--color-danger);">● KRITIS</span>', 'medium':'<span style="font-size:10px;font-weight:700;color:var(--color-warning);">● MEDIUM</span>', 'info':'<span style="font-size:10px;font-weight:700;color:var(--color-info,#3b82f6);">● INFO</span>' }[s] || '');
        const actionBadge = (a) => ({ 'APPROVED':'<span style="font-size:10px;font-weight:700;color:var(--color-success);">✓ APPROVED</span>', 'RETURNED':'<span style="font-size:10px;font-weight:700;color:var(--color-warning);">↩ RETURNED</span>' }[a] || `<span style="font-size:10px;color:var(--color-text-muted);">${a}</span>`);

        const kiApproved = km.statusBidang.filter(x => x.status === 'APPROVED').length;
        const upmkApproved = km.statusUPMK.filter(x => x.status === 'APPROVED').length;
        const wf2Lbl = { 'IN_REVIEW_SM':'In Review SM', 'IN_REVIEW_C1':'In Review C1', 'SIGNED_GM':'Signed GM', 'DRAFT':'Draft' }[km.meta.statusWF2] || km.meta.statusWF2;

        const calcCapaian = (k) => {
          if (k.bobot < 0) return k.realisasi < 0 ? k.realisasi : 0;
          if (k.polarity === 'LOWER_IS_BETTER') return k.realisasi === 0 ? 100 : Math.min(100, (k.target / k.realisasi) * 100);
          return k.target === 0 ? 100 : Math.min(100, (k.realisasi / k.target) * 100);
        };
        const nilaiKPI = km.kpiKantorInduk.map(k => k.bobot < 0 ? (k.realisasi < 0 ? Math.abs(k.realisasi) * (k.bobot / -3) * -1 : 0) : (calcCapaian(k) / 100) * k.bobot);
        const skorSementara = nilaiKPI.reduce((a, v) => a + v, 0).toFixed(1);

        const wfStages = [
          { id:'WF-1',  label:'KPI Proposal<br>Kantor Induk', pct: Math.round((kiApproved/km.statusBidang.length)*100), clr:'var(--color-accent)',       done: kiApproved === km.statusBidang.length },
          { id:'WF-1b', label:'KPI Proposal<br>UPMK I–V',    pct: Math.round((upmkApproved/km.statusUPMK.length)*100), clr:'var(--color-info,#3b82f6)', done: upmkApproved === km.statusUPMK.length },
          { id:'WF-2',  label:'Draft Kontrak<br>Manajemen',  pct: km.meta.statusWF2 === 'SIGNED_GM' ? 100 : 45,        clr:'var(--color-warning)',     done: km.meta.statusWF2 === 'SIGNED_GM' },
          { id:'WF-3',  label:'Monitoring<br>Realisasi',     pct: 10,                                                   clr:'var(--color-text-muted)',  done: false },
        ];

        return `
          <!-- Page Header -->
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:var(--space-6);gap:var(--space-4);flex-wrap:wrap;">
            <div>
              <h2 style="font-size:var(--text-xl);font-weight:700;color:var(--color-text);margin:0;">${phaseTitle}</h2>
              <p style="font-size:var(--text-sm);color:var(--color-text-muted);margin:var(--space-1) 0 0;">${phaseSubtitle}</p>
            </div>
            <div style="display:flex;gap:var(--space-2);">
              <button class="btn btn-ghost btn-sm" id="km-export-pdf-btn" onclick="exportKMReport()"><i data-lucide="download"></i><span>Export PDF</span></button>
              <button class="btn btn-primary btn-sm" id="km-create-proposal-btn" onclick="openKMCreateProposalModal()"><i data-lucide="plus-circle"></i><span>Buat Proposal</span></button>
            </div>
          </div>

          <!-- Pending Approvals (full-width) — dipindahkan ke atas agar langsung terlihat -->
          <div class="card" style="margin-bottom:var(--space-6);">
            <div class="card-header">
              <div class="card-title"><i data-lucide="clock-4"></i>Pending Approval ${phase === 'usulan' ? '— Usulan KM' : phase === 'realisasi' ? '— Realisasi KM' : ''}</div>
              <span class="card-meta">${filteredPending.length} aksi tertunda &bull; Role aktif: <strong style="color:var(--color-accent);">${ROLES[state.role].label}</strong></span>
            </div>
            <div class="card-body" style="padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));" id="km-pending-grid">
              ${filteredPending.map((p, idx) => {
                const canAct = canActOnKMItem(p, state.role);
                const isOverdue = p.slaRemain === 'OVERDUE';
                const primary = (p.action || '').toLowerCase().includes('revisi') ? 'resubmit'
                              : (p.action || '').toLowerCase().includes('forward') ? 'forward'
                              : 'approve';
                // BUG-001 FIX: escape all user-input fields before render
                const eDocId = escapeHtml(p.docId);
                const eTipe = escapeHtml(p.tipe);
                const eHolder = escapeHtml(p.holder);
                const eBidangUnit = escapeHtml(p.bidangUnit);
                const eAction = escapeHtml(p.action);
                const eDeadline = escapeHtml(p.deadline);
                const eSlaRemain = escapeHtml(p.slaRemain);
                return `
                <div data-km-pending-id="${eDocId}" style="padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--color-border);display:flex;align-items:flex-start;gap:var(--space-3);">
                  <div style="width:32px;height:32px;flex-shrink:0;border-radius:var(--radius-sm);background:${isOverdue ? 'rgba(239,68,68,.15)' : 'var(--color-surface-2)'};display:flex;align-items:center;justify-content:center;">
                    <i data-lucide="${isOverdue ? 'alert-circle' : 'file-text'}" style="width:16px;height:16px;color:${isOverdue ? 'var(--color-danger)' : 'var(--color-accent)'};"></i>
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;">
                      <code style="font-size:10px;color:var(--color-accent);">${eDocId}</code>
                      <span style="font-size:10px;background:var(--color-surface-2);padding:1px 6px;border-radius:var(--radius-full);">${eTipe}</span>
                      <span style="font-size:10px;background:var(--color-surface-2);padding:1px 6px;border-radius:var(--radius-full);color:var(--color-text-muted);">Holder: ${eHolder}</span>
                    </div>
                    <div style="font-size:var(--text-xs);font-weight:600;color:var(--color-text);margin-top:4px;">${eBidangUnit}</div>
                    <div style="font-size:10px;color:var(--color-text-muted);margin-top:2px;">${eAction} &bull; Deadline: ${eDeadline} &bull; <span style="font-weight:700;color:${isOverdue ? 'var(--color-danger)' : 'var(--color-text-muted)'};">${eSlaRemain}</span></div>
                    <div style="margin-top:6px;display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;">
                      ${p.attachment ? `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);border-radius:var(--radius-full);font-size:10px;color:var(--color-success);"><i data-lucide="paperclip" style="width:10px;height:10px;"></i><span>${escapeHtml(p.attachment.name)}</span><span style="color:var(--color-text-muted);">(${formatFileSize(p.attachment.size)})</span></span>` : `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;background:var(--color-surface-2);border:1px solid var(--color-border);border-radius:var(--radius-full);font-size:10px;color:var(--color-text-muted);"><i data-lucide="database" style="width:10px;height:10px;"></i><span>Data sistem (${eTipe})</span></span>`}
                      <button class="btn btn-ghost btn-sm" onclick="openKMReviewModal('${eDocId}');setTimeout(()=>previewKMAttachment('${eDocId}'),120)" style="font-size:10px;padding:2px 8px;color:var(--color-accent);"><i data-lucide="eye" style="width:10px;height:10px;"></i><span>Pratinjau</span></button>
                      <button class="btn btn-ghost btn-sm" onclick="downloadKMAttachment('${eDocId}')" style="font-size:10px;padding:2px 8px;color:var(--color-success);" title="${p.attachment ? 'Unduh file lampiran asli' : 'Unduh file Excel sintetik dari data sistem'}"><i data-lucide="download" style="width:10px;height:10px;"></i><span>Unduh</span></button>
                    </div>
                    ${canAct ? `
                      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
                        ${primary === 'resubmit' ? `
                          <button class="btn btn-sm btn-primary" onclick="handleKMAction('${eDocId}','resubmit')" style="font-size:10px;padding:4px 10px;"><i data-lucide="send" style="width:12px;height:12px;"></i><span>Resubmit</span></button>
                        ` : `
                          <button class="btn btn-sm btn-primary" onclick="handleKMAction('${eDocId}','${primary}')" style="font-size:10px;padding:4px 10px;"><i data-lucide="check" style="width:12px;height:12px;"></i><span>${primary === 'forward' ? 'Approve & Forward' : 'Approve'}</span></button>
                          <button class="btn btn-sm btn-ghost" onclick="handleKMAction('${eDocId}','return')" style="font-size:10px;padding:4px 10px;color:var(--color-warning);"><i data-lucide="rotate-ccw" style="width:12px;height:12px;"></i><span>Return</span></button>
                        `}
                        <button class="btn btn-sm btn-ghost" onclick="openKMReviewModal('${eDocId}')" style="font-size:10px;padding:4px 10px;"><i data-lucide="eye" style="width:12px;height:12px;"></i><span>Review</span></button>
                      </div>
                    ` : `
                      <div style="margin-top:6px;font-size:10px;color:var(--color-text-subtle);font-style:italic;"><i data-lucide="lock" style="width:10px;height:10px;vertical-align:-1px;"></i> Bukan giliran role ${escapeHtml(ROLES[state.role].label)}. Holder saat ini: <strong>${eHolder}</strong>.</div>
                    `}
                  </div>
                </div>`;
              }).join('') || '<div style="padding:var(--space-6);text-align:center;color:var(--color-text-muted);"><i data-lucide="check-circle-2" style="width:32px;height:32px;color:var(--color-success);"></i><div style="margin-top:8px;">Tidak ada pending approval</div></div>'}
            </div>
          </div>

          <!-- Hero KPI Strip -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:var(--space-4);margin-bottom:var(--space-6);">
            <div class="card" style="padding:var(--space-4);">
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-1);display:flex;align-items:center;gap:6px;"><i data-lucide="building-2" style="width:14px;height:14px;color:var(--color-accent);"></i>Proposal KI Diterima</div>
              <div style="font-size:var(--text-2xl);font-weight:700;color:var(--color-text);" data-animate-number data-target="${kiApproved}" data-formatted="${kiApproved}">${kiApproved}<span style="font-size:var(--text-sm);color:var(--color-text-muted);font-weight:400;"> / ${km.statusBidang.length} Bidang</span></div>
              <div style="margin-top:var(--space-2);height:4px;background:var(--color-surface-2);border-radius:var(--radius-full);"><div style="height:4px;width:${Math.round(kiApproved/km.statusBidang.length*100)}%;background:var(--color-accent);border-radius:var(--radius-full);"></div></div>
            </div>
            <div class="card" style="padding:var(--space-4);">
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-1);display:flex;align-items:center;gap:6px;"><i data-lucide="map-pin" style="width:14px;height:14px;color:var(--color-info,#3b82f6);"></i>Proposal UPMK Diterima</div>
              <div style="font-size:var(--text-2xl);font-weight:700;color:var(--color-text);" data-animate-number data-target="${upmkApproved}" data-formatted="${upmkApproved}">${upmkApproved}<span style="font-size:var(--text-sm);color:var(--color-text-muted);font-weight:400;"> / ${km.statusUPMK.length} Unit</span></div>
              <div style="margin-top:var(--space-2);height:4px;background:var(--color-surface-2);border-radius:var(--radius-full);"><div style="height:4px;width:${Math.round(upmkApproved/km.statusUPMK.length*100)}%;background:var(--color-info,#3b82f6);border-radius:var(--radius-full);"></div></div>
            </div>
            <div class="card" style="padding:var(--space-4);">
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-1);display:flex;align-items:center;gap:6px;"><i data-lucide="file-signature" style="width:14px;height:14px;color:var(--color-warning);"></i>Status Draft KM (WF-2)</div>
              <div style="font-size:var(--text-lg);font-weight:700;color:var(--color-text);margin-top:var(--space-1);">${wf2Lbl}</div>
              <div style="margin-top:var(--space-2);">${kmBadge(km.meta.statusWF2)}</div>
            </div>
            <div class="card" style="padding:var(--space-4);">
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-1);display:flex;align-items:center;gap:6px;"><i data-lucide="bar-chart-3" style="width:14px;height:14px;color:var(--color-success);"></i>Skor KM Sementara</div>
              <div style="font-size:var(--text-2xl);font-weight:700;color:var(--color-text);" data-animate-number data-target="${skorSementara}" data-formatted="${skorSementara}">${skorSementara}<span style="font-size:var(--text-sm);color:var(--color-text-muted);font-weight:400;"> / 100</span></div>
              <div style="font-size:10px;color:var(--color-text-muted);margin-top:var(--space-1);">Periode: ${km.meta.periodeAktif}</div>
            </div>
          </div>

          <!-- Workflow Pipeline -->
          <div class="card" style="margin-bottom:var(--space-6);">
            <div class="card-header">
              <div class="card-title"><i data-lucide="git-branch"></i>Alur Kerja Kontrak Manajemen 2026</div>
              <span class="card-meta">4 workflow saling terhubung — WF-1 &amp; WF-1b harus selesai sebelum WF-2 dapat ditandatangani</span>
            </div>
            <div class="card-body">
              <div style="display:flex;align-items:stretch;gap:0;overflow-x:auto;padding-bottom:4px;">
                ${wfStages.map((w, i) => `
                  <div style="display:flex;align-items:center;flex:1;min-width:0;">
                    <div style="flex:1;min-width:140px;background:var(--color-surface-2);border-radius:var(--radius-md);padding:var(--space-4);border:1px solid ${w.done ? w.clr : 'var(--color-border)'};transition:border-color .2s;">
                      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-2);">
                        <span style="font-size:10px;font-weight:800;letter-spacing:.06em;color:${w.clr};">${w.id}</span>
                        <span style="font-size:12px;font-weight:700;color:${w.done ? 'var(--color-success)' : 'var(--color-text-muted)'};">${w.pct}%</span>
                      </div>
                      <div style="font-size:var(--text-xs);font-weight:600;color:var(--color-text);line-height:1.4;margin-bottom:var(--space-3);">${w.label}</div>
                      <div style="height:4px;background:var(--color-surface-hover);border-radius:var(--radius-full);"><div style="height:4px;width:${w.pct}%;background:${w.clr};border-radius:var(--radius-full);transition:width .6s;"></div></div>
                    </div>
                    ${i < wfStages.length - 1 ? `<div style="flex-shrink:0;width:24px;display:flex;align-items:center;justify-content:center;"><i data-lucide="chevron-right" style="width:16px;height:16px;color:var(--color-border);"></i></div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          ${isUsulan ? `
          <!-- Status Grid: WF-1 + WF-1b -->
          <div class="two-col-grid" style="margin-bottom:var(--space-6);align-items:start;">
            <!-- WF-1: Kantor Induk -->
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="building-2"></i>WF-1 — Proposal KI per Bidang</div>
                <span class="card-meta">${kiApproved}/${km.statusBidang.length} disetujui</span>
              </div>
              <div class="card-body table-responsive" style="padding:0;">
                <table style="width:100%;border-collapse:collapse;min-width:480px;">
                  <thead><tr style="border-bottom:1px solid var(--color-border);">
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Bidang</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Maker</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Status</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">SLA</th>
                  </tr></thead>
                  <tbody>${km.statusBidang.map(b => `
                    <tr style="border-bottom:1px solid var(--color-border);transition:background .15s;" onmouseover="this.style.background='var(--color-surface-2)'" onmouseout="this.style.background=''">
                      <td style="padding:var(--space-3) var(--space-4);"><strong style="font-size:var(--text-xs);">${escapeHtml(b.bidang)}</strong><br><span style="font-size:10px;color:var(--color-text-muted);">${escapeHtml(b.peran)}</span></td>
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);">${escapeHtml(b.maker)}</td>
                      <td style="padding:var(--space-3) var(--space-4);">${kmBadge(b.status)}</td>
                      <td style="padding:var(--space-3) var(--space-4);font-size:10px;color:${b.sla === 'OVERDUE' ? 'var(--color-danger)' : 'var(--color-text-muted)'};">${escapeHtml(b.sla || '—')}</td>
                    </tr>`).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- WF-1b: UPMK -->
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="map-pin"></i>WF-1b — Proposal UPMK I–V</div>
                <span class="card-meta">${upmkApproved}/${km.statusUPMK.length} disetujui</span>
              </div>
              <div class="card-body table-responsive" style="padding:0;">
                <table style="width:100%;border-collapse:collapse;min-width:480px;">
                  <thead><tr style="border-bottom:1px solid var(--color-border);">
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Unit</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Manager</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Status</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:right;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">MW / KMS / MVA</th>
                  </tr></thead>
                  <tbody>${km.statusUPMK.map(u => `
                    <tr style="border-bottom:1px solid var(--color-border);transition:background .15s;" onmouseover="this.style.background='var(--color-surface-2)'" onmouseout="this.style.background=''">
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);font-weight:600;">${escapeHtml(u.unit)}</td>
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);">${escapeHtml(u.mgrUPMK)}</td>
                      <td style="padding:var(--space-3) var(--space-4);">${kmBadge(u.status)}</td>
                      <td style="padding:var(--space-3) var(--space-4);text-align:right;font-size:10px;color:var(--color-text-muted);">${u.kapasitas.mw.toLocaleString('id-ID')} / ${u.kapasitas.kms.toLocaleString('id-ID')} / ${u.kapasitas.mva.toLocaleString('id-ID')}</td>
                    </tr>`).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          ` : ''}

          <!-- KPI Catalog (tabbed) -->
          <div class="card" style="margin-bottom:var(--space-6);">
            <div class="card-header">
              <div class="card-title"><i data-lucide="list-checks"></i>Katalog KPI 2026</div>
              <div style="display:flex;gap:var(--space-2);">
                <button class="km-tab-btn btn btn-secondary btn-sm active" data-tab="ki" onclick="switchKMTab('ki')" style="font-size:var(--text-xs);">Kantor Induk</button>
                <button class="km-tab-btn btn btn-ghost btn-sm" data-tab="upmk" onclick="switchKMTab('upmk')" style="font-size:var(--text-xs);">UPMK I–V</button>
              </div>
            </div>
            <div class="card-body" style="padding:0;overflow-x:auto;">
              <div id="km-tab-ki">
                <div id="km-kpi-ki-container"></div>
              </div>
              <div id="km-tab-upmk" hidden>
                <table style="width:100%;border-collapse:collapse;">
                  <thead><tr style="border-bottom:1px solid var(--color-border);background:var(--color-surface-sunken);">
                    <th style="padding:var(--space-3) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);white-space:nowrap;">No</th>
                    <th style="padding:var(--space-3) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);">Indikator</th>
                    <th style="padding:var(--space-3) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);">Formula</th>
                    <th style="padding:var(--space-3) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);">Satuan</th>
                    <th style="padding:var(--space-3) var(--space-4);text-align:right;font-size:var(--text-xs);color:var(--color-text-muted);">Bobot</th>
                    <th style="padding:var(--space-3) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);">Target</th>
                    <th style="padding:var(--space-3) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);">Polarity</th>
                  </tr></thead>
                  <tbody>${km.kpiUPMK.map(k => `
                    <tr style="border-bottom:1px solid var(--color-border);transition:background .15s;" onmouseover="this.style.background='var(--color-surface-2)'" onmouseout="this.style.background=''">
                      <td style="padding:var(--space-3) var(--space-4);"><code style="font-size:10px;color:var(--color-accent);">${k.no}</code></td>
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);font-weight:600;max-width:220px;">${k.indikator}</td>
                      <td style="padding:var(--space-3) var(--space-4);font-size:10px;color:var(--color-text-muted);max-width:180px;">${k.formula}</td>
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);">${k.satuan}</td>
                      <td style="padding:var(--space-3) var(--space-4);text-align:right;font-size:var(--text-xs);font-weight:700;color:var(--color-accent);">${k.bobot}</td>
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);color:var(--color-text-muted);">${k.targetLabel}</td>
                      <td style="padding:var(--space-3) var(--space-4);"><span style="font-size:10px;padding:2px 6px;border-radius:var(--radius-full);background:var(--color-surface-2);color:${k.polarity === 'HIGHER_IS_BETTER' ? 'var(--color-success)' : 'var(--color-info,#3b82f6)'};">${k.polarity === 'HIGHER_IS_BETTER' ? '↑ Tinggi' : '↓ Rendah'}</span></td>
                    </tr>`).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Audit Trail -->
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i data-lucide="scroll-text"></i>Audit Trail Terbaru</div>
              <span class="card-meta">5 aktivitas terakhir</span>
            </div>
            <div class="card-body" style="padding:0;">
              ${km.auditRecent.map((e, i) => {
                // BUG-001 FIX: escape audit trail user fields
                const eDoc = escapeHtml(e.doc);
                const eActor = escapeHtml(e.actor);
                const eNote = escapeHtml(e.note);
                const eTs = escapeHtml(e.ts);
                const isApproved = e.action === 'APPROVED';
                return `
                <div style="padding:var(--space-3) var(--space-4);border-bottom:${i < km.auditRecent.length-1 ? '1px solid var(--color-border)' : 'none'};display:flex;align-items:flex-start;gap:var(--space-3);">
                  <div style="width:28px;height:28px;flex-shrink:0;border-radius:50%;background:var(--color-surface-2);display:flex;align-items:center;justify-content:center;">
                    <i data-lucide="${isApproved?'check-circle-2':'rotate-ccw'}" style="width:14px;height:14px;color:${isApproved?'var(--color-success)':'var(--color-warning)'};"></i>
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;">
                      ${actionBadge(e.action)}
                      <code style="font-size:10px;color:var(--color-accent);">${eDoc}</code>
                    </div>
                    <div style="font-size:var(--text-xs);color:var(--color-text);margin-top:2px;">${eActor}</div>
                    ${e.note !== '-' ? `<div style="font-size:10px;color:var(--color-text-muted);margin-top:2px;">${eNote}</div>` : ''}
                  </div>
                  <span style="font-size:10px;color:var(--color-text-muted);flex-shrink:0;white-space:nowrap;">${eTs}</span>
                </div>`;
              }).join('')}
            </div>
          </div>

          ${isRealisasi ? `
          <!-- ══════════════════════════════════════════════════════
               WF-3 — Monitoring Realisasi KPI vs Komitmen KM 2026
               ══════════════════════════════════════════════════════ -->

          <!-- Summary strip -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:var(--space-4);margin-bottom:var(--space-6);">
            <div class="card" style="padding:var(--space-4);">
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-1);display:flex;align-items:center;gap:6px;"><i data-lucide="bar-chart-3" style="width:14px;height:14px;color:var(--color-success);"></i>Skor Realisasi KM</div>
              <div style="font-size:var(--display-sm);font-weight:800;color:var(--color-text);">${skorSementara}<span style="font-size:var(--text-sm);color:var(--color-text-muted);font-weight:400;"> / 100</span></div>
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px;">Periode: ${km.meta.periodeAktif}</div>
            </div>
            <div class="card" style="padding:var(--space-4);">
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-1);display:flex;align-items:center;gap:6px;"><i data-lucide="check-circle-2" style="width:14px;height:14px;color:var(--color-accent);"></i>KPI On Track / Tercapai</div>
              <div style="font-size:var(--display-sm);font-weight:800;color:var(--color-text);">${(() => { const c=(k)=>k.polarity==='LOWER_IS_BETTER'?(k.realisasi===0?100:Math.min(100,(k.target/k.realisasi)*100)):(k.target===0?100:Math.min(100,(k.realisasi/k.target)*100)); return km.kpiKantorInduk.filter(k=>k.bobot>0&&c(k)>=85).length; })()}<span style="font-size:var(--text-sm);color:var(--color-text-muted);font-weight:400;"> / ${km.kpiKantorInduk.filter(k=>k.bobot>0).length}</span></div>
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px;">Threshold ≥ 85% capaian</div>
            </div>
            <div class="card" style="padding:var(--space-4);${km.kpiKantorInduk.filter(k=>k.bobot<0&&k.realisasi<0).length>0?'border-color:var(--color-danger);':''}" >
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-1);display:flex;align-items:center;gap:6px;"><i data-lucide="alert-triangle" style="width:14px;height:14px;color:var(--color-danger);"></i>Pengurang Aktif</div>
              <div style="font-size:var(--display-sm);font-weight:800;color:${km.kpiKantorInduk.filter(k=>k.bobot<0&&k.realisasi<0).length>0?'var(--color-danger)':'var(--color-success)'};">${km.kpiKantorInduk.filter(k=>k.bobot<0&&k.realisasi<0).length}<span style="font-size:var(--text-sm);color:var(--color-text-muted);font-weight:400;"> / 3 Pengurang</span></div>
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px;">${km.kpiKantorInduk.filter(k=>k.bobot<0&&k.realisasi<0).length>0?'⚠ Ada pengurang aktif':'✓ Tidak ada pengurang'}</div>
            </div>
            <div class="card" style="padding:var(--space-4);">
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-1);display:flex;align-items:center;gap:6px;"><i data-lucide="calendar-clock" style="width:14px;height:14px;color:var(--color-warning);"></i>Deadline Input Realisasi</div>
              <div style="font-size:var(--text-lg);font-weight:700;color:var(--color-text);">Tgl 6 / Bulan</div>
              <button class="btn btn-primary btn-sm" style="margin-top:var(--space-2);font-size:10px;padding:4px 12px;" onclick="openWF3InputModal()"><i data-lucide="edit" style="width:12px;height:12px;"></i><span>Input Realisasi</span></button>
            </div>
          </div>

          <!-- Full KPI Realisasi Table -->
          <div class="card p-0" style="margin-bottom:var(--space-6);">
            <div class="card-header">
              <div class="card-title"><i data-lucide="list-checks"></i>Tabel Realisasi KPI Kontrak Manajemen 2026</div>
              <span class="card-meta">Semua indikator termasuk pengurang — klik baris untuk trend bulanan</span>
            </div>
            <div class="card-body" style="padding:0;overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;min-width:720px;">
                <thead>
                  <tr style="border-bottom:1px solid var(--color-border);background:var(--color-surface-2);">
                    <th style="padding:var(--space-2) var(--space-3);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">No</th>
                    <th style="padding:var(--space-2) var(--space-3);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Indikator</th>
                    <th style="padding:var(--space-2) var(--space-3);text-align:center;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Bobot</th>
                    <th style="padding:var(--space-2) var(--space-3);text-align:right;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Target</th>
                    <th style="padding:var(--space-2) var(--space-3);text-align:right;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Realisasi</th>
                    <th style="padding:var(--space-2) var(--space-3);text-align:center;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Capaian %</th>
                    <th style="padding:var(--space-2) var(--space-3);text-align:right;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Nilai</th>
                    <th style="padding:var(--space-2) var(--space-3);text-align:center;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${(() => {
                    const calcRow = (k) => {
                      if (k.bobot < 0) {
                        const val = k.realisasi < 0 ? k.realisasi : 0;
                        return { pct: null, nilai: val, clr: val < 0 ? 'var(--color-danger)' : 'var(--color-success)', lbl: val < 0 ? 'Pengurang' : '—' };
                      }
                      const pct = k.polarity === 'LOWER_IS_BETTER'
                        ? (k.realisasi === 0 ? 100 : Math.min(110, (k.target / k.realisasi) * 100))
                        : (k.target === 0 ? 100 : Math.min(110, (k.realisasi / k.target) * 100));
                      const nilai = (pct / 100) * k.bobot;
                      const clr = pct >= 100 ? 'var(--color-success)' : pct >= 90 ? 'var(--color-warning)' : 'var(--color-danger)';
                      const lbl = pct >= 100 ? 'Tercapai' : pct >= 90 ? 'Waspada' : pct >= 75 ? 'Tertinggal' : 'Kritis';
                      return { pct, nilai, clr, lbl };
                    };
                    let totalNilai = 0;
                    const rows = km.kpiKantorInduk.map(k => {
                      const r = calcRow(k);
                      totalNilai += r.nilai;
                      const isPengurang = k.bobot < 0;
                      const barWidth = r.pct !== null ? Math.min(r.pct, 100) : 0;
                      return `
                        <tr style="border-bottom:1px solid var(--color-border);background:${isPengurang?'rgba(236,28,36,0.04)':''};transition:background .15s;" onmouseover="this.style.background='var(--color-surface-2)'" onmouseout="this.style.background='${isPengurang?'rgba(236,28,36,0.04)':''}'">
                          <td style="padding:var(--space-2) var(--space-3);font-size:10px;font-weight:700;color:${isPengurang?'var(--color-danger)':'var(--color-accent)'};">${k.no}</td>
                          <td style="padding:var(--space-2) var(--space-3);font-size:var(--text-xs);font-weight:600;color:var(--color-text);max-width:220px;">${k.indikator}<div style="font-size:9px;color:var(--color-text-muted);margin-top:1px;">${k.formula}</div></td>
                          <td style="padding:var(--space-2) var(--space-3);text-align:center;font-size:var(--text-xs);font-weight:700;color:${isPengurang?'var(--color-danger)':'var(--color-text)'};">${k.bobot < 0 ? '−' + Math.abs(k.bobot) : k.bobot}</td>
                          <td style="padding:var(--space-2) var(--space-3);text-align:right;font-size:var(--text-xs);">${k.target.toLocaleString('id-ID')} <span style="color:var(--color-text-muted);font-size:9px;">${k.satuan}</span></td>
                          <td style="padding:var(--space-2) var(--space-3);text-align:right;font-size:var(--text-xs);font-weight:600;color:${r.clr};">${k.realisasi.toLocaleString('id-ID')} <span style="color:var(--color-text-muted);font-size:9px;">${k.satuan}</span></td>
                          <td style="padding:var(--space-2) var(--space-3);text-align:center;">
                            ${r.pct !== null ? `
                              <div style="font-size:var(--text-xs);font-weight:700;color:${r.clr};margin-bottom:3px;">${r.pct.toFixed(1)}%</div>
                              <div style="height:5px;background:var(--color-surface-2);border-radius:4px;overflow:hidden;width:80px;margin:0 auto;">
                                <div style="height:5px;width:${barWidth}%;background:${r.clr};border-radius:4px;transition:width .6s;"></div>
                              </div>` : `<span style="font-size:var(--text-xs);color:var(--color-danger);font-weight:700;">Pengurang</span>`}
                          </td>
                          <td style="padding:var(--space-2) var(--space-3);text-align:right;font-size:var(--text-sm);font-weight:800;color:${r.clr};">${r.nilai >= 0 ? '+' : ''}${r.nilai.toFixed(2)}</td>
                          <td style="padding:var(--space-2) var(--space-3);text-align:center;">
                            <span style="font-size:10px;padding:2px 8px;border-radius:var(--radius-full);background:${r.clr === 'var(--color-success)' ? 'rgba(70,189,13,.15)' : r.clr === 'var(--color-warning)' ? 'rgba(251,168,6,.15)' : 'rgba(236,28,36,.15)'};color:${r.clr};font-weight:700;">${r.lbl}</span>
                          </td>
                        </tr>`;
                    });
                    rows.push(`
                      <tr style="background:var(--color-surface-2);border-top:2px solid var(--color-border);">
                        <td colspan="6" style="padding:var(--space-3) var(--space-3);font-size:var(--text-xs);font-weight:700;color:var(--color-text);">TOTAL NILAI KINERJA KM</td>
                        <td style="padding:var(--space-3) var(--space-3);text-align:right;font-size:var(--text-md);font-weight:800;color:${totalNilai>=100?'var(--color-success)':totalNilai>=90?'var(--color-warning)':'var(--color-danger)'};">${totalNilai.toFixed(2)}</td>
                        <td style="padding:var(--space-3) var(--space-3);text-align:center;">
                          <span class="status-pill ${totalNilai>=100?'completed':totalNilai>=90?'warning':'needs-revision'}">${totalNilai>=100?'Baik':totalNilai>=90?'Hati-hati':'Masalah'}</span>
                        </td>
                      </tr>`);
                    return rows.join('');
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Trajectory chart: monthly target vs realisasi -->
          <div class="two-col-grid" style="margin-bottom:var(--space-6);">
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="trending-up"></i>Proyeksi Nilai KM — Target vs Realisasi (Bulanan)</div>
                <span class="card-meta">YTD 2026 &mdash; garis putus = proyeksi akhir tahun</span>
              </div>
              <div class="chart-container"><canvas id="wf3-trajectory-chart"></canvas></div>
            </div>
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="bar-chart-2"></i>Perbandingan Capaian per Unit (UPMK I–V)</div>
                <span class="card-meta">Skor KM sementara vs target 100</span>
              </div>
              <div class="chart-container"><canvas id="wf3-unit-chart"></canvas></div>
            </div>
          </div>

          <!-- Per-unit realization breakdown -->
          <div class="card p-0" style="margin-bottom:var(--space-6);">
            <div class="card-header">
              <div class="card-title"><i data-lucide="building-2"></i>Realisasi KPI per Unit Pelaksana (UPMK I–V)</div>
              <span class="card-meta">KPI-U1 Pembangkit · KPI-U2 Transmisi · KPI-U3 GI · KPI-U4 % Konstruksi · KPI-U5 Kepatuhan Laporan</span>
            </div>
            <div class="card-body" style="padding:0;overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;min-width:700px;">
                <thead>
                  <tr style="border-bottom:1px solid var(--color-border);background:var(--color-surface-2);">
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Unit</th>
                    <th style="padding:var(--space-2) var(--space-3);text-align:right;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">MW COD</th>
                    <th style="padding:var(--space-2) var(--space-3);text-align:right;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">KMS Transmisi</th>
                    <th style="padding:var(--space-2) var(--space-3);text-align:right;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">MVA GI</th>
                    <th style="padding:var(--space-2) var(--space-3);text-align:right;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">% Konstruksi</th>
                    <th style="padding:var(--space-2) var(--space-3);text-align:center;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Laporan</th>
                    <th style="padding:var(--space-2) var(--space-3);text-align:right;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Skor KM</th>
                    <th style="padding:var(--space-2) var(--space-3);text-align:center;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${op.buComparison.rows.slice(1).map((row, i) => {
                    const skor = row.values[0];
                    const clr = skor >= 100 ? 'var(--color-success)' : skor >= 95 ? 'var(--color-warning)' : 'var(--color-danger)';
                    const lbl = skor >= 100 ? 'Baik' : skor >= 95 ? 'Hati-hati' : 'Masalah';
                    const upmkData = km.statusUPMK[i] || {};
                    const mw  = upmkData.kapasitas ? upmkData.kapasitas.mw.toLocaleString('id-ID')  : '—';
                    const kms = upmkData.kapasitas ? upmkData.kapasitas.kms.toLocaleString('id-ID') : '—';
                    const mva = upmkData.kapasitas ? upmkData.kapasitas.mva.toLocaleString('id-ID') : '—';
                    return `
                      <tr style="border-bottom:1px solid var(--color-border);transition:background .15s;" onmouseover="this.style.background='var(--color-surface-2)'" onmouseout="this.style.background=''">
                        <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);font-weight:700;color:var(--color-text);">${row.bu}</td>
                        <td style="padding:var(--space-3) var(--space-3);text-align:right;font-size:var(--text-xs);">${mw} <span style="color:var(--color-text-muted);font-size:9px;">MW</span></td>
                        <td style="padding:var(--space-3) var(--space-3);text-align:right;font-size:var(--text-xs);">${kms} <span style="color:var(--color-text-muted);font-size:9px;">KMS</span></td>
                        <td style="padding:var(--space-3) var(--space-3);text-align:right;font-size:var(--text-xs);">${mva} <span style="color:var(--color-text-muted);font-size:9px;">MVA</span></td>
                        <td style="padding:var(--space-3) var(--space-3);text-align:right;">
                          <span style="font-size:var(--text-xs);font-weight:700;color:${row.values[2]<95?'var(--color-danger)':row.values[2]<100?'var(--color-warning)':'var(--color-success)'};">${row.values[2]}%</span>
                        </td>
                        <td style="padding:var(--space-3) var(--space-3);text-align:center;">
                          <span class="status-pill ${upmkData.status === 'APPROVED' ? 'completed' : 'in-review'}" style="font-size:10px;">${upmkData.status === 'APPROVED' ? '✓ Approved' : upmkData.status || '—'}</span>
                        </td>
                        <td style="padding:var(--space-3) var(--space-3);text-align:right;font-size:var(--text-md);font-weight:800;color:${clr};">${skor.toFixed(2)}</td>
                        <td style="padding:var(--space-3) var(--space-3);text-align:center;">
                          <span style="font-size:10px;padding:2px 9px;border-radius:var(--radius-full);background:${clr==='var(--color-success)'?'rgba(70,189,13,.15)':clr==='var(--color-warning)'?'rgba(251,168,6,.15)':'rgba(236,28,36,.15)'};color:${clr};font-weight:700;">${lbl}</span>
                        </td>
                      </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- WF3 Input Modal trigger note -->
          <div style="background:var(--color-info-tint);border:1px solid var(--color-info,#03a2b8);border-radius:var(--radius-md);padding:var(--space-4);display:flex;align-items:flex-start;gap:var(--space-3);">
            <i data-lucide="info" style="width:18px;height:18px;color:var(--color-info,#03a2b8);flex-shrink:0;margin-top:2px;"></i>
            <div>
              <div style="font-size:var(--text-sm);font-weight:700;color:var(--color-text);margin-bottom:4px;">Cara Update Realisasi Bulanan</div>
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);line-height:1.7;">
                Klik tombol <strong>Input Realisasi</strong> di atas untuk membuka form isian. Setiap perubahan dicatat di Audit Trail secara otomatis.
                Deadline input: <strong>Tanggal 3 setiap bulan</strong> (FASE 1 siklus pelaporan). Data yang sudah diinput akan muncul di kolom Realisasi pada tabel di atas.
              </div>
            </div>
          </div>
          ` : ''}

          <!-- ══════════════════════════════════════════════════════
               SEKSI D — SLA & Alur Persetujuan per Peran
               ══════════════════════════════════════════════════════ -->
          <div class="card" style="margin-bottom:var(--space-6);">
            <div class="card-header" style="cursor:pointer;" onclick="(function(btn){const body=btn.closest('.card').querySelectorAll('.km-sla-collapsible');const isHidden=body[0].hidden;body.forEach(el=>el.hidden=!isHidden);btn.querySelector('.km-sla-chevron').style.transform=isHidden?'rotate(0deg)':'rotate(-90deg)';})(this)">
              <div class="card-title"><i data-lucide="clock-8"></i>SLA &amp; Alur Persetujuan per Peran</div>
              <span class="card-meta" style="display:flex;align-items:center;gap:var(--space-3);">5 fase — deadline wajib: <strong style="color:var(--color-danger);">Tanggal 6 setiap bulan</strong><i data-lucide="chevron-right" class="km-sla-chevron" style="width:16px;height:16px;color:var(--color-text-muted);transition:transform .2s;flex-shrink:0;"></i></span>
            </div>
            <div class="card-body km-sla-collapsible" style="padding:var(--space-4) var(--space-4) 0;" hidden>
              <!-- Mini timeline bar -->
              <div style="display:flex;align-items:center;gap:0;margin-bottom:var(--space-5);overflow-x:auto;padding-bottom:4px;">
                ${(() => {
                  const clr = ['var(--color-accent)','var(--color-info,#3b82f6)','var(--color-warning)','var(--color-success)','var(--color-text-muted)'];
                  return a.workflow.map((w,i) => `
                    <div style="display:flex;align-items:center;flex:1;min-width:0;">
                      <div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:90px;">
                        <div style="width:34px;height:34px;border-radius:50%;background:${clr[i]};color:#000;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.3);">${w.stage}</div>
                        <div style="font-size:10px;font-weight:700;color:${clr[i]};margin-top:5px;text-align:center;white-space:nowrap;">${w.fase}</div>
                        <div style="font-size:10px;color:var(--color-text-muted);text-align:center;">${w.deadline}</div>
                      </div>
                      ${i < a.workflow.length-1 ? `<div style="flex:1;height:2px;background:linear-gradient(to right,${clr[i]},${clr[i+1]});min-width:16px;"></div>` : ''}
                    </div>`).join('');
                })()}
              </div>
            </div>
            <!-- SLA Detail Table -->
            <div class="km-sla-collapsible" style="overflow-x:auto;" hidden>
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr style="background:var(--color-surface-sunken);border-bottom:1px solid var(--color-border);">
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-2xs);color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;">Fase</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-2xs);color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Peran</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-2xs);color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">PIC</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:center;font-size:var(--text-2xs);color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;">Deadline</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:center;font-size:var(--text-2xs);color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">SLA</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-2xs);color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Kegiatan &amp; Checklist</th>
                  </tr>
                </thead>
                <tbody>
                  ${(() => {
                    const clr = ['var(--color-accent)','var(--color-info,#3b82f6)','var(--color-warning)','var(--color-success)','var(--color-text-muted)'];
                    const roleLbl = { staff:'Staff Officer', asman:'Asisten Manajer', manajer:'Manajer Bidang', srmanajer:'Senior Manajer', gm:'General Manager' };
                    return a.workflow.map((w,i) => `
                      <tr style="border-bottom:1px solid var(--color-border);vertical-align:top;">
                        <td style="padding:var(--space-3) var(--space-4);white-space:nowrap;">
                          <div style="display:flex;align-items:center;gap:var(--space-2);">
                            <div style="width:26px;height:26px;border-radius:50%;background:${clr[i]};color:#000;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;flex-shrink:0;">${w.stage}</div>
                            <span style="font-size:10px;font-weight:700;color:${clr[i]};">${w.fase}</span>
                          </div>
                        </td>
                        <td style="padding:var(--space-3) var(--space-4);">
                          <div style="display:flex;align-items:center;gap:6px;">
                            <i data-lucide="${w.icon}" style="width:14px;height:14px;color:${clr[i]};flex-shrink:0;"></i>
                            <span style="font-size:var(--text-xs);font-weight:600;color:var(--color-text);">${roleLbl[w.role] || w.role}</span>
                          </div>
                        </td>
                        <td style="padding:var(--space-3) var(--space-4);font-size:10px;color:var(--color-text-muted);max-width:180px;">${w.pic}</td>
                        <td style="padding:var(--space-3) var(--space-4);text-align:center;">
                          <span style="font-size:var(--text-xs);font-weight:700;color:var(--color-text);background:var(--color-surface-2);padding:3px 10px;border-radius:var(--radius-full);white-space:nowrap;">${w.deadline}</span>
                        </td>
                        <td style="padding:var(--space-3) var(--space-4);text-align:center;">
                          <span style="font-size:var(--text-xs);font-weight:700;color:${clr[i]};">${w.slaHours}j</span>
                        </td>
                        <td style="padding:var(--space-3) var(--space-4);">
                          <div style="font-size:var(--text-xs);font-weight:600;color:var(--color-text);margin-bottom:var(--space-2);">${w.action}</div>
                          <ul style="margin:0;padding-left:var(--space-4);list-style:disc;">
                            ${w.checklist.map(c => `<li style="font-size:10px;color:var(--color-text-muted);margin-bottom:2px;">${c}</li>`).join('')}
                          </ul>
                        </td>
                      </tr>`).join('');
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════
               SEKSI E — Matriks RACI
               ══════════════════════════════════════════════════════ -->
          <div class="card" style="margin-bottom:var(--space-6);">
            <div class="card-header">
              <div class="card-title"><i data-lucide="users-round"></i>Matriks RACI — Peran &amp; Tanggung Jawab</div>
              <span class="card-meta" style="display:flex;gap:var(--space-3);align-items:center;">
                <span style="font-size:10px;font-weight:700;color:var(--color-success);">R = Responsible</span>
                <span style="font-size:10px;font-weight:700;color:var(--color-accent);">A = Accountable</span>
                <span style="font-size:10px;font-weight:700;color:var(--color-warning);">C = Consulted</span>
                <span style="font-size:10px;color:var(--color-text-muted);">I = Informed</span>
              </span>
            </div>
            <div class="card-body" style="padding:0;overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr style="background:var(--color-surface-sunken);border-bottom:1px solid var(--color-border);">
                    <th style="padding:var(--space-3) var(--space-4);text-align:left;font-size:var(--text-2xs);color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;min-width:200px;">Fungsi / Aktivitas KM</th>
                    <th style="padding:var(--space-3) var(--space-4);text-align:left;font-size:var(--text-2xs);color:var(--color-success);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">R — Responsible</th>
                    <th style="padding:var(--space-3) var(--space-4);text-align:left;font-size:var(--text-2xs);color:var(--color-accent);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">A — Accountable</th>
                    <th style="padding:var(--space-3) var(--space-4);text-align:left;font-size:var(--text-2xs);color:var(--color-warning);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">C — Consulted</th>
                    <th style="padding:var(--space-3) var(--space-4);text-align:left;font-size:var(--text-2xs);color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">I — Informed</th>
                  </tr>
                </thead>
                <tbody>
                  ${a.raci.map((row, idx) => `
                    <tr style="border-bottom:1px solid var(--color-border);background:${idx%2===0?'':'var(--color-surface-sunken)'};transition:background .15s;" onmouseover="this.style.background='var(--color-surface-2)'" onmouseout="this.style.background='${idx%2===0?'':'var(--color-surface-sunken)'}'">
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);font-weight:600;color:var(--color-text);">${row.fungsi}</td>
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);font-weight:600;color:var(--color-success);">${row.r || '<span style="color:var(--color-border);">—</span>'}</td>
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);font-weight:600;color:var(--color-accent);">${row.a || '<span style="color:var(--color-border);">—</span>'}</td>
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);color:var(--color-warning);">${row.c || '<span style="color:var(--color-border);">—</span>'}</td>
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);color:var(--color-text-muted);">${row.i || '<span style="color:var(--color-border);">—</span>'}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════
               SEKSI F — Detail Laporan Kinerja
               ══════════════════════════════════════════════════════ -->
          <div style="margin-bottom:var(--space-2);">
            <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-4);">
              <i data-lucide="file-bar-chart" style="width:18px;height:18px;color:var(--color-accent);"></i>
              <h3 style="font-size:var(--text-base);font-weight:700;color:var(--color-text);margin:0;">Detail Laporan Kinerja Manajemen</h3>
              <span style="font-size:10px;background:var(--color-surface-2);padding:2px 8px;border-radius:var(--radius-full);color:var(--color-text-muted);">${a.reports.length} laporan</span>
            </div>
          </div>

          <!-- Laporan list + KPI/PI matrix -->
          <div class="two-col-grid" style="align-items:start;margin-bottom:var(--space-6);">

            <!-- Kiri: Daftar Laporan KM -->
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="file-text"></i>Semua Laporan KM</div>
                <span class="card-meta">${a.reports.length} laporan terdaftar</span>
              </div>
              <div class="card-body" style="padding:0;">
                ${(() => {
                  const stagePill = { 1:'var(--color-accent)', 2:'var(--color-info,#3b82f6)', 3:'var(--color-warning)', 4:'var(--color-success)', 5:'var(--color-text-muted)' };
                  const stageIcon = { 1:'database', 2:'calculator', 3:'clipboard-check', 4:'pen-line', 5:'send' };
                  const statusCfg = { approved:{ cls:'completed', lbl:'Disetujui' }, in_review:{ cls:'in-review', lbl:'Sedang Review' }, needs_revision:{ cls:'needs-revision', lbl:'Perlu Revisi' }, draft:{ cls:'draft', lbl:'Draft' } };
                  return a.reports.map(r => {
                    const sc = statusCfg[r.status] || { cls:'draft', lbl:r.status };
                    const lastAudit = r.auditTrail[r.auditTrail.length-1];
                    return `
                    <div style="padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--color-border);">
                      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-2);margin-bottom:var(--space-2);">
                        <div style="min-width:0;">
                          <div style="display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;margin-bottom:2px;">
                            <code style="font-size:10px;color:var(--color-accent);">${r.id}</code>
                            <span class="status-pill ${sc.cls}" style="font-size:10px;padding:1px 7px;">${sc.lbl}</span>
                          </div>
                          <div style="font-size:var(--text-xs);font-weight:600;color:var(--color-text);">${r.unit} &mdash; ${r.period}</div>
                        </div>
                        <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                          ${[1,2,3,4,5].map(s => `<div style="width:8px;height:8px;border-radius:50%;background:${s <= r.currentStage ? stagePill[s] : 'var(--color-border)'};"></div>`).join('')}
                        </div>
                      </div>
                      <div style="display:flex;align-items:center;gap:var(--space-3);">
                        <div style="display:flex;align-items:center;gap:4px;">
                          <i data-lucide="${stageIcon[r.currentStage] || 'circle'}" style="width:12px;height:12px;color:${stagePill[r.currentStage] || 'var(--color-text-muted)'};"></i>
                          <span style="font-size:10px;color:var(--color-text-muted);">Stage ${r.currentStage}/5</span>
                        </div>
                        ${r.nextApprover ? `<span style="font-size:10px;color:var(--color-text-muted);">→ ${r.nextApprover.name}</span>` : ''}
                      </div>
                      ${lastAudit ? `<div style="margin-top:var(--space-2);padding:var(--space-2) var(--space-3);background:var(--color-surface-sunken);border-radius:var(--radius-sm);border-left:2px solid ${stagePill[lastAudit.stage] || 'var(--color-border)'};">
                        <div style="font-size:10px;color:var(--color-text-muted);margin-bottom:1px;">${lastAudit.actor} &bull; ${lastAudit.timestamp.substring(0,10)}</div>
                        <div style="font-size:10px;color:var(--color-text);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${lastAudit.comment}</div>
                      </div>` : ''}
                    </div>`;
                  }).join('');
                })()}
              </div>
            </div>

            <!-- Kanan: Matriks KPI/PI 14 Indikator -->
            <div class="card">
              <div class="card-header">
                <div class="card-title"><i data-lucide="table-2"></i>Matriks KPI/PI — 14 Indikator RKM 2026</div>
                <span class="card-meta">Total bobot: KPI 40 &bull; PI 60</span>
              </div>
              <div class="card-body" style="padding:0;overflow-x:auto;">
                <div id="km-kpi-pi-container"></div>
              </div>
            </div>

          </div>

          <!-- Kepatuhan (Pengurang) -->
          <div class="card" style="margin-bottom:var(--space-6);">
            <div class="card-header">
              <div class="card-title"><i data-lucide="shield-minus"></i>Komponen Kepatuhan &amp; Pengurang</div>
              <span class="card-meta">PI #14 — Pengurang max −30 total</span>
            </div>
            <div class="card-body" style="padding:0;overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr style="background:var(--color-surface-sunken);border-bottom:1px solid var(--color-border);">
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-2xs);color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">No</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-2xs);color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Komponen Kepatuhan</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:center;font-size:var(--text-2xs);color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Max Pengurang</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:center;font-size:var(--text-2xs);color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Applied</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-2xs);color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Target</th>
                    <th style="padding:var(--space-2) var(--space-4);text-align:center;font-size:var(--text-2xs);color:var(--color-text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${op.kepatuhan ? op.kepatuhan.map(k => `
                    <tr style="border-bottom:1px solid var(--color-border);transition:background .15s;" onmouseover="this.style.background='var(--color-surface-2)'" onmouseout="this.style.background=''">
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);font-weight:700;color:var(--color-accent);">${k.no}</td>
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);font-weight:600;color:var(--color-text);">${k.name}</td>
                      <td style="padding:var(--space-3) var(--space-4);text-align:center;font-size:var(--text-xs);font-weight:700;color:var(--color-danger);">${k.maxPenalty}</td>
                      <td style="padding:var(--space-3) var(--space-4);text-align:center;font-size:var(--text-xs);font-weight:700;color:${k.applied < 0 ? 'var(--color-danger)' : 'var(--color-success)'};">${k.applied === 0 ? '—' : k.applied}</td>
                      <td style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);color:var(--color-text-muted);">${k.target}</td>
                      <td style="padding:var(--space-3) var(--space-4);text-align:center;">
                        <span class="status-pill ${k.status === 'success' ? 'completed' : 'needs-revision'}" style="font-size:10px;padding:2px 8px;">${k.status === 'success' ? 'Aman' : 'Perhatian'}</span>
                      </td>
                    </tr>`).join('') : '<tr><td colspan="6" style="padding:var(--space-4);text-align:center;color:var(--color-text-muted);font-size:var(--text-xs);">Data kepatuhan tidak tersedia</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
        `;
      },
      'workflow-km-usulan':    () => PAGE_PREVIEW['workflow-km']('usulan'),
      'workflow-km-realisasi': () => PAGE_PREVIEW['workflow-km']('realisasi'),
    };

    // =========================================================
    // PAGE INIT ? Executive Summary (Fase 5)
    // =========================================================
    const UNIT_NAMES = { KP:'Kantor Induk', UPMK1:'UPMK I', UPMK2:'UPMK II', UPMK3:'UPMK III', UPMK4:'UPMK IV', UPMK5:'UPMK V' };

    // === KPI Master-Detail (Executive Summary) ===
    let __activeKpiId = null;

    const __formulaFor = (kpi) => {
      if (kpi.basis === 'akumulatif') {
        return `Akumulasi realisasi ${kpi.unit} YTD ÷ Target Tahunan (${kpi.target} ${kpi.unit}) × 100`;
      }
      if (kpi.polaritas === 'LB') {
        return `Target (${kpi.target} ${kpi.unit}) ÷ Realisasi (${kpi.actual} ${kpi.unit}) × Bobot (${kpi.bobot}) — lower is better`;
      }
      return `Realisasi (${kpi.actual} ${kpi.unit}) ÷ Target (${kpi.target} ${kpi.unit}) × Bobot (${kpi.bobot})`;
    };

    const __statusFor = (kpi) => {
      // Map kpi.status to pill class
      const s = (kpi.status || '').toLowerCase();
      if (s === 'success') return { cls: 'completed', label: 'Tercapai' };
      if (s === 'warning') return { cls: 'warning',   label: 'Perhatian' };
      if (s === 'danger')  return { cls: 'danger',    label: 'Bahaya' };
      return { cls: 'info', label: kpi.status || 'Info' };
    };

    const __polaritasLabel = (p) => p === 'HB' ? 'Positif (higher is better)' : p === 'LB' ? 'Negatif (lower is better)' : (p || '—');
    const __polaritasShort = (p) => p === 'HB' ? 'Positif' : p === 'LB' ? 'Negatif' : (p || '—');
    const __polaritasIcon  = (p) => p === 'HB' ? 'arrow-up-right' : p === 'LB' ? 'arrow-down-right' : 'minus';

    const renderKpiDetailBody = (kpi, prefix = 'exec') => {
      const st = __statusFor(kpi);
      const formula = kpi.formula || __formulaFor(kpi);
      const polLabel = __polaritasLabel(kpi.polaritas);
      const polIcon = __polaritasIcon(kpi.polaritas);
      const period = DATA.meta.period || 'Bulan Ini';
      const rootCause = kpi.rootCause && kpi.rootCause.trim() ? kpi.rootCause : '—';
      const actionPlan = kpi.actionPlan && kpi.actionPlan.trim() ? kpi.actionPlan : '—';
      const achievement = (typeof kpi.achievement === 'number') ? kpi.achievement : 0;
      return `
        <div class="kpi-md-detail-header">
          <div>
            <div class="kpi-md-detail-title">${kpi.no ? kpi.no + '. ' : ''}${kpi.name}</div>
            <div class="kpi-md-detail-cat">${kpi.category || ''} &middot; ${kpi.bu || ''} &middot; Basis: ${kpi.basis || 'bulanan'}</div>
          </div>
          <span class="status-pill ${st.cls}">${st.label}</span>
        </div>
        <div class="kpi-md-grid">
          <div>
            <div class="kpi-md-cell-label">Target</div>
            <div class="kpi-md-cell-value">${formatNumber(kpi.target, kpi.target % 1 ? 2 : 0)} ${kpi.unit}</div>
            <div class="kpi-md-gauge-wrap"><canvas id="${prefix}-kpi-gauge"></canvas></div>
          </div>
          <div>
            <div class="kpi-md-cell-label">Realisasi ${period}</div>
            <div class="kpi-md-cell-value">${formatNumber(kpi.actual, kpi.actual % 1 ? 2 : 0)} ${kpi.unit} <span style="font-size:var(--text-sm);color:var(--color-text-muted);font-weight:500;">(${formatNumber(achievement, 1)}%)</span></div>
            <div class="kpi-md-trend-wrap"><canvas id="${prefix}-kpi-trend"></canvas></div>
            <div class="kpi-md-cell-label" style="margin-top:6px;">Tren Realisasi 12 Bulan</div>
          </div>
          <div>
            <div class="kpi-md-meta-row">
              <span><span class="label">Polaritas</span>
                <span class="value"><i data-lucide="${polIcon}" style="width:14px;height:14px;vertical-align:-2px;"></i> ${polLabel}</span>
              </span>
            </div>
            <div class="kpi-md-meta-row">
              <span><span class="label">Bobot</span><span class="value">${formatNumber(kpi.bobot, 0)}%</span></span>
              <span><span class="label">Nilai</span><span class="value">${formatNumber(kpi.nilai, 2)}</span></span>
            </div>
          </div>
          <div>
            <div class="kpi-md-cell-label">Root Cause</div>
            <div class="kpi-md-text-block ${kpi.rootCause && kpi.rootCause.trim() ? '' : 'empty'}">${rootCause}</div>
          </div>
          <div>
            <div class="kpi-md-cell-label">Formula</div>
            <div class="kpi-md-text-block">${formula}</div>
          </div>
          <div>
            <div class="kpi-md-cell-label">Action Plan</div>
            <div class="kpi-md-text-block ${kpi.actionPlan && kpi.actionPlan.trim() ? '' : 'empty'}">${actionPlan}</div>
          </div>
        </div>
        <div class="kpi-md-actions">
          <button class="btn btn-primary btn-sm" onclick="window.__openKpiDeepDive('${kpi.id}')">
            <i data-lucide="microscope"></i>
            <span>Buka Sub-Dashboard &mdash; Root Cause Analysis</span>
            <i data-lucide="arrow-right"></i>
          </button>
          <span class="kpi-md-actions-hint">Drill down into measurement detail, contributing issues, and mitigation plan</span>
        </div>
      `;
    };

    const __renderDetailCharts = (kpi, prefix = 'exec') => {
      const t = chartTheme();
      // Gauge for target (use achievement percent capped at 130 for headroom)
      const gaugeEl = document.getElementById(`${prefix}-kpi-gauge`);
      if (gaugeEl) {
        const pct = Math.min(Math.max(kpi.achievement || 0, 0), 150);
        ChartFactory.gauge(gaugeEl, pct, { max: 150, target: 100 });
      }
      // Trend line from sparkline
      const trendEl = document.getElementById(`${prefix}-kpi-trend`);
      if (trendEl && kpi.sparkline && kpi.sparkline.length) {
        ChartFactory.sparkline(trendEl, kpi.sparkline);
      }
    };

    const renderKpiMasterDetail = () => {
      const kpis = DATA.operational.kpis;
      if (!kpis || !kpis.length) return;
      const listEl = document.getElementById('exec-kpi-list');
      const detailEl = document.getElementById('exec-kpi-detail');
      if (!listEl || !detailEl) return;

      // Default active = first KPI (or previously selected)
      if (!__activeKpiId || !kpis.find(k => k.id === __activeKpiId)) {
        __activeKpiId = kpis[0].id;
      }

      // Render list
      listEl.innerHTML = kpis.map(k => {
        const st = (k.status || 'info').toLowerCase();
        return `
          <div class="kpi-md-item ${k.id === __activeKpiId ? 'active' : ''}" data-kpi-id="${k.id}">
            <div class="kpi-md-item-no">${k.no || ''}</div>
            <div class="kpi-md-item-body">
              <div class="kpi-md-item-name">${k.name}</div>
              <div class="kpi-md-item-meta">${k.category || ''} &middot; ${formatNumber(k.actual, k.actual % 1 ? 2 : 0)} / ${formatNumber(k.target, k.target % 1 ? 2 : 0)} ${k.unit}</div>
            </div>
            <div class="kpi-md-item-dot ${st}" title="${k.status}"></div>
          </div>
        `;
      }).join('');

      // Render detail panel
      const active = kpis.find(k => k.id === __activeKpiId);
      detailEl.innerHTML = renderKpiDetailBody(active, 'exec');
      if (window.lucide) window.lucide.createIcons();
      __renderDetailCharts(active, 'exec');

      // Wire click handlers
      listEl.querySelectorAll('.kpi-md-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.getAttribute('data-kpi-id');
          if (id === __activeKpiId) return;
          __activeKpiId = id;
          // Update active class
          listEl.querySelectorAll('.kpi-md-item').forEach(el => {
            el.classList.toggle('active', el.getAttribute('data-kpi-id') === id);
          });
          const k = kpis.find(x => x.id === id);
          if (!k) return;
          // Destroy old charts
          const oldGauge = chartRegistry.get('exec-kpi-gauge');
          if (oldGauge) { oldGauge.destroy(); chartRegistry.delete('exec-kpi-gauge'); }
          const oldTrend = chartRegistry.get('exec-kpi-trend');
          if (oldTrend) { oldTrend.destroy(); chartRegistry.delete('exec-kpi-trend'); }
          detailEl.innerHTML = renderKpiDetailBody(k, 'exec');
          if (window.lucide) window.lucide.createIcons();
          __renderDetailCharts(k, 'exec');
        });
      });
    };

    // Modal popup for full KPI detail (task #4)
    window.__openKpiModal = (kpiId) => {
      const kpi = DATA.operational.kpis.find(k => k.id === kpiId);
      if (!kpi) return;
      const titleEl = document.getElementById('kpi-modal-title');
      const bodyEl = document.getElementById('kpi-modal-body');
      if (titleEl) titleEl.textContent = `KPI ${kpi.no || ''} — ${kpi.name}`;
      if (bodyEl) {
        // Destroy any prior modal charts
        const oldGauge = chartRegistry.get('modal-kpi-gauge');
        if (oldGauge) { oldGauge.destroy(); chartRegistry.delete('modal-kpi-gauge'); }
        const oldTrend = chartRegistry.get('modal-kpi-trend');
        if (oldTrend) { oldTrend.destroy(); chartRegistry.delete('modal-kpi-trend'); }
        bodyEl.innerHTML = renderKpiDetailBody(kpi, 'modal');
      }
      openModal('kpi-detail-modal');
      if (window.lucide) window.lucide.createIcons();
      // Defer chart init so canvas dimensions are correct
      setTimeout(() => __renderDetailCharts(kpi, 'modal'), 50);
    };

    const initExecutiveSummary = () => {
      const ex = DATA.executive;
      const t = chartTheme();

      // Hero gauge ? Total Nilai Kinerja 103,87 (max scaled ~130 for visual headroom)
      const gaugeEl = document.getElementById('exec-gauge');
      if (gaugeEl) ChartFactory.gauge(gaugeEl, ex.healthScore.value, { max: 130, target: 100 });

      // Animate hero number
      document.querySelectorAll('.hero-health-value[data-target]').forEach(el => Components.animateNumber(el, { duration: 1500 }));

      // KPI Master-Detail (14 KPI dari DATA.operational.kpis)
      renderKpiMasterDetail();

      // Trend chart — switchable between Agregat / per-UPMK / Compare All
      const trendEl = document.getElementById('exec-trend-chart');
      if (trendEl) {
        const target = Array(12).fill(100);
        const labels = DATA.meta.monthsTrailing12;
        const ut = ex.unitTrend;
        // Color palette for per-unit lines
        const unitColors = {
          KP:    t.accent,
          UPMK1: '#8b5cf6',
          UPMK2: '#06b6d4',
          UPMK3: '#f59e0b',
          UPMK4: '#ef4444',
          UPMK5: '#10b981',
        };
        const buildTrendChart = (unitCode) => {
          // Destroy old chart if any
          const existing = chartRegistry.get('exec-trend-chart');
          if (existing) { existing.destroy(); chartRegistry.delete('exec-trend-chart'); }
          // Update meta label
          const metaEl = document.getElementById('exec-trend-meta');
          let datasets = [];
          if (unitCode === 'COMPARE') {
            if (metaEl) metaEl.textContent = '12 bulan terakhir — Perbandingan seluruh unit';
            Object.keys(ut).forEach(code => {
              datasets.push({
                label: UNIT_NAMES[code],
                data: ut[code],
                borderColor: unitColors[code],
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
              });
            });
            datasets.push({ label: 'Target (100)', data: target, borderColor: t.warning, backgroundColor: 'transparent', borderDash: [5,5], borderWidth: 1.5, pointRadius: 0 });
          } else {
            const unitName = UNIT_NAMES[unitCode] || unitCode;
            const score = ut[unitCode] ? ut[unitCode][ut[unitCode].length - 1] : '—';
            if (metaEl) metaEl.textContent = '12 bulan terakhir — ' + unitName + ' (skor: ' + score + ')';
            datasets = [
              { label: unitName, data: ut[unitCode] || [], borderColor: unitColors[unitCode] || t.accent, backgroundColor: withAlpha(unitColors[unitCode] || t.accent, 0.18), fill: true, borderWidth: 2.5 },
              { label: 'Target (100)', data: target, borderColor: t.warning, backgroundColor: 'transparent', borderDash: [5,5], borderWidth: 1.5, pointRadius: 0 },
            ];
          }
          ChartFactory.line(trendEl, datasets, { labels });
        };
        // Initial render
        buildTrendChart('KP');
        // Wire up switch handler
        window.__execSwitchTrend = (unitCode, btn) => {
          document.querySelectorAll('.exec-trend-btn').forEach(b => {
            b.className = b === btn ? 'btn btn-secondary btn-sm exec-trend-btn active' : 'btn btn-ghost btn-sm exec-trend-btn';
          });
          buildTrendChart(unitCode);
        };
      }

      // Unit ranking horizontal bar
      const rankEl = document.getElementById('exec-ranking-chart');
      if (rankEl) {
        const sorted = [...ex.unitRanking].sort((a, b) => b.score - a.score);
        ChartFactory.horizontalBar(rankEl, [{
          label: 'Total Nilai Kinerja',
          data: sorted.map(u => u.score),
          backgroundColor: sorted.map(u => u.score >= 100 ? t.success : t.warning),
          borderRadius: 4,
        }], {
          labels: sorted.map(u => UNIT_NAMES[u.code]),
          hideLegend: true,
        });
      }

      // Strategic Initiatives sortable table
      const tableContainer = document.getElementById('exec-initiatives-table');
      if (tableContainer) {
        const kpiById = Object.fromEntries((DATA.operational.kpis || []).map(k => [k.id, k]));
        const cols = [
          { key: 'name',     label: 'Inisiatif',  numeric: false },
          { key: 'kpiId',    label: 'KPI Dasar',  numeric: false, render: r => {
              const k = kpiById[r.kpiId];
              if (!k) return '<span style="color:var(--color-text-subtle);">—</span>';
              const code = `${k.category || 'KPI'} ${k.no || ''}`.trim();
              return `<div style="display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap;min-width:220px;">
                <span class="status-pill" style="background:var(--color-accent-tint);color:var(--color-brand);font-weight:700;flex-shrink:0;">${code}</span>
                <span style="font-size:var(--text-xs);color:var(--color-text-muted);line-height:1.4;word-break:normal;overflow-wrap:break-word;">${k.name}</span>
              </div>`;
          } },
          { key: 'owner',    label: 'Owner',      numeric: false },
          { key: 'status',   label: 'Status',     numeric: false, render: r => `<span class="status-pill ${r.status}">${STATUS_LABEL[r.status] || r.status}</span>` },
          { key: 'progress', label: 'Progress',   numeric: true,  render: r => {
              const cls = r.status === 'completed' ? 'success' : r.status === 'at-risk' ? 'warning' : r.status === 'delayed' ? 'danger' : '';
              return `${r.progress}%<div class="progress-mini"><div class="progress-mini-fill ${cls}" style="width:${r.progress}%"></div></div>`;
          } },
          { key: 'dueDate',  label: 'Due',        numeric: false, render: r => formatDate(r.dueDate, 'short') },
        ];
        tableContainer.innerHTML = SortableTable.render({ id: 'exec-init-table', columns: cols });
        SortableTable.init('exec-init-table', { columns: cols, rows: ex.initiatives });
      }

      // Set alert-list-title text content safely & wire deep-link navigation
      document.querySelectorAll('.alert-list-item').forEach((item, i) => {
        const title = item.querySelector('.alert-list-title');
        if (title && ex.alerts[i]) title.textContent = ex.alerts[i].title;
        item.addEventListener('click', () => {
          const alert = ex.alerts[i];
          if (!alert || !alert.route) return;
          // Navigate to the target page
          window.location.hash = '#' + alert.route;
          // After page renders, execute deep-link action
          if (alert.action && alert.targetId) {
            const execAction = () => {
              if (alert.action === 'openKpi' && typeof openKpiDetail === 'function') {
                openKpiDetail(alert.targetId);
              } else if (alert.action === 'scrollTo') {
                const el = document.getElementById(alert.targetId);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  // Brief highlight flash
                  el.style.transition = 'box-shadow .3s';
                  el.style.boxShadow = '0 0 0 3px var(--color-accent)';
                  setTimeout(() => { el.style.boxShadow = ''; }, 2000);
                }
              }
            };
            // Wait for page init to complete (DOM render + chart init)
            setTimeout(execAction, 400);
          }
        });
      });

      if (window.lucide) window.lucide.createIcons();
    };

    // =========================================================
    // PAGE INIT ? Cost & Capex Performance (Fase 6)
    // =========================================================
    const initFinancial = () => {
      const f = DATA.financial;
      const t = chartTheme();

      // 5 KPI strip cards
      const kpiContainer = document.getElementById('fin-kpi-cards');
      if (kpiContainer) {
        const cards = f.kpiStrip.map(k => ({
          id: k.id,
          label: k.label,
          value: typeof k.value === 'number' && k.value > 1e6 ? k.value / 1e9 : k.value,
          formatted: k.formatted || formatRupiah(k.value, { decimals: 2 }),
          delta: k.vsTarget,
          deltaUnit: 'pp',
          icon: k.icon,
          isInverse: k.isInverse,
        }));
        kpiContainer.innerHTML = Components.kpiGrid(cards);
        Components.initKpiCards(cards, kpiContainer);
      }

      // OPEX Trend (3 series: actual, budget, prior year)
      const trendEl = document.getElementById('fin-opex-trend');
      if (trendEl) ChartFactory.line(trendEl, [
        {
          label: 'Actual',
          data: f.revenueTrend.actual,
          borderColor: t.palette[0],
          backgroundColor: withAlpha(t.palette[0], 0.18),
          fill: true,
          borderWidth: 2.5,
        },
        {
          label: 'Budget RKAP',
          data: f.revenueTrend.budget,
          borderColor: t.palette[1],
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          borderWidth: 1.8,
        },
        {
          label: 'Prior Year',
          data: f.revenueTrend.priorYear,
          borderColor: t.palette[2],
          backgroundColor: 'transparent',
          borderWidth: 1.5,
        },
      ], { labels: DATA.meta.monthsTrailing12 });

      // Cost Structure Donut
      const donutEl = document.getElementById('fin-cost-donut');
      if (donutEl) ChartFactory.donut(
        donutEl,
        f.costStructure.map(c => c.value),
        f.costStructure.map(c => c.name),
        { legendPosition: 'right' }
      );

      // Cash Flow Bar (3 categories with mixed signs)
      const cashEl = document.getElementById('fin-cash-bar');
      if (cashEl) ChartFactory.bar(cashEl, [{
        label: 'Cash Flow (Rp Miliar)',
        data: [f.cashFlow.operating, f.cashFlow.investing, f.cashFlow.financing],
        backgroundColor: [
          f.cashFlow.operating >= 0 ? t.success : t.danger,
          f.cashFlow.investing >= 0 ? t.success : t.danger,
          f.cashFlow.financing >= 0 ? t.success : t.danger,
        ],
        borderRadius: 4,
      }], {
        labels: ['Operating', 'Investing', 'Financing'],
        hideLegend: true,
      });

      // Investasi per Unit ? horizontal bar (target + realisasi grouped)
      const invEl = document.getElementById('fin-investasi-bar');
      if (invEl) ChartFactory.horizontalBar(invEl, [
        {
          label: 'Target AKI',
          data: f.investasiPerUnit.map(u => u.target),
          backgroundColor: withAlpha(t.border, 0.6),
          borderRadius: 3,
        },
        {
          label: 'Realisasi',
          data: f.investasiPerUnit.map(u => u.realisasi),
          backgroundColor: f.investasiPerUnit.map(u => u.percent >= 95 ? t.success : u.percent >= 90 ? t.warning : t.danger),
          borderRadius: 3,
        },
      ], { labels: f.investasiPerUnit.map(u => u.name) });

      // Variance Table
      const varCols = [
        { key: 'item',        label: 'Item Anggaran', numeric: false },
        { key: 'budget',      label: 'Budget',        numeric: true,  render: r => formatNumber(r.budget) },
        { key: 'actual',      label: 'Actual',        numeric: true,  render: r => formatNumber(r.actual) },
        {
          key: 'variance', label: 'Variance Rp', numeric: true,
          render: r => {
            const v = r.actual - r.budget;
            const isExpense = r.actual < 0;
            const good = isExpense ? v < 0 : v > 0;
            return `<span class="delta-${good ? 'positive' : 'negative'}">${v > 0 ? '+' : ''}${formatNumber(v)}</span>`;
          },
        },
        {
          key: 'variancePct', label: 'Variance %', numeric: true,
          render: r => {
            const v = r.actual - r.budget;
            const pct = r.budget !== 0 ? (v / Math.abs(r.budget)) * 100 : 0;
            const isExpense = r.actual < 0;
            const good = isExpense ? v < 0 : v > 0;
            return `<span class="delta-${good ? 'positive' : 'negative'}">${pct > 0 ? '+' : ''}${formatNumber(pct, 1)}%</span>`;
          },
        },
      ];
      const varContainer = document.getElementById('fin-variance-table');
      if (varContainer) {
        varContainer.innerHTML = SortableTable.render({ id: 'fin-var-table', columns: varCols });
        SortableTable.init('fin-var-table', { columns: varCols, rows: f.pnl });
      }

      // EVM Table
      const evmCols = [
        { key: 'unit',  label: 'Unit',          numeric: false, render: r => UNIT_NAMES[r.code] },
        { key: 'spi',   label: 'SPI (Schedule)',numeric: true,  render: r => `<span class="delta-${r.spi >= 1 ? 'positive' : 'negative'}">${r.spi.toFixed(2)}</span>` },
        { key: 'cpi',   label: 'CPI (Cost)',    numeric: true,  render: r => `<span class="delta-${r.cpi >= 1 ? 'positive' : 'negative'}">${r.cpi.toFixed(2)}</span>` },
        { key: 'status',label: 'Status',        numeric: false, render: r => `<span class="status-pill ${r.status}">${STATUS_LABEL[r.status] || r.status}</span>` },
        {
          key: 'interp', label: 'Interpretasi', numeric: false,
          render: r => {
            const text = r.spi >= 1 && r.cpi >= 1 ? 'Ahead of plan, under budget' :
                         r.spi >= 1 && r.cpi <  1 ? 'Ahead schedule, over budget' :
                         r.spi <  1 && r.cpi >= 1 ? 'Behind schedule, under budget' :
                                                    'Behind schedule, over budget';
            return `<span style="font-size:var(--text-xs); color:var(--color-text-muted);">${text}</span>`;
          },
        },
      ];
      const evmContainer = document.getElementById('fin-evm-table');
      if (evmContainer) {
        evmContainer.innerHTML = SortableTable.render({ id: 'fin-evm-table-inner', columns: evmCols });
        SortableTable.init('fin-evm-table-inner', { columns: evmCols, rows: f.evm });
      }

      if (window.lucide) window.lucide.createIcons();
    };

    // =========================================================
    // PAGE INIT ? Operational KPIs (Fase 7)
    // =========================================================
    const initOperational = () => {
      const o = DATA.operational;

      // ── Akumulatif Progress Strip ──────────────────────────────────────
      const akumulatifStrip = document.getElementById('ops-akumulatif-strip');
      if (akumulatifStrip) {
        const akumKPIs = o.kpis.filter(k => k.basis === 'akumulatif');
        akumulatifStrip.innerHTML = akumKPIs.map(k => {
          const pct = Math.min((k.actual / k.target) * 100, 110);
          const barColor = k.status === 'danger' ? 'var(--color-danger)' : k.status === 'warning' ? 'var(--color-warning)' : 'var(--color-success)';
          const maxBar = Math.max(...(k.sparkline || [1]), 1);
          const miniBarHtml = (k.sparkline || []).map((v, i) => {
            const h = Math.round((v / maxBar) * 40);
            const inc = i === 0 ? v : Math.max(0, v - k.sparkline[i - 1]);
            return `<div title="${DATA.meta.monthsTrailing12[i]}: +${formatNumber(inc,1)} ${k.unit}" style="width:6px;background:${inc > 0 ? 'var(--color-accent)' : 'var(--color-border)'};height:${Math.max(h, 2)}px;border-radius:2px 2px 0 0;align-self:flex-end;flex-shrink:0;"></div>`;
          }).join('');
          return `
            <div style="border:1px solid var(--color-border);border-top:3px solid ${barColor};border-radius:var(--radius-md);padding:var(--space-3) var(--space-4);background:var(--color-surface);cursor:pointer;" onclick="openKpiDetail('${k.id}')">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:var(--space-2);">
                <div style="font-size:var(--text-xs);font-weight:600;color:var(--color-text);line-height:1.3;flex:1;">${k.no}. ${k.name}</div>
                <span style="font-size:9px;background:rgba(0,191,216,0.12);color:var(--color-accent);padding:1px 7px;border-radius:8px;white-space:nowrap;font-weight:700;">Akumulatif</span>
              </div>
              <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:var(--space-2);">
                <span style="font-size:var(--display-sm);font-weight:800;color:${barColor};font-family:'Manrope',sans-serif;">${formatNumber(k.actual, k.actual < 10 ? 1 : 0)}</span>
                <span style="font-size:var(--text-xs);color:var(--color-text-muted);">/ ${formatNumber(k.target, k.target < 10 ? 1 : 0)} ${k.unit}</span>
              </div>
              <div style="background:var(--color-surface-2);border-radius:4px;height:6px;margin-bottom:var(--space-2);overflow:hidden;">
                <div style="height:100%;width:${Math.min(pct, 100)}%;background:${barColor};border-radius:4px;transition:width 0.8s cubic-bezier(.4,0,.2,1);"></div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3);">
                <span style="font-size:var(--text-2xs);color:var(--color-text-muted);">YTD Feb 2026</span>
                <span style="font-size:var(--text-xs);font-weight:700;color:${barColor};">${formatNumber(pct, 1)}%</span>
              </div>
              <div style="display:flex;align-items:flex-end;gap:2px;height:44px;" title="Monthly additions">${miniBarHtml}</div>
            </div>`;
        }).join('');
      }

      const tabiner = document.getElementById('ops-kpi-table');
      const piContainer  = document.getElementById('ops-pi-table');

      const kpiColumns = [
        { key: 'no',          label: 'No',         numeric: true },
        { key: 'name',        label: 'Indikator',  numeric: false,
          render: r => `${r.name} <span style="font-size:var(--text-xs);color:var(--color-text-subtle);">(${r.unit})</span>${r.basis === 'akumulatif' ? ' <span style="font-size:9px;background:rgba(0,191,216,0.12);color:var(--color-accent);padding:1px 6px;border-radius:8px;font-weight:600;">YTD</span>' : ''}` },
        { key: 'bobot',       label: 'Bobot',      numeric: true },
        { key: 'target',      label: 'Target',     numeric: true, render: r => formatNumber(r.target, r.target < 10 ? 2 : 0) },
        { key: 'actual',      label: 'Realisasi',  numeric: true, render: r => formatNumber(r.actual, r.actual < 10 ? 2 : 0) },
        { key: 'achievement', label: 'Capaian',    numeric: true, render: r => {
            const pct = r.achievement;
            const clr = pct >= 100 ? 'var(--color-success)' : pct >= 90 ? 'var(--color-warning)' : 'var(--color-danger)';
            return `<span style="font-weight:700;color:${clr};">${formatNumber(pct,2)}%</span>`;
          }
        },
        { key: 'nilai',       label: 'Nilai',      numeric: true, render: r => `<strong style="color:var(--color-text);">${formatNumber(r.nilai, 2)}</strong>` },
        { key: 'status',      label: 'Status',     numeric: false, render: r => `<span class="status-pill ${r.status}">${STATUS_LABEL[r.status] || r.status}</span>` },
      ];

      const kpiRows = o.kpis.filter(k => k.category === 'KPI');
      const piRows  = o.kpis.filter(k => k.category === 'PI');

      if (tableContainer) {
        tableContainer.innerHTML = SortableTable.render({ id: 'ops-kpi-tbl', columns: kpiColumns, paginate: 10 });
        SortableTable.init('ops-kpi-tbl', {
          columns: kpiColumns, rows: kpiRows, paginate: 10,
          onRowClick: (row) => openKpiDetail(row.id),
        });
      }

      if (piContainer) {
        tableContainer && void 0; // kpiColumns already defined above
        piContainer.innerHTML = SortableTable.render({ id: 'ops-pi-tbl', columns: kpiColumns, paginate: 15 });
        SortableTable.init('ops-pi-tbl', {
          columns: kpiColumns, rows: piRows, paginate: 15,
          onRowClick: (row) => openKpiDetail(row.id),
        });
      }

      // Mini donuts for KPI and PI section headers
      const kpiDonutEl = document.getElementById('ops-kpi-donut');
      const piDonutEl  = document.getElementById('ops-pi-donut');
      const t = chartTheme();
      if (kpiDonutEl && window.Chart) {
        const pct = Math.min((o.summary.kpiNilai / o.summary.kpiBobot) * 100, 120);
        new Chart(kpiDonutEl, {
          type: 'doughnut',
          data: { datasets: [{ data: [pct, Math.max(0, 100 - pct)], backgroundColor: [t.accent, t.surface2], borderWidth: 0, }] },
          options: { cutout: '75%', responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false }, tooltip: { enabled: false } }, animation: { animateRotate: true, duration: 800 } }
        });
      }
      if (piDonutEl && window.Chart) {
        const pct = Math.min((o.summary.piNilai / o.summary.piBobot) * 100, 120);
        const infoColor = getComputedStyle(document.documentElement).getPropertyValue('--color-info').trim() || '#03a2b8';
        new Chart(piDonutEl, {
          type: 'doughnut',
          data: { datasets: [{ data: [pct, Math.max(0, 100 - pct)], backgroundColor: [infoColor, t.surface2], borderWidth: 0 }] },
          options: { cutout: '75%', responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false }, tooltip: { enabled: false } }, animation: { animateRotate: true, duration: 800 } }
        });
      }

      if (window.lucide) window.lucide.createIcons();
    };

    // =========================================================
    // PAGE INIT ? Strategic Targets (Fase 8)
    // =========================================================
    const initStrategic = () => {
      const s = DATA.strategic;
      
      const tableContainer = document.getElementById('okr-table-container');
      if (tableContainer) {
        const okrColumns = [
          { key: 'obj', label: 'Objective', numeric: false, render: r => `${r.obj}<div style="font-size:var(--text-2xs);color:var(--color-text-subtle);margin-top:2px;">${r.krs.length} Key Results</div>` },
          { key: 'owner', label: 'Owner', numeric: false },
          { key: 'progress', label: 'Progress', numeric: true, render: r => `${r.progress}%<div class="progress-mini" style="margin-top:4px;"><div class="progress-mini-fill" style="width:${r.progress}%"></div></div>` },
          { key: 'status', label: 'Status', numeric: false, render: r => `<span class="status-pill ${r.status}">${STATUS_LABEL[r.status] || r.status}</span>` },
          { key: 'dueDate', label: 'Due', numeric: false, render: r => formatDate(r.dueDate, 'short') }
        ];
        tableContainer.innerHTML = SortableTable.render({ id: 'okr-table', columns: okrColumns, paginate: 10 });
        SortableTable.init('okr-table', { columns: okrColumns, rows: s.okrs, paginate: 10 });
      }

      const mapContainer = document.getElementById('strategy-map-container');
      if (mapContainer && s.strategyMap) {
        const w = 800;
        const h = 500;
        const layers = 4;
        const layerHeight = h / layers;
        const nodes = s.strategyMap.nodes;
        const edges = s.strategyMap.edges;
        
        const nodesByLayer = [[], [], [], []];
        nodes.forEach(n => nodesByLayer[n.layer].push(n));
        
        const nodeMap = {};
        nodesByLayer.forEach((layerNodes, lIdx) => {
          const y = (lIdx * layerHeight) + (layerHeight / 2);
          const gap = w / (layerNodes.length + 1);
          layerNodes.forEach((n, nIdx) => {
            const x = gap * (nIdx + 1);
            nodeMap[n.id] = { ...n, x, y };
          });
        });
        
        const getStatusColor = (status) => {
          if(status === 'on-track') return 'var(--color-success)';
          if(status === 'at-risk') return 'var(--color-warning)';
          if(status === 'delayed') return 'var(--color-danger)';
          return 'var(--color-text-muted)';
        };

        const layerLabels = ['Financial', 'Customer', 'Internal Process', 'Learning & Growth'];

        let svgHtml = `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:100%;font-family:inherit;">
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="18" refY="3" orient="auto" fill="var(--color-border-subtle)">
              <polygon points="0 0, 6 3, 0 6" />
            </marker>
            <marker id="arrowhead-active" markerWidth="6" markerHeight="6" refX="18" refY="3" orient="auto" fill="var(--color-accent)">
              <polygon points="0 0, 6 3, 0 6" />
            </marker>
          </defs>`;
          
        layerLabels.forEach((lbl, i) => {
          svgHtml += `
            <rect x="0" y="${i*layerHeight}" width="${w}" height="${layerHeight}" fill="currentColor" fill-opacity="${i%2===0 ? 0.02 : 0}" />
            <text x="10" y="${i*layerHeight + 20}" fill="var(--color-text-muted)" font-size="12" font-weight="600">${lbl}</text>
          `;
        });

        edges.forEach(e => {
          const fn = nodeMap[e.from];
          const tn = nodeMap[e.to];
          if(fn && tn) {
            svgHtml += `<line x1="${fn.x}" y1="${fn.y - 15}" x2="${tn.x}" y2="${tn.y + 15}" stroke="var(--color-border-subtle)" stroke-width="1.5" marker-end="url(#arrowhead)" opacity="0.6" class="edge" data-from="${e.from}" data-to="${e.to}" style="transition:all 0.2s;" />`;
          }
        });

        Object.values(nodeMap).forEach(n => {
          const wNode = 130;
          const hNode = 30;
          const bg = 'var(--color-surface)';
          const bColor = getStatusColor(n.status);
          
          svgHtml += `
            <g class="strat-node" data-id="${n.id}" style="cursor:pointer; transition:all 0.2s;">
              <rect x="${n.x - wNode/2}" y="${n.y - hNode/2}" width="${wNode}" height="${hNode}" rx="4" fill="${bg}" stroke="${bColor}" stroke-width="2" />
              <text x="${n.x}" y="${n.y + 4}" fill="var(--color-text)" font-size="10" text-anchor="middle" font-weight="600">${n.label}</text>
            </g>
          `;
        });
        
        svgHtml += `</svg>`;
        mapContainer.innerHTML = svgHtml;

        const allNodes = mapContainer.querySelectorAll('.strat-node');
        const allEdges = mapContainer.querySelectorAll('.edge');
        
        allNodes.forEach(node => {
          node.addEventListener('mouseenter', () => {
            const id = node.getAttribute('data-id');
            allNodes.forEach(n => n.style.opacity = '0.3');
            allEdges.forEach(e => e.style.opacity = '0.1');
            
            node.style.opacity = '1';
            const connectedEdges = Array.from(allEdges).filter(e => e.getAttribute('data-from') === id || e.getAttribute('data-to') === id);
            connectedEdges.forEach(e => {
              e.style.opacity = '1';
              e.setAttribute('stroke', 'var(--color-accent)');
              e.setAttribute('marker-end', 'url(#arrowhead-active)');
              
              const otherId = e.getAttribute('data-from') === id ? e.getAttribute('data-to') : e.getAttribute('data-from');
              const otherNode = mapContainer.querySelector(`.strat-node[data-id="${otherId}"]`);
              if(otherNode) otherNode.style.opacity = '1';
            });
          });
          
          node.addEventListener('mouseleave', () => {
            allNodes.forEach(n => n.style.opacity = '1');
            allEdges.forEach(e => {
              e.style.opacity = '0.6';
              e.setAttribute('stroke', 'var(--color-border-subtle)');
              e.setAttribute('marker-end', 'url(#arrowhead)');
            });
          });
        });
      }

      if (window.lucide) window.lucide.createIcons();
    };

    // =========================================================
    // PAGE INIT ? Human Capital (Fase 9)
    // =========================================================
    const initHumanCapital = () => {
      const h = DATA.humanCapital;
      const t = chartTheme();

      const bidangEl = document.getElementById('hc-bidang-chart');
      if (bidangEl) {
        ChartFactory.donut(bidangEl, h.headcountByBidang.map(b => b.count), h.headcountByBidang.map(b => b.name), {
          colors: [t.palette[0], t.palette[1], t.palette[2], t.warning]
        });
      }

      const buEl = document.getElementById('hc-bu-chart');
      if (buEl) {
        ChartFactory.bar(buEl, [
          { label: 'Headcount', data: h.headcountByBU.map(b => b.count), backgroundColor: t.palette[2] }
        ], { labels: h.headcountByBU.map(b => b.bu) });
      }

      const ageEl = document.getElementById('hc-age-chart');
      if (ageEl) {
        ChartFactory.bar(ageEl, [
          { label: 'Pria', data: h.ageDistribution.map(a => a.male), backgroundColor: t.palette[0] },
          { label: 'Wanita', data: h.ageDistribution.map(a => a.female), backgroundColor: t.palette[1] }
        ], { 
          labels: h.ageDistribution.map(a => a.range),
          stacked: true
        });
      }

      const certEl = document.getElementById('hc-cert-chart');
      if (certEl) {
        const sert = h.sertifikasi;
        const units = sert.perUnit.map(u => u.unit);
        // Show 4 most relevant categories for chart (exclude K3-umum to keep scale)
        const chartCats = [
          { id: 'skkni-bim', label: 'SKKNI BIM',     color: t.palette[0] },
          { id: 'pmp',       label: 'PMP',            color: t.palette[1] },
          { id: 'iso-19650', label: 'ISO 19650',      color: t.palette[2] },
          { id: 'ppa',       label: 'PBJ (LKPP)',     color: t.palette[3] || t.warning },
          { id: 'pcs',       label: 'Cost & Schedule',color: t.palette[4] || t.success },
        ];
        ChartFactory.bar(certEl,
          chartCats.map(c => ({
            label: c.label,
            data: sert.perUnit.map(u => u[c.id] || 0),
            backgroundColor: c.color,
          })),
          { labels: units, stacked: true }
        );
      }

      const tContainer = document.getElementById('training-table-container');
      if (tContainer) {
        const tCols = [
          { key: 'name', label: 'Program Pelatihan', numeric: false },
          { key: 'owner', label: 'Owner', numeric: false },
          { key: 'participants', label: 'Peserta', numeric: true, render: r => formatNumber(r.participants) },
          { key: 'completion', label: 'Penyelesaian', numeric: true, render: r => `${r.completion}%<div class="progress-mini" style="margin-top:4px;"><div class="progress-mini-fill" style="width:${r.completion}%"></div></div>` },
          { key: 'budget', label: 'Anggaran', numeric: true, render: r => formatRupiah(r.budget * 1000000, {decimals:0}) },
          { key: 'actual', label: 'Realisasi', numeric: true, render: r => formatRupiah(r.actual * 1000000, {decimals:0}) }
        ];
        tContainer.innerHTML = SortableTable.render({ id: 'training-table', columns: tCols, paginate: 10 });
        SortableTable.init('training-table', { columns: tCols, rows: h.training, paginate: 10 });
      }

      if (window.lucide) window.lucide.createIcons();
    };

        // =========================================================
    // PAGE INIT — Reports & Approvals (Fase 10)
    // =========================================================
    const initApprovals = () => {
      const a = DATA.approvals;
      const pending = getPendingApprovalsForRole(state.role);

      // --- Populate KPI Strip ---
      const kpiStrip = document.getElementById('approvals-kpi-strip');
      if (kpiStrip) {
        const items = [
          { label: 'Tugas Approval Saya', value: pending.length, color: 'var(--color-accent)', meta: `Peran: ${ROLES[state.role].label}` },
          { label: 'Total Laporan Aktif', value: a.reports.filter(r => r.status !== 'approved' && r.status !== 'locked').length, color: 'var(--color-text)', meta: 'Sedang dalam proses' },
          { label: 'Perlu Revisi', value: a.reports.filter(r => r.status === 'needs_revision').length, color: 'var(--color-warning)', meta: 'Dikembalikan oleh Approver' },
          { label: 'Selesai / Final', value: a.reports.filter(r => r.status === 'approved' || r.status === 'locked').length, color: 'var(--color-success)', meta: 'Telah mencapai tahap akhir' },
        ];
        kpiStrip.innerHTML = items.map(k => `
          <div class="summary-hero-card kpi">
            <div class="summary-hero-label">${k.label}</div>
            <div class="summary-hero-value display-font" style="color:${k.color};">${k.value}</div>
            <div class="summary-hero-meta">${k.meta}</div>
          </div>`).join('');
      }

      // --- Populate Pending subtitle & badge ---
      const pendingSubtitle = document.getElementById('approvals-pending-subtitle');
      if (pendingSubtitle) pendingSubtitle.textContent = `Menunggu aksi dari peran ${ROLES[state.role].label}`;
      const pendingBadge = document.getElementById('approvals-pending-badge');
      if (pendingBadge) pendingBadge.textContent = `${pending.length} Tugas`;

      // --- Render Pending Tasks Table ---
      const pendingContainer = document.getElementById('pending-table-container');
      if (pendingContainer) {
        if (pending.length === 0) {
          pendingContainer.innerHTML = `<div style="text-align:center;padding:48px 24px;color:var(--color-text-muted);">
            <i data-lucide="check-circle-2" style="width:48px;height:48px;display:block;margin:0 auto 16px;color:var(--color-success);opacity:0.5;"></i>
            <h3 style="color:var(--color-text);font-size:var(--text-md);margin-bottom:8px;">Semua Selesai!</h3>
            <p style="font-size:var(--text-sm);max-width:320px;margin:0 auto;color:var(--color-text-muted);">Tidak ada laporan yang menunggu aksi Anda saat ini. Ubah peran di pojok kanan atas untuk melihat antrean peran lain.</p>
          </div>`;
        } else {
          const pendingCols = [
            { key: 'id',           label: 'ID Laporan',  numeric: false },
            { key: 'unit',         label: 'Unit',         numeric: false },
            { key: 'period',       label: 'Periode',      numeric: false },
            { key: 'status',       label: 'Status',       numeric: false, render: r => `<span class="status-pill ${r.status.replace(/_/g,'-')}">${a.statusLabels[r.status] || r.status}</span>` },
            { key: 'currentStage', label: 'Tahap',        numeric: true,  render: r => `<span style="font-weight:600;">${r.currentStage}</span> / 5` },
            { key: 'submittedAt',  label: 'Dikirim',      numeric: false, render: r => r.submittedAt ? relativeTime(r.submittedAt) : '<span style="color:var(--color-text-subtle)">Belum</span>' },
            { key: 'action',       label: 'Aksi',         numeric: false, render: r => `<button class="btn btn-primary btn-sm" onclick="openReportDetail('${r.id}')"><i data-lucide="eye" style="width:14px;height:14px;"></i><span>Review</span></button>` },
          ];
          pendingContainer.innerHTML = SortableTable.render({ id: 'table-pending', columns: pendingCols });
          SortableTable.init('table-pending', { columns: pendingCols, rows: pending });
        }
      }

      // --- Render All Reports Table ---
      const allContainer = document.getElementById('all-reports-table-container');
      if (allContainer) {
        const allCols = [
          { key: 'id',           label: 'ID Laporan',    numeric: false },
          { key: 'title',        label: 'Judul Laporan', numeric: false },
          { key: 'unit',         label: 'Unit',          numeric: false },
          { key: 'period',       label: 'Periode',       numeric: false },
          { key: 'status',       label: 'Status',        numeric: false, render: r => `<span class="status-pill ${r.status.replace(/_/g,'-')}">${a.statusLabels[r.status] || r.status}</span>` },
          { key: 'currentStage', label: 'Tahap',         numeric: true,  render: r => `${r.currentStage} / 5` },
          { key: 'action',       label: '',              numeric: false, render: r => `<button class="btn btn-secondary btn-sm" onclick="openReportDetail('${r.id}')"><i data-lucide="file-search" style="width:14px;height:14px;"></i><span>Detail</span></button>` },
        ];
        allContainer.innerHTML = SortableTable.render({ id: 'table-all-reports', columns: allCols, paginate: 5 });
        SortableTable.init('table-all-reports', { columns: allCols, rows: a.reports, paginate: 5 });
      }

      // --- Render 14 Indicator Matrix ---
      const indicatorContainer = document.getElementById('indicator-matrix-container');
      if (indicatorContainer && a.indicators) {
        const polLabel  = { positif:'Positif ↑', negatif:'Negatif ↓', range:'Range ↔', pengurang:'Pengurang −' };
        const polColor  = { positif:'var(--color-success)', negatif:'var(--color-accent)', range:'#3b82f6', pengurang:'var(--color-danger)' };
        const rowsArr = a.indicators.map(ind => {
          const isKpi = ind.kat === 'KPI';
          return `<tr style="border-bottom:1px solid var(--color-border);">
            <td style="padding:var(--space-2) var(--space-3);text-align:center;font-weight:700;font-size:var(--text-sm);color:${isKpi ? 'var(--color-accent)' : 'var(--color-text-muted)'};">${ind.no}</td>
            <td style="padding:var(--space-2) var(--space-3);"><span class="status-pill ${isKpi ? 'in-review' : 'draft'}" style="font-size:9px;padding:2px 6px;">${ind.kat}</span></td>
            <td style="padding:var(--space-2) var(--space-3);font-size:var(--text-xs);font-weight:500;color:var(--color-text);max-width:280px;line-height:1.4;">${ind.nama}</td>
            <td style="padding:var(--space-2) var(--space-3);font-size:var(--text-xs);text-align:center;color:var(--color-text-muted);">${ind.satuan}</td>
            <td style="padding:var(--space-2) var(--space-3);font-size:var(--text-xs);text-align:center;font-weight:600;color:var(--color-text);">${ind.target}</td>
            <td style="padding:var(--space-2) var(--space-3);text-align:center;font-weight:700;font-size:var(--text-sm);color:${isKpi ? 'var(--color-accent)' : 'var(--color-text)'};">${ind.bobot > 0 ? ind.bobot : '<span style="color:var(--color-danger);">−30</span>'}</td>
            <td style="padding:var(--space-2) var(--space-3);font-size:var(--text-2xs);white-space:nowrap;"><span style="color:${polColor[ind.polaritas] || 'var(--color-text-muted)'};">${polLabel[ind.polaritas] || ind.polaritas}</span></td>
            <td style="padding:var(--space-2) var(--space-3);font-size:var(--text-xs);color:var(--color-accent);font-weight:500;">${ind.pic}</td>
            <td style="padding:var(--space-2) var(--space-3);font-size:var(--text-2xs);color:var(--color-text-muted);">${ind.sumber}</td>
          </tr>`;
        });
        const kpiTotal  = a.indicators.filter(i => i.kat === 'KPI').reduce((s, i) => s + i.bobot, 0);
        const piTotal   = a.indicators.filter(i => i.kat === 'PI' && i.bobot > 0).reduce((s, i) => s + i.bobot, 0);
        indicatorContainer.innerHTML = `
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:var(--color-surface-2);font-size:var(--text-2xs);color:var(--color-text-subtle);text-transform:uppercase;letter-spacing:0.05em;">
                <th style="padding:var(--space-2) var(--space-3);text-align:center;">No</th>
                <th style="padding:var(--space-2) var(--space-3);text-align:left;">Kat</th>
                <th style="padding:var(--space-2) var(--space-3);text-align:left;">Nama Indikator</th>
                <th style="padding:var(--space-2) var(--space-3);text-align:center;">Satuan</th>
                <th style="padding:var(--space-2) var(--space-3);text-align:center;">Target</th>
                <th style="padding:var(--space-2) var(--space-3);text-align:center;">Bobot</th>
                <th style="padding:var(--space-2) var(--space-3);text-align:left;">Polaritas</th>
                <th style="padding:var(--space-2) var(--space-3);text-align:left;">PIC / SM</th>
                <th style="padding:var(--space-2) var(--space-3);text-align:left;">Sumber Data</th>
              </tr>
              <tr style="background:var(--color-surface-2);border-bottom:2px solid var(--color-accent);">
                <td colspan="9" style="padding:var(--space-1) var(--space-3);font-size:var(--text-2xs);color:var(--color-accent);font-weight:700;">KPI — Key Performance Indicator (Bobot Total: ${kpiTotal})</td>
              </tr>
            </thead>
            <tbody>${rowsArr.slice(0, 3).join('')}
              <tr style="background:var(--color-surface-2);border-bottom:2px solid var(--color-text-muted);">
                <td colspan="9" style="padding:var(--space-1) var(--space-3);font-size:var(--text-2xs);color:var(--color-text-muted);font-weight:700;">PI — Performance Indicator (Bobot Total: ${piTotal} + Pengurang maks −30)</td>
              </tr>
              ${rowsArr.slice(3).join('')}
            </tbody>
            <tfoot>
              <tr style="background:var(--color-surface-2);">
                <td colspan="5" style="padding:var(--space-2) var(--space-3);text-align:right;font-size:var(--text-xs);color:var(--color-text-muted);font-weight:600;">TOTAL BOBOT</td>
                <td style="padding:var(--space-2) var(--space-3);text-align:center;font-weight:800;font-size:var(--text-md);color:var(--color-accent);">${kpiTotal + piTotal}</td>
                <td colspan="3" style="padding:var(--space-2) var(--space-3);font-size:var(--text-2xs);color:var(--color-text-muted);">Scoring: Nilai = Bobot × MIN(Pencapaian, 1.1) &bull; PI #14 adalah pengurang (maks −30)</td>
              </tr>
            </tfoot>
          </table>`;
      }

      // --- Render RACI Matrix ---
      const raciContainer = document.getElementById('raci-matrix-container');
      if (raciContainer && a.raci) {
        const raciRows = a.raci.map(row => `
          <tr style="border-bottom:1px solid var(--color-border);">
            <td style="padding:var(--space-2) var(--space-3);font-size:var(--text-xs);font-weight:500;color:var(--color-text);">${row.fungsi}</td>
            <td style="padding:var(--space-2) var(--space-3);font-size:var(--text-xs);color:var(--color-success);font-weight:600;">${row.r || '—'}</td>
            <td style="padding:var(--space-2) var(--space-3);font-size:var(--text-xs);color:var(--color-accent);font-weight:600;">${row.a || '—'}</td>
            <td style="padding:var(--space-2) var(--space-3);font-size:var(--text-xs);color:var(--color-warning);">${row.c || '—'}</td>
            <td style="padding:var(--space-2) var(--space-3);font-size:var(--text-xs);color:var(--color-text-muted);">${row.i || '—'}</td>
          </tr>`).join('');
        raciContainer.innerHTML = `
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:var(--color-surface-2);font-size:var(--text-2xs);color:var(--color-text-subtle);text-transform:uppercase;letter-spacing:0.05em;">
                <th style="padding:var(--space-2) var(--space-3);text-align:left;min-width:220px;">Fungsi / Aktivitas</th>
                <th style="padding:var(--space-2) var(--space-3);text-align:left;color:var(--color-success);">R — Responsible</th>
                <th style="padding:var(--space-2) var(--space-3);text-align:left;color:var(--color-accent);">A — Accountable</th>
                <th style="padding:var(--space-2) var(--space-3);text-align:left;color:var(--color-warning);">C — Consulted</th>
                <th style="padding:var(--space-2) var(--space-3);text-align:left;">I — Informed</th>
              </tr>
            </thead>
            <tbody>${raciRows}</tbody>
          </table>`;
      }

      if (window.lucide) window.lucide.createIcons();
    };

    // =========================================================
    // PAGE INIT — Settings & User Management (Fase 11)
    // =========================================================

    const renderSettingsProfile = () => {
      const prefs = DATA.userPrefs; const r = ROLES[state.role];
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      return `<div class="settings-section">
        <div class="profile-avatar-section">
          <div class="profile-avatar-circle">${r.initials}</div>
          <div>
            <div style="font-weight:700;font-size:var(--text-lg);color:var(--color-text);font-family:'Manrope',sans-serif;">${r.name}</div>
            <div style="font-size:var(--text-sm);color:var(--color-text-muted);margin-top:4px;">${r.email}</div>
            <span class="status-pill completed" style="margin-top:8px;display:inline-flex;gap:4px;">${r.label} &bull; Level ${r.level}</span>
          </div>
        </div>
        <div class="settings-field-group">
          <div class="settings-field-group-title">Tampilan</div>
          <div class="settings-row">
            <div><div class="settings-row-label">Tema Antarmuka</div><div class="settings-row-sub">Mode gelap direkomendasikan untuk penggunaan malam hari</div></div>
            <div style="display:flex;gap:var(--space-2);">
              <button id="theme-dark-btn" class="btn btn-sm ${isDark ? 'btn-primary' : 'btn-secondary'}" onclick="applyTheme('dark');document.getElementById('theme-dark-btn').className='btn btn-sm btn-primary';document.getElementById('theme-light-btn').className='btn btn-sm btn-secondary';"><i data-lucide="moon"></i><span>Gelap</span></button>
              <button id="theme-light-btn" class="btn btn-sm ${!isDark ? 'btn-primary' : 'btn-secondary'}" onclick="applyTheme('light');document.getElementById('theme-light-btn').className='btn btn-sm btn-primary';document.getElementById('theme-dark-btn').className='btn btn-sm btn-secondary';"><i data-lucide="sun"></i><span>Terang</span></button>
            </div>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-label">Bahasa Antarmuka</div><div class="settings-row-sub">Label dan teks antarmuka dashboard</div></div>
            <select id="pref-language" style="background:var(--color-surface-2);border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:6px 12px;color:var(--color-text);font-size:var(--text-sm);cursor:pointer;">
              <option value="id" ${prefs.language === 'id' ? 'selected' : ''}>🇮🇩 Bahasa Indonesia</option>
              <option value="en" ${prefs.language === 'en' ? 'selected' : ''}>🇺🇸 English</option>
            </select>
          </div>
        </div>
        <div class="settings-field-group">
          <div class="settings-field-group-title">Periode &amp; Data</div>
          <div class="settings-row">
            <div><div class="settings-row-label">Filter Periode Default</div><div class="settings-row-sub">Periode aktif saat membuka dashboard</div></div>
            <select id="pref-period" style="background:var(--color-surface-2);border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:6px 12px;color:var(--color-text);font-size:var(--text-sm);cursor:pointer;">
              <option value="monthly"   ${prefs.defaultPeriod === 'monthly'   ? 'selected' : ''}>Bulanan</option>
              <option value="semester" ${prefs.defaultPeriod === 'semester' ? 'selected' : ''}>Semesteran</option>
              <option value="yearly"    ${prefs.defaultPeriod === 'yearly'    ? 'selected' : ''}>Tahunan</option>
            </select>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-label">Unit Organisasi</div><div class="settings-row-sub">PT PLN (Persero) Pusat Manajemen Proyek</div></div>
            <span class="status-pill completed">PUSMANPRO &mdash; Jakarta</span>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:var(--space-3);padding-top:var(--space-2);">
          <button class="btn btn-ghost" onclick="switchSettingsTab('profile')"><i data-lucide="rotate-ccw"></i><span>Reset</span></button>
          <button class="btn btn-primary" onclick="saveSettingsPrefs('profile')"><i data-lucide="save"></i><span>Simpan Preferensi</span></button>
        </div>
      </div>`;
    };

    const renderSettingsRoles = () => {
      const units = DATA.meta.units; const prefs = DATA.userPrefs;
      const rows = units.map(u => {
        const assigned = prefs.roleAssignments[u.code] || 'staff';
        const isCurrent = assigned === state.role;
        return `<tr>
          <td><strong>${u.short}</strong><br><span style="font-size:var(--text-xs);color:var(--color-text-muted);">${u.name}</span></td>
          <td style="font-size:var(--text-xs);color:var(--color-text-muted);max-width:180px;">${u.wilayah}</td>
          <td style="font-size:var(--text-xs);">${formatNumber(u.headcount)} pegawai</td>
          <td><select class="role-assign-select" data-unit="${u.code}" style="background:var(--color-surface-2);border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:5px 10px;color:var(--color-text);font-size:var(--text-sm);cursor:pointer;">
            ${Object.entries(ROLES).map(([k, rv]) => '<option value="' + k + '"' + (assigned === k ? ' selected' : '') + '>' + rv.label + ' (' + rv.level + ')</option>').join('')}
          </select></td>
          <td>${isCurrent ? '<span class="status-pill completed" style="font-size:var(--text-2xs);">Aktif</span>' : ''}</td>
        </tr>`;
      }).join('');
      return `<div class="settings-section">
        <div class="card p-0" style="overflow:hidden;">
          <div class="card-header"><div class="card-title"><i data-lucide="shield-check"></i>Matriks Penugasan Peran</div><span class="card-meta">Konfigurasi peran per unit kerja</span></div>
          <div style="overflow-x:auto;"><table class="role-matrix-tbl"><thead><tr><th>Unit</th><th>Wilayah</th><th>Headcount</th><th>Peran Default</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
        </div>
        <div class="settings-field-group">
          <div class="settings-field-group-title">Simulasi Peran Aktif</div>
          <div class="settings-row">
            <div><div class="settings-row-label">Peran Aktif Saat Ini: <strong>${ROLES[state.role].label}</strong></div><div class="settings-row-sub">Klik peran lain untuk simulasi tampilan dashboard dari sudut pandang peran tersebut</div></div>
            <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
              ${Object.entries(ROLES).map(([k, rv]) => '<button class="btn btn-sm ' + (state.role === k ? 'btn-primary' : 'btn-secondary') + '" onclick="switchRole(\'' + k + '\');switchSettingsTab(\'roles\');"><i data-lucide="' + rv.icon + '"></i><span>' + rv.label + '</span></button>').join('')}
            </div>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:var(--space-3);padding-top:var(--space-2);">
          <button class="btn btn-primary" onclick="saveSettingsPrefs('roles')"><i data-lucide="save"></i><span>Simpan Penugasan</span></button>
        </div>
      </div>`;
    };

    const renderSettingsNotifications = () => {
      const n = DATA.userPrefs.notifications;
      const items = [
        { key:'approvalRequest', icon:'file-check-2', color:'var(--color-accent)',  title:'Permintaan Approval Baru',    desc:'Notifikasi saat laporan KM baru masuk ke antrean Anda' },
        { key:'needsRevision',   icon:'rotate-ccw',   color:'var(--color-warning)', title:'Laporan Perlu Direvisi',       desc:'Notifikasi saat laporan dikembalikan dan perlu revisi' },
        { key:'kpiBelowTarget',  icon:'trending-down',color:'var(--color-danger)',  title:'KPI di Bawah Target',          desc:'Peringatan saat pencapaian KPI turun di bawah ' + n.kpiBelowTarget.threshold + '%' },
        { key:'slaWarning',      icon:'clock',        color:'var(--color-warning)', title:'Peringatan SLA Hampir Lewat',  desc:'Reminder ' + n.slaWarning.hoursBefore + ' jam sebelum batas SLA approval' },
        { key:'finalApproved',   icon:'check-circle-2',color:'var(--color-success)',title:'Laporan Final Disetujui',      desc:'Konfirmasi saat laporan KM mencapai Stage 5 (GM Final)' },
      ];
      const cards = items.map(item => {
        const cfg = n[item.key];
        return '<div class="notif-card ' + (cfg.enabled ? 'enabled' : '') + '" id="notif-card-' + item.key + '">' +
          '<div class="notif-card-icon"><i data-lucide="' + item.icon + '" style="color:' + item.color + ';"></i></div>' +
          '<div style="flex:1;">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);">' +
              '<div><div style="font-weight:600;font-size:var(--text-sm);color:var(--color-text);">' + item.title + '</div>' +
              '<div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:3px;">' + item.desc + '</div></div>' +
              '<label class="toggle"><input type="checkbox" ' + (cfg.enabled ? 'checked' : '') + ' onchange="toggleNotif(\'' + item.key + '\',this.checked)"><span class="toggle-slider"></span></label>' +
            '</div>' +
            '<div class="notif-channels" id="notif-channels-' + item.key + '" style="' + (cfg.enabled ? '' : 'opacity:0.35;pointer-events:none;') + '">' +
              '<label class="notif-channel-label"><input type="checkbox" ' + (cfg.email ? 'checked' : '') + ' style="width:14px;height:14px;accent-color:var(--color-accent);"><i data-lucide="mail" style="width:12px;height:12px;"></i>Email</label>' +
              '<label class="notif-channel-label"><input type="checkbox" ' + (cfg.inApp ? 'checked' : '') + ' style="width:14px;height:14px;accent-color:var(--color-accent);"><i data-lucide="bell" style="width:12px;height:12px;"></i>In-App</label>' +
            '</div>' +
          '</div></div>';
      }).join('');
      return `<div class="settings-section">
        <div class="settings-field-group">
          <div class="settings-field-group-title">Konfigurasi Notifikasi &amp; Alert</div>
          <p style="font-size:var(--text-xs);color:var(--color-text-muted);">Aktifkan atau nonaktifkan notifikasi per kategori event. Pilih channel pengiriman untuk setiap jenis notifikasi.</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3);">${cards}</div>
        <div style="display:flex;justify-content:flex-end;gap:var(--space-3);padding-top:var(--space-2);">
          <button class="btn btn-primary" onclick="saveSettingsPrefs('notifications')"><i data-lucide="save"></i><span>Simpan Konfigurasi</span></button>
        </div>
      </div>`;
    };

    const renderSettingsAudit = () => {
      const actionLabel = { login:'Login', approve:'Approve', reject:'Return', submit:'Submit', edit:'Edit', export:'Export' };
      const rows = DATA.auditLog.map(e =>
        '<tr>' +
        '<td style="font-size:var(--text-xs);color:var(--color-text-muted);white-space:nowrap;">' + relativeTime(e.timestamp) + '</td>' +
        '<td style="font-size:var(--text-xs);">' + e.user + '</td>' +
        '<td><span class="audit-action-pill ' + e.action + '">' + (actionLabel[e.action] || e.action) + '</span></td>' +
        '<td style="font-size:var(--text-xs);font-weight:600;">' + e.entity + '</td>' +
        '<td style="font-size:var(--text-xs);color:var(--color-text-muted);max-width:240px;">' + e.detail + '</td>' +
        '</tr>'
      ).join('');
      const counts = {};
      DATA.auditLog.forEach(e => { counts[e.action] = (counts[e.action] || 0) + 1; });
      const summaryCards = Object.entries(counts).map(([k, v]) =>
        '<div class="summary-hero-card kpi" style="padding:var(--space-3) var(--space-4);"><div class="summary-hero-label" style="font-size:var(--text-xs);">' + (actionLabel[k] || k) + '</div><div class="summary-hero-value display-font" style="font-size:var(--display-sm);">' + v + '</div></div>'
      ).join('');
      return `<div class="settings-section">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:var(--space-3);">${summaryCards}</div>
        <div class="card p-0" style="overflow:hidden;">
          <div class="card-header"><div class="card-title"><i data-lucide="scroll-text"></i>Log Aktivitas Sistem</div><span class="card-meta">${DATA.auditLog.length} entri terkini</span></div>
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
              <thead><tr style="background:var(--color-surface-2);font-size:var(--text-xs);color:var(--color-text-subtle);text-transform:uppercase;letter-spacing:0.05em;">
                <th style="padding:var(--space-3) var(--space-4);text-align:left;">Waktu</th>
                <th style="padding:var(--space-3) var(--space-4);text-align:left;">Pengguna</th>
                <th style="padding:var(--space-3) var(--space-4);text-align:left;">Aksi</th>
                <th style="padding:var(--space-3) var(--space-4);text-align:left;">Entitas</th>
                <th style="padding:var(--space-3) var(--space-4);text-align:left;">Detail</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>`;
    };

    // === Demo Guide for UAT (5 walkthrough scenarios) ===
    const DEMO_SCENARIOS = [
      { id: 1, title: 'Walkthrough Eksekutif',  role: 'gm',        route: 'executive-summary',
        desc: 'Sebagai General Manager: tinjau Total Nilai Kinerja, drill-down ke ranking unit, dan periksa inisiatif strategis.',
        icon: 'crown' },
      { id: 2, title: 'Kontrak Manajemen — Approval Cascade', role: 'asman', route: 'workflow-km',
        desc: 'Sebagai Asisten Manajer (Checker-1): buka pending approval WF1-KKU atau WF1b-U2, klik "Approve & Forward". Lihat audit trail update otomatis & status row berubah.',
        icon: 'git-branch' },
      { id: 3, title: 'Kontrak Manajemen — Buat Proposal Baru', role: 'staff', route: 'workflow-km',
        desc: 'Sebagai Staff: klik "Buat Proposal" di header, isi tipe WF-1/WF-1b, bidang/unit, deadline. Verifikasi item baru muncul di pending list dan audit trail.',
        icon: 'plus-circle' },
      { id: 4, title: 'Kontrak Manajemen — Return / Revisi Flow', role: 'manajer', route: 'workflow-km',
        desc: 'Sebagai Manajer (Checker-2): buka pending approval WF1-QA-QC, klik "Return", isi catatan revisi, submit. Item kembali ke Maker dengan status RETURNED.',
        icon: 'rotate-ccw' },
      { id: 5, title: 'Compliance & Akumulatif KPI', role: 'srmanajer', route: 'operational',
        desc: 'Sebagai Senior Manajer: tinjau 14 KPI/PI matrix dan kepatuhan (penalty -30) di halaman Operational.',
        icon: 'shield-check' },
    ];
    const startDemoScenario = (id) => {
      const sc = DEMO_SCENARIOS.find(s => s.id === id);
      if (!sc) return;
      if (typeof switchRole === 'function') switchRole(sc.role);
      else if (typeof setRole === 'function') setRole(sc.role);
      window.location.hash = '#' + sc.route;
      toast({ title: 'Skenario Demo: ' + sc.title, message: 'Role: ' + ROLES[sc.role].label + ' • Modul: ' + (ROUTES[sc.route] && ROUTES[sc.route].label || sc.route), type: 'info', duration: 3500 });
    };
    window.startDemoScenario = startDemoScenario;
    const renderSettingsDemo = () => {
      const cards = DEMO_SCENARIOS.map(s => `
        <div class="card p-0" style="border-left:3px solid var(--color-accent);">
          <div class="card-body" style="padding:var(--space-4);display:grid;grid-template-columns:42px 1fr auto;gap:var(--space-3);align-items:center;">
            <div style="width:42px;height:42px;border-radius:var(--radius-md);background:var(--color-accent-tint);display:flex;align-items:center;justify-content:center;color:var(--color-accent);">
              <i data-lucide="${s.icon}" style="width:20px;height:20px;"></i>
            </div>
            <div>
              <div style="font-weight:600;color:var(--color-text);font-size:var(--text-sm);">Skenario ${s.id} — ${s.title}</div>
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:4px;line-height:1.5;">${s.desc}</div>
              <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;">
                <span style="font-size:10px;background:var(--color-surface-2);color:var(--color-text-muted);padding:2px 8px;border-radius:8px;">Role: ${ROLES[s.role].label}</span>
                <span style="font-size:10px;background:var(--color-accent-tint);color:var(--color-accent);padding:2px 8px;border-radius:8px;">Modul: ${ROUTES[s.route] ? ROUTES[s.route].label : s.route}</span>
              </div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="startDemoScenario(${s.id})"><i data-lucide="play"></i><span>Mulai</span></button>
          </div>
        </div>`).join('');
      return `
        <div class="settings-section">
          <div style="margin-bottom:var(--space-5);">
            <h2 style="font-family:'Manrope',sans-serif;font-size:var(--text-2xl);color:var(--color-text);margin:0 0 6px 0;">Panduan Demo UAT — Kontrak Manajemen</h2>
            <p style="color:var(--color-text-muted);font-size:var(--text-sm);margin:0;">Lima skenario walkthrough siap-pakai. 3 dari 5 skenario fokus pada simulasi nyata workflow Kontrak Manajemen (WF-1 / WF-1b / WF-2). Klik "Mulai" untuk auto-set role + navigasi.</p>
          </div>
          <div style="display:grid;grid-template-columns:1fr;gap:var(--space-3);margin-bottom:var(--space-6);">${cards}</div>
          <div class="card p-0" style="background:var(--color-surface-2);">
            <div class="card-body" style="padding:var(--space-4);">
              <div style="font-weight:600;font-size:var(--text-sm);color:var(--color-text);margin-bottom:var(--space-2);"><i data-lucide="info" style="width:14px;height:14px;vertical-align:-2px;"></i> Catatan Demo Kontrak Manajemen</div>
              <ul style="margin:0;padding-left:18px;font-size:var(--text-xs);color:var(--color-text-muted);line-height:1.7;">
                <li>Login: <strong>staff@pln.co.id</strong> (Maker), <strong>asman@pln.co.id</strong> (Checker-1), <strong>manajer@pln.co.id</strong> (Checker-2), <strong>srmanajer@pln.co.id</strong> (SM), <strong>gm@pln.co.id</strong> (GM). Password semua: <strong>PLN@2026</strong>.</li>
                <li>Mapping holder: <strong>Maker</strong>=staff, <strong>Checker-1</strong>=asman, <strong>Checker-2</strong>=manajer, <strong>SM</strong>=srmanajer, <strong>GM</strong>=gm. Item pending hanya bisa diaksi oleh role yang sesuai.</li>
                <li>Setiap aksi (Approve/Return/Resubmit) mengubah <code>statusBidang</code>/<code>statusUPMK</code>, menghapus item dari pending list, dan menambahkan entry ke Audit Trail real-time.</li>
                <li>"Buat Proposal" memunculkan modal form, validasi bidang/unit wajib, lalu inject ke <code>pendingApprovals</code> dengan status <code>IN_REVIEW_C1</code>.</li>
                <li>Export PDF (header KM) memanggil <code>window.print()</code> dengan stylesheet khusus — sidebar/topbar ter-hide otomatis.</li>
              </ul>
            </div>
          </div>
        </div>`;
    };

    // Global tab switcher (accessible from onclick in PAGE_PREVIEW HTML)
    const switchSettingsTab = (tabId) => {
      document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
      const btn = document.querySelector('.settings-tab[data-tab="' + tabId + '"]');
      if (btn) btn.classList.add('active');
      const area = document.getElementById('settings-content-area');
      if (!area) return;
      if (tabId === 'profile')       area.innerHTML = renderSettingsProfile();
      else if (tabId === 'roles')    area.innerHTML = renderSettingsRoles();
      else if (tabId === 'notifications') area.innerHTML = renderSettingsNotifications();
      else if (tabId === 'audit')    area.innerHTML = renderSettingsAudit();
      else if (tabId === 'demo')     area.innerHTML = renderSettingsDemo();
      if (window.lucide) window.lucide.createIcons();
    };

    const toggleNotif = (key, enabled) => {
      DATA.userPrefs.notifications[key].enabled = enabled;
      const channels = document.getElementById('notif-channels-' + key);
      if (channels) channels.style.cssText = enabled ? '' : 'opacity:0.35;pointer-events:none;';
      const card = document.getElementById('notif-card-' + key);
      if (card) card.classList.toggle('enabled', enabled);
    };

    const saveSettingsPrefs = (tab) => {
      if (tab === 'profile') {
        const lang = document.getElementById('pref-language');
        const period = document.getElementById('pref-period');
        if (lang) DATA.userPrefs.language = lang.value;
        if (period) DATA.userPrefs.defaultPeriod = period.value;
      }
      if (tab === 'roles') {
        document.querySelectorAll('.role-assign-select').forEach(sel => {
          DATA.userPrefs.roleAssignments[sel.dataset.unit] = sel.value;
        });
      }
      DATA.auditLog.unshift({ id: 'AL' + Date.now(), timestamp: new Date().toISOString(), user: ROLES[state.role].name, role: ROLES[state.role].label, action: 'edit', entity: 'Settings/' + tab, detail: 'Pengaturan ' + tab + ' diperbarui' });
      toast({ title: 'Pengaturan disimpan', message: 'Perubahan berhasil disimpan ke profil Anda.', type: 'success', duration: 3000 });
    };

    const initSettings = () => { switchSettingsTab('profile'); };




    const renderPlaceholder = (route) => {
      destroyAllCharts();

      const meta = ROUTES[route] || ROUTES['executive-summary'];
      const inner = document.getElementById('main-inner');
      const r = ROLES[state.role];

      // Approval banner ? derive from main active report (Kantor Induk Februari 2026)
      const mainReport = DATA.approvals.reports.find(rp => rp.id === 'KM-2026-02-KP');
      const currentStageInfo = DATA.approvals.workflow.find(w => w.stage === mainReport.currentStage);
      const nextApproverRole = ROLES[currentStageInfo.role];
      const pendingCount = getPendingApprovalsForRole(state.role).length;
      // Phase inference: stage 1-5 of KM proposal workflow = USULAN; WF-3 monitoring = REALISASI
      const reportPhase = (mainReport.phase) ? mainReport.phase :
        (/realisasi|monitoring|wf-?3/i.test(mainReport.type || '') ? 'realisasi' : 'usulan');
      const phaseBadge = reportPhase === 'realisasi'
        ? '<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:rgba(34,197,94,0.18);color:#22c55e;font-size:var(--text-2xs);font-weight:700;letter-spacing:0.5px;margin-right:8px;">REALISASI KM</span>'
        : '<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:rgba(56,189,248,0.18);color:var(--color-accent);font-size:var(--text-2xs);font-weight:700;letter-spacing:0.5px;margin-right:8px;">USULAN KM</span>';

      const dataPreview = PAGE_PREVIEW[route] ? PAGE_PREVIEW[route]() : '';

      inner.innerHTML = `
        <div class="alert-banner info" id="approval-status-banner">
          <i data-lucide="git-pull-request" class="alert-icon"></i>
          <div class="alert-banner-body">
            <div class="alert-banner-title">${phaseBadge}${mainReport.title} &mdash; Stage ${mainReport.currentStage} dari 5</div>
            <div class="alert-banner-msg">
              Status: <strong style="color:var(--color-warning);">Menunggu ${nextApproverRole.label}</strong>
              &middot; Submitted ${relativeTime(mainReport.submittedAt)} oleh ${mainReport.submittedBy.name}
              &middot; ${pendingCount > 0 ? `<strong style="color:var(--color-accent);">${pendingCount} laporan menunggu aksi Anda</strong>` : 'Tidak ada item menunggu aksi Anda'}
            </div>
          </div>
          <button class="alert-banner-dismiss" aria-label="Tutup banner" onclick="this.parentElement.style.display='none'">
            <i data-lucide="x"></i>
          </button>
        </div>

        <div class="page-header">
          <div>
            <h1 class="page-title">${meta.label}</h1>
            <p class="page-subtitle">${DATA.meta.company} &mdash; ${DATA.meta.periodFull}</p>
          </div>
          <div class="page-meta">
            <span class="meta-pill"><i data-lucide="calendar"></i> ${DATA.meta.period}</span>
            <span>Diperbarui ${formatDate(DATA.meta.lastUpdated, 'datetime')} WIB</span>
          </div>
        </div>

        ${dataPreview}

        ${PAGES_READY.has(route) ? '' : `
          <div class="page-placeholder" style="padding:var(--space-5); text-align:left; flex-direction:row; gap:var(--space-4); align-items:center; justify-content:flex-start;">
            <i data-lucide="construction" class="illustration" style="width:32px;height:32px;flex-shrink:0;"></i>
            <div style="flex:1;">
              <h2 style="font-size:var(--text-md);">Visualisasi <em style="font-family:'Manrope',sans-serif; font-style:italic; color:var(--color-accent);">${meta.label}</em> dirender di Fase ${meta.phase}</h2>
              <p style="font-size:var(--text-xs); color:var(--color-text-muted); margin-top:4px;">${meta.desc}</p>
            </div>
            <span class="placeholder-tag" style="margin:0;"><i data-lucide="users-round"></i> ${r.label} (${r.level})</span>
          </div>
        `}

        <footer class="app-footer">
          &copy; 2025&ndash;2026 PT PLN (Persero) Pusat Manajemen Proyek &mdash; <em>Internal Use Only</em>
        </footer>
      `;

      if (window.lucide) window.lucide.createIcons();

      document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(el => {
        if (el.getAttribute('data-route') === route) el.setAttribute('aria-current', 'page');
        else el.removeAttribute('aria-current');
      });

      document.getElementById('breadcrumb-current').textContent = meta.label;
      document.title = `${meta.label} — PT PLN (Persero) Pusat Manajemen Proyek`;

      closeMobileSidebar();
      document.querySelector('.main').scrollTop = 0;

      // Per-route post-init hooks
      if (PAGE_INIT[route]) setTimeout(PAGE_INIT[route], 50);
    };

    // =========================================================
    // PAGE INIT — Manajemen Risiko (Fase 12)
    // =========================================================
    const initRisk = () => {
      const rk = DATA.risk;
      const t  = chartTheme();

      // —— KPI Strip ——
      const kpiStrip = document.getElementById('risk-kpi-strip');
      if (kpiStrip) {
        kpiStrip.innerHTML = rk.kpis.map(k => {
          const d = formatDelta(k.delta, 1, k.isInverse);
          return `<div class="summary-hero-card kpi">
            <div class="summary-hero-label"><i data-lucide="${k.icon}" style="width:16px;height:16px;color:var(--color-text-muted);"></i>${k.label}</div>
            <div class="summary-hero-value">${k.formatted}</div>
            <div class="summary-hero-meta delta-${d.type}"><i data-lucide="${d.icon}"></i>${d.text} vs prev</div>
          </div>`;
        }).join('');
      }

      // —— Heat Map 5×5 ——
      const hmCont = document.getElementById('risk-heatmap-container');
      if (hmCont) {
        // Build a 5x5 grid indexed [likelihood][impact]
        const grid = {};
        rk.register.forEach(r => {
          const key = `${r.l}-${r.i}`;
          if (!grid[key]) grid[key] = [];
          grid[key].push(r);
        });
        const getZone = (l, i) => {
          const s = l * i;
          if (s >= 20) return 'critical';
          if (s >= 12) return 'high';
          if (s >= 6)  return 'medium';
          return 'low';
        };
        // Build HTML: rows = Likelihood 5→1, cols = Impact 1→5
        let html = '<div class="risk-heatmap-grid">';
        // Top-left empty corner
        html += '<div></div>';
        // Column headers (Impact 1→5)
        for (let i = 1; i <= 5; i++) html += `<div class="risk-axis-label" style="font-size:var(--text-2xs);">I${i}</div>`;
        // Rows: L5 down to L1
        for (let l = 5; l >= 1; l--) {
          // Row label
          html += `<div class="risk-axis-label">L${l}</div>`;
          for (let i = 1; i <= 5; i++) {
            const key = `${l}-${i}`;
            const items = grid[key] || [];
            const zone = getZone(l, i);
            const score = l * i;
            const ids = items.map(r => r.id).join(', ');
            html += `<div class="risk-cell zone-${zone}" title="Score ${score}: ${items.length} risiko${ids ? ' (' + ids + ')' : ''}" onclick="window._riskFilterCell(${l},${i})">`;
            if (items.length > 0) html += `<span class="risk-cell-count">${items.length}</span>`;
            html += '</div>';
          }
        }
        html += '</div>';
        hmCont.innerHTML = html;
      }

      // Cell click filter handler
      window._riskFilterCell = (l, i) => {
        const filtered = rk.register.filter(r => r.l === l && r.i === i);
        if (filtered.length === 0) return;
        SlideDrawer.open({
          title: `Risiko Score ${l*i} (L${l}×I${i})`,
          subtitle: `${filtered.length} risiko di sel ini`,
          content: filtered.map(r => {
            const scoreCls = r.l*r.i >= 20 ? 'critical' : r.l*r.i >= 12 ? 'high' : r.l*r.i >= 6 ? 'medium' : 'low';
            return `<div style="padding:var(--space-4);border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-3);">
              <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-2);">
                <span class="risk-badge ${scoreCls}">${r.id}</span>
                <span style="font-size:var(--text-xs);color:var(--color-text-muted);">${r.cat} &mdash; ${r.unit}</span>
              </div>
              <p style="font-size:var(--text-sm);color:var(--color-text);margin-bottom:var(--space-3);">${r.desc}</p>
              <div style="font-size:var(--text-xs);color:var(--color-text-muted);">
                <strong>Mitigasi:</strong> ${r.mitigation}
              </div>
              <div class="mitigation-bar" style="margin-top:var(--space-3);">
                <div class="mitigation-fill" style="width:${r.mitigationPct}%;background:var(--color-accent);"></div>
              </div>
              <div style="text-align:right;font-size:var(--text-2xs);color:var(--color-text-subtle);margin-top:4px;">${r.mitigationPct}% dimitigasi</div>
            </div>`;
          }).join(''),
        });
      };

      // —— Top 5 Critical Risks ——
      const topCards = document.getElementById('risk-top-cards');
      if (topCards) {
        const sorted = [...rk.register].sort((a, b) => (b.l*b.i) - (a.l*a.i)).slice(0, 5);
        const rankColors = ['#f87171','#fb923c','#fbbf24','#a3e635','#34d399'];
        topCards.innerHTML = sorted.map((r, idx) => {
          const score = r.l * r.i;
          const zone  = score >= 20 ? 'critical' : score >= 12 ? 'high' : score >= 6 ? 'medium' : 'low';
          const statusLabel = { open: 'Belum Dimitigasi', mitigated: 'Dimitigasi', 'in-progress': 'Sedang Dimitigasi' }[r.status] || r.status;
          const statusPill  = { open: 'needs-revision', mitigated: 'completed', 'in-progress': 'in-review' }[r.status] || 'draft';
          return `<div class="risk-top-card">
            <div class="risk-top-rank" style="background:${rankColors[idx]}22;color:${rankColors[idx]};">${idx+1}</div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:4px;flex-wrap:wrap;">
                <span class="risk-badge ${zone}">Score ${score}</span>
                <span style="font-size:var(--text-2xs);color:var(--color-text-muted);">${r.id} &bull; ${r.cat} &bull; ${r.unit}</span>
                <span class="status-pill ${statusPill}" style="font-size:var(--text-2xs);padding:1px 6px;margin-left:auto;">${statusLabel}</span>
              </div>
              <p style="font-size:var(--text-xs);color:var(--color-text);margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${r.desc}</p>
              <div style="font-size:var(--text-2xs);color:var(--color-text-muted);margin-bottom:4px;">Owner: ${r.owner} &mdash; Due: ${r.dueDate}</div>
              <div class="mitigation-bar">
                <div class="mitigation-fill" style="width:${r.mitigationPct}%;background:${score>=20?'#ef4444':score>=12?'#f59e0b':'var(--color-accent)'};"></div>
              </div>
              <div style="text-align:right;font-size:var(--text-2xs);color:var(--color-text-subtle);margin-top:2px;">${r.mitigationPct}% dimitigasi</div>
            </div>
          </div>`;
        }).join('');
      }

      // —— Risk per Category Chart ——
      const catEl = document.getElementById('risk-cat-chart');
      if (catEl) {
        const catData = rk.categories.map(cat => rk.register.filter(r => r.cat === cat).length);
        ChartFactory.donut(catEl, catData, rk.categories, {
          colors: [t.palette[0], t.palette[1], t.palette[2], t.palette[3]||t.warning, t.palette[4]||t.success, t.palette[5]||'#EC4899']
        });
      }

      // —— Risk Trend Chart ——
      const trendEl = document.getElementById('risk-trend-chart');
      if (trendEl) {
        const tr = rk.trend;
        ChartFactory.line(trendEl, [
          { label: 'Risiko Open',      data: tr.open,      borderColor: t.danger,   backgroundColor: t.danger   + '22', fill: false },
          { label: 'Dimitigasi',       data: tr.mitigated, borderColor: t.success,  backgroundColor: t.success  + '22', fill: false },
          { label: 'Critical',         data: tr.critical,  borderColor: '#f87171',  backgroundColor: '#f8717122',       fill: false },
        ], { labels: tr.months });
      }

      // —— Risk Register Table ——
      const regCont = document.getElementById('risk-register-container');
      if (regCont) {
        const getSeverity = (l, i) => { const s=l*i; return s>=20?'critical':s>=12?'high':s>=6?'medium':'low'; };
        const getStatusLabel = (s) => ({ open:'Belum Dimitigasi', mitigated:'Dimitigasi', 'in-progress':'Sedang Dimitigasi' }[s] || s);
        const getStatusPill  = (s) => ({ open:'needs-revision', mitigated:'completed', 'in-progress':'in-review' }[s] || 'draft');
        const cols = [
          { key: 'id',    label: 'ID',        numeric: false, render: r => `<code style="font-size:var(--text-2xs);color:var(--color-accent);">${r.id}</code>` },
          { key: 'desc',  label: 'Deskripsi Risiko', numeric: false, render: r => `<span style="font-size:var(--text-xs);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-width:320px;" title="${r.desc}">${r.desc}</span>` },
          { key: 'cat',   label: 'Kategori',   numeric: false, render: r => `<span style="font-size:var(--text-2xs);background:var(--color-surface-2);padding:2px 8px;border-radius:var(--radius-full);">${r.cat}</span>` },
          { key: 'unit',  label: 'Unit',       numeric: false },
          { key: 'l',     label: 'L',          numeric: true,  render: r => `<span style="font-weight:700;color:var(--color-warning);">${r.l}</span>` },
          { key: 'i',     label: 'I',          numeric: true,  render: r => `<span style="font-weight:700;color:var(--color-warning);">${r.i}</span>` },
          { key: 'score', label: 'Score',      numeric: true,  render: r => { const sev=getSeverity(r.l,r.i); return `<span class="risk-badge ${sev}">${r.l*r.i}</span>`; } },
          { key: 'status',label: 'Status',     numeric: false, render: r => `<span class="status-pill ${getStatusPill(r.status)}" style="font-size:var(--text-2xs);padding:2px 8px;">${getStatusLabel(r.status)}</span>` },
          { key: 'mitigationPct', label: '% Mitigasi', numeric: true, render: r => `${r.mitigationPct}%<div class="mitigation-bar" style="margin-top:4px;"><div class="mitigation-fill" style="width:${r.mitigationPct}%;background:var(--color-accent);"></div></div>` },
          { key: 'owner', label: 'Owner',      numeric: false, render: r => `<span style="font-size:var(--text-xs);">${r.owner}</span>` },
          { key: 'dueDate',label: 'Due Date',  numeric: false },
          { key: 'detail', label: '',           numeric: false, render: r => `<button class="btn btn-secondary btn-sm" onclick="window._riskFilterCell(${r.l},${r.i})"><i data-lucide="eye" style="width:14px;height:14px;"></i></button>` },
        ];
        regCont.innerHTML = SortableTable.render({ id: 'risk-register-tbl', columns: cols, paginate: 10 });
        // Ensure each risk item has a computed `score` property for column sorting
        const registerWithScore = rk.register.map(r => ({ ...r, score: r.l * r.i }));
        SortableTable.init('risk-register-tbl', { columns: cols, rows: registerWithScore, paginate: 10 });
      }

      if (window.lucide) window.lucide.createIcons();
    };

    // =========================================================
    // FASE 14 — Kontrak Manajemen helpers & init
    // =========================================================
    const switchKMTab = (tabId) => {
      document.querySelectorAll('.km-tab-pane').forEach(p => { p.hidden = true; });
      document.querySelectorAll('.km-tab-btn').forEach(b => b.classList.remove('active'));
      const pane = document.getElementById('km-tab-' + tabId);
      if (pane) pane.hidden = false;
      const btn = document.querySelector('.km-tab-btn[data-tab="' + tabId + '"]');
      if (btn) {
        btn.classList.add('active');
        btn.classList.remove('btn-ghost');
        btn.classList.add('btn-secondary');
      }
      document.querySelectorAll('.km-tab-btn:not([data-tab="' + tabId + '"])').forEach(b => {
        b.classList.remove('btn-secondary');
        b.classList.add('btn-ghost');
      });
      if (window.lucide) window.lucide.createIcons();
    };

    // =========================================================
    // KONTRAK MANAJEMEN — WORKFLOW SIMULATION (UAT-ready)
    // =========================================================
    // Holder → role mapping. Determines who can act on a pending item.
    const KM_HOLDER_ROLE_MAP = {
      'Maker':       'staff',
      'Checker-1':   'asman',
      'Checker-2':   'manajer',
      'SM':          'srmanajer',
      'GM':          'gm',
    };
    const canActOnKMItem = (item, role) => {
      if (!item || !role) return false;
      const required = KM_HOLDER_ROLE_MAP[item.holder];
      return required === role;
    };
    const nextHolderInChain = (currentHolder) => {
      const chain = ['Maker','Checker-1','Checker-2','SM','GM'];
      const i = chain.indexOf(currentHolder);
      if (i < 0 || i >= chain.length - 1) return null;
      return chain[i + 1];
    };
    const fmtKMTime = () => {
      const d = new Date();
      const pad = (n) => String(n).padStart(2,'0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    const kmActorLabel = (role) => {
      const r = ROLES[role];
      return r ? `${r.name} (${r.label})` : role;
    };
    // Apply state changes to statusBidang/statusUPMK rows when their related approval advances
    const applyKMStatusUpdate = (item, newStatus) => {
      const km = DATA.workflowKM;
      if (item.tipe === 'WF-1') {
        const row = km.statusBidang.find(b => b.bidang === item.bidangUnit);
        if (row) {
          row.status = newStatus;
          row.sla = newStatus === 'APPROVED' ? null : row.sla;
          row.updatedAt = fmtKMTime().slice(0,10);
        }
      } else if (item.tipe === 'WF-1b') {
        const row = km.statusUPMK.find(u => u.unit === item.bidangUnit);
        if (row) {
          row.status = newStatus;
          row.sla = newStatus === 'APPROVED' ? null : (newStatus === 'RETURNED' ? 'OVERDUE' : row.sla);
          row.updatedAt = fmtKMTime().slice(0,10);
        }
      }
    };
    // Core action handler — simulates approve/return/forward/resubmit
    const handleKMAction = (docId, action) => {
      const km = DATA.workflowKM;
      const idx = km.pendingApprovals.findIndex(p => p.docId === docId);
      if (idx < 0) {
        toast({ title: 'Item tidak ditemukan', message: 'Pending approval sudah diproses sebelumnya.', type: 'warning' });
        return;
      }
      const item = km.pendingApprovals[idx];
      if (!canActOnKMItem(item, state.role)) {
        toast({ title: 'Tidak ada wewenang', message: `Item ini menunggu aksi dari ${item.holder}. Anda login sebagai ${ROLES[state.role].label}.`, type: 'warning' });
        return;
      }

      const auditEntry = (act, note) => ({
        ts: fmtKMTime(),
        actor: kmActorLabel(state.role),
        action: act,
        doc: item.docId,
        note: note || '-',
      });

      if (action === 'approve' || action === 'forward') {
        const next = nextHolderInChain(item.holder);
        if (!next || action === 'approve' && item.holder === 'Checker-2') {
          // Final approve at this stage — APPROVED
          applyKMStatusUpdate(item, 'APPROVED');
          km.pendingApprovals.splice(idx, 1);
          km.auditRecent.unshift(auditEntry('APPROVED', 'Approval final pada level ' + item.holder));
          toast({ title: 'Approved', message: `${item.docId} disetujui & diteruskan ke status APPROVED.`, type: 'success' });
        } else {
          // Forward — update to next holder
          item.holder = next;
          item.action = next === 'GM' ? 'Sign-off' : (next === 'SM' ? 'Endorse & Forward' : 'Review & Forward');
          // Status reflects next reviewer
          const newStatus = next === 'Checker-1' ? 'IN_REVIEW_C1'
                          : next === 'Checker-2' ? 'IN_REVIEW_C2'
                          : next === 'SM'        ? 'IN_REVIEW_SM'
                          : next === 'GM'        ? 'IN_REVIEW_SM' // GM signing context
                          : 'IN_REVIEW_C1';
          applyKMStatusUpdate(item, newStatus);
          km.auditRecent.unshift(auditEntry('APPROVED', `Diteruskan ke ${next}`));
          toast({ title: 'Approved & Forwarded', message: `${item.docId} diteruskan ke ${next}.`, type: 'success' });
        }
      } else if (action === 'return') {
        item.holder = 'Maker';
        item.action = 'Revisi & Resubmit';
        item.slaRemain = 'OVERDUE';
        applyKMStatusUpdate(item, 'RETURNED');
        const note = window.__kmLastReturnNote || 'Dikembalikan untuk revisi';
        delete window.__kmLastReturnNote;
        km.auditRecent.unshift(auditEntry('RETURNED', note));
        toast({ title: 'Returned', message: `${item.docId} dikembalikan ke Maker untuk revisi.`, type: 'warning' });
      } else if (action === 'resubmit') {
        item.holder = 'Checker-1';
        item.action = 'Review & Forward';
        item.slaRemain = '2 HK';
        applyKMStatusUpdate(item, 'IN_REVIEW_C1');
        km.auditRecent.unshift(auditEntry('APPROVED', 'Resubmit oleh Maker setelah revisi'));
        toast({ title: 'Resubmitted', message: `${item.docId} dikirim ulang ke Checker-1.`, type: 'success' });
      }

      // Cap audit trail to 8 entries
      if (km.auditRecent.length > 8) km.auditRecent = km.auditRecent.slice(0, 8);

      // BUG-005 FIX: defer full re-render to next frame so toast renders first (better perceived perf)
      requestAnimationFrame(() => {
        if (typeof renderPlaceholder === 'function') renderPlaceholder(state.currentRoute);
      });
    };

    // Open modal showing item details before deciding
    const openKMReviewModal = (docId) => {
      const km = DATA.workflowKM;
      const item = km.pendingApprovals.find(p => p.docId === docId);
      if (!item) { toast({ title: 'Item tidak ditemukan', type: 'warning' }); return; }
      const modal = document.getElementById('km-review-modal');
      if (!modal) return;
      const canAct = canActOnKMItem(item, state.role);
      const primary = (item.action || '').toLowerCase().includes('revisi') ? 'resubmit'
                    : (item.action || '').toLowerCase().includes('forward') ? 'forward'
                    : 'approve';
      modal.querySelector('[data-km-modal-doc]').textContent = item.docId;
      modal.querySelector('[data-km-modal-tipe]').textContent = item.tipe;
      modal.querySelector('[data-km-modal-bidang]').textContent = item.bidangUnit;
      modal.querySelector('[data-km-modal-holder]').textContent = item.holder + ' (giliran: ' + (KM_HOLDER_ROLE_MAP[item.holder] ? ROLES[KM_HOLDER_ROLE_MAP[item.holder]].label : item.holder) + ')';
      modal.querySelector('[data-km-modal-deadline]').textContent = item.deadline + ' • SLA ' + item.slaRemain;
      modal.querySelector('[data-km-modal-action]').textContent = item.action;
      // Show/hide attachment row (both label and value cells share data-km-modal-attachment-row attr)
      const attachRows = modal.querySelectorAll('[data-km-modal-attachment-row]');
      const attachInfo = modal.querySelector('[data-km-modal-attachment]');
      // Reset preview panel whenever modal opens
      const previewPanel = modal.querySelector('#km-attachment-preview');
      if (previewPanel) previewPanel.hidden = true;
      // Wire up the always-on "Buka Pratinjau Dokumen" button (works with or without uploaded file)
      const previewBtn = modal.querySelector('[data-km-modal-preview-btn]');
      if (previewBtn) {
        const newBtn = previewBtn.cloneNode(true); // remove old listeners
        previewBtn.parentNode.replaceChild(newBtn, previewBtn);
        newBtn.addEventListener('click', () => previewKMAttachment(item.docId));
      }
      // Show/hide Lampiran row + render download metadata (only if real upload exists)
      if (item.attachment && attachInfo) {
        attachRows.forEach(r => r.style.display = '');
        attachInfo.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap;';
        const dlBtn = document.createElement('button');
        dlBtn.type = 'button';
        dlBtn.className = 'btn btn-sm btn-ghost';
        dlBtn.style.cssText = 'font-size:10px;padding:4px 10px;';
        dlBtn.innerHTML = '<i data-lucide="download" style="width:12px;height:12px;"></i><span>Unduh</span>';
        dlBtn.addEventListener('click', () => {
          const a = document.createElement('a');
          a.href = item.attachment.dataUrl;
          a.download = item.attachment.name;
          document.body.appendChild(a); a.click();
          setTimeout(() => a.remove(), 100);
          toast({ title: 'Lampiran diunduh', message: item.attachment.name, type: 'success', duration: 2000 });
        });
        const nameLbl = document.createElement('span');
        nameLbl.style.cssText = 'font-size:10px;color:var(--color-text-muted);';
        nameLbl.textContent = escapeHtml(item.attachment.name) + ' (' + formatFileSize(item.attachment.size) + ')';
        wrap.appendChild(dlBtn);
        wrap.appendChild(nameLbl);
        attachInfo.appendChild(wrap);
        if (typeof lucide !== 'undefined') lucide.createIcons({ el: wrap });
      } else {
        attachRows.forEach(r => r.style.display = 'none');
      }
      const note = modal.querySelector('#km-review-note');
      if (note) note.value = '';
      const actionsArea = modal.querySelector('[data-km-modal-actions]');
      // BUG-001 FIX: escape docId before injecting into onclick string
      const eDocId = escapeHtml(item.docId);
      const eRoleLbl = escapeHtml(ROLES[state.role].label);
      const eHolderLbl = escapeHtml(KM_HOLDER_ROLE_MAP[item.holder] ? ROLES[KM_HOLDER_ROLE_MAP[item.holder]].label : item.holder);
      if (canAct) {
        actionsArea.innerHTML = primary === 'resubmit' ? `
          <button class="btn btn-primary" onclick="submitKMFromModal('${eDocId}','resubmit')"><i data-lucide="send"></i><span>Resubmit</span></button>
          <button class="btn btn-ghost" data-close-modal="km-review-modal"><i data-lucide="x"></i><span>Batal</span></button>
        ` : `
          <button class="btn btn-primary" onclick="submitKMFromModal('${eDocId}','${primary}')"><i data-lucide="check"></i><span>${primary === 'forward' ? 'Approve & Forward' : 'Approve'}</span></button>
          <button class="btn btn-ghost" onclick="submitKMFromModal('${eDocId}','return')" style="color:var(--color-warning);"><i data-lucide="rotate-ccw"></i><span>Return</span></button>
          <button class="btn btn-ghost" data-close-modal="km-review-modal"><i data-lucide="x"></i><span>Batal</span></button>
        `;
        actionsArea.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', () => closeModal('km-review-modal')));
      } else {
        actionsArea.innerHTML = `
          <div style="font-size:var(--text-xs);color:var(--color-warning);padding:8px 12px;background:rgba(245,158,11,.1);border-radius:var(--radius-md);"><i data-lucide="lock" style="width:12px;height:12px;vertical-align:-2px;"></i> Read-only — bukan giliran role <strong>${eRoleLbl}</strong>. Pindah role ke <strong>${eHolderLbl}</strong> via Settings → Manajemen Peran.</div>
          <button class="btn btn-ghost" data-close-modal="km-review-modal"><i data-lucide="x"></i><span>Tutup</span></button>
        `;
        actionsArea.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', () => closeModal('km-review-modal')));
      }
      openModal('km-review-modal');
      if (window.lucide) window.lucide.createIcons();
    };
    const submitKMFromModal = (docId, action) => {
      const note = document.getElementById('km-review-note');
      if (action === 'return' && note && note.value) {
        window.__kmLastReturnNote = note.value;
      }
      closeModal('km-review-modal');
      handleKMAction(docId, action);
    };

    // === FILE UPLOAD HANDLERS for Buat Proposal ===
    // In-memory holder for the currently-selected attachment (cleared on modal close/reset)
    let __kmPendingAttachment = null;
    const KM_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const KM_ALLOWED_EXT = ['.xlsx', '.xls'];
    const KM_ALLOWED_MIME = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    const showKMUploadError = (msg) => {
      const el = document.getElementById('km-upload-error');
      if (!el) return;
      el.style.display = msg ? 'block' : 'none';
      el.textContent = msg || '';
    };
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
      return (bytes/1024/1024).toFixed(2) + ' MB';
    };
    const clearKMUpload = () => {
      __kmPendingAttachment = null;
      const fi = document.getElementById('kmFileInput');
      if (fi) fi.value = '';
      const empty = document.getElementById('km-upload-empty');
      const preview = document.getElementById('km-upload-preview');
      if (empty) empty.style.display = '';
      if (preview) preview.style.display = 'none';
      showKMUploadError('');
    };
    // Auto-fill form fields from filename pattern (WF1-2026-OMP.xlsx → WF-1 + OMP)
    const parseKMFilename = (filename) => {
      const base = filename.replace(/\.(xlsx|xls)$/i, '');
      // Pattern: WF1-2026-XXX or WF1b-2026-UPMK-X
      let match = base.match(/^WF(1b?)-(\d{4})-(.+)$/i);
      if (match) {
        const tipe = 'WF-' + match[1].toLowerCase();
        let bidangUnit = match[3].replace(/-/g, ' ').trim();
        return { tipe: tipe === 'WF-1b' ? 'WF-1b' : 'WF-1', bidangUnit };
      }
      return null;
    };
    const handleKMFileSelect = (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      showKMUploadError('');

      // Validate extension
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!KM_ALLOWED_EXT.includes(ext)) {
        showKMUploadError('Tipe file tidak didukung. Hanya .xlsx atau .xls yang diperbolehkan.');
        clearKMUpload();
        return;
      }
      // Validate MIME (browser may report empty for some xlsx)
      if (file.type && !KM_ALLOWED_MIME.includes(file.type)) {
        // Soft warning, still allow if extension valid
        console.warn('[KM Upload] MIME type unusual:', file.type, '— proceeding based on extension');
      }
      // Validate size
      if (file.size > KM_MAX_FILE_SIZE) {
        showKMUploadError(`File terlalu besar (${formatFileSize(file.size)}). Maksimal ${formatFileSize(KM_MAX_FILE_SIZE)}.`);
        clearKMUpload();
        return;
      }
      if (file.size === 0) {
        showKMUploadError('File kosong (0 byte). Silakan pilih file lain.');
        clearKMUpload();
        return;
      }

      // Read file as base64 dataURL
      const reader = new FileReader();
      reader.onload = (e) => {
        __kmPendingAttachment = {
          name: sanitizeInput(file.name, 120),
          size: file.size,
          type: file.type || 'application/octet-stream',
          lastModified: file.lastModified,
          dataUrl: e.target.result, // base64 data URL
        };
        // Update preview UI
        const empty = document.getElementById('km-upload-empty');
        const preview = document.getElementById('km-upload-preview');
        const fnEl = document.getElementById('km-upload-filename');
        const metaEl = document.getElementById('km-upload-meta');
        if (empty) empty.style.display = 'none';
        if (preview) preview.style.display = '';
        if (fnEl) fnEl.textContent = __kmPendingAttachment.name;
        if (metaEl) metaEl.textContent = formatFileSize(file.size) + ' • ' + new Date(file.lastModified).toLocaleString('id-ID');
        if (window.lucide) window.lucide.createIcons();

        // Auto-fill form from filename pattern
        const parsed = parseKMFilename(file.name);
        if (parsed) {
          const tipeEl = document.getElementById('kmTipeSel');
          const bidangEl = document.getElementById('kmBidangUnit');
          if (tipeEl) tipeEl.value = parsed.tipe;
          if (bidangEl && !bidangEl.value) bidangEl.value = parsed.bidangUnit;
          toast({ title: 'Auto-fill dari nama file', message: `Tipe: ${parsed.tipe}, Bidang/Unit: ${parsed.bidangUnit}`, type: 'info', duration: 2500 });
        }
      };
      reader.onerror = () => {
        showKMUploadError('Gagal membaca file. Coba file lain.');
        clearKMUpload();
      };
      reader.readAsDataURL(file);
    };
    window.handleKMFileSelect = handleKMFileSelect;
    window.clearKMUpload = clearKMUpload;

    // =========================================================
    // EXCEL IN-BROWSER PREVIEW — SheetJS dynamic loader
    // =========================================================
    let __xlsxLoading = false;
    let __xlsxCallbacks = [];
    const loadSheetJS = (callback) => {
      if (window.XLSX) { callback(); return; }
      __xlsxCallbacks.push(callback);
      if (__xlsxLoading) return;
      __xlsxLoading = true;
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      s.integrity = 'sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2Ga4LG0skTTLeBi97eFAXsqewJjw';
      s.crossOrigin = 'anonymous';
      s.onload = () => { __xlsxLoading = false; __xlsxCallbacks.forEach(cb => cb()); __xlsxCallbacks = []; };
      s.onerror = () => {
        __xlsxLoading = false; __xlsxCallbacks = [];
        toast({ title: 'Gagal memuat SheetJS', message: 'Periksa koneksi internet, lalu coba lagi.', type: 'error' });
      };
      document.head.appendChild(s);
    };

    // Helper: render a sheets-array as preview UI inside the panel
    const __renderKMPreviewSheets = (panel, title, sheets, sourceLabel) => {
      const tabHtml = sheets.map((s, i) => `
        <button onclick="window.__kmSwitchSheet(this,${i})" style="padding:5px 12px;font-size:10px;font-weight:600;border:none;border-bottom:2px solid ${i===0?'var(--color-accent)':'transparent'};background:${i===0?'var(--color-surface)':'transparent'};color:${i===0?'var(--color-text)':'var(--color-text-muted)'};cursor:pointer;white-space:nowrap;transition:all .15s;">${escapeHtml(s.name)}</button>`).join('');
      const sheetsHtml = sheets.map((s, i) => {
        const tableHtml = `<table style="border-collapse:collapse;width:max-content;min-width:100%;font-size:11px;">
          ${s.rows.map((row, ri) => {
            const isHeader = ri === 0;
            const tag = isHeader ? 'th' : 'td';
            return `<tr style="border-bottom:1px solid var(--color-border);">${row.map(cell => `<${tag} style="border:1px solid var(--color-border);padding:4px 10px;white-space:nowrap;${isHeader?'background:var(--color-surface-2);font-weight:700;color:var(--color-text);text-align:left;':'color:var(--color-text);'}">${escapeHtml(String(cell == null ? '' : cell))}</${tag}>`).join('')}</tr>`;
          }).join('')}
        </table>`;
        return `<div class="km-preview-sheet" style="${i===0?'':'display:none;'}overflow:auto;max-height:380px;padding:0;">${tableHtml}</div>`;
      }).join('');
      panel.innerHTML = `
        <div style="border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;">
          <div style="padding:var(--space-2) var(--space-3);background:var(--color-surface-sunken);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--color-border);gap:var(--space-2);flex-wrap:wrap;">
            <span style="font-size:10px;font-weight:700;color:var(--color-text-muted);display:flex;align-items:center;gap:6px;"><i data-lucide="file-spreadsheet" style="width:13px;height:13px;color:var(--color-success);"></i>PRATINJAU — ${escapeHtml(title)}${sourceLabel ? ` <span style="font-weight:500;color:var(--color-text-subtle);font-style:italic;">(${escapeHtml(sourceLabel)})</span>` : ''}</span>
            <button onclick="document.getElementById('km-attachment-preview').hidden=true" class="btn btn-ghost btn-sm" style="font-size:10px;padding:2px 8px;"><i data-lucide="x" style="width:12px;height:12px;"></i><span>Tutup</span></button>
          </div>
          <div style="display:flex;border-bottom:1px solid var(--color-border);background:var(--color-surface-2);overflow-x:auto;" id="km-preview-tabs">${tabHtml}</div>
          <div id="km-preview-sheets">${sheetsHtml}</div>
        </div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons({ el: panel });
    };

    // Build a synthetic Excel-like preview from in-system data when no file uploaded
    const __buildSyntheticKMPreview = (item) => {
      const km = DATA.workflowKM;
      const isUPMK = item.tipe === 'WF-1b';
      const sheets = [];
      // Sheet 1 — Header / Metadata
      sheets.push({
        name: 'Header',
        rows: [
          ['Field', 'Value'],
          ['Doc ID', item.docId],
          ['Tipe Workflow', item.tipe],
          ['Bidang / Unit', item.bidangUnit],
          ['Holder Saat Ini', item.holder],
          ['Aksi Diperlukan', item.action],
          ['Deadline', item.deadline],
          ['SLA Tersisa', item.slaRemain],
          ['Periode', km.meta.periodeAktif],
          ['Tahun', String(km.meta.tahun)],
          ['Spec Versi', km.meta.versiSpec],
        ],
      });
      // Sheet 2 — KPI catalog (KI for WF-1, UPMK for WF-1b)
      if (isUPMK) {
        const rows = [['No', 'Indikator', 'Formula', 'Satuan', 'Bobot', 'Target', 'Polarity']];
        km.kpiUPMK.forEach(k => {
          rows.push([k.no, k.indikator, k.formula, k.satuan, k.bobot, k.targetLabel, k.polarity]);
        });
        sheets.push({ name: 'KPI UPMK', rows });
      } else {
        const rows = [['No', 'Indikator', 'Satuan', 'Bobot', 'Target', 'Realisasi', 'Polarity']];
        km.kpiKantorInduk.forEach(k => {
          rows.push([k.no, k.indikator, k.satuan, k.bobot, k.target, k.realisasi, k.polarity]);
        });
        sheets.push({ name: 'KPI Kantor Induk', rows });
      }
      // Sheet 3 — Status grid related to this item type
      if (isUPMK) {
        const rows = [['Unit', 'Manager UPMK', 'Status', 'MW', 'KMS', 'MVA']];
        km.statusUPMK.forEach(u => rows.push([u.unit, u.mgrUPMK, u.status, u.kapasitas.mw, u.kapasitas.kms, u.kapasitas.mva]));
        sheets.push({ name: 'Status UPMK I-V', rows });
      } else {
        const rows = [['Bidang', 'Peran', 'Maker', 'Status', 'SLA']];
        km.statusBidang.forEach(b => rows.push([b.bidang, b.peran, b.maker, b.status, b.sla || '—']));
        sheets.push({ name: 'Status Bidang KI', rows });
      }
      // Sheet 4 — Known issues
      if (km.knownIssues && km.knownIssues.length) {
        const rows = [['ID', 'Severity', 'Deskripsi', 'Status', 'Fix Plan']];
        km.knownIssues.forEach(iss => rows.push([iss.id, iss.severity, iss.desc, iss.status, iss.fix]));
        sheets.push({ name: 'Known Issues', rows });
      }
      return sheets;
    };

    const previewKMAttachment = (docId) => {
      const item = DATA.workflowKM.pendingApprovals.find(p => p.docId === docId);
      if (!item) {
        toast({ title: 'Item tidak ditemukan', message: 'Pending approval sudah diproses.', type: 'warning' });
        return;
      }
      const panel = document.getElementById('km-attachment-preview');
      if (!panel) return;
      panel.hidden = false;
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // === BRANCH 1: Real uploaded file → parse via SheetJS ===
      if (item.attachment && item.attachment.dataUrl) {
        panel.innerHTML = `<div style="padding:var(--space-5);text-align:center;color:var(--color-text-muted);"><i data-lucide="loader-2" style="width:20px;height:20px;display:inline-block;"></i><div style="margin-top:8px;font-size:var(--text-xs);">Memuat SheetJS &amp; mem-parsing Excel...</div></div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons({ el: panel });
        loadSheetJS(() => {
          try {
            const base64 = item.attachment.dataUrl.split(',')[1];
            if (!base64) throw new Error('Data file kosong atau format tidak valid.');
            const wb = window.XLSX.read(base64, { type: 'base64' });
            const sheetNames = wb.SheetNames;
            if (!sheetNames.length) throw new Error('Workbook tidak memiliki sheet.');
            const sheets = sheetNames.map(name => {
              const ws = wb.Sheets[name];
              const range = window.XLSX.utils.decode_range(ws['!ref'] || 'A1');
              const rows = [];
              for (let R = range.s.r; R <= range.e.r; R++) {
                const row = [];
                for (let C = range.s.c; C <= range.e.c; C++) {
                  const cell = ws[window.XLSX.utils.encode_cell({ r: R, c: C })];
                  row.push(cell ? window.XLSX.utils.format_cell(cell) : '');
                }
                rows.push(row);
              }
              return { name, rows };
            });
            __renderKMPreviewSheets(panel, item.attachment.name, sheets, 'file Excel asli');
          } catch(err) {
            panel.innerHTML = `<div style="padding:var(--space-4);text-align:center;font-size:var(--text-xs);"><span style="color:var(--color-danger);font-weight:600;">Gagal mem-parsing file Excel</span><div style="color:var(--color-text-muted);margin-top:4px;">${escapeHtml(err.message)}</div><button onclick="document.getElementById('km-attachment-preview').hidden=true" class="btn btn-ghost btn-sm" style="margin-top:8px;font-size:10px;">Tutup</button></div>`;
          }
        });
        return;
      }

      // === BRANCH 2: No real file → render synthetic preview from in-system data ===
      const sheets = __buildSyntheticKMPreview(item);
      const title = item.docId + '.xlsx';
      __renderKMPreviewSheets(panel, title, sheets, 'data sistem — belum ada file dilampirkan');
    };
    window.previewKMAttachment = previewKMAttachment;

    // Direct download from pending card — works with real upload OR generates synthetic XLSX
    const downloadKMAttachment = (docId) => {
      const item = DATA.workflowKM.pendingApprovals.find(p => p.docId === docId);
      if (!item) {
        toast({ title: 'Item tidak ditemukan', message: 'Pending approval sudah diproses.', type: 'warning' });
        return;
      }
      // Branch 1: real uploaded file → use dataUrl directly
      if (item.attachment && item.attachment.dataUrl) {
        const a = document.createElement('a');
        a.href = item.attachment.dataUrl;
        a.download = item.attachment.name;
        document.body.appendChild(a); a.click();
        setTimeout(() => a.remove(), 100);
        toast({ title: 'Lampiran diunduh', message: item.attachment.name, type: 'success', duration: 2000 });
        return;
      }
      // Branch 2: no real file → generate synthetic XLSX using SheetJS
      toast({ title: 'Membuat file Excel...', message: 'Memuat SheetJS dan menyusun workbook.', type: 'info', duration: 1500 });
      loadSheetJS(() => {
        try {
          const sheets = __buildSyntheticKMPreview(item);
          const wb = window.XLSX.utils.book_new();
          sheets.forEach(s => {
            const ws = window.XLSX.utils.aoa_to_sheet(s.rows);
            // Auto-size columns based on max content length per column
            const cols = s.rows[0].map((_, i) => ({
              wch: Math.min(60, Math.max(...s.rows.map(r => String(r[i] == null ? '' : r[i]).length + 2)))
            }));
            ws['!cols'] = cols;
            // Sanitize sheet name (xlsx max 31 chars, no special chars)
            const safeName = s.name.replace(/[\\\/\*\?\[\]:]/g, '').slice(0, 31);
            window.XLSX.utils.book_append_sheet(wb, ws, safeName);
          });
          const filename = item.docId + '.xlsx';
          window.XLSX.writeFile(wb, filename);
          toast({ title: 'File berhasil diunduh', message: filename + ' (synthetic dari data sistem)', type: 'success', duration: 2500 });
        } catch(err) {
          toast({ title: 'Gagal membuat file', message: err.message, type: 'error' });
        }
      });
    };
    window.downloadKMAttachment = downloadKMAttachment;

    // Switch sheet tabs inside the preview panel
    window.__kmSwitchSheet = (btn, idx) => {
      const tabs = document.getElementById('km-preview-tabs');
      const sheets = document.getElementById('km-preview-sheets');
      if (!tabs || !sheets) return;
      tabs.querySelectorAll('button').forEach((b, i) => {
        const active = i === idx;
        b.style.borderBottomColor = active ? 'var(--color-accent)' : 'transparent';
        b.style.background = active ? 'var(--color-surface)' : 'transparent';
        b.style.color = active ? 'var(--color-text)' : 'var(--color-text-muted)';
      });
      sheets.querySelectorAll('.km-preview-sheet').forEach((el, i) => {
        el.style.display = i === idx ? '' : 'none';
      });
    };

    // Buat Proposal — modal form to add a new pending approval
    const openKMCreateProposalModal = () => {
      const modal = document.getElementById('km-create-modal');
      if (!modal) return;
      // Reset form
      const form = modal.querySelector('#km-create-form');
      if (form) form.reset();
      // Reset attachment state
      clearKMUpload();
      openModal('km-create-modal');
      if (window.lucide) window.lucide.createIcons();
    };
    const submitKMCreateProposal = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      const km = DATA.workflowKM;
      const f = document.getElementById('km-create-form');
      if (!f) return;
      // BUG-001 FIX: sanitize input on write (defense in depth) — strip HTML/control chars + length limit
      const tipe = sanitizeInput(f.elements['kmTipe'].value, 10);
      const bidangUnit = sanitizeInput(f.elements['kmBidangUnit'].value, 60);
      const peran = sanitizeInput(f.elements['kmPeran'].value, 80);
      const deadline = sanitizeInput(f.elements['kmDeadline'].value, 12) || '2026-05-15';
      // Whitelist tipe to known values
      if (!['WF-1','WF-1b'].includes(tipe)) { toast({ title:'Tipe tidak valid', type:'warning' }); return; }
      // Validate bidangUnit: only alphanumeric, space, hyphen, slash, & dot allowed (no HTML/script chars)
      if (!bidangUnit) { toast({ title: 'Validasi gagal', message: 'Bidang/Unit wajib diisi.', type: 'warning' }); return; }
      if (!/^[A-Za-z0-9\s\-\/&.()]+$/.test(bidangUnit)) {
        toast({ title:'Karakter tidak valid', message:'Bidang/Unit hanya boleh huruf, angka, spasi, dan -/&.()', type:'warning' });
        return;
      }

      // Generate doc ID
      const yymm = new Date().toISOString().slice(2,7).replace('-','');
      const seq = (km.pendingApprovals.length + 1).toString().padStart(2,'0');
      const docId = `${tipe}-${yymm}-${bidangUnit.replace(/\s+/g,'').toUpperCase().slice(0,6)}-${seq}`;

      const newItem = {
        docId, tipe, bidangUnit,
        holder: 'Checker-1',
        deadline,
        slaRemain: '3 HK',
        action: 'Review & Forward',
        attachment: __kmPendingAttachment ? { ...__kmPendingAttachment } : null,
      };
      km.pendingApprovals.unshift(newItem);
      // Clear attachment buffer after successful submit
      __kmPendingAttachment = null;

      // Push status row if WF-1 / WF-1b new bidang/unit
      if (tipe === 'WF-1' && !km.statusBidang.some(b => b.bidang === bidangUnit)) {
        km.statusBidang.push({ bidang: bidangUnit, peran: peran || 'Bidang Baru', maker: ROLES[state.role].name, status: 'IN_REVIEW_C1', sla: '3 HK', updatedAt: fmtKMTime().slice(0,10) });
      }
      if (tipe === 'WF-1b' && !km.statusUPMK.some(u => u.unit === bidangUnit)) {
        km.statusUPMK.push({ unit: bidangUnit, mgrUPMK: ROLES[state.role].name, status: 'IN_REVIEW_C1', sla: '3 HK', updatedAt: fmtKMTime().slice(0,10), kapasitas: { mw:0, kms:0, mva:0 } });
      }

      const attachNote = newItem.attachment ? ` (lampiran: ${newItem.attachment.name}, ${formatFileSize(newItem.attachment.size)})` : '';
      km.auditRecent.unshift({
        ts: fmtKMTime(),
        actor: kmActorLabel(state.role),
        action: 'APPROVED',
        doc: docId,
        note: 'Proposal baru disubmit oleh Maker' + attachNote,
      });
      if (km.auditRecent.length > 8) km.auditRecent = km.auditRecent.slice(0, 8);

      closeModal('km-create-modal');
      toast({ title: 'Proposal Dibuat', message: `${escapeHtml(docId)} disubmit ke Checker-1.`, type: 'success' });
      // BUG-005 FIX: deferred render
      requestAnimationFrame(() => {
        if (typeof renderPlaceholder === 'function') renderPlaceholder(state.currentRoute);
      });
    };

    // Export Kontrak Manajemen report — uses window.print() with print stylesheet
    const exportKMReport = () => {
      toast({ title: 'Export Kontrak Manajemen', message: 'Buka dialog print — pilih "Save as PDF" untuk download.', type: 'info', duration: 2500 });
      setTimeout(() => window.print(), 400);
    };

    // Expose KM workflow handlers to inline onclick attributes (defensive)
    window.handleKMAction = handleKMAction;
    window.openKMReviewModal = openKMReviewModal;
    window.submitKMFromModal = submitKMFromModal;
    window.openKMCreateProposalModal = openKMCreateProposalModal;
    window.submitKMCreateProposal = submitKMCreateProposal;
    window.exportKMReport = exportKMReport;
    window.canActOnKMItem = canActOnKMItem;

    const initWorkflowKM = () => {
      const km = DATA.workflowKM;

      const calcCapaian = (k) => {
        if (k.bobot < 0) return null;
        if (k.polarity === 'LOWER_IS_BETTER') return k.realisasi === 0 ? 100 : Math.min(100, (k.target / k.realisasi) * 100);
        return k.target === 0 ? 100 : Math.min(100, (k.realisasi / k.target) * 100);
      };
      const getStatusKPI = (pct) => {
        if (pct === null) return null;
        if (pct >= 100) return { lbl:'Tercapai',    cls:'completed'     };
        if (pct >= 85)  return { lbl:'On Track',    cls:'in-review'     };
        if (pct >= 70)  return { lbl:'At Risk',     cls:'needs-revision'};
        return                  { lbl:'Below Target',cls:'needs-revision'};
      };

      const kiContainer = document.getElementById('km-kpi-ki-container');
      if (kiContainer) {
        const cols = [
          { key:'no',        label:'No',        numeric:false, render: r => `<code style="font-size:10px;color:var(--color-accent);">${r.no}</code>` },
          { key:'indikator', label:'Indikator',  numeric:false, render: r => `<span style="font-size:var(--text-xs);font-weight:${r.bobot<0?'400':'600'};max-width:220px;display:block;">${r.indikator}</span>` },
          { key:'satuan',    label:'Satuan',     numeric:false, render: r => `<span style="font-size:var(--text-xs);">${r.satuan}</span>` },
          { key:'bobot',     label:'Bobot',      numeric:true,  render: r => `<span style="font-weight:700;color:${r.bobot<0?'var(--color-danger)':'var(--color-accent)'};">${r.bobot}</span>` },
          { key:'target',    label:'Target',     numeric:true,  render: r => `<span style="font-size:var(--text-xs);">${r.bobot<0?'—':r.target.toLocaleString('id-ID')}</span>` },
          { key:'realisasi', label:'Realisasi',  numeric:true,  render: r => `<span style="font-size:var(--text-xs);font-weight:600;">${r.realisasi.toLocaleString('id-ID')}</span>` },
          { key:'capaian',   label:'Capaian %',  numeric:true,  render: r => {
            const pct = r._capaian;
            if (pct === null) return `<span style="font-size:var(--text-xs);color:var(--color-text-muted);">${r.realisasi < 0 ? r.realisasi + ' poin' : '—'}</span>`;
            const bar = `<div style="height:3px;background:var(--color-surface-2);border-radius:2px;margin-top:3px;"><div style="height:3px;width:${pct}%;background:${pct>=100?'var(--color-success)':pct>=85?'var(--color-accent)':'var(--color-danger)'};border-radius:2px;"></div></div>`;
            return `<span style="font-size:var(--text-xs);font-weight:700;">${pct.toFixed(1)}%</span>${bar}`;
          }},
          { key:'status',    label:'Status',     numeric:false, render: r => {
            if (r._statusKPI === null) return r.realisasi < 0 ? `<span class="status-pill needs-revision" style="font-size:10px;padding:2px 6px;">Pengurang</span>` : '';
            return `<span class="status-pill ${r._statusKPI.cls}" style="font-size:10px;padding:2px 6px;">${r._statusKPI.lbl}</span>`;
          }},
        ];
        const rows = km.kpiKantorInduk.map(k => {
          const pct = calcCapaian(k);
          return { ...k, _capaian: pct, _statusKPI: getStatusKPI(pct) };
        });
        kiContainer.innerHTML = SortableTable.render({ id:'km-kpi-ki-tbl', columns:cols });
        SortableTable.init('km-kpi-ki-tbl', { columns:cols, rows });
      }

      // — KPI/PI Matrix (14 indikator dari DATA.operational) —
      const piContainer = document.getElementById('km-kpi-pi-container');
      if (piContainer) {
        const statusPill = (s) => ({ success:'completed', danger:'needs-revision', warning:'needs-revision' }[s] || 'draft');
        const statusLbl  = (s) => ({ success:'Tercapai', danger:'Bermasalah', warning:'Perhatian' }[s] || s);
        const piCols = [
          { key:'no',          label:'No',       numeric:true,  render: r => `<span style="font-size:var(--text-xs);font-weight:700;color:var(--color-text-muted);">${r.no}</span>` },
          { key:'category',    label:'Kat',      numeric:false, render: r => `<span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:var(--radius-full);background:${r.category==='KPI'?'rgba(0,191,216,.15)':'rgba(59,130,246,.15)'};color:${r.category==='KPI'?'var(--color-accent)':'var(--color-info,#3b82f6)'};">${r.category}</span>` },
          { key:'name',        label:'Indikator',numeric:false, render: r => `<span style="font-size:var(--text-xs);font-weight:600;max-width:240px;display:block;" title="${r.name}">${r.name}</span>` },
          { key:'bu',          label:'Bidang',   numeric:false, render: r => `<span style="font-size:10px;color:var(--color-text-muted);">${r.bu}</span>` },
          { key:'bobot',       label:'Bobot',    numeric:true,  render: r => `<span style="font-weight:700;color:var(--color-accent);">${r.bobot}</span>` },
          { key:'target',      label:'Target',   numeric:true,  render: r => `<span style="font-size:var(--text-xs);">${r.target.toLocaleString('id-ID')} ${r.unit}</span>` },
          { key:'actual',      label:'Realisasi',numeric:true,  render: r => `<span style="font-size:var(--text-xs);font-weight:600;">${r.actual.toLocaleString('id-ID')} ${r.unit}</span>` },
          { key:'achievement', label:'Capaian%', numeric:true,  render: r => {
            const pct = Math.min(r.achievement, 110);
            const barClr = pct >= 100 ? 'var(--color-success)' : pct >= 85 ? 'var(--color-accent)' : 'var(--color-danger)';
            return `<div style="min-width:80px;"><span style="font-size:var(--text-xs);font-weight:700;">${r.achievement.toFixed(2)}%</span><div style="height:3px;background:var(--color-surface-2);border-radius:2px;margin-top:3px;"><div style="height:3px;width:${pct}%;background:${barClr};border-radius:2px;"></div></div></div>`;
          }},
          { key:'nilai',       label:'Nilai',    numeric:true,  render: r => `<span style="font-size:var(--text-xs);font-weight:700;color:var(--color-accent);">${r.nilai.toFixed(2)}</span>` },
          { key:'status',      label:'Status',   numeric:false, render: r => `<span class="status-pill ${statusPill(r.status)}" style="font-size:10px;padding:2px 6px;">${statusLbl(r.status)}</span>` },
          { key:'commentary',  label:'Analisa',  numeric:false, render: r => `<span style="font-size:10px;color:var(--color-text-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-width:200px;" title="${r.commentary}">${r.commentary}</span>` },
        ];
        const piRows = DATA.operational.kpis.map(k => ({ ...k }));
        piContainer.innerHTML = SortableTable.render({ id:'km-kpi-pi-tbl', columns:piCols, paginate:14 });
        SortableTable.init('km-kpi-pi-tbl', { columns:piCols, rows:piRows, paginate:14 });
      }

      document.querySelectorAll('[data-animate-number]').forEach(el => Components.animateNumber(el, { duration: 800 }));

      // — Tambah tombol minimize ke setiap kartu di halaman KM —
      document.querySelectorAll('.card').forEach((card, idx) => {
        const header = card.querySelector(':scope > .card-header');
        const body   = card.querySelector(':scope > .card-body');
        if (!header || !body) return;

        const bodyId = 'km-body-' + idx;
        body.id = bodyId;

        // Tambahkan transisi smooth
        body.style.overflow = 'hidden';
        body.style.transition = 'max-height .28s ease, opacity .2s ease';
        body.style.maxHeight  = body.scrollHeight + 'px';
        body.style.opacity    = '1';

        // Buat tombol toggle (chevron)
        const btn = document.createElement('button');
        btn.className   = 'icon-btn';
        btn.title       = 'Ciutkan / Perluas';
        btn.dataset.kmToggle = bodyId;
        btn.style.cssText = [
          'margin-left:var(--space-3)',
          'flex-shrink:0',
          'width:28px','height:28px',
          'border-radius:var(--radius-sm)',
          'display:flex','align-items:center','justify-content:center',
          'background:var(--color-surface-2)',
          'border:1px solid var(--color-border)',
          'cursor:pointer',
          'transition:background .15s',
        ].join(';');
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition:transform .25s;"><polyline points="18 15 12 9 6 15"></polyline></svg>`;

        btn.addEventListener('mouseenter', () => btn.style.background = 'var(--color-surface-hover)');
        btn.addEventListener('mouseleave', () => btn.style.background = 'var(--color-surface-2)');

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const target = document.getElementById(btn.dataset.kmToggle);
          if (!target) return;
          const isCollapsed = target.dataset.kmCollapsed === '1';
          const svg = btn.querySelector('svg');
          if (isCollapsed) {
            // Buka kembali
            target.style.maxHeight  = target.scrollHeight + 'px';
            target.style.opacity    = '1';
            target.dataset.kmCollapsed = '0';
            if (svg) svg.style.transform = 'rotate(0deg)';
            // Reset max-height setelah animasi selesai agar konten dinamis bisa tumbuh
            target.addEventListener('transitionend', function h() {
              if (target.dataset.kmCollapsed === '0') target.style.maxHeight = 'none';
              target.removeEventListener('transitionend', h);
            });
          } else {
            // Ciutkan: kunci dulu ke tinggi saat ini lalu ke 0
            target.style.maxHeight  = target.scrollHeight + 'px';
            target.style.opacity    = '1';
            requestAnimationFrame(() => {
              target.style.maxHeight  = '0';
              target.style.opacity    = '0';
            });
            target.dataset.kmCollapsed = '1';
            if (svg) svg.style.transform = 'rotate(180deg)';
          }
        });

        // Jadikan card-header layout flex agar tombol rata kanan
        header.style.display     = header.style.display || 'flex';
        header.style.alignItems  = 'center';
        header.style.flexWrap    = 'wrap';
        header.appendChild(btn);
      });


      // ── WF-3 trajectory + unit charts (only rendered when realisasi phase) ──
      const trajEl = document.getElementById('wf3-trajectory-chart');
      if (trajEl && window.Chart) {
        const t = chartTheme();
        const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        const targetLine  = Array(12).fill(100);
        // Synthetic monthly realisasi curve based on seed data (gradual ramp)
        const realisasiLine = [97.2, 103.9, null, null, null, null, null, null, null, null, null, null];
        const projLine      = [null, 103.9, 104.5, 105.0, 104.8, 105.2, 104.9, 105.1, 105.0, 104.7, 105.0, 105.2];
        new Chart(trajEl, {
          type: 'line',
          data: {
            labels: months,
            datasets: [
              { label: 'Target (100)', data: targetLine, borderColor: t.border, borderDash: [4,4], borderWidth: 1.5, pointRadius: 0, fill: false },
              { label: 'Realisasi Aktual', data: realisasiLine, borderColor: t.accent, borderWidth: 2.5, pointRadius: 5, pointBackgroundColor: t.accent, fill: false, spanGaps: false },
              { label: 'Proyeksi', data: projLine, borderColor: t.info || '#03a2b8', borderDash: [6,3], borderWidth: 1.5, pointRadius: 3, pointBackgroundColor: t.info || '#03a2b8', fill: false, spanGaps: true },
            ]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, labels: { color: t.text, font: { size: 11 } } }, tooltip: { mode: 'index', intersect: false } },
            scales: {
              x: { grid: { color: t.grid }, ticks: { color: t.muted, font: { size: 11 } } },
              y: { min: 85, max: 115, grid: { color: t.grid }, ticks: { color: t.muted, font: { size: 11 }, callback: v => v + '' } }
            }
          }
        });
      }

      const unitEl = document.getElementById('wf3-unit-chart');
      if (unitEl && window.Chart) {
        const t = chartTheme();
        const units  = ['UPMK I','UPMK II','UPMK III','UPMK IV','UPMK V'];
        const scores = DATA.operational.buComparison.rows.slice(1).map(r => r.values[0]);
        const colors = scores.map(s => s >= 100 ? 'rgba(70,189,13,0.8)' : s >= 95 ? 'rgba(251,168,6,0.8)' : 'rgba(236,28,36,0.8)');
        new Chart(unitEl, {
          type: 'bar',
          data: {
            labels: units,
            datasets: [
              { label: 'Skor KM', data: scores, backgroundColor: colors, borderRadius: 4 },
              { label: 'Target 100', data: Array(5).fill(100), type: 'line', borderColor: t.accent, borderDash: [4,4], borderWidth: 2, pointRadius: 0, fill: false }
            ]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, labels: { color: t.text, font: { size: 11 } } }, tooltip: { mode: 'index', intersect: false } },
            scales: {
              x: { grid: { color: t.grid }, ticks: { color: t.muted } },
              y: { min: 80, max: 115, grid: { color: t.grid }, ticks: { color: t.muted, callback: v => v + '' } }
            }
          }
        });
      }

      if (window.lucide) window.lucide.createIcons();
    };

    // Dispatch table — pages with full visual implementation
    const PAGE_INIT = {
      'executive-summary': () => initExecutiveSummary(),
      'financial':         () => initFinancial(),
      'operational':       () => initOperational(),
      'strategic':         () => initStrategic(),
      'human-capital':     () => initHumanCapital(),
      'approvals':         () => initApprovals(),
      'settings':          () => initSettings(),
      'risk':              () => initRisk(),
      'workflow-km':            () => initWorkflowKM(),
      'workflow-km-usulan':     () => initWorkflowKM(),
      'workflow-km-realisasi':  () => initWorkflowKM(),

    };

    // Pages that have full visual implementation (skip "construction" placeholder)
    const PAGES_READY = new Set(['executive-summary', 'financial', 'operational', 'strategic', 'human-capital', 'settings', 'approvals', 'risk', 'workflow-km', 'workflow-km-usulan', 'workflow-km-realisasi']);

    const handleRoute = () => {
      let hash = window.location.hash.slice(1) || 'executive-summary';
      // Backward compat: legacy #workflow-km → redirect to #workflow-km-usulan
      if (hash === 'workflow-km') {
        window.location.hash = '#workflow-km-usulan';
        return; // hashchange will fire again
      }
      const route = ROUTES[hash] ? hash : 'executive-summary';
      state.currentRoute = route;
      renderPlaceholder(route);
    };
    window.addEventListener('hashchange', handleRoute);

    // =========================================================
    // INIT
    // =========================================================
    applyTheme();
    setupChartDefaults();
    SlideDrawer._initListeners();
    if (window.lucide) window.lucide.createIcons();
    buildRoleSwitcher('role-switcher-list-topbar');
    buildRoleSwitcher('role-switcher-list-usermenu');
    updateRoleUI();
    renderNotifications();
    renderSearchResults('');
    handleRoute();

    // =========================================================
    // AUTH GATE — Login screen logic
    // =========================================================
    // BUG-006 FIX: Replace plaintext passwords with SHA-256 hash (defense in depth for demo).
    // Production MUST migrate to server-side auth with bcrypt/Argon2 + salting.
    // Demo password is documented separately in side-panel "Akun Demo" UI for ease of testing.
    const AUTH_USERS = [
      { email: 'gm@pln.co.id',          pwdHash: '83a854fa14ff2717da84fe67cfa7fb32386fac38338fc0852883e92e9748b1a5', role: 'gm',        name: 'General Manager PUSMANPRO',  initials: 'GM' },
      { email: 'srmanajer@pln.co.id',    pwdHash: '83a854fa14ff2717da84fe67cfa7fb32386fac38338fc0852883e92e9748b1a5', role: 'sr_manajer',name: 'Senior Manajer Bidang',      initials: 'SM' },
      { email: 'manajer@pln.co.id',      pwdHash: '83a854fa14ff2717da84fe67cfa7fb32386fac38338fc0852883e92e9748b1a5', role: 'manajer',   name: 'Manajer Bidang',             initials: 'MB' },
      { email: 'asman@pln.co.id',        pwdHash: '83a854fa14ff2717da84fe67cfa7fb32386fac38338fc0852883e92e9748b1a5', role: 'asman',     name: 'Asisten Manajer',            initials: 'AM' },
      { email: 'staff@pln.co.id',        pwdHash: '83a854fa14ff2717da84fe67cfa7fb32386fac38338fc0852883e92e9748b1a5', role: 'staff',     name: 'Staff Officer',              initials: 'SO' },
    ];
    // SHA-256 hashing helper (Web Crypto API)
    const sha256Hex = async (str) => {
      const buf = new TextEncoder().encode(str);
      const hash = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
    };

    // Map AUTH role key → ROLES key
    const AUTH_ROLE_MAP = {
      'gm': 'gm', 'sr_manajer': 'srmanajer', 'manajer': 'manajer', 'asman': 'asman', 'staff': 'staff',
    };

    const lsEl      = document.getElementById('login-screen');
    const lsForm    = document.getElementById('login-form');
    const lsEmail   = document.getElementById('login-email');
    const lsPass    = document.getElementById('login-password');
    const lsErr     = document.getElementById('login-error');
    const lsErrTxt  = document.getElementById('login-error-text');
    const lsBtn     = document.getElementById('login-btn');
    const lsBtnTxt  = document.getElementById('login-btn-text');
    const lsSpinner = document.getElementById('login-spinner');
    const lsBtnIco  = document.getElementById('login-btn-icon');

    const showAuthError = (msg) => {
      lsErrTxt.textContent = msg;
      lsErr.classList.add('visible');
      lsEmail.classList.add('error');
      lsPass.classList.add('error');
    };
    const clearAuthError = () => {
      lsErr.classList.remove('visible');
      lsEmail.classList.remove('error');
      lsPass.classList.remove('error');
    };

    const revealDashboard = (user) => {
      const roleKey = AUTH_ROLE_MAP[user.role] || 'staff';
      // Patch ROLES entry with actual user name/initials/email
      if (ROLES[roleKey]) {
        ROLES[roleKey].name     = user.name;
        ROLES[roleKey].initials = user.initials;
        ROLES[roleKey].email    = user.email;
      }
      // Set role state directly (bypass setRole toast — login welcome toast handles feedback)
      state.role = roleKey;
      updateRoleUI();
      if (typeof renderPlaceholder === 'function') renderPlaceholder(state.currentRoute);
      // Fade out login screen
      lsEl.style.transition = 'opacity 0.45s cubic-bezier(.4,0,.2,1), transform 0.45s cubic-bezier(.4,0,.2,1)';
      lsEl.style.opacity    = '0';
      lsEl.style.transform  = 'scale(1.03)';
      setTimeout(() => { lsEl.style.display = 'none'; }, 460);
      // Welcome toast after dashboard is visible
      setTimeout(() => {
        const pending = getPendingApprovalsForRole(state.role).length;
        toast({
          title: `Selamat datang, ${user.name.split(',')[0]}`,
          message: `Login sebagai ${ROLES[roleKey].label}. ${pending > 0 ? pending + ' laporan menunggu aksi Anda.' : 'Total Nilai Kinerja Februari 2026: 103,87 (Baik).'}`,
          type: 'success', duration: 6000,
        });
      }, 500);
    };

    const doLogout = () => {
      sessionStorage.removeItem('pln_auth');
      lsEmail.value = '';
      lsPass.value  = '';
      clearAuthError();
      lsBtn.disabled = false;
      lsBtnTxt.textContent = 'Masuk ke Dashboard';
      lsBtn.classList.remove('loading');
      // Show login screen with fade-in
      lsEl.style.display    = 'flex';
      lsEl.style.opacity    = '0';
      lsEl.style.transform  = 'scale(0.97)';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        lsEl.style.transition = 'opacity 0.4s cubic-bezier(.4,0,.2,1), transform 0.4s cubic-bezier(.4,0,.2,1)';
        lsEl.style.opacity    = '1';
        lsEl.style.transform  = 'scale(1)';
      }));
      setTimeout(() => lsEmail.focus(), 420);
    };

    // Wire logout button
    document.querySelectorAll('[data-action="logout"]').forEach(el => {
      el.addEventListener('click', () => { closeAllDropdowns(); doLogout(); });
    });

    // Password eye toggle
    document.getElementById('login-eye').addEventListener('click', function() {
      const show = lsPass.type === 'password';
      lsPass.type = show ? 'text' : 'password';
      this.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
      const ico = this.querySelector('i');
      if (ico) { ico.setAttribute('data-lucide', show ? 'eye-off' : 'eye'); if (window.lucide) window.lucide.createIcons(); }
    });

    // Credential hint toggle (optional — side-panel layout has no toggle)
    const hintToggle = document.getElementById('login-hint-toggle');
    const hintBody   = document.getElementById('login-hint-body');
    if (hintToggle && hintBody) {
      hintToggle.addEventListener('click', () => {
        const open = hintBody.classList.toggle('open');
        hintToggle.classList.toggle('open', open);
        hintToggle.setAttribute('aria-expanded', String(open));
      });
    }

    // Role icon mapping for side panel
    const ROLE_ICON = { gm: 'crown', srmanajer: 'star', manajer: 'briefcase', asman: 'user-cog', staff: 'user' };
    const ROLE_LEVEL = { gm: 'L5', srmanajer: 'L4', manajer: 'L3', asman: 'L2', staff: 'L1' };

    // Helper: autofill form from a credential entry
    const autofillCred = (email, password) => {
      lsEmail.value = email;
      lsPass.value  = password;
      clearAuthError();
      // visual feedback: briefly highlight the email field
      lsEmail.style.borderColor = 'rgba(0,191,216,0.7)';
      setTimeout(() => { lsEmail.style.borderColor = ''; }, 700);
      lsPass.focus();
    };

    // ① Populate side-panel items (#login-cred-items)
    const credItems = document.getElementById('login-cred-items');
    if (credItems) {
      AUTH_USERS.forEach(u => {
        const roleKey   = AUTH_ROLE_MAP[u.role] || u.role;
        const roleLabel = ROLES[roleKey] ? ROLES[roleKey].label : u.role;
        const icon      = ROLE_ICON[roleKey] || 'user';
        const level     = ROLE_LEVEL[roleKey] || '';
        const item = document.createElement('div');
        item.className = 'login-cred-item';
        item.title = `Klik untuk masuk sebagai ${roleLabel}`;
        item.innerHTML = `
          <div class="login-cred-item-role"><i data-lucide="${icon}"></i>${roleLabel}</div>
          <div class="login-cred-item-email">${u.email}</div>
          <span class="login-cred-item-badge">${level} &middot; ${u.name.split(',')[0]}</span>`;
        item.addEventListener('click', () => autofillCred(u.email, u.password));
        credItems.appendChild(item);
      });
      if (window.lucide) window.lucide.createIcons();
    }

    // ② Populate fallback table inside card (#login-cred-rows, <1181px)
    const credRows = document.getElementById('login-cred-rows');
    if (credRows) {
      AUTH_USERS.forEach(u => {
        const roleKey   = AUTH_ROLE_MAP[u.role] || u.role;
        const roleLabel = ROLES[roleKey] ? ROLES[roleKey].label : u.role;
        const tr = document.createElement('tr');
        tr.title = 'Klik untuk mengisi otomatis';
        tr.innerHTML = `<td><code>${u.email}</code></td><td><code>${u.password}</code></td><td class="login-cred-role">${roleLabel}</td>`;
        tr.addEventListener('click', () => autofillCred(u.email, u.password));
        credRows.appendChild(tr);
      });
    }

    // Form submit
    // BUG-001/006 FIX: Brute-force throttling state (in-memory)
    const __authThrottle = { failedCount: 0, lockedUntil: 0 };
    const __MAX_ATTEMPTS = 5;
    const __LOCK_MS = 30000; // 30 seconds lock after 5 failed attempts

    lsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAuthError();

      // BUG-001/006 FIX: brute force protection
      if (__authThrottle.lockedUntil > Date.now()) {
        const remain = Math.ceil((__authThrottle.lockedUntil - Date.now()) / 1000);
        showAuthError(`Terlalu banyak percobaan gagal. Coba lagi dalam ${remain} detik.`);
        return;
      }

      const email    = sanitizeInput(lsEmail.value.trim().toLowerCase(), 100);
      const password = lsPass.value; // do not sanitize password (preserve special chars)
      if (!email)    { showAuthError('Alamat email wajib diisi.'); lsEmail.focus(); return; }
      if (!password) { showAuthError('Kata sandi wajib diisi.'); lsPass.focus(); return; }
      // Email format basic check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAuthError('Format email tidak valid.'); lsEmail.focus(); return;
      }

      // Show loading state
      lsBtn.disabled = true;
      lsBtn.classList.add('loading');
      lsBtnTxt.textContent = 'Memverifikasi...';

      // Hash password client-side (defense in depth — no plaintext in source)
      let pwdHash;
      try {
        pwdHash = await sha256Hex(password);
      } catch (err) {
        showAuthError('Browser tidak mendukung hash. Update browser Anda.');
        lsBtn.disabled = false; lsBtn.classList.remove('loading');
        lsBtnTxt.textContent = 'Masuk ke Dashboard';
        return;
      }

      // Constant-ish delay to defeat timing attack
      await new Promise(r => setTimeout(r, 700));

      const user = AUTH_USERS.find(u => u.email === email && u.pwdHash === pwdHash);
      if (user) {
        __authThrottle.failedCount = 0; // reset on success
        sessionStorage.setItem('pln_auth', JSON.stringify({ email: user.email, role: user.role }));
        revealDashboard(user);
      } else {
        __authThrottle.failedCount += 1;
        if (__authThrottle.failedCount >= __MAX_ATTEMPTS) {
          __authThrottle.lockedUntil = Date.now() + __LOCK_MS;
          __authThrottle.failedCount = 0; // reset counter, but lock active
          showAuthError(`Login terkunci ${__LOCK_MS/1000} detik karena ${__MAX_ATTEMPTS}x percobaan gagal.`);
        } else {
          showAuthError(`Email atau kata sandi salah. Sisa percobaan: ${__MAX_ATTEMPTS - __authThrottle.failedCount}.`);
        }
        lsBtn.disabled = false;
        lsBtn.classList.remove('loading');
        lsBtnTxt.textContent = 'Masuk ke Dashboard';
        lsPass.value = '';
        lsEmail.focus();
      }
    });

    // Clear error on input
    [lsEmail, lsPass].forEach(el => el.addEventListener('input', clearAuthError));

    // Check existing session
    (() => {
      const saved = sessionStorage.getItem('pln_auth');
      if (!saved) return;
      try {
        const { email } = JSON.parse(saved);
        const user = AUTH_USERS.find(u => u.email === email);
        if (user) { revealDashboard(user); return; }
      } catch(e) { /* ignore */ }
      sessionStorage.removeItem('pln_auth');
    })();

  


  <!-- ====================================================================
       v3 CORPORATE REFINEMENTS — Big 4 styling, War Room mode, KPI Deep Dive
       ==================================================================== -->
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400;500;600&display=swap" rel="stylesheet">

  <style id="v3-refinements">
    /* ===== TOKEN OVERRIDES — Big 4 corporate ============================ */
    :root, [data-theme="light"] {
      --color-bg:              #F4F5F7;
      --color-surface:         #FFFFFF;
      --color-surface-2:       #FAFBFC;
      --color-surface-hover:   #EEF3F6;
      --color-surface-sunken:  #F0F2F5;
      --color-border:          #E5E7EB;
      --color-border-strong:   #D1D5DB;
      --color-border-subtle:   #EEF0F3;
      --color-text:            #0F1F2E;
      --color-text-muted:      #4B5563;
      --color-text-subtle:     #6B7280;
      --color-brand:           #125D72;
      --color-brand-hover:     #0B4459;
      --color-brand-tint:      rgba(18, 93, 114, 0.08);
      --color-accent:          #C76C0F;
      --color-accent-hover:    #B25C03;
      --color-accent-tint:     rgba(199, 108, 15, 0.10);
      --color-success:         #1B7F3E;
      --color-success-tint:    rgba(27, 127, 62, 0.10);
      --color-warning:         #B45309;
      --color-warning-tint:    rgba(180, 83, 9, 0.10);
      --color-danger:          #B42318;
      --color-danger-tint:     rgba(180, 35, 24, 0.08);
      --color-info:            #0E7490;
      --color-info-tint:       rgba(14, 116, 144, 0.10);
      --chart-1: #125D72;
      --chart-2: #C76C0F;
      --chart-3: #1B7F3E;
      --chart-4: #0E7490;
      --chart-5: #7C3AED;
      --chart-6: #B42318;
      --shadow-sm: 0 1px 2px rgba(15, 31, 46, 0.04);
      --shadow-md: 0 2px 8px rgba(15, 31, 46, 0.06);
      --shadow-lg: 0 8px 24px rgba(15, 31, 46, 0.08);
      --radius-sm: 4px; --radius-md: 6px; --radius-lg: 8px; --radius-xl: 10px;
      --content-pad-x: 40px;
      --content-pad-y: 32px;
      --content-max: 1440px;
    }
    [data-theme="dark"] {
      --color-bg:              #0B1620;
      --color-surface:         #11202C;
      --color-surface-2:       #16293A;
      --color-surface-hover:   #1B3346;
      --color-surface-sunken:  #07111B;
      --color-border:          #1F3447;
      --color-border-strong:   #2C4660;
      --color-text:            #E8EEF4;
      --color-text-muted:      #B0BFCD;
      --color-text-subtle:     #8298AC;
    }

    /* ===== Typography refinements ====================================== */
    body { font-feature-settings: "ss01", "ss02", "cv11"; letter-spacing: -0.005em; }
    .display-font,
    .kpi-card-value, .summary-hero-value, .metric-card-value,
    .ratio-card-value, .hero-health-value, .kepatuhan-big-value,
    .kpi-md-cell-value, .preview-card-value, .hero-stat-value, .cash-stat-value {
      font-family: 'IBM Plex Serif', 'Source Serif 4', Georgia, serif !important;
      font-weight: 500 !important;
      letter-spacing: -0.012em !important;
      font-feature-settings: "lnum", "tnum";
    }
    .page-title {
      font-size: clamp(26px, 2.2rem, 32px) !important;
      font-weight: 600 !important;
      letter-spacing: -0.020em !important;
      color: var(--color-text) !important;
    }
    .page-subtitle { color: var(--color-text-muted); font-size: var(--text-sm); margin-top: 6px; }
    .section-title { font-weight: 600 !important; letter-spacing: -0.005em; color: var(--color-text) !important; }
    .card-title { font-weight: 600 !important; letter-spacing: -0.003em; color: var(--color-text) !important; }
    .summary-hero-label, .kpi-card-label, .preview-card-label, .metric-card-label, .kpi-md-cell-label, .ratio-card-label {
      text-transform: uppercase; letter-spacing: 0.08em; font-size: 10.5px !important;
      font-weight: 600 !important; color: var(--color-text-subtle) !important;
    }

    /* ===== Cards: hairline borders, near-zero shadow =================== */
    .card, .summary-hero-card, .ratio-card, .kpi-card, .preview-card, .metric-card,
    .kpi-md-section, .kpi-md-detail, .alert-banner {
      border: 1px solid var(--color-border) !important;
      box-shadow: none !important;
      border-radius: 4px !important;
      background: var(--color-surface) !important;
    }
    .summary-hero-card { padding: 20px 22px !important; }
    .summary-hero-card.kpi { border-top: 3px solid var(--color-brand) !important; }
    .summary-hero-card.pi  { border-top: 3px solid var(--color-info) !important; }
    .summary-hero-card.pen { border-top: 3px solid var(--color-danger) !important; }
    .summary-hero-card.total { border-top: 3px solid var(--color-accent) !important; }
    .card-header {
      padding: 16px 22px !important;
      border-bottom: 1px solid var(--color-border) !important;
      background: transparent !important;
    }
    .card-body { padding: 20px 22px !important; }

    /* ===== Page header ================================================ */
    .page-header {
      padding: 20px 0 24px !important;
      margin-bottom: 24px !important;
      border-bottom: 1px solid var(--color-border) !important;
      align-items: flex-end !important;
    }
    .page-meta { font-size: var(--text-xs); color: var(--color-text-subtle); }

    /* ===== Sidebar — institutional dark slate ========================== */
    .sidebar {
      background: #0B2230 !important;
      border-right: 1px solid #0B2230 !important;
      color: #C9D2DC !important;
    }
    .sidebar-brand { border-bottom: 1px solid rgba(255,255,255,0.06) !important; padding: 18px 16px !important; }
    .sidebar-brand-name { color: #FFFFFF !important; font-weight: 700 !important; letter-spacing: -0.005em; }
    .sidebar-brand-sub { color: #94A3B8 !important; font-size: 11px !important; }
    .sidebar-brand-img { background: #FFFFFF !important; }
    .sidebar-nav .nav-item {
      color: #C9D2DC !important; border-left: 3px solid transparent !important;
      padding-left: 17px !important; border-radius: 0 !important;
      transition: background 120ms ease;
    }
    .sidebar-nav .nav-item:hover { background: rgba(255,255,255,0.04) !important; color: #FFFFFF !important; }
    .sidebar-nav .nav-item[aria-current="page"], .sidebar-nav .nav-item.active {
      background: rgba(199, 108, 15, 0.10) !important;
      color: #FFFFFF !important;
      border-left: 3px solid var(--color-accent) !important;
    }
    .sidebar-nav .nav-icon { color: inherit !important; }
    .nav-section-label {
      color: #6B7C8C !important;
      letter-spacing: 0.10em !important;
      font-size: 10px !important;
      text-transform: uppercase;
      font-weight: 700 !important;
      padding: 22px 20px 8px !important;
    }
    .sidebar-footer { border-top: 1px solid rgba(255,255,255,0.06) !important; padding-top: 14px !important; }
    .sidebar .user-card { background: transparent !important; }
    .sidebar .user-name { color: #FFFFFF !important; }
    .sidebar .user-role { color: #8FA1B3 !important; }
    .sidebar-collapse-btn { color: #94A3B8 !important; }

    /* ===== Topbar refinements ========================================= */
    .topbar { background: #FFFFFF !important; border-bottom: 1px solid var(--color-border) !important; }
    .breadcrumb { font-size: 13px; }
    .breadcrumb-current { color: var(--color-text); font-weight: 600; }
    .breadcrumb-prev { color: var(--color-text-subtle); }
    .role-badge { background: var(--color-surface-2) !important; border: 1px solid var(--color-border) !important; border-radius: 4px !important; font-size: 12.5px; }
    .role-badge .dot { background: var(--color-success); }
    #warroom-btn {
      background: var(--color-brand) !important;
      color: #FFFFFF !important;
      border: 1px solid var(--color-brand) !important;
      border-radius: 4px !important;
      padding: 8px 14px !important;
      font-weight: 600 !important;
      font-size: 12.5px !important;
      display: inline-flex; align-items: center; gap: 8px;
      transition: background 150ms ease;
    }
    #warroom-btn:hover { background: var(--color-brand-hover) !important; }
    #warroom-btn i { width: 15px; height: 15px; }
    @media (max-width: 1100px) { .btn-warroom-text { display: none; } #warroom-btn { padding: 8px 10px !important; } }

    /* ===== Buttons refinements ========================================= */
    .btn { border-radius: 4px !important; font-weight: 600 !important; letter-spacing: 0; font-size: 13px !important; }
    .btn-primary { background: var(--color-brand) !important; border: 1px solid var(--color-brand) !important; color: #fff !important; }
    .btn-primary:hover { background: var(--color-brand-hover) !important; }
    .btn-secondary { background: #FFFFFF !important; border: 1px solid var(--color-border-strong) !important; color: var(--color-text) !important; }
    .btn-secondary:hover { background: var(--color-surface-2) !important; }
    .status-pill {
      font-weight: 600 !important; letter-spacing: 0.02em !important;
      padding: 3px 9px !important; border-radius: 3px !important; font-size: 11px !important;
      text-transform: uppercase;
    }

    /* ===== Tables — refined hierarchy ================================= */
    .data-table th { background: var(--color-surface-2) !important; color: var(--color-text-subtle) !important; font-weight: 600 !important; letter-spacing: 0.04em; text-transform: uppercase; font-size: 11px !important; border-bottom: 1px solid var(--color-border) !important; }
    .data-table td { border-bottom: 1px solid var(--color-border-subtle) !important; }
    .data-table tr:hover td { background: var(--color-surface-2) !important; }

    /* ===== KPI Master-Detail refinements =============================== */
    .kpi-md-detail-title { font-weight: 700 !important; font-size: 18px !important; letter-spacing: -0.005em; }
    .kpi-md-item.active { background: var(--color-brand-tint) !important; border-left: 3px solid var(--color-brand) !important; }
    .kpi-md-actions {
      padding: 16px 20px;
      margin-top: 8px;
      border-top: 1px solid var(--color-border);
      display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
      background: var(--color-surface-2);
    }
    .kpi-md-actions .btn { font-size: 13px !important; padding: 10px 16px !important; }
    .kpi-md-actions .btn i { width: 14px; height: 14px; }
    .kpi-md-actions-hint { font-size: 12px; color: var(--color-text-subtle); }

    /* ====================================================================
       WAR ROOM MODE
       ==================================================================== */
    .warroom-chrome {
      position: fixed; top: 0; left: 0; right: 0;
      height: 64px; z-index: 9998;
      background: #0B2230; color: #FFFFFF;
      display: none;
      align-items: center; justify-content: space-between;
      padding: 0 32px;
      border-bottom: 3px solid var(--color-accent);
      font-family: 'Manrope', system-ui, sans-serif;
    }
    body.warroom .warroom-chrome { display: flex; }

    .warroom-chrome-brand {
      display: flex; align-items: center; gap: 14px;
      min-width: 280px;
    }
    .warroom-chrome-logo {
      width: 36px; height: 36px; border-radius: 4px;
      background: #FFFFFF; padding: 4px;
      display: flex; align-items: center; justify-content: center;
    }
    .warroom-chrome-logo img { width: 100%; height: 100%; object-fit: contain; }
    .warroom-chrome-brand-text { display: flex; flex-direction: column; gap: 2px; line-height: 1.1; }
    .warroom-chrome-brand-name { font-weight: 700; font-size: 14px; letter-spacing: 0.02em; }
    .warroom-chrome-brand-sub { font-size: 11px; color: #94A3B8; letter-spacing: 0.08em; text-transform: uppercase; }

    .warroom-chrome-rotation {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 22px;
    }
    .warroom-rotation-pages {
      display: flex; gap: 18px; align-items: center;
    }
    .warroom-rotation-page {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
      color: #6B7C8C; padding: 6px 10px; border-radius: 4px;
      transition: all 200ms ease;
      cursor: pointer; background: none; border: none;
      font-family: inherit;
    }
    .warroom-rotation-page i { width: 14px; height: 14px; }
    .warroom-rotation-page.active { color: #FFFFFF; background: rgba(255,255,255,0.06); }
    .warroom-rotation-page.active::after {
      content: ""; display: block; width: 6px; height: 6px; border-radius: 50%;
      background: var(--color-accent); animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
    .warroom-rotation-progress {
      width: 240px; height: 3px; background: rgba(255,255,255,0.10); border-radius: 2px; overflow: hidden;
      position: relative;
    }
    .warroom-rotation-progress-bar {
      position: absolute; left: 0; top: 0; bottom: 0;
      background: var(--color-accent); width: 0%;
      transition: width 200ms linear;
    }

    .warroom-chrome-actions { display: flex; align-items: center; gap: 14px; min-width: 280px; justify-content: flex-end; }
    .warroom-clock {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: 22px; font-weight: 500; letter-spacing: -0.01em;
      color: #FFFFFF;
      line-height: 1;
    }
    .warroom-clock-date {
      font-family: 'Manrope', sans-serif;
      font-size: 11px; color: #94A3B8; letter-spacing: 0.06em; text-transform: uppercase;
      text-align: right; margin-top: 2px;
    }
    .warroom-btn-chrome {
      width: 38px; height: 38px; border-radius: 4px;
      background: rgba(255,255,255,0.06); color: #FFFFFF;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid rgba(255,255,255,0.08);
      cursor: pointer; transition: all 150ms ease;
    }
    .warroom-btn-chrome:hover { background: rgba(255,255,255,0.12); }
    .warroom-btn-chrome.danger { background: rgba(180,35,24,0.20); border-color: rgba(180,35,24,0.30); }
    .warroom-btn-chrome.danger:hover { background: rgba(180,35,24,0.35); }
    .warroom-btn-chrome i { width: 16px; height: 16px; }
    .warroom-btn-exit-text { font-size: 12px; font-weight: 600; padding-left: 8px; padding-right: 12px; }

    /* Body modifications when in war room mode */
    body.warroom .sidebar,
    body.warroom .topbar,
    body.warroom .bottom-nav,
    body.warroom .app-footer,
    body.warroom .alert-banner,
    body.warroom .page-header .page-meta { display: none !important; }
    body.warroom .app { grid-template-columns: 1fr !important; padding-left: 0 !important; }
    body.warroom .main { margin-left: 0 !important; margin-top: 64px !important; max-width: 100% !important; }
    body.warroom .main-inner { max-width: 100% !important; padding: 28px 48px 32px !important; }
    body.warroom .page-header { padding-top: 0 !important; padding-bottom: 18px !important; margin-bottom: 22px !important; }
    body.warroom .page-title { font-size: clamp(36px, 3.4vw, 52px) !important; }
    body.warroom .page-subtitle { font-size: var(--text-md); }
    body.warroom .display-font,
    body.warroom .kpi-card-value,
    body.warroom .summary-hero-value,
    body.warroom .hero-health-value { font-size: clamp(40px, 3.6vw, 56px) !important; }
    body.warroom .ratio-card-value, body.warroom .metric-card-value { font-size: clamp(32px, 2.8vw, 44px) !important; }
    body.warroom .card-header { padding: 18px 26px !important; }
    body.warroom .card-body { padding: 22px 26px !important; }
    body.warroom .section-title { font-size: var(--text-xl) !important; }
    body.warroom .card-title { font-size: var(--text-md) !important; }
    body.warroom .chart-container { min-height: 320px !important; }

    /* ====================================================================
       KPI DEEP DIVE — Sub-dashboard layout
       ==================================================================== */
    .dd-hero {
      display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr;
      gap: 1px; background: var(--color-border);
      border: 1px solid var(--color-border);
      margin-bottom: 28px;
      border-radius: 4px; overflow: hidden;
    }
    .dd-hero-cell {
      background: var(--color-surface);
      padding: 24px 26px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .dd-hero-cell.primary { background: var(--color-surface-2); }
    .dd-hero-cell .dd-cell-label {
      text-transform: uppercase; letter-spacing: 0.10em;
      font-size: 10.5px; font-weight: 600; color: var(--color-text-subtle);
    }
    .dd-hero-cell .dd-cell-value {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: 38px; font-weight: 500; letter-spacing: -0.012em;
      color: var(--color-text); line-height: 1.0;
    }
    .dd-hero-cell .dd-cell-value .dd-cell-unit {
      font-size: 16px; color: var(--color-text-muted); margin-left: 4px;
      font-family: 'Manrope', sans-serif; font-weight: 500;
    }
    .dd-hero-cell .dd-cell-sub {
      font-size: 12px; color: var(--color-text-muted); line-height: 1.4;
    }
    .dd-hero-cell.gap .dd-cell-value { color: var(--color-danger); }
    .dd-hero-cell.target .dd-cell-value { color: var(--color-brand); }

    .dd-back-btn {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--color-text-muted);
      padding: 6px 10px; border: 1px solid var(--color-border); border-radius: 4px;
      background: var(--color-surface); margin-bottom: 12px; cursor: pointer;
      font-family: inherit; font-weight: 500;
    }
    .dd-back-btn:hover { background: var(--color-surface-2); color: var(--color-text); }
    .dd-back-btn i { width: 13px; height: 13px; }

    .dd-section { margin-bottom: 28px; }
    .dd-section-head {
      display: flex; align-items: baseline; justify-content: space-between;
      margin-bottom: 14px; padding-bottom: 10px;
      border-bottom: 1px solid var(--color-border);
    }
    .dd-section-title {
      font-size: 16px; font-weight: 700; color: var(--color-text);
      letter-spacing: -0.005em; display: flex; align-items: center; gap: 8px;
    }
    .dd-section-title i { width: 16px; height: 16px; color: var(--color-brand); }
    .dd-section-meta { font-size: 12px; color: var(--color-text-subtle); }

    .dd-grid-2 { display: grid; grid-template-columns: 1.1fr 1fr; gap: 20px; }
    @media (max-width: 1100px) { .dd-grid-2 { grid-template-columns: 1fr; } }

    /* Root-cause Pareto */
    .dd-pareto-card { padding: 20px; border: 1px solid var(--color-border); background: var(--color-surface); border-radius: 4px; }
    .dd-pareto-title { font-size: 13px; font-weight: 600; color: var(--color-text); margin-bottom: 14px; }
    .dd-pareto-chart-wrap { height: 320px; }

    /* Root-cause ranked list */
    .dd-rootcause-list { display: flex; flex-direction: column; gap: 10px; }
    .dd-rootcause-item {
      display: grid;
      grid-template-columns: 36px 1fr 110px;
      gap: 14px;
      padding: 14px 16px;
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: 4px; align-items: center;
    }
    .dd-rootcause-item .rc-rank {
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--color-danger-tint); color: var(--color-danger);
      display: flex; align-items: center; justify-content: center;
      font-family: 'IBM Plex Serif', Georgia, serif; font-weight: 600; font-size: 18px;
    }
    .dd-rootcause-item:nth-child(2) .rc-rank { background: rgba(180, 83, 9, 0.10); color: var(--color-warning); }
    .dd-rootcause-item:nth-child(3) .rc-rank,
    .dd-rootcause-item:nth-child(4) .rc-rank,
    .dd-rootcause-item:nth-child(5) .rc-rank { background: var(--color-surface-2); color: var(--color-text-subtle); }
    .dd-rootcause-item .rc-body { min-width: 0; }
    .dd-rootcause-item .rc-title { font-weight: 600; font-size: 13.5px; color: var(--color-text); line-height: 1.3; margin-bottom: 4px; }
    .dd-rootcause-item .rc-meta { font-size: 11.5px; color: var(--color-text-subtle); line-height: 1.5; }
    .dd-rootcause-item .rc-meta strong { color: var(--color-text-muted); font-weight: 600; }
    .dd-rootcause-item .rc-impact { text-align: right; }
    .dd-rootcause-item .rc-impact-value {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: 22px; font-weight: 500; color: var(--color-danger);
      line-height: 1.0;
    }
    .dd-rootcause-item .rc-impact-label {
      font-size: 10px; color: var(--color-text-subtle); text-transform: uppercase;
      letter-spacing: 0.08em; margin-top: 4px;
    }

    /* Insight callout */
    .dd-insight {
      padding: 18px 20px;
      background: linear-gradient(180deg, rgba(180,35,24,0.04) 0%, rgba(180,35,24,0.01) 100%);
      border: 1px solid rgba(180,35,24,0.22);
      border-left: 3px solid var(--color-danger);
      border-radius: 4px;
      margin-bottom: 18px;
    }
    .dd-insight-label {
      font-size: 10.5px; font-weight: 700; color: var(--color-danger);
      text-transform: uppercase; letter-spacing: 0.10em; margin-bottom: 6px;
      display: flex; align-items: center; gap: 6px;
    }
    .dd-insight-label i { width: 12px; height: 12px; }
    .dd-insight-text { font-size: 14px; line-height: 1.55; color: var(--color-text); }
    .dd-insight-text strong { color: var(--color-danger); font-weight: 700; }

    .dd-mitigation-table { width: 100%; border-collapse: collapse; }
    .dd-mitigation-table th {
      background: var(--color-surface-2); color: var(--color-text-subtle);
      font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
      text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--color-border);
    }
    .dd-mitigation-table td {
      padding: 12px 14px; border-bottom: 1px solid var(--color-border-subtle);
      font-size: 13px; vertical-align: top;
    }
    .dd-mitigation-table .progress-mini { margin-top: 6px; }

    .dd-forecast-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    }
    .dd-forecast-card {
      padding: 18px 20px; border: 1px solid var(--color-border); background: var(--color-surface);
      border-radius: 4px;
    }
    .dd-forecast-card .dd-fc-label {
      font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.10em;
      font-weight: 600; color: var(--color-text-subtle); margin-bottom: 6px;
    }
    .dd-forecast-card .dd-fc-value {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: 36px; font-weight: 500; letter-spacing: -0.012em; line-height: 1.0;
      margin-bottom: 6px;
    }
    .dd-forecast-card.bad .dd-fc-value { color: var(--color-danger); }
    .dd-forecast-card.good .dd-fc-value { color: var(--color-success); }
    .dd-forecast-card .dd-fc-text { font-size: 12.5px; color: var(--color-text-muted); line-height: 1.5; }

    /* dark adaptations for refinements */
    [data-theme="dark"] .warroom-chrome,
    [data-theme="dark"] .sidebar { background: #08151D !important; }
    [data-theme="dark"] .card, [data-theme="dark"] .summary-hero-card, [data-theme="dark"] .ratio-card, [data-theme="dark"] .kpi-card, [data-theme="dark"] .preview-card, [data-theme="dark"] .metric-card, [data-theme="dark"] .alert-banner { background: var(--color-surface) !important; }
    [data-theme="dark"] .topbar { background: var(--color-surface) !important; }
    [data-theme="dark"] .dd-hero, [data-theme="dark"] .dd-hero-cell, [data-theme="dark"] .dd-rootcause-item, [data-theme="dark"] .dd-pareto-card, [data-theme="dark"] .dd-forecast-card { background: var(--color-surface) !important; }
    [data-theme="dark"] .dd-hero-cell.primary { background: var(--color-surface-2) !important; }
  </style>

  <!-- ===== War room chrome (visible when body.warroom) ================= -->
  <div class="warroom-chrome" id="warroom-chrome" aria-hidden="true">
    <div class="warroom-chrome-brand">
      <div class="warroom-chrome-logo">
        <img id="warroom-logo" alt="SIMPP">
      </div>
      <div class="warroom-chrome-brand-text">
        <span class="warroom-chrome-brand-name">SIMPP &mdash; War Room</span>
        <span class="warroom-chrome-brand-sub">PT PLN (Persero) PUSMANPRO</span>
      </div>
    </div>
    <div class="warroom-chrome-rotation">
      <div class="warroom-rotation-pages" id="warroom-rotation-pages"></div>
      <div class="warroom-rotation-progress"><div class="warroom-rotation-progress-bar" id="warroom-progress-bar"></div></div>
    </div>
    <div class="warroom-chrome-actions">
      <div style="display:flex;flex-direction:column;align-items:flex-end;">
        <div class="warroom-clock" id="warroom-clock">00:00</div>
        <div class="warroom-clock-date" id="warroom-clock-date">&mdash;</div>
      </div>
      <button class="warroom-btn-chrome" id="warroom-pause" aria-label="Jeda / Lanjut rotasi" title="Jeda / Lanjut">
        <i data-lucide="pause"></i>
      </button>
      <button class="warroom-btn-chrome" id="warroom-prev" aria-label="Slide sebelumnya" title="Sebelumnya"><i data-lucide="chevron-left"></i></button>
      <button class="warroom-btn-chrome" id="warroom-next" aria-label="Slide berikutnya" title="Berikutnya"><i data-lucide="chevron-right"></i></button>
      <button class="warroom-btn-chrome danger" id="warroom-exit" aria-label="Keluar dari War Room (ESC)" title="Keluar (ESC)">
        <i data-lucide="x"></i><span class="warroom-btn-exit-text">Keluar</span>
      </button>
    </div>
  </div>

  
// ===== script segment =====

    // ====================================================================
    // KPI DEEP DIVE — sub-dashboard with root-cause analysis
    // ====================================================================

    // Curated root-cause data — kp4 has full data; others fall back to a clean "no analysis needed" state.
    // Impact values sum approximately to the gap (target - actual) for visual coherence.
    const KPI_DEEPDIVE_DATA = {
      kp4: {
        gap: 6.06, gapUnit: 'pp',
        gapDirection: 'below',
        insight: 'PUSMANPRO membukukan <strong>93,94%</strong> dari target 100% pelaksanaan konstruksi sesuai PMS. Gap <strong>6,06 percentage point</strong> diserap oleh 5 isu utama; <strong>UPMK III</strong> dan <strong>UPMK IV</strong> menyumbang 70% dari shortfall total.',
        rootCauses: [
          { rank: 1, title: 'Keterlambatan finalisasi PMS proyek baru UPMK III & UPMK IV', impact: 2.4, impactPct: 40, owner: 'Bidang OMP &middot; UPMK III/IV', evidence: 'Rapat eskalasi belum dijadwalkan dengan Pemberi Kerja; 4 dari 9 PMS belum disepakati', source: 'Motion PMO &mdash; 22 Feb 2026' },
          { rank: 2, title: 'Revisi S-Curve karena permasalahan ROW/lahan', impact: 1.5, impactPct: 25, owner: 'UPMK III &middot; Pertanahan', evidence: 'GI Marisa &amp; Trans Kolaka — pembebasan lahan tertunda 18 hari kerja', source: 'Status ROW Pekanbaru 18 Feb 2026' },
          { rank: 3, title: 'Keterlambatan delivery material critical (transformator, switchgear)', impact: 1.1, impactPct: 18, owner: 'Procurement Korporat', evidence: 'Vendor X delay 21 hari kerja untuk 2 unit trafo 60 MVA', source: 'PO-2025-1142 &middot; status Carrier' },
          { rank: 4, title: 'Cuaca ekstrem & banjir lokasi proyek (Q1 2026)', impact: 0.6, impactPct: 10, owner: 'UPMK IV &middot; Site Manager', evidence: '7 hari kerja terhenti, 3 site terdampak banjir Februari', source: 'Daily Site Report &middot; 03&ndash;09 Feb' },
          { rank: 5, title: 'Perubahan scope dari Pemberi Kerja (change order)', impact: 0.46, impactPct: 7, owner: 'Bidang OMP &middot; Engineering', evidence: '2 dari 12 proyek menerima change order non-budget; re-baselining belum approved', source: 'CO-Log Q1 2026' },
        ],
        units: [
          { name: 'UPMK III', value: 88.4, target: 100, status: 'danger',  note: 'Penyumbang shortfall terbesar (2,4 pp)' },
          { name: 'UPMK IV', value: 91.2, target: 100, status: 'danger',  note: 'Cuaca + delay material' },
          { name: 'Kantor Induk', value: 93.94, target: 100, status: 'warning', note: 'Sesuai rata-rata korporat' },
          { name: 'UPMK V',  value: 94.8, target: 100, status: 'warning', note: 'PMS finalisasi 80%' },
          { name: 'UPMK I',  value: 95.2, target: 100, status: 'warning', note: 'On track' },
          { name: 'UPMK II', value: 97.5, target: 100, status: 'success', note: 'Best performing unit' },
        ],
        mitigations: [
          { action: 'Eskalasi PMS belum disepakati ke Pemberi Kerja (Direksi UIP)', owner: 'GM PUSMANPRO',    due: '2026-03-15', progress: 60, status: 'on-track', expectedImpact: '+1,8 pp' },
          { action: 'Koordinasi mingguan UPMK III/IV — finalisasi 4 PMS pending',     owner: 'Bidang OMP',         due: '2026-04-01', progress: 35, status: 'on-track', expectedImpact: '+1,2 pp' },
          { action: 'Re-tender Vendor X untuk batch trafo Q2 2026',                   owner: 'Procurement',        due: '2026-04-30', progress: 15, status: 'at-risk',  expectedImpact: '+0,8 pp' },
          { action: 'Activate BCP cuaca ekstrem (jadwal cadangan 6 hari kerja)',      owner: 'UPMK IV Site',       due: '2026-03-31', progress: 80, status: 'on-track', expectedImpact: '+0,5 pp' },
          { action: 'Workshop change-order discipline + re-baselining 2 proyek CO',   owner: 'Engineering',        due: '2026-03-22', progress: 50, status: 'on-track', expectedImpact: '+0,3 pp' },
        ],
        forecast: {
          baseline: 91.5,     // if nothing changes (trend continues)
          mitigated: 99.2,    // if all mitigations land on time
          baselineNote: 'Jika tidak ada intervensi tambahan, trend bulanan -0,3 pp mengarah ke 91,5% End-of-Year 2026.',
          mitigatedNote: 'Dengan eksekusi 5 aksi mitigasi tepat waktu, capaian Desember 2026 diproyeksikan 99,2% &mdash; gap residual 0,8 pp.',
        },
      },
    };

    // Default deep-dive KPI — the representative one with full data
    state.deepDiveKpiId = 'kp4';

    // Entry point — called from KPI master-detail "Buka Sub-Dashboard" button
    window.__openKpiDeepDive = (kpiId) => {
      const kpi = DATA.operational.kpis.find(k => k.id === kpiId);
      if (!kpi) return;
      state.deepDiveKpiId = kpiId;
      // Close any open modal
      if (typeof closeModal === 'function') closeModal('kpi-detail-modal');
      window.location.hash = '#kpi-deepdive';
    };

    // Add ROUTES entry
    ROUTES['kpi-deepdive'] = {
      label: 'KPI Sub-Dashboard',
      icon: 'microscope',
      phase: 1,
      desc: 'Drill-down detail KPI, root-cause analysis, kontribusi per unit, dan rencana mitigasi.',
    };
    PAGES_READY.add('kpi-deepdive');

    // Page preview renderer
    PAGE_PREVIEW['kpi-deepdive'] = () => {
      const kpi = DATA.operational.kpis.find(k => k.id === state.deepDiveKpiId) || DATA.operational.kpis[0];
      const dd = KPI_DEEPDIVE_DATA[kpi.id];
      const st = __statusFor(kpi);
      const gap = (kpi.target - kpi.actual);
      const gapStr = (gap > 0 ? '−' : '+') + formatNumber(Math.abs(gap), 2);
      const achievement = kpi.achievement || 0;

      // Hero metrics row
      const hero = `
        <div class="dd-hero">
          <div class="dd-hero-cell primary">
            <span class="dd-cell-label">${kpi.category} ${kpi.no || ''} &middot; ${kpi.bu || ''}</span>
            <div style="font-size:18px; font-weight:700; color:var(--color-text); letter-spacing:-0.005em; line-height:1.35; margin-top:2px;">${kpi.name}</div>
            <div class="dd-cell-sub" style="margin-top:8px; display:flex; gap:8px; align-items:center;">
              <span class="status-pill ${st.cls}">${st.label}</span>
              <span>Periode: ${DATA.meta.period}</span>
            </div>
          </div>
          <div class="dd-hero-cell target">
            <span class="dd-cell-label">Target</span>
            <div class="dd-cell-value">${formatNumber(kpi.target, kpi.target % 1 ? 2 : 0)}<span class="dd-cell-unit">${kpi.unit}</span></div>
            <div class="dd-cell-sub">Polaritas: ${__polaritasLabel(kpi.polaritas)} &middot; Bobot ${kpi.bobot}%</div>
          </div>
          <div class="dd-hero-cell">
            <span class="dd-cell-label">Realisasi ${DATA.meta.period}</span>
            <div class="dd-cell-value">${formatNumber(kpi.actual, 2)}<span class="dd-cell-unit">${kpi.unit}</span></div>
            <div class="dd-cell-sub">Pencapaian ${formatNumber(achievement, 1)}% &middot; Nilai ${formatNumber(kpi.nilai, 2)}</div>
          </div>
          <div class="dd-hero-cell gap">
            <span class="dd-cell-label">Gap vs Target</span>
            <div class="dd-cell-value">${gapStr}<span class="dd-cell-unit">${kpi.unit === '%' ? 'pp' : kpi.unit}</span></div>
            <div class="dd-cell-sub">${gap > 0 ? 'Di bawah target — perlu intervensi' : 'Di atas target — dipertahankan'}</div>
          </div>
        </div>
      `;

      if (!dd) {
        // Fallback when no deep-dive data is curated for this KPI
        return `
          <button class="dd-back-btn" onclick="window.location.hash='#executive-summary'">
            <i data-lucide="arrow-left"></i><span>Kembali ke Executive Summary</span>
          </button>
          ${hero}
          <div class="dd-section">
            <div class="dd-insight" style="border-color: rgba(27,127,62,0.30); background: rgba(27,127,62,0.04);">
              <div class="dd-insight-label" style="color: var(--color-success);">
                <i data-lucide="check-circle"></i><span>KPI ON TRACK &mdash; ANALISIS LANJUTAN BELUM DIPERLUKAN</span>
              </div>
              <div class="dd-insight-text">KPI ini mencapai atau melampaui target. Root-cause analysis hanya diaktifkan ketika status = warning / danger. ${kpi.commentary || ''}</div>
            </div>
            <div class="dd-section-head">
              <div class="dd-section-title"><i data-lucide="line-chart"></i><span>Trend 12 Bulan</span></div>
              <span class="dd-section-meta">Periode Mar 2025 &mdash; Feb 2026</span>
            </div>
            <div class="card"><div class="card-body" style="padding:16px;"><div class="chart-container" style="min-height:280px;"><canvas id="dd-trend-fallback"></canvas></div></div></div>
          </div>
        `;
      }

      // Root cause ranked list
      const rcList = dd.rootCauses.map(rc => `
        <div class="dd-rootcause-item">
          <div class="rc-rank">${rc.rank}</div>
          <div class="rc-body">
            <div class="rc-title">${rc.title}</div>
            <div class="rc-meta">
              <strong>Owner:</strong> ${rc.owner} &middot; <strong>Evidence:</strong> ${rc.evidence}
              <br><span style="font-size:10.5px; color:var(--color-text-subtle);">Source: ${rc.source}</span>
            </div>
          </div>
          <div class="rc-impact">
            <div class="rc-impact-value">−${formatNumber(rc.impact, 2)}${kpi.unit === '%' ? 'pp' : ''}</div>
            <div class="rc-impact-label">${rc.impactPct}% dari gap</div>
          </div>
        </div>
      `).join('');

      // Mitigation table rows
      const mitRows = dd.mitigations.map(m => `
        <tr>
          <td style="font-weight:600; color:var(--color-text); max-width:380px;">${m.action}</td>
          <td>${m.owner}</td>
          <td style="white-space:nowrap;">${formatDate(m.due, 'short')}</td>
          <td>
            ${m.progress}%
            <div class="progress-mini"><div class="progress-mini-fill ${m.status === 'on-track' ? 'success' : m.status === 'at-risk' ? 'warning' : 'danger'}" style="width:${m.progress}%"></div></div>
          </td>
          <td><span class="status-pill ${m.status === 'on-track' ? 'completed' : m.status === 'at-risk' ? 'warning' : 'danger'}">${m.status === 'on-track' ? 'On Track' : m.status === 'at-risk' ? 'At Risk' : 'Delayed'}</span></td>
          <td style="font-family:'IBM Plex Serif',serif; color:var(--color-success); font-weight:600;">${m.expectedImpact}</td>
        </tr>
      `).join('');

      return `
        <button class="dd-back-btn" onclick="window.location.hash='#executive-summary'">
          <i data-lucide="arrow-left"></i><span>Kembali ke Executive Summary</span>
        </button>
        ${hero}

        <div class="dd-insight">
          <div class="dd-insight-label"><i data-lucide="alert-octagon"></i><span>Mengapa target tidak tercapai?</span></div>
          <div class="dd-insight-text">${dd.insight}</div>
        </div>

        <div class="dd-section">
          <div class="dd-section-head">
            <div class="dd-section-title"><i data-lucide="line-chart"></i><span>Tren Realisasi 12 Bulan</span></div>
            <span class="dd-section-meta">Garis target = ${kpi.target} ${kpi.unit} &middot; warna di bawah target = miss</span>
          </div>
          <div class="card"><div class="card-body" style="padding:18px;"><div class="chart-container" style="min-height:260px;"><canvas id="dd-trend-chart"></canvas></div></div></div>
        </div>

        <div class="dd-section">
          <div class="dd-section-head">
            <div class="dd-section-title"><i data-lucide="microscope"></i><span>Root Cause Analysis &mdash; Issues Ranked by Impact</span></div>
            <span class="dd-section-meta">Total gap ${formatNumber(dd.gap, 2)} ${kpi.unit === '%' ? 'pp' : kpi.unit} terurai ke ${dd.rootCauses.length} penyebab utama</span>
          </div>
          <div class="dd-grid-2">
            <div class="dd-pareto-card">
              <div class="dd-pareto-title">Pareto &mdash; Kontribusi terhadap Gap (%)</div>
              <div class="dd-pareto-chart-wrap"><canvas id="dd-pareto-chart"></canvas></div>
            </div>
            <div class="dd-rootcause-list">${rcList}</div>
          </div>
        </div>

        <div class="dd-section">
          <div class="dd-section-head">
            <div class="dd-section-title"><i data-lucide="building-2"></i><span>Kontribusi per Unit (UPMK)</span></div>
            <span class="dd-section-meta">Realisasi vs Target ${kpi.target}${kpi.unit} per unit</span>
          </div>
          <div class="card"><div class="card-body" style="padding:18px;"><div class="chart-container" style="min-height:260px;"><canvas id="dd-units-chart"></canvas></div></div></div>
        </div>

        <div class="dd-section">
          <div class="dd-section-head">
            <div class="dd-section-title"><i data-lucide="clipboard-check"></i><span>Rencana Mitigasi</span></div>
            <span class="dd-section-meta">${dd.mitigations.length} aksi prioritas dengan owner &amp; due date</span>
          </div>
          <div class="card"><div class="card-body" style="padding:0;">
            <table class="dd-mitigation-table">
              <thead><tr>
                <th style="min-width:280px;">Aksi Mitigasi</th>
                <th>Owner</th>
                <th>Due</th>
                <th style="min-width:140px;">Progress</th>
                <th>Status</th>
                <th>Dampak Diharapkan</th>
              </tr></thead>
              <tbody>${mitRows}</tbody>
            </table>
          </div></div>
        </div>

        <div class="dd-section">
          <div class="dd-section-head">
            <div class="dd-section-title"><i data-lucide="trending-up"></i><span>Forecast End-of-Year 2026</span></div>
            <span class="dd-section-meta">Dua skenario proyeksi Desember 2026</span>
          </div>
          <div class="dd-forecast-grid">
            <div class="dd-forecast-card bad">
              <div class="dd-fc-label"><i data-lucide="alert-triangle" style="width:11px;height:11px;display:inline;vertical-align:-1px;color:var(--color-danger);"></i>&nbsp; Skenario A &mdash; Trend lanjut</div>
              <div class="dd-fc-value">${formatNumber(dd.forecast.baseline, 1)}%</div>
              <div class="dd-fc-text">${dd.forecast.baselineNote}</div>
            </div>
            <div class="dd-forecast-card good">
              <div class="dd-fc-label"><i data-lucide="check-circle-2" style="width:11px;height:11px;display:inline;vertical-align:-1px;color:var(--color-success);"></i>&nbsp; Skenario B &mdash; Aksi mitigasi delivered</div>
              <div class="dd-fc-value">${formatNumber(dd.forecast.mitigated, 1)}%</div>
              <div class="dd-fc-text">${dd.forecast.mitigatedNote}</div>
            </div>
          </div>
        </div>
      `;
    };

    // Page init — render charts after DOM in place
    PAGE_INIT['kpi-deepdive'] = () => {
      const kpi = DATA.operational.kpis.find(k => k.id === state.deepDiveKpiId) || DATA.operational.kpis[0];
      const dd = KPI_DEEPDIVE_DATA[kpi.id];
      const t = chartTheme();

      // Trend chart (12 months)
      const trendCanvas = document.getElementById('dd-trend-chart') || document.getElementById('dd-trend-fallback');
      if (trendCanvas && kpi.sparkline && kpi.sparkline.length) {
        const labels = DATA.meta.monthsTrailing12;
        const data = kpi.sparkline.slice(-12);
        const targetLine = Array(data.length).fill(kpi.target);
        const pointColors = data.map(v => (v < kpi.target ? '#B42318' : '#1B7F3E'));
        ChartFactory.line(trendCanvas, [
          {
            label: kpi.name,
            data,
            borderColor: '#125D72',
            backgroundColor: 'rgba(18,93,114,0.10)',
            borderWidth: 2.5, fill: true,
            pointBackgroundColor: pointColors,
            pointBorderColor: pointColors,
            pointRadius: 4, pointHoverRadius: 6,
            tension: 0.3,
          },
          { label: 'Target', data: targetLine, borderColor: '#C76C0F', backgroundColor: 'transparent', borderDash: [6,4], borderWidth: 1.5, pointRadius: 0 },
        ], { labels });
      }

      if (!dd) return;

      // Pareto chart — combo: bars (impact) + line (cumulative %)
      const paretoCanvas = document.getElementById('dd-pareto-chart');
      if (paretoCanvas && window.Chart) {
        const sorted = [...dd.rootCauses].sort((a,b) => b.impact - a.impact);
        const labels = sorted.map(r => 'RC' + r.rank);
        const impacts = sorted.map(r => r.impact);
        let cumulative = 0; const totalImpact = impacts.reduce((s,v) => s+v, 0);
        const cumPct = impacts.map(v => { cumulative += v; return +(cumulative / totalImpact * 100).toFixed(1); });

        // Destroy any existing
        const existing = chartRegistry.get('dd-pareto-chart');
        if (existing) { existing.destroy(); chartRegistry.delete('dd-pareto-chart'); }

        const colors = ['#B42318', '#C76C0F', '#A36304', '#88787B', '#A8A39E'];
        const chart = new Chart(paretoCanvas, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              { type:'bar', label:'Impact (pp)', data: impacts, backgroundColor: colors.slice(0, impacts.length), borderRadius: 3, yAxisID:'y' },
              { type:'line', label:'Kumulatif %', data: cumPct, borderColor:'#125D72', backgroundColor:'rgba(18,93,114,0.05)', borderWidth: 2, pointRadius: 4, pointBackgroundColor:'#125D72', tension: 0.2, yAxisID:'y1' },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 14, padding: 14, color: '#4B5563' } },
              tooltip: {
                callbacks: {
                  title: (items) => {
                    const idx = items[0].dataIndex;
                    return 'RC' + sorted[idx].rank + ' — ' + sorted[idx].title;
                  },
                  label: (ctx) => {
                    if (ctx.dataset.label === 'Impact (pp)') return '  Impact: ' + ctx.parsed.y.toFixed(2) + ' pp (' + sorted[ctx.dataIndex].impactPct + '%)';
                    return '  Kumulatif: ' + ctx.parsed.y.toFixed(1) + '%';
                  }
                }
              },
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#4B5563', font: { size: 11 } } },
              y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { color: '#4B5563', font: { size: 11 }, callback: (v) => v.toFixed(2) + ' pp' }, title: { display: true, text: 'Impact (pp)', color: '#6B7280', font: { size: 10 } } },
              y1: { position: 'right', beginAtZero: true, max: 110, grid: { display: false }, ticks: { color: '#125D72', font: { size: 11 }, callback: (v) => v + '%' }, title: { display: true, text: 'Kumulatif %', color: '#125D72', font: { size: 10 } } },
            },
          },
        });
        chartRegistry.set('dd-pareto-chart', chart);
      }

      // Units chart — bar per UPMK with target line
      const unitsCanvas = document.getElementById('dd-units-chart');
      if (unitsCanvas && window.Chart) {
        const existing = chartRegistry.get('dd-units-chart');
        if (existing) { existing.destroy(); chartRegistry.delete('dd-units-chart'); }
        const STATUS_COLOR = { danger:'#B42318', warning:'#C76C0F', success:'#1B7F3E' };
        const labels = dd.units.map(u => u.name);
        const vals = dd.units.map(u => u.value);
        const colors = dd.units.map(u => STATUS_COLOR[u.status] || '#125D72');
        const target = Array(labels.length).fill(dd.units[0].target);
        const chart = new Chart(unitsCanvas, {
          type: 'bar',
          data: { labels, datasets: [
            { label: 'Realisasi (' + kpi.unit + ')', data: vals, backgroundColor: colors, borderRadius: 3 },
            { type: 'line', label: 'Target (' + dd.units[0].target + ' ' + kpi.unit + ')', data: target, borderColor: '#C76C0F', borderDash: [6,4], borderWidth: 1.5, pointRadius: 0, fill: false },
          ]},
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 14, color: '#4B5563' } },
              tooltip: { callbacks: { afterLabel: (ctx) => {
                if (ctx.dataset.type === 'line') return '';
                const u = dd.units[ctx.dataIndex]; return u && u.note ? '  Note: ' + u.note : '';
              } } },
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#4B5563' } },
              y: { beginAtZero: false, suggestedMin: 80, suggestedMax: 100, grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { color: '#4B5563', callback: v => v + (kpi.unit === '%' ? '%' : '') } },
            },
          },
        });
        chartRegistry.set('dd-units-chart', chart);
      }

      if (window.lucide) window.lucide.createIcons();
    };

    // ====================================================================
    // WAR ROOM MODE
    // ====================================================================
    const WARROOM_PAGES = [
      { route: 'executive-summary', label: 'KPI Summary', icon: 'layout-dashboard' },
      { route: 'financial',         label: 'Financial',    icon: 'trending-up' },
      { route: 'strategic',         label: 'Strategic',    icon: 'target' },
      { route: 'risk',              label: 'Risk',         icon: 'shield-alert' },
    ];
    const WARROOM_INTERVAL_MS = 20000; // 20s per page
    const WARROOM_PROGRESS_TICK_MS = 200;
    const warroomState = { active: false, index: 0, paused: false, elapsed: 0, timerId: null };
    let warroomClockInterval = null;

    const renderWarroomDots = () => {
      const host = document.getElementById('warroom-rotation-pages');
      if (!host) return;
      host.innerHTML = WARROOM_PAGES.map((p, i) => `
        <button class="warroom-rotation-page ${i === warroomState.index ? 'active' : ''}" data-warroom-index="${i}">
          <i data-lucide="${p.icon}"></i><span>${p.label}</span>
        </button>
      `).join('');
      host.querySelectorAll('button[data-warroom-index]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-warroom-index'), 10);
          warroomGoTo(idx);
        });
      });
      if (window.lucide) window.lucide.createIcons();
    };

    const updateWarroomProgress = () => {
      const bar = document.getElementById('warroom-progress-bar');
      if (!bar) return;
      const pct = Math.min(100, (warroomState.elapsed / WARROOM_INTERVAL_MS) * 100);
      bar.style.width = pct + '%';
    };

    const warroomGoTo = (index) => {
      warroomState.index = ((index % WARROOM_PAGES.length) + WARROOM_PAGES.length) % WARROOM_PAGES.length;
      warroomState.elapsed = 0;
      updateWarroomProgress();
      renderWarroomDots();
      const page = WARROOM_PAGES[warroomState.index];
      if (page) window.location.hash = '#' + page.route;
    };

    const warroomTick = () => {
      if (warroomState.paused) return;
      warroomState.elapsed += WARROOM_PROGRESS_TICK_MS;
      updateWarroomProgress();
      if (warroomState.elapsed >= WARROOM_INTERVAL_MS) {
        warroomGoTo(warroomState.index + 1);
      }
    };

    const updateWarroomClock = () => {
      const now = new Date();
      const HH = String(now.getHours()).padStart(2, '0');
      const MM = String(now.getMinutes()).padStart(2, '0');
      const clock = document.getElementById('warroom-clock');
      const date = document.getElementById('warroom-clock-date');
      if (clock) clock.textContent = `${HH}:${MM}`;
      if (date) {
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        date.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
      }
    };

    const enterWarroom = () => {
      if (warroomState.active) return;
      warroomState.active = true;
      warroomState.paused = false;
      warroomState.elapsed = 0;
      warroomState.index = 0;
      document.body.classList.add('warroom');
      document.getElementById('warroom-chrome').setAttribute('aria-hidden', 'false');
      // Try to enter actual fullscreen if available
      const el = document.documentElement;
      if (el.requestFullscreen) { el.requestFullscreen().catch(() => {}); }
      // Set logo
      const wrLogo = document.getElementById('warroom-logo');
      const sbLogo = document.getElementById('sidebar-brand-logo');
      if (wrLogo && sbLogo && sbLogo.src) wrLogo.src = sbLogo.src;
      renderWarroomDots();
      updateWarroomClock();
      warroomClockInterval = setInterval(updateWarroomClock, 30000);
      warroomState.timerId = setInterval(warroomTick, WARROOM_PROGRESS_TICK_MS);
      warroomGoTo(0);
      toast({ title: 'War Room Mode aktif', message: '4 slide otomatis bergulir setiap 20 detik. Tekan ESC untuk keluar.', type: 'info', duration: 4000 });
    };

    const exitWarroom = () => {
      if (!warroomState.active) return;
      warroomState.active = false;
      document.body.classList.remove('warroom');
      document.getElementById('warroom-chrome').setAttribute('aria-hidden', 'true');
      if (warroomState.timerId) { clearInterval(warroomState.timerId); warroomState.timerId = null; }
      if (warroomClockInterval) { clearInterval(warroomClockInterval); warroomClockInterval = null; }
      if (document.fullscreenElement && document.exitFullscreen) { document.exitFullscreen().catch(() => {}); }
    };

    const toggleWarroomPause = () => {
      warroomState.paused = !warroomState.paused;
      const btn = document.getElementById('warroom-pause');
      if (btn) {
        const i = btn.querySelector('i');
        if (i) { i.setAttribute('data-lucide', warroomState.paused ? 'play' : 'pause'); }
        btn.setAttribute('aria-label', warroomState.paused ? 'Lanjut rotasi' : 'Jeda rotasi');
        if (window.lucide) window.lucide.createIcons();
      }
    };

    // Wire up controls after DOM ready
    const wireWarroom = () => {
      const wrBtn = document.getElementById('warroom-btn');
      if (wrBtn) wrBtn.addEventListener('click', enterWarroom);
      const exitBtn = document.getElementById('warroom-exit');
      if (exitBtn) exitBtn.addEventListener('click', exitWarroom);
      const pauseBtn = document.getElementById('warroom-pause');
      if (pauseBtn) pauseBtn.addEventListener('click', toggleWarroomPause);
      const prevBtn = document.getElementById('warroom-prev');
      if (prevBtn) prevBtn.addEventListener('click', () => warroomGoTo(warroomState.index - 1));
      const nextBtn = document.getElementById('warroom-next');
      if (nextBtn) nextBtn.addEventListener('click', () => warroomGoTo(warroomState.index + 1));

      document.addEventListener('keydown', (e) => {
        if (!warroomState.active) return;
        if (e.key === 'Escape') { exitWarroom(); }
        else if (e.key === 'ArrowRight') { warroomGoTo(warroomState.index + 1); }
        else if (e.key === 'ArrowLeft')  { warroomGoTo(warroomState.index - 1); }
        else if (e.key === ' ')          { e.preventDefault(); toggleWarroomPause(); }
      });
    };

    // Init after a tick so other scripts have wired up
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(wireWarroom, 0);
    } else {
      document.addEventListener('DOMContentLoaded', wireWarroom);
    }

    // Re-create lucide icons for the topbar button (which was added after initial render)
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 100);
  


  <!-- ====================================================================
       WAR ROOM SLIDES — Purpose-built visual-management layouts
       ==================================================================== -->
  <style id="v3-warroom-slides">
    /* Dark control-room canvas */
    body.warroom { background: #06121C !important; color: #E6EEF5 !important; }
    body.warroom .app { background: #06121C !important; }
    body.warroom .main { background: #06121C !important; color: #E6EEF5 !important; }
    body.warroom .warroom-chrome { background: #03080D !important; border-bottom: 3px solid #C76C0F !important; }
    body.warroom .warroom-rotation-page { color: #6B7C8C; }
    body.warroom .warroom-rotation-page.active { color: #FFFFFF; background: rgba(255,255,255,0.06); }
    body.warroom .toast-region { display: none !important; }

    /* When war room is active, hide the standard page content (main-inner is replaced) */
    body.warroom .main-inner > :not(.wr-slide) { display: none !important; }
    body.warroom .main-inner { padding: 0 !important; max-width: 100% !important; }

    /* ---- Slide shell ----------------------------------------------------- */
    .wr-slide {
      width: 100%;
      min-height: calc(100vh - 64px);
      padding: 26px 42px 36px;
      display: grid;
      gap: 22px;
      box-sizing: border-box;
      font-family: 'Manrope', system-ui, sans-serif;
      color: #E6EEF5;
      opacity: 1;
    }

    .wr-slide-kpi      { grid-template-rows: minmax(220px, auto) auto 1fr; }
    .wr-slide-financial{ grid-template-rows: minmax(220px, auto) auto auto 1fr; }
    .wr-slide-strategic{ grid-template-rows: minmax(180px, auto) 1fr auto; }
    .wr-slide-risk     { grid-template-rows: minmax(220px, auto) 1fr auto; }

    .wr-eyebrow {
      font-size: 12px;
      letter-spacing: 0.20em;
      text-transform: uppercase;
      font-weight: 700;
      color: #5B7A8F;
      margin: 0 0 10px;
    }
    .wr-h, .wr-mega, .wr-big, .wr-med {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-weight: 400; letter-spacing: -0.012em; line-height: 1.0;
      color: #FFFFFF; margin: 0;
    }
    .wr-mega { font-size: clamp(96px, 11vw, 168px); }
    .wr-big  { font-size: clamp(60px, 7vw,  108px); }
    .wr-med  { font-size: clamp(40px, 4.5vw, 72px); }
    .wr-mega-of {
      font-family: 'Manrope', sans-serif;
      font-size: 0.30em;
      font-weight: 500;
      color: #6B8FA8;
      margin-left: 14px;
      letter-spacing: 0;
    }
    .wr-mega-decimal { color: #B0C5D6; font-weight: 300; }

    /* Status light — big glowing dot */
    .wr-status-light {
      display: inline-block; width: 22px; height: 22px; border-radius: 50%;
      vertical-align: middle; margin-right: 14px;
      box-shadow: 0 0 0 6px rgba(255,255,255,0.04), 0 0 24px currentColor;
    }
    .wr-status-light.lg { width: 28px; height: 28px; box-shadow: 0 0 0 8px rgba(255,255,255,0.04), 0 0 32px currentColor; }
    .wr-status-light.success { background: #2EBC5D; color: #2EBC5D; animation: wr-pulse 2.6s ease-in-out infinite; }
    .wr-status-light.warning { background: #F0A23A; color: #F0A23A; animation: wr-pulse 2.0s ease-in-out infinite; }
    .wr-status-light.danger  { background: #E64B3A; color: #E64B3A; animation: wr-pulse 1.3s ease-in-out infinite; }
    @keyframes wr-pulse { 50% { box-shadow: 0 0 0 6px rgba(255,255,255,0.04), 0 0 40px currentColor, 0 0 16px currentColor; } }
    .wr-status-text {
      font-family: 'Manrope', sans-serif;
      font-size: clamp(20px, 2vw, 28px); font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #FFFFFF; vertical-align: middle;
    }
    .wr-status-text.success { color: #5BE285; }
    .wr-status-text.warning { color: #FFC069; }
    .wr-status-text.danger  { color: #FF8676; }
    .wr-delta {
      font-family: 'Manrope', sans-serif;
      font-size: 16px; font-weight: 600;
      letter-spacing: 0.03em;
      color: #88A5BD; margin-left: 22px;
      vertical-align: middle;
    }

    /* Hero row layout */
    .wr-row-hero {
      display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); gap: 24px;
      align-items: stretch;
    }
    .wr-hero-block {
      background: linear-gradient(135deg, rgba(199,108,15,0.05) 0%, rgba(199,108,15,0) 60%);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 6px;
      padding: 32px 36px;
      display: flex; flex-direction: column; justify-content: center;
      position: relative; overflow: hidden;
    }
    .wr-hero-block::after {
      content: ""; position: absolute; right: -20px; top: -20px;
      width: 240px; height: 240px;
      background: radial-gradient(circle, rgba(199,108,15,0.10) 0%, transparent 70%);
      pointer-events: none;
    }
    .wr-hero-block .wr-mega-status { margin-top: 22px; display: flex; align-items: center; gap: 0; }

    /* RAG breakdown summary tiles (right of hero) */
    .wr-hero-rag {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;
    }
    .wr-rag-summary {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 6px;
      padding: 22px 20px;
      display: flex; flex-direction: column; justify-content: center;
      position: relative; overflow: hidden;
    }
    .wr-rag-summary::before {
      content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
      background: var(--wr-rs-c, #2EBC5D);
    }
    .wr-rag-summary.success { --wr-rs-c: #2EBC5D; }
    .wr-rag-summary.warning { --wr-rs-c: #F0A23A; }
    .wr-rag-summary.danger  { --wr-rs-c: #E64B3A; }
    .wr-rag-summary-num {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: clamp(48px, 5vw, 80px); line-height: 1.0;
      color: #FFFFFF; letter-spacing: -0.01em;
    }
    .wr-rag-summary-lbl {
      font-size: 12px; font-weight: 600; letter-spacing: 0.10em;
      text-transform: uppercase; color: #88A5BD; margin-top: 8px;
    }

    /* 4-tile row */
    .wr-tile-row-4 {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
    }
    .wr-tile {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.06);
      padding: 22px 24px 20px;
      border-radius: 6px;
      display: flex; flex-direction: column; gap: 6px;
      position: relative; overflow: hidden;
    }
    .wr-tile::before {
      content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--wr-tile-c, #2EBC5D);
    }
    .wr-tile.success { --wr-tile-c: #2EBC5D; }
    .wr-tile.warning { --wr-tile-c: #F0A23A; }
    .wr-tile.danger  { --wr-tile-c: #E64B3A; }
    .wr-tile.neutral { --wr-tile-c: #4F90B0; }
    .wr-tile-label {
      font-size: 11.5px; letter-spacing: 0.12em; text-transform: uppercase;
      font-weight: 700; color: #88A5BD;
    }
    .wr-tile-value {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: clamp(40px, 4vw, 60px); line-height: 1.0;
      letter-spacing: -0.012em; color: #FFFFFF;
      margin-top: 4px;
    }
    .wr-tile-value sub {
      font-family: 'Manrope', sans-serif;
      font-size: 18px; color: #88A5BD; vertical-align: baseline;
      margin-left: 4px; font-weight: 500;
    }
    .wr-tile-meta {
      font-size: 13px; color: #B0C5D6; margin-top: 2px;
    }
    .wr-tile-meta strong { color: var(--wr-tile-c, #2EBC5D); font-weight: 700; }

    /* Bottom row layout for slide 1 */
    .wr-row-bottom {
      display: grid; grid-template-columns: 1.1fr 1fr; gap: 18px;
    }
    .wr-panel {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 6px; padding: 22px 24px 20px;
      display: flex; flex-direction: column;
    }
    .wr-panel-title {
      font-size: 11.5px; letter-spacing: 0.12em; text-transform: uppercase;
      font-weight: 700; color: #88A5BD; margin-bottom: 14px;
    }

    /* Unit ranking list (horizontal bars) */
    .wr-unit-list { display: flex; flex-direction: column; gap: 10px; }
    .wr-unit-row {
      display: grid; grid-template-columns: 110px 1fr 90px; gap: 14px;
      align-items: center;
    }
    .wr-unit-name {
      font-size: 14px; font-weight: 600; color: #E6EEF5;
    }
    .wr-unit-bar {
      height: 14px; background: rgba(255,255,255,0.05);
      border-radius: 2px; overflow: hidden; position: relative;
    }
    .wr-unit-bar-fill {
      height: 100%; transition: width 0.6s ease;
    }
    .wr-unit-bar-fill.success { background: linear-gradient(90deg, #2EBC5D, #5BE285); }
    .wr-unit-bar-fill.warning { background: linear-gradient(90deg, #F0A23A, #FFC069); }
    .wr-unit-bar-fill.danger  { background: linear-gradient(90deg, #E64B3A, #FF8676); }
    .wr-unit-bar-target {
      position: absolute; top: -2px; bottom: -2px; width: 2px;
      background: rgba(255,255,255,0.35);
    }
    .wr-unit-value {
      font-family: 'IBM Plex Serif', serif;
      font-size: 22px; color: #FFFFFF; text-align: right; line-height: 1.0;
    }

    /* 14 KPI status grid */
    .wr-grid-rag {
      display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;
      flex: 1;
    }
    .wr-rag-cell {
      aspect-ratio: 1;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 3px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 4px;
      position: relative;
    }
    .wr-rag-cell.success { background: rgba(46,188,93,0.10); border-color: rgba(46,188,93,0.4); }
    .wr-rag-cell.warning { background: rgba(240,162,58,0.12); border-color: rgba(240,162,58,0.4); }
    .wr-rag-cell.danger  { background: rgba(230,75,58,0.14); border-color: rgba(230,75,58,0.55); animation: wr-pulse-cell 1.6s ease-in-out infinite; }
    @keyframes wr-pulse-cell { 50% { background: rgba(230,75,58,0.22); border-color: rgba(230,75,58,0.85); } }
    .wr-rag-cell-cat {
      font-size: 9px; letter-spacing: 0.10em; color: #88A5BD;
      text-transform: uppercase; font-weight: 700;
    }
    .wr-rag-cell-no {
      font-family: 'IBM Plex Serif', serif;
      font-size: 22px; color: #FFFFFF; line-height: 1.0; margin: 2px 0 4px;
    }
    .wr-rag-cell-dot {
      width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 8px currentColor;
    }
    .wr-rag-cell.success .wr-rag-cell-dot { background: #2EBC5D; color: #2EBC5D; }
    .wr-rag-cell.warning .wr-rag-cell-dot { background: #F0A23A; color: #F0A23A; }
    .wr-rag-cell.danger  .wr-rag-cell-dot { background: #E64B3A; color: #E64B3A; }

    /* ---- Slide 2: Financial ---------------------------------------------- */
    .wr-row-finhero { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .wr-fin-hero {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 6px;
      padding: 26px 32px; position: relative; overflow: hidden;
    }
    .wr-fin-hero::before {
      content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
      background: var(--wr-fh-c, #2EBC5D);
    }
    .wr-fin-hero.success { --wr-fh-c: #2EBC5D; }
    .wr-fin-hero.warning { --wr-fh-c: #F0A23A; }
    .wr-fin-hero.danger  { --wr-fh-c: #E64B3A; }
    .wr-fin-hero-label {
      font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
      font-weight: 700; color: #88A5BD;
    }
    .wr-fin-hero-value {
      font-family: 'IBM Plex Serif', serif;
      font-size: clamp(56px, 6vw, 92px); line-height: 1.0; color: #FFFFFF;
      letter-spacing: -0.012em; margin: 8px 0 12px;
    }
    .wr-fin-hero-value .unit {
      font-family: 'Manrope', sans-serif;
      font-size: 22px; color: #6B8FA8; font-weight: 500;
      margin-left: 8px; letter-spacing: 0;
    }
    .wr-fin-hero-meta {
      font-size: 14px; color: #B0C5D6;
      display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
    }
    .wr-fin-hero-meta .wr-status-light { width: 14px; height: 14px; margin-right: 8px; }

    /* ---- Slide 3: Strategic --------------------------------------------- */
    .wr-bsc {
      display: grid; grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr; gap: 16px;
    }
    .wr-bsc-quadrant {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 6px; padding: 22px 26px;
      display: flex; flex-direction: column; gap: 10px;
      position: relative; overflow: hidden;
    }
    .wr-bsc-quadrant::before {
      content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--wr-bq-c, #4F90B0);
    }
    .wr-bsc-q-head { display: flex; align-items: center; justify-content: space-between; }
    .wr-bsc-q-name {
      font-size: 13px; letter-spacing: 0.10em; text-transform: uppercase;
      font-weight: 700; color: #88A5BD;
    }
    .wr-bsc-q-counts { display: flex; gap: 18px; }
    .wr-bsc-q-counts .wr-c { display: flex; align-items: center; gap: 6px; font-size: 13px; }
    .wr-bsc-q-counts .wr-c .dot { width: 10px; height: 10px; border-radius: 50%; }
    .wr-bsc-q-counts .wr-c.success .dot { background: #2EBC5D; box-shadow: 0 0 6px #2EBC5D; }
    .wr-bsc-q-counts .wr-c.warning .dot { background: #F0A23A; box-shadow: 0 0 6px #F0A23A; }
    .wr-bsc-q-counts .wr-c.danger  .dot { background: #E64B3A; box-shadow: 0 0 6px #E64B3A; }
    .wr-bsc-obj {
      padding: 9px 0 8px;
      border-top: 1px solid rgba(255,255,255,0.05);
      display: grid; grid-template-columns: 1fr auto auto; gap: 14px;
      align-items: baseline;
    }
    .wr-bsc-obj:first-of-type { border-top: none; padding-top: 0; }
    .wr-bsc-obj-name { font-size: 14px; color: #E6EEF5; }
    .wr-bsc-obj-val {
      font-family: 'IBM Plex Serif', serif;
      font-size: 22px; color: #FFFFFF; line-height: 1.0;
    }
    .wr-bsc-obj-val sub { font-family: 'Manrope', sans-serif; font-size: 11px; color: #6B8FA8; }
    .wr-bsc-obj-dot { width: 10px; height: 10px; border-radius: 50%; }
    .wr-bsc-obj-dot.success { background: #2EBC5D; box-shadow: 0 0 6px #2EBC5D; }
    .wr-bsc-obj-dot.warning { background: #F0A23A; box-shadow: 0 0 6px #F0A23A; }
    .wr-bsc-obj-dot.danger  { background: #E64B3A; box-shadow: 0 0 6px #E64B3A; }

    .wr-okr-strip {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
    }
    .wr-okr-card {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 6px; padding: 14px 18px;
    }
    .wr-okr-card-name {
      font-size: 12px; color: #B0C5D6; line-height: 1.35;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
      min-height: 32px;
    }
    .wr-okr-card-bar {
      margin-top: 10px; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;
    }
    .wr-okr-card-fill { height: 100%; }
    .wr-okr-card-meta {
      display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px;
    }
    .wr-okr-card-pct {
      font-family: 'IBM Plex Serif', serif; font-size: 24px; color: #FFFFFF; line-height: 1.0;
    }
    .wr-okr-card-status {
      font-size: 10px; letter-spacing: 0.10em; text-transform: uppercase; font-weight: 700;
    }

    /* ---- Slide 4: Risk --------------------------------------------------- */
    .wr-risk-matrix-wrap {
      display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 18px;
    }
    .wr-risk-matrix {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 6px; padding: 22px;
    }
    .wr-risk-matrix-grid {
      display: grid;
      grid-template-columns: 36px repeat(5, 1fr);
      grid-template-rows: 1fr 1fr 1fr 1fr 1fr 36px;
      gap: 6px; aspect-ratio: 6/5; max-height: 380px;
    }
    .wr-risk-cell {
      border-radius: 3px;
      display: flex; align-items: center; justify-content: center;
      font-family: 'IBM Plex Serif', serif; font-size: 20px;
      color: #FFFFFF; position: relative;
    }
    .wr-risk-cell.green   { background: rgba(46,188,93,0.18); border: 1px solid rgba(46,188,93,0.5); }
    .wr-risk-cell.yellow  { background: rgba(240,162,58,0.20); border: 1px solid rgba(240,162,58,0.5); }
    .wr-risk-cell.orange  { background: rgba(230,113,40,0.25); border: 1px solid rgba(230,113,40,0.6); }
    .wr-risk-cell.red     { background: rgba(230,75,58,0.30); border: 1px solid rgba(230,75,58,0.75); }
    .wr-risk-axis-label {
      font-size: 10px; letter-spacing: 0.10em; text-transform: uppercase;
      font-weight: 700; color: #88A5BD; text-align: center;
      display: flex; align-items: center; justify-content: center;
    }
    .wr-risk-axis-label.y { writing-mode: vertical-rl; transform: rotate(180deg); }

    .wr-risk-list { display: flex; flex-direction: column; gap: 8px; }
    .wr-risk-item {
      display: grid; grid-template-columns: 28px 1fr auto; gap: 12px;
      padding: 12px 14px; background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06); border-radius: 4px;
      align-items: center;
    }
    .wr-risk-item .ri-rank {
      font-family: 'IBM Plex Serif', serif; font-size: 24px;
      color: #E64B3A; line-height: 1.0;
    }
    .wr-risk-item .ri-title { font-size: 13.5px; color: #E6EEF5; font-weight: 600; line-height: 1.3; }
    .wr-risk-item .ri-meta { font-size: 11.5px; color: #88A5BD; margin-top: 3px; }
    .wr-risk-item .ri-score {
      font-family: 'IBM Plex Serif', serif; font-size: 22px;
      color: var(--wr-rsc, #E64B3A);
    }

    /* Footer signature on each slide */
    .wr-slide-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 0; margin-top: 4px;
      font-size: 11px; letter-spacing: 0.10em; text-transform: uppercase;
      color: #4D6678; font-weight: 600;
    }

    /* tighter for slides with lots of content */
    @media (max-height: 800px) {
      .wr-slide { padding: 20px 36px 28px; gap: 16px; }
      .wr-mega { font-size: clamp(72px, 9vw, 132px); }
      .wr-tile-value { font-size: clamp(34px, 3.4vw, 50px); }
      .wr-fin-hero-value { font-size: clamp(44px, 5vw, 74px); }
    }
  </style>

  
// ===== script segment =====

    // ====================================================================
    // WAR ROOM SLIDE RENDERERS — purpose-built, visual-management layouts
    // ====================================================================

    const __wrFmt = (n, d = 0) => {
      if (n === null || n === undefined || isNaN(n)) return '—';
      return Number(n).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
    };
    const __wrFmtBig = (n) => {
      // returns "Rp 5,20 M"  or compact form
      if (n >= 1e12) return 'Rp ' + __wrFmt(n / 1e12, 2) + ' T';
      if (n >= 1e9)  return 'Rp ' + __wrFmt(n / 1e9, 2)  + ' M';
      if (n >= 1e6)  return 'Rp ' + __wrFmt(n / 1e6, 2)  + ' jt';
      return 'Rp ' + __wrFmt(n);
    };
    const __wrStatusCls = (st) => {
      if (st === 'success' || st === 'on-track' || st === 'achieved') return 'success';
      if (st === 'warning' || st === 'at-risk') return 'warning';
      if (st === 'danger' || st === 'delayed') return 'danger';
      return 'success';
    };
    const __wrStatusName = (st) => {
      if (st === 'success' || st === 'on-track' || st === 'achieved') return 'BAIK';
      if (st === 'warning' || st === 'at-risk') return 'WASPADA';
      if (st === 'danger' || st === 'delayed') return 'BAHAYA';
      return 'BAIK';
    };

    // ---- Slide 1: KPI Summary -----------------------------------------
    const renderWarroomExecutive = () => {
      const ex = DATA.executive;
      const ops = DATA.operational;
      const sm = ops.summary;
      const hs = ex.healthScore;

      // RAG counts from 14 KPIs
      const allKpis = ops.kpis;
      const cntSuccess = allKpis.filter(k => k.status === 'success').length;
      const cntWarning = allKpis.filter(k => k.status === 'warning').length;
      const cntDanger  = allKpis.filter(k => k.status === 'danger').length;

      const intVal = Math.floor(hs.value);
      const decVal = (hs.value - intVal).toFixed(2).slice(2);

      // Build unit ranking rows
      const unitRanking = [...(ex.unitRanking || [])].sort((a,b) => b.score - a.score);
      const unitNames = window.UNIT_NAMES || {};
      const maxScore = Math.max(...unitRanking.map(u => u.score), 110);
      const unitRows = unitRanking.map(u => {
        const st = u.score >= 100 ? 'success' : u.score >= 95 ? 'warning' : 'danger';
        const pct = Math.min((u.score / maxScore) * 100, 100);
        const targetPct = (100 / maxScore) * 100;
        const name = unitNames[u.code] || u.code;
        return `
          <div class="wr-unit-row">
            <div class="wr-unit-name">${name}</div>
            <div class="wr-unit-bar">
              <div class="wr-unit-bar-fill ${st}" style="width:${pct}%"></div>
              <div class="wr-unit-bar-target" style="left:${targetPct}%"></div>
            </div>
            <div class="wr-unit-value">${__wrFmt(u.score, 2)}</div>
          </div>
        `;
      }).join('');

      // 14 KPI status cells (sorted by number)
      const sortedKpis = [...allKpis].sort((a, b) => (a.no || 99) - (b.no || 99));
      const ragCells = sortedKpis.map(k => `
        <div class="wr-rag-cell ${k.status}">
          <div class="wr-rag-cell-cat">${k.category || ''}</div>
          <div class="wr-rag-cell-no">${k.no}</div>
          <div class="wr-rag-cell-dot"></div>
        </div>
      `).join('') + (sortedKpis.length < 14 ? `
        <div class="wr-rag-cell">
          <div class="wr-rag-cell-cat">PEN</div>
          <div class="wr-rag-cell-no">14</div>
          <div class="wr-rag-cell-dot" style="background:#2EBC5D; box-shadow:0 0 8px #2EBC5D;"></div>
        </div>
      ` : '');

      return `
        <div class="wr-slide wr-slide-kpi">
          <div class="wr-row wr-row-hero">
            <div class="wr-hero-block">
              <div class="wr-eyebrow">Total Nilai Kinerja Korporat &middot; ${DATA.meta.period} ${DATA.meta.periodFull ? '' : ''}</div>
              <div class="wr-h wr-mega">
                ${intVal}<span class="wr-mega-decimal">,${decVal}</span>
                <span class="wr-mega-of">/ ${hs.target}</span>
              </div>
              <div class="wr-mega-status">
                <span class="wr-status-light lg success"></span>
                <span class="wr-status-text success">${(hs.status || 'BAIK').toUpperCase()}</span>
                <span class="wr-delta">+${__wrFmt(hs.delta, 2)} vs ${ex.healthScore.previous ? 'Bulan Lalu' : 'periode lalu'}</span>
              </div>
            </div>
            <div class="wr-hero-rag">
              <div class="wr-rag-summary success">
                <div class="wr-rag-summary-num">${cntSuccess}</div>
                <div class="wr-rag-summary-lbl">On Track</div>
              </div>
              <div class="wr-rag-summary warning">
                <div class="wr-rag-summary-num">${cntWarning}</div>
                <div class="wr-rag-summary-lbl">Waspada</div>
              </div>
              <div class="wr-rag-summary danger">
                <div class="wr-rag-summary-num">${cntDanger}</div>
                <div class="wr-rag-summary-lbl">Miss Target</div>
              </div>
            </div>
          </div>

          <div class="wr-tile-row-4">
            <div class="wr-tile success">
              <div class="wr-tile-label">KPI &middot; Bobot 40</div>
              <div class="wr-tile-value">${__wrFmt(sm.kpiNilai, 2)}<sub>/ ${sm.kpiBobot}</sub></div>
              <div class="wr-tile-meta"><strong>${__wrFmt((sm.kpiNilai/sm.kpiBobot)*100, 1)}%</strong> pencapaian</div>
            </div>
            <div class="wr-tile success">
              <div class="wr-tile-label">PI &middot; Bobot 60</div>
              <div class="wr-tile-value">${__wrFmt(sm.piNilai, 2)}<sub>/ ${sm.piBobot}</sub></div>
              <div class="wr-tile-meta"><strong>${__wrFmt((sm.piNilai/sm.piBobot)*100, 1)}%</strong> pencapaian</div>
            </div>
            <div class="wr-tile success">
              <div class="wr-tile-label">Pengurang Kepatuhan</div>
              <div class="wr-tile-value">${sm.kepatuhanPenalty}<sub>/ −30 max</sub></div>
              <div class="wr-tile-meta"><strong>Bersih</strong> &middot; tidak ada penalti</div>
            </div>
            <div class="wr-tile success">
              <div class="wr-tile-label">Total Nilai Kinerja</div>
              <div class="wr-tile-value">${__wrFmt(sm.totalNilai, 2)}<sub>/ ${sm.totalBobot}</sub></div>
              <div class="wr-tile-meta"><strong>${__wrFmt((sm.totalNilai/sm.totalBobot)*100, 1)}%</strong> &middot; Status ${sm.status}</div>
            </div>
          </div>

          <div class="wr-row-bottom">
            <div class="wr-panel">
              <div class="wr-panel-title">Pencapaian per Unit Kerja &mdash; Kantor Induk &amp; 5 UPMK</div>
              <div class="wr-unit-list">${unitRows}</div>
            </div>
            <div class="wr-panel">
              <div class="wr-panel-title">14 Indikator RKM 2026 &mdash; Status</div>
              <div class="wr-grid-rag">${ragCells}</div>
              <div class="wr-slide-footer">
                <span>${cntSuccess} ON TRACK &middot; ${cntWarning} WASPADA &middot; ${cntDanger} BAHAYA</span>
              </div>
            </div>
          </div>
        </div>
      `;
    };

    // ---- Slide 2: Financial -------------------------------------------
    const renderWarroomFinancial = () => {
      const f = DATA.financial;
      const kpiStrip = f.kpiStrip || [];
      const opex = kpiStrip.find(k => k.id === 'opex');
      const capex = kpiStrip.find(k => k.id === 'capex');
      const pdn = kpiStrip.find(k => k.id === 'pdn');
      const bobot = kpiStrip.find(k => k.id === 'bobot');
      const tjsl = kpiStrip.find(k => k.id === 'tjsl');

      const opexStatus = opex && opex.vsTarget <= 5 ? 'success' : 'warning';
      const capexStatus = capex && capex.value >= 95 ? 'success' : 'warning';

      // 4 ratio tiles
      const tilesData = [
        { label: 'Pemenuhan PDN Korporat', value: pdn ? pdn.formatted : '—', meta: `<strong>+${__wrFmt(pdn?.vsTarget || 0, 1)}%</strong> vs target (95%)`, status: 'success' },
        { label: 'Nilai Pengendalian Anggaran', value: bobot ? bobot.formatted : '—', meta: `<strong>+${__wrFmt(bobot?.vsTarget || 0, 1)}%</strong> vs target`, status: 'success' },
        { label: 'Pengelolaan TJSL', value: tjsl ? tjsl.formatted : '—', meta: `<strong>SROI</strong> aktif &middot; target tercapai`, status: 'success' },
        { label: 'Variance OPEX vs RKAP', value: '−2,4%', meta: `<strong>Below RKAP</strong> &middot; Hemat Rp 128 M`, status: 'success' },
      ];

      // Top variance (placeholder data — using investasiPerUnit)
      const inv = f.investasiPerUnit || [];
      const topInv = [...inv].sort((a,b) => (b.realisasi||0) - (a.realisasi||0)).slice(0, 6);
      const maxInv = Math.max(...topInv.map(u => u.target || 1), 1);
      const invRows = topInv.map(u => {
        const pct = Math.min(((u.realisasi || 0) / (u.target || 1)) * 100, 110);
        const st = pct >= 95 ? 'success' : pct >= 90 ? 'warning' : 'danger';
        return `
          <div class="wr-unit-row">
            <div class="wr-unit-name">${u.unit || u.name}</div>
            <div class="wr-unit-bar">
              <div class="wr-unit-bar-fill ${st}" style="width:${Math.min((u.realisasi||0)/maxInv*100, 100)}%"></div>
              <div class="wr-unit-bar-target" style="left:${(u.target/maxInv)*100}%"></div>
            </div>
            <div class="wr-unit-value">${__wrFmt(pct, 1)}<sub style="font-family:Manrope,sans-serif;font-size:11px;color:#6B8FA8;"> %</sub></div>
          </div>
        `;
      }).join('');

      return `
        <div class="wr-slide wr-slide-financial">
          <div class="wr-row-finhero">
            <div class="wr-fin-hero ${opexStatus}">
              <div class="wr-fin-hero-label">Realisasi OPEX Non-Fuel YTD</div>
              <div class="wr-fin-hero-value">${__wrFmtBig(opex?.value || 0)}<span class="unit">vs RKAP 5,32 M</span></div>
              <div class="wr-fin-hero-meta">
                <span><span class="wr-status-light ${opexStatus}"></span><strong style="color:#5BE285;">−${Math.abs(opex?.vsTarget || 0).toFixed(1)}%</strong> di bawah target</span>
                <span>vs Prior Year: <strong style="color:#FFFFFF;">+${__wrFmt(opex?.vsPriorYear || 0, 1)}%</strong></span>
              </div>
            </div>
            <div class="wr-fin-hero ${capexStatus}">
              <div class="wr-fin-hero-label">Realisasi Capex &middot; % AKI 2026</div>
              <div class="wr-fin-hero-value">${__wrFmt(capex?.value || 0, 1)}<span class="unit">%</span></div>
              <div class="wr-fin-hero-meta">
                <span><span class="wr-status-light ${capexStatus}"></span><strong style="color:#5BE285;">+${__wrFmt(capex?.vsTarget || 0, 1)}%</strong> vs target</span>
                <span>vs Prior Year: <strong style="color:#FFFFFF;">+${__wrFmt(capex?.vsPriorYear || 0, 1)}%</strong></span>
              </div>
            </div>
          </div>

          <div class="wr-tile-row-4">
            ${tilesData.map(t => `
              <div class="wr-tile ${t.status}">
                <div class="wr-tile-label">${t.label}</div>
                <div class="wr-tile-value">${t.value}</div>
                <div class="wr-tile-meta">${t.meta}</div>
              </div>
            `).join('')}
          </div>

          <div class="wr-panel">
            <div class="wr-panel-title">Realisasi Capex per Unit Kerja &mdash; % terhadap Target</div>
            <div class="wr-unit-list">${invRows}</div>
          </div>

          <div class="wr-slide-footer">
            <span>SUMBER: LAPORAN KEUANGAN PUSMANPRO &middot; ${DATA.meta.period}</span>
            <span>RKAP 2026</span>
          </div>
        </div>
      `;
    };

    // ---- Slide 3: Strategic -------------------------------------------
    const renderWarroomStrategic = () => {
      const s = DATA.strategic;
      const ps = s.perspectives;
      const okrs = s.okrs || [];

      // Aggregate counts
      let totalObj = 0, onTrack = 0, atRisk = 0, achieved = 0;
      Object.values(ps).forEach(p => {
        p.objectives.forEach(o => {
          totalObj++;
          if (o.status === 'on-track') onTrack++;
          else if (o.status === 'at-risk') atRisk++;
          if (o.status === 'achieved') achieved++;
        });
      });

      const Q_COLOR = { financial: '#2EBC5D', customer: '#C76C0F', internal: '#4F90B0', learning: '#7C3AED' };
      const renderQuadrant = (key, p) => {
        const onTrackC = p.objectives.filter(o => o.status === 'on-track' || o.status === 'achieved').length;
        const atRiskC = p.objectives.filter(o => o.status === 'at-risk').length;
        const dangerC = p.objectives.filter(o => o.status === 'delayed' || o.status === 'danger').length;
        const objsHtml = p.objectives.slice(0, 5).map(o => {
          const targetText = (typeof o.target === 'number') ? __wrFmt(o.target, o.target % 1 ? 2 : 0) : o.target;
          const actualText = (typeof o.actual === 'number') ? __wrFmt(o.actual, o.actual % 1 ? 2 : 0) : o.actual;
          return `
            <div class="wr-bsc-obj">
              <div class="wr-bsc-obj-name">${o.name}</div>
              <div class="wr-bsc-obj-val">${actualText}<sub> / ${targetText}</sub></div>
              <div class="wr-bsc-obj-dot ${__wrStatusCls(o.status)}"></div>
            </div>
          `;
        }).join('');
        return `
          <div class="wr-bsc-quadrant" style="--wr-bq-c: ${Q_COLOR[key] || '#4F90B0'};">
            <div class="wr-bsc-q-head">
              <div class="wr-bsc-q-name">${p.name}</div>
              <div class="wr-bsc-q-counts">
                <div class="wr-c success"><span class="dot"></span>${onTrackC}</div>
                ${atRiskC > 0 ? `<div class="wr-c warning"><span class="dot"></span>${atRiskC}</div>` : ''}
                ${dangerC > 0 ? `<div class="wr-c danger"><span class="dot"></span>${dangerC}</div>` : ''}
              </div>
            </div>
            ${objsHtml}
          </div>
        `;
      };

      const okrCards = okrs.map(o => {
        const st = __wrStatusCls(o.status);
        const stColor = st === 'success' ? '#2EBC5D' : st === 'warning' ? '#F0A23A' : '#E64B3A';
        const stLabel = o.status === 'on-track' ? 'ON TRACK' : o.status === 'at-risk' ? 'AT RISK' : o.status === 'achieved' ? 'ACHIEVED' : 'DELAYED';
        return `
          <div class="wr-okr-card">
            <div class="wr-okr-card-name">${o.obj}</div>
            <div class="wr-okr-card-bar"><div class="wr-okr-card-fill" style="width:${o.progress}%; background:${stColor};"></div></div>
            <div class="wr-okr-card-meta">
              <div class="wr-okr-card-pct">${o.progress}<sub style="font-family:Manrope,sans-serif;font-size:11px;color:#6B8FA8;">%</sub></div>
              <div class="wr-okr-card-status" style="color:${stColor};">${stLabel}</div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="wr-slide wr-slide-strategic">
          <div class="wr-row wr-row-hero">
            <div class="wr-hero-block">
              <div class="wr-eyebrow">Strategic Targets &middot; Balanced Scorecard &middot; ${DATA.meta.period}</div>
              <div style="display:flex; gap:48px; align-items:baseline; margin-top:10px;">
                <div>
                  <div class="wr-h wr-big">${totalObj}</div>
                  <div class="wr-eyebrow" style="margin-top:6px;">Total Objectives</div>
                </div>
                <div>
                  <div class="wr-h wr-big" style="color:#5BE285;">${onTrack + achieved}</div>
                  <div class="wr-eyebrow" style="margin-top:6px;">On Track / Achieved</div>
                </div>
                <div>
                  <div class="wr-h wr-big" style="color:#FFC069;">${atRisk}</div>
                  <div class="wr-eyebrow" style="margin-top:6px;">At Risk</div>
                </div>
              </div>
            </div>
            <div class="wr-hero-rag">
              <div class="wr-rag-summary success">
                <div class="wr-rag-summary-num">${Math.round(((onTrack + achieved) / totalObj) * 100)}%</div>
                <div class="wr-rag-summary-lbl">Achievement</div>
              </div>
              <div class="wr-rag-summary warning">
                <div class="wr-rag-summary-num">${okrs.length}</div>
                <div class="wr-rag-summary-lbl">OKRs Aktif</div>
              </div>
              <div class="wr-rag-summary success">
                <div class="wr-rag-summary-num">${Math.round(okrs.reduce((s,o) => s + o.progress, 0) / okrs.length)}<span style="font-size:0.5em; color:#88A5BD;">%</span></div>
                <div class="wr-rag-summary-lbl">Avg Progress</div>
              </div>
            </div>
          </div>

          <div class="wr-bsc">
            ${renderQuadrant('financial', ps.financial)}
            ${renderQuadrant('customer',  ps.customer)}
            ${renderQuadrant('internal',  ps.internal)}
            ${renderQuadrant('learning',  ps.learning)}
          </div>

          <div class="wr-okr-strip">${okrCards}</div>
        </div>
      `;
    };

    // ---- Slide 4: Risk ------------------------------------------------
    const renderWarroomRisk = () => {
      const r = DATA.risk;
      const kpis = r.kpis || [];
      const total = kpis.find(k => k.id === 'total') || { value: 0 };
      const critical = kpis.find(k => k.id === 'critical') || { value: 0 };
      const mitigated = kpis.find(k => k.id === 'mitigated') || { value: 0, formatted: '0%' };
      const residual = kpis.find(k => k.id === 'residual') || { value: 0 };

      // Build 5x5 risk matrix counts from register
      const register = r.register || [];
      const matrix = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
      register.forEach(rk => {
        const p = Math.max(1, Math.min(5, Math.round(rk.probability || rk.likelihood || rk.probabilityLevel || 3))) - 1;
        const i = Math.max(1, Math.min(5, Math.round(rk.impact || rk.impactLevel || 3))) - 1;
        matrix[i][p]++;
      });

      // Heatmap zones (impact x probability): mapping based on standard 5x5
      const zoneFor = (imp, prob) => {
        const score = (imp + 1) * (prob + 1); // 1-25
        if (score >= 15) return 'red';
        if (score >= 10) return 'orange';
        if (score >= 5)  return 'yellow';
        return 'green';
      };

      // Render matrix grid (impact rows top→bottom 5..1; probability cols left→right 1..5)
      let matrixCells = '<div class="wr-risk-axis-label y" style="grid-row: 1 / 6;">Dampak →</div>';
      for (let i = 4; i >= 0; i--) {
        for (let p = 0; p < 5; p++) {
          const z = zoneFor(i, p);
          const count = matrix[i][p];
          matrixCells += `<div class="wr-risk-cell ${z}" title="Impact ${i+1} × Probability ${p+1}: ${count} risiko">${count || ''}</div>`;
        }
      }
      // Bottom axis row (empty cell under Y label + 5 prob labels)
      matrixCells += '<div></div>';
      for (let p = 1; p <= 5; p++) matrixCells += `<div class="wr-risk-axis-label">${p === 1 ? 'Rendah' : p === 3 ? 'Probabilitas' : p === 5 ? 'Tinggi' : ''}</div>`;

      // Top 5 risks by inherent score
      const topRisks = [...register]
        .map(rk => ({...rk, score: (rk.impact || 3) * (rk.probability || rk.likelihood || 3)}))
        .sort((a,b) => b.score - a.score).slice(0, 5);
      const topRiskRows = topRisks.map((rk, idx) => {
        const s = rk.score;
        const color = s >= 15 ? '#E64B3A' : s >= 10 ? '#F0A23A' : s >= 5 ? '#FFC069' : '#5BE285';
        return `
          <div class="wr-risk-item">
            <div class="ri-rank">${idx+1}</div>
            <div>
              <div class="ri-title">${rk.title || rk.name || ('Risiko ' + (rk.id || idx+1))}</div>
              <div class="ri-meta">${rk.category || rk.bu || ''}${rk.owner ? ' &middot; ' + rk.owner : ''}</div>
            </div>
            <div class="ri-score" style="--wr-rsc:${color};color:${color};">${s}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="wr-slide wr-slide-risk">
          <div class="wr-row wr-row-hero">
            <div class="wr-hero-block">
              <div class="wr-eyebrow">Manajemen Risiko &middot; Register Aktif &middot; ${DATA.meta.period}</div>
              <div style="display:flex; gap:64px; align-items:baseline; margin-top:10px;">
                <div>
                  <div class="wr-h wr-mega" style="font-size:clamp(64px, 7vw, 110px);">${total.value}</div>
                  <div class="wr-eyebrow" style="margin-top:6px;">Risiko Aktif</div>
                </div>
                <div>
                  <div class="wr-h wr-mega" style="font-size:clamp(64px, 7vw, 110px); color:#FF8676;">${critical.value}</div>
                  <div class="wr-eyebrow" style="margin-top:6px; color:#FF8676;">Critical &amp; High</div>
                </div>
              </div>
            </div>
            <div class="wr-hero-rag">
              <div class="wr-rag-summary success">
                <div class="wr-rag-summary-num">${mitigated.formatted || mitigated.value + '%'}</div>
                <div class="wr-rag-summary-lbl">Termitigasi</div>
              </div>
              <div class="wr-rag-summary warning">
                <div class="wr-rag-summary-num">${__wrFmt(residual.value, 1)}</div>
                <div class="wr-rag-summary-lbl">Avg Residual</div>
              </div>
              <div class="wr-rag-summary danger">
                <div class="wr-rag-summary-num">${Math.max(0, critical.value)}</div>
                <div class="wr-rag-summary-lbl">Need Action</div>
              </div>
            </div>
          </div>

          <div class="wr-risk-matrix-wrap">
            <div class="wr-risk-matrix">
              <div class="wr-panel-title">Matriks 5×5 &mdash; Dampak vs Probabilitas &middot; Jumlah Risiko per Sel</div>
              <div class="wr-risk-matrix-grid">${matrixCells}</div>
            </div>
            <div class="wr-panel">
              <div class="wr-panel-title">Top 5 Risiko by Score</div>
              <div class="wr-risk-list">${topRiskRows || '<div class="ri-meta" style="padding:14px;color:#88A5BD;">Tidak ada data risiko ter-register.</div>'}</div>
            </div>
          </div>

          <div class="wr-slide-footer">
            <span>SUMBER: REGISTER RISIKO PUSMANPRO &middot; ${DATA.meta.period}</span>
            <span>METODE: 5×5 MATRIX</span>
          </div>
        </div>
      `;
    };

    const WARROOM_SLIDES = {
      'executive-summary': renderWarroomExecutive,
      'financial':         renderWarroomFinancial,
      'strategic':         renderWarroomStrategic,
      'risk':              renderWarroomRisk,
    };

    // After the original handler renders the page, replace #main-inner with our war-room slide
    const __wrRender = () => {
      if (!warroomState.active) return;
      const route = (location.hash.slice(1) || '').split('?')[0];
      const renderer = WARROOM_SLIDES[route];
      if (!renderer) return;
      // Destroy any in-flight charts from original PAGE_INIT
      if (typeof destroyAllCharts === 'function') destroyAllCharts();
      const main = document.getElementById('main-inner');
      if (!main) return;
      main.innerHTML = renderer();
      if (window.lucide) window.lucide.createIcons();
      // Reset scroll
      document.querySelector('.main').scrollTop = 0;
    };

    // Listen AFTER the original handler (which is registered earlier).
    // The original renderPlaceholder + PAGE_INIT (setTimeout 50ms) will fire first;
    // we run on a microtask after them to ensure final state.
    window.addEventListener('hashchange', () => {
      setTimeout(__wrRender, 80);
    });

    // Hook into enter / exit
    const __origEnterWarroom = enterWarroom;
    window.enterWarroom = function() {
      __origEnterWarroom();
      setTimeout(__wrRender, 100);
    };
    const __origExitWarroom = exitWarroom;
    window.exitWarroom = function() {
      __origExitWarroom();
      // Trigger a re-render of the actual page (it was overwritten by warroom slide)
      if (typeof renderPlaceholder === 'function') {
        renderPlaceholder(state.currentRoute);
      }
    };
    // Rebind warroom button to the new wrapped enter
    const wrBtn2 = document.getElementById('warroom-btn');
    if (wrBtn2) {
      const newBtn = wrBtn2.cloneNode(true);
      wrBtn2.parentNode.replaceChild(newBtn, wrBtn2);
      newBtn.addEventListener('click', () => window.enterWarroom());
    }
    // Rebind exit and pause too (the original handlers reference the un-wrapped exitWarroom)
    const exitB = document.getElementById('warroom-exit');
    if (exitB) {
      const nb = exitB.cloneNode(true);
      exitB.parentNode.replaceChild(nb, exitB);
      nb.addEventListener('click', () => window.exitWarroom());
    }
    // Re-bind ESC handler (so it uses the wrapped exit)
    document.addEventListener('keydown', (e) => {
      if (warroomState.active && e.key === 'Escape') {
        e.preventDefault();
        window.exitWarroom();
      }
    }, true);

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 200);
  


  <!-- ====================================================================
       INPUT REALISASI BULANAN — Dedicated staff data-entry workflow
       ==================================================================== -->
  <style id="v3-input-page">
    /* Sidebar CTA — primary action treatment */
    .nav-item-cta {
      background: linear-gradient(135deg, rgba(199,108,15,0.10) 0%, rgba(199,108,15,0.02) 100%);
      border-left: 3px solid var(--color-accent) !important;
      position: relative;
    }
    .nav-item-cta:hover { background: rgba(199,108,15,0.18) !important; color: #FFFFFF !important; }
    .nav-deadline-pill {
      margin-left: auto;
      background: var(--color-accent);
      color: #FFFFFF;
      font-size: 10px; font-weight: 700;
      padding: 2px 7px; border-radius: 3px;
      letter-spacing: 0.04em;
    }
    [data-sidebar="collapsed"] .nav-deadline-pill { display: none; }

    /* Input page layout */
    .ir-toolbar {
      position: sticky; top: 0; z-index: 10;
      display: grid;
      grid-template-columns: 1fr 1fr auto auto;
      gap: 14px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      padding: 16px 20px;
      margin-bottom: 18px;
      align-items: end;
    }
    .ir-toolbar-group { display: flex; flex-direction: column; gap: 6px; }
    .ir-toolbar-label {
      font-size: 10.5px; font-weight: 600; letter-spacing: 0.10em;
      text-transform: uppercase; color: var(--color-text-subtle);
    }
    .ir-toolbar-select {
      width: 100%;
      background: var(--color-surface);
      border: 1px solid var(--color-border-strong);
      border-radius: 4px;
      padding: 9px 12px;
      font-size: 13.5px; color: var(--color-text);
      font-family: inherit; font-weight: 500;
      cursor: pointer;
    }
    .ir-toolbar-select:focus { outline: 2px solid var(--color-brand); outline-offset: 0; border-color: var(--color-brand); }
    .ir-deadline {
      display: flex; flex-direction: column; gap: 4px;
      padding: 9px 16px;
      background: var(--color-accent-tint);
      border: 1px solid var(--color-accent);
      border-radius: 4px;
      min-width: 140px;
    }
    .ir-deadline-label { font-size: 10px; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; color: var(--color-accent); }
    .ir-deadline-value { font-family: 'IBM Plex Serif', Georgia, serif; font-size: 20px; color: var(--color-text); line-height: 1.0; }
    .ir-deadline.overdue { background: var(--color-danger-tint); border-color: var(--color-danger); }
    .ir-deadline.overdue .ir-deadline-label,
    .ir-deadline.overdue .ir-deadline-value { color: var(--color-danger); }
    .ir-role-badge {
      display: flex; flex-direction: column; gap: 4px;
      padding: 9px 16px;
      background: var(--color-surface-2);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      min-width: 160px;
    }
    .ir-role-label { font-size: 10px; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; color: var(--color-text-subtle); }
    .ir-role-value { font-size: 13.5px; font-weight: 600; color: var(--color-text); }

    /* Progress strip */
    .ir-progress-strip {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 1px;
      background: var(--color-border);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      margin-bottom: 22px;
      overflow: hidden;
    }
    .ir-prog-cell {
      background: var(--color-surface);
      padding: 16px 22px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .ir-prog-cell .ir-prog-label {
      font-size: 10.5px; font-weight: 600; letter-spacing: 0.10em;
      text-transform: uppercase; color: var(--color-text-subtle);
    }
    .ir-prog-cell .ir-prog-value {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: 28px; color: var(--color-text); line-height: 1.0; letter-spacing: -0.012em;
    }
    .ir-prog-cell .ir-prog-meta { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }
    .ir-prog-cell.success .ir-prog-value { color: var(--color-success); }
    .ir-prog-cell.warning .ir-prog-value { color: var(--color-warning); }
    .ir-prog-cell.danger  .ir-prog-value { color: var(--color-danger); }
    .ir-prog-cell.primary { background: var(--color-surface-2); }
    .ir-prog-bar { height: 4px; background: var(--color-surface-sunken); border-radius: 2px; overflow: hidden; margin-top: 8px; }
    .ir-prog-bar-fill { height: 100%; background: var(--color-brand); transition: width 0.4s ease; }

    /* Input table */
    .ir-table-wrap {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      overflow: auto;
      margin-bottom: 18px;
    }
    .ir-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .ir-table thead th {
      background: var(--color-surface-2);
      color: var(--color-text-subtle);
      font-weight: 600; font-size: 10.5px; letter-spacing: 0.10em;
      text-transform: uppercase; text-align: left;
      padding: 12px 14px;
      border-bottom: 1px solid var(--color-border);
      position: sticky; top: 0; z-index: 1;
      white-space: nowrap;
    }
    .ir-table tbody td {
      padding: 11px 14px;
      border-bottom: 1px solid var(--color-border-subtle);
      vertical-align: middle;
    }
    .ir-table tbody tr:hover td { background: var(--color-surface-2); }
    .ir-table tbody tr.section-divider td {
      background: var(--color-surface-sunken);
      padding: 8px 14px;
      font-size: 10.5px; font-weight: 700; letter-spacing: 0.10em;
      text-transform: uppercase; color: var(--color-text-subtle);
    }
    .ir-row-no {
      width: 32px;
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: 16px; color: var(--color-text);
    }
    .ir-row-cat {
      display: inline-block; padding: 2px 7px; border-radius: 3px;
      font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
    }
    .ir-row-cat.KPI { background: var(--color-brand-tint); color: var(--color-brand); }
    .ir-row-cat.PI  { background: var(--color-info-tint); color: var(--color-info); }
    .ir-row-cat.PEN { background: var(--color-danger-tint); color: var(--color-danger); }
    .ir-row-name {
      font-weight: 600; color: var(--color-text);
      max-width: 320px;
      line-height: 1.35;
    }
    .ir-row-meta {
      font-size: 11px; color: var(--color-text-subtle);
      margin-top: 2px; font-weight: 400;
    }
    .ir-row-num {
      font-family: 'IBM Plex Serif', Georgia, serif;
      color: var(--color-text); text-align: right;
      white-space: nowrap;
    }
    .ir-row-num .unit { font-family: 'Manrope', sans-serif; font-size: 11px; color: var(--color-text-subtle); margin-left: 3px; }
    .ir-row-num.muted { color: var(--color-text-subtle); }
    .ir-row-input {
      width: 110px;
      background: #FFFFFF;
      border: 1px solid var(--color-border-strong);
      border-radius: 3px;
      padding: 7px 10px;
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: 15px; color: var(--color-text);
      text-align: right;
      font-weight: 500;
      transition: border-color 120ms ease, box-shadow 120ms ease;
    }
    .ir-row-input:focus {
      outline: none; border-color: var(--color-brand);
      box-shadow: 0 0 0 3px var(--color-brand-tint);
    }
    .ir-row-input.touched { background: #FFF8EB; border-color: var(--color-accent); }
    .ir-row-input.invalid { background: rgba(180,35,24,0.06); border-color: var(--color-danger); color: var(--color-danger); }

    .ir-row-achievement {
      font-family: 'IBM Plex Serif', serif;
      font-size: 15px; text-align: right;
      white-space: nowrap;
    }
    .ir-row-achievement.success { color: var(--color-success); }
    .ir-row-achievement.warning { color: var(--color-warning); }
    .ir-row-achievement.danger  { color: var(--color-danger); }
    .ir-row-achievement.empty   { color: var(--color-text-subtle); }

    .ir-row-status .status-pill { padding: 2px 7px !important; font-size: 10px !important; }
    .ir-row-actions { display: flex; gap: 6px; align-items: center; }

    /* Analisis button — primary per-row action */
    .ir-analisis-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 10px;
      background: var(--color-surface-2);
      border: 1px solid var(--color-border);
      border-radius: 3px;
      cursor: pointer;
      font-family: inherit;
      font-size: 11.5px; font-weight: 600;
      color: var(--color-text-muted);
      transition: all 120ms ease;
      white-space: nowrap;
      min-height: 30px;
    }
    .ir-analisis-btn:hover { background: var(--color-brand-tint); color: var(--color-brand); border-color: var(--color-brand); }
    .ir-analisis-btn i { width: 13px; height: 13px; flex-shrink: 0; }
    .ir-analisis-btn.has-content {
      background: var(--color-brand-tint);
      border-color: var(--color-brand);
      color: var(--color-brand);
    }
    .ir-analisis-btn.needs-input {
      background: rgba(180,35,24,0.06);
      border-color: var(--color-danger);
      color: var(--color-danger);
      animation: ir-needs-pulse 2s ease-in-out infinite;
    }
    @keyframes ir-needs-pulse {
      50% { background: rgba(180,35,24,0.14); }
    }
    .ir-analisis-tags { display: inline-flex; gap: 3px; margin-left: 4px; }
    .ir-analisis-tags .t-tag {
      font-size: 9px; font-weight: 700; letter-spacing: 0.04em;
      padding: 1px 4px; border-radius: 2px; line-height: 1.3;
      background: rgba(18,93,114,0.12); color: var(--color-brand);
    }
    .ir-analisis-tags .t-rc { background: rgba(180,35,24,0.16); color: var(--color-danger); }
    .ir-analisis-tags .t-ap { background: rgba(199,108,15,0.16); color: var(--color-accent); }
    .ir-analisis-tags .t-cm { background: rgba(14,116,144,0.16); color: var(--color-info); }
    .ir-analisis-tags .t-ev { background: rgba(27,127,62,0.16); color: var(--color-success); }

    /* Legacy buttons (still defined for safety, not used in new template) */
    .ir-evidence-btn, .ir-comment-btn {
      width: 30px; height: 30px;
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      border-radius: 3px;
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer;
      color: var(--color-text-subtle);
      transition: all 120ms ease;
      position: relative;
    }
    .ir-evidence-btn:hover, .ir-comment-btn:hover { background: var(--color-surface-2); color: var(--color-text); }
    .ir-evidence-btn.has-content, .ir-comment-btn.has-content {
      background: var(--color-brand-tint);
      border-color: var(--color-brand);
      color: var(--color-brand);
    }
    .ir-evidence-btn i, .ir-comment-btn i { width: 14px; height: 14px; }
    .ir-evidence-btn .ir-dot {
      position: absolute; top: 3px; right: 3px;
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--color-brand);
    }

    /* Action bar */
    .ir-actionbar {
      display: flex; gap: 14px; align-items: center; justify-content: space-between;
      padding: 16px 20px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }
    .ir-actionbar-info { font-size: 12.5px; color: var(--color-text-muted); }
    .ir-actionbar-info strong { color: var(--color-text); }
    .ir-actionbar-buttons { display: flex; gap: 10px; }
    .ir-actionbar .btn { padding: 10px 18px !important; font-size: 13px !important; }
    .ir-autosave-indicator {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 11.5px; color: var(--color-success);
      padding: 3px 8px; background: var(--color-success-tint); border-radius: 3px;
    }
    .ir-autosave-indicator i { width: 12px; height: 12px; }

    /* Recent submissions panel */
    .ir-history-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      padding: 20px 22px;
    }
    .ir-history-title {
      font-size: 13px; font-weight: 600; color: var(--color-text);
      letter-spacing: -0.005em;
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border);
    }
    .ir-history-title i { width: 15px; height: 15px; color: var(--color-brand); }
    .ir-history-list { display: flex; flex-direction: column; gap: 8px; }
    .ir-history-item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 14px;
      padding: 12px 14px;
      background: var(--color-surface-2);
      border: 1px solid var(--color-border-subtle);
      border-radius: 3px;
      align-items: center;
    }
    .ir-history-item .h-period { font-family: 'IBM Plex Serif', serif; font-size: 16px; color: var(--color-text); line-height: 1.0; }
    .ir-history-item .h-period sub { display: block; font-family: 'Manrope', sans-serif; font-size: 10px; color: var(--color-text-subtle); margin-top: 4px; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 600; }
    .ir-history-item .h-info { min-width: 0; }
    .ir-history-item .h-summary { font-size: 13px; color: var(--color-text); font-weight: 500; }
    .ir-history-item .h-meta { font-size: 11px; color: var(--color-text-subtle); margin-top: 2px; }
    .ir-history-item .h-status { display: flex; align-items: center; gap: 8px; }
    .ir-history-item .h-status .status-pill { font-size: 10px !important; padding: 2px 7px !important; }

    /* Analisis modal — comprehensive per-KPI form (mirrors management summary) */
    .ir-analisis-modal-body { padding: 0; }
    .ir-am-context {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 1px;
      background: var(--color-border);
      border-bottom: 1px solid var(--color-border);
    }
    .ir-am-context-cell {
      background: var(--color-surface-2);
      padding: 12px 14px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .ir-am-context-cell.wide { grid-column: span 2; }
    .ir-am-context-cell .label {
      font-size: 9.5px; font-weight: 700; letter-spacing: 0.10em;
      text-transform: uppercase; color: var(--color-text-subtle);
    }
    .ir-am-context-cell .value {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: 17px; color: var(--color-text); line-height: 1.1;
    }
    .ir-am-context-cell .value .unit {
      font-family: 'Manrope', sans-serif; font-size: 11px;
      color: var(--color-text-subtle); margin-left: 3px; font-weight: 500;
    }
    .ir-am-context-cell.gap .value { color: var(--color-danger); }
    .ir-am-context-cell.success .value { color: var(--color-success); }

    .ir-am-fields {
      padding: 18px 20px;
      display: flex; flex-direction: column; gap: 16px;
    }
    .ir-am-field {
      display: flex; flex-direction: column; gap: 6px;
    }
    .ir-am-field-head {
      display: flex; align-items: center; justify-content: space-between;
    }
    .ir-am-field-label {
      display: flex; align-items: center; gap: 7px;
      font-size: 12px; font-weight: 700; letter-spacing: 0.06em;
      text-transform: uppercase; color: var(--color-text);
    }
    .ir-am-field-label i { width: 14px; height: 14px; color: var(--color-brand); }
    .ir-am-required {
      font-size: 9.5px; font-weight: 700; letter-spacing: 0.08em;
      color: var(--color-danger); background: rgba(180,35,24,0.08);
      padding: 2px 7px; border-radius: 2px;
    }
    .ir-am-optional {
      font-size: 9.5px; font-weight: 600; letter-spacing: 0.08em;
      color: var(--color-text-subtle);
    }
    .ir-am-help {
      font-size: 11.5px; color: var(--color-text-subtle);
      line-height: 1.5;
    }
    .ir-am-textarea {
      width: 100%; min-height: 80px;
      background: var(--color-surface);
      border: 1px solid var(--color-border-strong);
      border-radius: 3px;
      padding: 10px 12px;
      font: inherit; font-size: 13px;
      color: var(--color-text);
      resize: vertical;
      box-sizing: border-box;
      transition: border-color 120ms ease, box-shadow 120ms ease;
    }
    .ir-am-textarea:focus {
      outline: none;
      border-color: var(--color-brand);
      box-shadow: 0 0 0 3px var(--color-brand-tint);
    }
    .ir-am-textarea.required-empty {
      border-color: var(--color-danger);
      background: rgba(180,35,24,0.03);
    }
    .ir-am-input {
      width: 100%;
      background: var(--color-surface);
      border: 1px solid var(--color-border-strong);
      border-radius: 3px;
      padding: 9px 12px;
      font: inherit; font-size: 13px;
      color: var(--color-text);
      box-sizing: border-box;
    }
    .ir-am-input:focus {
      outline: none; border-color: var(--color-brand);
      box-shadow: 0 0 0 3px var(--color-brand-tint);
    }

    /* Confirm submit dialog */
    .ir-submit-summary {
      background: var(--color-surface-2);
      border: 1px solid var(--color-border);
      border-radius: 3px;
      padding: 14px 16px;
      margin: 12px 0;
    }
    .ir-submit-summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
    .ir-submit-summary-row .label { color: var(--color-text-subtle); }
    .ir-submit-summary-row .value { color: var(--color-text); font-weight: 600; font-family: 'IBM Plex Serif', serif; }
    .ir-workflow-preview { display: flex; gap: 4px; align-items: center; margin-top: 12px; }
    .ir-workflow-step {
      flex: 1;
      padding: 8px 4px;
      text-align: center;
      font-size: 10.5px; font-weight: 600;
      letter-spacing: 0.04em;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 3px;
      color: var(--color-text-subtle);
      position: relative;
    }
    .ir-workflow-step.active {
      background: var(--color-brand-tint);
      border-color: var(--color-brand);
      color: var(--color-brand);
    }
    .ir-workflow-step::after {
      content: ""; position: absolute; right: -8px; top: 50%;
      width: 0; height: 0; transform: translateY(-50%);
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-left: 5px solid var(--color-border);
    }
    .ir-workflow-step:last-child::after { display: none; }
    .ir-workflow-step.active::after { border-left-color: var(--color-brand); }
  </style>

  
// ===== script segment =====

    // ====================================================================
    // INPUT REALISASI BULANAN — page implementation
    // ====================================================================

    // Compute deadline countdown — deadline = 3rd of current month
    const __irMonths = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const __irGenPeriods = () => {
      const out = [];
      const now = new Date();
      // Build last 3 periods to allow back-input
      for (let i = 0; i < 3; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        out.push({ key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, label: `${__irMonths[d.getMonth()]} ${d.getFullYear()}` });
      }
      return out;
    };
    const __irUnits = [
      { code: 'KP',    name: 'Kantor Induk' },
      { code: 'UPMK1', name: 'UPMK I' },
      { code: 'UPMK2', name: 'UPMK II' },
      { code: 'UPMK3', name: 'UPMK III' },
      { code: 'UPMK4', name: 'UPMK IV' },
      { code: 'UPMK5', name: 'UPMK V' },
    ];

    // Sample history of past submissions for the demo
    const __irHistory = [
      { period: 'Jan 2026', unit: 'Kantor Induk', submitter: 'Staff Officer', filledCount: 13, status: 'approved',     statusLabel: 'APPROVED',  submittedAt: '2026-02-03 10:14' },
      { period: 'Jan 2026', unit: 'UPMK I',       submitter: 'Asisten Mgr UPMK I', filledCount: 13, status: 'approved',     statusLabel: 'APPROVED',  submittedAt: '2026-02-03 11:42' },
      { period: 'Jan 2026', unit: 'UPMK III',     submitter: 'Asisten Mgr UPMK III', filledCount: 13, status: 'approved',     statusLabel: 'APPROVED',  submittedAt: '2026-02-04 09:08' },
      { period: 'Des 2025', unit: 'Kantor Induk', submitter: 'Staff Officer',     filledCount: 13, status: 'approved',     statusLabel: 'APPROVED',  submittedAt: '2026-01-03 08:55' },
      { period: 'Feb 2026', unit: 'UPMK II',      submitter: 'Asisten Mgr UPMK II', filledCount: 9, status: 'needs-revision', statusLabel: 'PERLU REVISI',  submittedAt: '2026-03-02 16:30' },
    ];

    // State container for the input page
    state.inputRealisasi = state.inputRealisasi || {
      period: __irGenPeriods()[0].key,
      periodLabel: __irGenPeriods()[0].label,
      unit: 'KP',
      values: {},   // { kpiId: { value, comment, evidence } }
      lastSavedAt: null,
    };

    // Deadline helper
    const __irDeadlineInfo = () => {
      const now = new Date();
      const day = now.getDate();
      // Deadline = 3rd of the month following the reporting period
      // For demo, treat deadline as "T-X" relative to today vs the 3rd of next month
      const reportingNow = new Date();
      const deadline = new Date(reportingNow.getFullYear(), reportingNow.getMonth(), 3);
      if (day > 3) deadline.setMonth(deadline.getMonth() + 1);
      const diffMs = deadline - now;
      const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
      return { days, overdue: days < 0, deadlineDate: deadline };
    };

    // Update sidebar deadline pill
    const updateNavDeadlinePill = () => {
      const pill = document.getElementById('nav-deadline-pill');
      if (!pill) return;
      const info = __irDeadlineInfo();
      pill.textContent = info.overdue ? 'LATE' : `T${info.days >= 0 ? '-' : '+'}${Math.abs(info.days)}`;
      pill.style.background = info.overdue ? 'var(--color-danger)' : (info.days <= 2 ? 'var(--color-warning)' : 'var(--color-accent)');
    };
    updateNavDeadlinePill();

    // Add route registration
    ROUTES['input-realisasi'] = {
      label: 'Input Realisasi Bulanan',
      icon: 'clipboard-edit',
      phase: 1,
      desc: 'Form input realisasi kinerja bulanan per KPI per unit kerja. Submit untuk persetujuan berjenjang.',
    };
    PAGES_READY.add('input-realisasi');

    // Auto-calculate achievement for a KPI based on its target & polaritas
    const __irCalcAchievement = (kpi, value) => {
      if (value === '' || value === null || value === undefined || isNaN(parseFloat(value))) return null;
      const v = parseFloat(value);
      if (!isFinite(v)) return null;
      // If polaritas = Lower-is-Better (LB) or isInverse, achievement = target / actual * 100
      if (kpi.isInverse || kpi.polaritas === 'LB') {
        if (v <= 0) return 110;
        return Math.min((kpi.target / v) * 100, 110);
      }
      // Higher-is-Better
      if (kpi.target === 0) return v > 0 ? 110 : 100;
      return Math.min((v / kpi.target) * 100, 110);
    };

    const __irStatusFromAchievement = (ach) => {
      if (ach === null) return { cls: 'empty', label: 'BELUM' };
      if (ach >= 100) return { cls: 'success', label: 'TERCAPAI' };
      if (ach >= 95)  return { cls: 'warning', label: 'WASPADA' };
      return { cls: 'danger', label: 'BAHAYA' };
    };

    const __irUnitName = (code) => (__irUnits.find(u => u.code === code) || {}).name || code;

    // Recompute progress strip live
    const updateInputProgress = () => {
      const ir = state.inputRealisasi;
      const kpis = DATA.operational.kpis;
      const filled = kpis.filter(k => {
        const v = ir.values[k.id]?.value;
        return v !== undefined && v !== '';
      }).length;
      const total = kpis.length;
      const pct = total ? Math.round((filled / total) * 100) : 0;

      const onTrack = kpis.filter(k => {
        const v = ir.values[k.id]?.value;
        if (v === undefined || v === '') return false;
        const ach = __irCalcAchievement(k, v);
        return ach !== null && ach >= 100;
      }).length;
      const offTrack = kpis.filter(k => {
        const v = ir.values[k.id]?.value;
        if (v === undefined || v === '') return false;
        const ach = __irCalcAchievement(k, v);
        return ach !== null && ach < 95;
      }).length;

      const filledEl = document.getElementById('ir-prog-filled');
      const pctEl    = document.getElementById('ir-prog-pct');
      const remainEl = document.getElementById('ir-prog-remain');
      const onTrackEl= document.getElementById('ir-prog-ontrack');
      const offTrackEl=document.getElementById('ir-prog-offtrack');
      const barEl    = document.getElementById('ir-prog-bar');
      if (filledEl) filledEl.textContent = filled;
      if (pctEl) pctEl.textContent = pct + '%';
      if (remainEl) remainEl.textContent = total - filled;
      if (onTrackEl) onTrackEl.textContent = onTrack;
      if (offTrackEl) offTrackEl.textContent = offTrack;
      if (barEl) barEl.style.width = pct + '%';

      const submitBtn = document.getElementById('ir-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = filled === 0;
        submitBtn.style.opacity = filled === 0 ? '0.5' : '1';
        submitBtn.style.cursor = filled === 0 ? 'not-allowed' : 'pointer';
      }
    };

    // Renderer
    PAGE_PREVIEW['input-realisasi'] = () => {
      const ir = state.inputRealisasi;
      const allKpis = DATA.operational.kpis;
      const periods = __irGenPeriods();
      const role = ROLES[state.role];
      const deadlineInfo = __irDeadlineInfo();
      const deadlineText = deadlineInfo.overdue ? `Terlambat ${Math.abs(deadlineInfo.days)} HK` : `${deadlineInfo.days} hari kerja`;

      // Build period <option>s
      const periodOptions = periods.map(p =>
        `<option value="${p.key}" ${p.key === ir.period ? 'selected' : ''}>${p.label}</option>`
      ).join('');
      // Build unit <option>s
      const unitOptions = __irUnits.map(u =>
        `<option value="${u.code}" ${u.code === ir.unit ? 'selected' : ''}>${u.name}</option>`
      ).join('');

      // Build table rows — group by category
      const kpiRows = allKpis.filter(k => k.category === 'KPI');
      const piRows = allKpis.filter(k => k.category === 'PI');
      const kepRows = (DATA.operational.kepatuhan || []).map((k, i) => ({
        id: 'pen' + i,
        no: k.no,
        name: k.name,
        category: 'PEN',
        unit: 'kejadian',
        target: '0 / sesuai aturan',
        actual: 0,
        achievement: 100,
        maxPenalty: k.maxPenalty,
        bobot: 0,
        owner: 'Bidang QA/QC',
        polaritas: 'NB',
        isPenalty: true,
      }));

      const renderRow = (k) => {
        const v = ir.values[k.id] || {};
        const inputVal = v.value !== undefined ? v.value : '';
        const isTouched = inputVal !== '' && inputVal !== undefined;
        const ach = __irCalcAchievement(k, inputVal);
        const status = __irStatusFromAchievement(ach);
        const hasComment = v.comment && v.comment.trim();
        const hasEvidence = v.evidence;
        const targetDisplay = typeof k.target === 'number'
          ? (k.target % 1 ? k.target.toFixed(2) : k.target.toString())
          : k.target;
        const lastMonthVal = k.actual !== undefined ? k.actual : '—';

        const placeholderText = k.isPenalty ? '0' :
          (typeof k.target === 'number' ? k.target.toString() : '0');

        const hasRootCause = v.rootCause && v.rootCause.trim();
        const hasActionPlan = v.actionPlan && v.actionPlan.trim();
        const hasAnyAnalysis = hasRootCause || hasActionPlan || hasComment || hasEvidence;
        // Required when below target (status warning/danger)
        const analysisRequired = (status.cls === 'danger' || status.cls === 'warning');
        const needsAnalysis = analysisRequired && (!hasRootCause || !hasActionPlan);
        const polLabel = k.polaritas === 'HB' ? 'Positif (higher is better)'
                       : k.polaritas === 'LB' ? 'Negatif (lower is better)'
                       : (k.isPenalty ? 'Pengurang' : 'Neutral');

        return `
          <tr data-kpi-id="${k.id}">
            <td class="ir-row-no">${k.no}</td>
            <td><span class="ir-row-cat ${k.isPenalty ? 'PEN' : k.category}">${k.isPenalty ? 'PEN' : k.category}</span></td>
            <td>
              <div class="ir-row-name">${k.name}</div>
              <div class="ir-row-meta">${k.bu || k.owner || ''} &middot; ${polLabel}</div>
            </td>
            <td class="ir-row-num">${k.bobot ? k.bobot + '%' : '—'}</td>
            <td class="ir-row-num">${targetDisplay} <span class="unit">${k.unit || ''}</span></td>
            <td class="ir-row-num muted">${typeof lastMonthVal === 'number' ? lastMonthVal.toLocaleString('id-ID') : lastMonthVal} <span class="unit">${k.unit || ''}</span></td>
            <td>
              <input class="ir-row-input ${isTouched ? 'touched' : ''}" type="number"
                     step="0.01" placeholder="${placeholderText}"
                     data-kpi-id="${k.id}"
                     value="${inputVal}"
                     aria-label="Realisasi ${k.name}">
            </td>
            <td class="ir-row-achievement ${status.cls}">
              ${ach === null ? '—' : ach.toFixed(1) + '%'}
            </td>
            <td class="ir-row-status">
              <span class="status-pill ${status.cls === 'success' ? 'completed' : status.cls === 'warning' ? 'warning' : status.cls === 'danger' ? 'danger' : ''}">${status.label}</span>
            </td>
            <td>
              <button class="ir-analisis-btn ${hasAnyAnalysis ? 'has-content' : ''} ${needsAnalysis ? 'needs-input' : ''}"
                      data-kpi-id="${k.id}" data-action="analisis"
                      title="${needsAnalysis ? 'Wajib isi Root Cause &amp; Action Plan' : 'Buka detail analisis'}">
                <i data-lucide="${needsAnalysis ? 'alert-circle' : (hasAnyAnalysis ? 'file-text' : 'file-plus')}"></i>
                <span class="ir-analisis-label">${hasAnyAnalysis ? 'Edit Analisis' : (needsAnalysis ? 'Isi Analisis' : 'Tambah')}</span>
                ${hasAnyAnalysis ? '<span class="ir-analisis-tags">' +
                  (hasRootCause ? '<span class="t-tag t-rc">RC</span>' : '') +
                  (hasActionPlan ? '<span class="t-tag t-ap">AP</span>' : '') +
                  (hasComment ? '<span class="t-tag t-cm">CM</span>' : '') +
                  (hasEvidence ? '<span class="t-tag t-ev">EV</span>' : '') +
                '</span>' : ''}
              </button>
            </td>
          </tr>
        `;
      };

      const tbody =
        '<tr class="section-divider"><td colspan="10">Key Performance Indicators &mdash; KPI (Bobot 40)</td></tr>' +
        kpiRows.map(renderRow).join('') +
        '<tr class="section-divider"><td colspan="10">Performance Indicators &mdash; PI (Bobot 60)</td></tr>' +
        piRows.map(renderRow).join('') +
        '<tr class="section-divider"><td colspan="10">Pengurang Kepatuhan &mdash; Maks &minus;30</td></tr>' +
        kepRows.map(renderRow).join('');

      // Recent history items
      const historyHtml = __irHistory.map(h => {
        const sClass = h.status === 'approved' ? 'completed' :
                       h.status === 'in-review' ? 'in-progress' :
                       h.status === 'needs-revision' ? 'warning' : '';
        return `
          <div class="ir-history-item">
            <div class="h-period">${h.period}<sub>${h.unit}</sub></div>
            <div class="h-info">
              <div class="h-summary">${h.filledCount} dari 18 indikator diisi</div>
              <div class="h-meta">Diajukan ${h.submittedAt} oleh ${h.submitter}</div>
            </div>
            <div class="h-status">
              <span class="status-pill ${sClass}">${h.statusLabel}</span>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="ir-toolbar">
          <div class="ir-toolbar-group">
            <span class="ir-toolbar-label">Periode Pelaporan</span>
            <select class="ir-toolbar-select" id="ir-period-select">${periodOptions}</select>
          </div>
          <div class="ir-toolbar-group">
            <span class="ir-toolbar-label">Unit Kerja</span>
            <select class="ir-toolbar-select" id="ir-unit-select">${unitOptions}</select>
          </div>
          <div class="ir-role-badge">
            <span class="ir-role-label">Login sebagai</span>
            <span class="ir-role-value">${role.label}</span>
          </div>
          <div class="ir-deadline ${deadlineInfo.overdue ? 'overdue' : ''}">
            <span class="ir-deadline-label">Deadline Submit</span>
            <span class="ir-deadline-value">${deadlineText}</span>
          </div>
        </div>

        <div class="ir-progress-strip">
          <div class="ir-prog-cell primary">
            <span class="ir-prog-label">Progress Pengisian</span>
            <span class="ir-prog-value" id="ir-prog-pct">0%</span>
            <div class="ir-prog-bar"><div class="ir-prog-bar-fill" id="ir-prog-bar" style="width:0%"></div></div>
            <span class="ir-prog-meta"><strong id="ir-prog-filled">0</strong> dari ${allKpis.length + kepRows.length} indikator</span>
          </div>
          <div class="ir-prog-cell">
            <span class="ir-prog-label">Belum Diisi</span>
            <span class="ir-prog-value" id="ir-prog-remain">${allKpis.length + kepRows.length}</span>
            <span class="ir-prog-meta">indikator menunggu input</span>
          </div>
          <div class="ir-prog-cell success">
            <span class="ir-prog-label">On Track (&ge;100%)</span>
            <span class="ir-prog-value" id="ir-prog-ontrack">0</span>
            <span class="ir-prog-meta">indikator tercapai</span>
          </div>
          <div class="ir-prog-cell danger">
            <span class="ir-prog-label">Off Track (&lt;95%)</span>
            <span class="ir-prog-value" id="ir-prog-offtrack">0</span>
            <span class="ir-prog-meta">indikator perlu eskalasi</span>
          </div>
        </div>

        <div class="ir-table-wrap">
          <table class="ir-table">
            <thead>
              <tr>
                <th style="width:32px;">#</th>
                <th>Kat</th>
                <th>Indikator Kinerja</th>
                <th style="text-align:right; width:60px;">Bobot</th>
                <th style="text-align:right;">Target</th>
                <th style="text-align:right;">Bulan Lalu</th>
                <th style="text-align:right; width:130px;">Realisasi <span style="color:var(--color-accent); font-size:11px;">(input)</span></th>
                <th style="text-align:right;">Capaian</th>
                <th>Status</th>
                <th>Analisis</th>
              </tr>
            </thead>
            <tbody id="ir-tbody">${tbody}</tbody>
          </table>
        </div>

        <div class="ir-actionbar">
          <div class="ir-actionbar-info">
            <span id="ir-autosave-status">Draf belum disimpan.</span>
            &nbsp; &middot; &nbsp;
            Submit akan mengirim laporan ke <strong>Asisten Manajer</strong> untuk review, lalu ke Manajer, Sr. Manajer, dan GM untuk persetujuan akhir.
          </div>
          <div class="ir-actionbar-buttons">
            <button class="btn btn-secondary" id="ir-copy-last" title="Salin nilai realisasi bulan lalu sebagai draft awal">
              <i data-lucide="copy"></i><span>Salin dari Bulan Lalu</span>
            </button>
            <button class="btn btn-secondary" id="ir-save-draft">
              <i data-lucide="save"></i><span>Simpan Draf</span>
            </button>
            <button class="btn btn-primary" id="ir-submit-btn" disabled style="opacity:0.5; cursor:not-allowed;">
              <i data-lucide="send"></i><span>Kirim untuk Persetujuan</span>
            </button>
          </div>
        </div>

        <div class="ir-history-card">
          <div class="ir-history-title">
            <i data-lucide="history"></i><span>Riwayat Submisi Terkini</span>
          </div>
          <div class="ir-history-list">${historyHtml}</div>
        </div>

        <!-- Analisis modal — Root Cause + Action Plan + Catatan + Evidence (mirrors management view) -->
        <div class="modal-backdrop" id="ir-analisis-modal" role="dialog" aria-modal="true" aria-labelledby="ir-am-title">
          <div class="modal" style="max-width:680px;">
            <div class="modal-header">
              <h2 class="modal-title" id="ir-am-title"><i data-lucide="file-text"></i> <span id="ir-am-title-text">Analisis Indikator</span></h2>
              <button class="icon-btn" data-close-modal="ir-analisis-modal" aria-label="Tutup"><i data-lucide="x"></i></button>
            </div>
            <div class="modal-body ir-analisis-modal-body">
              <div class="ir-am-context" id="ir-am-context"></div>
              <div class="ir-am-fields">
                <div class="ir-am-field">
                  <div class="ir-am-field-head">
                    <span class="ir-am-field-label"><i data-lucide="alert-octagon"></i>Root Cause</span>
                    <span class="ir-am-required" id="ir-am-rc-required" style="display:none;">WAJIB jika di bawah target</span>
                  </div>
                  <div class="ir-am-help">Penyebab utama mengapa realisasi tidak mencapai target. Sebutkan akar masalah (lahan, vendor, cuaca, dll) &mdash; bukan gejala.</div>
                  <textarea class="ir-am-textarea" id="ir-am-rootcause" rows="3"
                            placeholder="Contoh: Keterlambatan finalisasi PMS pada 4 proyek baru di UPMK III & UPMK IV karena belum disepakati Pemberi Kerja."></textarea>
                </div>
                <div class="ir-am-field">
                  <div class="ir-am-field-head">
                    <span class="ir-am-field-label"><i data-lucide="clipboard-check"></i>Action Plan</span>
                    <span class="ir-am-required" id="ir-am-ap-required" style="display:none;">WAJIB jika di bawah target</span>
                  </div>
                  <div class="ir-am-help">Rencana mitigasi konkret: aksi, owner, target normalisasi. Inilah yang akan dilihat &amp; di-approve oleh Asman/Manajer/SrM/GM.</div>
                  <textarea class="ir-am-textarea" id="ir-am-actionplan" rows="3"
                            placeholder="Contoh: Eskalasi ke Pemberi Kerja, koordinasi mingguan dengan UPMK; target normalisasi TW2 2026."></textarea>
                </div>
                <div class="ir-am-field">
                  <div class="ir-am-field-head">
                    <span class="ir-am-field-label"><i data-lucide="message-square"></i>Catatan / Komentar Umum</span>
                    <span class="ir-am-optional">Opsional</span>
                  </div>
                  <textarea class="ir-am-textarea" id="ir-am-comment" rows="2"
                            placeholder="Highlight pencapaian atau konteks tambahan..."></textarea>
                </div>
                <div class="ir-am-field">
                  <div class="ir-am-field-head">
                    <span class="ir-am-field-label"><i data-lucide="paperclip"></i>Evidence / Bukti Pendukung</span>
                    <span class="ir-am-optional">Opsional</span>
                  </div>
                  <div class="ir-am-help">URL/path ke file di SIDITA, OneDrive, atau sistem repositori. File fisik dapat diupload melalui workflow review approver.</div>
                  <input class="ir-am-input" id="ir-am-evidence" type="text" placeholder="https://sidita.pln.co.id/... atau ketik nama file">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" data-close-modal="ir-analisis-modal">Batal</button>
              <button class="btn btn-secondary" id="ir-am-clear" title="Hapus semua isian analisis untuk KPI ini">
                <i data-lucide="trash-2"></i><span>Hapus Analisis</span>
              </button>
              <button class="btn btn-primary" id="ir-am-save"><i data-lucide="check"></i><span>Simpan Analisis</span></button>
            </div>
          </div>
        </div>

        <!-- Confirm submit modal -->
        <div class="modal-backdrop" id="ir-submit-modal" role="dialog" aria-modal="true" aria-labelledby="ir-submit-title">
          <div class="modal" style="max-width:600px;">
            <div class="modal-header">
              <h2 class="modal-title" id="ir-submit-title"><i data-lucide="send"></i> Kirim Realisasi untuk Persetujuan</h2>
              <button class="icon-btn" data-close-modal="ir-submit-modal" aria-label="Tutup"><i data-lucide="x"></i></button>
            </div>
            <div class="modal-body">
              <p style="font-size:14px; color:var(--color-text); margin: 0 0 12px;">Data realisasi akan dikirim melalui workflow approval berjenjang. Setelah dikirim, Anda tidak dapat mengubah angka tanpa persetujuan approver.</p>
              <div class="ir-submit-summary" id="ir-submit-summary"></div>
              <div style="font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--color-text-subtle); margin: 12px 0 6px;">Alur Persetujuan</div>
              <div class="ir-workflow-preview">
                <div class="ir-workflow-step active">Staff<br>Submit</div>
                <div class="ir-workflow-step">Asisten<br>Manajer</div>
                <div class="ir-workflow-step">Manajer</div>
                <div class="ir-workflow-step">Sr.<br>Manajer</div>
                <div class="ir-workflow-step">GM<br>Approve</div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" data-close-modal="ir-submit-modal">Batal</button>
              <button class="btn btn-primary" id="ir-confirm-submit"><i data-lucide="check"></i><span>Konfirmasi &amp; Kirim</span></button>
            </div>
          </div>
        </div>
      `;
    };

    PAGE_INIT['input-realisasi'] = () => {
      const ir = state.inputRealisasi;
      const allKpis = DATA.operational.kpis;

      // Initial progress
      updateInputProgress();

      // Period change
      const periodSel = document.getElementById('ir-period-select');
      if (periodSel) periodSel.addEventListener('change', (e) => {
        ir.period = e.target.value;
        const p = __irGenPeriods().find(x => x.key === ir.period);
        ir.periodLabel = p ? p.label : ir.period;
        // Reset draft for new period
        ir.values = {};
        renderPlaceholder('input-realisasi');
        toast({ title: 'Periode diubah', message: 'Memuat draft realisasi untuk ' + ir.periodLabel + '.', type: 'info', duration: 2000 });
      });

      // Unit change
      const unitSel = document.getElementById('ir-unit-select');
      if (unitSel) unitSel.addEventListener('change', (e) => {
        ir.unit = e.target.value;
        ir.values = {};
        renderPlaceholder('input-realisasi');
        toast({ title: 'Unit kerja diubah', message: 'Input untuk ' + __irUnitName(ir.unit) + '.', type: 'info', duration: 2000 });
      });

      // Per-input handlers
      const tbody = document.getElementById('ir-tbody');
      if (tbody) {
        tbody.addEventListener('input', (e) => {
          const input = e.target.closest('.ir-row-input');
          if (!input) return;
          const id = input.getAttribute('data-kpi-id');
          if (!id) return;
          if (!ir.values[id]) ir.values[id] = {};
          ir.values[id].value = input.value;
          input.classList.toggle('touched', input.value !== '');

          // Update achievement + status in the row
          const row = input.closest('tr');
          const kpi = allKpis.find(k => k.id === id);
          if (kpi) {
            const ach = __irCalcAchievement(kpi, input.value);
            const status = __irStatusFromAchievement(ach);
            const achCell = row.querySelector('.ir-row-achievement');
            const stCell  = row.querySelector('.ir-row-status .status-pill');
            if (achCell) {
              achCell.className = 'ir-row-achievement ' + status.cls;
              achCell.textContent = ach === null ? '—' : ach.toFixed(1) + '%';
            }
            if (stCell) {
              stCell.className = 'status-pill ' + (status.cls === 'success' ? 'completed' : status.cls === 'warning' ? 'warning' : status.cls === 'danger' ? 'danger' : '');
              stCell.textContent = status.label;
            }
            // Update analisis button — required state depends on the new status
            const aBtn = row.querySelector('.ir-analisis-btn');
            if (aBtn) {
              const cur = ir.values[id] || {};
              const hasRC = cur.rootCause && cur.rootCause.trim();
              const hasAP = cur.actionPlan && cur.actionPlan.trim();
              const isReq = (status.cls === 'danger' || status.cls === 'warning');
              const needs = isReq && (!hasRC || !hasAP);
              aBtn.classList.toggle('needs-input', needs);
              aBtn.title = needs ? 'Wajib isi Root Cause & Action Plan' : 'Buka detail analisis';
              const ic = aBtn.querySelector('i');
              const lbl = aBtn.querySelector('.ir-analisis-label');
              const hasAny = hasRC || hasAP || (cur.comment && cur.comment.trim()) || (cur.evidence && cur.evidence.trim());
              if (ic) ic.setAttribute('data-lucide', needs ? 'alert-circle' : (hasAny ? 'file-text' : 'file-plus'));
              if (lbl) lbl.textContent = hasAny ? 'Edit Analisis' : (needs ? 'Isi Analisis' : 'Tambah');
              if (window.lucide) window.lucide.createIcons();
            }
          }
          updateInputProgress();

          // Indicate unsaved
          const ind = document.getElementById('ir-autosave-status');
          if (ind) ind.textContent = 'Perubahan belum disimpan.';
        });

        // Analisis button click — open the comprehensive modal
        tbody.addEventListener('click', (e) => {
          const btn = e.target.closest('[data-action="analisis"]');
          if (!btn) return;
          const id = btn.getAttribute('data-kpi-id');
          if (id) openAnalisisModal(id);
        });
      }

      // ── Analisis modal handler ──
      const amModal = document.getElementById('ir-analisis-modal');
      const amTitle = document.getElementById('ir-am-title-text');
      const amContext = document.getElementById('ir-am-context');
      const amRC = document.getElementById('ir-am-rootcause');
      const amAP = document.getElementById('ir-am-actionplan');
      const amCM = document.getElementById('ir-am-comment');
      const amEV = document.getElementById('ir-am-evidence');
      const amRCReq = document.getElementById('ir-am-rc-required');
      const amAPReq = document.getElementById('ir-am-ap-required');
      let activeAnalisisId = null;

      const __polLabelInd = (p, isPenalty) => isPenalty ? 'Pengurang'
        : p === 'HB' ? 'Positif (higher is better)'
        : p === 'LB' ? 'Negatif (lower is better)' : '—';

      const openAnalisisModal = (id) => {
        const kpi = allKpis.find(x => x.id === id);
        const kepRows = (DATA.operational.kepatuhan || []).map((k, i) => ({ ...k, id: 'pen' + i, isPenalty: true, target: '0/aturan', unit: 'kejadian' }));
        const penalty = kepRows.find(p => p.id === id);
        const item = kpi || penalty;
        if (!item) return;
        activeAnalisisId = id;
        const v = ir.values[id] || {};
        const inputVal = v.value !== undefined ? v.value : '';
        const ach = item.isPenalty ? null : __irCalcAchievement(item, inputVal);
        const status = __irStatusFromAchievement(ach);
        const isRequired = (status.cls === 'danger' || status.cls === 'warning');
        const targetDisplay = typeof item.target === 'number'
          ? (item.target % 1 ? item.target.toFixed(2) : item.target.toString())
          : item.target;
        const gapText = (() => {
          if (item.isPenalty || ach === null) return '';
          if (ach >= 100) return '+' + (ach - 100).toFixed(1) + '%';
          return (ach - 100).toFixed(1) + '%';
        })();
        const gapClass = (ach === null || item.isPenalty) ? '' : (ach >= 100 ? 'success' : 'gap');
        const statusPillCls = status.cls === 'success' ? 'completed' : status.cls === 'warning' ? 'warning' : status.cls === 'danger' ? 'danger' : '';

        if (amTitle) amTitle.textContent = `${item.isPenalty ? 'PEN' : item.category} ${item.no} — ${item.name}`;
        if (amContext) {
          amContext.innerHTML = `
            <div class="ir-am-context-cell wide">
              <span class="label">Unit Kerja</span>
              <span class="value" style="font-size:14px;">${__irUnitName(ir.unit)}</span>
            </div>
            <div class="ir-am-context-cell">
              <span class="label">Target</span>
              <span class="value">${targetDisplay}<span class="unit">${item.unit || ''}</span></span>
            </div>
            <div class="ir-am-context-cell">
              <span class="label">Realisasi</span>
              <span class="value">${inputVal === '' ? '—' : inputVal}<span class="unit">${item.unit || ''}</span></span>
            </div>
            <div class="ir-am-context-cell ${gapClass}">
              <span class="label">Capaian</span>
              <span class="value">${ach === null ? '—' : ach.toFixed(1) + '%'}</span>
            </div>
            <div class="ir-am-context-cell">
              <span class="label">Polaritas</span>
              <span class="value" style="font-size:12px;">${__polLabelInd(item.polaritas, item.isPenalty)}</span>
            </div>
            <div class="ir-am-context-cell wide" style="grid-column: span 2;">
              <span class="label">Bobot &amp; Status</span>
              <span class="value" style="font-size:13px; display:flex; align-items:center; gap:10px;">
                <span>${item.bobot !== undefined ? item.bobot + '%' : (item.isPenalty ? 'Maks ' + item.maxPenalty : '—')}</span>
                <span class="status-pill ${statusPillCls}">${status.label}</span>
              </span>
            </div>
            <div class="ir-am-context-cell">
              <span class="label">Gap vs Target</span>
              <span class="value" style="color:${gapClass === 'gap' ? 'var(--color-danger)' : gapClass === 'success' ? 'var(--color-success)' : 'var(--color-text)'};">${gapText || '—'}</span>
            </div>
          `;
        }
        // Populate fields
        if (amRC) amRC.value = v.rootCause || '';
        if (amAP) amAP.value = v.actionPlan || '';
        if (amCM) amCM.value = v.comment || '';
        if (amEV) amEV.value = v.evidence || '';
        // Show/hide REQUIRED labels
        if (amRCReq) amRCReq.style.display = isRequired ? '' : 'none';
        if (amAPReq) amAPReq.style.display = isRequired ? '' : 'none';
        // Visual required-empty hint
        if (amRC) amRC.classList.toggle('required-empty', isRequired && !amRC.value.trim());
        if (amAP) amAP.classList.toggle('required-empty', isRequired && !amAP.value.trim());
        if (typeof openModal === 'function') openModal('ir-analisis-modal');
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => { if (amRC) amRC.focus(); }, 100);
      };

      // Live required-empty highlight
      [amRC, amAP].forEach(t => t && t.addEventListener('input', () => {
        t.classList.toggle('required-empty', t.classList.contains('required-empty') && !t.value.trim());
        if (t.value.trim()) t.classList.remove('required-empty');
      }));

      document.getElementById('ir-am-save')?.addEventListener('click', () => {
        if (!activeAnalisisId) return;
        if (!ir.values[activeAnalisisId]) ir.values[activeAnalisisId] = {};
        ir.values[activeAnalisisId].rootCause = amRC ? amRC.value : '';
        ir.values[activeAnalisisId].actionPlan = amAP ? amAP.value : '';
        ir.values[activeAnalisisId].comment = amCM ? amCM.value : '';
        ir.values[activeAnalisisId].evidence = amEV ? amEV.value : '';
        if (typeof closeModal === 'function') closeModal('ir-analisis-modal');
        // Re-render the row to update button state
        renderPlaceholder('input-realisasi');
        toast({ title: 'Analisis tersimpan', message: 'Detail analisis indikator disimpan.', type: 'success', duration: 1800 });
      });

      document.getElementById('ir-am-clear')?.addEventListener('click', () => {
        if (!activeAnalisisId) return;
        if (amRC) amRC.value = '';
        if (amAP) amAP.value = '';
        if (amCM) amCM.value = '';
        if (amEV) amEV.value = '';
        if (!ir.values[activeAnalisisId]) ir.values[activeAnalisisId] = {};
        delete ir.values[activeAnalisisId].rootCause;
        delete ir.values[activeAnalisisId].actionPlan;
        delete ir.values[activeAnalisisId].comment;
        delete ir.values[activeAnalisisId].evidence;
        renderPlaceholder('input-realisasi');
      });

      // Copy from last month
      document.getElementById('ir-copy-last')?.addEventListener('click', () => {
        allKpis.forEach(k => {
          if (k.actual !== undefined && k.actual !== null) {
            if (!ir.values[k.id]) ir.values[k.id] = {};
            ir.values[k.id].value = String(k.actual);
          }
        });
        renderPlaceholder('input-realisasi');
        toast({ title: 'Disalin dari bulan lalu', message: 'Nilai realisasi bulan sebelumnya menjadi draft awal. Sesuaikan dengan capaian aktual ' + (state.inputRealisasi.periodLabel || ir.period) + '.', type: 'info', duration: 3000 });
      });

      // Save draft
      document.getElementById('ir-save-draft')?.addEventListener('click', () => {
        ir.lastSavedAt = new Date();
        const ind = document.getElementById('ir-autosave-status');
        if (ind) {
          const t = ir.lastSavedAt.toLocaleTimeString('id-ID');
          ind.innerHTML = '<span class="ir-autosave-indicator"><i data-lucide="check-circle-2"></i>Draf disimpan ' + t + '</span>';
          if (window.lucide) window.lucide.createIcons();
        }
        toast({ title: 'Draf tersimpan', message: 'Anda dapat melanjutkan pengisian kapan saja sebelum deadline.', type: 'success', duration: 2500 });
      });

      // Submit modal
      document.getElementById('ir-submit-btn')?.addEventListener('click', () => {
        const summary = document.getElementById('ir-submit-summary');
        const filled = Object.values(ir.values).filter(v => v.value !== undefined && v.value !== '').length;
        const totalKpis = allKpis.length + (DATA.operational.kepatuhan || []).length;
        const onTrack = allKpis.filter(k => {
          const v = ir.values[k.id]?.value; if (v === undefined || v === '') return false;
          const ach = __irCalcAchievement(k, v); return ach !== null && ach >= 100;
        }).length;
        const offTrack = allKpis.filter(k => {
          const v = ir.values[k.id]?.value; if (v === undefined || v === '') return false;
          const ach = __irCalcAchievement(k, v); return ach !== null && ach < 95;
        }).length;
        const p = __irGenPeriods().find(x => x.key === ir.period);
        if (summary) {
          summary.innerHTML = `
            <div class="ir-submit-summary-row"><span class="label">Periode</span><span class="value">${p ? p.label : ir.period}</span></div>
            <div class="ir-submit-summary-row"><span class="label">Unit Kerja</span><span class="value">${__irUnitName(ir.unit)}</span></div>
            <div class="ir-submit-summary-row"><span class="label">Indikator Diisi</span><span class="value">${filled} / ${totalKpis}</span></div>
            <div class="ir-submit-summary-row"><span class="label">On Track (&ge;100%)</span><span class="value" style="color:var(--color-success);">${onTrack}</span></div>
            <div class="ir-submit-summary-row"><span class="label">Off Track (&lt;95%)</span><span class="value" style="color:var(--color-danger);">${offTrack}</span></div>
            <div class="ir-submit-summary-row"><span class="label">Submitter</span><span class="value">${ROLES[state.role].name}</span></div>
          `;
        }
        if (typeof openModal === 'function') openModal('ir-submit-modal');
        if (window.lucide) window.lucide.createIcons();
      });

      document.getElementById('ir-confirm-submit')?.addEventListener('click', () => {
        const p = __irGenPeriods().find(x => x.key === ir.period);
        const filled = Object.values(ir.values).filter(v => v.value !== undefined && v.value !== '').length;

        // Propagate analysis back to DATA so management views (Executive Summary KPI panel
        // and the KPI Deep-Dive sub-dashboard) pick up the staff-submitted Root Cause &
        // Action Plan. Realisasi value is updated when unit === Kantor Induk (aggregate).
        allKpis.forEach(k => {
          const entry = ir.values[k.id];
          if (!entry) return;
          if (entry.rootCause !== undefined) k.rootCause = entry.rootCause;
          if (entry.actionPlan !== undefined) k.actionPlan = entry.actionPlan;
          if (entry.comment !== undefined && entry.comment.trim()) {
            k.commentary = entry.comment;
          }
          if (ir.unit === 'KP' && entry.value !== undefined && entry.value !== '') {
            const numVal = parseFloat(entry.value);
            if (!isNaN(numVal)) {
              k.actual = numVal;
              const ach = __irCalcAchievement(k, numVal);
              if (ach !== null) k.achievement = ach;
              const stKey = __irStatusFromAchievement(ach).cls;
              if (stKey !== 'empty') k.status = stKey;
            }
          }
        });

        // Push to history
        __irHistory.unshift({
          period: p ? p.label : ir.period,
          unit: __irUnitName(ir.unit),
          submitter: ROLES[state.role].name,
          filledCount: filled,
          status: 'in-review',
          statusLabel: 'MENUNGGU APPROVAL',
          submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        });
        // Push to audit log
        if (DATA.auditLog) {
          DATA.auditLog.unshift({
            id: 'AL' + Date.now(),
            timestamp: new Date().toISOString(),
            user: ROLES[state.role].name,
            role: ROLES[state.role].label,
            action: 'submit',
            entity: 'Input Realisasi ' + (p ? p.label : ir.period) + ' / ' + __irUnitName(ir.unit),
            detail: filled + ' indikator dikirim untuk approval berjenjang.',
          });
        }
        // Reset draft
        state.inputRealisasi.values = {};
        if (typeof closeModal === 'function') closeModal('ir-submit-modal');
        toast({
          title: 'Realisasi berhasil dikirim',
          message: `Laporan ${__irUnitName(ir.unit)} untuk ${p ? p.label : ir.period} menunggu review Asisten Manajer.`,
          type: 'success',
          duration: 4500,
        });
        renderPlaceholder('input-realisasi');
      });

      if (window.lucide) window.lucide.createIcons();
    };

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 220);

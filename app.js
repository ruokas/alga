    const THEME_KEY = 'ED_THEME';

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    }

const toggle = document.getElementById('themeToggle');
if (toggle) {
  toggle.checked = document.documentElement.classList.contains('light-theme');
  toggle.addEventListener('change', () => {
    const isLight = toggle.checked;
    document.documentElement.classList.toggle('light-theme', isLight);
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
  });
}

// --- Bonus thresholds ---
// These tables map a measured value to a bonus multiplier.
// Edit the `limit` (inclusive upper bound) or `value` as needed.
const THRESHOLDS = {
  // Occupancy ratio (N/C) → V bonus
  V_BONUS: [
    { limit: 0.80, value: 0.00 },
    { limit: 1.00, value: 0.05 },
    { limit: 1.25, value: 0.10 },
    { limit: Infinity, value: 0.15 },
  ],
  // High-acuity share (ESI1+ESI2)/N → A bonus
  A_BONUS: [
    { limit: 0.10, value: 0.00 },
    { limit: 0.20, value: 0.05 },
    { limit: 0.30, value: 0.10 },
    { limit: Infinity, value: 0.15 },
  ],
};

    // --- Zonų duomenys ---
    const DEFAULT_ZONES = [
      { id: 'RED',   name: 'Raudona (kritinė)',       group: 'Suaugusiųjų', cap: { D: 16, N: 12 } },
      { id: 'YEL',   name: 'Geltona (vidutinė)',      group: 'Suaugusiųjų', cap: { D: 22, N: 15 } },
      { id: 'GRN',   name: 'Žalia (mažesnė skuba)',   group: 'Suaugusiųjų', cap: { D: 28, N: 20 } },
      { id: 'TRIAGE',name: 'Triage/registracija',     group: 'Bendra',       cap: { D: 35, N: 24 } },
      { id: 'OBS',   name: 'Stebėjimo zona',          group: 'Bendra',       cap: { D: 14, N: 10 } },
      { id: 'PROCS', name: 'Procedūrų zona',          group: 'Bendra',       cap: { D: 12, N: 10 } },
      { id: 'PED',   name: 'Vaikų zona',              group: 'Vaikų',        cap: { D: 20, N: 14 } },
      { id: 'OTHER', name: 'Kita',                    group: 'Bendra',       cap: { D: 20, N: 16 } }
    ];

    const LS_KEY = 'ED_ZONES_V2';
    const LS_RATE_KEY = 'ED_RATE_TEMPLATE_V2';

    function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
    function sanitizeId(txt){ const s = (txt||'').toString().toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_|_$/g,''); return s || 'ZONE_' + Math.random().toString(36).slice(2,6).toUpperCase(); }

    function loadZones(){ try { const j = localStorage.getItem(LS_KEY); if (j){ const arr = JSON.parse(j); if (Array.isArray(arr)) return arr; } } catch {} return clone(DEFAULT_ZONES); }
    function saveZones(zs){ try { localStorage.setItem(LS_KEY, JSON.stringify(zs)); } catch {} }

    let ZONES = loadZones();

    // --- Elementai ---
    const els = {
      date: document.getElementById('date'),
      shift: document.getElementById('shift'),
      zone: document.getElementById('zone'),
      capacity: document.getElementById('capacity'),
      N: document.getElementById('N'),
      kmax: document.getElementById('kmax'),
      shiftHours: document.getElementById('shiftHours'),
      monthHours: document.getElementById('monthHours'),
      baseRateDoc: document.getElementById('baseRateDoc'),
      baseRateNurse: document.getElementById('baseRateNurse'),
      baseRateAssist: document.getElementById('baseRateAssist'),
      linkN: document.getElementById('linkN'),
      esi1: document.getElementById('esi1'),
      esi2: document.getElementById('esi2'),
      esi3: document.getElementById('esi3'),
      esi4: document.getElementById('esi4'),
      esi5: document.getElementById('esi5'),
      ratio: document.getElementById('ratio'),
      sShare: document.getElementById('sShare'),
      ratioCanvas: document.getElementById('ratioChart'),
      sCanvas: document.getElementById('sChart'),
      vBonus: document.getElementById('vBonus'),
      aBonus: document.getElementById('aBonus'),
      kMaxCell: document.getElementById('kMaxCell'),
      kZona: document.getElementById('kZona'),
      baseDocCell: document.getElementById('baseDocCell'),
      kDocCell: document.getElementById('kDocCell'),
      finalDocCell: document.getElementById('finalDocCell'),
      shiftDocCell: document.getElementById('shiftDocCell'),
      monthDocCell: document.getElementById('monthDocCell'),
      baseNurseCell: document.getElementById('baseNurseCell'),
      kNurseCell: document.getElementById('kNurseCell'),
      finalNurseCell: document.getElementById('finalNurseCell'),
      shiftNurseCell: document.getElementById('shiftNurseCell'),
      monthNurseCell: document.getElementById('monthNurseCell'),
      baseAssistCell: document.getElementById('baseAssistCell'),
      kAssistCell: document.getElementById('kAssistCell'),
      finalAssistCell: document.getElementById('finalAssistCell'),
      shiftAssistCell: document.getElementById('shiftAssistCell'),
      monthAssistCell: document.getElementById('monthAssistCell'),
    reset: document.getElementById('reset'),
    copy: document.getElementById('copy'),
    downloadCsv: document.getElementById('downloadCsv'),
    manageZones: document.getElementById('manageZones'),
      zoneModal: document.getElementById('zoneModal'),
      zoneTbody: document.getElementById('zoneTbody'),
      addZone: document.getElementById('addZone'),
      saveZonesBtn: document.getElementById('saveZonesBtn'),
      defaultsZones: document.getElementById('defaultsZones'),
      closeZoneModal: document.getElementById('closeZoneModal'),
      saveRateTemplate: document.getElementById('saveRateTemplate'),
      loadRateTemplate: document.getElementById('loadRateTemplate')
    };

    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue('--accent').trim();
    const borderColor = style.getPropertyValue('--border').trim();
    const danger = style.getPropertyValue('--danger').trim();
    const accent2 = style.getPropertyValue('--accent-2').trim();
    const muted = style.getPropertyValue('--muted').trim();

    const charts = {};
    if (els.ratioCanvas) {
      charts.ratio = new Chart(els.ratioCanvas, {
        type: 'doughnut',
        data: {
          labels: ['N', 'Likutis'],
          datasets: [{ data: [0, 1], backgroundColor: [accent, borderColor], borderWidth: 0 }]
        },
        options: {
          rotation: -90,
          circumference: 180,
          cutout: '70%',
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          maintainAspectRatio: false
        }
      });
    }
    if (els.sCanvas) {
      charts.s = new Chart(els.sCanvas, {
        type: 'bar',
        data: {
          labels: ['ESI1', 'ESI2', 'ESI3', 'ESI4', 'ESI5'],
          datasets: [{ data: [0, 0, 0, 0, 0], backgroundColor: [danger, accent2, muted, muted, muted] }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { x: { display: false }, y: { display: false } },
          maintainAspectRatio: false
        }
      });
    }


    // --- Pagalbinės ---
    function toNum(v){ const n = Number(v); return Number.isFinite(n) ? n : 0; }
    function fmt(n, d=2){ return (Number.isFinite(n) ? n : 0).toFixed(d); }
    function money(n){ try{ return new Intl.NumberFormat('lt-LT',{style:'currency',currency:'EUR'}).format(n||0); }catch{ return `€${fmt(n)}`; } }
    // Returns bonus value for given metric using threshold table
    function getBonus(metric, table){
      for (const {limit, value} of table){
        if (metric <= limit) return value;
      }
      return 0;
    }

    // Grouped select render
    function renderZoneSelect(preserve){
      const prev = preserve ? els.zone.value : null;
      els.zone.innerHTML = '';
      const groups = {};
      ZONES.forEach(z => { const g = z.group || 'Kita'; (groups[g] ||= []).push(z); });
      Object.keys(groups).sort().forEach(g => {
        const og = document.createElement('optgroup'); og.label = g;
        groups[g].forEach(z => {
          const opt = document.createElement('option');
          opt.value = z.id; opt.textContent = z.name; opt.dataset.capacityD = z.cap?.D ?? 20; opt.dataset.capacityN = z.cap?.N ?? 16; og.appendChild(opt);
        });
        els.zone.appendChild(og);
      });
      if (prev && ZONES.some(z=>z.id===prev)) els.zone.value = prev;
      if (!els.zone.value && ZONES.length) els.zone.value = ZONES[0].id;
      setDefaultCapacity();
    }

    function setDefaultCapacity(){
      const id = els.zone.value; const s = els.shift.value;
      const z = ZONES.find(x=>x.id===id);
      const cap = z ? (s==='D' ? (z.cap?.D ?? 20) : (z.cap?.N ?? 16)) : 20;
      els.capacity.value = cap;
    }

    function openZoneModal(){ els.zoneModal.classList.add('active'); renderZoneEditor(); }
    function closeZoneModal(){ els.zoneModal.classList.remove('active'); }

    // Drag & Drop reorder helpers
    let dragIdx = null;
    function onDragStart(e){ dragIdx = Number(e.currentTarget.dataset.idx); e.dataTransfer.effectAllowed = 'move'; }
    function onDragOver(e){ e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.classList.add('drag-over'); }
    function onDragLeave(e){ e.currentTarget.classList.remove('drag-over'); }
    function onDrop(e){ e.preventDefault(); const targetIdx = Number(e.currentTarget.dataset.idx); e.currentTarget.classList.remove('drag-over'); if (!Number.isInteger(dragIdx) || !Number.isInteger(targetIdx) || dragIdx===targetIdx) return; const item = ZONES.splice(dragIdx,1)[0]; ZONES.splice(targetIdx,0,item); renderZoneEditor(); renderZoneSelect(true); }

    function renderZoneEditor(){
      els.zoneTbody.innerHTML = '';
      ZONES.forEach((z, idx) => {
        const tr = document.createElement('tr');
        tr.className = 'drag-row';
        tr.setAttribute('draggable','true');
        tr.dataset.idx = idx;
        tr.addEventListener('dragstart', onDragStart);
        tr.addEventListener('dragover', onDragOver);
        tr.addEventListener('dragleave', onDragLeave);
        tr.addEventListener('drop', onDrop);
        tr.innerHTML = `
          <td><span class="drag-handle" title="Vilkite rikiavimui"></span></td>
          <td><input type="text" value="${z.name}" data-idx="${idx}" data-field="name" /></td>
          <td><input type="text" value="${z.id}" data-idx="${idx}" data-field="id" /></td>
          <td><input type="text" value="${z.group || ''}" data-idx="${idx}" data-field="group" placeholder="pvz., Suaugusiųjų" /></td>
          <td><input type="number" min="0" step="1" value="${z.cap?.D ?? 0}" data-idx="${idx}" data-field="capD" /></td>
          <td><input type="number" min="0" step="1" value="${z.cap?.N ?? 0}" data-idx="${idx}" data-field="capN" /></td>
          <td><button data-action="del" data-idx="${idx}">Šalinti</button></td>`;
        els.zoneTbody.appendChild(tr);
      });

      els.zoneTbody.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', (e)=>{
          const i = Number(e.target.getAttribute('data-idx'));
          const f = e.target.getAttribute('data-field');
          const v = e.target.value;
          if (!ZONES[i]) return;
          if (f==='name') ZONES[i].name = v;
          if (f==='id') ZONES[i].id = sanitizeId(v);
          if (f==='group') ZONES[i].group = v;
          if (f==='capD') { ZONES[i].cap = ZONES[i].cap || {}; ZONES[i].cap.D = toNum(v); }
          if (f==='capN') { ZONES[i].cap = ZONES[i].cap || {}; ZONES[i].cap.N = toNum(v); }
          renderZoneSelect(true);
        });
      });

      els.zoneTbody.querySelectorAll('button[data-action="del"]').forEach(btn => {
        btn.addEventListener('click', (e)=>{
          const i = Number(e.target.getAttribute('data-idx'));
          ZONES.splice(i,1);
          renderZoneEditor();
          renderZoneSelect(false);
        });
      });
    }

    function addZone(){
      const baseName = 'Nauja zona';
      let n = 1; let id;
      do { id = sanitizeId(baseName + ' ' + n); n++; } while (ZONES.some(z=>z.id===id));
      ZONES.push({ id, name: baseName, group: '', cap: { D: 20, N: 16 } });
      renderZoneEditor();
      renderZoneSelect(true);
    }

    function saveZonesAndClose(){
      // Validacija: unikalūs kodai
      const ids = new Set();
      for (const z of ZONES){
        if (!z.id) z.id = sanitizeId(z.name);
        if (ids.has(z.id)) { alert('Zonų kodai turi būti unikalūs. Dubliuotas: ' + z.id); return; }
        ids.add(z.id);
        z.cap = { D: toNum(z.cap?.D), N: toNum(z.cap?.N) };
        if (!z.name) z.name = z.id;
      }
      saveZones(ZONES);
      renderZoneSelect(true);
      closeZoneModal();
    }

    function resetToDefaults(){ if (confirm('Atstatyti numatytąsias zonas? Jūsų sąrašas bus pakeistas.')) { ZONES = clone(DEFAULT_ZONES); saveZones(ZONES); renderZoneEditor(); renderZoneSelect(false); } }

    // --- Tarifų šablonas ---
    function saveRateTemplate(){
      const payload = {
        doc: toNum(els.baseRateDoc.value),
        nurse: toNum(els.baseRateNurse.value),
        assist: toNum(els.baseRateAssist.value)
      };
      try { localStorage.setItem(LS_RATE_KEY, JSON.stringify(payload)); alert('Tarifų šablonas įsimintas.'); } catch {}
    }
    function loadRateTemplate(){
      try { const j = localStorage.getItem(LS_RATE_KEY); if (j){ const t = JSON.parse(j); if (t){ els.baseRateDoc.value = t.doc ?? 0; els.baseRateNurse.value = t.nurse ?? 0; els.baseRateAssist.value = t.assist ?? 0; compute(); return; } } } catch {}
      alert('Nerasta išsaugoto šablono.');
    }

    // --- Skaičiavimai ---
    function compute(){
      const C = Math.max(0, toNum(els.capacity.value));
      const kMax = Math.min(2, Math.max(1, toNum(els.kmax.value)));
      const baseDoc = Math.max(0, toNum(els.baseRateDoc.value));
      const baseNurse = Math.max(0, toNum(els.baseRateNurse.value));
      const baseAssist = Math.max(0, toNum(els.baseRateAssist.value));
      const shiftH = Math.max(0, toNum(els.shiftHours.value));
      const monthH = Math.max(0, toNum(els.monthHours.value));
      let n1 = Math.max(0, toNum(els.esi1.value));
      let n2 = Math.max(0, toNum(els.esi2.value));
      let n3 = Math.max(0, toNum(els.esi3.value));
      let n4 = Math.max(0, toNum(els.esi4.value));
      let n5 = Math.max(0, toNum(els.esi5.value));

      let N = Math.max(0, toNum(els.N.value));
      if (els.linkN.checked){ N = n1 + n2 + n3 + n4 + n5; els.N.value = N; els.N.disabled = true; } else els.N.disabled = false;

      let ratio = 0; if (C > 0) ratio = N / C;
      const V = getBonus(ratio, THRESHOLDS.V_BONUS);

      const high = n1 + n2; const S = N > 0 ? high / N : 0;
      const A = getBonus(S, THRESHOLDS.A_BONUS);

      const K = Math.min(1 + V + A, kMax);
      const finalDoc = baseDoc * K;
      const finalNurse = baseNurse * K;
      const finalAssist = baseAssist * K;

      const shiftDoc = finalDoc * shiftH;
      const shiftNurse = finalNurse * shiftH;
      const shiftAssist = finalAssist * shiftH;

      const monthDoc = finalDoc * monthH;
      const monthNurse = finalNurse * monthH;
      const monthAssist = finalAssist * monthH;

      els.ratio.textContent = fmt(ratio);
      els.sShare.textContent = fmt(S);
      els.vBonus.textContent = `+${V.toFixed(2)}`;
      els.aBonus.textContent = `+${A.toFixed(2)}`;
      els.kMaxCell.textContent = kMax.toFixed(2);
      els.kZona.textContent = K.toFixed(2);

      if (charts.ratio) {
        charts.ratio.data.datasets[0].data = [Math.min(N, C), Math.max(C - Math.min(N, C), 0)];
        charts.ratio.update();
      }
      if (charts.s) {
        charts.s.data.datasets[0].data = [n1, n2, n3, n4, n5];
        charts.s.update();
      }

      els.baseDocCell.textContent = money(baseDoc);
      els.kDocCell.textContent = K.toFixed(2);
      els.finalDocCell.textContent = money(finalDoc);
      els.shiftDocCell.textContent = money(shiftDoc);
      els.monthDocCell.textContent = money(monthDoc);

      els.baseNurseCell.textContent = money(baseNurse);
      els.kNurseCell.textContent = K.toFixed(2);
      els.finalNurseCell.textContent = money(finalNurse);
      els.shiftNurseCell.textContent = money(shiftNurse);
      els.monthNurseCell.textContent = money(monthNurse);

      els.baseAssistCell.textContent = money(baseAssist);
      els.kAssistCell.textContent = K.toFixed(2);
      els.finalAssistCell.textContent = money(finalAssist);
      els.shiftAssistCell.textContent = money(shiftAssist);
      els.monthAssistCell.textContent = money(monthAssist);

      return {
        date: els.date.value || null,
        shift: els.shift.value,
        zone: els.zone.value,
        zone_label: (ZONES.find(z=>z.id===els.zone.value)?.name) || els.zone.value,
        capacity: C,
        N,
        ESI: { n1, n2, n3, n4, n5 },
        ratio: Number(fmt(ratio)),
        S: Number(fmt(S)),
        V_bonus: Number(V.toFixed(2)),
        A_bonus: Number(A.toFixed(2)),
        K_max: Number(kMax.toFixed(2)),
        K_zona: Number(K.toFixed(2)),
        shift_hours: shiftH,
        month_hours: monthH,
        base_rates: { doctor: Number(baseDoc.toFixed(2)), nurse: Number(baseNurse.toFixed(2)), assistant: Number(baseAssist.toFixed(2)) },
        final_rates: { doctor: Number(finalDoc.toFixed(2)), nurse: Number(finalNurse.toFixed(2)), assistant: Number(finalAssist.toFixed(2)) },
        shift_salary: { doctor: Number(shiftDoc.toFixed(2)), nurse: Number(shiftNurse.toFixed(2)), assistant: Number(shiftAssist.toFixed(2)) },
        month_salary: { doctor: Number(monthDoc.toFixed(2)), nurse: Number(monthNurse.toFixed(2)), assistant: Number(monthAssist.toFixed(2)) }
      };
    }

function resetAll(){
      els.date.value = ''; els.shift.value = 'D';
      if (!ZONES.length) ZONES = clone(DEFAULT_ZONES);
      renderZoneSelect(false);
      els.N.value = 0; els.kmax.value = 1.30; els.linkN.checked = true;
      els.shiftHours.value = 12; els.monthHours.value = 0;
      els.esi1.value = 0; els.esi2.value = 0; els.esi3.value = 0; els.esi4.value = 0; els.esi5.value = 0;
      // bandome užkrauti tarifų šabloną
      try { const j = localStorage.getItem(LS_RATE_KEY); if (j){ const t = JSON.parse(j); els.baseRateDoc.value = t.doc ?? 0; els.baseRateNurse.value = t.nurse ?? 0; els.baseRateAssist.value = t.assist ?? 0; } else { els.baseRateDoc.value = 0; els.baseRateNurse.value = 0; els.baseRateAssist.value = 0; } } catch { els.baseRateDoc.value = 0; els.baseRateNurse.value = 0; els.baseRateAssist.value = 0; }
      compute();
}

function downloadCsv(){
  const data = compute();
  const rows = [
    ['date', data.date],
    ['shift', data.shift],
    ['zone', data.zone],
    ['zone_label', data.zone_label],
    ['capacity', data.capacity],
    ['N', data.N],
    ['ESI1', data.ESI.n1],
    ['ESI2', data.ESI.n2],
    ['ESI3', data.ESI.n3],
    ['ESI4', data.ESI.n4],
    ['ESI5', data.ESI.n5],
    ['ratio', data.ratio],
    ['S', data.S],
    ['V_bonus', data.V_bonus],
    ['A_bonus', data.A_bonus],
    ['K_max', data.K_max],
    ['K_zona', data.K_zona],
    ['shift_hours', data.shift_hours],
    ['month_hours', data.month_hours],
    ['base_rate_doctor', data.base_rates.doctor],
    ['base_rate_nurse', data.base_rates.nurse],
    ['base_rate_assistant', data.base_rates.assistant],
    ['final_rate_doctor', data.final_rates.doctor],
    ['final_rate_nurse', data.final_rates.nurse],
    ['final_rate_assistant', data.final_rates.assistant],
    ['shift_salary_doctor', data.shift_salary.doctor],
    ['shift_salary_nurse', data.shift_salary.nurse],
    ['shift_salary_assistant', data.shift_salary.assistant],
    ['month_salary_doctor', data.month_salary.doctor],
    ['month_salary_nurse', data.month_salary.nurse],
    ['month_salary_assistant', data.month_salary.assistant]
  ];
  const headers = rows.map(r => r[0]).join(',');
  const values = rows.map(r => r[1]).join(',');
  const csv = `${headers}\n${values}`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'salary_calc.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Įvykiai ---
    ['input','change'].forEach(evt => { ['date','shift','zone','capacity','N','kmax','shiftHours','monthHours','baseRateDoc','baseRateNurse','baseRateAssist','linkN','esi1','esi2','esi3','esi4','esi5'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener(evt, compute); }); });
    document.getElementById('shift').addEventListener('change', setDefaultCapacity);
    document.getElementById('zone').addEventListener('change', setDefaultCapacity);
    document.getElementById('reset').addEventListener('click', (e)=>{ e.preventDefault(); resetAll(); });
document.getElementById('copy').addEventListener('click', (e)=>{ e.preventDefault(); const payload = compute(); const txt = JSON.stringify(payload, null, 2); navigator.clipboard.writeText(txt).then(()=>{ document.getElementById('copy').textContent = 'Nukopijuota ✓'; setTimeout(()=> document.getElementById('copy').textContent = 'Kopijuoti rezultatą (JSON)', 1400); }).catch(()=>{ alert('Nepavyko nukopijuoti. Pažymėkite ir kopijuokite rankiniu būdu.'); }); });
document.getElementById('downloadCsv').addEventListener('click', (e)=>{ e.preventDefault(); downloadCsv(); });

    // Zonų modalas
    els.manageZones.addEventListener('click', openZoneModal);
    els.addZone.addEventListener('click', addZone);
    els.saveZonesBtn.addEventListener('click', saveZonesAndClose);
    els.defaultsZones.addEventListener('click', resetToDefaults);
    els.closeZoneModal.addEventListener('click', closeZoneModal);

    // Tarifų šablonai
    els.saveRateTemplate.addEventListener('click', (e)=>{ e.preventDefault(); saveRateTemplate(); });
    els.loadRateTemplate.addEventListener('click', (e)=>{ e.preventDefault(); loadRateTemplate(); });

    // Init
    renderZoneSelect(false);
    resetAll();


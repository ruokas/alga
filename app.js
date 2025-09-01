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


    // --- Zonų duomenys ---
    const DEFAULT_ZONES = [
      { id: 'RED',   name: 'Raudona (kritinė)',       group: 'Suaugusiųjų', cap: { D: 16, N: 12, P: 28 } },
      { id: 'YEL',   name: 'Geltona (vidutinė)',      group: 'Suaugusiųjų', cap: { D: 22, N: 15, P: 37 } },
      { id: 'GRN',   name: 'Žalia (mažesnė skuba)',   group: 'Suaugusiųjų', cap: { D: 28, N: 20, P: 48 } },
      { id: 'TRIAGE',name: 'Triage/registracija',     group: 'Bendra',       cap: { D: 35, N: 24, P: 59 } },
      { id: 'OBS',   name: 'Stebėjimo zona',          group: 'Bendra',       cap: { D: 14, N: 10, P: 24 } },
      { id: 'PROCS', name: 'Procedūrų zona',          group: 'Bendra',       cap: { D: 12, N: 10, P: 22 } },
      { id: 'PED',   name: 'Vaikų zona',              group: 'Vaikų',        cap: { D: 20, N: 14, P: 34 } },
      { id: 'OTHER', name: 'Kita',                    group: 'Bendra',       cap: { D: 20, N: 16, P: 36 } }
    ];

    const LS_KEY = 'ED_ZONES_V2';
    const LS_RATE_KEY = 'ED_RATE_TEMPLATE_V2';
    const LS_THRESH_KEY = 'ED_THRESHOLDS';

    function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
    function sanitizeId(txt){ const s = (txt||'').toString().toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_|_$/g,''); return s || 'ZONE_' + Math.random().toString(36).slice(2,6).toUpperCase(); }

    function loadZones(){
      try {
        const j = localStorage.getItem(LS_KEY);
        if (j){
          const arr = JSON.parse(j);
          if (Array.isArray(arr)) return arr;
        }
      } catch (err) {
        console.error('Failed to load zones from storage', err);
        alert('Nepavyko įkelti zonų. Patikrinkite naršyklės nustatymus (pvz., privatumo režimą ar slapukų blokavimą).');
      }
      return clone(DEFAULT_ZONES);
    }
    function saveZones(zs){
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(zs));
      } catch (err) {
        console.error('Failed to save zones to storage', err);
        alert('Nepavyko išsaugoti zonų. Patikrinkite naršyklės nustatymus (pvz., privatumo režimą ar slapukų blokavimą).');
      }
    }

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
      downloadPdf: document.getElementById('downloadPdf'),
      manageZones: document.getElementById('manageZones'),
      zoneModal: document.getElementById('zoneModal'),
      zoneTbody: document.getElementById('zoneTbody'),
      addZone: document.getElementById('addZone'),
      saveZonesBtn: document.getElementById('saveZonesBtn'),
      defaultsZones: document.getElementById('defaultsZones'),
      closeZoneModal: document.getElementById('closeZoneModal'),
      saveRateTemplate: document.getElementById('saveRateTemplate'),
      loadRateTemplate: document.getElementById('loadRateTemplate'),
      saveThresholds: document.getElementById('saveThresholds'),
      resetThresholds: document.getElementById('resetThresholds')
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
  const cap = z ? (
    s === 'D' ? (z.cap?.D ?? 20) :
    s === 'N' ? (z.cap?.N ?? 16) :
    (z.cap?.P ?? ((z.cap?.D ?? 20) + (z.cap?.N ?? 16)))
  ) : 20;
  els.capacity.value = cap;
}

function handleShiftChange(){
  setDefaultCapacity();
  if (els.shift.value === 'P') {
    els.shiftHours.value = 24;
  } else if (toNum(els.shiftHours.value) === 24) {
    els.shiftHours.value = 12;
  }
  compute();
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
          <td><input type="number" min="0" step="1" value="${z.cap?.P ?? 0}" data-idx="${idx}" data-field="capP" /></td>
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
          if (f==='capP') { ZONES[i].cap = ZONES[i].cap || {}; ZONES[i].cap.P = toNum(v); }
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
      ZONES.push({ id, name: baseName, group: '', cap: { D: 20, N: 16, P: 36 } });
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

      const data = computeCore.compute({
        C,
        kMax,
        baseDoc,
        baseNurse,
        baseAssist,
        shiftH,
        monthH,
        n1,
        n2,
        n3,
        n4,
        n5,
        N,
      });

      els.ratio.textContent = fmt(data.ratio);
      els.sShare.textContent = fmt(data.S);
      els.vBonus.textContent = `+${data.V_bonus.toFixed(2)}`;
      els.aBonus.textContent = `+${data.A_bonus.toFixed(2)}`;
      els.kMaxCell.textContent = data.K_max.toFixed(2);
      els.kZona.textContent = data.K_zona.toFixed(2);

      if (charts.ratio) {
        charts.ratio.data.datasets[0].data = [Math.min(data.N, C), Math.max(C - Math.min(data.N, C), 0)];
        charts.ratio.update();
      }
      if (charts.s) {
        charts.s.data.datasets[0].data = [n1, n2, n3, n4, n5];
        charts.s.update();
      }

      els.baseDocCell.textContent = money(data.base_rates.doctor);
      els.kDocCell.textContent = data.K_zona.toFixed(2);
      els.finalDocCell.textContent = money(data.final_rates.doctor);
      els.shiftDocCell.textContent = money(data.shift_salary.doctor);
      els.monthDocCell.textContent = money(data.month_salary.doctor);

      els.baseNurseCell.textContent = money(data.base_rates.nurse);
      els.kNurseCell.textContent = data.K_zona.toFixed(2);
      els.finalNurseCell.textContent = money(data.final_rates.nurse);
      els.shiftNurseCell.textContent = money(data.shift_salary.nurse);
      els.monthNurseCell.textContent = money(data.month_salary.nurse);

      els.baseAssistCell.textContent = money(data.base_rates.assistant);
      els.kAssistCell.textContent = data.K_zona.toFixed(2);
      els.finalAssistCell.textContent = money(data.final_rates.assistant);
      els.shiftAssistCell.textContent = money(data.shift_salary.assistant);
      els.monthAssistCell.textContent = money(data.month_salary.assistant);

      return {
        date: els.date.value || null,
        shift: els.shift.value,
        zone: els.zone.value,
        zone_label: (ZONES.find(z=>z.id===els.zone.value)?.name) || els.zone.value,
        capacity: C,
        ...data,
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
  const csv = csvUtils.rowsToCsv(rows);
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

function downloadPdf(){
  try {
    const data = compute();
    const doc = pdfUtils.generatePdf(data);
    doc.save('salary_calc.pdf');
  } catch (err) {
    alert('Nepavyko sugeneruoti PDF. Patikrinkite ar įkelta jsPDF biblioteka.');
    console.error(err);
  }
}

function loadThresholdInputs(){
  const tables = computeCore.loadThresholds();
  tables.V_BONUS.forEach((row, i) => {
    const l = document.getElementById(`vLimit${i}`);
    const v = document.getElementById(`vValue${i}`);
    if (l) l.value = row.limit === Infinity ? '' : row.limit;
    if (v) v.value = row.value;
  });
  tables.A_BONUS.forEach((row, i) => {
    const l = document.getElementById(`aLimit${i}`);
    const v = document.getElementById(`aValue${i}`);
    if (l) l.value = row.limit === Infinity ? '' : row.limit;
    if (v) v.value = row.value;
  });
}

function readThresholdInputs(){
  const v = [], a = [];
  for(let i=0;i<4;i++){
    const l = document.getElementById(`vLimit${i}`);
    const val = document.getElementById(`vValue${i}`);
    const limit = parseFloat(l?.value);
    const value = parseFloat(val?.value);
    v.push({ limit: Number.isFinite(limit) ? limit : Infinity, value: Number.isFinite(value) ? value : 0 });
    const la = document.getElementById(`aLimit${i}`);
    const va = document.getElementById(`aValue${i}`);
    const limitA = parseFloat(la?.value);
    const valueA = parseFloat(va?.value);
    a.push({ limit: Number.isFinite(limitA) ? limitA : Infinity, value: Number.isFinite(valueA) ? valueA : 0 });
  }
  return { V_BONUS: v, A_BONUS: a };
}

function saveThresholdSettings(){
  try {
    const data = readThresholdInputs();
    localStorage.setItem(LS_THRESH_KEY, JSON.stringify(data));
    compute();
  } catch (err) {
    console.error('Failed to save thresholds', err);
    alert('Nepavyko išsaugoti slenksčių.');
  }
}

function resetThresholdSettings(){
  try { localStorage.removeItem(LS_THRESH_KEY); } catch {}
  loadThresholdInputs();
  compute();
}

// --- Įvykiai ---
['input','change'].forEach(evt => {
  ['date','zone','capacity','N','kmax','shiftHours','monthHours','baseRateDoc','baseRateNurse','baseRateAssist','linkN','esi1','esi2','esi3','esi4','esi5'].forEach(id => {
    const el = els[id];
    if (el) el.addEventListener(evt, compute);
  });
});
els.shift.addEventListener('change', handleShiftChange);
els.zone.addEventListener('change', setDefaultCapacity);
    els.reset.addEventListener('click', (e)=>{ e.preventDefault(); resetAll(); });
      els.copy.addEventListener('click', (e)=>{
      e.preventDefault();
      const payload = compute();
      const txt = JSON.stringify(payload, null, 2);
      navigator.clipboard.writeText(txt).then(()=>{
        els.copy.textContent = 'Nukopijuota ✓';
        setTimeout(()=> els.copy.textContent = 'Kopijuoti rezultatą (JSON)', 1400);
      }).catch(()=>{
        alert('Nepavyko nukopijuoti. Pažymėkite ir kopijuokite rankiniu būdu.');
      });
    });
      els.downloadCsv.addEventListener('click', (e)=>{ e.preventDefault(); downloadCsv(); });
      els.downloadPdf.addEventListener('click', (e)=>{ e.preventDefault(); downloadPdf(); });

    // Zonų modalas
    els.manageZones.addEventListener('click', openZoneModal);
    els.addZone.addEventListener('click', addZone);
    els.saveZonesBtn.addEventListener('click', saveZonesAndClose);
    els.defaultsZones.addEventListener('click', resetToDefaults);
    els.closeZoneModal.addEventListener('click', closeZoneModal);

    els.saveThresholds.addEventListener('click', (e)=>{ e.preventDefault(); saveThresholdSettings(); });
    els.resetThresholds.addEventListener('click', (e)=>{ e.preventDefault(); resetThresholdSettings(); });

    // Tarifų šablonai
    els.saveRateTemplate.addEventListener('click', (e)=>{ e.preventDefault(); saveRateTemplate(); });
    els.loadRateTemplate.addEventListener('click', (e)=>{ e.preventDefault(); loadRateTemplate(); });

    // Init
    renderZoneSelect(false);
    loadThresholdInputs();
    resetAll();


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
    const THRESHOLDS_KEY = 'ED_THRESHOLDS';

    function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
    function sanitizeId(txt){ const s = (txt||'').toString().toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_|_$/g,''); return s || 'ZONE_' + Math.random().toString(36).slice(2,6).toUpperCase(); }

    function stringifyThresholds(t){
      return JSON.stringify(t, (k,v)=> v===Infinity ? 'Infinity' : v, 2);
    }
    function parseThresholds(str){
      return JSON.parse(str, (k,v)=> v === 'Infinity' ? Infinity : v);
    }
    function loadThresholds(){
      try {
        const j = localStorage.getItem(THRESHOLDS_KEY);
        if (j){
          return parseThresholds(j);
        }
      } catch (err){
        console.error('Failed to load thresholds', err);
      }
      return clone(computeCore.THRESHOLDS);
    }
    function saveThresholds(t){
      try {
        localStorage.setItem(THRESHOLDS_KEY, stringifyThresholds(t));
      } catch (err){
        console.error('Failed to save thresholds', err);
        alert('Nepavyko išsaugoti priedų ribų. Patikrinkite naršyklės nustatymus.');
      }
    }

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

    const DEFAULT_ROLES = [
      { id: 'doctor', name: 'Gydytojas' },
      { id: 'nurse', name: 'Slaugytojas' },
      { id: 'assistant', name: 'Padėjėjas' },
    ];
    const ROLE_KEY = 'ED_ROLES';
    function loadRoles(){
      try {
        const j = localStorage.getItem(ROLE_KEY);
        if (j){
          const arr = JSON.parse(j);
          if (Array.isArray(arr)) return arr;
        }
      } catch (err){
        console.error('Failed to load roles', err);
      }
      return clone(DEFAULT_ROLES);
    }
    function saveRoles(rs){
      try {
        localStorage.setItem(ROLE_KEY, JSON.stringify(rs));
      } catch (err){
        console.error('Failed to save roles', err);
      }
    }

    let ZONES = loadZones();
    let THRESHOLDS = loadThresholds();
    let ROLES = loadRoles();

    function renderRoleInputs(){
      els.roleInputs.innerHTML = '';
      ROLES.forEach(r => {
        const div = document.createElement('div');
        div.className = 'role-row';
        div.dataset.id = r.id;
        div.innerHTML = `<input type="text" class="role-name" value="${r.name}" />`+
          `<input type="number" class="role-base" min="0" step="0.01" value="0" />`+
          `<button type="button" class="remove-role">×</button>`;
        els.roleInputs.appendChild(div);
      });
    }

    function addRole(){
      const id = 'ROLE_' + Math.random().toString(36).slice(2,6).toUpperCase();
      ROLES.push({ id, name: 'Nauja rolė' });
      saveRoles(ROLES);
      renderRoleInputs();
      loadRateTemplate();
      compute();
    }

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
      roleInputs: document.getElementById('roleInputs'),
      addRole: document.getElementById('addRole'),
      roleRatesBody: document.getElementById('roleRatesBody'),
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
      loadRateTemplate: document.getElementById('loadRateTemplate'),
      manageThresholds: document.getElementById('manageThresholds'),
      thresholdModal: document.getElementById('thresholdModal'),
      thresholdsInput: document.getElementById('thresholdsInput'),
      saveThresholdsBtn: document.getElementById('saveThresholdsBtn'),
      defaultsThresholds: document.getElementById('defaultsThresholds'),
      closeThresholdModal: document.getElementById('closeThresholdModal')
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

    // --- Priedų ribų modalas ---
    function openThresholdModal(){
      els.thresholdsInput.value = stringifyThresholds(THRESHOLDS);
      els.thresholdModal.classList.add('active');
    }
    function closeThresholdModal(){ els.thresholdModal.classList.remove('active'); }
    function saveThresholdsAndClose(){
      try {
        THRESHOLDS = parseThresholds(els.thresholdsInput.value);
        saveThresholds(THRESHOLDS);
        compute();
        closeThresholdModal();
      } catch (err){
        alert('Neteisingas JSON formatas.');
      }
    }
    function resetThresholds(){
      if (confirm('Atstatyti numatytąsias priedų ribas?')){
        THRESHOLDS = clone(computeCore.THRESHOLDS);
        els.thresholdsInput.value = stringifyThresholds(THRESHOLDS);
        saveThresholds(THRESHOLDS);
        compute();
      }
    }

    // --- Tarifų šablonas ---
    function saveRateTemplate(){
      const payload = {};
      els.roleInputs.querySelectorAll('.role-row').forEach(row => {
        const id = row.dataset.id;
        const base = toNum(row.querySelector('.role-base').value);
        payload[id] = base;
      });
      try { localStorage.setItem(LS_RATE_KEY, JSON.stringify(payload)); alert('Tarifų šablonas įsimintas.'); } catch {}
    }
    function loadRateTemplate(){
      try {
        const j = localStorage.getItem(LS_RATE_KEY);
        if (j){
          const t = JSON.parse(j);
          if (t){
            els.roleInputs.querySelectorAll('.role-row').forEach(row => {
              const id = row.dataset.id;
              row.querySelector('.role-base').value = t[id] ?? 0;
            });
            compute();
            return;
          }
        }
      } catch {}
      alert('Nerasta išsaugoto šablono.');
    }

    // --- Skaičiavimai ---
    function compute(){
      const C = Math.max(0, toNum(els.capacity.value));
      const kMax = Math.min(2, Math.max(1, toNum(els.kmax.value)));
      const shiftH = Math.max(0, toNum(els.shiftHours.value));
      const monthH = Math.max(0, toNum(els.monthHours.value));
      let n1 = Math.max(0, toNum(els.esi1.value));
      let n2 = Math.max(0, toNum(els.esi2.value));
      let n3 = Math.max(0, toNum(els.esi3.value));
      let n4 = Math.max(0, toNum(els.esi4.value));
      let n5 = Math.max(0, toNum(els.esi5.value));

      let N = Math.max(0, toNum(els.N.value));
      if (els.linkN.checked){ N = n1 + n2 + n3 + n4 + n5; els.N.value = N; els.N.disabled = true; } else els.N.disabled = false;

      const roles = Array.from(els.roleInputs.querySelectorAll('.role-row')).map(row => ({
        id: row.dataset.id,
        name: row.querySelector('.role-name').value,
        base: toNum(row.querySelector('.role-base').value),
      }));

      const data = computeCore.compute({
        C,
        kMax,
        roles,
        shiftH,
        monthH,
        n1,
        n2,
        n3,
        n4,
        n5,
        N,
      }, THRESHOLDS);

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

      els.roleRatesBody.innerHTML = '';
      roles.forEach(r => {
        const tr = document.createElement('tr');
        const id = r.id;
        tr.innerHTML = `<td>${r.name}</td>`+
          `<td>${money(data.base_rates[id])}</td>`+
          `<td>${data.K_zona.toFixed(2)}</td>`+
          `<td class="accent">${money(data.final_rates[id])}</td>`+
          `<td>${money(data.shift_salary[id])}</td>`+
          `<td>${money(data.month_salary[id])}</td>`;
        els.roleRatesBody.appendChild(tr);
      });

      return {
        date: els.date.value || null,
        shift: els.shift.value,
        zone: els.zone.value,
        zone_label: (ZONES.find(z=>z.id===els.zone.value)?.name) || els.zone.value,
        capacity: C,
        ...data,
        roles: roles.map(r=>({ id: r.id, name: r.name }))
      };
    }

function resetAll(){
      els.date.value = ''; els.shift.value = 'D';
      if (!ZONES.length) ZONES = clone(DEFAULT_ZONES);
      renderZoneSelect(false);
      els.N.value = 0; els.kmax.value = 1.30; els.linkN.checked = true;
      els.shiftHours.value = 12; els.monthHours.value = 0;
      els.esi1.value = 0; els.esi2.value = 0; els.esi3.value = 0; els.esi4.value = 0; els.esi5.value = 0;
      renderRoleInputs();
      loadRateTemplate();
      compute();
}

function downloadCsv(){
  const data = compute();
  const csv = (typeof csvUtils !== 'undefined' && typeof csvUtils.dataToCsv === 'function')
    ? csvUtils.dataToCsv(data)
    : '';
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
    ['input','change'].forEach(evt => {
      ['date','shift','zone','capacity','N','kmax','shiftHours','monthHours','linkN','esi1','esi2','esi3','esi4','esi5'].forEach(id => {
        const el = els[id];
        if (el) el.addEventListener(evt, compute);
      });
    });
    els.roleInputs.addEventListener('input', e => {
      if (e.target.classList.contains('role-name')) {
        const row = e.target.closest('.role-row');
        const role = ROLES.find(r => r.id === row.dataset.id);
        if (role) { role.name = e.target.value; saveRoles(ROLES); }
        compute();
      } else if (e.target.classList.contains('role-base')) {
        compute();
      }
    });
    els.roleInputs.addEventListener('click', e => {
      if (e.target.classList.contains('remove-role')) {
        const row = e.target.closest('.role-row');
        ROLES = ROLES.filter(r => r.id !== row.dataset.id);
        saveRoles(ROLES);
        renderRoleInputs();
        loadRateTemplate();
        compute();
      }
    });
    els.addRole.addEventListener('click', (e)=>{ e.preventDefault(); addRole(); });
    els.shift.addEventListener('change', setDefaultCapacity);
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

    // Zonų modalas
    els.manageZones.addEventListener('click', openZoneModal);
    els.addZone.addEventListener('click', addZone);
    els.saveZonesBtn.addEventListener('click', saveZonesAndClose);
    els.defaultsZones.addEventListener('click', resetToDefaults);
    els.closeZoneModal.addEventListener('click', closeZoneModal);

    // Priedų ribų modalas
    els.manageThresholds.addEventListener('click', openThresholdModal);
    els.saveThresholdsBtn.addEventListener('click', saveThresholdsAndClose);
    els.defaultsThresholds.addEventListener('click', resetThresholds);
    els.closeThresholdModal.addEventListener('click', closeThresholdModal);

    // Tarifų šablonai
    els.saveRateTemplate.addEventListener('click', (e)=>{ e.preventDefault(); saveRateTemplate(); });
    els.loadRateTemplate.addEventListener('click', (e)=>{ e.preventDefault(); loadRateTemplate(); });

    // Init
    renderZoneSelect(false);
    resetAll();


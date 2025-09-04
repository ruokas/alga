export const DEFAULT_ZONES = [
  { id: 'RED',   name: 'Raudona (kritinė)',       group: 'Suaugusiųjų', cap: { D: 16, N: 12, P: 28 } },
  { id: 'YEL',   name: 'Geltona (vidutinė)',      group: 'Suaugusiųjų', cap: { D: 22, N: 15, P: 37 } },
  { id: 'GRN',   name: 'Žalia (mažesnė skuba)',   group: 'Suaugusiųjų', cap: { D: 28, N: 20, P: 48 } },
  { id: 'TRIAGE',name: 'Triage/registracija',     group: 'Bendra',       cap: { D: 35, N: 24, P: 59 } },
  { id: 'OBS',   name: 'Stebėjimo zona',          group: 'Bendra',       cap: { D: 14, N: 10, P: 24 } },
  { id: 'OTHER', name: 'Kita',                    group: 'Bendra',       cap: { D: 20, N: 16, P: 36 } }
];

const LS_KEY = 'ED_ZONES_V2';

export function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
export function sanitizeId(txt) {
  const s = (txt || '').toString().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  return s || 'ZONE_' + Math.random().toString(36).slice(2,6).toUpperCase();
}

export function loadZones() {
  try {
    const j = localStorage.getItem(LS_KEY);
    if (j) {
      const arr = JSON.parse(j);
      if (Array.isArray(arr)) return arr;
    }
  } catch (err) {
    console.error('Failed to load zones from storage', err);
    alert('Nepavyko įkelti zonų. Patikrinkite naršyklės nustatymus (pvz., privatumo režimą ar slapukų blokavimą).');
  }
  return clone(DEFAULT_ZONES);
}

export function saveZones(zs) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(zs));
  } catch (err) {
    console.error('Failed to save zones to storage', err);
    alert('Nepavyko išsaugoti zonų. Patikrinkite naršyklės nustatymus (pvz., privatumo režimą ar slapukų blokavimą).');
  }
}

export function initZones(els) {
  let ZONES = loadZones();

  function renderZoneSelect(preserve) {
    const prev = preserve ? els.zone.value : null;
    els.zone.innerHTML = '';
    const groups = {};
    ZONES.forEach(z => { const g = z.group || 'Kita'; (groups[g] ||= []).push(z); });
    Object.keys(groups).sort().forEach(g => {
      const og = document.createElement('optgroup'); og.label = g;
      groups[g].forEach(z => {
        const opt = document.createElement('option');
        opt.value = z.id; opt.textContent = z.name;
        opt.dataset.capacityD = z.cap?.D ?? 20;
        opt.dataset.capacityN = z.cap?.N ?? 16;
        og.appendChild(opt);
      });
      els.zone.appendChild(og);
    });
    if (prev && ZONES.some(z=>z.id===prev)) els.zone.value = prev;
    if (!els.zone.value && ZONES.length) els.zone.value = ZONES[0].id;
    setDefaultCapacity();
  }

  function setDefaultCapacity() {
    const id = els.zone.value; const s = els.shift.value;
    const z = ZONES.find(x=>x.id===id);
    const cap = z ? (
      s === 'D' ? (z.cap?.D ?? 20) :
      s === 'N' ? (z.cap?.N ?? 16) :
      (z.cap?.P ?? ((z.cap?.D ?? 20) + (z.cap?.N ?? 16)))
    ) : 20;
    els.zoneCapacity.value = cap;
  }

  function openZoneModal() { els.zoneModal.classList.add('active'); renderZoneEditor(); }
  function closeZoneModal() { els.zoneModal.classList.remove('active'); }

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
      const tdDrag = document.createElement('td');
      const spanDrag = document.createElement('span');
      spanDrag.className = 'drag-handle';
      spanDrag.title = 'Vilkite rikiavimui';
      tdDrag.appendChild(spanDrag);
      tr.appendChild(tdDrag);

      const tdName = document.createElement('td');
      const inpName = document.createElement('input');
      inpName.type = 'text';
      inpName.value = z.name;
      inpName.dataset.idx = idx;
      inpName.dataset.field = 'name';
      tdName.appendChild(inpName);
      tr.appendChild(tdName);

      const tdId = document.createElement('td');
      const inpId = document.createElement('input');
      inpId.type = 'text';
      inpId.value = z.id;
      inpId.dataset.idx = idx;
      inpId.dataset.field = 'id';
      tdId.appendChild(inpId);
      tr.appendChild(tdId);

      const tdGroup = document.createElement('td');
      const inpGroup = document.createElement('input');
      inpGroup.type = 'text';
      inpGroup.value = z.group || '';
      inpGroup.dataset.idx = idx;
      inpGroup.dataset.field = 'group';
      inpGroup.placeholder = 'pvz., Suaugusiųjų';
      tdGroup.appendChild(inpGroup);
      tr.appendChild(tdGroup);

      const tdCapD = document.createElement('td');
      const inpCapD = document.createElement('input');
      inpCapD.type = 'number';
      inpCapD.min = '0';
      inpCapD.step = '1';
      inpCapD.value = z.cap?.D ?? 0;
      inpCapD.dataset.idx = idx;
      inpCapD.dataset.field = 'capD';
      tdCapD.appendChild(inpCapD);
      tr.appendChild(tdCapD);

      const tdCapN = document.createElement('td');
      const inpCapN = document.createElement('input');
      inpCapN.type = 'number';
      inpCapN.min = '0';
      inpCapN.step = '1';
      inpCapN.value = z.cap?.N ?? 0;
      inpCapN.dataset.idx = idx;
      inpCapN.dataset.field = 'capN';
      tdCapN.appendChild(inpCapN);
      tr.appendChild(tdCapN);

      const tdCapP = document.createElement('td');
      const inpCapP = document.createElement('input');
      inpCapP.type = 'number';
      inpCapP.min = '0';
      inpCapP.step = '1';
      inpCapP.value = z.cap?.P ?? 0;
      inpCapP.dataset.idx = idx;
      inpCapP.dataset.field = 'capP';
      tdCapP.appendChild(inpCapP);
      tr.appendChild(tdCapP);

      const tdDel = document.createElement('td');
      const btnDel = document.createElement('button');
      btnDel.dataset.action = 'del';
      btnDel.dataset.idx = idx;
      btnDel.textContent = 'Šalinti';
      tdDel.appendChild(btnDel);
      tr.appendChild(tdDel);

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
        if (f==='capD') { ZONES[i].cap = ZONES[i].cap || {}; ZONES[i].cap.D = Number(v); }
        if (f==='capN') { ZONES[i].cap = ZONES[i].cap || {}; ZONES[i].cap.N = Number(v); }
        if (f==='capP') { ZONES[i].cap = ZONES[i].cap || {}; ZONES[i].cap.P = Number(v); }
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
    const ids = new Set();
    for (const z of ZONES){
      if (!z.id) z.id = sanitizeId(z.name);
      if (ids.has(z.id)) { alert('Zonų kodai turi būti unikalūs. Dubliuotas: ' + z.id); return; }
      ids.add(z.id);
      z.cap = { D: Number(z.cap?.D) || 0, N: Number(z.cap?.N) || 0 };
      if (!z.name) z.name = z.id;
    }
    saveZones(ZONES);
    renderZoneSelect(true);
    closeZoneModal();
  }

  function resetToDefaults(){ if (confirm('Atstatyti numatytąsias zonas? Jūsų sąrašas bus pakeistas.')) { ZONES = clone(DEFAULT_ZONES); saveZones(ZONES); renderZoneEditor(); renderZoneSelect(false); } }

  return {
    renderZoneSelect,
    setDefaultCapacity,
    openZoneModal,
    closeZoneModal,
    addZone,
    saveZonesAndClose,
    resetToDefaults,
    getZones: () => ZONES,
  };
}

// CommonJS support
if (typeof module !== 'undefined') {
  module.exports = { DEFAULT_ZONES, clone, sanitizeId, loadZones, saveZones, initZones };
}

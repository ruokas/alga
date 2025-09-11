import { initThemeToggle } from './theme.js';
import { initZones } from './zones.js';
import { downloadCsv, downloadPdf } from './downloads.js';
import { compute as coreCompute } from './compute.js';
import { updateChart } from './chart-utils.js';
import { simulateEsiCounts } from './simulation.js';
import { DEFAULT_KZ_CONFIG } from './kz-config.js';

const LS_RATE_KEY = 'ED_RATE_TEMPLATE_V2';

const els = {
  date: document.getElementById('date'),
  shift: document.getElementById('shift'),
  zone: document.getElementById('zone'),
  zoneCapacity: document.getElementById('zoneCapacity') || document.getElementById('capacity'),
  patientCount: document.getElementById('patientCount') || document.getElementById('N'),
  formula: document.getElementById('formula'),
  formulaInfo: document.getElementById('formulaInfo'),
  maxCoefficient: document.getElementById('maxCoefficient') || document.getElementById('kmax'),
  shiftHours: document.getElementById('shiftHours'),
  monthHours: document.getElementById('monthHours'),
  baseRateDoc: document.getElementById('baseRateDoc'),
  baseRateNurse: document.getElementById('baseRateNurse'),
  baseRateAssist: document.getElementById('baseRateAssist'),
  linkPatientCount: document.getElementById('linkPatientCount') || document.getElementById('linkN'),
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
  maxCoefficientCell: document.getElementById('maxCoefficientCell') || document.getElementById('kMaxCell'),
  kZona: document.getElementById('kZona'),
  baseDocCell: document.getElementById('baseDocCell'),
  kDocCell: document.getElementById('kDocCell'),
  finalDocCell: document.getElementById('finalDocCell'),
  shiftDocCell: document.getElementById('shiftDocCell'),
  monthDocCell: document.getElementById('monthDocCell'),
  deltaDocCell: document.getElementById('deltaDocCell'),
  baseNurseCell: document.getElementById('baseNurseCell'),
  kNurseCell: document.getElementById('kNurseCell'),
  finalNurseCell: document.getElementById('finalNurseCell'),
  shiftNurseCell: document.getElementById('shiftNurseCell'),
  monthNurseCell: document.getElementById('monthNurseCell'),
  deltaNurseCell: document.getElementById('deltaNurseCell'),
    baseAssistCell: document.getElementById('baseAssistCell'),
    kAssistCell: document.getElementById('kAssistCell'),
    finalAssistCell: document.getElementById('finalAssistCell'),
    shiftAssistCell: document.getElementById('shiftAssistCell'),
    monthAssistCell: document.getElementById('monthAssistCell'),
    deltaAssistCell: document.getElementById('deltaAssistCell'),
    rateTbody: document.getElementById('rateTbody'),
    extraRoles: document.getElementById('extraRoles'),
    addRateRole: document.getElementById('addRateRole'),
    simulateEsi: document.getElementById('simulateEsi'),
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
  payCanvas: document.getElementById('payChart'),
  budgetPlanner: document.getElementById('budgetPlanner'),
};

// Legacy aliases
els.capacity = els.zoneCapacity;
els.N = els.patientCount;
els.kmax = els.maxCoefficient;
els.linkN = els.linkPatientCount;
els.kMaxCell = els.maxCoefficientCell;

initThemeToggle();

const zoneApi = initZones(els);
const { renderZoneSelect, setDefaultCapacity, openZoneModal, closeZoneModal, addZone, saveZonesAndClose, resetToDefaults, getZones } = zoneApi;

const style = getComputedStyle(document.documentElement);
const accent = style.getPropertyValue('--accent').trim();
const borderColor = style.getPropertyValue('--border').trim();
const danger = style.getPropertyValue('--danger').trim();
const accent2 = style.getPropertyValue('--accent-2').trim();
const muted = style.getPropertyValue('--muted').trim();
const textColor = style.getPropertyValue('--text').trim();

function handleChartError(canvas, name, err) {
  const id = canvas && canvas.id ? `#${canvas.id}` : '';
  console.error(`Failed to create ${name} chart (${id})`, err?.stack || err);
  if (canvas) {
    const msg = document.createElement('div');
    msg.className = 'chart-error';
    msg.textContent = `Unable to render ${name} chart`;
    canvas.replaceWith(msg);
  }
}

const ROLE_LABELS = { doctor: 'Gydytojas', nurse: 'Slaugytojas', assistant: 'Padėjėjas' };
const charts = {};
if (els.ratioCanvas) {
  if (typeof Chart !== 'undefined') {
    try {
      const ctx = els.ratioCanvas.getContext && els.ratioCanvas.getContext('2d');
      if (ctx) {
        charts.ratio = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Pacientų skaičius', 'Likutis'],
            datasets: [{ data: [0, 1], backgroundColor: [accent, borderColor], borderWidth: 0 }]
          },
          options: {
            rotation: -90,
            circumference: 180,
            cutout: '70%',
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            maintainAspectRatio: false,
            responsive: true
          }
        });
      }
    } catch (err) {
      handleChartError(els.ratioCanvas, 'ratio', err);
    }
  } else {
    console.warn('Chart.js not available: ratio chart skipped');
  }
}
if (els.sCanvas) {
  if (typeof Chart !== 'undefined') {
    try {
      const ctx = els.sCanvas.getContext && els.sCanvas.getContext('2d');
      if (ctx) {
        charts.s = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['ESI1', 'ESI2', 'ESI3', 'ESI4', 'ESI5'],
            datasets: [{ data: [0, 0, 0, 0, 0], backgroundColor: [danger, accent2, muted, muted, muted] }]
          },
          options: {
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
            maintainAspectRatio: false,
            responsive: true
          }
        });
      }
    } catch (err) {
      handleChartError(els.sCanvas, 's', err);
    }
  } else {
    console.warn('Chart.js not available: s chart skipped');
  }
}
if (els.payCanvas) {
  if (typeof Chart !== 'undefined') {
    try {
      const ctx = els.payCanvas.getContext && els.payCanvas.getContext('2d');
      if (ctx) {
        const barValuePlugin = {
          id: 'barValue',
          afterDatasetsDraw(chart) {
            const { ctx: c } = chart;
            c.save();
            chart.data.datasets.forEach((dataset, i) => {
              const meta = chart.getDatasetMeta(i);
              meta.data.forEach((bar, idx) => {
                const val = dataset.data[idx];
                c.fillStyle = textColor;
                c.textAlign = 'center';
                c.font = '12px sans-serif';
                let y = bar.y - 4;
                let baseline = 'bottom';
                if (y < 12) {
                  y = bar.y + 12;
                  baseline = 'top';
                }
                c.textBaseline = baseline;
                c.fillText(money(val), bar.x, y);
              });
            });
            c.restore();
          }
        };
        charts.pay = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: [],
            datasets: [
              { label: 'Bazinis', data: [], backgroundColor: borderColor },
              { label: 'Pakoreguotas', data: [], backgroundColor: accent }
            ]
          },
          options: {
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { display: false }, y: { display: false } },
            maintainAspectRatio: false,
            responsive: true,
            datasets: { barPercentage: 0.6, categoryPercentage: 0.5 }
          },
          plugins: [barValuePlugin]
        });
      }
    } catch (err) {
      handleChartError(els.payCanvas, 'pay', err);
    }
  } else {
    console.warn('Chart.js not available: pay chart skipped');
  }
}



function toNum(v){ const n = Number(v); return Number.isFinite(n) ? n : 0; }
function fmt(n, d=2){ return (Number.isFinite(n) ? n : 0).toFixed(d); }
function money(n){ try{ return new Intl.NumberFormat('lt-LT',{style:'currency',currency:'EUR'}).format(n||0); }catch{ return `€${fmt(n)}`; } }

function getExtraRates(){
  const rates = {};
  if (!els.extraRoles) return rates;
  els.extraRoles.querySelectorAll('.extra-role').forEach(group => {
    const name = group.querySelector('.role-name')?.value.trim();
    const rate = toNum(group.querySelector('.role-rate')?.value);
    if (name) rates[name] = Math.max(0, rate);
  });
  return rates;
}

function addRateRole(name = '', rate = 0){
  if (!els.extraRoles) return;
  const wrap = document.createElement('div');
  wrap.className = 'staff-group extra-role';
  wrap.innerHTML = `
    <h3><input type="text" class="role-name" placeholder="Rolė" value="${name}" /></h3>
    <div class="row">
      <div>
        <label>Bazinis tarifas (€/val.)</label>
        <input type="number" min="0" step="0.01" class="role-rate" value="${rate}" />
      </div>
      <div>
        <label>&nbsp;</label>
        <div class="actions">
          <button type="button" class="remove-rate-role">Šalinti</button>
        </div>
      </div>
    </div>`;
  els.extraRoles.appendChild(wrap);
  wrap.querySelectorAll('input').forEach(inp => inp.addEventListener('input', compute));
  wrap.querySelector('.remove-rate-role').addEventListener('click', () => { wrap.remove(); compute(); });
}

function validateInputs(){
  ['zoneCapacity','patientCount','maxCoefficient','shiftHours','monthHours','baseRateDoc','baseRateNurse','baseRateAssist','esi1','esi2','esi3','esi4','esi5'].forEach(id => {
    const el = els[id];
    if (!el) return;
    const val = toNum(el.value);
    if (val < 0) {
      el.classList.add('input-error');
      el.classList.remove('input-warning');
      el.title = 'Reikšmė negali būti neigiama';
    } else if (id === 'maxCoefficient' && (val < 1 || val > 2)) {
      el.classList.add('input-warning');
      el.classList.remove('input-error');
      el.title = 'Leistinas intervalas 1–2';
    } else {
      el.classList.remove('input-error','input-warning');
      el.removeAttribute('title');
    }
  });
}

/**
 * Rodoma informacija apie pasirinktą formulę.
 * @param {string} formula "legacy" arba "ladder"
 */
function renderFormulaInfo(formula){
  const el = els.formulaInfo;
  if (!el) return;
  if (formula === 'legacy') {
    el.innerHTML = `
      <table class="table">
        <tbody>
          <tr><td>V<sub>priedas</sub> (apkrova)</td><td>≤0.8 → 0.00 · (0.8–1.0] → 0.05 · (1.0–1.25] → 0.10 · &gt;1.25 → 0.15</td></tr>
          <tr><td>A<sub>priedas</sub> (triažas)</td><td>≤10% → 0.00 · (10–20]% → 0.05 · (20–30]% → 0.10 · &gt;30% → 0.15</td></tr>
        </tbody>
      </table>`;
  } else if (formula === 'ladder') {
    const vRows = DEFAULT_KZ_CONFIG.volume_ladder
      .map(l => `<tr><td>≤ ${l.r_max.toFixed(2)}</td><td>+${l.bonus.toFixed(2)}</td></tr>`)
      .join('');
    const sRows = DEFAULT_KZ_CONFIG.triage_ladder
      .map(l => `<tr><td>≤ ${(l.s_max*100).toFixed(0)}%</td><td>+${l.bonus.toFixed(2)}</td></tr>`)
      .join('');
    el.innerHTML = `
      <div class="row">
        <table class="table">
          <thead><tr><th>R</th><th>V</th></tr></thead>
          <tbody>${vRows}</tbody>
        </table>
        <table class="table">
          <thead><tr><th>S</th><th>A</th></tr></thead>
          <tbody>${sRows}</tbody>
        </table>
      </div>`;
  } else {
    el.innerHTML = '';
  }
}

function compute(){
  validateInputs();
  const zoneCapacity = Math.max(0, toNum(els.zoneCapacity.value));
  const maxCoefficient = Math.min(2, Math.max(1, toNum(els.maxCoefficient.value)));
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

  let patientCount = Math.max(0, toNum(els.patientCount.value));
  if (els.linkPatientCount.checked){ patientCount = n1 + n2 + n3 + n4 + n5; els.patientCount.value = patientCount; els.patientCount.disabled = true; } else els.patientCount.disabled = false;

  const formula = els.formula ? els.formula.value : 'legacy';
  const extraRates = getExtraRates();
  const data = coreCompute({
    zoneCapacity,
    maxCoefficient,
    baseDoc,
    baseNurse,
    baseAssist,
    extraRates,
    shiftH,
    monthH,
    n1,
    n2,
    n3,
    n4,
    n5,
    patientCount,
  }, undefined, { formula });

  els.ratio.textContent = fmt(data.ratio);
  els.sShare.textContent = fmt(data.S);
  els.vBonus.textContent = `+${data.V_bonus.toFixed(2)}`;
  els.aBonus.textContent = `+${data.A_bonus.toFixed(2)}`;
  els.maxCoefficientCell.textContent = data.maxCoefficient.toFixed(2);
  els.kZona.textContent = data.K_zona.toFixed(2);

  updateChart(charts.ratio, chart => {
    chart.data.datasets[0].data = [
      Math.min(data.patientCount, zoneCapacity),
      Math.max(zoneCapacity - Math.min(data.patientCount, zoneCapacity), 0)
    ];
    chart.update();
  });

  updateChart(charts.s, chart => {
    chart.data.datasets[0].data = [n1, n2, n3, n4, n5];
    chart.update();
  });

  updateChart(charts.pay, chart => {
    const roles = Object.keys(data.base_rates);
    chart.data.labels = roles.map(r => ROLE_LABELS[r] || r);
    chart.data.datasets[0].data = roles.map(r => data.baseline_shift_salary[r]);
    chart.data.datasets[1].data = roles.map(r => data.shift_salary[r]);
    chart.update();
  });

  els.baseDocCell.textContent = money(data.base_rates.doctor);
  els.kDocCell.textContent = data.K_zona.toFixed(2);
  els.finalDocCell.textContent = money(data.final_rates.doctor);
  els.shiftDocCell.textContent = money(data.shift_salary.doctor);
  els.monthDocCell.textContent = money(data.month_salary.doctor);
  els.deltaDocCell.textContent = `${money(data.shift_salary.doctor - data.baseline_shift_salary.doctor)} / ${money(data.month_salary.doctor - data.baseline_month_salary.doctor)}`;

  els.baseNurseCell.textContent = money(data.base_rates.nurse);
  els.kNurseCell.textContent = data.K_zona.toFixed(2);
  els.finalNurseCell.textContent = money(data.final_rates.nurse);
  els.shiftNurseCell.textContent = money(data.shift_salary.nurse);
  els.monthNurseCell.textContent = money(data.month_salary.nurse);
  els.deltaNurseCell.textContent = `${money(data.shift_salary.nurse - data.baseline_shift_salary.nurse)} / ${money(data.month_salary.nurse - data.baseline_month_salary.nurse)}`;

  els.baseAssistCell.textContent = money(data.base_rates.assistant);
  els.kAssistCell.textContent = data.K_zona.toFixed(2);
  els.finalAssistCell.textContent = money(data.final_rates.assistant);
  els.shiftAssistCell.textContent = money(data.shift_salary.assistant);
  els.monthAssistCell.textContent = money(data.month_salary.assistant);
  els.deltaAssistCell.textContent = `${money(data.shift_salary.assistant - data.baseline_shift_salary.assistant)} / ${money(data.month_salary.assistant - data.baseline_month_salary.assistant)}`;

  if (els.rateTbody) {
    Array.from(els.rateTbody.querySelectorAll('.extra-rate-result')).forEach(r => r.remove());
    for (const role of Object.keys(data.base_rates)) {
      if (['doctor', 'nurse', 'assistant'].includes(role)) continue;
      const tr = document.createElement('tr');
      tr.className = 'extra-rate-result';
      tr.innerHTML = `<td>${role}</td><td>${money(data.base_rates[role])}</td><td>${data.K_zona.toFixed(2)}</td><td class="accent">${money(data.final_rates[role])}</td><td>${money(data.shift_salary[role])}</td><td>${money(data.month_salary[role])}</td><td>${money(data.shift_salary[role]-data.baseline_shift_salary[role])} / ${money(data.month_salary[role]-data.baseline_month_salary[role])}</td>`;
      els.rateTbody.appendChild(tr);
    }
  }

  renderFormulaInfo(formula);

  return {
    date: els.date.value || null,
    shift: els.shift.value,
    zone: els.zone.value,
    zone_label: (getZones().find(z=>z.id===els.zone.value)?.name) || els.zone.value,
    formula,
    zoneCapacity,
    ...data,
  };
}

function simulateEsi(){
  const patientCount = els.linkPatientCount.checked ? 0 : toNum(els.patientCount.value);
  const { total, counts } = simulateEsiCounts(
    patientCount,
    toNum(els.zoneCapacity.value)
  );
  [els.esi1.value, els.esi2.value, els.esi3.value, els.esi4.value, els.esi5.value] = counts;
  if (!els.linkPatientCount.checked) {
    els.patientCount.value = total;
  }
  compute();
}

// removed unused simulation functions

function handleShiftChange(){
  setDefaultCapacity();
  if (els.shift.value === 'P') {
    els.shiftHours.value = 24;
  } else if (toNum(els.shiftHours.value) === 24) {
    els.shiftHours.value = 12;
  }
  compute();
}

  function saveRateTemplate(){
  const payload = {
    doc: toNum(els.baseRateDoc.value),
    nurse: toNum(els.baseRateNurse.value),
    assist: toNum(els.baseRateAssist.value),
    extra: getExtraRates()
  };
  try { localStorage.setItem(LS_RATE_KEY, JSON.stringify(payload)); alert('Darbuotojų šablonas įsimintas.'); } catch {}
  }
  function loadRateTemplate(){
  try {
    const j = localStorage.getItem(LS_RATE_KEY);
    if (j){
      const t = JSON.parse(j);
      if (t){
        els.baseRateDoc.value = t.doc ?? 0;
        els.baseRateNurse.value = t.nurse ?? 0;
        els.baseRateAssist.value = t.assist ?? 0;
        if (els.extraRoles) els.extraRoles.innerHTML = '';
        if (t.extra) {
          Object.entries(t.extra).forEach(([name, rate]) => addRateRole(name, rate));
        }
        compute();
        return;
      }
    }
  } catch {}
  alert('Nerasta išsaugoto šablono.');
  }
  
  function resetAll(){
  els.date.value = ''; els.shift.value = 'D';
  renderZoneSelect(false);
  els.patientCount.value = 0; els.maxCoefficient.value = 1.30; els.linkPatientCount.checked = true;
  if (els.formula) els.formula.value = 'legacy';
  els.shiftHours.value = 12; els.monthHours.value = 0;
  els.esi1.value = 0; els.esi2.value = 0; els.esi3.value = 0; els.esi4.value = 0; els.esi5.value = 0;
  if (els.extraRoles) els.extraRoles.innerHTML = '';
  try {
    const j = localStorage.getItem(LS_RATE_KEY);
    if (j){
      const t = JSON.parse(j);
      els.baseRateDoc.value = t.doc ?? 0;
      els.baseRateNurse.value = t.nurse ?? 0;
      els.baseRateAssist.value = t.assist ?? 0;
      if (t.extra) {
        Object.entries(t.extra).forEach(([name, rate]) => addRateRole(name, rate));
      }
    } else {
      els.baseRateDoc.value = 0; els.baseRateNurse.value = 0; els.baseRateAssist.value = 0;
    }
  } catch {
    els.baseRateDoc.value = 0; els.baseRateNurse.value = 0; els.baseRateAssist.value = 0;
  }
  compute();
  }

  function goToBudgetPlanner(){
  try {
    const inputs = {
      zoneCapacity: els.zoneCapacity?.value,
      patientCount: els.patientCount?.value,
      maxCoefficient: els.maxCoefficient?.value,
      shiftHours: els.shiftHours?.value,
      monthHours: els.monthHours?.value,
      baseRateDoc: els.baseRateDoc?.value,
      baseRateNurse: els.baseRateNurse?.value,
      baseRateAssist: els.baseRateAssist?.value,
      extraRates: getExtraRates(),
      n1: els.esi1?.value,
      n2: els.esi2?.value,
      n3: els.esi3?.value,
      n4: els.esi4?.value,
      n5: els.esi5?.value,
    };
    localStorage.setItem('budgetInputs', JSON.stringify(inputs));
    localStorage.setItem('ratesFromZone', '1');
  } catch {
    alert('Nepavyko išsaugoti duomenų.');
  }
  window.location.href = 'budget.html';
}

// Events
['input','change'].forEach(evt => {
  ['date','zone','zoneCapacity','patientCount','formula','maxCoefficient','shiftHours','monthHours','baseRateDoc','baseRateNurse','baseRateAssist','linkPatientCount','esi1','esi2','esi3','esi4','esi5'].forEach(id => {
    const el = els[id];
    if (el) el.addEventListener(evt, compute);
  });
});
els.shift.addEventListener('change', handleShiftChange);
els.zone.addEventListener('change', setDefaultCapacity);
if (els.formula) {
  els.formula.addEventListener('change', () => renderFormulaInfo(els.formula.value));
}
els.simulateEsi.addEventListener('click', (e)=>{ e.preventDefault(); simulateEsi(); });
// simulation handlers removed
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
els.downloadCsv.addEventListener('click', (e)=>{ e.preventDefault(); downloadCsv(compute()); });
els.downloadPdf.addEventListener('click', (e)=>{ e.preventDefault(); downloadPdf(compute()); });

els.manageZones.addEventListener('click', openZoneModal);
els.addZone.addEventListener('click', addZone);
els.saveZonesBtn.addEventListener('click', saveZonesAndClose);
els.defaultsZones.addEventListener('click', resetToDefaults);
els.closeZoneModal.addEventListener('click', closeZoneModal);

els.saveRateTemplate.addEventListener('click', (e)=>{ e.preventDefault(); saveRateTemplate(); });
els.loadRateTemplate.addEventListener('click', (e)=>{ e.preventDefault(); loadRateTemplate(); });
if (els.addRateRole) {
  els.addRateRole.addEventListener('click', (e)=>{ e.preventDefault(); addRateRole(); });
}

if (els.budgetPlanner) {
  els.budgetPlanner.addEventListener('click', (e)=>{ e.preventDefault(); goToBudgetPlanner(); });
}

// Step management
const stepEls = Array.from(document.querySelectorAll('.step'));
const navLinks = Array.from(document.querySelectorAll('.nav-sections a'));
const progressBar = document.getElementById('stepProgressBar');
let currentStep = 0;

function updateProgress(){
  navLinks.forEach(link => {
    const target = document.querySelector(link.getAttribute('href'));
    const idx = stepEls.findIndex(step => step.contains(target));
    link.classList.toggle('active', idx === currentStep);
  });
  if (progressBar) {
    progressBar.style.width = `${((currentStep + 1) / stepEls.length) * 100}%`;
  }
}

function showStep(i){
  stepEls.forEach((el, idx) => {
    el.classList.toggle('active', idx === i);
  });
  currentStep = i;
  updateProgress();
}

function validateStep(i){
  const step = stepEls[i];
  const inputs = step.querySelectorAll('input, select, textarea');
  for (const input of inputs){
    if (!input.reportValidity()) return false;
  }
  return true;
}

function stepFromHash(hash){
  const id = hash.replace('#','');
  const target = document.getElementById(id);
  return stepEls.findIndex(step => step.contains(target));
}

function goToHash(){
  const idx = stepFromHash(location.hash);
  if (idx >= 0) {
    showStep(idx);
  } else {
    showStep(0);
  }
}

window.addEventListener('hashchange', goToHash);

stepEls.forEach((step, idx) => {
  const next = step.querySelector('.next-step');
  const back = step.querySelector('.back-step');
  if (next) {
    next.addEventListener('click', () => {
      if (!validateStep(idx)) return;
      const ni = Math.min(idx + 1, stepEls.length - 1);
      showStep(ni);
      const anchor = stepEls[ni].querySelector('[id]')?.id;
      if (anchor) history.replaceState(null, '', `#${anchor}`);
    });
  }
  if (back) {
    back.addEventListener('click', () => {
      const pi = Math.max(idx - 1, 0);
      showStep(pi);
      const anchor = stepEls[pi].querySelector('[id]')?.id;
      if (anchor) history.replaceState(null, '', `#${anchor}`);
    });
  }
});

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const hash = link.getAttribute('href');
    const idx = stepFromHash(hash);
    if (idx >= 0) {
      showStep(idx);
      history.replaceState(null, '', hash);
    }
  });
});

goToHash();

const grid = document.querySelector('.calc-grid');
const resizer = document.querySelector('.resizer');
if (grid && resizer) {
  const RESIZER_WIDTH = resizer.getBoundingClientRect().width || 5;
  let startX = 0;
  let startLeft = 0;

  function onMouseMove(e){
    const dx = e.clientX - startX;
    const total = grid.getBoundingClientRect().width;
    const newLeft = startLeft + dx;
    const newRight = total - newLeft - RESIZER_WIDTH;
    if (newLeft > 0 && newRight > 0){
      grid.style.gridTemplateColumns = `${newLeft}px ${RESIZER_WIDTH}px ${newRight}px`;
    }
  }

  function stop(){
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', stop);
  }

  resizer.addEventListener('mousedown', e => {
    if (window.innerWidth < 960) return;
    e.preventDefault();
    startX = e.clientX;
    startLeft = grid.children[0].getBoundingClientRect().width;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', stop);
  });
}

renderZoneSelect(false);
resetAll();

// CommonJS support for tests (none)
if (typeof module !== 'undefined') {
  module.exports = { compute, resetAll, simulateEsi, goToBudgetPlanner };
}

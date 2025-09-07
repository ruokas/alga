import { initThemeToggle } from '../theme.js';
import { initZones } from '../zones.js';
import { downloadCsv, downloadPdf } from '../downloads.js';
import { compute as coreCompute } from '../compute.js';
import { updateChart, createFlowChart, updateFlowChart, createForecastChart } from './chart/index.js';
import { simulateEsiCounts, simulatePeriod as simulatePeriodSim } from '../simulation.js';
import { getElements, bindEvents } from './ui/dom.js';
import { saveRateTemplate, loadRateTemplate } from './storage.js';

initThemeToggle();

const els = getElements();

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
            labels: ['Doctor', 'Nurse', 'Assistant'],
            datasets: [
              { label: 'Baseline', data: [0, 0, 0], backgroundColor: borderColor },
              { label: 'Adjusted', data: [0, 0, 0], backgroundColor: accent }
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

if (els.flowCanvas) {
  if (typeof Chart !== 'undefined') {
    try {
      charts.flow = createFlowChart(els.flowCanvas, accent);
    } catch (err) {
      handleChartError(els.flowCanvas, 'flow', err);
    }
  } else {
    console.warn('Chart.js not available: flow chart skipped');
  }
}

if (els.forecastCanvas) {
  if (typeof Chart !== 'undefined') {
    try {
      charts.forecast = createForecastChart(els.forecastCanvas, accent2);
    } catch (err) {
      handleChartError(els.forecastCanvas, 'forecast', err);
    }
  } else {
    console.warn('Chart.js not available: forecast chart skipped');
  }
}

function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function fmt(n, d=2) { return (Number.isFinite(n) ? n : 0).toFixed(d); }
function money(n) { try { return new Intl.NumberFormat('lt-LT',{style:'currency',currency:'EUR'}).format(n||0); } catch { return `€${fmt(n)}`; } }

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

  const data = coreCompute({
    zoneCapacity,
    maxCoefficient,
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
    patientCount,
  });

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
    chart.data.datasets[0].data = [
      data.baseline_shift_salary.doctor,
      data.baseline_shift_salary.nurse,
      data.baseline_shift_salary.assistant
    ];
    chart.data.datasets[1].data = [
      data.shift_salary.doctor,
      data.shift_salary.nurse,
      data.shift_salary.assistant
    ];
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

  return {
    date: els.date.value || null,
    shift: els.shift.value,
    zone: els.zone.value,
    zone_label: (getZones().find(z=>z.id===els.zone.value)?.name) || els.zone.value,
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

function simulatePeriodUi(){
  const days = toNum(els.days.value);
  const zoneCapacity = toNum(els.zoneCapacity.value);
  const results = simulatePeriodSim(days, zoneCapacity, {});
  updateFlowChart(charts.flow, results);
}

function forecastPeriodUi(){
  const days = toNum(els.days.value);
  const zoneCapacity = toNum(els.zoneCapacity.value);
  const results = simulatePeriodSim(days, zoneCapacity, { useForecast: true });
  updateFlowChart(charts.forecast, results);
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

function onSaveRateTemplate(){
  const payload = {
    doc: toNum(els.baseRateDoc.value),
    nurse: toNum(els.baseRateNurse.value),
    assist: toNum(els.baseRateAssist.value)
  };
  if (saveRateTemplate(payload)) {
    alert('Tarifų šablonas įsimintas.');
  }
}

function onLoadRateTemplate(){
  const t = loadRateTemplate();
  if (t) {
    els.baseRateDoc.value = t.doc ?? 0;
    els.baseRateNurse.value = t.nurse ?? 0;
    els.baseRateAssist.value = t.assist ?? 0;
    compute();
  } else {
    alert('Nerasta išsaugoto šablono.');
  }
}

function resetAll(){
  els.date.value = ''; els.shift.value = 'D';
  renderZoneSelect(false);
  els.patientCount.value = 0; els.maxCoefficient.value = 1.30; els.linkPatientCount.checked = true;
  els.shiftHours.value = 12; els.monthHours.value = 0;
  els.esi1.value = 0; els.esi2.value = 0; els.esi3.value = 0; els.esi4.value = 0; els.esi5.value = 0;
  const t = loadRateTemplate();
  if (t) {
    els.baseRateDoc.value = t.doc ?? 0;
    els.baseRateNurse.value = t.nurse ?? 0;
    els.baseRateAssist.value = t.assist ?? 0;
  } else {
    els.baseRateDoc.value = 0; els.baseRateNurse.value = 0; els.baseRateAssist.value = 0;
  }
  compute();
}

function copyResults(){
  const payload = compute();
  const txt = JSON.stringify(payload, null, 2);
  navigator.clipboard.writeText(txt).then(()=>{
    els.copy.textContent = 'Nukopijuota ✓';
    setTimeout(()=> els.copy.textContent = 'Kopijuoti rezultatą (JSON)', 1400);
  }).catch(()=>{
    alert('Nepavyko nukopijuoti. Pažymėkite ir kopijuokite rankiniu būdu.');
  });
}

function onDownloadCsv(){ downloadCsv(compute()); }
function onDownloadPdf(){ downloadPdf(compute()); }
function goToBudgetPlanner(){ window.location.href = 'budget.html'; }

bindEvents(els, {
  compute,
  handleShiftChange,
  setDefaultCapacity,
  simulateEsi,
  simulatePeriodUi,
  forecastPeriodUi,
  resetAll,
  copy: copyResults,
  downloadCsv: onDownloadCsv,
  downloadPdf: onDownloadPdf,
  openZoneModal,
  addZone,
  saveZonesAndClose,
  resetToDefaults,
  closeZoneModal,
  saveRateTemplate: onSaveRateTemplate,
  loadRateTemplate: onLoadRateTemplate,
  goToBudgetPlanner,
});

renderZoneSelect(false);
resetAll();

if (typeof module !== 'undefined') {
  module.exports = { compute, resetAll, simulateEsi, simulatePeriodUi, forecastPeriodUi };
}


import { initThemeToggle } from './theme.js';
import { computeBudget } from './budget.js';
import { createBudgetChart, updateBudgetChart } from './chart-utils.js';

function toNum(v){ const n = Number(v); return Number.isFinite(n) ? n : 0; }
function money(n){ try{ return new Intl.NumberFormat('lt-LT',{style:'currency',currency:'EUR'}).format(n||0); }catch{ return `€${(n||0).toFixed(2)}`; } }

const els = {
  shiftHours: document.getElementById('shiftHours'),
  monthHours: document.getElementById('monthHours'),
  baseRateDoc: document.getElementById('baseRateDoc'),
  baseRateNurse: document.getElementById('baseRateNurse'),
  baseRateAssist: document.getElementById('baseRateAssist'),
  countDoc: document.getElementById('countDoc'),
  countNurse: document.getElementById('countNurse'),
  countAssist: document.getElementById('countAssist'),
  countDocCell: document.getElementById('countDocCell'),
  countNurseCell: document.getElementById('countNurseCell'),
  countAssistCell: document.getElementById('countAssistCell'),
  rateDocCell: document.getElementById('rateDocCell'),
  rateNurseCell: document.getElementById('rateNurseCell'),
  rateAssistCell: document.getElementById('rateAssistCell'),
  shiftDocCell: document.getElementById('shiftDocCell'),
  shiftNurseCell: document.getElementById('shiftNurseCell'),
  shiftAssistCell: document.getElementById('shiftAssistCell'),
  monthDocCell: document.getElementById('monthDocCell'),
  monthNurseCell: document.getElementById('monthNurseCell'),
  monthAssistCell: document.getElementById('monthAssistCell'),
  shiftTotalCell: document.getElementById('shiftTotalCell'),
  monthTotalCell: document.getElementById('monthTotalCell'),
  budgetChart: document.getElementById('budgetChart'),
};

initThemeToggle();

const budgetChart = createBudgetChart(els.budgetChart, 'doughnut');

function compute(){
  const data = computeBudget({
    counts: {
      doctor: toNum(els.countDoc.value),
      nurse: toNum(els.countNurse.value),
      assistant: toNum(els.countAssist.value),
    },
    rateInputs: {
      zoneCapacity: 1,
      patientCount: 0,
      maxCoefficient: 1,
      baseDoc: toNum(els.baseRateDoc.value),
      baseNurse: toNum(els.baseRateNurse.value),
      baseAssist: toNum(els.baseRateAssist.value),
      shiftH: toNum(els.shiftHours.value),
      monthH: toNum(els.monthHours.value),
      n1: 0,
      n2: 0,
      n3: 0,
      n4: 0,
      n5: 0,
    }
  });

  els.countDocCell.textContent = data.counts.doctor;
  els.countNurseCell.textContent = data.counts.nurse;
  els.countAssistCell.textContent = data.counts.assistant;

  els.rateDocCell.textContent = money(data.final_rates.doctor);
  els.rateNurseCell.textContent = money(data.final_rates.nurse);
  els.rateAssistCell.textContent = money(data.final_rates.assistant);

  els.shiftDocCell.textContent = money(data.shift_budget.doctor);
  els.shiftNurseCell.textContent = money(data.shift_budget.nurse);
  els.shiftAssistCell.textContent = money(data.shift_budget.assistant);
  els.shiftTotalCell.textContent = money(data.shift_budget.total);

  els.monthDocCell.textContent = money(data.month_budget.doctor);
  els.monthNurseCell.textContent = money(data.month_budget.nurse);
  els.monthAssistCell.textContent = money(data.month_budget.assistant);
  els.monthTotalCell.textContent = money(data.month_budget.total);

  updateBudgetChart(budgetChart, data.month_budget);
}

['input','change'].forEach(evt => {
  ['shiftHours','monthHours','baseRateDoc','baseRateNurse','baseRateAssist','countDoc','countNurse','countAssist'].forEach(id => {
    const el = els[id];
    if (el) el.addEventListener(evt, compute);
  });
});

compute();

if (typeof module !== 'undefined') {
  module.exports = { compute };
}

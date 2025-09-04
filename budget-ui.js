import { initThemeToggle } from './theme.js';
import { computeBudget } from './budget.js';
import { createBudgetChart, updateBudgetChart } from './chart-utils.js';

function toNum(v){
  if (typeof v === 'string') v = v.replace(',', '.');
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function money(n){
  try{
    return new Intl.NumberFormat('lt-LT',{style:'currency',currency:'EUR'}).format(n||0);
  }catch{
    return `€${(n||0).toFixed(2)}`;
  }
}

const els = {
  shiftHours: document.getElementById('shiftHours'),
  monthHours: document.getElementById('monthHours'),
  baseRateDoc: document.getElementById('baseRateDoc'),
  baseRateNurse: document.getElementById('baseRateNurse'),
  baseRateAssist: document.getElementById('baseRateAssist'),
  countDocDay: document.getElementById('countDocDay'),
  countDocNight: document.getElementById('countDocNight'),
  countNurseDay: document.getElementById('countNurseDay'),
  countNurseNight: document.getElementById('countNurseNight'),
  countAssistDay: document.getElementById('countAssistDay'),
  countAssistNight: document.getElementById('countAssistNight'),
  countDocDayCell: document.getElementById('countDocDayCell'),
  countDocNightCell: document.getElementById('countDocNightCell'),
  countNurseDayCell: document.getElementById('countNurseDayCell'),
  countNurseNightCell: document.getElementById('countNurseNightCell'),
  countAssistDayCell: document.getElementById('countAssistDayCell'),
  countAssistNightCell: document.getElementById('countAssistNightCell'),
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
  const docDay = toNum(els.countDocDay.value);
  const docNight = toNum(els.countDocNight.value);
  const nurseDay = toNum(els.countNurseDay.value);
  const nurseNight = toNum(els.countNurseNight.value);
  const assistDay = toNum(els.countAssistDay.value);
  const assistNight = toNum(els.countAssistNight.value);

  const data = computeBudget({
    counts: {
      day: {
        doctor: docDay,
        nurse: nurseDay,
        assistant: assistDay,
      },
      night: {
        doctor: docNight,
        nurse: nurseNight,
        assistant: assistNight,
      },
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

  els.countDocDayCell.textContent = docDay;
  els.countDocNightCell.textContent = docNight;
  els.countNurseDayCell.textContent = nurseDay;
  els.countNurseNightCell.textContent = nurseNight;
  els.countAssistDayCell.textContent = assistDay;
  els.countAssistNightCell.textContent = assistNight;

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
  [
    'shiftHours','monthHours','baseRateDoc','baseRateNurse','baseRateAssist',
    'countDocDay','countDocNight','countNurseDay','countNurseNight','countAssistDay','countAssistNight'
  ].forEach(id => {
    const el = els[id];
    if (el) el.addEventListener(evt, compute);
  });
});

compute();

if (typeof module !== 'undefined') {
  module.exports = { compute };
}

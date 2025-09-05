import { initThemeToggle } from './theme.js';
import { computeBudget } from './budget.js';
import { createBudgetChart, updateBudgetChart, createDayNightChart, updateDayNightChart, createStaffChart, updateStaffChart } from './chart-utils.js';

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
  docDayCount: document.getElementById('docDayCount'),
  docNightCount: document.getElementById('docNightCount'),
  nurseDayCount: document.getElementById('nurseDayCount'),
  nurseNightCount: document.getElementById('nurseNightCount'),
  assistDayCount: document.getElementById('assistDayCount'),
  assistNightCount: document.getElementById('assistNightCount'),
  docRate: document.getElementById('docRate'),
  nurseRate: document.getElementById('nurseRate'),
  assistRate: document.getElementById('assistRate'),
  docShiftDay: document.getElementById('docShiftDay'),
  docShiftNight: document.getElementById('docShiftNight'),
  docShiftTotal: document.getElementById('docShiftTotal'),
  nurseShiftDay: document.getElementById('nurseShiftDay'),
  nurseShiftNight: document.getElementById('nurseShiftNight'),
  nurseShiftTotal: document.getElementById('nurseShiftTotal'),
  assistShiftDay: document.getElementById('assistShiftDay'),
  assistShiftNight: document.getElementById('assistShiftNight'),
  assistShiftTotal: document.getElementById('assistShiftTotal'),
  docMonthDay: document.getElementById('docMonthDay'),
  docMonthNight: document.getElementById('docMonthNight'),
  docMonthTotal: document.getElementById('docMonthTotal'),
  nurseMonthDay: document.getElementById('nurseMonthDay'),
  nurseMonthNight: document.getElementById('nurseMonthNight'),
  nurseMonthTotal: document.getElementById('nurseMonthTotal'),
  assistMonthDay: document.getElementById('assistMonthDay'),
  assistMonthNight: document.getElementById('assistMonthNight'),
  assistMonthTotal: document.getElementById('assistMonthTotal'),
  shiftDayTotal: document.getElementById('shiftDayTotal'),
  shiftNightTotal: document.getElementById('shiftNightTotal'),
  shiftTotal: document.getElementById('shiftTotal'),
  monthDayTotal: document.getElementById('monthDayTotal'),
  monthNightTotal: document.getElementById('monthNightTotal'),
  monthTotal: document.getElementById('monthTotal'),
  budgetChart: document.getElementById('budgetChart'),
  dayNightChart: document.getElementById('dayNightChart'),
  staffChart: document.getElementById('staffChart'),
};

initThemeToggle();

const budgetChart = createBudgetChart(els.budgetChart, 'doughnut');
const dayNightChart = createDayNightChart(els.dayNightChart);
const staffChart = createStaffChart(els.staffChart);

const INPUT_IDS = [
  'shiftHours','monthHours','baseRateDoc','baseRateNurse','baseRateAssist',
  'countDocDay','countDocNight','countNurseDay','countNurseNight','countAssistDay','countAssistNight'
];
const STORAGE_KEY = 'budgetInputs';

function loadInputs(){
  if (typeof localStorage === 'undefined') return;
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    INPUT_IDS.forEach(id => {
      if (els[id] && saved[id] !== undefined) els[id].value = saved[id];
    });
  }catch{}
}

function saveInputs(){
  if (typeof localStorage === 'undefined') return;
  const data = {};
  INPUT_IDS.forEach(id => {
    if (els[id]) data[id] = els[id].value;
  });
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }catch{}
}

function compute(){
  const docDay = toNum(els.countDocDay.value);
  const docNight = toNum(els.countDocNight.value);
  const nurseDay = toNum(els.countNurseDay.value);
  const nurseNight = toNum(els.countNurseNight.value);
  const assistDay = toNum(els.countAssistDay.value);
  const assistNight = toNum(els.countAssistNight.value);

  const counts = {
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
  };

  const data = computeBudget({
    counts,
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

  els.docDayCount.textContent = docDay;
  els.docNightCount.textContent = docNight;
  els.nurseDayCount.textContent = nurseDay;
  els.nurseNightCount.textContent = nurseNight;
  els.assistDayCount.textContent = assistDay;
  els.assistNightCount.textContent = assistNight;

  els.docRate.textContent = money(data.final_rates.doctor);
  els.nurseRate.textContent = money(data.final_rates.nurse);
  els.assistRate.textContent = money(data.final_rates.assistant);

  els.docShiftDay.textContent = money(data.shift_budget_day.doctor);
  els.docShiftNight.textContent = money(data.shift_budget_night.doctor);
  els.docShiftTotal.textContent = money(data.shift_budget.doctor);
  els.nurseShiftDay.textContent = money(data.shift_budget_day.nurse);
  els.nurseShiftNight.textContent = money(data.shift_budget_night.nurse);
  els.nurseShiftTotal.textContent = money(data.shift_budget.nurse);
  els.assistShiftDay.textContent = money(data.shift_budget_day.assistant);
  els.assistShiftNight.textContent = money(data.shift_budget_night.assistant);
  els.assistShiftTotal.textContent = money(data.shift_budget.assistant);
  els.shiftDayTotal.textContent = money(data.shift_budget_day.total);
  els.shiftNightTotal.textContent = money(data.shift_budget_night.total);
  els.shiftTotal.textContent = money(data.shift_budget.total);

  els.docMonthDay.textContent = money(data.month_budget_day.doctor);
  els.docMonthNight.textContent = money(data.month_budget_night.doctor);
  els.docMonthTotal.textContent = money(data.month_budget.doctor);
  els.nurseMonthDay.textContent = money(data.month_budget_day.nurse);
  els.nurseMonthNight.textContent = money(data.month_budget_night.nurse);
  els.nurseMonthTotal.textContent = money(data.month_budget.nurse);
  els.assistMonthDay.textContent = money(data.month_budget_day.assistant);
  els.assistMonthNight.textContent = money(data.month_budget_night.assistant);
  els.assistMonthTotal.textContent = money(data.month_budget.assistant);
  els.monthDayTotal.textContent = money(data.month_budget_day.total);
  els.monthNightTotal.textContent = money(data.month_budget_night.total);
  els.monthTotal.textContent = money(data.month_budget.total);

  updateBudgetChart(budgetChart, data.month_budget);
  updateDayNightChart(dayNightChart, data.shift_budget_day, data.shift_budget_night);
  updateStaffChart(staffChart, counts);
}

['input','change'].forEach(evt => {
  INPUT_IDS.forEach(id => {
    const el = els[id];
    if (el) el.addEventListener(evt, () => {
      saveInputs();
      compute();
    });
  });
});

loadInputs();
compute();

if (typeof module !== 'undefined') {
  module.exports = { compute, loadInputs, saveInputs };
}

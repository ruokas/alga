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
  shiftDocDayCell: document.getElementById('shiftDocDayCell'),
  shiftDocNightCell: document.getElementById('shiftDocNightCell'),
  shiftDocCell: document.getElementById('shiftDocCell'),
  shiftNurseDayCell: document.getElementById('shiftNurseDayCell'),
  shiftNurseNightCell: document.getElementById('shiftNurseNightCell'),
  shiftNurseCell: document.getElementById('shiftNurseCell'),
  shiftAssistDayCell: document.getElementById('shiftAssistDayCell'),
  shiftAssistNightCell: document.getElementById('shiftAssistNightCell'),
  shiftAssistCell: document.getElementById('shiftAssistCell'),
  monthDocDayCell: document.getElementById('monthDocDayCell'),
  monthDocNightCell: document.getElementById('monthDocNightCell'),
  monthDocCell: document.getElementById('monthDocCell'),
  monthNurseDayCell: document.getElementById('monthNurseDayCell'),
  monthNurseNightCell: document.getElementById('monthNurseNightCell'),
  monthNurseCell: document.getElementById('monthNurseCell'),
  monthAssistDayCell: document.getElementById('monthAssistDayCell'),
  monthAssistNightCell: document.getElementById('monthAssistNightCell'),
  monthAssistCell: document.getElementById('monthAssistCell'),
  shiftDayTotalCell: document.getElementById('shiftDayTotalCell'),
  shiftNightTotalCell: document.getElementById('shiftNightTotalCell'),
  shiftTotalCell: document.getElementById('shiftTotalCell'),
  monthDayTotalCell: document.getElementById('monthDayTotalCell'),
  monthNightTotalCell: document.getElementById('monthNightTotalCell'),
  monthTotalCell: document.getElementById('monthTotalCell'),
  budgetChart: document.getElementById('budgetChart'),
};

initThemeToggle();

const budgetChart = createBudgetChart(els.budgetChart, 'doughnut');

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

  if (els.shiftDocDayCell) els.shiftDocDayCell.textContent = money(data.shift_budget_day.doctor);
  if (els.shiftDocNightCell) els.shiftDocNightCell.textContent = money(data.shift_budget_night.doctor);
  els.shiftDocCell.textContent = money(data.shift_budget.doctor);
  if (els.shiftNurseDayCell) els.shiftNurseDayCell.textContent = money(data.shift_budget_day.nurse);
  if (els.shiftNurseNightCell) els.shiftNurseNightCell.textContent = money(data.shift_budget_night.nurse);
  els.shiftNurseCell.textContent = money(data.shift_budget.nurse);
  if (els.shiftAssistDayCell) els.shiftAssistDayCell.textContent = money(data.shift_budget_day.assistant);
  if (els.shiftAssistNightCell) els.shiftAssistNightCell.textContent = money(data.shift_budget_night.assistant);
  els.shiftAssistCell.textContent = money(data.shift_budget.assistant);
  if (els.shiftDayTotalCell) els.shiftDayTotalCell.textContent = money(data.shift_budget_day.total);
  if (els.shiftNightTotalCell) els.shiftNightTotalCell.textContent = money(data.shift_budget_night.total);
  els.shiftTotalCell.textContent = money(data.shift_budget.total);

  if (els.monthDocDayCell) els.monthDocDayCell.textContent = money(data.month_budget_day.doctor);
  if (els.monthDocNightCell) els.monthDocNightCell.textContent = money(data.month_budget_night.doctor);
  els.monthDocCell.textContent = money(data.month_budget.doctor);
  if (els.monthNurseDayCell) els.monthNurseDayCell.textContent = money(data.month_budget_day.nurse);
  if (els.monthNurseNightCell) els.monthNurseNightCell.textContent = money(data.month_budget_night.nurse);
  els.monthNurseCell.textContent = money(data.month_budget.nurse);
  if (els.monthAssistDayCell) els.monthAssistDayCell.textContent = money(data.month_budget_day.assistant);
  if (els.monthAssistNightCell) els.monthAssistNightCell.textContent = money(data.month_budget_night.assistant);
  els.monthAssistCell.textContent = money(data.month_budget.assistant);
  if (els.monthDayTotalCell) els.monthDayTotalCell.textContent = money(data.month_budget_day.total);
  if (els.monthNightTotalCell) els.monthNightTotalCell.textContent = money(data.month_budget_night.total);
  els.monthTotalCell.textContent = money(data.month_budget.total);

  updateBudgetChart(budgetChart, data.month_budget);
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

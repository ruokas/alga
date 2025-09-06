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
  zoneCapacity: document.getElementById('zoneCapacity'),
  patientCount: document.getElementById('patientCount'),
  maxCoefficient: document.getElementById('maxCoefficient'),
  n1: document.getElementById('n1'),
  n2: document.getElementById('n2'),
  n3: document.getElementById('n3'),
  n4: document.getElementById('n4'),
  n5: document.getElementById('n5'),
  docDayCount: document.getElementById('docDayCount'),
  docNightCount: document.getElementById('docNightCount'),
  nurseDayCount: document.getElementById('nurseDayCount'),
  nurseNightCount: document.getElementById('nurseNightCount'),
  assistDayCount: document.getElementById('assistDayCount'),
  assistNightCount: document.getElementById('assistNightCount'),
  optimizeBtn: document.getElementById('optimizeStaff'),
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
  docShiftBonusDay: document.getElementById('docShiftBonusDay'),
  docShiftBonusNight: document.getElementById('docShiftBonusNight'),
  docShiftBonusTotal: document.getElementById('docShiftBonusTotal'),
  nurseShiftBonusDay: document.getElementById('nurseShiftBonusDay'),
  nurseShiftBonusNight: document.getElementById('nurseShiftBonusNight'),
  nurseShiftBonusTotal: document.getElementById('nurseShiftBonusTotal'),
  assistShiftBonusDay: document.getElementById('assistShiftBonusDay'),
  assistShiftBonusNight: document.getElementById('assistShiftBonusNight'),
  assistShiftBonusTotal: document.getElementById('assistShiftBonusTotal'),
  docMonthDay: document.getElementById('docMonthDay'),
  docMonthNight: document.getElementById('docMonthNight'),
  docMonthTotal: document.getElementById('docMonthTotal'),
  nurseMonthDay: document.getElementById('nurseMonthDay'),
  nurseMonthNight: document.getElementById('nurseMonthNight'),
  nurseMonthTotal: document.getElementById('nurseMonthTotal'),
  assistMonthDay: document.getElementById('assistMonthDay'),
  assistMonthNight: document.getElementById('assistMonthNight'),
  assistMonthTotal: document.getElementById('assistMonthTotal'),
  docMonthBonusDay: document.getElementById('docMonthBonusDay'),
  docMonthBonusNight: document.getElementById('docMonthBonusNight'),
  docMonthBonusTotal: document.getElementById('docMonthBonusTotal'),
  nurseMonthBonusDay: document.getElementById('nurseMonthBonusDay'),
  nurseMonthBonusNight: document.getElementById('nurseMonthBonusNight'),
  nurseMonthBonusTotal: document.getElementById('nurseMonthBonusTotal'),
  assistMonthBonusDay: document.getElementById('assistMonthBonusDay'),
  assistMonthBonusNight: document.getElementById('assistMonthBonusNight'),
  assistMonthBonusTotal: document.getElementById('assistMonthBonusTotal'),
  shiftDayTotal: document.getElementById('shiftDayTotal'),
  shiftNightTotal: document.getElementById('shiftNightTotal'),
  shiftTotal: document.getElementById('shiftTotal'),
  shiftBonusDayTotal: document.getElementById('shiftBonusDayTotal'),
  shiftBonusNightTotal: document.getElementById('shiftBonusNightTotal'),
  shiftBonusTotal: document.getElementById('shiftBonusTotal'),
  monthDayTotal: document.getElementById('monthDayTotal'),
  monthNightTotal: document.getElementById('monthNightTotal'),
  monthTotal: document.getElementById('monthTotal'),
  monthBonusDayTotal: document.getElementById('monthBonusDayTotal'),
  monthBonusNightTotal: document.getElementById('monthBonusNightTotal'),
  monthBonusTotal: document.getElementById('monthBonusTotal'),
  budgetChart: document.getElementById('budgetChart'),
  dayNightChart: document.getElementById('dayNightChart'),
  staffChart: document.getElementById('staffChart'),
};

initThemeToggle();

const goBack = document.getElementById("goBack");
if (goBack) {
  goBack.addEventListener("click", (e) => { e.preventDefault(); window.location.href = "index.html"; });
}

const budgetChart = createBudgetChart(els.budgetChart, 'doughnut');
const dayNightChart = createDayNightChart(els.dayNightChart);
const staffChart = createStaffChart(els.staffChart);

const INPUT_IDS = [
  'shiftHours','monthHours','baseRateDoc','baseRateNurse','baseRateAssist',
  'countDocDay','countDocNight','countNurseDay','countNurseNight','countAssistDay','countAssistNight',
  'zoneCapacity','patientCount','maxCoefficient','n1','n2','n3','n4','n5'
];
const STORAGE_KEY = 'budgetInputs';

function validateInputs(){
  INPUT_IDS.forEach(id => {
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

function compute(optimize = false){
  validateInputs();
  const docDay = toNum(els.countDocDay.value);
  const docNight = toNum(els.countDocNight.value);
  const nurseDay = toNum(els.countNurseDay.value);
  const nurseNight = toNum(els.countNurseNight.value);
  const assistDay = toNum(els.countAssistDay.value);
  const assistNight = toNum(els.countAssistNight.value);
  const zoneCapacity = els.zoneCapacity ? toNum(els.zoneCapacity.value) : 1;
  const patientCount = els.patientCount ? toNum(els.patientCount.value) : 0;
  const maxCoefficient = els.maxCoefficient ? toNum(els.maxCoefficient.value) : 1;
  const n1 = toNum(els.n1?.value);
  const n2 = toNum(els.n2?.value);
  const n3 = toNum(els.n3?.value);
  const n4 = toNum(els.n4?.value);
  const n5 = toNum(els.n5?.value);

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
      zoneCapacity,
      patientCount,
      maxCoefficient,
      baseDoc: toNum(els.baseRateDoc.value),
      baseNurse: toNum(els.baseRateNurse.value),
      baseAssist: toNum(els.baseRateAssist.value),
      shiftH: toNum(els.shiftHours.value),
      monthH: toNum(els.monthHours.value),
      n1,
      n2,
      n3,
      n4,
      n5,
    },
    optimize,
  });

  const usedCounts = optimize && data.recommendation ? data.recommendation : counts;
  const uDocDay = usedCounts.day?.doctor || 0;
  const uDocNight = usedCounts.night?.doctor || 0;
  const uNurseDay = usedCounts.day?.nurse || 0;
  const uNurseNight = usedCounts.night?.nurse || 0;
  const uAssistDay = usedCounts.day?.assistant || 0;
  const uAssistNight = usedCounts.night?.assistant || 0;

  els.docDayCount.textContent = uDocDay;
  els.docNightCount.textContent = uDocNight;
  els.nurseDayCount.textContent = uNurseDay;
  els.nurseNightCount.textContent = uNurseNight;
  els.assistDayCount.textContent = uAssistDay;
  els.assistNightCount.textContent = uAssistNight;

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
  els.docShiftBonusDay.textContent = money(data.shift_bonus_day.doctor);
  els.docShiftBonusNight.textContent = money(data.shift_bonus_night.doctor);
  els.docShiftBonusTotal.textContent = money(data.shift_bonus.doctor);
  els.nurseShiftBonusDay.textContent = money(data.shift_bonus_day.nurse);
  els.nurseShiftBonusNight.textContent = money(data.shift_bonus_night.nurse);
  els.nurseShiftBonusTotal.textContent = money(data.shift_bonus.nurse);
  els.assistShiftBonusDay.textContent = money(data.shift_bonus_day.assistant);
  els.assistShiftBonusNight.textContent = money(data.shift_bonus_night.assistant);
  els.assistShiftBonusTotal.textContent = money(data.shift_bonus.assistant);
  els.shiftDayTotal.textContent = money(data.shift_budget_day.total);
  els.shiftNightTotal.textContent = money(data.shift_budget_night.total);
  els.shiftTotal.textContent = money(data.shift_budget.total);
  els.shiftBonusDayTotal.textContent = money(data.shift_bonus_day.total);
  els.shiftBonusNightTotal.textContent = money(data.shift_bonus_night.total);
  els.shiftBonusTotal.textContent = money(data.shift_bonus.total);

  els.docMonthDay.textContent = money(data.month_budget_day.doctor);
  els.docMonthNight.textContent = money(data.month_budget_night.doctor);
  els.docMonthTotal.textContent = money(data.month_budget.doctor);
  els.nurseMonthDay.textContent = money(data.month_budget_day.nurse);
  els.nurseMonthNight.textContent = money(data.month_budget_night.nurse);
  els.nurseMonthTotal.textContent = money(data.month_budget.nurse);
  els.assistMonthDay.textContent = money(data.month_budget_day.assistant);
  els.assistMonthNight.textContent = money(data.month_budget_night.assistant);
  els.assistMonthTotal.textContent = money(data.month_budget.assistant);
  els.docMonthBonusDay.textContent = money(data.month_bonus_day.doctor);
  els.docMonthBonusNight.textContent = money(data.month_bonus_night.doctor);
  els.docMonthBonusTotal.textContent = money(data.month_bonus.doctor);
  els.nurseMonthBonusDay.textContent = money(data.month_bonus_day.nurse);
  els.nurseMonthBonusNight.textContent = money(data.month_bonus_night.nurse);
  els.nurseMonthBonusTotal.textContent = money(data.month_bonus.nurse);
  els.assistMonthBonusDay.textContent = money(data.month_bonus_day.assistant);
  els.assistMonthBonusNight.textContent = money(data.month_bonus_night.assistant);
  els.assistMonthBonusTotal.textContent = money(data.month_bonus.assistant);
  els.monthDayTotal.textContent = money(data.month_budget_day.total);
  els.monthNightTotal.textContent = money(data.month_budget_night.total);
  els.monthTotal.textContent = money(data.month_budget.total);
  els.monthBonusDayTotal.textContent = money(data.month_bonus_day.total);
  els.monthBonusNightTotal.textContent = money(data.month_bonus_night.total);
  els.monthBonusTotal.textContent = money(data.month_bonus.total);

  updateBudgetChart(budgetChart, data.baseline_month_budget, data.month_bonus);
  updateDayNightChart(dayNightChart, data.shift_budget_day, data.shift_budget_night);
  updateStaffChart(staffChart, usedCounts);
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

const grid = document.querySelector('.budget-grid');
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

loadInputs();
compute();

if (els.optimizeBtn) {
  els.optimizeBtn.addEventListener('click', () => compute(true));
}

if (typeof module !== 'undefined') {
  module.exports = { compute, loadInputs, saveInputs };
}

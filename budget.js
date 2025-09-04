function sanitizeCount(value) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

import { compute } from './compute.js';

export function computeBudget({ counts = {}, rateInputs = {}, nightMultiplier = 1.5 }) {
  const salaryData = compute(rateInputs);
  const roles = ['doctor', 'nurse', 'assistant'];

  const cleanCounts = {};
  const shift_budget_day = {};
  const shift_budget_night = {};
  const shift_budget = {};
  const month_budget_day = {};
  const month_budget_night = {};
  const month_budget = {};
  let shift_day_total = 0;
  let shift_night_total = 0;
  let shift_total = 0;
  let month_day_total = 0;
  let month_night_total = 0;
  let month_total = 0;

  for (const role of roles) {
    // Support legacy flat counts or separated day/night counts
    let day = 0;
    let night = 0;
    if (counts.day || counts.night) {
      day = sanitizeCount(counts.day?.[role]);
      night = sanitizeCount(counts.night?.[role]);
    } else {
      day = sanitizeCount(counts[role]);
    }
    const total = day + night;
    cleanCounts[role] = total;

    const baseShift = salaryData.shift_salary?.[role] || 0;
    const baseMonth = salaryData.month_salary?.[role] || 0;

    const shiftDay = baseShift * day;
    const shiftNight = baseShift * night * nightMultiplier;
    const monthDay = baseMonth * day;
    const monthNight = baseMonth * night * nightMultiplier;

    shift_budget_day[role] = shiftDay;
    shift_budget_night[role] = shiftNight;
    shift_budget[role] = shiftDay + shiftNight;
    month_budget_day[role] = monthDay;
    month_budget_night[role] = monthNight;
    month_budget[role] = monthDay + monthNight;

    shift_day_total += shiftDay;
    shift_night_total += shiftNight;
    shift_total += shiftDay + shiftNight;
    month_day_total += monthDay;
    month_night_total += monthNight;
    month_total += monthDay + monthNight;
  }

  shift_budget_day.total = shift_day_total;
  shift_budget_night.total = shift_night_total;
  shift_budget.total = shift_total;
  month_budget_day.total = month_day_total;
  month_budget_night.total = month_night_total;
  month_budget.total = month_total;

  return {
    ...salaryData,
    counts: cleanCounts,
    shift_budget_day,
    shift_budget_night,
    shift_budget,
    month_budget_day,
    month_budget_night,
    month_budget,
  };
}

if (typeof module !== 'undefined') {
  module.exports = { computeBudget };
}

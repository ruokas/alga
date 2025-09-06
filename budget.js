function sanitizeCount(value) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

import { compute } from './compute.js';
import { suggestStaffing } from './src/optimizer.js';

export function computeBudget({ counts = {}, rateInputs = {}, nightMultiplier = 1.5, optimize = false }) {
  const salaryData = compute(rateInputs);
  const roles = ['doctor', 'nurse', 'assistant'];

  let usedCounts = counts;
  let recommendation = null;
  if (optimize) {
    recommendation = suggestStaffing({
      zoneCapacity: rateInputs.zoneCapacity,
      budgetLimit: rateInputs.budgetLimit,
      rates: salaryData.shift_salary,
    });
    usedCounts = recommendation;
  }

  const cleanCounts = {};
  const shift_budget_day = {};
  const shift_budget_night = {};
  const shift_budget = {};
  const baseline_shift_budget_day = {};
  const baseline_shift_budget_night = {};
  const baseline_shift_budget = {};
  const shift_bonus_day = {};
  const shift_bonus_night = {};
  const shift_bonus = {};
  const month_budget_day = {};
  const month_budget_night = {};
  const month_budget = {};
  const baseline_month_budget_day = {};
  const baseline_month_budget_night = {};
  const baseline_month_budget = {};
  const month_bonus_day = {};
  const month_bonus_night = {};
  const month_bonus = {};
  let shift_day_total = 0;
  let shift_night_total = 0;
  let shift_total = 0;
  let baseline_shift_day_total = 0;
  let baseline_shift_night_total = 0;
  let baseline_shift_total = 0;
  let month_day_total = 0;
  let month_night_total = 0;
  let month_total = 0;
  let baseline_month_day_total = 0;
  let baseline_month_night_total = 0;
  let baseline_month_total = 0;

  for (const role of roles) {
    // Support legacy flat counts or separated day/night counts
    let day = 0;
    let night = 0;
    if (usedCounts.day || usedCounts.night) {
      day = sanitizeCount(usedCounts.day?.[role]);
      night = sanitizeCount(usedCounts.night?.[role]);
    } else {
      day = sanitizeCount(usedCounts[role]);
    }
    const total = day + night;
    cleanCounts[role] = total;

    const baseShift = salaryData.shift_salary?.[role] || 0;
    const baseMonth = salaryData.month_salary?.[role] || 0;
    const baselineShift = salaryData.baseline_shift_salary?.[role] || 0;
    const baselineMonth = salaryData.baseline_month_salary?.[role] || 0;

    const shiftDay = baseShift * day;
    const shiftNight = baseShift * night * nightMultiplier;
    const monthDay = baseMonth * day;
    const monthNight = baseMonth * night * nightMultiplier;

    const baselineShiftDay = baselineShift * day;
    const baselineShiftNight = baselineShift * night * nightMultiplier;
    const baselineMonthDay = baselineMonth * day;
    const baselineMonthNight = baselineMonth * night * nightMultiplier;

    shift_budget_day[role] = shiftDay;
    shift_budget_night[role] = shiftNight;
    shift_budget[role] = shiftDay + shiftNight;
    baseline_shift_budget_day[role] = baselineShiftDay;
    baseline_shift_budget_night[role] = baselineShiftNight;
    baseline_shift_budget[role] = baselineShiftDay + baselineShiftNight;
    shift_bonus_day[role] = shiftDay - baselineShiftDay;
    shift_bonus_night[role] = shiftNight - baselineShiftNight;
    shift_bonus[role] = shift_budget[role] - baseline_shift_budget[role];
    month_budget_day[role] = monthDay;
    month_budget_night[role] = monthNight;
    month_budget[role] = monthDay + monthNight;
    baseline_month_budget_day[role] = baselineMonthDay;
    baseline_month_budget_night[role] = baselineMonthNight;
    baseline_month_budget[role] = baselineMonthDay + baselineMonthNight;
    month_bonus_day[role] = monthDay - baselineMonthDay;
    month_bonus_night[role] = monthNight - baselineMonthNight;
    month_bonus[role] = month_budget[role] - baseline_month_budget[role];

    shift_day_total += shiftDay;
    shift_night_total += shiftNight;
    shift_total += shiftDay + shiftNight;
    baseline_shift_day_total += baselineShiftDay;
    baseline_shift_night_total += baselineShiftNight;
    baseline_shift_total += baselineShiftDay + baselineShiftNight;
    month_day_total += monthDay;
    month_night_total += monthNight;
    month_total += monthDay + monthNight;
    baseline_month_day_total += baselineMonthDay;
    baseline_month_night_total += baselineMonthNight;
    baseline_month_total += baselineMonthDay + baselineMonthNight;
  }

  shift_budget_day.total = shift_day_total;
  shift_budget_night.total = shift_night_total;
  shift_budget.total = shift_total;
  baseline_shift_budget_day.total = baseline_shift_day_total;
  baseline_shift_budget_night.total = baseline_shift_night_total;
  baseline_shift_budget.total = baseline_shift_total;
  shift_bonus_day.total = shift_day_total - baseline_shift_day_total;
  shift_bonus_night.total = shift_night_total - baseline_shift_night_total;
  shift_bonus.total = shift_total - baseline_shift_total;
  month_budget_day.total = month_day_total;
  month_budget_night.total = month_night_total;
  month_budget.total = month_total;
  baseline_month_budget_day.total = baseline_month_day_total;
  baseline_month_budget_night.total = baseline_month_night_total;
  baseline_month_budget.total = baseline_month_total;
  month_bonus_day.total = month_day_total - baseline_month_day_total;
  month_bonus_night.total = month_night_total - baseline_month_night_total;
  month_bonus.total = month_total - baseline_month_total;

  return {
    ...salaryData,
    counts: cleanCounts,
    recommendation,
    shift_budget_day,
    shift_budget_night,
    shift_budget,
    baseline_shift_budget_day,
    baseline_shift_budget_night,
    baseline_shift_budget,
    shift_bonus_day,
    shift_bonus_night,
    shift_bonus,
    month_budget_day,
    month_budget_night,
    month_budget,
    baseline_month_budget_day,
    baseline_month_budget_night,
    baseline_month_budget,
    month_bonus_day,
    month_bonus_night,
    month_bonus,
  };
}

if (typeof module !== 'undefined') {
  module.exports = { computeBudget };
}

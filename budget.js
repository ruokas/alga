function sanitizeCount(value) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

import { compute } from './compute.js';

export function computeBudget({ counts = {}, rateInputs = {}, nightMultiplier = 1.5 }) {
  const salaryData = compute(rateInputs);
  const roles = ['doctor', 'nurse', 'assistant'];

  const cleanCounts = {};
  const shift_budget = {};
  const month_budget = {};
  let shift_total = 0;
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
    const factorCount = day + night * nightMultiplier;
    const shift = (salaryData.shift_salary?.[role] || 0) * factorCount;
    const month = (salaryData.month_salary?.[role] || 0) * factorCount;
    shift_budget[role] = shift;
    month_budget[role] = month;
    shift_total += shift;
    month_total += month;
  }

  shift_budget.total = shift_total;
  month_budget.total = month_total;

  return {
    ...salaryData,
    counts: cleanCounts,
    shift_budget,
    month_budget,
  };
}

if (typeof module !== 'undefined') {
  module.exports = { computeBudget };
}

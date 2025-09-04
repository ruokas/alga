function sanitizeCount(value) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

import { compute } from './compute';

export function computeBudget({ counts = {}, rateInputs = {} }) {
  const salaryData = compute(rateInputs);
  const roles = ['doctor', 'nurse', 'assistant'];

  const cleanCounts = {};
  const shift_budget = {};
  const month_budget = {};
  let shift_total = 0;
  let month_total = 0;

  for (const role of roles) {
    const count = sanitizeCount(counts[role]);
    cleanCounts[role] = count;
    const shift = (salaryData.shift_salary?.[role] || 0) * count;
    const month = (salaryData.month_salary?.[role] || 0) * count;
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

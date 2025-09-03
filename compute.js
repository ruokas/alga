const THRESHOLDS = {
  V_BONUS: [
    { limit: 0.80, value: 0.00 },
    { limit: 1.00, value: 0.05 },
    { limit: 1.25, value: 0.10 },
    { limit: Infinity, value: 0.15 },
  ],
  A_BONUS: [
    { limit: 0.10, value: 0.00 },
    { limit: 0.20, value: 0.05 },
    { limit: 0.30, value: 0.10 },
    { limit: Infinity, value: 0.15 },
  ],
};

function getBonus(metric, table) {
  for (const { limit, value } of table) {
    if (metric <= limit) return value;
  }
  return 0;
}

function sanitize(value) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function compute({
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
  // Legacy support
  C,
  kMax,
  N,
}) {
  const c = sanitize(zoneCapacity ?? C);
  const k = sanitize(maxCoefficient ?? kMax);
  const sh = sanitize(shiftH);
  const mh = sanitize(monthH);
  const sN1 = sanitize(n1);
  const sN2 = sanitize(n2);
  const sN3 = sanitize(n3);
  const sN4 = sanitize(n4);
  const sN5 = sanitize(n5);
  const totalN = Number.isFinite(patientCount ?? N)
    ? Math.max(0, patientCount ?? N)
    : sN1 + sN2 + sN3 + sN4 + sN5;
  const ratio = c > 0 ? totalN / c : 0;
  const V = getBonus(ratio, THRESHOLDS.V_BONUS);
  const high = sN1 + sN2;
  const S = totalN > 0 ? high / totalN : 0;
  const A = getBonus(S, THRESHOLDS.A_BONUS);
  const K = Math.max(0, Math.min(1 + V + A, k));

  const finalDoc = Math.max(0, baseDoc * K);
  const finalNurse = Math.max(0, baseNurse * K);
  const finalAssist = Math.max(0, baseAssist * K);

  const baseShiftDoc = Math.max(0, baseDoc * sh);
  const baseShiftNurse = Math.max(0, baseNurse * sh);
  const baseShiftAssist = Math.max(0, baseAssist * sh);

  const baseMonthDoc = Math.max(0, baseDoc * mh);
  const baseMonthNurse = Math.max(0, baseNurse * mh);
  const baseMonthAssist = Math.max(0, baseAssist * mh);

  const shiftDoc = finalDoc * sh;
  const shiftNurse = finalNurse * sh;
  const shiftAssist = finalAssist * sh;

  const monthDoc = finalDoc * mh;
  const monthNurse = finalNurse * mh;
  const monthAssist = finalAssist * mh;

  return {
    patientCount: totalN,
    N: totalN,
    ESI: { n1: sN1, n2: sN2, n3: sN3, n4: sN4, n5: sN5 },
    ratio,
    S,
    V_bonus: V,
    A_bonus: A,
    maxCoefficient: k,
    K_max: k,
    K_zona: K,
    shift_hours: sh,
    month_hours: mh,
    base_rates: {
      doctor: baseDoc,
      nurse: baseNurse,
      assistant: baseAssist,
    },
    baseline_shift_salary: {
      doctor: baseShiftDoc,
      nurse: baseShiftNurse,
      assistant: baseShiftAssist,
    },
    baseline_month_salary: {
      doctor: baseMonthDoc,
      nurse: baseMonthNurse,
      assistant: baseMonthAssist,
    },
    final_rates: {
      doctor: finalDoc,
      nurse: finalNurse,
      assistant: finalAssist,
    },
    shift_salary: {
      doctor: shiftDoc,
      nurse: shiftNurse,
      assistant: shiftAssist,
    },
    month_salary: {
      doctor: monthDoc,
      nurse: monthNurse,
      assistant: monthAssist,
    },
  };
}

const exported = { THRESHOLDS, getBonus, compute };

if (typeof module !== 'undefined') {
  module.exports = exported;
}

if (typeof window !== 'undefined') {
  window.computeCore = exported;
}

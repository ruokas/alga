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

function compute({
  C,
  kMax,
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
  N,
}) {
  const totalN = typeof N === 'number' ? N : n1 + n2 + n3 + n4 + n5;
  const ratio = C > 0 ? totalN / C : 0;
  const V = getBonus(ratio, THRESHOLDS.V_BONUS);
  const high = n1 + n2;
  const S = totalN > 0 ? high / totalN : 0;
  const A = getBonus(S, THRESHOLDS.A_BONUS);
  const K = Math.min(1 + V + A, kMax);

  const finalDoc = baseDoc * K;
  const finalNurse = baseNurse * K;
  const finalAssist = baseAssist * K;

  const shiftDoc = finalDoc * shiftH;
  const shiftNurse = finalNurse * shiftH;
  const shiftAssist = finalAssist * shiftH;

  const monthDoc = finalDoc * monthH;
  const monthNurse = finalNurse * monthH;
  const monthAssist = finalAssist * monthH;

  return {
    N: totalN,
    ESI: { n1, n2, n3, n4, n5 },
    ratio,
    S,
    V_bonus: V,
    A_bonus: A,
    K_max: kMax,
    K_zona: K,
    shift_hours: shiftH,
    month_hours: monthH,
    base_rates: {
      doctor: baseDoc,
      nurse: baseNurse,
      assistant: baseAssist,
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

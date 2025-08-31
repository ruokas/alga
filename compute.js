const THRESHOLDS = Object.freeze({
  V_BONUS: Object.freeze([
    Object.freeze({ limit: 0.80, value: 0.00 }),
    Object.freeze({ limit: 1.00, value: 0.05 }),
    Object.freeze({ limit: 1.25, value: 0.10 }),
    Object.freeze({ limit: Infinity, value: 0.15 }),
  ]),
  A_BONUS: Object.freeze([
    Object.freeze({ limit: 0.10, value: 0.00 }),
    Object.freeze({ limit: 0.20, value: 0.05 }),
    Object.freeze({ limit: 0.30, value: 0.10 }),
    Object.freeze({ limit: Infinity, value: 0.15 }),
  ]),
});

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
  C,
  kMax,
  roles = [],
  shiftH,
  monthH,
  n1,
  n2,
  n3,
  n4,
  n5,
  N,
}, thresholds = THRESHOLDS) {
  const c = sanitize(C);
  const k = sanitize(kMax);
  const sh = sanitize(shiftH);
  const mh = sanitize(monthH);
  const sN1 = sanitize(n1);
  const sN2 = sanitize(n2);
  const sN3 = sanitize(n3);
  const sN4 = sanitize(n4);
  const sN5 = sanitize(n5);
  const totalN = Number.isFinite(N)
    ? Math.max(0, N)
    : sN1 + sN2 + sN3 + sN4 + sN5;
  const ratio = c > 0 ? totalN / c : 0;
  const V = getBonus(ratio, thresholds.V_BONUS || THRESHOLDS.V_BONUS);
  const high = sN1 + sN2;
  const S = totalN > 0 ? high / totalN : 0;
  const A = getBonus(S, thresholds.A_BONUS || THRESHOLDS.A_BONUS);
  const K = Math.max(0, Math.min(1 + V + A, k));

  const baseRates = {};
  const finalRates = {};
  const shiftSalary = {};
  const monthSalary = {};

  for (const r of roles) {
    const base = sanitize(r.base);
    const final = Math.max(0, base * K);
    baseRates[r.id] = base;
    finalRates[r.id] = final;
    shiftSalary[r.id] = final * sh;
    monthSalary[r.id] = final * mh;
  }

  return {
    N: totalN,
    ESI: { n1: sN1, n2: sN2, n3: sN3, n4: sN4, n5: sN5 },
    ratio,
    S,
    V_bonus: V,
    A_bonus: A,
    K_max: k,
    K_zona: K,
    shift_hours: sh,
    month_hours: mh,
    base_rates: baseRates,
    final_rates: finalRates,
    shift_salary: shiftSalary,
    month_salary: monthSalary,
  };
}

const exported = Object.freeze({ THRESHOLDS, getBonus, compute });

if (typeof module !== 'undefined') {
  module.exports = exported;
}

if (typeof window !== 'undefined') {
  window.computeCore = exported;
}

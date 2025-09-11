import { DEFAULT_KZ_CONFIG } from "./kz-config.js";

// Default thresholds for volume (V) and acuity (A) bonuses.
// Consumers can supply a custom object with the same shape
// as the second argument to `compute` to override these values.
const DEFAULT_THRESHOLDS = {
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

/**
 * @typedef {Object} RateSet
 * @property {number} doctor   Hourly rate for doctors.
 * @property {number} nurse    Hourly rate for nurses.
 * @property {number} assistant Hourly rate for assistants.
 */

/**
 * @typedef {Object} ComputeResult
 * @property {number} patientCount Total number of patients.
 * @property {{n1:number,n2:number,n3:number,n4:number,n5:number}} ESI Counts for each ESI level.
 * @property {number} ratio Patient to capacity ratio.
 * @property {number} S Proportion of high-acuity patients (ESI 1–2).
 * @property {number} V_bonus Volume bonus coefficient.
 * @property {number} A_bonus Acuity bonus coefficient.
 * @property {number} maxCoefficient Maximum allowed coefficient.
 * @property {number} K_zona Final zone coefficient.
 * @property {number} shift_hours Hours in a shift.
 * @property {number} month_hours Hours in a month.
 * @property {RateSet} base_rates Base hourly wages.
 * @property {RateSet} baseline_shift_salary Baseline salary per shift.
 * @property {RateSet} baseline_month_salary Baseline salary per month.
 * @property {RateSet} final_rates Adjusted hourly wages.
 * @property {RateSet} shift_salary Adjusted salary per shift.
 * @property {RateSet} month_salary Adjusted salary per month.
 */

/**
 * Calculates adjusted salaries and related statistics for a zone.
 * @param {Object} params Configuration parameters.
 * @param {number} [params.zoneCapacity] Maximum number of patients the zone can handle.
 * @param {number} [params.maxCoefficient] Upper limit for the zone coefficient.
 * @param {number} params.baseDoc Base hourly wage for doctors.
 * @param {number} params.baseNurse Base hourly wage for nurses.
 * @param {number} params.baseAssist Base hourly wage for assistants.
 * @param {Object} [params.extraRates] Additional roles with base hourly wages.
 * @param {number} params.shiftH Number of hours in a shift.
 * @param {number} params.monthH Number of hours in a month.
 * @param {number} params.n1 Number of ESI level 1 patients.
 * @param {number} params.n2 Number of ESI level 2 patients.
 * @param {number} params.n3 Number of ESI level 3 patients.
 * @param {number} params.n4 Number of ESI level 4 patients.
 * @param {number} params.n5 Number of ESI level 5 patients.
 * @param {number} [params.patientCount] Total number of patients. If omitted, sum of ESI counts is used.
 * @param {number} [params.C] Legacy zone capacity input.
 * @param {number} [params.kMax] Legacy max coefficient input.
 * @param {number} [params.N] Legacy patient count input.
 * @param {Object} [thresholds] Custom bonus threshold tables.
 * @param {Array<{limit:number,value:number}>} [thresholds.V_BONUS] Volume bonus table.
 * @param {Array<{limit:number,value:number}>} [thresholds.A_BONUS] Acuity bonus table.
 * @param {Object} [options] Additional settings.
 * @param {("legacy"|"ladder")} [options.formula="legacy"] Select formula variant.
 * @param {Object} [options.kzConfig] Config for ladder formula.
 * @returns {ComputeResult} Detailed computation results.
*/
function compute({
  zoneCapacity,
  maxCoefficient,
  baseDoc,
  baseNurse,
  baseAssist,
  extraRates = {},
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
}, thresholds = DEFAULT_THRESHOLDS, options = {}) {
  const { formula = 'legacy', kzConfig = DEFAULT_KZ_CONFIG } = options;
  const c = sanitize(zoneCapacity ?? C);
  const k = sanitize(maxCoefficient ?? kMax);
  const sh = sanitize(shiftH);
  const mh = sanitize(monthH);
  const sN1 = sanitize(n1);
  const sN2 = sanitize(n2);
  const sN3 = sanitize(n3);
  const sN4 = sanitize(n4);
  const sN5 = sanitize(n5);
  const providedN = sanitize(patientCount ?? N);
  const totalN = providedN > 0 ? providedN : sN1 + sN2 + sN3 + sN4 + sN5;
  const ratio = c > 0 ? totalN / c : 0;
  const high = sN1 + sN2;
  const S = totalN > 0 ? high / totalN : 0;
  let V = 0;
  let A = 0;
  if (formula === 'ladder') {
    for (const step of kzConfig.volume_ladder) {
      if (ratio <= step.r_max) {
        V = step.bonus;
        break;
      }
    }
    if (S < kzConfig.low_S_threshold) {
      V = Math.min(V, kzConfig.volume_cap_if_low_S);
    }
    for (const step of kzConfig.triage_ladder) {
      if (S <= step.s_max) {
        A = step.bonus;
        break;
      }
    }
  } else {
    V = getBonus(ratio, thresholds.V_BONUS);
    A = getBonus(S, thresholds.A_BONUS);
  }
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

  const base_rates = {
    doctor: baseDoc,
    nurse: baseNurse,
    assistant: baseAssist,
  };
  const baseline_shift_salary = {
    doctor: baseShiftDoc,
    nurse: baseShiftNurse,
    assistant: baseShiftAssist,
  };
  const baseline_month_salary = {
    doctor: baseMonthDoc,
    nurse: baseMonthNurse,
    assistant: baseMonthAssist,
  };
  const final_rates = {
    doctor: finalDoc,
    nurse: finalNurse,
    assistant: finalAssist,
  };
  const shift_salary = {
    doctor: shiftDoc,
    nurse: shiftNurse,
    assistant: shiftAssist,
  };
  const month_salary = {
    doctor: monthDoc,
    nurse: monthNurse,
    assistant: monthAssist,
  };

  for (const [role, base] of Object.entries(extraRates)) {
    const clean = sanitize(base);
    const final = Math.max(0, clean * K);
    base_rates[role] = clean;
    baseline_shift_salary[role] = Math.max(0, clean * sh);
    baseline_month_salary[role] = Math.max(0, clean * mh);
    final_rates[role] = final;
    shift_salary[role] = final * sh;
    month_salary[role] = final * mh;
  }

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
    base_rates,
    baseline_shift_salary,
    baseline_month_salary,
    final_rates,
    shift_salary,
    month_salary,
  };
}

export { compute, DEFAULT_THRESHOLDS, DEFAULT_KZ_CONFIG };

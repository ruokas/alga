/**
 * Suggest a staffing configuration for a zone.
 *
 * @param {Object} options
 * @param {number} [options.zoneCapacity=0] - Number of staff required for the zone.
 * @param {number} [options.budgetLimit=Infinity] - Maximum allowed cost.
 * @param {Object} [options.rates={}] - Hourly rates for each role.
 * @param {Object} [options.min={}] - Minimum number of each role to include.
 * @returns {{day:Object, night:Object}} Suggested staffing for day and night shifts.
 */
export function suggestStaffing({ zoneCapacity = 0, budgetLimit = Infinity, rates = {}, min = {} }) {
  const required = Math.max(0, Math.ceil(Number(zoneCapacity)));
  const rateDoc = Number(rates.doctor) || 0;
  const rateNurse = Number(rates.nurse) || 0;
  const rateAssist = Number(rates.assistant) || 0;
  const minDoc = Number(min.doctor) || 0;
  const minNurse = Number(min.nurse) || 0;
  const minAssist = Number(min.assistant) || 0;
  let best = null;
  const max = Math.max(required, minDoc, minNurse, minAssist); // max count per role to search
  for (let d = minDoc; d <= max; d++) {
    for (let n = minNurse; n <= max; n++) {
      for (let a = minAssist; a <= max; a++) {
        if (d < minDoc || n < minNurse || a < minAssist) continue;
        const coverage = d + n + a;
        if (coverage < required) continue;
        const cost = d * rateDoc + n * rateNurse + a * rateAssist;
        if (Number.isFinite(budgetLimit) && cost > budgetLimit) continue;
        if (!best || cost < best.cost) {
          best = { d, n, a, cost };
        }
      }
    }
  }
  if (!best) {
    // No feasible solution within budget; return minimal coverage ignoring budget
    best = {
      d: minDoc,
      n: minNurse,
      a: minAssist,
      cost: minDoc * rateDoc + minNurse * rateNurse + minAssist * rateAssist,
    };
  }
  const suggestion = {
    day: { doctor: best.d, nurse: best.n, assistant: best.a },
    night: { doctor: best.d, nurse: best.n, assistant: best.a },
  };
  return suggestion;
}

if (typeof module !== 'undefined') {
  module.exports = { suggestStaffing };
}

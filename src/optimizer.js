export function suggestStaffing({ zoneCapacity = 0, budgetLimit = Infinity, rates = {} }) {
  const required = Math.max(0, Math.ceil(Number(zoneCapacity)));
  const rateDoc = Number(rates.doctor) || 0;
  const rateNurse = Number(rates.nurse) || 0;
  const rateAssist = Number(rates.assistant) || 0;
  let best = null;
  const max = required; // max count per role to search
  for (let d = 0; d <= max; d++) {
    for (let n = 0; n <= max; n++) {
      for (let a = 0; a <= max; a++) {
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
    best = { d: 0, n: 0, a: 0, cost: 0 };
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

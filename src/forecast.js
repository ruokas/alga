let model = { total: 0, esiProbs: [0, 0, 0, 0, 0] };

function trainPatientModel(data) {
  if (!Array.isArray(data) || data.length === 0) return model;
  const alpha = 0.5;
  let total = Number(data[0].total) || 0;
  let probs = Array.isArray(data[0].counts) && data[0].counts.length === 5
    ? data[0].counts.map(c => c / total)
    : [0, 0, 0, 0, 0];
  for (let i = 1; i < data.length; i++) {
    const d = data[i];
    const t = Number(d.total) || 0;
    const p = Array.isArray(d.counts) && d.counts.length === 5
      ? d.counts.map(c => c / t)
      : [0, 0, 0, 0, 0];
    total = alpha * t + (1 - alpha) * total;
    probs = probs.map((prev, idx) => alpha * p[idx] + (1 - alpha) * prev);
  }
  model = { total, esiProbs: probs };
  return model;
}

let historyData;
try {
  if (typeof require !== 'undefined') {
    historyData = require('../data/patient_history.json');
  }
} catch {
  historyData = null;
}
if (historyData) {
  trainPatientModel(historyData);
}

function predictCounts(days, zoneCapacity) {
  const d = Math.max(0, Math.floor(Number(days)));
  const cap = Number(zoneCapacity);
  const results = [];
  const summary = { totalPatients: 0, esiTotals: [0, 0, 0, 0, 0] };
  for (let i = 0; i < d; i++) {
    let total = model.total;
    if (Number.isFinite(cap) && cap > 0) {
      total = Math.min(total, cap);
    }
    total = Math.round(total);
    let counts = model.esiProbs.map(p => Math.round(p * total));
    let diff = total - counts.reduce((a, b) => a + b, 0);
    if (diff !== 0) {
      counts[counts.length - 1] += diff;
    }
    results.push({ day: i + 1, total, counts });
    summary.totalPatients += total;
    for (let j = 0; j < counts.length; j++) {
      summary.esiTotals[j] += counts[j];
    }
  }
  return { days: results, summary };
}

export { trainPatientModel, predictCounts };
if (typeof module !== 'undefined') {
  module.exports = { trainPatientModel, predictCounts };
}

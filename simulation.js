function createRng(seed) {
  let state = Number(seed) >>> 0;
  return function () {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function simulateEsiCounts(patientCount, zoneCapacity, seed) {
  const rng = typeof seed === 'function' ? seed : seed !== undefined ? createRng(seed) : Math.random;
  let total = Math.floor(Number(patientCount));
  if (!Number.isFinite(total) || total <= 0) {
    const cap = Math.floor(Number(zoneCapacity));
    if (cap > 0) {
      total = Math.round(cap * (0.8 + rng() * 0.4));
    } else {
      total = Math.floor(rng() * 21) + 10; // between 10 and 30
    }
  }
  const probs = [0.05, 0.15, 0.4, 0.3, 0.1];
  const counts = probs.map(() => 0);
  for (let i = 0; i < total; i++) {
    const r = rng();
    let acc = 0;
    for (let j = 0; j < probs.length; j++) {
      acc += probs[j];
      if (r < acc) {
        counts[j]++;
        break;
      }
    }
  }
  return { total, counts };
}

const DAILY_PATIENT_COUNTS = [135, 126, 124, 122, 130, 117, 119];

// Lazy require to avoid circular dependencies in tests/bundlers
let forecastPredict;
try {
  if (typeof require !== 'undefined') {
    forecastPredict = require('./src/forecast.js').predictCounts;
  }
} catch {}

function simulatePeriod(days, zoneCapacity, options = {}, seed) {
  const {
    patientCounts = DAILY_PATIENT_COUNTS,
    variation = 0,
    startIndex = 0,
    useForecast = false
  } = options;

  if (useForecast && typeof forecastPredict === 'function') {
    return forecastPredict(days, zoneCapacity);
  }

  const rng = typeof seed === 'function' ? seed : seed !== undefined ? createRng(seed) : Math.random;
  const d = Math.max(0, Math.floor(Number(days)));
  const cap = Number(zoneCapacity);
  const results = [];
  const summary = { totalPatients: 0, esiTotals: [0, 0, 0, 0, 0] };
  for (let i = 0; i < d; i++) {
    const base = patientCounts[(startIndex + i) % patientCounts.length];
    const factor = 1 + (rng() * 2 - 1) * variation;
    const dayTotal = base * factor;
    const { total, counts } = simulateEsiCounts(dayTotal, cap, rng);
    results.push({ day: i + 1, total, counts });
    summary.totalPatients += total;
    for (let j = 0; j < counts.length; j++) {
      summary.esiTotals[j] += counts[j];
    }
  }
  return { days: results, summary };
}

export { simulateEsiCounts, simulatePeriod, DAILY_PATIENT_COUNTS };

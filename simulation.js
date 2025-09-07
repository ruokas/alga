function createRng(seed) {
  let state = Number(seed) >>> 0;
  return function () {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Generates a random distribution of patients among ESI levels.
 * @param {number} patientCount Total number of patients. If non-positive, a value is generated from zone capacity.
 * @param {number} zoneCapacity Capacity of the zone used when estimating patient count.
 * @param {number|Function} [seed] Seed value or RNG function.
 * @returns {{total:number, counts:number[]}} Total patients and counts for ESI levels 1-5.
 */
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

/**
 * Simulates patient flow over multiple days.
 * @param {number} days Number of days to simulate.
 * @param {number} zoneCapacity Capacity of the zone.
 * @param {Object} [options] Simulation options.
 * @param {number[]} [options.patientCounts=DAILY_PATIENT_COUNTS] Baseline patient counts for a week.
 * @param {number} [options.variation=0] Random variation factor applied to counts.
 * @param {number} [options.startIndex=0] Starting index within patientCounts.
 * @param {boolean} [options.useForecast=false] Whether to use forecast model if available.
 * @param {number|Function} [seed] Seed value or RNG function.
 * @returns {{days:Array<{day:number,total:number,counts:number[]}>, summary:{totalPatients:number,esiTotals:number[]}}}
 *          Simulated daily results and overall summary.
 */
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

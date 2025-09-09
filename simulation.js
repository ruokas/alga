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

export { simulateEsiCounts };

function simulateEsiCounts(patientCount, zoneCapacity){
  let total = Math.floor(Number(patientCount));
  if (!Number.isFinite(total) || total <= 0){
    const cap = Math.floor(Number(zoneCapacity));
    if (cap > 0){
      total = Math.round(cap * (0.8 + Math.random() * 0.4));
    } else {
      total = Math.floor(Math.random() * 21) + 10; // between 10 and 30
    }
  }
  const probs = [0.05, 0.15, 0.4, 0.3, 0.1];
  const counts = probs.map(()=>0);
  for (let i=0; i<total; i++){
    const r = Math.random();
    let acc = 0;
    for (let j=0; j<probs.length; j++){
      acc += probs[j];
      if (r < acc){
        counts[j]++;
        break;
      }
    }
  }
  return { total, counts };
}

const DAILY_PATIENT_COUNTS = [135, 126, 124, 122, 130, 117, 119];

function simulatePeriod(days, zoneCapacity){
  const d = Math.max(0, Math.floor(Number(days)));
  const cap = Number(zoneCapacity);
  const results = [];
  for (let i=0; i<d; i++){
    const dayTotal = DAILY_PATIENT_COUNTS[i % DAILY_PATIENT_COUNTS.length];
    const { total, counts } = simulateEsiCounts(dayTotal, cap);
    results.push({ day: i + 1, total, counts });
  }
  return results;
}

export { simulateEsiCounts, simulatePeriod, DAILY_PATIENT_COUNTS };

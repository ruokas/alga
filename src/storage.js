export const LS_RATE_KEY = 'ED_RATE_TEMPLATE_V2';

export function saveRateTemplate(values) {
  try {
    localStorage.setItem(LS_RATE_KEY, JSON.stringify(values));
    return true;
  } catch {
    return false;
  }
}

export function loadRateTemplate() {
  try {
    const j = localStorage.getItem(LS_RATE_KEY);
    if (j) return JSON.parse(j);
  } catch {
    /* ignore */
  }
  return null;
}

// CommonJS compatibility
if (typeof module !== 'undefined') {
  module.exports = { LS_RATE_KEY, saveRateTemplate, loadRateTemplate };
}


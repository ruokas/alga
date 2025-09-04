export function updateChart(chart, updater) {
  if (!chart || typeof chart.update !== 'function') return;
  updater(chart);
}

// CommonJS support for tests
if (typeof module !== 'undefined') {
  module.exports = { updateChart };
}

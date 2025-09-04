export function updateChart(chart, updater) {
  if (!chart || typeof chart.update !== 'function') return;
  updater(chart);
}

export function createFlowChart(canvas, color = '#007bff') {
  if (!canvas || typeof Chart === 'undefined') return null;
  const ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Pacientų srautas laike', data: [], borderColor: color, backgroundColor: 'transparent', tension: 0.3 }] },
    options: {
      plugins: { legend: { display: false } },
      scales: { x: { title: { display: true, text: 'Diena' } }, y: { beginAtZero: true } },
      maintainAspectRatio: false,
      responsive: true,
    }
  });
}

export function updateFlowChart(chart, results) {
  const days = Array.isArray(results) ? results : (results && results.days) || [];
  updateChart(chart, c => {
    c.data.labels = days.map(r => r.day);
    c.data.datasets[0].data = days.map(r => r.total);
    c.update();
  });
}

// CommonJS support for tests
if (typeof module !== 'undefined') {
  module.exports = { updateChart, createFlowChart, updateFlowChart };
}

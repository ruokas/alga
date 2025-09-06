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

export function createForecastChart(canvas, color = '#28a745') {
  if (!canvas || typeof Chart === 'undefined') return null;
  const ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Prognozė', data: [], borderColor: color, backgroundColor: 'transparent', tension: 0.3 }] },
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

export function createBudgetChart(canvas, type = 'bar') {
  if (!canvas || typeof Chart === 'undefined') return null;
  const ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return null;
  const baseColors = ['#007bff', '#28a745', '#ffc107'];
  const bonusColors = ['#80bdff', '#71dd8a', '#ffd966'];
  return new Chart(ctx, {
    type,
    data: {
      labels: ['Gydytojas', 'Slaugytojas', 'Padėjėjas'],
      datasets: [
        {
          label: 'Bazinis',
          data: [0, 0, 0],
          backgroundColor: baseColors,
          borderColor: baseColors,
        },
        {
          label: 'Priedas',
          data: [0, 0, 0],
          backgroundColor: bonusColors,
          borderColor: bonusColors,
        }
      ]
    },
    options: {
      plugins: { legend: { display: true } },
      scales: type === 'bar' ? { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } : {},
      maintainAspectRatio: false,
      responsive: true,
    }
  });
}

export function updateBudgetChart(chart, baseline = {}, bonus = {}) {
  const roles = ['doctor', 'nurse', 'assistant'];
  updateChart(chart, c => {
    c.data.datasets[0].data = roles.map(r => Number(baseline[r]) || 0);
    c.data.datasets[1].data = roles.map(r => Number(bonus[r]) || 0);
    c.update();
  });
}

export function createDayNightChart(canvas) {
  if (!canvas || typeof Chart === 'undefined') return null;
  const ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Gydytojas', 'Slaugytojas', 'Padėjėjas'],
      datasets: [
        { label: 'Diena', data: [0, 0, 0], backgroundColor: '#007bff' },
        { label: 'Naktis', data: [0, 0, 0], backgroundColor: '#6c757d' },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  });
}

export function updateDayNightChart(chart, day = {}, night = {}) {
  const roles = ['doctor', 'nurse', 'assistant'];
  updateChart(chart, c => {
    c.data.datasets[0].data = roles.map(r => Number(day[r]) || 0);
    c.data.datasets[1].data = roles.map(r => Number(night[r]) || 0);
    c.update();
  });
}

export function createStaffChart(canvas) {
  if (!canvas || typeof Chart === 'undefined') return null;
  const ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return null;
  const colors = ['#007bff', '#28a745', '#ffc107'];
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Gydytojas', 'Slaugytojas', 'Padėjėjas'],
      datasets: [{
        label: 'Personalas',
        data: [0, 0, 0],
        backgroundColor: colors,
        borderColor: colors,
      }]
    },
    options: {
      plugins: { legend: { display: true } },
      maintainAspectRatio: false,
      responsive: true,
    }
  });
}

export function updateStaffChart(chart, counts = { day: {}, night: {} }) {
  const roles = ['doctor', 'nurse', 'assistant'];
  updateChart(chart, c => {
    c.data.datasets[0].data = roles.map(r => {
      const day = Number((counts.day && counts.day[r]) || 0);
      const night = Number((counts.night && counts.night[r]) || 0);
      return day + night;
    });
    c.update();
  });
}

// CommonJS support for tests
if (typeof module !== 'undefined') {
  module.exports = {
    updateChart,
    createFlowChart,
    updateFlowChart,
    createForecastChart,
    createBudgetChart,
    updateBudgetChart,
    createDayNightChart,
    updateDayNightChart,
    createStaffChart,
    updateStaffChart,
  };
}

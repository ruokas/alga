export function buildCsv(data) {
  const rows = [
    ['date', data.date],
    ['shift', data.shift],
    ['zone', data.zone],
    ['zone_label', data.zone_label],
    ['zoneCapacity', data.zoneCapacity],
    ['patientCount', data.patientCount],
    ['ESI1', data.ESI.n1],
    ['ESI2', data.ESI.n2],
    ['ESI3', data.ESI.n3],
    ['ESI4', data.ESI.n4],
    ['ESI5', data.ESI.n5],
    ['ratio', data.ratio],
    ['S', data.S],
    ['V_bonus', data.V_bonus],
    ['A_bonus', data.A_bonus],
    ['maxCoefficient', data.maxCoefficient],
    ['K_zona', data.K_zona],
    ['shift_hours', data.shift_hours],
    ['month_hours', data.month_hours],
    ['base_rate_doctor', data.base_rates.doctor],
    ['base_rate_nurse', data.base_rates.nurse],
    ['base_rate_assistant', data.base_rates.assistant],
    ['final_rate_doctor', data.final_rates.doctor],
    ['final_rate_nurse', data.final_rates.nurse],
    ['final_rate_assistant', data.final_rates.assistant],
    ['shift_salary_doctor', data.shift_salary.doctor],
    ['shift_salary_nurse', data.shift_salary.nurse],
    ['shift_salary_assistant', data.shift_salary.assistant],
    ['month_salary_doctor', data.month_salary.doctor],
    ['month_salary_nurse', data.month_salary.nurse],
    ['month_salary_assistant', data.month_salary.assistant]
  ];
  return csvUtils.rowsToCsv(rows);
}

export function downloadCsv(data) {
  const csv = buildCsv(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'salary_calc.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildPdf(data) {
  const chartImages = {};
  if (typeof document !== 'undefined' && typeof Chart !== 'undefined') {
    ['ratioChart', 'sChart', 'payChart'].forEach(id => {
      const canvas = document.getElementById(id);
      if (canvas) {
        let chart;
        if (typeof Chart.getChart === 'function') {
          chart = Chart.getChart(canvas);
        } else if (canvas.chart) {
          chart = canvas.chart;
        }
        if (chart && typeof chart.toBase64Image === 'function') {
          try {
            chartImages[id] = chart.toBase64Image();
          } catch (err) {
            console.error('Failed to capture chart', id, err);
          }
        }
      }
    });
  }
  return pdfUtils.generatePdf(data, chartImages);
}

export function downloadPdf(data) {
  try {
    const doc = buildPdf(data);
    doc.save('salary_calc.pdf');
  } catch (err) {
    alert('Nepavyko sugeneruoti PDF. Patikrinkite ar įkelta jsPDF biblioteka.');
    console.error(err);
  }
}

if (typeof module !== 'undefined') {
  module.exports = { buildCsv, downloadCsv, buildPdf, downloadPdf };
}

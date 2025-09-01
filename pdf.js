let jsPDFLib;
if (typeof window !== 'undefined') {
  // jsPDF v2 UMD exposes window.jspdf.jsPDF, but some builds expose window.jsPDF.
  jsPDFLib = window.jspdf?.jsPDF || window.jsPDF;
}
if (!jsPDFLib) {
  try {
    const jspdf = require('jspdf');
    jsPDFLib = jspdf.jsPDF || jspdf.default;
  } catch (err) {
    console.error('jsPDF library not found', err);
  }
}

function generatePdf(data) {
  if (!jsPDFLib) {
    throw new Error('jsPDF library is not loaded');
  }
  const doc = new jsPDFLib();
  const margin = 10;
  let y = margin;
  const now = new Date().toLocaleString();

  doc.setFontSize(16);
  doc.text('Salary Calculation', margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Generated: ${now}`, margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.text('Input Parameters', margin, y);
  y += 6;
  doc.setFontSize(10);
  const inputs = [
    `Date: ${data.date || ''}`,
    `Shift: ${data.shift}`,
    `Zone: ${data.zone_label || data.zone}`,
    `Capacity: ${data.capacity}`,
    `N: ${data.N}`,
    `ESI: ${data.ESI.n1}/${data.ESI.n2}/${data.ESI.n3}/${data.ESI.n4}/${data.ESI.n5}`
  ];
  inputs.forEach(line => { doc.text(line, margin, y); y += 5; });

  y += 5;
  doc.setFontSize(12);
  doc.text('Bonuses', margin, y);
  y += 6;
  doc.setFontSize(10);
  const bonuses = [
    `V_bonus: ${data.V_bonus.toFixed(2)}`,
    `A_bonus: ${data.A_bonus.toFixed(2)}`,
    `K_zona: ${data.K_zona.toFixed(2)}`
  ];
  bonuses.forEach(line => { doc.text(line, margin, y); y += 5; });

  y += 5;
  doc.setFontSize(12);
  doc.text('Rates', margin, y);
  y += 6;
  doc.setFontSize(10);
  ['doctor','nurse','assistant'].forEach(role => {
    doc.text(
      `${role}: base ${data.base_rates[role].toFixed(2)} final ${data.final_rates[role].toFixed(2)} shift ${data.shift_salary[role].toFixed(2)} month ${data.month_salary[role].toFixed(2)}`,
      margin,
      y
    );
    y += 5;
  });

  return doc;
}

const exported = { generatePdf };

if (typeof module !== 'undefined') {
  module.exports = exported;
}

if (typeof window !== 'undefined') {
  window.pdfUtils = exported;
}

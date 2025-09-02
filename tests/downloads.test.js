const { compute } = require('../compute.js');
global.csvUtils = require('../csv.js');
global.pdfUtils = require('../pdf.js');
const { buildCsv, buildPdf } = require('../downloads.js');

describe('download helpers', () => {
  const data = (() => {
    const base = compute({
      zoneCapacity: 10,
      maxCoefficient: 1.3,
      baseDoc: 20,
      baseNurse: 10,
      baseAssist: 5,
      shiftH: 12,
      monthH: 160,
      n1: 1,
      n2: 2,
      n3: 3,
      n4: 4,
      n5: 5,
      patientCount: undefined,
    });
    return { date: '2024-01-01', shift: 'D', zone: 'Z', zone_label: 'Zone Z', zoneCapacity: 10, ...base };
  })();

  test('buildCsv returns csv string', () => {
    const csv = buildCsv(data);
    expect(typeof csv).toBe('string');
    expect(csv.split('\n')[0].startsWith('date,shift')).toBe(true);
  });

  test('buildPdf returns jspdf document', () => {
    const doc = buildPdf(data);
    expect(doc).toBeDefined();
    expect(typeof doc.save).toBe('function');
  });
});

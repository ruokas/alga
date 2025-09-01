const { compute } = require('../compute.js');
const { generatePdf } = require('../pdf.js');

describe('PDF generation', () => {
  test('runs without errors', () => {
    const data = compute({
      C: 10,
      kMax: 1.3,
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
      N: undefined,
    });
    const doc = generatePdf({
      date: '2024-01-01',
      shift: 'D',
      zone: 'Z',
      zone_label: 'Zone Z',
      capacity: 10,
      ...data,
    });
    expect(doc).toBeDefined();
    expect(typeof doc.save).toBe('function');
  });
});

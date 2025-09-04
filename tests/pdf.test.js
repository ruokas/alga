const { compute } = require('../compute.js');
const { generatePdf } = require('../pdf.js');

describe('PDF generation', () => {
  test('runs without errors', () => {
    const data = compute({
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
    const doc = generatePdf({
      date: '2024-01-01',
      shift: 'D',
      zone: 'Z',
      zone_label: 'Zone Z',
      zoneCapacity: 10,
      ...data,
    });
    expect(doc).toBeDefined();
    expect(typeof doc.save).toBe('function');
  });

  test('handles chart images', () => {
    const data = compute({
      zoneCapacity: 5,
      maxCoefficient: 1.1,
      baseDoc: 10,
      baseNurse: 5,
      baseAssist: 2,
      shiftH: 12,
      monthH: 160,
      n1: 1,
      n2: 1,
      n3: 1,
      n4: 1,
      n5: 1,
      patientCount: undefined,
    });
    const dummyImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn8B9M6P7wAAAABJRU5ErkJggg==';
    const doc = generatePdf({
      date: '2024-02-02',
      shift: 'D',
      zone: 'Z',
      zone_label: 'Zone Z',
      zoneCapacity: 5,
      ...data,
    }, { ratioChart: dummyImg, sChart: dummyImg, payChart: dummyImg });
    expect(doc).toBeDefined();
  });
});

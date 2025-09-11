import { compute } from '../compute';

describe('compute formula switching', () => {
  test('ladder variant caps volume when S is low', () => {
    const params = {
      zoneCapacity: 28,
      patientCount: 0,
      maxCoefficient: 1.3,
      baseDoc: 10,
      baseNurse: 10,
      baseAssist: 10,
      shiftH: 0,
      monthH: 0,
      n1: 0,
      n2: 0,
      n3: 30,
      n4: 20,
      n5: 10,
    };
    const out = compute(params, undefined, { formula: 'ladder' });
    expect(out.K_zona).toBeCloseTo(1.20);
  });

  test('legacy formula remains default', () => {
    const params = {
      zoneCapacity: 28,
      patientCount: 0,
      maxCoefficient: 1.3,
      baseDoc: 10,
      baseNurse: 10,
      baseAssist: 10,
      shiftH: 0,
      monthH: 0,
      n1: 0,
      n2: 0,
      n3: 30,
      n4: 20,
      n5: 10,
    };
    const out = compute(params);
    expect(out.K_zona).toBeCloseTo(1.15);
  });
});

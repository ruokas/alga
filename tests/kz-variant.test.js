import { k_zona, payout, computeVariant, DEFAULT_KZ_CONFIG } from '../kz-variant';
import { compute } from '../compute';

describe('k_zona ladder variant', () => {
  test('applies volume and triage bonuses with cap', () => {
    const K = k_zona(10, 10, 30, 20, 10, 16, DEFAULT_KZ_CONFIG);
    expect(K).toBeCloseTo(1.30); // capped by k_max
  });

  test('low S caps volume bonus', () => {
    const K = k_zona(0, 0, 30, 20, 10, 28, DEFAULT_KZ_CONFIG);
    expect(K).toBeCloseTo(1.20);
  });
});

describe('payout helper', () => {
  test('computes final rate and pay', () => {
    const result = payout([10,10,30,20,10], 'RED', 'D', 10, 12, DEFAULT_KZ_CONFIG);
    expect(result.K_zona).toBeCloseTo(1.30);
    expect(result.final_rate_eur_h).toBeCloseTo(13.0);
    expect(result.pay_per_shift).toBeCloseTo(156.0);
  });
});

describe('computeVariant switcher', () => {
  test('uses ladder variant when requested', () => {
    const out = computeVariant('ladder', {
      esi: [10,10,30,20,10],
      zone: 'RED',
      shift: 'D',
      base_rate_eur_h: 10,
      shift_hours: 12,
      cfg: DEFAULT_KZ_CONFIG,
    });
    expect(out.K_zona).toBeCloseTo(1.30);
  });

  test('falls back to legacy compute', () => {
    const params = {
      zoneCapacity: 100,
      patientCount: 50,
      maxCoefficient: 1.3,
      baseDoc: 10,
      baseNurse: 10,
      baseAssist: 10,
      shiftH: 0,
      monthH: 0,
      n1: 10,
      n2: 5,
      n3: 35,
      n4: 0,
      n5: 0,
    };
    const legacy = compute(params);
    const out = computeVariant('legacy', params);
    expect(out.K_zona).toBeCloseTo(legacy.K_zona);
  });
});

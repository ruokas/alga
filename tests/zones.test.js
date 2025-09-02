const { sanitizeId, loadZones, saveZones, DEFAULT_ZONES } = require('../zones.js');

describe('zones utilities', () => {
  test('sanitizeId creates valid ids', () => {
    expect(sanitizeId('Hello world')).toBe('HELLO_WORLD');
    expect(sanitizeId('')).toMatch(/^ZONE_/);
  });

  test('save and load zones round trip', () => {
    const custom = [{ id: 'X', name: 'X', group: 'G', cap: { D: 1, N: 1, P: 2 } }];
    saveZones(custom);
    expect(loadZones()).toEqual(custom);
    localStorage.removeItem('ED_ZONES_V2');
    expect(loadZones()).toEqual(DEFAULT_ZONES);
  });
});

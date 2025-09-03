const { sanitizeId, loadZones, saveZones, DEFAULT_ZONES, initZones } = require('../zones.js');

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

describe('renderZoneEditor', () => {
  test('escapes user-provided data', () => {
    localStorage.removeItem('ED_ZONES_V2');
    const els = {
      zoneTbody: document.createElement('tbody'),
      zoneModal: document.createElement('div'),
      zone: document.createElement('select'),
      shift: document.createElement('select'),
      zoneCapacity: document.createElement('input'),
    };
    els.shift.value = 'D';
    const mod = initZones(els);
    const zones = mod.getZones();
    zones.splice(0, zones.length);
    zones.push({ id: 'XSS', name: '<img src=x onerror="alert(1)">', group: '<b>G</b>', cap: { D: 1, N: 1, P: 2 } });

    mod.renderZoneSelect();
    mod.openZoneModal();

    expect(els.zoneTbody.querySelector('img')).toBeNull();
    expect(els.zoneTbody.querySelector('b')).toBeNull();
    expect(els.zoneTbody.querySelector('input[data-field="name"]').value).toBe('<img src=x onerror="alert(1)">');

    const nameInput = els.zoneTbody.querySelector('input[data-field="name"]');
    nameInput.value = '<script>alert(1)</script>';
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(els.zone.querySelector('script')).toBeNull();
    expect(els.zone.querySelector('option').textContent).toBe('<script>alert(1)</script>');
  });
});

jest.mock('../theme.js', () => ({ initThemeToggle: jest.fn() }));

const mockZoneApi = {
  renderZoneSelect: jest.fn(),
  setDefaultCapacity: jest.fn(),
  openZoneModal: jest.fn(),
  closeZoneModal: jest.fn(),
  addZone: jest.fn(),
  saveZonesAndClose: jest.fn(),
  resetToDefaults: jest.fn(),
  getZones: jest.fn(() => []),
};

jest.mock('../zones.js', () => ({ initZones: jest.fn(() => mockZoneApi) }));
jest.mock('../downloads.js', () => ({ downloadCsv: jest.fn(), downloadPdf: jest.fn() }));
jest.mock('../src/chart/index.js', () => ({ updateChart: jest.fn() }));
jest.mock('../src/chart/utils.js', () => ({ safeCreateChart: jest.fn() }));
jest.mock('../simulation.js', () => ({ simulateEsiCounts: jest.fn(() => ({ total: 0, counts: [0,0,0,0,0] })) }));
jest.mock('../src/storage.js', () => ({ saveRateTemplate: jest.fn(), loadRateTemplate: jest.fn(() => null) }));

let mockEls;

jest.mock('../src/ui/dom.js', () => ({
  getElements: jest.fn(() => mockEls),
  bindEvents: jest.fn(),
}));

beforeEach(() => {
  jest.resetModules();
  localStorage.clear();
  const makeInput = (val='') => ({ value: val, classList: { add: jest.fn(), remove: jest.fn() }, disabled: false, removeAttribute: jest.fn() });
  mockEls = {
    zoneCapacity: makeInput(),
    patientCount: makeInput(),
    maxCoefficient: makeInput(),
    shiftHours: makeInput(),
    monthHours: makeInput(),
    baseRateDoc: makeInput(),
    baseRateNurse: makeInput(),
    baseRateAssist: makeInput(),
    esi1: makeInput(),
    esi2: makeInput(),
    esi3: makeInput(),
    esi4: makeInput(),
    esi5: makeInput(),
    linkPatientCount: { checked: false },
    ratio: { textContent: '' },
    sShare: { textContent: '' },
    vBonus: { textContent: '' },
    aBonus: { textContent: '' },
    maxCoefficientCell: { textContent: '' },
    kZona: { textContent: '' },
    baseDocCell: { textContent: '' },
    kDocCell: { textContent: '' },
    finalDocCell: { textContent: '' },
    shiftDocCell: { textContent: '' },
    monthDocCell: { textContent: '' },
    deltaDocCell: { textContent: '' },
    baseNurseCell: { textContent: '' },
    kNurseCell: { textContent: '' },
    finalNurseCell: { textContent: '' },
    shiftNurseCell: { textContent: '' },
    monthNurseCell: { textContent: '' },
    deltaNurseCell: { textContent: '' },
    baseAssistCell: { textContent: '' },
    kAssistCell: { textContent: '' },
    finalAssistCell: { textContent: '' },
    shiftAssistCell: { textContent: '' },
    monthAssistCell: { textContent: '' },
    deltaAssistCell: { textContent: '' },
    ratioCanvas: null,
    sCanvas: null,
    payCanvas: null,
    simulateEsi: { addEventListener: jest.fn() },
    reset: { addEventListener: jest.fn() },
    copy: { addEventListener: jest.fn() },
    downloadCsv: { addEventListener: jest.fn() },
    downloadPdf: { addEventListener: jest.fn() },
    manageZones: { addEventListener: jest.fn() },
    zoneModal: {},
    zoneTbody: {},
    addZone: { addEventListener: jest.fn() },
    saveZonesBtn: { addEventListener: jest.fn() },
    defaultsZones: { addEventListener: jest.fn() },
    closeZoneModal: { addEventListener: jest.fn() },
    saveRateTemplate: { addEventListener: jest.fn() },
    loadRateTemplate: { addEventListener: jest.fn() },
    budgetPlanner: { addEventListener: jest.fn() },
    zone: { value: 'RED', addEventListener: jest.fn(), innerHTML: '', appendChild: jest.fn() },
    shift: { value: 'D', addEventListener: jest.fn() },
    date: { value: '' },
    calcVariant: { value: 'legacy', addEventListener: jest.fn() },
  };
});

test('calcVariant switch recalculates coefficient', () => {
  const { compute } = require('../src/ui.js');
  mockEls.zoneCapacity.value = '100';
  mockEls.patientCount.value = '50';
  mockEls.maxCoefficient.value = '2';
  mockEls.shiftHours.value = '12';
  mockEls.monthHours.value = '0';
  mockEls.baseRateDoc.value = '10';
  mockEls.baseRateNurse.value = '10';
  mockEls.baseRateAssist.value = '10';
  mockEls.esi1.value = '10';
  mockEls.esi2.value = '5';
  mockEls.esi3.value = '35';
  mockEls.esi4.value = '0';
  mockEls.esi5.value = '0';

  compute();
  const legacy = parseFloat(mockEls.kZona.textContent);

  mockEls.calcVariant.value = 'ladder';
  const handler = mockEls.calcVariant.addEventListener.mock.calls[0][1];
  handler();
  const ladder = parseFloat(mockEls.kZona.textContent);

  expect(legacy).toBeCloseTo(1.10);
  expect(ladder).toBeCloseTo(1.15);
});

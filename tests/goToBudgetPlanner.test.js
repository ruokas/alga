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
jest.mock('../compute.js', () => ({
  compute: jest.fn(() => ({
    ratio: 0,
    S: 0,
    V_bonus: 0,
    A_bonus: 0,
    maxCoefficient: 1,
    K_zona: 1,
    baseline_shift_salary: { doctor: 0, nurse: 0, assistant: 0 },
    shift_salary: { doctor: 0, nurse: 0, assistant: 0 },
    base_rates: { doctor: 0, nurse: 0, assistant: 0 },
    final_rates: { doctor: 0, nurse: 0, assistant: 0 },
    month_salary: { doctor: 0, nurse: 0, assistant: 0 },
    baseline_month_salary: { doctor: 0, nurse: 0, assistant: 0 },
    patientCount: 0,
  })),
}));

jest.mock('../src/storage.js', () => ({
  saveRateTemplate: jest.fn(),
  loadRateTemplate: jest.fn(() => null),
}));

let mockEls;

jest.mock('../src/ui/dom.js', () => ({
  getElements: jest.fn(() => mockEls),
  bindEvents: jest.fn(),
}));

beforeEach(() => {
  jest.resetModules();
  localStorage.clear();
  window.alert = jest.fn();
  global.alert = window.alert;
  const makeInput = (val = '') => ({
    value: val,
    classList: { add: jest.fn(), remove: jest.fn() },
    removeAttribute: jest.fn(),
  });
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
    flowCanvas: null,
    forecastCanvas: null,
    simulateEsi: { addEventListener: jest.fn() },
    days: { value: '' },
    simulatePeriod: { addEventListener: jest.fn() },
    forecast: { addEventListener: jest.fn() },
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
    zone: { value: '', addEventListener: jest.fn(), innerHTML: '', appendChild: jest.fn() },
    shift: { value: 'D', addEventListener: jest.fn() },
    date: { value: '' },
  };
});

test('stores inputs to localStorage', () => {
  const { goToBudgetPlanner } = require('../src/ui.js');

  Object.assign(mockEls, {
    zoneCapacity: { value: '10' },
    patientCount: { value: '5' },
    maxCoefficient: { value: '1.3' },
    shiftHours: { value: '12' },
    monthHours: { value: '160' },
    baseRateDoc: { value: '20' },
    baseRateNurse: { value: '15' },
    baseRateAssist: { value: '10' },
    esi1: { value: '1' },
    esi2: { value: '2' },
    esi3: { value: '3' },
    esi4: { value: '4' },
    esi5: { value: '5' },
  });

  try { goToBudgetPlanner(); } catch (_) {}

  const saved = JSON.parse(localStorage.getItem('budgetInputs'));
  expect(saved).toEqual({
    zoneCapacity: '10',
    patientCount: '5',
    maxCoefficient: '1.3',
    shiftHours: '12',
    monthHours: '160',
    baseRateDoc: '20',
    baseRateNurse: '15',
    baseRateAssist: '10',
    n1: '1',
    n2: '2',
    n3: '3',
    n4: '4',
    n5: '5',
  });
});



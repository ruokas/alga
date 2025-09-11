const mockUpdateChart = jest.fn((chart, cb) => { if (chart && cb) cb(chart); });
jest.mock('../chart-utils.js', () => ({ updateChart: mockUpdateChart }));

jest.mock('../theme.js', () => ({ initThemeToggle: jest.fn() }));

jest.mock('../zones.js', () => ({
  initZones: jest.fn(() => ({
    renderZoneSelect: jest.fn(),
    setDefaultCapacity: jest.fn(),
    openZoneModal: jest.fn(),
    closeZoneModal: jest.fn(),
    addZone: jest.fn(),
    saveZonesAndClose: jest.fn(),
    resetToDefaults: jest.fn(),
    getZones: jest.fn(() => []),
  })),
}));

jest.mock('../simulation.js', () => ({
  simulateEsiCounts: jest.fn(() => ({ total: 0, counts: [0,0,0,0,0] })),
}));

function setupDOM(){
  const inputIds = [
    'date','shift','zone','zoneCapacity','patientCount','formula',
    'maxCoefficient','shiftHours','monthHours','baseRateDoc','baseRateNurse','baseRateAssist',
    'esi1','esi2','esi3','esi4','esi5'
  ];
  const checkboxIds = ['linkPatientCount'];
  const textIds = [
    'formulaInfo','ratio','sShare','vBonus','aBonus','maxCoefficientCell','kZona',
    'baseDocCell','kDocCell','finalDocCell','shiftDocCell','monthDocCell','deltaDocCell',
    'baseNurseCell','kNurseCell','finalNurseCell','shiftNurseCell','monthNurseCell','deltaNurseCell',
    'baseAssistCell','kAssistCell','finalAssistCell','shiftAssistCell','monthAssistCell','deltaAssistCell',
    'rateTbody','extraRoles'
  ];
  const buttonIds = [
    'simulateEsi','reset','copy','downloadCsv','downloadPdf','manageZones','addZone','saveZonesBtn',
    'defaultsZones','closeZoneModal','saveRateTemplate','loadRateTemplate','addRateRole','budgetPlanner'
  ];
  let html = '';
  inputIds.forEach(id => {
    if (id === 'formula') {
      html += '<select id="formula"><option value="legacy">legacy</option><option value="ladder">ladder</option></select>';
    } else {
      html += `<input id="${id}" />`;
    }
  });
  checkboxIds.forEach(id => { html += `<input type="checkbox" id="${id}" />`; });
  textIds.forEach(id => { html += `<div id="${id}"></div>`; });
  buttonIds.forEach(id => { html += `<button id="${id}"></button>`; });
  html += '<div id="zoneModal"></div><div id="zoneTbody"></div>';
  document.body.innerHTML = html;
}

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  jest.resetModules();
});

test('updates formulaInfo when switching formulas', () => {
  setupDOM();
  require('../ui.js');
  const info = document.getElementById('formulaInfo');
  expect(info.innerHTML).toContain('V<sub>priedas</sub>');
  const formula = document.getElementById('formula');
  formula.value = 'ladder';
  formula.dispatchEvent(new Event('change'));
  expect(info.innerHTML).toContain('<th>R</th><th>V</th>');
  expect(info.innerHTML).toContain('<th>S</th><th>A</th>');
  formula.value = 'legacy';
  formula.dispatchEvent(new Event('change'));
  expect(info.innerHTML).toContain('V<sub>priedas</sub>');
});

export function getElements() {
  const els = {
    date: document.getElementById('date'),
    shift: document.getElementById('shift'),
    zone: document.getElementById('zone'),
    zoneCapacity: document.getElementById('zoneCapacity') || document.getElementById('capacity'),
    patientCount: document.getElementById('patientCount') || document.getElementById('N'),
    maxCoefficient: document.getElementById('maxCoefficient') || document.getElementById('kmax'),
    shiftHours: document.getElementById('shiftHours'),
    monthHours: document.getElementById('monthHours'),
    baseRateDoc: document.getElementById('baseRateDoc'),
    baseRateNurse: document.getElementById('baseRateNurse'),
    baseRateAssist: document.getElementById('baseRateAssist'),
    linkPatientCount: document.getElementById('linkPatientCount') || document.getElementById('linkN'),
    esi1: document.getElementById('esi1'),
    esi2: document.getElementById('esi2'),
    esi3: document.getElementById('esi3'),
    esi4: document.getElementById('esi4'),
    esi5: document.getElementById('esi5'),
    ratio: document.getElementById('ratio'),
    sShare: document.getElementById('sShare'),
    ratioCanvas: document.getElementById('ratioChart'),
    sCanvas: document.getElementById('sChart'),
    vBonus: document.getElementById('vBonus'),
    aBonus: document.getElementById('aBonus'),
    maxCoefficientCell: document.getElementById('maxCoefficientCell') || document.getElementById('kMaxCell'),
    kZona: document.getElementById('kZona'),
    baseDocCell: document.getElementById('baseDocCell'),
    kDocCell: document.getElementById('kDocCell'),
    finalDocCell: document.getElementById('finalDocCell'),
    shiftDocCell: document.getElementById('shiftDocCell'),
    monthDocCell: document.getElementById('monthDocCell'),
    deltaDocCell: document.getElementById('deltaDocCell'),
    baseNurseCell: document.getElementById('baseNurseCell'),
    kNurseCell: document.getElementById('kNurseCell'),
    finalNurseCell: document.getElementById('finalNurseCell'),
    shiftNurseCell: document.getElementById('shiftNurseCell'),
    monthNurseCell: document.getElementById('monthNurseCell'),
    deltaNurseCell: document.getElementById('deltaNurseCell'),
    baseAssistCell: document.getElementById('baseAssistCell'),
    kAssistCell: document.getElementById('kAssistCell'),
    finalAssistCell: document.getElementById('finalAssistCell'),
    shiftAssistCell: document.getElementById('shiftAssistCell'),
    monthAssistCell: document.getElementById('monthAssistCell'),
    deltaAssistCell: document.getElementById('deltaAssistCell'),
    simulateEsi: document.getElementById('simulateEsi'),
    days: document.getElementById('days'),
    simulatePeriod: document.getElementById('simulatePeriod'),
    reset: document.getElementById('reset'),
    copy: document.getElementById('copy'),
    downloadCsv: document.getElementById('downloadCsv'),
    downloadPdf: document.getElementById('downloadPdf'),
    manageZones: document.getElementById('manageZones'),
    zoneModal: document.getElementById('zoneModal'),
    zoneTbody: document.getElementById('zoneTbody'),
    addZone: document.getElementById('addZone'),
    saveZonesBtn: document.getElementById('saveZonesBtn'),
    defaultsZones: document.getElementById('defaultsZones'),
    closeZoneModal: document.getElementById('closeZoneModal'),
    saveRateTemplate: document.getElementById('saveRateTemplate'),
    loadRateTemplate: document.getElementById('loadRateTemplate'),
    payCanvas: document.getElementById('payChart'),
    flowCanvas: document.getElementById('flowChart'),
    forecastCanvas: document.getElementById('forecastChart'),
    forecast: document.getElementById('forecast'),
    budgetPlanner: document.getElementById('budgetPlanner'),
  };

  // Legacy aliases
  els.capacity = els.zoneCapacity;
  els.N = els.patientCount;
  els.kmax = els.maxCoefficient;
  els.linkN = els.linkPatientCount;
  els.kMaxCell = els.maxCoefficientCell;

  return els;
}

export function bindEvents(els, handlers) {
  const {
    compute,
    handleShiftChange,
    setDefaultCapacity,
    simulateEsi,
    simulatePeriodUi,
    forecastPeriodUi,
    resetAll,
    copy,
    downloadCsv,
    downloadPdf,
    openZoneModal,
    addZone,
    saveZonesAndClose,
    resetToDefaults,
    closeZoneModal,
    saveRateTemplate,
    loadRateTemplate,
    goToBudgetPlanner,
  } = handlers;

  ['input','change'].forEach(evt => {
    [
      'date','zone','zoneCapacity','patientCount','maxCoefficient','shiftHours','monthHours','baseRateDoc','baseRateNurse','baseRateAssist','linkPatientCount','esi1','esi2','esi3','esi4','esi5'
    ].forEach(id => {
      const el = els[id];
      if (el) el.addEventListener(evt, compute);
    });
  });
  els.shift.addEventListener('change', handleShiftChange);
  els.zone.addEventListener('change', setDefaultCapacity);
  els.simulateEsi.addEventListener('click', e => { e.preventDefault(); simulateEsi(); });
  if (els.simulatePeriod) {
    els.simulatePeriod.addEventListener('click', e => { e.preventDefault(); simulatePeriodUi(); });
  }
  if (els.forecast) {
    els.forecast.addEventListener('click', e => { e.preventDefault(); forecastPeriodUi(); });
  }
  els.reset.addEventListener('click', e => { e.preventDefault(); resetAll(); });
  els.copy.addEventListener('click', e => { e.preventDefault(); copy(); });
  els.downloadCsv.addEventListener('click', e => { e.preventDefault(); downloadCsv(); });
  els.downloadPdf.addEventListener('click', e => { e.preventDefault(); downloadPdf(); });

  els.manageZones.addEventListener('click', openZoneModal);
  els.addZone.addEventListener('click', addZone);
  els.saveZonesBtn.addEventListener('click', saveZonesAndClose);
  els.defaultsZones.addEventListener('click', resetToDefaults);
  els.closeZoneModal.addEventListener('click', closeZoneModal);

  els.saveRateTemplate.addEventListener('click', e => { e.preventDefault(); saveRateTemplate(); });
  els.loadRateTemplate.addEventListener('click', e => { e.preventDefault(); loadRateTemplate(); });

  if (els.budgetPlanner) {
    els.budgetPlanner.addEventListener('click', e => { e.preventDefault(); goToBudgetPlanner(); });
  }

  const grid = document.querySelector('.calc-grid');
  const resizer = document.querySelector('.resizer');
  if (grid && resizer) {
    const RESIZER_WIDTH = resizer.getBoundingClientRect().width || 5;
    let startX = 0;
    let startLeft = 0;
    function onMouseMove(e) {
      const dx = e.clientX - startX;
      const total = grid.getBoundingClientRect().width;
      const newLeft = startLeft + dx;
      const newRight = total - newLeft - RESIZER_WIDTH;
      if (newLeft > 0 && newRight > 0) {
        grid.style.gridTemplateColumns = `${newLeft}px ${RESIZER_WIDTH}px ${newRight}px`;
      }
    }
    function stop() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', stop);
    }
    resizer.addEventListener('mousedown', e => {
      if (window.innerWidth < 960) return;
      e.preventDefault();
      startX = e.clientX;
      startLeft = grid.children[0].getBoundingClientRect().width;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', stop);
    });
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined') {
  module.exports = { getElements, bindEvents };
}


const { test, expect } = require('@playwright/test');
const path = require('path');

const fileUrl = 'file://' + path.resolve(__dirname, '../index.html');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.Chart = class {
      constructor() {
        return { data: { datasets: [{ data: [] }] }, update() {}, destroy() {} };
      }
    };
    window.jspdf = {
      jsPDF: class {
        constructor() {}
        setFontSize() {}
        text() {}
        save(name) { window.__pdfSaved = name; }
      }
    };
  });
  await page.goto(fileUrl);
});

test('updates final salary based on user input', async ({ page }) => {
  await page.fill('#zoneCapacity', '10');
  await page.fill('#patientCount', '20');
  await page.fill('#esi1', '3');
  await page.fill('#esi2', '2');
  await page.fill('#baseRateDoc', '10');
  const kZona = await page.textContent('#kZona');
  expect(kZona.trim()).toBe('1.25');
  const finalDocText = await page.textContent('#finalDocCell');
  const finalDoc = parseFloat(finalDocText.replace(/[^0-9,-]/g, '').replace(',', '.'));
  expect(finalDoc).toBeCloseTo(12.5, 1);
});

test('adds new zone through zone management modal', async ({ page }) => {
  await page.click('#manageZones');
  await page.click('#addZone');
  await page.click('#saveZonesBtn');
  await page.selectOption('#zone', { label: 'Nauja zona' });
  const selectedLabel = await page.$eval('#zone', el => el.options[el.selectedIndex].textContent);
  expect(selectedLabel).toBe('Nauja zona');
});

test('triggers CSV and PDF exports', async ({ page }) => {
  await page.fill('#zoneCapacity', '10');
  await page.fill('#patientCount', '20');
  await page.fill('#esi1', '3');
  await page.fill('#esi2', '2');
  await page.fill('#baseRateDoc', '10');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#downloadCsv'),
  ]);
  expect(download.suggestedFilename()).toBe('salary_calc.csv');
  await page.click('#downloadPdf');
  const pdfSaved = await page.evaluate(() => window.__pdfSaved);
  expect(pdfSaved).toBe('salary_calc.pdf');
});

const { rowsToCsv } = require('../csv');

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

test('handles commas in zone_label', () => {
  const data = {
    date: '2024-01-01',
    shift: 'D',
    zone: 'RED',
    zone_label: 'Critical, Red Zone',
    capacity: 20,
    N: 10,
    ESI: { n1: 1, n2: 2, n3: 3, n4: 4, n5: 0 },
    ratio: 0.5,
    S: 0.3,
    V_bonus: 0.1,
    A_bonus: 0.05,
    K_max: 1.3,
    K_zona: 1.15,
    shift_hours: 8,
    month_hours: 160,
    base_rates: { doctor: 1, nurse: 1, assistant: 1 },
    final_rates: { doctor: 1.1, nurse: 1.1, assistant: 1.1 },
    shift_salary: { doctor: 8, nurse: 8, assistant: 8 },
    month_salary: { doctor: 160, nurse: 160, assistant: 160 },
  };

  const rows = [
    ['date', data.date],
    ['shift', data.shift],
    ['zone', data.zone],
    ['zone_label', data.zone_label],
    ['capacity', data.capacity],
    ['N', data.N],
    ['ESI1', data.ESI.n1],
    ['ESI2', data.ESI.n2],
    ['ESI3', data.ESI.n3],
    ['ESI4', data.ESI.n4],
    ['ESI5', data.ESI.n5],
    ['ratio', data.ratio],
    ['S', data.S],
    ['V_bonus', data.V_bonus],
    ['A_bonus', data.A_bonus],
    ['K_max', data.K_max],
    ['K_zona', data.K_zona],
    ['shift_hours', data.shift_hours],
    ['month_hours', data.month_hours],
    ['base_rate_doctor', data.base_rates.doctor],
    ['base_rate_nurse', data.base_rates.nurse],
    ['base_rate_assistant', data.base_rates.assistant],
    ['final_rate_doctor', data.final_rates.doctor],
    ['final_rate_nurse', data.final_rates.nurse],
    ['final_rate_assistant', data.final_rates.assistant],
    ['shift_salary_doctor', data.shift_salary.doctor],
    ['shift_salary_nurse', data.shift_salary.nurse],
    ['shift_salary_assistant', data.shift_salary.assistant],
    ['month_salary_doctor', data.month_salary.doctor],
    ['month_salary_nurse', data.month_salary.nurse],
    ['month_salary_assistant', data.month_salary.assistant],
  ];

  const csv = rowsToCsv(rows);
  const values = parseCsvLine(csv.split('\n')[1]);
  expect(values.length).toBe(rows.length);
  expect(values[3]).toBe(data.zone_label);
});

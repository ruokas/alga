function rowsToCsv(rows) {
  const headers = rows.map(r => r[0]).join(',');
  const values = rows
    .map(r => {
      const val = r[1];
      const safe = (val === null || val === undefined ? '' : String(val)).replace(/"/g, '""');
      return `"${safe}"`;
    })
    .join(',');
  return `${headers}\n${values}`;
}

function dataToCsv(data) {
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
  ];

  if (Array.isArray(data.roles)) {
    for (const r of data.roles) {
      const id = r.id;
      rows.push([`base_rate_${id}`, data.base_rates[id]]);
      rows.push([`final_rate_${id}`, data.final_rates[id]]);
      rows.push([`shift_salary_${id}`, data.shift_salary[id]]);
      rows.push([`month_salary_${id}`, data.month_salary[id]]);
    }
  }

  return rowsToCsv(rows);
}

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

function csvToData(csv) {
  const [headerLine, valueLine] = csv.trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);
  const values = parseCsvLine(valueLine);
  const data = {
    ESI: {},
    base_rates: {},
    final_rates: {},
    shift_salary: {},
    month_salary: {},
    roles: [],
  };
  for (let i = 0; i < headers.length; i++) {
    const key = headers[i];
    const val = values[i];
    if (key.startsWith('ESI')) {
      data.ESI[`n${key.slice(3)}`] = Number(val);
    } else if (key.startsWith('base_rate_')) {
      const id = key.replace('base_rate_', '');
      data.base_rates[id] = Number(val);
      if (!data.roles.find(r => r.id === id)) data.roles.push({ id });
    } else if (key.startsWith('final_rate_')) {
      const id = key.replace('final_rate_', '');
      data.final_rates[id] = Number(val);
      if (!data.roles.find(r => r.id === id)) data.roles.push({ id });
    } else if (key.startsWith('shift_salary_')) {
      const id = key.replace('shift_salary_', '');
      data.shift_salary[id] = Number(val);
      if (!data.roles.find(r => r.id === id)) data.roles.push({ id });
    } else if (key.startsWith('month_salary_')) {
      const id = key.replace('month_salary_', '');
      data.month_salary[id] = Number(val);
      if (!data.roles.find(r => r.id === id)) data.roles.push({ id });
    } else if (key === 'date' || key === 'shift' || key === 'zone' || key === 'zone_label') {
      data[key] = val;
    } else if (key === 'capacity' || key === 'N' || key === 'ratio' || key === 'S' || key === 'V_bonus' || key === 'A_bonus' || key === 'K_max' || key === 'K_zona' || key === 'shift_hours' || key === 'month_hours') {
      data[key] = Number(val);
    }
  }
  return data;
}

const exported = { rowsToCsv, dataToCsv, csvToData };

if (typeof module !== 'undefined') {
  module.exports = exported;
}

if (typeof window !== 'undefined') {
  window.csvUtils = exported;
}

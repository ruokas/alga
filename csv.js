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

const exported = { rowsToCsv };

if (typeof module !== 'undefined') {
  module.exports = exported;
}

if (typeof window !== 'undefined') {
  window.csvUtils = exported;
}

// CSV for the admin exports. Cells that start with = + - @ (or tab / CR) get a leading ' so a
// spreadsheet never runs them as formulas (CSV injection).
const cell = (v) => {
  if (v === null || v === undefined) return '';
  let s = v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// columns: [{ header, value: (row) => any }]
function toCsv(rows, columns) {
  const lines = [columns.map((c) => cell(c.header)).join(',')];
  for (const r of rows) lines.push(columns.map((c) => cell(c.value(r))).join(','));
  // BOM so Excel opens ₹ and non-English names correctly.
  return '﻿' + lines.join('\r\n');
}

function sendCsv(res, name, rows, columns) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${name}-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(toCsv(rows, columns));
}

module.exports = { toCsv, sendCsv, cell };

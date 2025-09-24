const fs = require('node:fs/promises');
const path = require('node:path');

const { normalizeLicenseRecord } = require('../../services/normalizers');

function splitCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells.map((value) => value.replace(/^"|"$/g, ''));
}

function parseCsv(content) {
  const rows = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (rows.length === 0) {
    return [];
  }
  const headers = splitCsvLine(rows[0]).map((header) => header.trim());
  const records = [];
  for (let i = 1; i < rows.length; i += 1) {
    const cells = splitCsvLine(rows[i]);
    if (cells.length === 0 || cells.every((cell) => cell.length === 0)) {
      continue;
    }
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = cells[index] ?? '';
    });
    records.push(entry);
  }
  return records;
}

function createCsvProvider(csvPath) {
  const absolutePath = path.isAbsolute(csvPath)
    ? csvPath
    : path.join(process.cwd(), csvPath);

  return {
    async getLicenses() {
      const content = await fs.readFile(absolutePath, 'utf8');
      const rawRecords = parseCsv(content);
      return rawRecords.map((record) => normalizeLicenseRecord(record));
    },
  };
}

module.exports = {
  createCsvProvider,
  parseCsv,
  splitCsvLine,
};

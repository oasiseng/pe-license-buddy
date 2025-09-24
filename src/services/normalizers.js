const crypto = require('node:crypto');

function normalizeDate(value) {
  if (!value) {
    return '';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return parsed.toISOString().slice(0, 10);
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const numeric = Number.parseFloat(String(value));
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return numeric;
}

function normalizeLicenseRecord(rawRecord) {
  const firmName = rawRecord.firm_name || rawRecord.firmName || '';
  const licenseNumber = rawRecord.license_number || rawRecord.licenseNumber || '';
  const state = rawRecord.state || '';
  const expirationDate = normalizeDate(rawRecord.expiration_date || rawRecord.expirationDate);
  const status = rawRecord.status || '';
  const ceuRequired = normalizeNumber(rawRecord.ceu_required || rawRecord.ceuRequired);
  const ceuCompleted = normalizeNumber(rawRecord.ceu_completed || rawRecord.ceuCompleted);
  const holderName = rawRecord.holder_name || rawRecord.holderName || '';
  const verificationUrl = rawRecord.verification_url || rawRecord.verificationUrl || '';
  const idSeed = [firmName, licenseNumber, state].filter(Boolean).join('-');

  return {
    id: rawRecord.id || crypto.createHash('sha1').update(idSeed).digest('hex').slice(0, 12),
    firmName,
    licenseNumber,
    state,
    status,
    expirationDate,
    ceuRequired,
    ceuCompleted,
    holderName,
    verificationUrl,
  };
}

module.exports = {
  normalizeLicenseRecord,
  normalizeDate,
  normalizeNumber,
};

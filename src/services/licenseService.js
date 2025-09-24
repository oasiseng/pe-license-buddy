const { normalizeLicenseRecord } = require('./normalizers');

function daysBetween(start, end) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((end - start) / msPerDay);
}

function enrichLicense(record, options) {
  const today = options.today || new Date();
  const expiration = record.expirationDate ? new Date(record.expirationDate) : null;
  let daysUntilExpiration = null;
  let isExpired = false;
  let isExpiringSoon = false;
  if (expiration && !Number.isNaN(expiration.getTime())) {
    daysUntilExpiration = daysBetween(today, expiration);
    isExpired = daysUntilExpiration < 0;
    const threshold = options.reminderWindowDays ?? 30;
    isExpiringSoon = !isExpired && daysUntilExpiration <= threshold;
  }
  const ceuRemaining = record.ceuRequired ? Math.max(record.ceuRequired - record.ceuCompleted, 0) : null;

  return {
    ...record,
    daysUntilExpiration,
    isExpired,
    isExpiringSoon,
    ceuRemaining,
  };
}

function createLicenseService(provider, options = {}) {
  const reminderWindowDays = options.reminderWindowDays ?? 30;
  const now = options.now || (() => new Date());

  async function listLicenses() {
    const licenses = await provider.getLicenses();
    const normalized = licenses.map((record) => normalizeLicenseRecord(record));
    const today = now();
    const enriched = normalized.map((record) => enrichLicense(record, { reminderWindowDays, today }));
    return enriched.sort((a, b) => {
      if (!a.expirationDate && !b.expirationDate) {
        return a.firmName.localeCompare(b.firmName);
      }
      if (!a.expirationDate) {
        return 1;
      }
      if (!b.expirationDate) {
        return -1;
      }
      return new Date(a.expirationDate) - new Date(b.expirationDate);
    });
  }

  async function getExpiringLicenses(withinDays = reminderWindowDays) {
    const licenses = await listLicenses();
    return licenses.filter((license) => {
      if (license.daysUntilExpiration === null) {
        return false;
      }
      return license.daysUntilExpiration >= 0 && license.daysUntilExpiration <= withinDays;
    });
  }

  async function getExpiredLicenses() {
    const licenses = await listLicenses();
    return licenses.filter((license) => license.isExpired);
  }

  async function summarizeCeuProgress() {
    const licenses = await listLicenses();
    const summary = {};
    for (const license of licenses) {
      const state = license.state || 'Unknown';
      if (!summary[state]) {
        summary[state] = {
          state,
          required: 0,
          completed: 0,
        };
      }
      summary[state].required += license.ceuRequired;
      summary[state].completed += license.ceuCompleted;
    }
    return Object.values(summary).map((entry) => ({
      ...entry,
      remaining: Math.max(entry.required - entry.completed, 0),
    }));
  }

  return {
    listLicenses,
    getExpiringLicenses,
    getExpiredLicenses,
    summarizeCeuProgress,
  };
}

module.exports = {
  createLicenseService,
  enrichLicense,
  daysBetween,
};

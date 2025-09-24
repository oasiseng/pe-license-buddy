const test = require('node:test');
const assert = require('node:assert/strict');

const { createLicenseService, enrichLicense } = require('../src/services/licenseService');

const mockProvider = {
  async getLicenses() {
    return [
      {
        id: '1',
        firmName: 'Test Firm',
        licenseNumber: 'LIC-1',
        state: 'FL',
        status: 'Active',
        expirationDate: '2024-12-31',
        ceuRequired: 18,
        ceuCompleted: 10,
      },
      {
        id: '2',
        firmName: 'Test Firm',
        licenseNumber: 'LIC-2',
        state: 'GA',
        status: 'Expired',
        expirationDate: '2022-01-01',
        ceuRequired: 15,
        ceuCompleted: 15,
      },
      {
        id: '3',
        firmName: 'Test Firm',
        licenseNumber: 'LIC-3',
        state: 'NC',
        status: 'Active',
        expirationDate: '',
        ceuRequired: 0,
        ceuCompleted: 0,
      },
    ];
  },
};

test('enrichLicense calculates days until expiration and CEU remaining', () => {
  const today = new Date('2024-01-01');
  const record = {
    id: '1',
    firmName: 'Test Firm',
    licenseNumber: 'LIC-1',
    state: 'FL',
    status: 'Active',
    expirationDate: '2024-01-31',
    ceuRequired: 18,
    ceuCompleted: 10,
  };
  const enriched = enrichLicense(record, { today, reminderWindowDays: 60 });
  assert.equal(enriched.daysUntilExpiration, 30);
  assert.equal(enriched.isExpired, false);
  assert.equal(enriched.isExpiringSoon, true);
  assert.equal(enriched.ceuRemaining, 8);
});

test('license service filters expiring licenses within window', async () => {
  const service = createLicenseService(mockProvider, {
    reminderWindowDays: 45,
    now: () => new Date('2024-01-01'),
  });
  const expiring = await service.getExpiringLicenses(400); // large window for predictability
  assert.equal(expiring.length, 1);
  assert.equal(expiring[0].licenseNumber, 'LIC-1');
});

test('license service returns expired licenses', async () => {
  const service = createLicenseService(mockProvider, {
    reminderWindowDays: 45,
    now: () => new Date('2024-01-01'),
  });
  const expired = await service.getExpiredLicenses();
  assert.equal(expired.length, 1);
  assert.equal(expired[0].licenseNumber, 'LIC-2');
});

test('summarizeCeuProgress aggregates by state', async () => {
  const service = createLicenseService(mockProvider, {
    reminderWindowDays: 45,
    now: () => new Date('2024-01-01'),
  });
  const summary = await service.summarizeCeuProgress();
  const fl = summary.find((entry) => entry.state === 'FL');
  assert(fl);
  assert.equal(fl.required, 18);
  assert.equal(fl.completed, 10);
});

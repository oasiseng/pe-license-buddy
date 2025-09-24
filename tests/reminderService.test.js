const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

const { createReminderService } = require('../src/services/reminderService');

const sampleLicense = {
  id: 'abc123',
  firmName: 'Oasis Engineering LLC',
  licenseNumber: 'PE-0001',
  state: 'FL',
  status: 'Active',
  expirationDate: '2024-04-01',
  ceuRemaining: 5,
  verificationUrl: 'https://example.com',
};

test('prepareReminderPayloads generates readable messages', async () => {
  const reminderService = createReminderService({
    licenseService: {
      async getExpiringLicenses() {
        return [sampleLicense];
      },
    },
    defaultLookAheadDays: 30,
  });

  const payloads = await reminderService.prepareReminderPayloads(30);
  assert.equal(payloads.length, 1);
  assert.match(payloads[0].message, /Oasis Engineering LLC/);
  assert.match(payloads[0].message, /License PE-0001/);
});

test('writeEmailDrafts saves drafts to the outbox directory', async () => {
  const reminderService = createReminderService({
    licenseService: {
      async getExpiringLicenses() {
        return [];
      },
    },
    emailSender: 'compliance@example.com',
    defaultLookAheadDays: 30,
  });

  const payloads = [
    {
      license: sampleLicense,
      message: 'Test reminder',
      subject: 'Reminder Subject',
    },
  ];

  const outboxPath = path.join(process.cwd(), 'outbox');
  const before = await fs.readdir(outboxPath).catch(() => []);

  const result = await reminderService.writeEmailDrafts(payloads, ['team@example.com']);
  assert.equal(result.sent, 1);

  const after = await fs.readdir(outboxPath);
  const newFiles = after.filter((file) => !before.includes(file));
  assert.equal(newFiles.length, 1);

  await Promise.all(newFiles.map((file) => fs.unlink(path.join(outboxPath, file))));
});

test('dispatchReminders handles missing channels gracefully', async () => {
  const reminderService = createReminderService({
    licenseService: {
      async getExpiringLicenses() {
        return [sampleLicense];
      },
    },
    defaultLookAheadDays: 30,
  });

  const result = await reminderService.dispatchReminders({
    withinDays: 30,
    channels: {},
  });

  assert.equal(result.reminders, 1);
  assert.equal(result.results[0].channel, 'none');
});

test('sendOpenPhoneMessages reports missing configuration', async () => {
  const reminderService = createReminderService({
    licenseService: {
      async getExpiringLicenses() {
        return [sampleLicense];
      },
    },
    defaultLookAheadDays: 30,
  });

  const payloads = await reminderService.prepareReminderPayloads(30);
  const result = await reminderService.sendOpenPhoneMessages(payloads);
  assert.equal(result.channel, 'openphone');
  assert.equal(result.sent, 0);
  assert.equal(result.reason, 'Missing OpenPhone configuration');
});

const config = require('./config');
const { createLicenseDataProvider } = require('./data/providerFactory');
const { createLicenseService } = require('./services/licenseService');
const { createReminderService } = require('./services/reminderService');
const { createServer } = require('./api/server');
const { startReminderScheduler } = require('./reminders/scheduler');

async function bootstrap() {
  try {
    const provider = createLicenseDataProvider(config);
    const licenseService = createLicenseService(provider, {
      reminderWindowDays: config.reminderLookAheadDays,
    });
    const reminderService = createReminderService({
      licenseService,
      openPhoneConfig: config.openPhone,
      emailSender: config.emailSender,
      defaultEmailRecipients: config.emailRecipients,
      defaultLookAheadDays: config.reminderLookAheadDays,
    });

    const server = createServer({ licenseService, reminderService });
    server.listen(config.port, () => {
      console.log(`PE License Buddy API listening on port ${config.port}`);
    });

    if (config.enableScheduler) {
      startReminderScheduler({
        reminderService,
        lookAheadDays: config.reminderLookAheadDays,
        intervalMinutes: config.schedulerIntervalMinutes,
        channels: {
          openphone: config.openPhone && (config.openPhone.apiKey || config.openPhone.toNumbers.length)
            ? config.openPhone
            : null,
          email: config.emailRecipients.length > 0
            ? { recipients: config.emailRecipients }
            : null,
        },
      });
    }
  } catch (error) {
    console.error('Failed to start PE License Buddy', error);
    process.exitCode = 1;
  }
}

bootstrap();

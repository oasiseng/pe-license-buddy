const fs = require('node:fs/promises');
const path = require('node:path');
const https = require('node:https');
const { URL } = require('node:url');

function formatDate(dateString) {
  if (!dateString) {
    return 'Unknown date';
  }
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown date';
  }
  return parsed.toISOString().slice(0, 10);
}

function sanitizeForFilename(value) {
  return value.replace(/[^a-z0-9-_]/gi, '_').slice(0, 50);
}

function postJson(webhookUrl, payload, options = {}) {
  const {
    headers = {},
    errorContext = 'Request failed',
    method = 'POST',
  } = options;
  return new Promise((resolve, reject) => {
    const url = new URL(webhookUrl);
    const request = https.request(
      {
        method,
        hostname: url.hostname,
        path: url.pathname + url.search,
        protocol: url.protocol,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      },
      (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
            resolve({ statusCode: response.statusCode, body: data });
          } else {
            reject(new Error(`${errorContext} (status ${response.statusCode}): ${data}`));
          }
        });
      },
    );

    request.on('error', (error) => {
      reject(error);
    });

    request.write(JSON.stringify(payload));
    request.end();
  });
}

function createReminderService(options) {
  const {
    licenseService,
    openPhoneConfig = {},
    emailSender = '',
    defaultEmailRecipients = [],
    defaultLookAheadDays = 30,
  } = options;

  async function prepareReminderPayloads(withinDays = defaultLookAheadDays) {
    const expiringLicenses = await licenseService.getExpiringLicenses(withinDays);
    return expiringLicenses.map((license) => {
      const expirationDate = formatDate(license.expirationDate);
      const ceuLine = license.ceuRemaining !== null
        ? `CEUs remaining: ${license.ceuRemaining}`
        : 'CEUs remaining: not tracked';
      const message = [
        `License ${license.licenseNumber} (${license.state}) for ${license.firmName} is due on ${expirationDate}.`,
        `Status: ${license.status || 'Unknown'}.`,
        ceuLine,
        license.verificationUrl ? `Verification URL: ${license.verificationUrl}` : null,
      ]
        .filter(Boolean)
        .join('\n');
      return {
        license,
        message,
        subject: `License renewal reminder: ${license.firmName} (${license.state})`,
      };
    });
  }

  function normalizeRecipients(value) {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    return String(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async function sendOpenPhoneMessages(payloads, optionsOverride = {}) {
    const optionsToUse = {
      endpoint: 'https://api.openphone.com/v1/messages',
      ...openPhoneConfig,
      ...(typeof optionsOverride === 'object' && optionsOverride !== null ? optionsOverride : {}),
    };

    if (typeof optionsOverride === 'string') {
      optionsToUse.toNumbers = normalizeRecipients(optionsOverride);
    } else if (Array.isArray(optionsOverride)) {
      optionsToUse.toNumbers = normalizeRecipients(optionsOverride);
    }

    const {
      apiKey = '',
      fromNumber = '',
      toNumbers = [],
      endpoint,
      headers: extraHeaders = {},
    } = optionsToUse;

    const recipients = normalizeRecipients(toNumbers);
    const recipientCount = recipients.length || 1;
    const totalAttempts = payloads.length * recipientCount;

    if (!apiKey || !fromNumber || recipients.length === 0) {
      return {
        channel: 'openphone',
        sent: 0,
        skipped: totalAttempts,
        reason: 'Missing OpenPhone configuration',
      };
    }

    let sent = 0;
    const errors = [];

    for (const payload of payloads) {
      for (const recipient of recipients) {
        try {
          await postJson(
            endpoint,
            {
              to: recipient,
              from: fromNumber,
              text: payload.message,
            },
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                ...extraHeaders,
              },
              errorContext: 'OpenPhone API request failed',
            },
          );
          sent += 1;
        } catch (error) {
          errors.push({
            licenseId: payload.license.id || payload.license.licenseNumber || null,
            recipient,
            message: error.message,
          });
        }
      }
    }

    return {
      channel: 'openphone',
      sent,
      skipped: totalAttempts - sent,
      errors,
    };
  }

  async function writeEmailDrafts(payloads, recipients = defaultEmailRecipients) {
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return { channel: 'email', sent: 0, skipped: payloads.length, reason: 'Missing recipients' };
    }
    const outboxDirectory = path.join(process.cwd(), 'outbox');
    await fs.mkdir(outboxDirectory, { recursive: true });
    let index = 0;
    for (const payload of payloads) {
      index += 1;
      const filename = `${Date.now()}_${index}_${sanitizeForFilename(payload.license.licenseNumber || 'license')}.txt`;
      const filePath = path.join(outboxDirectory, filename);
      const emailContent = [
        `From: ${emailSender || 'notifications@example.com'}`,
        `To: ${recipients.join(', ')}`,
        `Subject: ${payload.subject}`,
        '',
        payload.message,
      ].join('\n');
      await fs.writeFile(filePath, emailContent, 'utf8');
    }
    return {
      channel: 'email',
      sent: payloads.length,
      skipped: 0,
      errors: [],
      outboxDirectory,
    };
  }

  async function dispatchReminders(options = {}) {
    const withinDays = options.withinDays ?? defaultLookAheadDays;
    const payloads = await prepareReminderPayloads(withinDays);
    const channels = options.channels || {};
    const results = [];

    const openPhoneOption = channels.openphone || channels.openPhone;
    if (openPhoneOption) {
      results.push(await sendOpenPhoneMessages(payloads, openPhoneOption));
    }

    const emailOption = channels.email;
    if (emailOption) {
      let recipients = defaultEmailRecipients;
      if (Array.isArray(emailOption)) {
        recipients = emailOption;
      } else if (typeof emailOption === 'object') {
        recipients = emailOption.recipients || defaultEmailRecipients;
      }
      results.push(await writeEmailDrafts(payloads, recipients));
    }

    if (results.length === 0) {
      return {
        reminders: payloads.length,
        results: [{ channel: 'none', sent: 0, skipped: payloads.length, reason: 'No channels selected' }],
      };
    }
    return {
      reminders: payloads.length,
      results,
    };
  }

  return {
    prepareReminderPayloads,
    sendOpenPhoneMessages,
    writeEmailDrafts,
    dispatchReminders,
  };
}

module.exports = {
  createReminderService,
  formatDate,
  sanitizeForFilename,
  postJson,
};

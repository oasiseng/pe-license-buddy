const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

function parseBoolean(value, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) {
    return false;
  }
  return defaultValue;
}

function readEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) {
      continue;
    }
    const [rawKey, ...rawValue] = line.split('=');
    if (!rawKey) {
      continue;
    }
    const key = rawKey.trim();
    const value = rawValue.join('=').trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

readEnvFile();

const config = {
  port: Number.parseInt(process.env.PORT || '4000', 10),
  dataSource: (process.env.DATA_SOURCE || 'csv').toLowerCase(),
  csvPath: process.env.CSV_PATH || path.join(process.cwd(), 'schemas', 'licenses.csv'),
  reminderLookAheadDays: Number.parseInt(process.env.REMINDER_LOOKAHEAD_DAYS || '30', 10),
  enableScheduler: parseBoolean(process.env.ENABLE_SCHEDULER, false),
  schedulerIntervalMinutes: Number.parseInt(process.env.SCHEDULER_INTERVAL_MINUTES || '1440', 10),
  emailSender: process.env.EMAIL_SENDER || '',
  emailRecipients: (process.env.EMAIL_RECIPIENTS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
  openPhone: {
    apiKey: process.env.OPENPHONE_API_KEY || '',
    fromNumber: process.env.OPENPHONE_FROM_NUMBER || '',
    toNumbers: (process.env.OPENPHONE_TO_NUMBERS || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  },
  airtable: {
    apiKey: process.env.AIRTABLE_API_KEY || '',
    baseId: process.env.AIRTABLE_BASE_ID || '',
    tableName: process.env.AIRTABLE_TABLE || 'Licenses',
    view: process.env.AIRTABLE_VIEW || '',
  },
};

module.exports = config;

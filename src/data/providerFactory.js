const { createCsvProvider } = require('./providers/csvProvider');
const { createAirtableProvider } = require('./providers/airtableProvider');

function createLicenseDataProvider(config) {
  if (config.dataSource === 'airtable') {
    return createAirtableProvider(config.airtable);
  }
  return createCsvProvider(config.csvPath);
}

module.exports = {
  createLicenseDataProvider,
};

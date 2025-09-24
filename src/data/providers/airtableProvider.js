const https = require('node:https');
const { normalizeLicenseRecord } = require('../../services/normalizers');

function requestJson(url, options) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, options, (response) => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
          try {
            const parsed = JSON.parse(data || '{}');
            resolve(parsed);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`Airtable API request failed with status ${response.statusCode}: ${data}`));
        }
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    if (options && options.body) {
      request.write(options.body);
    }

    request.end();
  });
}

function createAirtableProvider(options) {
  const { apiKey, baseId, tableName, view } = options;
  if (!apiKey || !baseId || !tableName) {
    throw new Error('Airtable provider requires apiKey, baseId, and tableName');
  }

  return {
    async getLicenses() {
      let offset;
      const results = [];
      do {
        const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);
        if (view) {
          url.searchParams.set('view', view);
        }
        if (offset) {
          url.searchParams.set('offset', offset);
        }
        const response = await requestJson(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
        const records = Array.isArray(response.records) ? response.records : [];
        records.forEach((record) => {
          results.push(
            normalizeLicenseRecord({
              id: record.id,
              ...record.fields,
            }),
          );
        });
        offset = response.offset;
      } while (offset);

      return results;
    },
  };
}

module.exports = {
  createAirtableProvider,
};

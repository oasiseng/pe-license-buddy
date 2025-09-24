const http = require('node:http');
const { URL } = require('node:url');
const { StringDecoder } = require('node:string_decoder');

function parseRequestBody(request) {
  return new Promise((resolve, reject) => {
    const decoder = new StringDecoder('utf8');
    let buffer = '';
    request.on('data', (chunk) => {
      buffer += decoder.write(chunk);
    });
    request.on('end', () => {
      buffer += decoder.end();
      if (!buffer) {
        resolve(null);
        return;
      }
      try {
        const parsed = JSON.parse(buffer);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', (error) => {
      reject(error);
    });
  });
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(body);
}

function createServer({ licenseService, reminderService }) {
  return http.createServer(async (request, response) => {
    const method = request.method || 'GET';
    const url = new URL(request.url, 'http://localhost');

    if (method === 'OPTIONS') {
      response.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      response.end();
      return;
    }

    if (method === 'GET' && url.pathname === '/health') {
      sendJson(response, 200, { status: 'ok' });
      return;
    }

    if (method === 'GET' && url.pathname === '/licenses') {
      try {
        const licenses = await licenseService.listLicenses();
        sendJson(response, 200, { licenses });
      } catch (error) {
        sendJson(response, 500, { message: 'Failed to load licenses', error: error.message });
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/licenses/expiring') {
      const days = Number.parseInt(url.searchParams.get('days') || '30', 10);
      try {
        const licenses = await licenseService.getExpiringLicenses(days);
        sendJson(response, 200, { licenses, days });
      } catch (error) {
        sendJson(response, 500, { message: 'Failed to load expiring licenses', error: error.message });
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/licenses/expired') {
      try {
        const licenses = await licenseService.getExpiredLicenses();
        sendJson(response, 200, { licenses });
      } catch (error) {
        sendJson(response, 500, { message: 'Failed to load expired licenses', error: error.message });
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/licenses/ceu-summary') {
      try {
        const summary = await licenseService.summarizeCeuProgress();
        sendJson(response, 200, { summary });
      } catch (error) {
        sendJson(response, 500, { message: 'Failed to summarize CEU progress', error: error.message });
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/reminders/preview') {
      try {
        const body = (await parseRequestBody(request)) || {};
        const withinDays = Number.parseInt(body.withinDays || '30', 10);
        const payloads = await reminderService.prepareReminderPayloads(withinDays);
        sendJson(response, 200, { reminders: payloads.length, payloads });
      } catch (error) {
        sendJson(response, 500, { message: 'Failed to prepare reminders', error: error.message });
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/reminders/dispatch') {
      try {
        const body = (await parseRequestBody(request)) || {};
        const result = await reminderService.dispatchReminders({
          withinDays: body.withinDays,
          channels: body.channels,
        });
        sendJson(response, 200, result);
      } catch (error) {
        sendJson(response, 500, { message: 'Failed to dispatch reminders', error: error.message });
      }
      return;
    }

    sendJson(response, 404, { message: 'Not Found' });
  });
}

module.exports = {
  createServer,
};

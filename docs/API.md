# PE License Buddy API

## Endpoints

### `GET /health`
Returns basic service status.

### `GET /licenses`
Lists all licenses with computed insights (expiration countdown, CEU remaining).

### `GET /licenses/expiring?days=30`
Returns licenses expiring within the next `days` days (default 30).

### `GET /licenses/expired`
Returns licenses already past their expiration date.

### `GET /licenses/ceu-summary`
Aggregates CEU requirements and completions by state.

### `POST /reminders/preview`
Body:
```json
{
  "withinDays": 45
}
```
Returns the reminder payloads that would be sent for the window.

### `POST /reminders/dispatch`
Body:
```json
{
  "withinDays": 30,
  "channels": {
    "openphone": {
      "toNumbers": ["+13051234567"],
      "fromNumber": "+13057654321"
    },
    "email": {
      "recipients": ["compliance@example.com"]
    }
  }
}
```
Dispatches reminders through the selected channels. OpenPhone messages are sent via the OpenPhone API using the configured numbers; email reminders are saved to the local `outbox/` directory as `.txt` drafts for review.

## Configuration
Set environment variables via `.env` or the shell. See `.env.example` for supported options.

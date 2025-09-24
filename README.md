# PE License Buddy

> An open-source tool to track PE licenses, firm registrations, and continuing education requirements with reminders, automation, and intelligent client responses.

## Overview
PE License Buddy helps engineering firms simplify compliance management by centralizing license and registration data, automating renewal reminders, and providing an API that can power dashboards or client responses.

### What you can do today
- Load license data from a CSV file or Airtable.
- Query license status, expirations, and CEU progress through a lightweight REST API.
- Generate reminder payloads and draft email notifications or send OpenPhone messages.
- Extend or replace the data layer without changing higher-level services.

## Architecture
```
src/
├── api/             # HTTP server built on Node's standard library
├── data/            # Data providers (CSV or Airtable REST)
├── reminders/       # Scheduler utilities
├── services/        # Business logic for licenses and reminders
└── index.js         # Application entry point
```

- **Data providers** normalize records to a common schema regardless of the source.
- **Services** compute expiration insights, CEU rollups, and reminder payloads.
- **API** exposes JSON endpoints (see `docs/API.md`).
- **Reminder engine** can deliver OpenPhone SMS messages directly and stores email drafts inside `outbox/` for review.

## Getting started
1. Clone the repository and copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with your CSV path or Airtable credentials. The default configuration reads from `schemas/licenses.csv`.
3. Install dependencies (the MVP uses the Node standard library; `npm install` simply prepares the lock file):
   ```bash
   npm install
   ```
4. Start the API:
   ```bash
   npm start
   ```
   The service listens on `http://localhost:4000` by default.
5. Run the test suite with Node's built-in runner:
   ```bash
   npm test
   ```

## Configuration
Environment variables are documented in `.env.example`. Key options include:
- `DATA_SOURCE`: `csv` (default) or `airtable`.
- `CSV_PATH`: Path to the CSV file.
- `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE`, `AIRTABLE_VIEW`: Required for Airtable integration.
- `OPENPHONE_API_KEY`, `OPENPHONE_FROM_NUMBER`, `OPENPHONE_TO_NUMBERS`: Configure OpenPhone SMS delivery.
- `EMAIL_RECIPIENTS`: Comma-separated list used when generating email drafts.
- `ENABLE_SCHEDULER`: Set to `true` to enable the built-in reminder scheduler.

## Data model
Sample CSV data is provided in `schemas/licenses.csv`. Airtable users can mirror the structure defined in `schemas/airtable.md`.

Each license record includes:
- `firm_name`
- `license_number`
- `state`
- `status`
- `expiration_date`
- `ceu_required`
- `ceu_completed`
- Optional `holder_name` and `verification_url`

## Reminders
The reminder engine supports two channels:
- **OpenPhone**: Sends formatted SMS messages through the OpenPhone API.
- **Email**: Saves ready-to-send `.txt` drafts in `outbox/`. You can connect this directory to an SMTP process or review manually.

Use the `/reminders/preview` and `/reminders/dispatch` endpoints to orchestrate reminders. Details are available in `docs/API.md` and the template snippets under `templates/`.

## Roadmap
- Interactive dashboard (React/Next.js) using the REST API.
- Additional data adapters (SQL, Google Sheets).
- Automated CEU tracking workflows.
- Integration tests for data providers and scheduler.

## Contributing
We welcome contributions! See `CONTRIBUTING.md` for workflow and style guidance.

## License
This project is licensed under the MIT License. See `LICENSE` for details.

## Contact
Project Lead: Enrique Lairet, PE  
Website: [OasisEngineering.com](https://OasisEngineering.com)  
Support Email: info@oasisengineering.com

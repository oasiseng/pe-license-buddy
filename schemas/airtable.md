# Airtable schema

Use the following column names in your Airtable base to match the CSV schema:

| Column | Type | Notes |
| --- | --- | --- |
| firm_name | Single line text | Legal name of the firm or license holder |
| license_number | Single line text | Professional license identifier |
| state | Single select | Abbreviation of the issuing state |
| status | Single select | Active, Pending Renewal, or Expired |
| expiration_date | Date | Store dates in ISO format (YYYY-MM-DD) |
| ceu_required | Number | Continuing education units required |
| ceu_completed | Number | Continuing education units completed |
| holder_name | Single line text | Optional license holder name |
| verification_url | URL | Optional verification link |

Configure your `.env` file with:

```
AIRTABLE_API_KEY=key123
AIRTABLE_BASE_ID=app456
AIRTABLE_TABLE=Licenses
AIRTABLE_VIEW=Grid view
```

The Airtable provider in this project reads records via the REST API. Records returned from Airtable are normalized to the same structure as the CSV provider, allowing the services and API layer to operate without additional configuration changes.

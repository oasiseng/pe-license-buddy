# Reminder Templates

## OpenPhone SMS
```
⚠️ License ${license_number} (${state}) for ${firm_name} expires on ${expiration_date}.
Status: ${status}
CEUs remaining: ${ceu_remaining}
${verification_url ? `Verify: ${verification_url}` : ''}
```

## Email Reminder
```
Subject: Renewal reminder for ${firm_name} (${state})

Hi team,

The ${state} license ${license_number} for ${firm_name} will expire on ${expiration_date}.
Current status: ${status}
CEUs remaining: ${ceu_remaining}

Verification link: ${verification_url}

Please schedule the renewal tasks accordingly.
```

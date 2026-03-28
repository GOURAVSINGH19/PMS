# Email Configuration Guide

## Overview
The PMS backend now supports real email sending through multiple backends:
- **stub** - Console logging only (default for development)
- **smtp** - Standard SMTP server (Gmail, Office365, etc.)
- **sendgrid** - SendGrid API

## Configuration

### 1. Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Enable/disable email sending
EMAIL_ENABLED=true

# Choose backend: stub, smtp, or sendgrid
EMAIL_BACKEND=stub

# SMTP Configuration (if using smtp backend)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true

# SendGrid Configuration (if using sendgrid backend)
SENDGRID_API_KEY=your-sendgrid-api-key

# Sender Information
DEFAULT_FROM_EMAIL=noreply@pms.com
DEFAULT_FROM_NAME=PMS Platform
```

### 2. Using Gmail SMTP

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `SMTP_PASSWORD`

Example:
```bash
EMAIL_BACKEND=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourname@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_USE_TLS=true
```

### 3. Using SendGrid

1. Sign up at https://sendgrid.com
2. Create an API key
3. Configure:

```bash
EMAIL_BACKEND=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

## Email Triggers

Emails are automatically sent for:

### Goal Management
- Goal submitted for approval → Manager
- Goal approved → Employee
- Goal rejected → Employee
- Goal pending approval >5 days → Admin

### Probation
- Day 30/60/80 trigger → Employee & Manager
- Reminder after 2/4/6 days → Pending party
- Escalation after 7 days → Admin

### Review Cycles
- Cycle started → All eligible employees
- Reminder on day 5 and 15 → Pending users
- Escalation on day 22 → Admin
- Cycle closed → All participants

### Feedback & Flags
- Red flag detected → Admin
- Flag unresolved after 7 days → Secondary admin

## Testing

### Test with Stub (Console Only)
```bash
EMAIL_ENABLED=true
EMAIL_BACKEND=stub
```
Emails will be printed to console logs.

### Test with Real SMTP
```bash
EMAIL_ENABLED=true
EMAIL_BACKEND=smtp
# ... configure SMTP settings
```

### Disable Emails
```bash
EMAIL_ENABLED=false
```

## Email Format

All emails are sent in HTML format with:
- Subject line
- Message body
- Automated footer: "This is an automated message from the PMS Platform."

## Troubleshooting

### Emails not sending
1. Check `EMAIL_ENABLED=true`
2. Verify SMTP credentials
3. Check backend logs: `docker logs pms-gms-backend-1`
4. For Gmail: ensure app password is used, not regular password

### SMTP Authentication Failed
- Gmail: Use app password, not account password
- Office365: May need to enable SMTP AUTH
- Check firewall allows outbound port 587

### SendGrid Errors
- Verify API key is valid
- Check SendGrid dashboard for delivery status
- Ensure sender email is verified in SendGrid

## Production Recommendations

1. **Use SendGrid or AWS SES** for production (better deliverability)
2. **Set up SPF/DKIM records** for your domain
3. **Monitor email delivery** through provider dashboard
4. **Use environment-specific configs** (dev/staging/prod)
5. **Implement rate limiting** if sending high volume

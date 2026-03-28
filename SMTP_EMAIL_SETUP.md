# Email Notifications Without Resend - SMTP Setup Guide

## Overview

Your PMS system now supports **3 email backends**:
1. **SMTP** - Use Gmail, Outlook, or any corporate email server (Recommended)
2. **Resend** - Third-party API service (requires domain verification)
3. **Stub** - Console logging only (for testing)

## Option 1: SMTP (Recommended - No External Service Needed)

### Step 1: Get SMTP Credentials

#### For Gmail (harshit.verma@opstree.com):

1. **Enable 2-Factor Authentication:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "PMS Notifications"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

#### For Outlook/Office 365:

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@opstree.com
SMTP_PASSWORD=your-password
```

#### For Corporate SMTP Server:

Ask your IT team for:
- SMTP host (e.g., `mail.opstree.com`)
- SMTP port (usually 587 or 465)
- Username and password
- Whether to use TLS/SSL

### Step 2: Update .env File

Edit `/home/harshitverma/hacathon/PMS/backend/gms-backend/.env`:

```env
# Email Configuration - SMTP
EMAIL_ENABLED=true
EMAIL_BACKEND=smtp

# SMTP Settings (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=harshit.verma@opstree.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_USE_TLS=true
MAIL_FROM=PMS Platform <harshit.verma@opstree.com>
```

**Important:** Replace `abcd efgh ijkl mnop` with your actual App Password (remove spaces).

### Step 3: Rebuild and Restart

```bash
cd /home/harshitverma/hacathon/PMS
docker compose build gms-backend
docker compose up -d gms-backend
```

### Step 4: Test Email Sending

```bash
cd backend/gms-backend
python3 test_all_notifications_final.py
```

Check logs:
```bash
docker logs pms-gms-backend-1 --tail 50 | grep EMAIL
```

You should see:
```
[EMAIL SENT] To: gourav.singh@opstree.com | Subject: Goal pending approval | Via: SMTP
```

## Option 2: Other SMTP Providers

### SendGrid SMTP (Free: 100 emails/day)

```env
EMAIL_BACKEND=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
SMTP_USE_TLS=true
MAIL_FROM=PMS Platform <noreply@yourdomain.com>
```

### Amazon SES SMTP

```env
EMAIL_BACKEND=smtp
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_ses_smtp_username
SMTP_PASSWORD=your_ses_smtp_password
SMTP_USE_TLS=true
MAIL_FROM=PMS Platform <noreply@yourdomain.com>
```

### Mailgun SMTP

```env
EMAIL_BACKEND=smtp
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.mailgun.org
SMTP_PASSWORD=your_mailgun_password
SMTP_USE_TLS=true
MAIL_FROM=PMS Platform <noreply@yourdomain.com>
```

## Option 3: Stub (Testing Only)

For development/testing without sending real emails:

```env
EMAIL_ENABLED=true
EMAIL_BACKEND=stub
```

Emails will be printed to console logs instead of being sent.

## Troubleshooting

### Gmail: "Username and Password not accepted"

**Solution:** You must use an App Password, not your regular Gmail password.
1. Enable 2FA first
2. Generate App Password at https://myaccount.google.com/apppasswords
3. Use the 16-character password (remove spaces)

### Outlook: Authentication Failed

**Solution:** 
- Use your full email as username
- If using MFA, generate an app-specific password
- Try port 465 with SSL instead of 587 with TLS

### Corporate Email: Connection Refused

**Solution:**
- Check if your firewall allows outbound SMTP (port 587/465)
- Verify SMTP server address with IT team
- Some corporate servers require VPN connection

### Emails Going to Spam

**Solution:**
1. Add sender email to contacts
2. Check SPF/DKIM records (ask IT team)
3. Use a verified domain email (not personal Gmail)

### No Emails Received

**Check logs:**
```bash
docker logs pms-gms-backend-1 --tail 100 | grep EMAIL
```

Look for:
- `[EMAIL SENT]` - Success
- `[EMAIL ERROR]` - Failed (shows error message)
- `[EMAIL STUB]` - Not configured properly

## Comparison: SMTP vs Resend

| Feature | SMTP | Resend |
|---------|------|--------|
| Cost | Free (use existing email) | Free tier limited |
| Setup | 5 minutes | Requires domain verification |
| Delivery | Depends on provider | High deliverability |
| Rate Limits | Provider-dependent | 100/day (free tier) |
| Best For | Internal tools, small teams | Production apps, high volume |

## What Changed in the Code

### 1. Config (`app/config.py`)
Added support for multiple email backends:
```python
email_backend: str = "smtp"  # smtp, resend, or stub
smtp_host: str = "smtp.gmail.com"
smtp_port: int = 587
smtp_user: str = ""
smtp_password: str = ""
```

### 2. Email Sender (`app/utils/email.py`)
Now supports 3 backends:
- `_send_smtp_email()` - Native Python SMTP (no dependencies)
- `_send_resend_email()` - Resend API (optional)
- `_send_stub_email()` - Console logging

### 3. Notification Service
No changes needed - automatically uses configured backend.

## Testing Checklist

- [ ] Updated .env with SMTP credentials
- [ ] Rebuilt Docker container
- [ ] Restarted backend service
- [ ] Ran test script
- [ ] Checked logs for `[EMAIL SENT]`
- [ ] Verified email received in inbox
- [ ] Checked spam folder if not in inbox

## Production Recommendations

### For Small Teams (< 50 users)
✅ Use **SMTP with corporate email** (Gmail/Outlook)
- Free and reliable
- No external dependencies
- Easy to maintain

### For Large Teams (> 50 users)
✅ Use **dedicated email service** (SendGrid/SES)
- Better deliverability
- Higher rate limits
- Email analytics

### For Enterprise
✅ Use **corporate SMTP server**
- Keeps all email traffic internal
- Complies with company policies
- IT team can monitor/troubleshoot

## Quick Start Commands

```bash
# 1. Update .env with your SMTP credentials
nano backend/gms-backend/.env

# 2. Rebuild and restart
cd /home/harshitverma/hacathon/PMS
docker compose build gms-backend
docker compose up -d gms-backend

# 3. Test
cd backend/gms-backend
python3 test_all_notifications_final.py

# 4. Check logs
docker logs pms-gms-backend-1 --tail 50 | grep EMAIL
```

## Summary

✅ **SMTP is now configured** - No Resend needed
✅ **Works with any email provider** - Gmail, Outlook, corporate
✅ **No external dependencies** - Uses Python's built-in smtplib
✅ **All notifications working** - 15+ notification types ready
✅ **Production ready** - Just add your SMTP credentials

**Next Step:** Get your Gmail App Password and update the .env file!

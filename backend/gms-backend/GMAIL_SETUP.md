# Gmail App Password Setup for vermajiharshit1@gmail.com

## Steps to Generate Gmail App Password:

### 1. Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Under "Signing in to Google", click "2-Step Verification"
3. Follow the steps to enable 2FA if not already enabled

### 2. Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device
4. Enter "PMS Backend" as the name
5. Click "Generate"
6. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

### 3. Update .env File
Replace `your-gmail-app-password-here` in `.env` with the generated password:

```bash
SMTP_PASSWORD=abcd efgh ijkl mnop  # Remove spaces: abcdefghijklmnop
```

**Important:** Remove all spaces from the app password!

### 4. Restart Backend
```bash
cd /home/harshitverma/hacathon/PMS
docker compose restart gms-backend
```

### 5. Test Email
```bash
cd /home/harshitverma/hacathon/PMS/backend/gms-backend
python3 test_email.py
```

## Current Configuration

Your email is configured as:
- **Email:** vermajiharshit1@gmail.com
- **SMTP Host:** smtp.gmail.com
- **SMTP Port:** 587
- **TLS:** Enabled

## What Happens When You Test:

1. Script logs in as admin
2. Creates a test goal assigned to employee (harshit@opstree.com)
3. Submits goal for approval
4. **Email is sent to the manager** (deepak@opstree.com or whoever is harshit's manager)

## Troubleshooting

### "Username and Password not accepted"
- Make sure you're using the App Password, not your regular Gmail password
- Remove all spaces from the app password
- Verify 2FA is enabled on your Google account

### "SMTP AUTH extension not supported"
- Check that SMTP_PORT=587 (not 465 or 25)
- Verify SMTP_USE_TLS=true

### No email received
- Check spam folder
- Verify the manager's email address in the database
- Check backend logs: `docker logs pms-gms-backend-1 --tail 50`

## Alternative: Use Stub Mode for Testing

If you want to test without setting up Gmail:

```bash
# In .env
EMAIL_BACKEND=stub
```

This will print emails to console instead of sending them.

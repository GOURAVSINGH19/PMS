# 🚀 SMTP Email Setup - Final Steps

## Current Status

✅ **SMTP system configured and ready**
✅ **Test script created** (`test_smtp_scenarios.py`)
✅ **13 notification scenarios ready to test**
❌ **Gmail App Password needed** (currently using placeholder)

## Error Explanation

```
❌ Failed: Username and Password not accepted
```

**Cause:** The `.env` file has `SMTP_PASSWORD=your_app_password_here` (placeholder)

**Solution:** Replace with actual Gmail App Password

## Step-by-Step Setup (5 Minutes)

### Step 1: Enable 2-Factor Authentication

1. Go to https://myaccount.google.com/security
2. Find "2-Step Verification"
3. Click "Get Started" and follow the prompts
4. Verify with your phone number

### Step 2: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. You'll see "App passwords" section
3. Click "Select app" → Choose "Mail"
4. Click "Select device" → Choose "Other (Custom name)"
5. Type: **PMS Notifications**
6. Click "Generate"
7. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update .env File

```bash
# Open .env file
nano /home/harshitverma/hacathon/PMS/backend/gms-backend/.env
```

Find this line:
```env
SMTP_PASSWORD=your_app_password_here
```

Replace with your App Password (remove spaces):
```env
SMTP_PASSWORD=abcdefghijklmnop
```

**Important:** Remove all spaces from the password!

Save and exit (Ctrl+X, then Y, then Enter)

### Step 4: Restart Backend

```bash
cd /home/harshitverma/hacathon/PMS
docker compose restart gms-backend
```

Wait 5 seconds for backend to start.

### Step 5: Run Test

```bash
cd backend/gms-backend
python3 test_smtp_scenarios.py
```

## Expected Output (Success)

```
======================================================================
🚀 SMTP MASTER TEST SUITE - PMS NOTIFICATIONS
======================================================================

📧 Employee Email: vermajiharshit1@gmail.com
📧 Manager Email: gourav95411@gmail.com
📧 Admin Email: gourav95411@gmail.com

🔧 SMTP Server: smtp.gmail.com:587
🔧 SMTP User: harshit.verma@opstree.com
🔧 SMTP Password: ***

======================================================================

[1/13] GOAL_SUBMITTED
   📧 To: gourav95411@gmail.com
   📝 Subject: Action Required: New Goal Proposal
   ✅ Sent successfully!

[2/13] GOAL_APPROVED
   📧 To: vermajiharshit1@gmail.com
   📝 Subject: Goal Approved: AWS EKS Cost Optimization
   ✅ Sent successfully!

... (11 more emails)

======================================================================
🎉 TEST SUITE COMPLETE!
======================================================================

📬 Check your inboxes:
   • Employee (Harshit): vermajiharshit1@gmail.com
   • Manager (Gourav): gourav95411@gmail.com

📊 Expected Results:
   • vermajiharshit1@gmail.com should receive 7 emails
   • gourav95411@gmail.com should receive 6 emails
```

## What Emails Will Be Sent

### To Employee (vermajiharshit1@gmail.com) - 7 emails:
1. ✅ Goal Approved: AWS EKS Cost Optimization
2. ❌ Goal Rejected: Needs More Details
3. 📅 Day 30 Probation Review
4. 📅 Day 60 Probation Review
5. 📅 Day 80 Probation Review
6. 🎯 Q1 2026 Review Cycle Started
7. ⏰ Review Cycle Deadline Reminder

### To Manager (gourav95411@gmail.com) - 6 emails:
1. 🎯 New Goal Proposal (Approval Required)
2. ⚠️ Compliance Alert: Missing Probation Form
3. 🚨 Goal At Risk Alert
4. 🚨 Negative Feedback Flagged
5. ⚠️ Goal Approval Overdue (>5 days)
6. ✅ Goal Completed: Ready for Evaluation

## Troubleshooting

### Issue: "Username and Password not accepted"

**Solution:**
- You MUST use App Password, not regular Gmail password
- Enable 2FA first: https://myaccount.google.com/security
- Generate App Password: https://myaccount.google.com/apppasswords
- Remove all spaces from the password

### Issue: "Less secure app access"

**Solution:**
- Google removed this option in 2022
- You MUST use App Password now
- No way around it for Gmail SMTP

### Issue: Emails going to spam

**Solution:**
- Check spam/junk folder
- Add sender (harshit.verma@opstree.com) to contacts
- Mark as "Not Spam" if found in spam

### Issue: Still not working

**Check configuration:**
```bash
docker exec pms-gms-backend-1 python -c "
from app.config import settings
print(f'SMTP_USER: {settings.smtp_user}')
print(f'SMTP_PASSWORD: {\"SET\" if settings.smtp_password else \"NOT SET\"}')
print(f'SMTP_HOST: {settings.smtp_host}')
print(f'SMTP_PORT: {settings.smtp_port}')
"
```

## Alternative: Use Different Email

If you don't want to use harshit.verma@opstree.com, you can use any Gmail account:

```env
SMTP_USER=vermajiharshit1@gmail.com
SMTP_PASSWORD=your_app_password_here
MAIL_FROM=PMS Platform <vermajiharshit1@gmail.com>
```

Then generate App Password for that account.

## Quick Commands Reference

```bash
# 1. Edit .env
nano /home/harshitverma/hacathon/PMS/backend/gms-backend/.env

# 2. Restart backend
cd /home/harshitverma/hacathon/PMS
docker compose restart gms-backend

# 3. Run test
cd backend/gms-backend
python3 test_smtp_scenarios.py

# 4. Check logs
docker logs pms-gms-backend-1 --tail 50 | grep EMAIL
```

## Next Steps After Success

Once emails are working:

1. **Test with real workflows:**
   ```bash
   python3 test_all_notifications_final.py
   ```

2. **Integrate with frontend:**
   - Users create goals → Manager gets email
   - Manager approves → Employee gets email
   - All automatic!

3. **Monitor in production:**
   ```bash
   docker logs pms-gms-backend-1 -f | grep EMAIL
   ```

## Summary

✅ **System is ready** - Just needs Gmail App Password
✅ **13 test scenarios** - Cover all PMS notifications
✅ **Professional templates** - Branded HTML emails
✅ **Real email addresses** - vermajiharshit1@gmail.com & gourav95411@gmail.com

**Final step:** Get Gmail App Password and update `.env` file!

---

**Need help?** 
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- 2FA Setup: https://support.google.com/accounts/answer/185839

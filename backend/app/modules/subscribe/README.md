# Job Subscription & Email Notification System

## Overview

This module provides email notification functionality for job subscriptions. Users can subscribe to receive job notifications via email with different frequencies (daily, weekly, monthly, or instant).

## Features

- ✅ Email subscription management (subscribe, unsubscribe, update preferences)
- ✅ Multiple notification frequencies (daily, weekly, monthly, instant)
- ✅ Personalized job recommendations based on location/category preferences
- ✅ Automatic subscription on user registration
- ✅ Instant notifications when new jobs are posted
- ✅ Digest notifications (daily/weekly/monthly)
- ✅ Unsubscribe via email link
- ✅ Email notification logging

## Setup

### 1. Install Dependencies

```bash
pip install aiosmtplib jinja2
```

### 2. Configure Email Settings

Add to your `.env` file:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@yourdomain.com
SITE_URL=https://yourdomain.com
```

**For Gmail:**
- Use an App Password (not your regular password)
- Enable 2-factor authentication
- Generate app password: https://myaccount.google.com/apppasswords

**For other providers:**
- Gmail: smtp.gmail.com:587
- Outlook: smtp-mail.outlook.com:587
- SendGrid: smtp.sendgrid.net:587
- AWS SES: email-smtp.region.amazonaws.com:587

### 3. Database Tables

The `job_subscriptions` and `email_notification_logs` tables will be created automatically when you start the server.

### 4. Set Up Scheduled Tasks (for digest notifications)

For production, set up a cron job or scheduled task to run digest notifications:

**Linux/Mac (crontab):**
```bash
# Daily at 9 AM
0 9 * * * cd /path/to/backend && python -m app.modules.subscribe.scheduler
```

**Windows (Task Scheduler):**
- Create a task to run: `python -m app.modules.subscribe.scheduler`
- Set schedule: Daily at 9:00 AM

**Or use a process manager like PM2:**
```bash
pm2 start "python -m app.modules.subscribe.scheduler" --cron "0 9 * * *" --name job-notifications
```

## API Endpoints

### Subscribe
```
POST /api/subscriptions/
Body: {
  "email": "user@example.com",
  "name": "John Doe" (optional),
  "frequency": "daily" | "weekly" | "monthly" | "instant",
  "city_id": 1 (optional),
  "state_id": 1 (optional),
  "job_category_id": 1 (optional),
  "job_type_id": 1 (optional)
}
```

### Get Subscriptions
```
GET /api/subscriptions/?email=user@example.com
Headers: Authorization: Bearer <token> (optional)
```

### Update Subscription
```
PUT /api/subscriptions/{subscription_id}
Body: {
  "frequency": "weekly",
  "is_active": true,
  ...
}
```

### Unsubscribe
```
POST /api/subscriptions/unsubscribe
Body: {
  "token": "<unsubscribe_token>"
}
```

## How It Works

1. **Instant Notifications**: When a new job is posted, subscribers with "instant" frequency receive an email immediately.

2. **Digest Notifications**: 
   - Daily: Sends jobs from last 24 hours (if last email was >24h ago)
   - Weekly: Sends jobs from last 7 days (if last email was >7 days ago)
   - Monthly: Sends jobs from last 30 days (if last email was >30 days ago)

3. **Personalization**: Subscribers can set preferences for:
   - Location (city, state)
   - Job category
   - Job type
   Only matching jobs are sent.

4. **Auto-Subscription**: New users are automatically subscribed to daily notifications on registration.

## Frontend Integration

The subscription form is available on:
- `/jobs` page (in sidebar)
- Can be added to any page using `<SubscribeForm />`

Unsubscribe page:
- `/unsubscribe?token=<token>` - Handles unsubscribe from email links

## Testing

### Test Email Sending (without SMTP configured)
The system will log emails instead of sending when SMTP is not configured. Check console for:
```
[EMAIL] SMTP not configured. Would send to user@example.com: Subject
```

### Test with Real SMTP
1. Configure SMTP settings in `.env`
2. Subscribe using the API or frontend
3. Create a new job
4. Check email inbox for notification

## Troubleshooting

**Emails not sending:**
- Check SMTP credentials in `.env`
- Verify SMTP host and port
- Check firewall/network settings
- Review email service logs

**Notifications not received:**
- Check subscription is active (`is_active = true`)
- Verify email frequency matches job posting time
- Check spam folder
- Review `email_notification_logs` table for errors

**Database errors:**
- Tables are created automatically when you start the server
- Check database permissions


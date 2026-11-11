# Audit Log Retention & Reporting System

## Overview

This system implements a comprehensive audit log management solution with automatic 30-day retention, PDF report generation, and email delivery to super admins.

## Features

### 1. **Automatic 30-Day Cleanup**
- **Schedule**: Runs daily at 2:00 AM
- **Retention Period**: 30 days
- **Process**:
  1. Identifies logs older than 30 days
  2. Generates PDF report of these logs
  3. Emails report to all active super admins
  4. Deletes old logs from database
  5. Logs the cleanup action itself

### 2. **Manual Report Generation**
Super admins can manually generate reports via three options:

#### Current Month Report
- Generates report for the current calendar month
- Sends PDF via email to all super admins
- No logs are deleted

#### Test 30-Day Cleanup
- **TEST MODE** - Emails report without deleting logs
- Useful for previewing what would be cleaned up
- Shows how many logs would be affected
- Perfect for testing email functionality

#### Custom Date Range Report
- Select any start and end date
- Generate report for specific period
- Useful for audits, compliance, or historical analysis
- No logs are deleted

### 3. **PDF Report Format**
The generated PDF includes:
- **Header**: Company branding and report metadata
- **Summary Statistics**:
  - Total events count
  - Critical events count (red)
  - Warning events count (orange)
  - Info events count (blue)
- **Category Breakdown**: Events grouped by category
- **Detailed Log Table**:
  - Date/Time
  - Action type
  - Actor (who performed the action)
  - Severity level (color-coded)
  - Description
- **Footer**: Page numbers and copyright

### 4. **Email Notification**
Professional HTML email sent to all super admins containing:
- Report period summary
- Statistics overview
- PDF attachment
- Critical event alerts (if any)

## Configuration

### Environment Variables
Ensure your `.env` file contains:

```env
# Email Configuration (Required for reports)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="Anantapur FC - System Reports <your-email@gmail.com>"

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

### Gmail Setup (Recommended)
1. Enable 2-Factor Authentication in your Google Account
2. Generate an App Password:
   - Go to Google Account Settings → Security
   - Under "2-Step Verification", select "App passwords"
   - Generate password for "Mail" app
   - Use this password in `EMAIL_PASSWORD`

## Dependencies

### Backend
- `node-cron`: Scheduler for automated cleanup (v3.0.3)
- `pdfkit`: PDF generation library
- `nodemailer`: Email sending (already installed)

### Installation
```bash
cd backend
npm install node-cron pdfkit
```

## Testing the System

### Step 1: Test Email Configuration
The system initializes on server start. Check console logs for:
```
[SCHEDULER] Initializing audit log cleanup scheduler...
[SCHEDULER] Schedule: 0 2 * * * (Daily at 2:00 AM)
[SCHEDULER] Retention period: 30 days
[SCHEDULER] Scheduler initialized successfully
```

### Step 2: Test Report Generation (Without Deletion)
1. Log in as a super admin
2. Navigate to **Audit Logs** page
3. In the **Audit Report Generator** section, click **Test 30-Day Report**
4. Wait for the process to complete
5. Check your super admin email inbox for the PDF report
6. Verify no logs were deleted in the database

### Step 3: Test Current Month Report
1. Click **Current Month** button
2. Verify email is sent with current month's logs
3. Open the PDF attachment and verify formatting

### Step 4: Test Custom Date Range
1. Click **Custom Range** button
2. Select start and end dates
3. Click **Generate Report**
4. Verify email with custom range logs

## API Endpoints

### POST `/api/audit/reports/current-month`
Generate current month report.
- **Auth**: Required (Super Admin only)
- **Body**: None
- **Response**:
```json
{
  "success": true,
  "message": "Report sent to 2 super admin(s)",
  "data": {
    "logsIncluded": 149,
    "emailsSent": 2,
    "recipients": ["admin1@example.com", "admin2@example.com"],
    "stats": { ... }
  }
}
```

### POST `/api/audit/reports/custom`
Generate custom date range report.
- **Auth**: Required (Super Admin only)
- **Body**:
```json
{
  "startDate": "2026-02-01",
  "endDate": "2026-02-11"
}
```

### POST `/api/audit/reports/test-cleanup`
Test 30-day cleanup without deleting logs.
- **Auth**: Required (Super Admin only)
- **Body**: None
- **Response**:
```json
{
  "success": true,
  "message": "Test mode: Report sent...",
  "data": {
    "logsFound": 156,
    "logsDeleted": 0,
    "emailsSent": 2,
    "recipients": [...],
    "testMode": true
  }
}
```

## Scheduled Cleanup

The automated cleanup runs:
- **When**: Daily at 2:00 AM server time
- **What**: Logs older than 30 days
- **How**:
  1. Finds old logs
  2. Generates PDF report
  3. Emails all super admins
  4. Deletes old logs
  5. Creates audit log entry of the cleanup

### Cron Schedule Format
```javascript
// Format: "0 2 * * *"
// ┬ ┬ ┬ ┬ ┬
// │ │ │ │ │
// │ │ │ │ └─── Day of week (0-7, 0 or 7 is Sunday)
// │ │ │ └───── Month (1-12)
// │ │ └─────── Day of month (1-31)
// │ └───────── Hour (0-23)
// └─────────── Minute (0-59)
```

To change the schedule, modify `SCHEDULE_TIME` in:
`backend/services/schedulerService.js`

## File Structure

```
backend/
├── services/
│   ├── reportService.js       # PDF generation & log queries
│   ├── schedulerService.js    # Cron scheduler & cleanup logic
│   └── emailService.js        # Email sending with attachments
├── routes/
│   └── auditRoutes.js         # Report generation endpoints
└── server.js                  # Initializes scheduler

frontend/
├── components/
│   └── audit/
│       └── ReportGenerator.jsx  # UI for manual reports
├── pages/
│   └── AuditLogs.jsx          # Audit logs page
└── services/
    └── api.js                 # API endpoints configuration
```

## Troubleshooting

### Email Not Sending
1. Check console for error messages
2. Verify `.env` email configuration
3. Ensure Gmail App Password is correct
4. Check if super admin accounts are active
5. Test with: `node backend/tests/test-email.js` (if available)

### PDF Generation Fails
1. Check if `pdfkit` is installed: `npm list pdfkit`
2. Verify sufficient memory for large reports
3. Check console for PDF generation errors

### Scheduler Not Running
1. Verify server is running (not in test mode)
2. Check console logs for scheduler initialization
3. Confirm `NODE_ENV !== "test"`

### No Logs to Cleanup
- System only deletes logs older than 30 days
- Use seed script to create older test logs:
```javascript
// Modify createdAt in seedAuditLogs.js to 35 days ago
```

## Security Considerations

1. **Super Admin Only**: All report endpoints require Super Admin authentication
2. **Email Security**: Uses TLS encryption for email transmission
3. **PDF Content**: Reports contain sensitive audit data - ensure secure email
4. **Auto-Deletion**: Permanent deletion after 30 days (no recovery)

## Best Practices

1. **Test First**: Always use "Test 30-Day Report" before relying on auto-cleanup
2. **Regular Exports**: Export critical logs for long-term storage before 30 days
3. **Monitor Emails**: Ensure super admins check automated report emails
4. **Backup Strategy**: Consider backing up deleted logs to external storage
5. **Email Archive**: Configure email rules to archive PDF reports

## Future Enhancements

Potential improvements:
- [ ] Configurable retention period via admin UI
- [ ] Multiple retention policies per log severity
- [ ] Cloud storage backup before deletion
- [ ] Report scheduling (weekly/monthly)
- [ ] Compression for large PDF reports
- [ ] Digital signatures on PDF reports
- [ ] Webhook notifications

## Support

For questions or issues:
1. Check console logs for error details
2. Verify configuration in `.env`
3. Test email service separately
4. Review audit logs for cleanup actions

---

**Last Updated**: February 11, 2026  
**Version**: 1.0.0  
**Author**: Pocket Soccer Scout Development Team

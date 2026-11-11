# Critical Log Email Alert Procedure

> **Purpose:** When a critical action is recorded in the Audit Log, an email alert is automatically sent to **every Super Admin** in the system — telling them *what happened* and *who did it*.

---

## Table of Contents

1. [How It Works (Overview)](#1-how-it-works-overview)
2. [What Triggers an Alert?](#2-what-triggers-an-alert)
3. [Who Receives the Email?](#3-who-receives-the-email)
4. [Email Content Template](#4-email-content-template)
5. [Technical Requirements](#5-technical-requirements)
6. [Setup Instructions](#6-setup-instructions)
7. [Error Handling](#7-error-handling)
8. [Security Measures](#8-security-measures)
9. [How to Test](#9-how-to-test)
10. [Flow Diagram](#10-flow-diagram)
11. [File Reference](#11-file-reference)

---

## 1. How It Works (Overview)

```
Admin performs a critical action (e.g., deletes a player)
    ↓
AuditService.logAction() saves the event to the AuditLog database
    ↓
AuditService calls criticalAlertService.sendCriticalAlert()
    ↓
Service checks: Is this action critical? Are alerts enabled?
    ↓
Service queries the database: How many Super Admins exist? Get their emails.
    ↓
Filters out the actor (so you don't email yourself about your own action)
    ↓
Sends one email to ALL remaining Super Admins with full details
```

**Key Point:** The email is sent in a **non-blocking** way. If the email fails, the main action (e.g., deleting the player) still succeeds — the system logs the email failure separately and continues.

---

## 2. What Triggers an Alert?

An alert email is triggered when **either** of these conditions is true:

### Condition A: The action is in the critical actions list

| Action | What It Means | Example |
|--------|--------------|---------|
| `DELETE` | Any record deleted (player, tournament, admin) | Admin deletes a player profile |
| `ADMIN_DEMOTE` | Super Admin demotes another admin | Super Admin removes elevated privileges |
| `ADMIN_PASSWORD_RESET` | Super Admin resets another admin's password | Password forcefully changed |
| `LOGIN_FAILED` | Someone failed to log in | Potential unauthorized access attempt |
| `DATA_EXPORT` | Data exported from the system | Admin exports all player data to Excel |

### Condition B: The severity level is CRITICAL

The system automatically assigns severity based on the action type. These actions get **CRITICAL** severity:

| Action | Auto-Assigned Severity |
|--------|----------------------|
| `DELETE` | CRITICAL |
| `ADMIN_PASSWORD_RESET` | CRITICAL |
| `ADMIN_PROMOTE` | CRITICAL |
| `ADMIN_DEMOTE` | CRITICAL |

Other severity levels (**WARNING**, **INFO**, **DEBUG**) do NOT trigger alerts unless the action is explicitly in the critical actions list above.

### Decision Logic (in plain English)

```
Is the severity "CRITICAL"?      → YES → Send alert
Is the action in the list above?  → YES → Send alert
Neither?                          → NO  → Do nothing
```

**Code location:** `criticalAlertService.js` → `shouldAlert(action, severity)` function

---

## 3. Who Receives the Email?

### Finding Super Admins

The system queries the Admin database collection for all users with `role: "SUPER_ADMIN"`:

```javascript
const superAdmins = await Admin.find({ role: "SUPER_ADMIN" }).select("email");
// Returns: ["superadmin1@gmail.com", "superadmin2@gmail.com", ...]
```

### How Many Super Admins?

There is **no fixed limit**. The system finds ALL Super Admins in the database at the moment the alert fires. If you have 1 Super Admin, 1 email is sent. If you have 5, all 5 receive it.

### Self-Notification Filter

If the person who performed the action is themselves a Super Admin, **they are excluded** from the recipient list. You won't receive an alert about your own action — because you already know what you did.

```
Example:
  - Super Admins in DB: admin1@gmail.com, admin2@gmail.com, admin3@gmail.com
  - admin1@gmail.com deletes a player
  - Email sent to: admin2@gmail.com, admin3@gmail.com (admin1 excluded)
```

### Edge Case: Single Super Admin

If there's only one Super Admin and they perform the action, **no email is sent** (there's nobody else to notify). The system logs: `"No other Super Admins to notify (actor is the only one)"`

---

## 4. Email Content Template

### Subject Line

```
🚨 [CRITICAL] DELETE: Deleted player: John Smith
```

Format: `🚨 [SEVERITY] ACTION: Description or Entity Name`

### Email Body (What's Inside)

The email is an **HTML-formatted** message with these sections:

#### Header (Red banner for CRITICAL)
- Title: "⚠️ Critical System Alert"
- Subtitle: "Pocket Soccer Scout - Security Notification"

#### Severity Badge
- Color-coded pill: Red for CRITICAL, Yellow for WARNING

#### Alert Description Box (Red background)
- The human-readable description, e.g.: `"Deleted player: John Smith"`

#### Details Table

| Field | Value (Example) |
|-------|-----------------|
| **Action** | DELETE |
| **Entity Type** | PLAYER |
| **Entity** | John Smith |
| **Performed By** | admin@example.com |
| **Actor Role** | ADMIN |
| **IP Address** | 192.168.1.100 |
| **Timestamp** | Saturday, February 7, 2026, 3:45:00 PM IST |

#### Changed Fields (if applicable)
- Lists which fields were modified, e.g.: `"name, age, jerseyNumber"`

#### Action Required Box (Yellow background)
- Message: "Please review this activity in the **Audit Logs Dashboard** to ensure it was authorized."
- Includes a clickable link to `/audit-logs` in the frontend

#### Footer
- "This is an automated security alert from Anantapur FC Coach Portal."

### Plain Text Fallback

For email clients that don't support HTML, a plain text version is also included:

```
Critical Alert: Deleted player: John Smith

Action: DELETE
Entity: PLAYER - John Smith
Performed by: admin@example.com
IP: 192.168.1.100
Time: 2026-02-07T10:15:00.000Z
```

---

## 5. Technical Requirements

### Programming Language & Runtime
- **Node.js** (JavaScript) — the backend is already built in Node.js
- **Express.js** — web framework (already in use)

### Required npm Package
- **nodemailer** — already installed in the project (`backend/package.json`)
- No additional packages needed

### Database
- **MongoDB** with **Mongoose** — already in use
- Admin model with `role` field (already has `"SUPER_ADMIN"` and `"ADMIN"` values)
- AuditLog model (already created)

### Email Provider
- **Gmail SMTP** (default configuration)
- Requires a Gmail account with an **App Password** (not your regular password)

### Environment Variables Required

Add these to your `backend/.env` file:

```env
# Must already exist for existing email features:
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_specific_password
EMAIL_FROM="Anantapur FC" <your_email@gmail.com>

# NEW — Add this to enable critical alerts:
CRITICAL_ALERTS_ENABLED=true
```

### How to Get a Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (must be enabled)
3. At the bottom, click **App Passwords**
4. Select "Mail" and "Other (Custom name)" → type "Pocket Soccer Scout"
5. Click **Generate** — copy the 16-character password
6. Paste it as `EMAIL_PASSWORD` in your `.env` file

---

## 6. Setup Instructions

### Step 1: Verify Files Exist

Ensure these files are present in your project:

```
backend/
  services/
    criticalAlertService.js    ← Sends the alert emails
    auditService.js            ← Calls criticalAlertService after logging
  models/
    AuditLog.js                ← Defines actions, severity, categories
    Admin.js                   ← Has role field (SUPER_ADMIN/ADMIN)
```

### Step 2: Add Environment Variable

Open your `backend/.env` file and add:

```env
CRITICAL_ALERTS_ENABLED=true
```

If you want to **disable** alerts temporarily (e.g., during testing), set it to anything other than `"true"`:

```env
CRITICAL_ALERTS_ENABLED=false
```

### Step 3: Verify Email Configuration

Make sure these variables are correctly set in `backend/.env`:

```env
EMAIL_USER=your_actual_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
```

### Step 4: Restart the Backend

```bash
cd backend
npm run dev
```

### Step 5: Verify (server logs)

When a critical action fires, you should see one of these in the terminal:

```
✓ Critical alert sent to 2 Super Admin(s): <messageId>
```

or if disabled:

```
Critical alerts disabled (set CRITICAL_ALERTS_ENABLED=true to enable)
```

---

## 7. Error Handling

### What Happens If the Email Fails?

| Scenario | Behavior |
|----------|----------|
| **SMTP server unreachable** | Error logged to console, main action still succeeds |
| **Invalid credentials** | Error logged to console, main action still succeeds |
| **No Super Admins in database** | Warning logged: "No Super Admin emails found", no email sent |
| **Only one Super Admin (self)** | Info logged: "No other Super Admins to notify", no email sent |
| **Alerts disabled** | Info logged: "Critical alerts disabled", no email sent |
| **Network timeout** | Error logged to console, main action still succeeds |

### Non-Blocking Design

The critical alert is intentionally **fire-and-forget**. The code uses `.catch()` to handle errors:

```javascript
// In auditService.js
sendCriticalAlert(auditLog.toObject()).catch(err => {
  console.error("Critical alert email failed (non-blocking):", err.message);
});
```

**Why?** Audit logging is a support feature. If the email system is down, we still want the actual operation (delete, promote, etc.) to succeed. The audit log entry is always saved to the database regardless of whether the email sends.

### Error Logging

All failures are logged to the server console with descriptive messages:
- `"✗ Failed to send critical alert email: <error message>"`
- `"Failed to fetch Super Admin emails: <error message>"`

These can be monitored using standard server log tools.

---

## 8. Security Measures

### 8.1 Sensitive Data Protection

| Measure | Implementation |
|---------|---------------|
| **Password redaction** | `auditService.sanitizeData()` replaces password fields with `[REDACTED]` before storing |
| **Token redaction** | Reset tokens, OTPs, and hashes are all redacted |
| **Select: false** | Admin model uses `select: false` on password and token fields — they're never loaded in queries |

Redacted fields: `password`, `passwordHash`, `resetPasswordToken`, `passwordChangeOTP`, `newPasswordHash`, `token`, `resetPasswordExpires`, `resetPasswordUsed`

### 8.2 Email Security

| Measure | Details |
|---------|---------|
| **TLS encryption** | SMTP connection uses port 587 with STARTTLS (encrypted in transit) |
| **App Password** | Gmail App Passwords are separate from your main password. If compromised, revoke it without affecting your Gmail account |
| **Environment variables** | Email credentials stored in `.env` file (not committed to Git — `.gitignore` should include `.env`) |
| **No passwords in email** | The alert email contains the *action and who did it* — never the actual password value |

### 8.3 Self-Notification Prevention

If a Super Admin performs a critical action, they do NOT receive an alert email about their own action. This prevents:
- Unnecessary email spam
- Information the actor already knows
- Potential phishing confusion

### 8.4 What the Email DOES Contain

- Action type (DELETE, PROMOTE, etc.)
- Entity type and name (PLAYER: "John Smith")
- Who performed it (email address and role)
- IP address of the actor
- Timestamp
- Changed fields (if any)
- Link to the Audit Logs page

### 8.5 What the Email NEVER Contains

- Passwords (current or new)
- Reset tokens or OTPs
- Session tokens or JWTs
- Database IDs (MongoDB `_id`)
- Full previous/new data payloads

---

## 9. How to Test

### Quick Test: Trigger a Critical Action

1. **Start the backend:** `cd backend && npm run dev`
2. **Start the frontend:** `cd frontend && npm run dev`
3. **Log in** as a Super Admin
4. **Delete a player** from the Player Management page
5. **Check the console** — you should see:
   ```
   ✓ Critical alert sent to X Super Admin(s): <messageId>
   ```
6. **Check the Super Admin's inbox** — the email should arrive within seconds

### Test Without Actually Sending Email

Set `CRITICAL_ALERTS_ENABLED=false` in your `.env` file. The system will log what it *would* have done without sending real emails.

### Test with Code (Manual)

You can test the service directly in a Node.js session:

```javascript
// In backend directory, run: node
require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const { sendCriticalAlert, getSuperAdminEmails } = require('./services/criticalAlertService');
  
  // Check how many Super Admins exist
  const emails = await getSuperAdminEmails();
  console.log('Super Admins found:', emails.length, emails);
  
  // Send a test alert
  const result = await sendCriticalAlert({
    action: 'DELETE',
    severity: 'CRITICAL',
    entityType: 'PLAYER',
    entityName: 'Test Player',
    actorEmail: 'test@example.com',
    actorRole: 'ADMIN',
    ipAddress: '127.0.0.1',
    description: 'TEST: Deleted player Test Player',
    createdAt: new Date(),
  });
  
  console.log('Alert sent:', result);
  await mongoose.disconnect();
}

test();
```

---

## 10. Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CRITICAL ALERT FLOW                         │
└─────────────────────────────────────────────────────────────────────┘

  Admin performs action (DELETE player, DEMOTE admin, etc.)
                              │
                              ▼
               ┌──────────────────────────────┐
               │   Route Handler              │
               │   (playerRoutes.js, etc.)     │
               │   Calls AuditService.logAction│
               └──────────────┬───────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │   auditService.logAction()   │
               │                              │
               │  1. Determine category       │
               │  2. Determine severity       │
               │  3. Sanitize data (redact    │
               │     passwords/tokens)        │
               │  4. Save to AuditLog DB      │
               │  5. Call sendCriticalAlert()  │
               └──────────────┬───────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │  criticalAlertService        │
               │  .sendCriticalAlert()        │
               │                              │
               │  Check 1: CRITICAL_ALERTS_   │
               │           ENABLED === true?  │
               │           ├─ NO → return     │
               │           └─ YES ↓           │
               │                              │
               │  Check 2: shouldAlert(       │
               │    action, severity)?        │
               │           ├─ NO → return     │
               │           └─ YES ↓           │
               │                              │
               │  Step 3: Query DB for all    │
               │    Super Admin emails        │
               │           │                  │
               │  Step 4: Filter out the      │
               │    actor (self-exclude)      │
               │           │                  │
               │  Step 5: Generate HTML email │
               │           │                  │
               │  Step 6: Send via nodemailer │
               └──────────────┬───────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │     Gmail SMTP Server        │
               │                              │
               │  Delivers email to all       │
               │  Super Admin inboxes         │
               └──────────────────────────────┘
```

---

## 11. File Reference

| File | Purpose | Key Functions |
|------|---------|---------------|
| `backend/services/criticalAlertService.js` | Sends alert emails | `sendCriticalAlert()`, `shouldAlert()`, `getSuperAdminEmails()`, `generateAlertHTML()` |
| `backend/services/auditService.js` | Logs audit events & triggers alerts | `logAction()`, `sanitizeData()` |
| `backend/models/AuditLog.js` | Defines actions, categories, severities | `getSeverityFromAction()`, `getCategoryFromAction()` |
| `backend/models/Admin.js` | Stores admin users with roles | Queried for `role: "SUPER_ADMIN"` |
| `backend/services/emailService.js` | Existing email service (password resets) | Separate from critical alerts — they share the same SMTP config |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│  ENABLE:   Set CRITICAL_ALERTS_ENABLED=true in .env │
│  DISABLE:  Set CRITICAL_ALERTS_ENABLED=false        │
│  TRIGGERS: DELETE, DEMOTE, PASSWORD_RESET,          │
│            LOGIN_FAILED, DATA_EXPORT, any CRITICAL   │
│  SENDS TO: All Super Admins (except the actor)       │
│  CONTAINS: Who did what, when, from where            │
│  NEVER:    Passwords, tokens, or sensitive data      │
│  FAILS:    Silently — never breaks the main action    │
└─────────────────────────────────────────────────────┘
```

---

*Last updated: February 8, 2026*

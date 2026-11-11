# Super Admin Monitoring System - Feature Proposal

## Executive Summary

This document outlines a comprehensive monitoring system for super administrators to track all data modifications, user actions, and system events within the Pocket Soccer Scout application. The system provides complete audit trails, categorized action logs, and data restoration capabilities.

---

## 1. User Roles and Permissions for Monitoring

### 1.1 Role Hierarchy

| Role | Access Level | Monitoring Capabilities |
|------|-------------|------------------------|
| **SUPER_ADMIN** | Full Access | View all audit logs, restore data, manage all users, access system analytics |
| **ADMIN** | Limited Access | View own activity logs only, no restoration capabilities |

### 1.2 Super Admin Monitoring Permissions

Super Admins have exclusive access to:

1. **Full Audit Log Access**
   - View all system activities across all users
   - Filter logs by date range, action type, user, and entity
   - Export audit logs to CSV/JSON formats

2. **Data Restoration**
   - View deleted records (soft-deleted)
   - Restore deleted players, tournaments, and admins
   - View modification history for any record

3. **User Activity Tracking**
   - Monitor login/logout activities
   - Track failed login attempts
   - View password change history
   - Monitor session durations

4. **System Analytics Dashboard**
   - View activity trends and patterns
   - Access real-time activity feed
   - Generate compliance reports

### 1.3 Admin (Regular) Permissions

Regular Admins can:
- View their own activity history
- See their own login history
- View their own password change history

---

## 2. Comprehensive List of Changes to be Monitored

### 2.1 Entity Operations (CRUD)

#### Players
| Action | Details Captured |
|--------|-----------------|
| CREATE | Player data, created by admin, timestamp, IP address |
| READ | Access logs for sensitive data views |
| UPDATE | Before/after values, modified fields, modified by, timestamp |
| DELETE | Full player snapshot before deletion, deleted by, timestamp |

#### Tournaments
| Action | Details Captured |
|--------|-----------------|
| CREATE | Tournament data, created by admin, timestamp |
| UPDATE | Before/after values, status changes, modified by |
| DELETE | Full tournament snapshot, deleted by, timestamp |

#### Admins/Users
| Action | Details Captured |
|--------|-----------------|
| CREATE | New admin details (excluding password), created by super admin |
| UPDATE | Role changes, profile updates, updated by |
| DELETE | Admin details before deletion, deleted by |
| PROMOTE | Admin promoted to Super Admin, promoted by, timestamp |
| DEMOTE | Super Admin demoted to Admin, demoted by, timestamp |

### 2.2 Authentication Events

| Event | Details Captured |
|-------|-----------------|
| LOGIN_SUCCESS | User ID, email, IP address, user agent, timestamp |
| LOGIN_FAILED | Attempted email, IP address, failure reason, timestamp |
| LOGOUT | User ID, session duration, timestamp |
| SESSION_EXPIRED | User ID, last activity, expiration time |
| TOKEN_REFRESH | User ID, old/new token timestamps |

### 2.3 Password-Related Events

| Event | Details Captured |
|-------|-----------------|
| PASSWORD_CHANGE_REQUESTED | User ID, request IP, timestamp |
| PASSWORD_CHANGE_OTP_SENT | User email, OTP expiry time |
| PASSWORD_CHANGE_OTP_VERIFIED | User ID, verification timestamp |
| PASSWORD_CHANGE_OTP_FAILED | User ID, attempt count, failure reason |
| PASSWORD_CHANGE_SUCCESS | User ID, changed by (self/admin), timestamp |
| PASSWORD_RESET_REQUESTED | Email, request IP, timestamp |
| PASSWORD_RESET_LINK_SENT | Email, token expiry time |
| PASSWORD_RESET_SUCCESS | User ID, reset timestamp |
| PASSWORD_RESET_FAILED | Token, failure reason (expired/invalid/used) |
| PASSWORD_RESET_TIMEOUT | Token expired without use |

### 2.4 Email Notification Events

| Event | Details Captured |
|-------|-----------------|
| EMAIL_OTP_SENT | Recipient, email type, send status |
| EMAIL_RESET_LINK_SENT | Recipient, token ID, sent timestamp |
| EMAIL_DELIVERY_SUCCESS | Email ID, delivery timestamp |
| EMAIL_DELIVERY_FAILED | Email ID, error reason, retry count |
| EMAIL_WELCOME_SENT | New admin email, sent by |

### 2.5 System Events

| Event | Details Captured |
|-------|-----------------|
| DATA_EXPORT | Exported entity, format, exported by, row count |
| DATA_RESTORE | Restored entity ID, restored by, timestamp |
| BULK_OPERATION | Operation type, affected records count, performed by |

---

## 3. Data Modification Categorization

### 3.1 Action Categories

```
├── AUTHENTICATION
│   ├── LOGIN
│   ├── LOGOUT
│   ├── SESSION_EXPIRED
│   └── TOKEN_REFRESH
│
├── SECURITY
│   ├── PASSWORD_CHANGE
│   ├── PASSWORD_RESET
│   ├── OTP_VERIFICATION
│   └── FAILED_AUTH_ATTEMPT
│
├── DATA_MODIFICATION
│   ├── CREATE
│   ├── UPDATE
│   ├── DELETE
│   └── RESTORE
│
├── ADMIN_MANAGEMENT
│   ├── ADMIN_CREATE
│   ├── ADMIN_PROMOTE
│   ├── ADMIN_DEMOTE
│   ├── ADMIN_DELETE
│   └── PASSWORD_RESET_BY_ADMIN
│
├── EMAIL_NOTIFICATION
│   ├── OTP_EMAIL
│   ├── RESET_EMAIL
│   ├── WELCOME_EMAIL
│   └── NOTIFICATION_EMAIL
│
└── SYSTEM
    ├── DATA_EXPORT
    ├── BULK_OPERATION
    └── SYSTEM_CONFIG_CHANGE
```

### 3.2 Severity Levels

| Level | Color | Actions |
|-------|-------|---------|
| **CRITICAL** | Red | Delete operations, password resets by admin, role changes |
| **WARNING** | Orange | Failed login attempts, OTP failures, session timeouts |
| **INFO** | Blue | Create/Update operations, successful logins |
| **DEBUG** | Gray | Read operations, email notifications |

### 3.3 Actor Identification

Each audit log entry includes:
- **Actor ID**: Unique identifier of the user performing the action
- **Actor Email**: Email address for quick identification
- **Actor Role**: Role at the time of action (ADMIN/SUPER_ADMIN)
- **Actor IP Address**: IPv4/IPv6 address
- **User Agent**: Browser/device information
- **Session ID**: For correlating multiple actions in a session

---

## 4. Data Restoration Capabilities

### 4.1 Restorable Data

| Entity | Restoration Window | Conditions |
|--------|-------------------|------------|
| **Players** | 30 days | Soft-deleted, no referential conflicts |
| **Tournaments** | 30 days | Soft-deleted, can restore with associated data |
| **Admins** | 7 days | Soft-deleted, email not reused |
| **Audit Logs** | Non-restorable | Immutable for compliance |

### 4.2 Restoration Process

1. **Soft Delete Implementation**
   - All deletions are soft deletes (isDeleted flag + deletedAt timestamp)
   - Original data preserved in audit log as snapshot

2. **Restoration Workflow**
   ```
   1. Super Admin navigates to Audit Log → Deleted Items
   2. Filter by entity type and date range
   3. Preview deleted record details
   4. Click "Restore" button
   5. System validates restoration is possible
   6. Record restored with new audit entry
   7. Email notification sent to relevant parties
   ```

3. **Restoration Restrictions**
   - Cannot restore if email/unique ID already in use (for Admins)
   - Cannot restore if parent entity deleted (if applicable)
   - Restoration creates new audit entry for tracking

### 4.3 Data Retention Policy

| Data Type | Retention Period | After Expiry |
|-----------|-----------------|--------------|
| Audit Logs | 2 years | Archived to cold storage |
| Soft-deleted Records | 30 days | Permanently deleted |
| Session Logs | 90 days | Deleted |
| Email Logs | 1 year | Archived |

---

## 5. Implementation Details

### 5.1 Backend Changes

#### 5.1.1 New Models

**AuditLog Model** (`backend/models/AuditLog.js`)
```javascript
{
  id: UUID,
  
  // Action Details
  action: String (enum: CREATE, UPDATE, DELETE, RESTORE, LOGIN, etc.),
  category: String (enum: AUTHENTICATION, SECURITY, DATA_MODIFICATION, etc.),
  severity: String (enum: CRITICAL, WARNING, INFO, DEBUG),
  
  // Entity Information
  entityType: String (enum: PLAYER, TOURNAMENT, ADMIN, SYSTEM),
  entityId: String,
  entityName: String, // Human-readable identifier
  
  // Change Details
  previousData: Object, // Snapshot before change
  newData: Object, // Snapshot after change
  changedFields: [String], // List of modified field names
  
  // Actor Information
  actorId: String,
  actorEmail: String,
  actorRole: String,
  ipAddress: String,
  userAgent: String,
  sessionId: String,
  
  // Metadata
  description: String, // Human-readable description
  metadata: Object, // Additional context
  
  // Timestamps
  createdAt: Date,
  
  // For restoration
  isRestored: Boolean,
  restoredAt: Date,
  restoredBy: String
}
```

**DeletedRecord Model** (`backend/models/DeletedRecord.js`)
```javascript
{
  id: UUID,
  
  entityType: String,
  entityId: String,
  originalData: Object, // Complete snapshot
  
  deletedBy: String,
  deletedAt: Date,
  
  // Restoration tracking
  isRestored: Boolean,
  restoredBy: String,
  restoredAt: Date,
  
  // Auto-purge date
  purgeAfter: Date
}
```

#### 5.1.2 New Middleware

**Audit Middleware** (`backend/middleware/auditMiddleware.js`)
- Intercepts all modifying requests (POST, PUT, DELETE)
- Automatically captures before/after states
- Logs to AuditLog collection
- Attaches request metadata (IP, user agent)

**IP Tracking Middleware** (`backend/middleware/ipMiddleware.js`)
- Extracts real IP from proxied requests
- Handles X-Forwarded-For headers
- Attaches IP to request object

#### 5.1.3 New Routes

**Audit Routes** (`backend/routes/auditRoutes.js`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/audit` | Get paginated audit logs | SUPER_ADMIN |
| GET | `/api/audit/stats` | Get audit statistics | SUPER_ADMIN |
| GET | `/api/audit/entity/:type/:id` | Get history for specific entity | SUPER_ADMIN |
| GET | `/api/audit/actor/:id` | Get all actions by specific user | SUPER_ADMIN |
| GET | `/api/audit/export` | Export logs to CSV/JSON | SUPER_ADMIN |
| GET | `/api/audit/my-activity` | Get current user's activity | ADMIN |

**Restoration Routes** (`backend/routes/restorationRoutes.js`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/restore/deleted` | Get deleted records | SUPER_ADMIN |
| GET | `/api/restore/deleted/:type` | Get deleted records by type | SUPER_ADMIN |
| POST | `/api/restore/:type/:id` | Restore a deleted record | SUPER_ADMIN |
| GET | `/api/restore/preview/:type/:id` | Preview restoration | SUPER_ADMIN |

#### 5.1.4 Service Layer

**Audit Service** (`backend/services/auditService.js`)
```javascript
// Core functions:
- logAction(action, entityType, entityId, actorInfo, details)
- getAuditLogs(filters, pagination)
- getEntityHistory(entityType, entityId)
- getActorActivity(actorId, dateRange)
- exportAuditLogs(format, filters)
- calculateStats(dateRange)
```

**Restoration Service** (`backend/services/restorationService.js`)
```javascript
// Core functions:
- softDelete(entityType, entityId, actorInfo)
- getDeletedRecords(entityType, filters)
- restoreRecord(entityType, entityId, actorInfo)
- validateRestoration(entityType, entityId)
- purgeExpiredRecords()
```

#### 5.1.5 Modified Existing Files

**Player Routes** - Add audit logging to all CRUD operations
**Tournament Routes** - Add audit logging to all CRUD operations
**Admin Routes** - Add audit logging to all operations including auth
**Auth Middleware** - Extract and attach IP/session info

### 5.2 Frontend Changes

#### 5.2.1 New Pages

**AuditDashboard** (`frontend/src/pages/AuditDashboard.jsx`)
- Overview statistics cards (actions today, critical events, etc.)
- Real-time activity feed component
- Quick filters for common queries
- Links to detailed views

**AuditLogs** (`frontend/src/pages/AuditLogs.jsx`)
- Paginated table of all audit entries
- Advanced filter panel (date range, action, category, severity, actor)
- Search functionality
- Export button (CSV/JSON)
- Click row for detailed view

**AuditDetail** (`frontend/src/pages/AuditDetail.jsx`)
- Full details of single audit entry
- Before/after comparison view (for updates)
- Actor profile quick view
- Related actions timeline

**DeletedRecords** (`frontend/src/pages/DeletedRecords.jsx`)
- Tabs for Players, Tournaments, Admins
- List of soft-deleted records
- Preview deleted data
- Restore button with confirmation
- Days until permanent deletion indicator

**MyActivity** (`frontend/src/pages/MyActivity.jsx`)
- Personal activity log for regular admins
- Login history
- Actions performed

#### 5.2.2 New Components

```
frontend/src/components/audit/
├── AuditStatsCards.jsx       # Dashboard statistics
├── ActivityFeed.jsx          # Real-time activity stream
├── AuditTable.jsx            # Main audit log table
├── AuditFilters.jsx          # Filter panel
├── AuditEntry.jsx            # Single entry card/row
├── DataDiffViewer.jsx        # Before/after comparison
├── ActorBadge.jsx            # User info badge
├── SeverityBadge.jsx         # Severity indicator
├── CategoryBadge.jsx         # Category indicator
├── ActionBadge.jsx           # Action type indicator
├── EntityLink.jsx            # Link to entity
├── RestoreModal.jsx          # Restoration confirmation
├── ExportModal.jsx           # Export options modal
└── AuditTimeline.jsx         # Visual timeline component
```

#### 5.2.3 New API Endpoints in api.js

```javascript
// Audit endpoints
AUDIT_LOGS: '/audit',
AUDIT_STATS: '/audit/stats',
AUDIT_ENTITY: (type, id) => `/audit/entity/${type}/${id}`,
AUDIT_ACTOR: (id) => `/audit/actor/${id}`,
AUDIT_EXPORT: '/audit/export',
AUDIT_MY_ACTIVITY: '/audit/my-activity',

// Restoration endpoints
DELETED_RECORDS: '/restore/deleted',
DELETED_BY_TYPE: (type) => `/restore/deleted/${type}`,
RESTORE_RECORD: (type, id) => `/restore/${type}/${id}`,
RESTORE_PREVIEW: (type, id) => `/restore/preview/${type}/${id}`,
```

#### 5.2.4 Navigation Updates

- Add "Audit Logs" link in Super Admin sidebar
- Add "Deleted Records" link in Super Admin sidebar
- Add "My Activity" link for all authenticated users
- Dashboard widget for recent critical actions

#### 5.2.5 UI/UX Specifications

**Color Coding:**
- Critical (Red #DC2626): Deletions, security events
- Warning (Orange #F59E0B): Failed attempts, timeouts
- Info (Blue #3B82F6): Creates, updates
- Success (Green #10B981): Successful operations
- Debug (Gray #6B7280): Read operations

**Table Features:**
- Sortable columns (date, severity, action)
- Expandable rows for quick preview
- Bulk selection for export
- Infinite scroll or pagination

**Real-time Updates:**
- WebSocket connection for live feed
- Toast notifications for critical events
- Badge count for new events

---

## 6. Database Schema Changes

### 6.1 New Collections

```javascript
// AuditLogs collection indexes
db.auditlogs.createIndex({ createdAt: -1 })
db.auditlogs.createIndex({ actorId: 1, createdAt: -1 })
db.auditlogs.createIndex({ entityType: 1, entityId: 1 })
db.auditlogs.createIndex({ category: 1, severity: 1 })
db.auditlogs.createIndex({ action: 1 })

// DeletedRecords collection indexes
db.deletedrecords.createIndex({ entityType: 1, deletedAt: -1 })
db.deletedrecords.createIndex({ purgeAfter: 1 }, { expireAfterSeconds: 0 })
db.deletedrecords.createIndex({ isRestored: 1 })
```

### 6.2 Modified Collections

**Players/Tournaments/Admins**
Add fields:
```javascript
isDeleted: { type: Boolean, default: false },
deletedAt: { type: Date },
deletedBy: { type: String }
```

---

## 7. API Response Examples

### 7.1 Audit Log Entry
```json
{
  "id": "uuid-here",
  "action": "UPDATE",
  "category": "DATA_MODIFICATION",
  "severity": "INFO",
  "entityType": "PLAYER",
  "entityId": "player-uuid",
  "entityName": "John Doe",
  "previousData": {
    "age": 15,
    "jersey_no": 10
  },
  "newData": {
    "age": 16,
    "jersey_no": 7
  },
  "changedFields": ["age", "jersey_no"],
  "actorId": "admin-uuid",
  "actorEmail": "admin@example.com",
  "actorRole": "ADMIN",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "description": "Updated player John Doe: age (15→16), jersey_no (10→7)",
  "createdAt": "2026-02-08T10:30:00Z"
}
```

### 7.2 Audit Statistics
```json
{
  "today": {
    "total": 145,
    "byCategory": {
      "AUTHENTICATION": 50,
      "DATA_MODIFICATION": 75,
      "SECURITY": 20
    },
    "bySeverity": {
      "CRITICAL": 5,
      "WARNING": 15,
      "INFO": 125
    }
  },
  "trends": {
    "last7Days": [20, 35, 42, 38, 45, 50, 45],
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  "topActors": [
    { "email": "superadmin@example.com", "actions": 50 },
    { "email": "admin1@example.com", "actions": 35 }
  ]
}
```

---

## 8. Security Considerations

### 8.1 Audit Log Protection
- Audit logs are append-only (no update/delete)
- Stored in separate collection with restricted access
- Encryption at rest for sensitive fields
- IP addresses hashed for privacy compliance

### 8.2 Access Control
- Only SUPER_ADMIN can access full audit logs
- Rate limiting on audit endpoints
- Session validation on every request
- JWT token required with valid role

### 8.3 Data Privacy
- Password values never logged
- PII masked in logs where appropriate
- GDPR compliance for data retention

---

## 9. Performance Considerations

### 9.1 Optimization Strategies
- Audit writes are asynchronous (non-blocking)
- Indexed queries for common filters
- Pagination for large result sets
- TTL index for automatic log cleanup
- Caching for statistics

### 9.2 Estimated Storage
- Average audit entry: ~2KB
- Expected: 1000 entries/day
- Monthly storage: ~60MB
- Yearly storage: ~720MB

---

## 10. Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1: Backend Core** | 1 week | Models, Middleware, Basic Routes |
| **Phase 2: Integration** | 1 week | Integrate with existing routes |
| **Phase 3: Frontend Core** | 1 week | AuditLogs, AuditDashboard pages |
| **Phase 4: Restoration** | 3 days | Soft delete, restoration flow |
| **Phase 5: Polish** | 3 days | Export, real-time, testing |

---

## 11. File Structure Summary

### Backend
```
backend/
├── models/
│   ├── AuditLog.js          (NEW)
│   └── DeletedRecord.js     (NEW)
├── middleware/
│   ├── auditMiddleware.js   (NEW)
│   └── ipMiddleware.js      (NEW)
├── routes/
│   ├── auditRoutes.js       (NEW)
│   └── restorationRoutes.js (NEW)
├── services/
│   ├── auditService.js      (NEW)
│   └── restorationService.js (NEW)
└── server.js                (MODIFIED - add new routes)
```

### Frontend
```
frontend/src/
├── pages/
│   ├── AuditDashboard.jsx   (NEW)
│   ├── AuditLogs.jsx        (NEW)
│   ├── AuditDetail.jsx      (NEW)
│   ├── DeletedRecords.jsx   (NEW)
│   └── MyActivity.jsx       (NEW)
├── components/
│   └── audit/               (NEW - all components)
└── services/
    └── api.js               (MODIFIED - add endpoints)
```

---

## 12. Conclusion

This monitoring system provides comprehensive visibility into all data modifications and user actions within the Pocket Soccer Scout application. The implementation prioritizes:

1. **Complete Audit Trail** - Every action is logged with full context
2. **Easy Investigation** - Powerful filtering and search capabilities
3. **Data Recovery** - Soft delete with restoration capabilities
4. **Role-Based Access** - Super Admins have full control
5. **Performance** - Asynchronous logging and optimized queries
6. **Compliance** - Proper data retention and privacy controls

The system is designed to be extensible for future requirements and integrates seamlessly with the existing application architecture.

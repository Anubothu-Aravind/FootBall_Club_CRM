# Pocket Soccer Scout API Documentation

Complete guide to all API endpoints, authentication, and usage examples.

## Base URL
```
http://localhost:5001/api
```

## Authentication

### JWT Token Authentication
Most endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Access Levels
- **Public**: No authentication required
- **Auth Required**: Valid JWT token needed
- **SUPER_ADMIN**: JWT token with SUPER_ADMIN role required

---

## Table of Contents
1. [Health & Monitoring](#health--monitoring)
2. [Authentication](#authentication-endpoints)
3. [Password Management](#password-management)
4. [Player Management](#player-management)
5. [Tournament Management](#tournament-management)
6. [Audit Logs](#audit-logs)
7. [Audit Reports](#audit-reports)
8. [Restoration System](#restoration-system)
9. [Data Export](#data-export)

---

## Health & Monitoring

### 1. Database Ping (Keepalive)
**GET** `/api/ping`  
**Access**: Public  
**Description**: Keeps MongoDB Atlas free tier awake, returns database response time

**Example Request:**
```bash
curl http://localhost:5001/api/ping
```

**Example Response:**
```json
{
  "message": "Database is awake and responsive",
  "data": {
    "success": true,
    "status": "connected",
    "responseTime": "24ms",
    "timestamp": "2026-02-11T09:48:12.189Z",
    "database": "pocket-soccer-scout"
  }
}
```

---

### 2. Health Check
**GET** `/api/health`  
**Access**: Public  
**Description**: Database health check with connection status

**Example Request:**
```bash
curl http://localhost:5001/api/health
```

**Example Response:**
```json
{
  "message": "Database is connected and responsive",
  "data": {
    "success": true,
    "status": "connected",
    "responseTime": "5ms",
    "timestamp": "2026-02-11T09:50:00.000Z"
  }
}
```

---

### 3. Database Metrics
**GET** `/api/db/metrics`  
**Access**: SUPER_ADMIN only  
**Description**: Detailed database metrics including storage usage, collections, and free tier status

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  http://localhost:5001/api/db/metrics
```

**Example Response:**
```json
{
  "message": "Database metrics retrieved successfully",
  "data": {
    "success": true,
    "connection": {
      "status": "connected",
      "readyState": "connected",
      "host": "cluster0.mongodb.net",
      "database": "pocket-soccer-scout"
    },
    "database": {
      "dataSize": "2.5 MB",
      "storageSize": "1.2 MB",
      "indexSize": "512 KB",
      "collections": 8,
      "objects": 1250
    },
    "collections": [
      { "name": "players", "count": 450, "size": "1.2 MB" },
      { "name": "tournaments", "count": 85, "size": "512 KB" }
    ],
    "freeTier": {
      "limit": "512 MB",
      "currentUsage": "3.7 MB",
      "percentage": 0.72
    }
  }
}
```

---

## Authentication Endpoints

### 1. Register Admin/Coach
**POST** `/api/admins/register`  
**Access**: Public  
**Description**: Register a new admin or coach account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "ADMIN"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/admins/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "ADMIN"
  }'
```

**Example Response:**
```json
{
  "message": "Admin registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "65f7a8b9c1234567890abcde",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ADMIN"
  }
}
```

---

### 2. Login
**POST** `/api/admins/login`  
**Access**: Public  
**Description**: Login and receive JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/admins/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Example Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "coach": {
    "id": "65f7a8b9c1234567890abcde",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ADMIN"
  }
}
```

---

### 3. Get Current User Profile
**GET** `/api/admins/me`  
**Access**: Auth Required  
**Description**: Get authenticated user's profile

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/admins/me
```

**Example Response:**
```json
{
  "id": "65f7a8b9c1234567890abcde",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "ADMIN",
  "createdAt": "2026-01-15T10:30:00.000Z"
}
```

---

### 4. List All Admins
**GET** `/api/admins`  
**Access**: SUPER_ADMIN only  
**Description**: Get list of all admins and coaches

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  http://localhost:5001/api/admins
```

---

### 5. Update Admin
**PUT** `/api/admins/:id`  
**Access**: SUPER_ADMIN only  
**Description**: Update admin profile

**Example Request:**
```bash
curl -X PUT http://localhost:5001/api/admins/65f7a8b9c1234567890abcde \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated", "role": "SUPER_ADMIN"}'
```

---

### 6. Delete Admin
**DELETE** `/api/admins/:id`  
**Access**: SUPER_ADMIN only  
**Description**: Delete admin account

**Example Request:**
```bash
curl -X DELETE http://localhost:5001/api/admins/65f7a8b9c1234567890abcde \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

---

## Password Management

### 1. Forgot Password (Request OTP)
**POST** `/api/admins/forgot-password`  
**Access**: Public  
**Description**: Request password reset OTP via email

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/admins/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'
```

**Example Response:**
```json
{
  "message": "Password reset OTP sent to your email",
  "email": "j***@example.com"
}
```

---

### 2. Verify Reset OTP
**POST** `/api/admins/verify-reset-otp`  
**Access**: Public  
**Description**: Verify OTP and reset password

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/admins/verify-reset-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456",
    "newPassword": "NewSecurePass123!"
  }'
```

---

### 3. Resend OTP
**POST** `/api/admins/resend-otp`  
**Access**: Public  
**Description**: Resend password reset OTP

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

---

### 4. Change Password (Request OTP)
**POST** `/api/admins/change-password/request-otp`  
**Access**: Auth Required  
**Description**: Request OTP for password change (logged-in users)

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/admins/change-password/request-otp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 5. Change Password (Verify OTP)
**POST** `/api/admins/change-password/verify-otp`  
**Access**: Auth Required  
**Description**: Verify OTP and change password

**Request Body:**
```json
{
  "otp": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/admins/change-password/verify-otp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "123456",
    "newPassword": "NewSecurePass123!"
  }'
```

---

## Player Management

### 1. Get All Players
**GET** `/api/players`  
**Access**: Auth Required  
**Description**: Get all players with optional filters

**Query Parameters:**
- `age` - Filter by age
- `position` - Filter by position (Goalkeeper, Defender, Midfielder, Forward)
- `minSkillRating` - Minimum skill rating
- `search` - Search by name
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example Request:**
```bash
# Get all players
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/players

# Filter by position and minimum skill rating
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5001/api/players?position=Forward&minSkillRating=8"

# Search by name
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5001/api/players?search=Ravi"
```

**Example Response:**
```json
{
  "players": [
    {
      "id": "65f7a8b9c1234567890abcde",
      "name": "Ravi Kumar",
      "age": 16,
      "position": "Forward",
      "skillRating": 8.5,
      "contact": "9876543210",
      "address": "Anantapur, Andhra Pradesh",
      "tournaments": [],
      "createdAt": "2026-01-20T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 450,
    "page": 1,
    "pages": 45,
    "limit": 10
  }
}
```

---

### 2. Get Player by ID
**GET** `/api/players/:id`  
**Access**: Auth Required  
**Description**: Get detailed player information

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/players/65f7a8b9c1234567890abcde
```

---

### 3. Create Player
**POST** `/api/players`  
**Access**: Auth Required  
**Description**: Create new player profile

**Request Body:**
```json
{
  "name": "Ravi Kumar",
  "age": 16,
  "position": "Forward",
  "skillRating": 8.5,
  "contact": "9876543210",
  "address": "Anantapur, Andhra Pradesh",
  "parentContact": "9876543211",
  "school": "ABC High School"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/players \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ravi Kumar",
    "age": 16,
    "position": "Forward",
    "skillRating": 8.5,
    "contact": "9876543210",
    "address": "Anantapur, Andhra Pradesh"
  }'
```

---

### 4. Update Player
**PUT** `/api/players/:id`  
**Access**: Auth Required  
**Description**: Update player profile

**Example Request:**
```bash
curl -X PUT http://localhost:5001/api/players/65f7a8b9c1234567890abcde \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "skillRating": 9.0,
    "position": "Midfielder"
  }'
```

---

### 5. Delete Player
**DELETE** `/api/players/:id`  
**Access**: SUPER_ADMIN only  
**Description**: Soft delete player (moves to deleted records, 30-day retention)

**Example Request:**
```bash
curl -X DELETE http://localhost:5001/api/players/65f7a8b9c1234567890abcde \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

---

## Tournament Management

### 1. Get All Tournaments
**GET** `/api/tournaments`  
**Access**: Auth Required  
**Description**: Get all tournaments with filters

**Query Parameters:**
- `status` - Filter by status (upcoming, ongoing, completed)
- `search` - Search by name or location
- `page` - Page number
- `limit` - Items per page

**Example Request:**
```bash
# Get all tournaments
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/tournaments

# Filter by status
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5001/api/tournaments?status=upcoming"
```

---

### 2. Get Tournament by ID
**GET** `/api/tournaments/:id`  
**Access**: Auth Required  
**Description**: Get detailed tournament information

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/tournaments/65f7a8b9c1234567890abcde
```

---

### 3. Create Tournament
**POST** `/api/tournaments`  
**Access**: Auth Required  
**Description**: Create new tournament

**Request Body:**
```json
{
  "name": "Summer Cup 2026",
  "location": "Anantapur Stadium",
  "startDate": "2026-06-01",
  "endDate": "2026-06-15",
  "ageGroup": "U-17",
  "description": "Annual summer football tournament"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/tournaments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Cup 2026",
    "location": "Anantapur Stadium",
    "startDate": "2026-06-01",
    "endDate": "2026-06-15",
    "ageGroup": "U-17"
  }'
```

---

### 4. Update Tournament
**PUT** `/api/tournaments/:id`  
**Access**: Auth Required  
**Description**: Update tournament details

**Example Request:**
```bash
curl -X PUT http://localhost:5001/api/tournaments/65f7a8b9c1234567890abcde \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "ongoing"}'
```

---

### 5. Delete Tournament
**DELETE** `/api/tournaments/:id`  
**Access**: SUPER_ADMIN only  
**Description**: Soft delete tournament

**Example Request:**
```bash
curl -X DELETE http://localhost:5001/api/tournaments/65f7a8b9c1234567890abcde \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

---

## Audit Logs

### 1. Get Audit Logs
**GET** `/api/audit`  
**Access**: SUPER_ADMIN only  
**Description**: Get paginated audit logs with filters

**Query Parameters:**
- `action` - Filter by action (CREATE, UPDATE, DELETE, etc.)
- `entityType` - Filter by entity (Player, Tournament, Admin)
- `severity` - Filter by severity (INFO, WARNING, CRITICAL)
- `startDate` - Filter from date
- `endDate` - Filter to date
- `page` - Page number
- `limit` - Items per page

**Example Request:**
```bash
# Get all audit logs
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  http://localhost:5001/api/audit

# Filter by action and severity
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  "http://localhost:5001/api/audit?action=DELETE&severity=CRITICAL"

# Filter by date range
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  "http://localhost:5001/api/audit?startDate=2026-02-01&endDate=2026-02-11"
```

**Example Response:**
```json
{
  "logs": [
    {
      "id": "65f7a8b9c1234567890abcde",
      "action": "DELETE",
      "entityType": "Player",
      "entityId": "65f7a8b9c1234567890abcde",
      "severity": "CRITICAL",
      "actor": {
        "id": "65f7a8b9c1234567890abcde",
        "name": "Super Admin",
        "email": "admin@example.com"
      },
      "changes": {
        "before": { "name": "Player Name" },
        "after": null
      },
      "ipAddress": "192.168.1.1",
      "timestamp": "2026-02-11T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 1450,
    "page": 1,
    "pages": 145
  }
}
```

---

### 2. Get Audit Statistics
**GET** `/api/audit/stats`  
**Access**: SUPER_ADMIN only  
**Description**: Get audit log statistics

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  http://localhost:5001/api/audit/stats
```

**Example Response:**
```json
{
  "totalLogs": 1450,
  "byAction": {
    "CREATE": 600,
    "UPDATE": 500,
    "DELETE": 150,
    "LOGIN": 200
  },
  "bySeverity": {
    "INFO": 1200,
    "WARNING": 200,
    "CRITICAL": 50
  },
  "byEntity": {
    "Player": 800,
    "Tournament": 400,
    "Admin": 250
  }
}
```

---

### 3. Get Audit Logs by Entity
**GET** `/api/audit/entity/:type/:id`  
**Access**: SUPER_ADMIN only  
**Description**: Get audit logs for specific entity

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  http://localhost:5001/api/audit/entity/Player/65f7a8b9c1234567890abcde
```

---

### 4. Get Audit Logs by Actor
**GET** `/api/audit/actor/:id`  
**Access**: SUPER_ADMIN only  
**Description**: Get audit logs by admin/actor ID

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  http://localhost:5001/api/audit/actor/65f7a8b9c1234567890abcde
```

---

### 5. Get My Activity
**GET** `/api/audit/my-activity`  
**Access**: Auth Required  
**Description**: Get current user's audit activity

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/audit/my-activity
```

---

### 6. Get Audit Enums
**GET** `/api/audit/enums`  
**Access**: SUPER_ADMIN only  
**Description**: Get available enum values for filters

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  http://localhost:5001/api/audit/enums
```

**Example Response:**
```json
{
  "actions": ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"],
  "entityTypes": ["Player", "Tournament", "Admin"],
  "severities": ["INFO", "WARNING", "CRITICAL"]
}
```

---

## Audit Reports

### 1. Current Month Report
**POST** `/api/audit/reports/current-month`  
**Access**: SUPER_ADMIN only  
**Description**: Generate and email current month audit report (PDF)

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/audit/reports/current-month \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

**Example Response:**
```json
{
  "message": "Current month report generated and sent successfully",
  "report": {
    "period": "February 2026",
    "totalLogs": 146,
    "emailSent": true,
    "pdfGenerated": true,
    "stats": {
      "byAction": { "CREATE": 60, "UPDATE": 50, "DELETE": 36 },
      "bySeverity": { "INFO": 110, "WARNING": 30, "CRITICAL": 6 }
    }
  }
}
```

---

### 2. Custom Date Range Report
**POST** `/api/audit/reports/custom`  
**Access**: SUPER_ADMIN only  
**Description**: Generate custom date range audit report

**Request Body:**
```json
{
  "startDate": "2026-02-01",
  "endDate": "2026-02-11"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/audit/reports/custom \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-02-01",
    "endDate": "2026-02-11"
  }'
```

---

### 3. Test Cleanup Report
**POST** `/api/audit/reports/test-cleanup`  
**Access**: SUPER_ADMIN only  
**Description**: Generate test report for retention system validation

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/audit/reports/test-cleanup \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

---

## Restoration System

### 1. Get All Deleted Records
**GET** `/api/restore/deleted`  
**Access**: SUPER_ADMIN only  
**Description**: Get all deleted records (30-day retention)

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  http://localhost:5001/api/restore/deleted
```

**Example Response:**
```json
{
  "deletedRecords": [
    {
      "id": "65f7a8b9c1234567890abcde",
      "type": "Player",
      "originalId": "65f7a8b9c1234567890abcde",
      "data": {
        "name": "Deleted Player",
        "age": 16,
        "position": "Forward"
      },
      "deletedBy": {
        "id": "65f7a8b9c1234567890abcde",
        "name": "Super Admin"
      },
      "deletedAt": "2026-02-01T10:30:00.000Z",
      "expiresAt": "2026-03-03T10:30:00.000Z",
      "daysUntilExpiry": 20
    }
  ],
  "total": 15
}
```

---

### 2. Get Deleted Records by Type
**GET** `/api/restore/deleted/:type`  
**Access**: SUPER_ADMIN only  
**Description**: Get deleted records by type (player/tournament)

**Example Request:**
```bash
# Get deleted players
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  http://localhost:5001/api/restore/deleted/player

# Get deleted tournaments
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  http://localhost:5001/api/restore/deleted/tournament
```

---

### 3. Get Restoration Statistics
**GET** `/api/restore/stats`  
**Access**: SUPER_ADMIN only  
**Description**: Get restoration system statistics

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  http://localhost:5001/api/restore/stats
```

**Example Response:**
```json
{
  "totalDeleted": 15,
  "byType": {
    "Player": 10,
    "Tournament": 5
  },
  "expiringWithin7Days": 3,
  "alreadyExpired": 0
}
```

---

### 4. Preview Deleted Record
**GET** `/api/restore/preview/:type/:id`  
**Access**: SUPER_ADMIN only  
**Description**: Preview deleted record before restoration

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  http://localhost:5001/api/restore/preview/player/65f7a8b9c1234567890abcde
```

---

### 5. Validate Restoration
**GET** `/api/restore/validate/:type/:id`  
**Access**: SUPER_ADMIN only  
**Description**: Validate if record can be restored

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  http://localhost:5001/api/restore/validate/player/65f7a8b9c1234567890abcde
```

**Example Response:**
```json
{
  "canRestore": true,
  "validationChecks": {
    "recordExists": true,
    "notExpired": true,
    "noConflicts": true
  }
}
```

---

### 6. Restore Record
**POST** `/api/restore/:type/:id`  
**Access**: SUPER_ADMIN only  
**Description**: Restore deleted record to active database

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/restore/player/65f7a8b9c1234567890abcde \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

**Example Response:**
```json
{
  "message": "Player restored successfully",
  "restoredRecord": {
    "id": "65f7a8b9c1234567890abcde",
    "name": "Restored Player",
    "age": 16,
    "position": "Forward"
  }
}
```

---

### 7. Get Retention Policy
**GET** `/api/restore/retention`  
**Access**: SUPER_ADMIN only  
**Description**: Get retention policy info and cleanup schedule

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  http://localhost:5001/api/restore/retention
```

**Example Response:**
```json
{
  "retentionPeriod": "30 days",
  "cleanupSchedule": "Daily at 2:00 AM",
  "nextCleanup": "2026-02-12T02:00:00.000Z",
  "totalRecords": 15,
  "expiringToday": 0
}
```

---

## Data Export

### 1. Get Export Info
**GET** `/api/export/info`  
**Access**: Auth Required  
**Description**: Get export service information and statistics

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/export/info
```

**Example Response:**
```json
{
  "availableExports": ["players", "tournaments", "combined"],
  "totalPlayers": 450,
  "totalTournaments": 85
}
```

---

### 2. Export Players
**GET** `/api/export/players`  
**Access**: Auth Required  
**Description**: Export players data to Excel file

**Query Parameters:**
- `fields` - Comma-separated list of fields to include

**Example Request:**
```bash
# Export all player fields
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/export/players \
  -o players.xlsx

# Export specific fields only
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5001/api/export/players?fields=name,age,position" \
  -o players_basic.xlsx
```

---

### 3. Export Tournaments
**GET** `/api/export/tournaments`  
**Access**: Auth Required  
**Description**: Export tournaments data to Excel file

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/export/tournaments \
  -o tournaments.xlsx
```

---

### 4. Export All Data
**GET** `/api/export/all/combined`  
**Access**: SUPER_ADMIN only  
**Description**: Export all data (players + tournaments) to single Excel file

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  http://localhost:5001/api/export/all/combined \
  -o all_data.xlsx
```

---

## Automated Background Jobs

### 1. Audit Log Cleanup
- **Schedule**: Daily at 2:00 AM
- **Action**: Automatically deletes audit logs older than 30 days
- **Purpose**: Maintain database performance and comply with retention policy

### 2. Database Keepalive Pings
- **Schedule**: 3 times daily (8:00 AM, 2:00 PM, 8:00 PM)
- **Action**: Pings MongoDB Atlas to keep free tier connection active
- **Purpose**: Prevent database from sleeping due to inactivity

---

## Error Responses

All endpoints follow a consistent error response format:

**Example Error Response:**
```json
{
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting & Best Practices

### Best Practices
1. **Always include JWT token** for protected endpoints
2. **Use pagination** for list endpoints to avoid large payloads
3. **Filter data** at the API level rather than client-side when possible
4. **Handle errors gracefully** with proper error messages
5. **Use HTTPS** in production for secure communication
6. **Store JWT tokens securely** (httpOnly cookies or secure storage)

### Report Generation Tips
- Reports can take up to 60 seconds to generate (Puppeteer + PDF rendering)
- Reports are automatically emailed to the authenticated user
- PDF files include pie charts, statistics, and detailed log tables

---

## Environment Variables

Required environment variables in `.env`:

```env
# Server
PORT=5001
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication
JWT_SECRET=your_jwt_secret_key

# Email (for OTP and reports)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Scheduler
ENABLE_SCHEDULER=true
```

---

## Support & Documentation

- **API Documentation UI**: http://localhost:5001/
- **Health Check**: http://localhost:5001/api/health
- **Database Ping**: http://localhost:5001/api/ping

For issues or questions, contact the development team.

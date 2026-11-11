# Pocket Soccer Scout

<div align="center">

<img src="frontend/public/ACFC_Logo.png" alt="Anantapur Football Club Logo" width="120" height="120" style="border-radius: 50%; object-fit: cover; background: #1a365d;">

**Anantapur Football Club - Your Pocket-Sized Football Management Solution**  
Manage Players • Coach Portal • Performance Tracking • Tournament Management

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite)](https://vitejs.dev/)

[Design Preview](http://bit.ly/4qwuda7)

</div>

---

## Current Progress

| Module | Status | Progress |
|--------|--------|----------|
| Backend API | Complete | 100% |
| Database (MongoDB) | Complete | 100% |
| Authentication (Backend) | Complete | 100% |
| Frontend - Home Page UI | Complete | 100% |
| Frontend - Responsive Design | Complete | 100% |
| Frontend - Backend Integration | Complete | 100% |
| Frontend - Authentication UI | Complete | 100% |
| Frontend - React Router | Complete | 100% |
| Frontend - Player Management UI | Complete | 100% |
| Frontend - Tournament Management UI | Complete | 100% |
| Frontend - Coach Portal | Complete | 100% |
| Frontend - Admin Management UI | Complete | 100% |
| Frontend - Protected Routes | Complete | 100% |
| Mobile App | Planned | 0% |

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Rate Limiting](#rate-limiting)
- [Frontend Development Plan](#frontend-development-plan)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Team](#team)

---

## About

**Pocket Soccer Scout** is a lightweight football management application designed to help coaches, scouts, and teams manage player profiles, track performance, and analyze team statistics efficiently. The platform provides a secure, user-friendly interface for managing club details, player data, and performance insights all in one place.

### Key Highlights

- Secure Authentication with JWT and bcrypt
- Complete CRUD operations for player profiles
- RESTful API with comprehensive documentation
- Cloud database with MongoDB Atlas
- Modern stack: Node.js, Express, MongoDB
- Planned React Native mobile application - proposed feature roadmap pending implementation.

---

## Features

### Current Implementation (Backend)

**Role-Based Authentication System**

- Admin login with JWT tokens
- Two roles: `SUPER_ADMIN` and `ADMIN`
- Password hashing with bcrypt
- Protected routes with role verification
- Super Admin can manage other admins

**Player Management**

- Add, update, delete player profiles
- View all players with filtering (age_group, gender, city)
- UUID-based unique identifiers
- Player attributes: name, age, age_group, gender, size, height, weight, jersey_no, address, city
- Delete restricted to Super Admin only

**Tournament Management**

- Create, update, delete tournaments
- View tournaments with filtering (status, age_group, location)
- Tournament statuses: Upcoming, Ongoing, Completed
- UUID-based unique identifiers
- Delete restricted to Super Admin only

**Admin Management (Super Admin Only)**

- Create new admin accounts
- Demote admins (SUPER_ADMIN → ADMIN)
- View all admin accounts

**API Features**

- RESTful API design
- CORS enabled
- Error handling middleware
- Health check endpoint
- Development hot-reloading
- **Automated Rate Limiting** - Real-time configurable, route-based protection

---

## Tech Stack

### Backend (Current)

| Technology    | Version | Purpose                 |
| ------------- | ------- | ----------------------- |
| Node.js       | 18+     | JavaScript runtime      |
| Express.js    | 5.2.1   | Web framework           |
| MongoDB Atlas | Latest  | Cloud database          |
| Mongoose      | 9.1.4   | MongoDB ODM             |
| JWT           | 9.0.3   | Authentication          |
| Bcrypt        | 6.0.0   | Password hashing        |
| CORS          | 2.8.5   | Cross-origin requests   |
| Dotenv        | 17.2.3  | Environment variables   |
| Rate-Limit    | 7.x     | API rate limiting       |
| Nodemon       | 3.1.11  | Development auto-reload |

### Frontend (Planned)

- React.js - Web application
- React Native - Mobile application
- Tailwind CSS - Styling
- Axios - HTTP client
- React Router - Navigation
- Redux/Context API - State management
- React Hook Form - Form validation
- Chart.js - Data visualization

### Frontend (Current Implementation)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI Library |
| Vite | 7.3 | Build tool & dev server |
| React Router | 7.13 | Navigation & routing |
| Tailwind CSS | 4.1 | Utility-first styling |
| Framer Motion | 12.31 | Animations |
| Lucide React | 0.563 | Icon library |

**Frontend Features - Fully Implemented:**

*Authentication & Security:*
- [x] JWT-based authentication with Context API
- [x] Login page with email/password validation
- [x] Protected routes with role-based access control
- [x] Auto-logout on token expiry (7-day sessions)
- [x] 401 interceptor with automatic redirect
- [x] Profile dropdown with logout functionality

*Pages & Components:*
- [x] Home Page (Hero, Stats, Tournaments, Footer)
- [x] About Page with journey, mission, values, facilities
- [x] Gallery Page with photo showcase
- [x] Player Directory - Filterable list with age group & gender filters
- [x] Coach Portal - Dashboard with quick actions
- [x] Admin Management - CRUD for managing admin accounts (Super Admin only)
- [x] Player Management - Full CRUD operations
- [x] Tournament Management - Full CRUD operations
- [x] Responsive Navbar with conditional navigation
- [x] Scroll to Top button
- [x] Mobile & Tablet responsive design

*Backend Integration:*
- [x] API service with auth headers
- [x] Live data from backend (Tournaments, Players)
- [x] Error handling UI with user-friendly messages
- [x] Loading states with spinners
- [x] Environment config active (VITE_API_BASE_URL)

*Route Protection:*
- [x] Public routes: /, /about, /gallery, /login
- [x] Protected routes: /players, /coach-portal, /player-management, /tournament-management
- [x] Super Admin only: /admin-management

---

## Installation

### Prerequisites

- Node.js 18.x or higher
- npm 7.x or higher
- MongoDB Atlas account
- Git

### Setup Instructions

**1. Clone Repository**

```bash
git clone https://github.com/Anubothu-Aravind/Pocket-Soccer-Scout.git
cd Pocket-Soccer-Scout
```

**2. Install Dependencies**

```bash
cd backend
npm install
```

**3. Configure Environment Variables**

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/footballapp?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here

# Rate Limiting (optional - defaults shown)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_GENERAL_MAX=100
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_REGISTER_MAX=3
RATE_LIMIT_PLAYER_MAX=30
RATE_LIMIT_READ_MAX=60
```

**MongoDB Atlas Setup:**

1. Create cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Database Access → Create user
3. Network Access → Allow 0.0.0.0/0
4. Connect → Connect your application → Copy URI

**Generate JWT Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"
```

**4. Start Development Server**

```bash
npm run dev
```

Server runs at `http://localhost:5000`

**5. Verify Installation**

```bash
curl http://localhost:5000/
```

Expected response:

```json
{
  "message": "Pocket Soccer Scout API is running!",
  "status": "ok"
}
```

---

## API Documentation

### Base URL

```
http://localhost:5001
```

---

### Admin Authentication

#### Login

```http
POST /api/admins/login
Content-Type: application/json

{
  "email": "aanubothu@gmail.com",
  "password": "Aravind@13"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "6f13fd0f-6c30-4abc-bd5f-e08e2ec9b6ad",
    "email": "aanubothu@gmail.com",
    "role": "SUPER_ADMIN"
  }
}
```

---

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/admins/login` | Login & get JWT | No |
| `GET` | `/api/admins/me` | Get current logged-in admin | Yes (Admin/Super Admin) |
| `POST` | `/api/admins` | Create new admin | Super Admin |
| `GET` | `/api/admins` | Get all admins | Super Admin |
| `GET` | `/api/admins/:id` | Get admin by ID | Super Admin |
| `PUT` | `/api/admins/:id/promote` | Promote admin to Super Admin | Super Admin |
| `PUT` | `/api/admins/:id/demote` | Demote admin role | Super Admin |
| `PUT` | `/api/admins/:id/password` | Reset admin password | Super Admin |
| `DELETE` | `/api/admins/:id` | Delete admin | Super Admin |

#### Create Admin (Super Admin Only)

```http
POST /api/admins
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "email": "newadmin@example.com",
  "password": "SecurePass123",
  "role": "ADMIN",
  "image": "https://example.com/avatar.jpg"
}
```

#### Demote Admin

```http
PUT /api/admins/:id/demote
Authorization: Bearer <super_admin_token>
```

#### Delete Admin (Super Admin Only)

```http
DELETE /api/admins/:id
Authorization: Bearer <super_admin_token>
```

**Response:**
```json
{
  "message": "Admin deleted successfully",
  "deletedAdmin": {
    "id": "uuid-here",
    "email": "deleted@example.com",
    "role": "ADMIN"
  }
}
```

---

### Player Endpoints
Yes (Admin/Super Admin) |
| `GET` | `/api/players/:id` | Get player by ID | Yes (Admin/Super Admin) |
| `POST` | `/api/players` | Create player | Yes (Admin/Super Admin) |
| `PUT` | `/api/players/:id` | Update player | Yes (Admin/Super Admin)
| `GET` | `/api/players/:id` | Get player by ID | No |
| `POST` | `/api/players` | Create player | No |
| `PUT` | `/api/players/:id` | Update player | No |
| `DELETE` | `/api/players/:id` | Delete player | Super Admin |

#### Get All Players (with filters)

```http
GET /api/players?age_group=U15&gender=Male&city=Mumbai
```

#### Add Player

```http
POST /api/players
Content-Type: application/json

{
  "name": "John Smith",
  "age": 14,
  "age_group": "U15",
  "gender": "Male",
  "size": "M",
  "height": 165,
  "weight": 55,
  "jersey_no": 10,
  "address": "123 Main Street",
  "city": "Mumbai"
}
```

#### Update Player

```http
PUT /api/players/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "city": "Delhi"
}
```

#### Delete Player (Super Admin Only)

```http
DELETE /api/players/:id
Authorization: Bearer <super_admin_token>
```

---

### Tournament Endpoints
(Public) |
| `GET` | `/api/tournaments/:id` | Get tournament by ID | No (Public) |
| `POST` | `/api/tournaments` | Create tournament | Yes (Admin/Super Admin) |
| `PUT` | `/api/tournaments/:id` | Update tournament | Yes (Admin/Super Admin)
| `GET` | `/api/tournaments/:id` | Get tournament by ID | No |
| `POST` | `/api/tournaments` | Create tournament | No |
| `PUT` | `/api/tournaments/:id` | Update tournament | No |
| `DELETE` | `/api/tournaments/:id` | Delete tournament | Super Admin |

#### Get All Tournaments (with filters)

```http
GET /api/tournaments?status=Upcoming&age_group=U15
```

#### Add Tournament

```http
POST /api/tournaments
Content-Type: application/json

{
  "name": "Summer Youth Cup 2026",
  "age_group": "U15",
  "status": "Upcoming",
  "start_date": "2026-06-15",
  "end_date": "2026-06-20",
  "location": "Mumbai Sports Complex",
  "images": ["https://example.com/image.jpg"]
}
```

#### Delete Tournament (Super Admin Only)

```http
DELETE /api/tournaments/:id
Authorization: Bearer <super_admin_token>
```

---

### Role-Based Access Control

#### Roles

| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | Full access - can manage admins, delete players/tournaments |
| `ADMIN` | Limited access - can view data but cannot delete or manage other admins |

#### How to Verify Roles

**1. Check role in login response:**

```json
{
  "admin": {
    "role": "SUPER_ADMIN"  // or "ADMIN"
  }
}
```

**2. Decode JWT token to see role:**

```javascript
// JWT payload contains:
{
  "id": "admin-uuid",
  "email": "admin@example.com",
  "role": "SUPER_ADMIN",  // Role is embedded in token
  "iat": 1706000000,
  "exp": 1706604800
}
```

**3. Test with protected endpoint:**

```bash
# This will return 403 if not SUPER_ADMIN
curl -X DELETE http://localhost:5001/api/players/:id \
  -H "Authorization: Bearer <your_token>"
```

#### Role Verification Responses

**Super Admin - Success:**
```json
{
  "message": "Player deleted successfully"
}
```

**Regular Admin - Access Denied:**
```json
{
  "message": "Access denied. Super Admin only."
}
```

**No Token - Unauthorized:**
```json
{
  "message": "No token, authorization denied"
}
```

---

### Test Credentials (Seeded Data)

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `aanubothu@gmail.com` | `Aravind@13` |
| **Admin** | `charannaikcharan734@gmail.com` | `Charan@11` |

#### Seed the Database

```bash
cd backend
node seeds/seedData.js
```

#### Verify Seeded Data

```bash
cd backend
node seeds/verifyData.js
```

---

### Authentication Headers

For protected endpoints:

```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## Testing

### Run Tests

```bash
cd backend

# Run model tests (validates schemas, UUID, password hashing)
npm run test:models

# Run API tests (requires server running on port 5001)
npm run test:api

# Run all tests
npm run test
```

### Test Categories

#### Model Tests (`tests/models.test.js`)
- Player model creation and validation
- Tournament model creation and validation
- Admin model creation and validation
- UUID generation
- Password hashing with bcrypt
- JWT token generation and verification
- Role verification logic

#### API Tests (`tests/api.test.js`)
- Health check endpoint
- Admin login (Super Admin / Regular Admin)
- Player CRUD operations
- Tournament CRUD operations
- Role-based access control (DELETE restrictions)
- 404 error handling

### Test Suites Overview

| Test Suite | File | Tests | Description |
|------------|------|-------|-------------|
| Model Tests | `tests/models.test.js` | 18 | Schema validation, UUID, bcrypt, JWT |
| API Tests | `tests/api.test.js` | 20 | CRUD operations, auth, error handling |
| Admin RUD Tests | `tests/adminRUD.test.js` | 18 | Admin Read, Update, Delete operations |

---

### Admin RUD Test Results

| Category | Test | Status |
|----------|------|--------|
| **LOGIN** | Super Admin login | Pass |
| **READ** | GET /api/admins - List all admins | Pass |
| | GET /api/admins/:id - Get single admin | Pass |
| | Non-existent admin returns 404 | Pass |
| **UPDATE** | PUT /api/admins/:id/demote - Demote SUPER_ADMIN to ADMIN | Pass |
| | Already at lowest role returns 400 | Pass |
| | Cannot demote yourself | Pass |
| | Non-existent admin returns 404 | Pass |
| **ACCESS CONTROL** | Regular Admin login | Pass |
| | Regular admin denied list (403) | Pass |
| | Regular admin denied demote (403) | Pass |
| | No token returns 401 | Pass |
| | Invalid token returns 401 | Pass |
| **DELETE** | DELETE /api/admins/:id - Delete admin | Pass |
| | Deleted admin returns 404 | Pass |
| | Cannot delete yourself | Pass |
| | Non-existent admin returns 404 | Pass |
| | Regular admin denied (403) | Pass |

---

### Sample Test Output

```
RUNNING SAMPLE TEST CASES
============================================================

PLAYER MODEL TESTS
----------------------------------------
   PASS: Create valid player
   PASS: Player has UUID format
   PASS: Gender enum validation
   PASS: Find player by UUID

TOURNAMENT MODEL TESTS
----------------------------------------
   PASS: Create valid tournament
   PASS: Status enum validation

ADMIN MODEL TESTS
----------------------------------------
   PASS: Create valid admin
   PASS: Role enum validation
   PASS: Email uniqueness

TEST SUMMARY
============================================================
   Total:  18
   Passed: 18
   Failed: 0
============================================================
```

---

## Frontend Development Plan

### Phase 1: Core Setup & Home Page UI - ✅ COMPLETED

- [x] Initialize React + Vite project
- [x] Set up project structure (components, pages, hooks, services)
- [x] Create Home page with sections:
  - [x] NavBar with mobile menu
  - [x] Hero Section
  - [x] Stats Section with hover effects
  - [x] Tournaments Section with animations
  - [x] Footer Section
- [x] Responsive design (mobile, tablet, desktop)
- [x] Tailwind CSS integration
- [x] Scroll to Top functionality

### Phase 2: Backend Integration - ✅ COMPLETED

- [x] Enable API service connection
- [x] Fetch tournaments from backend
- [x] Error handling for failed requests
- [x] Loading states while fetching
- [x] Environment config active (.env with VITE_API_BASE_URL)

### Phase 3: Authentication & Routing - ✅ COMPLETED

- [x] Configure React Router (v7.13)
- [x] Authentication context/state management (AuthContext)
- [x] Login page with email/password validation
- [x] JWT token storage in localStorage
- [x] Protected route wrapper (ProtectedRoute component)
- [x] Role-based access control
- [x] Logout functionality with cleanup
- [x] Auto-redirect on token expiry
- [x] 401 interceptor in API service

### Phase 4: Player Management UI - ✅ COMPLETED

- [x] Player Directory with age group & gender filters
- [x] Players grouped by age group in tables
- [x] Player Management page with full CRUD
- [x] Add/Edit player forms
- [x] Delete confirmation modals
- [x] Responsive table/card layouts

### Phase 5: Tournament & Admin Management - ✅ COMPLETED

- [x] Tournament management UI with CRUD operations
- [x] Admin management UI (Super Admin only)
- [x] Create/promote/demote admins
- [x] Password reset functionality
- [x] Self-protection (can't modify own account)
- [x] Confirmation modals for destructive actions

### Phase 6: Coach Portal & Dashboard - ✅ COMPLETED

- [x] Coach portal dashboard
- [x] Quick action cards
- [x] Role-based card visibility
- [x] Navigation to management pages

### Phase 7: Enhanced Features - IN PROGRESS

- [ ] Performance tracking (goals, assists, cards)
- [ ] Performance graphs and charts
- [ ] Advanced analytics dashboard
- [x] Export to PDF/Excel
- [ ] Player statistics and history

### Phase 8: UI/UX Enhancements - PLANNED

- [ ] Dark mode toggle
- [ ] Toast notifications
- [ ] Advanced animations
- [ ] Image upload for players/tournaments
- [ ] Drag-and-drop file uploads

### Phase 9: Additional Features - PLANNED

- [ ] Coach profile management
- [ ] PWA capabilities
- [ ] Offline support
- [ ] Share player profiles
- [ ] Export team sheets
- [ ] Match scheduling

### Phase 10: Mobile App (React Native) - PLANNED

- [ ] Convert to React Native
- [ ] Platform-specific adjustments
- [ ] Camera integration
- [ ] Push notifications
- [ ] App store deployment

---

## Project Structure

```
Pocket-Soccer-Scout/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification
│   │   └── rateLimiter.js     # Automated rate limiting
│   ├── models/
│   │   ├── Admin.js           # Admin schema
│   │   ├── Player.js          # Player schema
│   │   └── Tournament.js      # Tournament schema
│   ├── routes/
│   │   ├── adminRoutes.js     # Admin endpoints
│   │   ├── playerRoutes.js    # Player CRUD
│   │   └── tourGallery.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── ModernTimeline.jsx
│   │   │   ├── NavBar.jsx
│   │   │   ├── ProtectedRoute.jsx  # Route guard component
│   │   │   ├── ScrollToTop.jsx
│   │   │   ├── StatsSection.jsx
│   │   │   ├── TournamentsSection.jsx
│   │   │   └── about/          # About page sections
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication state
│   │   ├── hooks/
│   │   │   └── useScrollToTop.js
│   │   ├── pages/
│   │   │   ├── About.jsx
│   │   │   ├── AdminManagement.jsx  # Admin CRUD (Super Admin)
│   │   │   ├── CoachPortal.jsx      # Dashboard
│   │   │   ├── Gallery.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx            # Authentication page
│   │   │   ├── PlayerManagement.jsx # Player CRUD
│   │   │   ├── Players.jsx          # Player Directory
│   │   │   └── TournamentManagement.jsx  # Tournament CRUD
│   │   ├── services/
│   │   │   └── api.js         # API service with auth
│   │   ├── App.css            # Global styles
│   │   ├── App.jsx            # Main app with routing
│   │   ├── index.css          # Base styles
│   │   └── main.jsx           # Entry point
│   ├── .env                   # Frontend env config
│   ├── eslint.config.js       # ESLint configuration
│   ├── index.html             # HTML template
│   ├── package.json           # Dependencies
│   ├── tailwind.config.js     # Tailwind CSS config
│   │   │   ├── HeroSection.jsx
│   │   │   ├── NavBar.jsx
│   │   │   ├── ScrollToTop.jsx
│   │   │   ├── StatsSection.jsx
│   │   │   └── TournamentsSection.jsx
│   │   ├── hooks/
│   │   │   └── useScrollToTop.js
│   │   ├── pages/
│   │   │   └── Home.jsx
│   │   ├── services/
│   │   │   └── api.js         # API service
│   │   ├── App.css            # Global styles
│   │   ├── App.jsx            # Main app
│   │   ├── index.css          # Base styles
│   │   └── main.jsx           # Entry point
│   ├── .env                   # Frontend env config
│   ├── index.html             # HTML template
│   ├── package.json           # Dependencies
│   └── vite.config.js         # Vite config
├── Docs/                      # Documentation
├── .gitignore
└── README.md
```

---

## Testing

### Testing Tools

- Postman
- Thunder Client (VS Code)
- Insomnia
- cURL
- PowerShell

### Example: Register and Login

**Register:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@test.com","password":"test123"}'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@test.com","password":"test123"}'
```

**Add Player:**

```bash
curl -X POST http://localhost:5000/api/players \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cristiano Ronaldo",
    "position": "Forward",
    "tshirtSize": "L",
    "age": 39,
    "height": "6'\''2'\''",
    "weight": "185 lbs",
    "jerseyNumber": 7
  }'
```

**PowerShell Example:**

```powershell
$body = @{
  email="coach@test.com"
  password="test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

---

## Deployment

3.0.0  
**Last Updated**: February 6, 2026  
**Status**: Production Ready - Full-Stack Application with Authentication

Made with ⚽
```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
```

### Deployment Checklist

- [x] Set NODE_ENV=production
- [x] Use strong JWT secret (64+ characters)
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Set up database backups
- [ ] Configure CORS for frontend domain
- [x] **Rate limiting** - Automated & configurable
- [ ] Set up logging
- [ ] Configure monitoring

---

## Team

### Project Maintainers

**A. Aravind** - Architect - aanubothu@gmail.com

**K. Charan Nayak** - Developer & Designer - charannaikcharan734@gmail.com

---

**Version**: 2.1.3
**Next Release**: Frontend Phase 1 - Q2 2026

Made for football enthusiasts worldwide

[Back to Top](#pocket-soccer-scout)

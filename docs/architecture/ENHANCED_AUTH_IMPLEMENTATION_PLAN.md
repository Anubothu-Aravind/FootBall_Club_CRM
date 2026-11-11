# Enhanced Authentication System Implementation Plan

**Project:** Pocket Soccer Scout - Authentication Enhancement  
**Date:** February 7, 2026  
**Version:** 2.0

---

## Table of Contents

1. [Environment Variable Management](#1-environment-variable-management)
2. [Redesigned Email Template](#2-redesigned-email-template)
3. [OTP-Based Password Change (Logged-In Users)](#3-otp-based-password-change)
4. [Security Considerations](#4-security-considerations)
5. [Implementation Steps](#5-implementation-steps)
6. [Testing Strategy](#6-testing-strategy)
7. [Potential Issues & Mitigations](#7-potential-issues--mitigations)

---

## 1. Environment Variable Management

### 1.1 Overview

Secure storage of API URLs and sensitive configuration in environment files is critical for:
- **Security**: Prevents hardcoding sensitive data in source code
- **Flexibility**: Easy switching between development, staging, and production
- **Version Control Safety**: .env files are gitignored, keeping secrets out of repositories

### 1.2 Current State

**Backend (.env):**
```env
PORT=5001
MONGO_URI=mongodb+srv://...
JWT_SECRET=c3c614c4198170d3f014bdd63362e1c2...
EMAIL_USER=aravind.anubothu13@gmail.com
EMAIL_PASSWORD=ufvcvztzdgulrnqa
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
Currently missing - needs to be created.

### 1.3 Enhanced Backend .env Structure

**File:** `backend/.env`

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=development
PORT=5001
SERVER_URL=http://localhost:5001

# ============================================
# DATABASE CONFIGURATION
# ============================================
MONGO_URI=mongodb+srv://footballapp:gQ8XGaj2zogBBYQN@cluster0.ci3cxja.mongodb.net/footballapp?retryWrites=true&w=majority
DB_NAME=footballapp

# ============================================
# SECURITY & AUTHENTICATION
# ============================================
JWT_SECRET=c3c614c4198170d3f014bdd63362e1c2c46397d2e33607ddb6b9427efd5ce55b3ffa5190fae8c546c565d2e8a90ddac05ebfb16a691b58b05d9977ee81b9fe42
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10

# ============================================
# PASSWORD RESET CONFIGURATION
# ============================================
PASSWORD_RESET_TOKEN_EXPIRY=900000        # 15 minutes in ms
RATE_LIMIT_WINDOW=900000                  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=3

# ============================================
# OTP CONFIGURATION
# ============================================
OTP_EXPIRY=600000                         # 10 minutes in ms
OTP_LENGTH=6
OTP_MAX_ATTEMPTS=3
OTP_RATE_LIMIT_WINDOW=900000              # 15 minutes
OTP_RATE_LIMIT_MAX_REQUESTS=5

# ============================================
# EMAIL CONFIGURATION
# ============================================
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=aravind.anubothu13@gmail.com
EMAIL_PASSWORD=ufvcvztzdgulrnqa
EMAIL_FROM=Anantapur FC <aravind.anubothu13@gmail.com>
EMAIL_REPLY_TO=support@anantapurfc.com

# ============================================
# FRONTEND URLS
# ============================================
FRONTEND_URL=http://localhost:5173
FRONTEND_RESET_PASSWORD_URL=${FRONTEND_URL}/reset-password
FRONTEND_LOGIN_URL=${FRONTEND_URL}/login

# ============================================
# API ENDPOINTS (Internal Reference)
# ============================================
API_PREFIX=/api
API_VERSION=v1

# ============================================
# CORS CONFIGURATION
# ============================================
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
CORS_CREDENTIALS=true

# ============================================
# LOGGING & MONITORING
# ============================================
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true

# ============================================
# PRODUCTION OVERRIDES (for reference)
# ============================================
# NODE_ENV=production
# SERVER_URL=https://api.anantapurfc.com
# FRONTEND_URL=https://anantapurfc.com
# EMAIL_SECURE=true
# LOG_LEVEL=info
# CORS_ORIGIN=https://anantapurfc.com
```

### 1.4 Frontend .env Structure

**File:** `frontend/.env`

```env
# ============================================
# API CONFIGURATION
# ============================================
VITE_API_BASE_URL=http://localhost:5001/api
VITE_API_TIMEOUT=10000

# ============================================
# APPLICATION CONFIGURATION
# ============================================
VITE_APP_NAME=Pocket Soccer Scout
VITE_APP_VERSION=2.0.0
VITE_APP_ENV=development

# ============================================
# FEATURE FLAGS
# ============================================
VITE_ENABLE_OTP_VERIFICATION=true
VITE_ENABLE_PASSWORD_RESET=true
VITE_ENABLE_SOCIAL_LOGIN=false

# ============================================
# DEBUGGING
# ============================================
VITE_DEBUG_MODE=true
VITE_ENABLE_CONSOLE_LOGS=true

# ============================================
# EXTERNAL SERVICES
# ============================================
VITE_GOOGLE_ANALYTICS_ID=
VITE_SENTRY_DSN=

# ============================================
# UI CONFIGURATION
# ============================================
VITE_DEFAULT_THEME=light
VITE_ITEMS_PER_PAGE=10

# ============================================
# PRODUCTION OVERRIDES (for reference)
# ============================================
# VITE_API_BASE_URL=https://api.anantapurfc.com/api
# VITE_APP_ENV=production
# VITE_DEBUG_MODE=false
# VITE_ENABLE_CONSOLE_LOGS=false
```

### 1.5 Environment File Best Practices

#### Security Rules:
1. ✅ **Never commit .env files** to version control
2. ✅ **Use .env.example** as a template (commit this)
3. ✅ **Rotate secrets regularly** (JWT_SECRET, EMAIL_PASSWORD)
4. ✅ **Different secrets** for dev/staging/production
5. ✅ **Minimal permissions** for service accounts

#### .gitignore Entry:
```gitignore
# Environment files
.env
.env.local
.env.development
.env.staging
.env.production
.env.*.local
```

#### .env.example Template:

**backend/.env.example:**
```env
# Copy this file to .env and fill in your values

# Server
NODE_ENV=development
PORT=5001
SERVER_URL=http://localhost:5001

# Database
MONGO_URI=your_mongodb_connection_string
DB_NAME=footballapp

# Security
JWT_SECRET=generate_a_secure_random_string_here
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10

# Email
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=Your App Name <your_email@gmail.com>

# Frontend
FRONTEND_URL=http://localhost:5173

# OTP
OTP_EXPIRY=600000
OTP_LENGTH=6
OTP_MAX_ATTEMPTS=3
```

**frontend/.env.example:**
```env
# Copy this file to .env and fill in your values

# API Configuration
VITE_API_BASE_URL=http://localhost:5001/api
VITE_API_TIMEOUT=10000

# Application
VITE_APP_NAME=Pocket Soccer Scout
VITE_APP_VERSION=2.0.0
VITE_APP_ENV=development

# Feature Flags
VITE_ENABLE_OTP_VERIFICATION=true
VITE_ENABLE_PASSWORD_RESET=true

# Debug
VITE_DEBUG_MODE=true
```

### 1.6 Accessing Environment Variables

#### Backend (Node.js):
```javascript
// Direct access
const port = process.env.PORT || 5001;
const jwtSecret = process.env.JWT_SECRET;

// Validated access (recommended)
const config = {
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGO_URI || throwError('MONGO_URI is required'),
  jwtSecret: process.env.JWT_SECRET || throwError('JWT_SECRET is required'),
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
  },
  otp: {
    expiry: parseInt(process.env.OTP_EXPIRY) || 600000,
    length: parseInt(process.env.OTP_LENGTH) || 6,
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS) || 3,
  },
};

function throwError(message) {
  throw new Error(message);
}

module.exports = config;
```

#### Frontend (Vite/React):
```javascript
// Access with VITE_ prefix
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

// Config object
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Pocket Soccer Scout',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    env: import.meta.env.VITE_APP_ENV || 'development',
  },
  features: {
    otpVerification: import.meta.env.VITE_ENABLE_OTP_VERIFICATION === 'true',
    passwordReset: import.meta.env.VITE_ENABLE_PASSWORD_RESET === 'true',
  },
  debug: import.meta.env.VITE_DEBUG_MODE === 'true',
};
```

---

## 2. Redesigned Email Template

### 2.1 Design Specifications (Based on AwesomeBooks Template)

The provided image shows a clean, professional email design with:

**Visual Elements:**
- Company logo and branding at top
- Trust indicators (badges/icons)
- Illustration/graphic (bookshelf in the example)
- Clear typography hierarchy
- Prominent call-to-action button
- Footer with links and social media icons

**Color Scheme for Anantapur FC:**
- Primary: #DC2626 (Red - brand color)
- Secondary: #1F2937 (Dark gray)
- Accent: #F59E0B (Orange/Gold)
- Background: #F9FAFB (Light gray)
- Text: #111827 (Near black)

### 2.2 Email Template Structure

#### Template Features:
1. **Header Section**: Logo + Trust badges
2. **Hero Section**: Illustration + Main heading
3. **Content Section**: Personalized message
4. **CTA Section**: Action button (prominent)
5. **Security Notice**: Expiry warning
6. **Footer Section**: Links + Contact + Social media

### 2.3 HTML Email Template Code

**File:** `backend/templates/password-reset.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Password Reset - Anantapur FC</title>
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    
    /* Base styles */
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f9fafb;
      color: #111827;
      line-height: 1.6;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    /* Header */
    .header {
      background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
      padding: 30px 20px;
      text-align: center;
    }
    
    .logo {
      max-width: 150px;
      height: auto;
    }
    
    .trust-badges {
      margin-top: 20px;
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    
    .badge {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      color: #ffffff;
      font-size: 11px;
      opacity: 0.95;
    }
    
    .badge-icon {
      width: 32px;
      height: 32px;
      margin-bottom: 5px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    
    /* Hero Section */
    .hero {
      padding: 40px 20px;
      text-align: center;
      background-color: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .hero-illustration {
      max-width: 300px;
      height: auto;
      margin: 0 auto 20px;
    }
    
    .hero-title {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 10px 0;
    }
    
    /* Content Section */
    .content {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 20px 0;
    }
    
    .message {
      font-size: 15px;
      color: #4b5563;
      line-height: 1.7;
      margin: 0 0 25px 0;
    }
    
    /* CTA Button */
    .cta-container {
      text-align: center;
      margin: 30px 0;
    }
    
    .cta-button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);
      transition: all 0.3s ease;
    }
    
    .cta-button:hover {
      background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
      box-shadow: 0 6px 8px rgba(245, 158, 11, 0.4);
      transform: translateY(-2px);
    }
    
    /* Info Box */
    .info-box {
      background-color: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 15px 20px;
      margin: 25px 0;
      border-radius: 6px;
    }
    
    .info-box-title {
      font-size: 14px;
      font-weight: 600;
      color: #92400E;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .info-box-text {
      font-size: 13px;
      color: #78350F;
      margin: 0;
      line-height: 1.6;
    }
    
    /* Link Fallback */
    .link-fallback {
      background-color: #f3f4f6;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      word-break: break-all;
    }
    
    .link-fallback-label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin: 0 0 8px 0;
    }
    
    .link-fallback-url {
      font-size: 12px;
      color: #3b82f6;
      word-break: break-all;
    }
    
    /* Warning Box */
    .warning-box {
      background-color: #FEE2E2;
      border-left: 4px solid #EF4444;
      padding: 15px 20px;
      margin: 25px 0;
      border-radius: 6px;
    }
    
    .warning-box-text {
      font-size: 13px;
      color: #991B1B;
      margin: 0;
      line-height: 1.6;
    }
    
    /* Footer */
    .footer {
      background-color: #1F2937;
      color: #D1D5DB;
      padding: 40px 30px;
      text-align: center;
    }
    
    .footer-company {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 10px 0;
    }
    
    .footer-address {
      font-size: 13px;
      color: #9CA3AF;
      margin: 0 0 25px 0;
      font-style: normal;
    }
    
    .footer-links {
      margin: 20px 0;
      padding: 20px 0;
      border-top: 1px solid #374151;
      border-bottom: 1px solid #374151;
    }
    
    .footer-link {
      color: #9CA3AF;
      text-decoration: none;
      font-size: 13px;
      margin: 0 12px;
      transition: color 0.3s ease;
    }
    
    .footer-link:hover {
      color: #DC2626;
    }
    
    .social-icons {
      margin: 25px 0 20px;
    }
    
    .social-icon {
      display: inline-block;
      width: 40px;
      height: 40px;
      margin: 0 8px;
      background-color: #374151;
      border-radius: 50%;
      text-align: center;
      line-height: 40px;
      transition: all 0.3s ease;
    }
    
    .social-icon:hover {
      background-color: #DC2626;
      transform: translateY(-3px);
    }
    
    .social-icon img {
      width: 20px;
      height: 20px;
      vertical-align: middle;
    }
    
    .footer-disclaimer {
      font-size: 11px;
      color: #6B7280;
      margin: 20px 0 0;
      line-height: 1.5;
    }
    
    .copyright {
      font-size: 12px;
      color: #6B7280;
      margin: 15px 0 0;
    }
    
    /* Mobile Responsive */
    @media only screen and (max-width: 600px) {
      .content, .footer {
        padding: 30px 20px !important;
      }
      
      .hero-title {
        font-size: 24px !important;
      }
      
      .greeting {
        font-size: 16px !important;
      }
      
      .message {
        font-size: 14px !important;
      }
      
      .cta-button {
        padding: 14px 30px !important;
        font-size: 15px !important;
      }
      
      .trust-badges {
        flex-direction: column;
        gap: 10px !important;
      }
    }
  </style>
</head>
<body>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f9fafb">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="email-container" width="600" border="0" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td class="header">
              <img src="https://your-domain.com/logo.png" alt="Anantapur FC Logo" class="logo">
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                <tr>
                  <td align="center">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td class="badge">
                          <div class="badge-icon">✓</div>
                          <div>Secure</div>
                        </td>
                        <td style="width: 30px;"></td>
                        <td class="badge">
                          <div class="badge-icon">🔒</div>
                          <div>Encrypted</div>
                        </td>
                        <td style="width: 30px;"></td>
                        <td class="badge">
                          <div class="badge-icon">⚡</div>
                          <div>Fast Support</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Hero Section -->
          <tr>
            <td class="hero">
              <!-- SVG Illustration of Football/Sports Icon -->
              <svg class="hero-illustration" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <!-- Football Field -->
                <rect x="50" y="50" width="300" height="120" fill="url(#fieldGradient)" rx="10"/>
                <rect x="50" y="95" width="300" height="2" fill="#ffffff" opacity="0.5"/>
                <circle cx="200" cy="105" r="30" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
                <circle cx="200" cy="105" r="3" fill="#ffffff" opacity="0.5"/>
                <!-- Goal Posts -->
                <rect x="40" y="80" width="10" height="50" fill="#DC2626"/>
                <rect x="350" y="80" width="10" height="50" fill="#DC2626"/>
                <!-- Football -->
                <circle cx="250" cy="70" r="20" fill="#ffffff" stroke="#1F2937" stroke-width="2"/>
                <path d="M 250 50 L 260 62 L 253 77 L 247 77 L 240 62 Z" fill="#1F2937"/>
              </svg>
              
              <h1 class="hero-title">Forgot your password?</h1>
            </td>
          </tr>
          
          <!-- Content Section -->
          <tr>
            <td class="content">
              <p class="greeting">Hey {{USER_NAME}},</p>
              
              <p class="message">
                Forgotten your password? Don't worry, resetting it couldn't be easier. Just click the link below.
              </p>
              
              <div class="cta-container">
                <a href="{{RESET_URL}}" class="cta-button">Reset Password</a>
              </div>
              
              <div class="info-box">
                <p class="info-box-title">
                  <span>⏰</span>
                  <strong>Important:</strong>
                </p>
                <p class="info-box-text">
                  For security purposes, this link will expire in <strong>15 minutes</strong> or after you reset your password. 
                  If you haven't forgotten your password, please ignore this message.
                </p>
              </div>
              
              <div class="link-fallback">
                <p class="link-fallback-label"><strong>Link not working?</strong> Copy and paste this URL into your browser:</p>
                <p class="link-fallback-url">{{RESET_URL}}</p>
              </div>
              
              <div class="warning-box">
                <p class="warning-box-text">
                  <strong>Didn't request this?</strong> If you didn't request a password reset, please ignore this email and your password will remain unchanged. Your account is secure.
                </p>
              </div>
              
              <p class="message" style="margin-top: 30px;">
                With very best wishes,<br>
                <strong>Anantapur FC</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p class="footer-company">Anantapur Football Club</p>
              <address class="footer-address">
                Anantapur, Andhra Pradesh, India
              </address>
              
              <div class="footer-links">
                <a href="{{FRONTEND_URL}}/about" class="footer-link">About Us</a>
                <span style="color: #4B5563;">|</span>
                <a href="mailto:{{SUPPORT_EMAIL}}" class="footer-link">Contact Support</a>
                <span style="color: #4B5563;">|</span>
                <a href="{{FRONTEND_URL}}/privacy" class="footer-link">Privacy Policy</a>
                <span style="color: #4B5563;">|</span>
                <a href="{{FRONTEND_URL}}/terms" class="footer-link">Terms</a>
              </div>
              
              <div class="social-icons">
                <a href="https://facebook.com" class="social-icon">
                  <img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" alt="Facebook">
                </a>
                <a href="https://instagram.com" class="social-icon">
                  <img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" alt="Instagram">
                </a>
                <a href="https://twitter.com" class="social-icon">
                  <img src="https://img.icons8.com/ios-filled/50/ffffff/twitter.png" alt="Twitter">
                </a>
              </div>
              
              <p class="footer-disclaimer">
                This email was sent from Anantapur FC. To make sure you receive emails from us, please add 
                <a href="mailto:{{EMAIL_FROM}}" style="color: #9CA3AF;">{{EMAIL_FROM}}</a> to your address book.
              </p>
              
              <p class="copyright">
                © {{CURRENT_YEAR}} Anantapur Football Club. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### 2.4 OTP Email Template

**File:** `backend/templates/otp-verification.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Verification - Anantapur FC</title>
  <style>
    /* Include same base styles from password-reset.html */
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #111827; line-height: 1.6; margin: 0; padding: 0; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); padding: 30px 20px; text-align: center; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 20px 0; }
    .message { font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0 0 25px 0; }
    
    /* OTP Code Box */
    .otp-container {
      text-align: center;
      margin: 35px 0;
      padding: 30px;
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      border-radius: 12px;
      border: 2px dashed #3B82F6;
    }
    
    .otp-label {
      font-size: 14px;
      color: #1E40AF;
      font-weight: 600;
      margin: 0 0 15px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .otp-code {
      font-size: 42px;
      font-weight: 800;
      color: #1F2937;
      letter-spacing: 8px;
      font-family: 'Courier New', Courier, monospace;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .otp-validity {
      font-size: 13px;
      color: #4B5563;
      margin: 15px 0 0 0;
    }
    
    .footer { background-color: #1F2937; color: #D1D5DB; padding: 40px 30px; text-align: center; }
    .footer-company { font-size: 18px; font-weight: 700; color: #ffffff; margin: 0 0 10px 0; }
    
    @media only screen and (max-width: 600px) {
      .otp-code { font-size: 32px !important; letter-spacing: 5px !important; }
    }
  </style>
</head>
<body>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f9fafb">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="email-container" width="600" border="0" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td class="header">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔐 Verify Your Identity</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content">
              <p class="greeting">Hey {{USER_NAME}},</p>
              
              <p class="message">
                You requested to change your password. For security purposes, please verify your identity using the 
                One-Time Password (OTP) below:
              </p>
              
              <div class="otp-container">
                <p class="otp-label">Your OTP Code</p>
                <p class="otp-code">{{OTP_CODE}}</p>
                <p class="otp-validity">⏰ Valid for {{OTP_EXPIRY_MINUTES}} minutes</p>
              </div>
              
              <p class="message">
                Enter this code on the password change page to complete your request. 
                <strong>Do not share this code with anyone.</strong>
              </p>
              
              <div style="background-color: #FEE2E2; border-left: 4px solid #EF4444; padding: 15px 20px; margin: 25px 0; border-radius: 6px;">
                <p style="font-size: 13px; color: #991B1B; margin: 0; line-height: 1.6;">
                  <strong>Didn't request this?</strong> If you didn't request a password change, please ignore this email 
                  and consider changing your password immediately if you suspect unauthorized access.
                </p>
              </div>
              
              <p class="message" style="margin-top: 30px;">
                Stay secure,<br>
                <strong>Anantapur FC Security Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p class="footer-company">Anantapur Football Club</p>
              <p style="font-size: 12px; color: #6B7280; margin: 15px 0 0;">
                © {{CURRENT_YEAR}} Anantapur FC. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. OTP-Based Password Change (Logged-In Users)

### 3.1 Overview

This feature allows **logged-in users** to securely change their password using a two-step verification process:

1. **Step 1:** User provides old password, new password, and confirmation
2. **Step 2:** System validates inputs and sends 6-digit OTP to email
3. **Step 3:** User enters OTP to complete password change

This is **different** from "Forgot Password" which is for users who are **not logged in**.

### 3.2 User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGGED-IN USER                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─→ Clicks "Change Password" in Profile
                            │
┌─────────────────────────────────────────────────────────────┐
│              STEP 1: Password Form                          │
│  ┌───────────────────────────────────────────────────┐     │
│  │ Old Password:        [**********]                 │     │
│  │ New Password:        [**********]                 │     │
│  │ Confirm New Password:[**********]                 │     │
│  │                                                     │     │
│  │              [Request OTP] Button                  │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─→ Validates:
                            │   • Old password correct?
                            │   • New password strong enough?
                            │   • Passwords match?
                            │   • New ≠ Old?
                            │
                            ├─→ ✅ Valid: Generate OTP
                            │   ❌ Invalid: Show error
                            │
┌─────────────────────────────────────────────────────────────┐
│              STEP 2: OTP Email Sent                         │
│  ┌───────────────────────────────────────────────────┐     │
│  │  📧 Email sent to user@example.com                │     │
│  │                                                     │     │
│  │  Subject: "OTP for Password Change"               │     │
│  │  Body: "Your code is ABC123"                      │     │
│  │  Expires: 10 minutes                               │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│              STEP 3: OTP Verification                       │
│  ┌───────────────────────────────────────────────────┐     │
│  │ Enter the 6-digit code sent to your email:        │     │
│  │                                                     │     │
│  │  [A] [B] [C] [1] [2] [3]                          │     │
│  │                                                     │     │
│  │  Expires in: 08:45                                 │     │
│  │                                                     │     │
│  │  [Verify & Change Password] [Resend Code]         │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─→ Validates OTP:
                            │   • Code correct?
                            │   • Not expired?
                            │   • Not used?
                            │   • Attempts < 3?
                            │
                            ├─→ ✅ Valid: Change password
                            │   ❌ Invalid: Show error
                            │
┌─────────────────────────────────────────────────────────────┐
│              SUCCESS: Password Changed                      │
│  ┌───────────────────────────────────────────────────┐     │
│  │  ✅ Password changed successfully!                │     │
│  │                                                     │     │
│  │  • Invalidate all other sessions (optional)        │     │
│  │  • Send confirmation email                         │     │
│  │  • Log security event                              │     │
│  │                                                     │     │
│  │  [Back to Profile]                                 │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Database Schema Updates

**Admin Model Extensions:**

```javascript
// File: backend/models/Admin.js

{
  // ... existing fields ...
  
  // OTP for password change
  passwordChangeOTP: {
    code: String,              // Hashed OTP code
    expiresAt: Date,           // Expiration timestamp
    attempts: {                // Track failed attempts
      type: Number,
      default: 0,
    },
    used: {                    // Prevent reuse
      type: Boolean,
      default: false,
    },
    newPasswordHash: String,   // Temporarily store new password hash
    createdAt: Date,
  },
  
  // Security audit log
  passwordChangeHistory: [{
    changedAt: Date,
    ipAddress: String,
    userAgent: String,
    method: {
      type: String,
      enum: ['forgot_password', 'change_password_otp']
    }
  }],
}
```

### 3.4 Backend Implementation

#### 3.4.1 OTP Utility Service

**File:** `backend/services/otpService.js`

```javascript
const crypto = require('crypto');

/**
 * Generate a 6-character alphanumeric OTP
 * @returns {string} - OTP code (e.g., "A3K9M2")
 */
const generateOTP = () => {
  const length = parseInt(process.env.OTP_LENGTH) || 6;
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes confusing chars (0,O,I,1)
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    otp += characters[randomIndex];
  }
  
  return otp;
};

/**
 * Hash OTP for secure storage
 * @param {string} otp - Plain OTP code
 * @returns {string} - Hashed OTP
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify OTP matches stored hash
 * @param {string} inputOTP - User-entered OTP
 * @param {string} storedHash - Stored hashed OTP
 * @returns {boolean} - Match status
 */
const verifyOTP = (inputOTP, storedHash) => {
  const inputHash = hashOTP(inputOTP.toUpperCase());
  return crypto.timingSafeEqual(
    Buffer.from(inputHash),
    Buffer.from(storedHash)
  );
};

/**
 * Check if OTP has expired
 * @param {Date} expiresAt - Expiration timestamp
 * @returns {boolean} - Expired status
 */
const isOTPExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP,
  isOTPExpired,
};
```

#### 3.4.2 Enhanced Email Service

**File:** `backend/services/emailService.js` (Update existing)

Add new function:

```javascript
/**
 * Send OTP email for password change
 * @param {string} email - Recipient email
 * @param {string} otpCode - Plain OTP code
 * @param {string} adminName - User name
 * @returns {Promise<boolean>}
 */
const sendPasswordChangeOTP = async (email, otpCode, adminName = "Coach") => {
  try {
    const transporter = createTransporter();
    const expiryMinutes = Math.floor((parseInt(process.env.OTP_EXPIRY) || 600000) / 60000);
    
    // Load HTML template
    const fs = require('fs');
    const path = require('path');
    const templatePath = path.join(__dirname, '../templates/otp-verification.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');
    
    // Replace placeholders
    htmlContent = htmlContent
      .replace(/{{USER_NAME}}/g, adminName)
      .replace(/{{OTP_CODE}}/g, otpCode)
      .replace(/{{OTP_EXPIRY_MINUTES}}/g, expiryMinutes)
      .replace(/{{CURRENT_YEAR}}/g, new Date().getFullYear());
    
    const textContent = `
Password Change OTP - Anantapur FC

Dear ${adminName},

You requested to change your password. Please use the following One-Time Password (OTP) to verify your identity:

OTP Code: ${otpCode}

This code is valid for ${expiryMinutes} minutes.

If you didn't request this, please ignore this email and consider changing your password if you suspect unauthorized access.

Stay secure,
Anantapur FC Security Team
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Anantapur FC" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Change Verification Code - Anantapur FC",
      text: textContent,
      html: htmlContent,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ OTP email sent to ${email}: ${info.messageId}`);
    
    return true;
  } catch (error) {
    console.error("✗ Error sending OTP email:", error);
    throw new Error("Failed to send OTP email. Please try again later.");
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendPasswordChangeOTP, // Add this
  testEmailConnection,
};
```

#### 3.4.3 API Endpoints

**File:** `backend/routes/adminRoutes.js` (Add these endpoints)

```javascript
const { generateOTP, hashOTP, verifyOTP, isOTPExpired } = require('../services/otpService');
const { sendPasswordChangeOTP } = require('../services/emailService');

// Rate limiter for OTP requests
const otpRequestLimiter = rateLimit({
  windowMs: parseInt(process.env.OTP_RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.OTP_RATE_LIMIT_MAX_REQUESTS) || 5,
  message: "Too many OTP requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/admins/change-password/request-otp
// Step 1: Request OTP for password change (authenticated users)
router.post("/change-password/request-otp", auth, otpRequestLimiter, async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.coach.id; // From auth middleware
    
    // Input validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Old password, new password, and confirmation are required",
      });
    }
    
    // Check passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match",
      });
    }
    
    // Password strength validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }
    
    // Get admin with password field
    const admin = await Admin.findOne({ id: userId }).select('+password');
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }
    
    // Check if new password is same as old
    const isSameAsOld = await bcrypt.compare(newPassword, admin.password);
    if (isSameAsOld) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }
    
    // Generate OTP
    const otpCode = generateOTP();
    const hashedOTP = hashOTP(otpCode);
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY) || 600000));
    
    // Hash new password temporarily
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Store OTP data
    admin.passwordChangeOTP = {
      code: hashedOTP,
      expiresAt: expiresAt,
      attempts: 0,
      used: false,
      newPasswordHash: newPasswordHash,
      createdAt: new Date(),
    };
    
    await admin.save();
    
    // Send OTP email
    try {
      await sendPasswordChangeOTP(admin.email, otpCode, admin.email);
    } catch (emailError) {
      // Clean up OTP data if email fails
      admin.passwordChangeOTP = undefined;
      await admin.save();
      
      return res.status(500).json({
        message: "Failed to send OTP email. Please try again later.",
      });
    }
    
    res.json({
      message: "OTP sent to your email address. Please check your inbox.",
      expiresIn: Math.floor((parseInt(process.env.OTP_EXPIRY) || 600000) / 60000), // minutes
    });
    
  } catch (error) {
    console.error("Request OTP error:", error);
    next(error);
  }
});

// POST /api/admins/change-password/verify-otp
// Step 2: Verify OTP and change password (authenticated users)
router.post("/change-password/verify-otp", auth, async (req, res, next) => {
  try {
    const { otp } = req.body;
    const userId = req.coach.id;
    
    // Input validation
    if (!otp || !otp.trim()) {
      return res.status(400).json({
        message: "OTP code is required",
      });
    }
    
    const otpUpper = otp.trim().toUpperCase();
    
    // Validate OTP format (6 alphanumeric characters)
    const otpLength = parseInt(process.env.OTP_LENGTH) || 6;
    if (otpUpper.length !== otpLength) {
      return res.status(400).json({
        message: `OTP must be ${otpLength} characters`,
      });
    }
    
    // Get admin
    const admin = await Admin.findOne({ id: userId });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    // Check if OTP exists
    if (!admin.passwordChangeOTP || !admin.passwordChangeOTP.code) {
      return res.status(400).json({
        message: "No OTP request found. Please request a new OTP.",
      });
    }
    
    // Check if OTP expired
    if (isOTPExpired(admin.passwordChangeOTP.expiresAt)) {
      admin.passwordChangeOTP = undefined;
      await admin.save();
      
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
      });
    }
    
    // Check if OTP already used
    if (admin.passwordChangeOTP.used) {
      return res.status(400).json({
        message: "OTP has already been used. Please request a new one.",
      });
    }
    
    // Check max attempts
    const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS) || 3;
    if (admin.passwordChangeOTP.attempts >= maxAttempts) {
      admin.passwordChangeOTP = undefined;
      await admin.save();
      
      return res.status(400).json({
        message: `Maximum verification attempts exceeded. Please request a new OTP.`,
      });
    }
    
    // Verify OTP
    const isValid = verifyOTP(otpUpper, admin.passwordChangeOTP.code);
    
    if (!isValid) {
      // Increment attempts
      admin.passwordChangeOTP.attempts += 1;
      await admin.save();
      
      const remainingAttempts = maxAttempts - admin.passwordChangeOTP.attempts;
      
      return res.status(401).json({
        message: `Invalid OTP code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
      });
    }
    
    // OTP is valid - change password
    admin.password = admin.passwordChangeOTP.newPasswordHash;
    
    // Mark OTP as used
    admin.passwordChangeOTP.used = true;
    
    // Add to password change history
    if (!admin.passwordChangeHistory) {
      admin.passwordChangeHistory = [];
    }
    
    admin.passwordChangeHistory.push({
      changedAt: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      method: 'change_password_otp',
    });
    
    await admin.save();
    
    // Clear OTP data after successful change
    admin.passwordChangeOTP = undefined;
    await admin.save();
    
    // Send confirmation email (non-blocking)
    sendPasswordChangedEmail(admin.email, admin.email).catch(err => {
      console.error("Failed to send confirmation email:", err);
    });
    
    console.log(`✓ Password changed successfully for ${admin.email} via OTP`);
    
    res.json({
      message: "Password changed successfully. Please login with your new password.",
    });
    
  } catch (error) {
    console.error("Verify OTP error:", error);
    next(error);
  }
});

// POST /api/admins/change-password/resend-otp
// Resend OTP if user didn't receive it (authenticated users)
router.post("/change-password/resend-otp", auth, otpRequestLimiter, async (req, res, next) => {
  try {
    const userId = req.coach.id;
    
    const admin = await Admin.findOne({ id: userId });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    // Check if there's an active OTP request
    if (!admin.passwordChangeOTP || !admin.passwordChangeOTP.newPasswordHash) {
      return res.status(400).json({
        message: "No active password change request found. Please start a new request.",
      });
    }
    
    // Generate new OTP
    const otpCode = generateOTP();
    const hashedOTP = hashOTP(otpCode);
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY) || 600000));
    
    // Update OTP data (keep the same newPasswordHash)
    admin.passwordChangeOTP.code = hashedOTP;
    admin.passwordChangeOTP.expiresAt = expiresAt;
    admin.passwordChangeOTP.attempts = 0;
    admin.passwordChangeOTP.used = false;
    admin.passwordChangeOTP.createdAt = new Date();
    
    await admin.save();
    
    // Send OTP email
    try {
      await sendPasswordChangeOTP(admin.email, otpCode, admin.email);
    } catch (emailError) {
      return res.status(500).json({
        message: "Failed to send OTP email. Please try again later.",
      });
    }
    
    res.json({
      message: "New OTP sent to your email address.",
      expiresIn: Math.floor((parseInt(process.env.OTP_EXPIRY) || 600000) / 60000),
    });
    
  } catch (error) {
    console.error("Resend OTP error:", error);
    next(error);
  }
});
```

### 3.5 Frontend Implementation

#### 3.5.1 Update API Service

**File:** `frontend/src/services/api.js`

Add new endpoints:

```javascript
export const API_ENDPOINTS = {
  // ... existing endpoints ...
  
  // Password change with OTP
  REQUEST_PASSWORD_CHANGE_OTP: '/admins/change-password/request-otp',
  VERIFY_PASSWORD_CHANGE_OTP: '/admins/change-password/verify-otp',
  RESEND_PASSWORD_CHANGE_OTP: '/admins/change-password/resend-otp',
};
```

#### 3.5.2 Change Password Component

**File:** `frontend/src/pages/ChangePassword.jsx`

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiService, API_ENDPOINTS } from "../services/api";

/**
 * ChangePassword Page
 * Allows logged-in users to change their password with OTP verification
 */
const ChangePassword = () => {
  const { coach, logout } = useAuth();
  const navigate = useNavigate();
  
  // Step 1: Password form
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP verification
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Step 2: OTP verification
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpExpiresIn, setOtpExpiresIn] = useState(10);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Password strength indicator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    
    const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    const colors = ["", "text-red-600", "text-orange-600", "text-yellow-600", "text-green-600", "text-green-700"];
    
    return { strength, label: labels[strength], color: colors[strength] };
  };
  
  const passwordStrength = getPasswordStrength(newPassword);
  
  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validations
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    
    if (newPassword === oldPassword) {
      setError("New password must be different from current password");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await apiService.post(API_ENDPOINTS.REQUEST_PASSWORD_CHANGE_OTP, {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      
      setOtpExpiresIn(response.expiresIn || 10);
      setStep(2);
      
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    
    setLoading(true);
    
    try {
      await apiService.post(API_ENDPOINTS.VERIFY_PASSWORD_CHANGE_OTP, {
        otp: otpCode,
      });
      
      setSuccess(true);
      
      // Logout and redirect to login after 3 seconds
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 3000);
      
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Resend OTP
  const handleResendOTP = async () => {
    setError("");
    setLoading(true);
    
    try {
      const response = await apiService.post(API_ENDPOINTS.RESEND_PASSWORD_CHANGE_OTP);
      setOtpExpiresIn(response.expiresIn || 10);
      setOtp(["", "", "", "", "", ""]);
      setError("");
      
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };
  
  // OTP input handlers
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^[A-Z0-9]$/i.test(value) && value !== "") return;
    
    const newOtp = [...otp];
    newOtp[index] = value.toUpperCase();
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };
  
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };
  
  // Success state
  if (success) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Password Changed Successfully!
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Your password has been updated. You'll be logged out and redirected to the login page.
            </p>
            <div className="text-sm text-gray-500">
              Redirecting in 3 seconds...
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-[calc(100vh-200px)] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Update your password to keep your account secure
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-red-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-red-600 font-medium' : 'text-gray-500'}>
              Enter Passwords
            </span>
            <span className={step >= 2 ? 'text-red-600 font-medium' : 'text-gray-500'}>
              Verify OTP
            </span>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 flex items-start gap-2" role="alert">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {/* Step 1: Password Form */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-5">
              {/* Current Password */}
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOldPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              
              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            passwordStrength.strength === 1 ? 'bg-red-500 w-1/5' :
                            passwordStrength.strength === 2 ? 'bg-orange-500 w-2/5' :
                            passwordStrength.strength === 3 ? 'bg-yellow-500 w-3/5' :
                            passwordStrength.strength === 4 ? 'bg-green-500 w-4/5' :
                            passwordStrength.strength === 5 ? 'bg-green-600 w-full' : 'w-0'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {confirmPassword && newPassword && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    {newPassword === confirmPassword ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Passwords match
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Passwords don't match
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li className={newPassword.length >= 6 ? 'text-green-600' : ''}>
                    At least 6 characters long
                  </li>
                  <li className={newPassword && newPassword !== oldPassword ? 'text-green-600' : ''}>
                    Different from current password
                  </li>
                </ul>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold text-sm hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Verification Code
                  </>
                )}
              </button>
            </form>
          )}
          
          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
                <p className="text-sm text-gray-600">
                  We've sent a 6-digit verification code to<br />
                  <span className="font-medium text-gray-900">{coach?.email}</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Code expires in {otpExpiresIn} minutes
                </p>
              </div>
              
              {/* OTP Input Boxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter Verification Code
                </label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all"
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold text-sm hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Verify & Change Password
                  </>
                )}
              </button>
              
              {/* Resend OTP */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors disabled:text-gray-400"
                >
                  Resend Code
                </button>
              </div>
              
              {/* Back Button */}
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="w-full text-gray-600 hover:text-gray-900 text-sm transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to password form
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
```

#### 3.5.3 Add Route to App.jsx

```jsx
import ChangePassword from "./pages/ChangePassword";

// Add protected route
<Route
  path="/change-password"
  element={
    <ProtectedRoute>
      <ChangePassword />
    </ProtectedRoute>
  }
/>
```

---

## 4. Security Considerations

### 4.1 Critical Security Measures

#### OTP Security:
1. ✅ **Short Expiration**: 10 minutes validity
2. ✅ **One-Time Use**: OTP invalidated after successful use
3. ✅ **Hashed Storage**: Never store plain OTP codes
4. ✅ **Attempt Limiting**: Max 3 verification attempts
5. ✅ **Rate Limiting**: Max 5 OTP requests per 15 minutes
6. ✅ **No Enumeration**: Don't reveal if email exists
7. ✅ **Timing-Safe Comparison**: Prevent timing attacks

#### Password Security:
1. ✅ **Minimum Length**: 6 characters (consider 8+ for production)
2. ✅ **bcrypt Hashing**: Industry-standard password hashing
3. ✅ **Salt Rounds**: 10 rounds (configurable via .env)
4. ✅ **Prevent Reuse**: New password must differ from old
5. ✅ **Validate Old Password**: Verify before allowing change
6. ✅ **Secure Transmission**: HTTPS in production

#### Email Security:
1. ✅ **App-Specific Passwords**: Never use main account password
2. ✅ **TLS Encryption**: Secure email transmission
3. ✅ **SPF/DKIM/DMARC**: Email authentication (production)
4. ✅ **No Sensitive Data**: Don't include passwords in emails

#### Session Security:
1. ⚠️ **Optional**: Invalidate all other sessions on password change
2. ✅ **JWT Expiry**: 7 days (configurable)
3. ✅ **Secure Cookies**: HttpOnly, Secure, SameSite
4. ✅ **CSRF Protection**: CSRF tokens on forms

### 4.2 Best Practices Checklist

- [ ] Enable HTTPS in production
- [ ] Rotate JWT_SECRET regularly
- [ ] Use environment-specific .env files
- [ ] Implement CAPTCHA for public endpoints
- [ ] Add IP-based blocking for repeated failures
- [ ] Monitor for suspicious activity
- [ ] Log security events (without sensitive data)
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Implement Content Security Policy (CSP)

---

## 5. Implementation Steps

### Phase 1: Environment Setup (30 minutes)

**Step 1.1:** Update backend/.env
```bash
# Add all new environment variables from section 1.3
```

**Step 1.2:** Create frontend/.env
```bash
# Create new file with variables from section 1.4
```

**Step 1.3:** Create .env.example files
```bash
cp backend/.env backend/.env.example
cp frontend/.env frontend/.env.example
# Remove sensitive values from .example files
```

**Step 1.4:** Update .gitignore
```bash
# Ensure .env files are ignored
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore
```

### Phase 2: Backend Implementation (2-3 hours)

**Step 2.1:** Update Admin Model
```bash
# Edit backend/models/Admin.js
# Add passwordChangeOTP and passwordChangeHistory fields
```

**Step 2.2:** Create OTP Service
```bash
# Create backend/services/otpService.js
# Implement generateOTP, hashOTP, verifyOTP functions
```

**Step 2.3:** Create Email Templates
```bash
mkdir -p backend/templates
# Create password-reset.html (section 2.3)
# Create otp-verification.html (section 2.4)
```

**Step 2.4:** Update Email Service
```bash
# Edit backend/services/emailService.js
# Update sendPasswordResetEmail to use new template
# Add sendPasswordChangeOTP function
```

**Step 2.5:** Add API Endpoints
```bash
# Edit backend/routes/adminRoutes.js
# Add /change-password/request-otp
# Add /change-password/verify-otp
# Add /change-password/resend-otp
```

**Step 2.6:** Install Dependencies (if needed)
```bash
cd backend
npm install
# No new dependencies required - using existing packages
```

### Phase 3: Frontend Implementation (2-3 hours)

**Step 3.1:** Update API Service
```bash
# Edit frontend/src/services/api.js
# Add new API_ENDPOINTS for OTP endpoints
```

**Step 3.2:** Create ChangePassword Component
```bash
# Create frontend/src/pages/ChangePassword.jsx
# Implement two-step form (passwords → OTP)
```

**Step 3.3:** Update App.jsx
```bash
# Add ChangePassword route
# Import and configure route protection
```

**Step 3.4:** Add Navigation Link
```bash
# Add "Change Password" link to user profile/settings
# Or in NavBar dropdown
```

### Phase 4: Testing (1-2 hours)

**Step 4.1:** Test Environment Variables
```bash
# Verify all variables load correctly
# Test both development and production configs
```

**Step 4.2:** Test Email Templates
```bash
# Send test emails
# Check rendering in multiple email clients
# Verify mobile responsiveness
```

**Step 4.3:** Test OTP Flow
```bash
# Request OTP with valid data
# Verify OTP email received
# Test OTP verification
# Test expiration
# Test max attempts
# Test resend functionality
```

**Step 4.4:** Test Security
```bash
# Test rate limiting
# Test invalid inputs
# Test concurrent requests
# Test timing attacks (OTP verification)
```

### Phase 5: Documentation & Deployment (1 hour)

**Step 5.1:** Update User Documentation
```bash
# Document password change process
# Create user guide
```

**Step 5.2:** Update Developer Documentation
```bash
# Document new API endpoints
# Update README
```

**Step 5.3:** Deployment Checklist
```bash
# Update production .env
# Test in staging environment
# Deploy backend
# Deploy frontend
# Monitor logs
```

---

## 6. Testing Strategy

### 6.1 Unit Tests

**Backend Tests:**

```javascript
// backend/tests/otpService.test.js
describe('OTP Service', () => {
  test('generates 6-character OTP', () => {
    const otp = generateOTP();
    expect(otp).toHaveLength(6);
    expect(/^[A-Z0-9]+$/.test(otp)).toBe(true);
  });
  
  test('hashes OTP correctly', () => {
    const otp = 'ABC123';
    const hash = hashOTP(otp);
    expect(hash).toHaveLength(64); // SHA-256 produces 64 hex chars
  });
  
  test('verifies correct OTP', () => {
    const otp = 'ABC123';
    const hash = hashOTP(otp);
    expect(verifyOTP('ABC123', hash)).toBe(true);
    expect(verifyOTP('abc123', hash)).toBe(true); // Case insensitive
    expect(verifyOTP('XYZ789', hash)).toBe(false);
  });
  
  test('detects expired OTP', () => {
    const pastDate = new Date(Date.now() - 1000);
    const futureDate = new Date(Date.now() + 1000);
    expect(isOTPExpired(pastDate)).toBe(true);
    expect(isOTPExpired(futureDate)).toBe(false);
  });
});
```

**Frontend Tests:**

```javascript
// frontend/src/tests/ChangePassword.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChangePassword from '../pages/ChangePassword';

describe('ChangePassword Component', () => {
  test('renders password form initially', () => {
    render(<ChangePassword />);
    expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
  });
  
  test('validates password match', async () => {
    render(<ChangePassword />);
    
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: 'differentpass' },
    });
    
    fireEvent.click(screen.getByText(/Send Verification Code/i));
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
});
```

### 6.2 Integration Tests

**API Flow Tests:**

```javascript
// backend/tests/password-change.integration.test.js
describe('Password Change Flow', () => {
  test('complete password change with OTP', async () => {
    // 1. Login
    const loginRes = await request(app)
      .post('/api/admins/login')
      .send({ email: 'test@example.com', password: 'oldpass123' });
    
    const token = loginRes.body.token;
    
    // 2. Request OTP
    const otpRes = await request(app)
      .post('/api/admins/change-password/request-otp')
      .set('Authorization', `Bearer ${token}`)
      .send({
        oldPassword: 'oldpass123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123',
      });
    
    expect(otpRes.status).toBe(200);
    
    // 3. Verify OTP (using mock OTP from test DB)
    const verifyRes = await request(app)
      .post('/api/admins/change-password/verify-otp')
      .set('Authorization', `Bearer ${token}`)
      .send({ otp: 'TEST12' });
    
    expect(verifyRes.status).toBe(200);
    
    // 4. Login with new password
    const newLoginRes = await request(app)
      .post('/api/admins/login')
      .send({ email: 'test@example.com', password: 'newpass123' });
    
    expect(newLoginRes.status).toBe(200);
  });
});
```

### 6.3 Security Tests

**Penetration Testing Checklist:**

- [ ] SQL Injection attempts
- [ ] XSS via form inputs
- [ ] CSRF token bypass
- [ ] Rate limit bypass
- [ ] Brute force OTP guessing
- [ ] Timing attack on OTP verification
- [ ] Session fixation
- [ ] Email header injection
- [ ] Password strength bypass

### 6.4 User Acceptance Testing

**Test Scenarios:**

1. **Happy Path**: User successfully changes password
2. **Wrong Old Password**: User enters incorrect current password
3. **Weak New Password**: User enters password < 6 chars
4. **Password Mismatch**: Confirmation doesn't match
5. **Expired OTP**: User waits >10 minutes before entering OTP
6. **Wrong OTP**: User enters incorrect code
7. **Max Attempts**: User fails OTP verification 3 times
8. **Resend OTP**: User requests new code
9. **Email Not Received**: User checks spam/reports issue
10. **Multiple Requests**: User spams request button (rate limited)

---

## 7. Potential Issues & Mitigations

### 7.1 Email Delivery Issues

**Issue:** OTP emails not reaching users

**Causes:**
- Spam filters blocking emails
- Email service credentials invalid
- Rate limiting by email provider
- User's email address invalid

**Mitigations:**
1. ✅ **Use professional email service** (SendGrid, AWS SES for production)
2. ✅ **Configure SPF, DKIM, DMARC** records
3. ✅ **Test email deliverability** before launch
4. ✅ **Provide alternative contact** in case of issues
5. ✅ **Add to whitelist instructions** in confirmation
6. ✅ **Monitor bounce rates** and delivery failures
7. ✅ **Fallback mechanism** (support contact)

### 7.2 OTP Timing Issues

**Issue:** OTP expiry too short/long

**Problem:**
- Too short: Users can't enter code in time
- Too long: Security risk

**Solution:**
- ✅ **10-minute expiry** (configurable via .env)
- ✅ **Clear expiry countdown** in UI
- ✅ **Easy resend** functionality
- ✅ **Monitor average completion time** and adjust

### 7.3 Rate Limiting False Positives

**Issue:** Legitimate users hit rate limits

**Causes:**
- Shared IP addresses (corporate networks)
- Multiple users behind NAT
- Testing/development

**Mitigations:**
1. ✅ **Combine IP + user ID** for rate limiting
2. ✅ **Whitelist known IPs** (optional)
3. ✅ **Clear error messages** explaining rate limits
4. ✅ **Gradual backoff** instead of hard blocks
5. ✅ **Monitor rate limit hits** and adjust thresholds

### 7.4 Session Management

**Issue:** User logged out unexpectedly after password change

**Options:**

**Option A:** Keep current session active
- ✅ Better UX (no re-login)
- ❌ Security risk if attacker initiated change

**Option B:** Force logout all sessions
- ✅ Better security
- ❌ Worse UX (must re-login)

**Recommended:** Option B for production, with clear messaging

**Implementation:**
```javascript
// After password change:
// 1. Invalidate all existing JWT tokens (add to blacklist)
// 2. Send confirmation email
// 3. Redirect to login with success message
```

### 7.5 Password Strength

**Issue:** Users choosing weak passwords

**Current:** Minimum 6 characters

**Production Recommendations:**

```javascript
const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  // Check against common passwords
  const commonPasswords = ['password', '12345678', 'qwerty', 'admin'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common. Please choose a stronger password");
  }
  
  return errors;
};
```

### 7.6 Concurrent Password Change Requests

**Issue:** User requests multiple OTPs simultaneously

**Mitigation:**
- ✅ **Invalidate previous OTPs** when new one generated
- ✅ **Rate limiting** prevents spam
- ✅ **Clear UI state** shows pending request
- ✅ **Disable button** during request

### 7.7 Email Template Compatibility

**Issue:** Email not rendering correctly across clients

**Testing Matrix:**

| Client | Desktop | Mobile | Dark Mode |
|--------|---------|--------|-----------|
| Gmail | ✅ | ✅ | ✅ |
| Outlook | ⚠️ | ⚠️ | ❌ |
| Apple Mail | ✅ | ✅ | ✅ |
| Yahoo | ✅ | ⚠️ | ⚠️ |

**Solutions:**
1. ✅ **Use inline CSS** (no external stylesheets)
2. ✅ **Table-based layouts** for compatibility
3. ✅ **Plain text fallback** always provided
4. ✅ **Test with Litmus** or Email on Acid
5. ✅ **Avoid complex CSS** features

### 7.8 Database Performance

**Issue:** OTP lookups slowing down at scale

**Optimizations:**
1. ✅ **Index on passwordChangeOTP.code** (already sparse)
2. ✅ **TTL index** to auto-delete expired OTPs
3. ✅ **Cache frequently accessed data** (Redis)
4. ✅ **Monitor slow queries** and optimize

```javascript
// MongoDB TTL Index (auto-delete expired OTPs)
AdminSchema.index(
  { "passwordChangeOTP.expiresAt": 1 },
  { expireAfterSeconds: 0 }
);
```

---

## Summary

This implementation plan provides a comprehensive guide to:

1. ✅ **Secure environment variable management** with detailed .env structure
2. ✅ **Professional email templates** inspired by AwesomeBooks design
3. ✅ **OTP-based password change** for logged-in users with robust security

**Key Features:**
- Two-step password change with OTP verification
- Beautiful, responsive email templates
- Enterprise-grade security measures
- Comprehensive error handling
- Detailed testing strategy
- Production-ready code

**Timeline:**
- Backend: 2-3 hours
- Frontend: 2-3 hours
- Testing: 1-2 hours
- Total: ~6-8 hours

**Security Highlights:**
- Hashed OTP storage
- Rate limiting
- Attempt limiting
- Timing-safe comparisons
- WCAG AA accessible UI

The system is designed to be scalable, secure, and user-friendly while maintaining the highest security standards for password management.

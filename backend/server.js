require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const ipMiddleware = require("./middleware/ipMiddleware");

const app = express();

// Trust proxy - Required for Render/Heroku deployment to correctly identify client IPs
app.set('trust proxy', 1);

// Async error wrapper for Express 5
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports.asyncHandler = asyncHandler;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased limit for base64 image uploads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(ipMiddleware); // Add IP tracking middleware

// Connect to MongoDB
connectDB();

// Initialize Azure services (only activates when AZURE_ENABLED=true)
const { initializeAzureServices } = require("./services/azureService");
if (process.env.NODE_ENV !== "test") {
  initializeAzureServices().catch((err) =>
    console.error("Azure initialization error:", err.message)
  );
}

// Initialize audit log cleanup scheduler
const { initializeScheduler } = require("./services/schedulerService");
if (process.env.NODE_ENV !== "test") {
  initializeScheduler();
}

// Seed about-page jersey data on startup
if (process.env.NODE_ENV !== "test") {
  setTimeout(async () => {
    try {
      const AboutJersey = require("./models/AboutJersey");
      await AboutJersey.seedDefaults();
    } catch (err) {
      console.error("AboutJersey seed error:", err.message);
    }
  }, 3000);
}

// API Documentation route
app.get("/", (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pocket Soccer Scout API Documentation</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        min-height: 100vh;
      }
      .container { 
        max-width: 1400px; 
        margin: 0 auto; 
        background: white;
        border-radius: 1rem;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        text-align: center;
      }
      .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
      .header p { font-size: 1.1rem; opacity: 0.9; }
      .content { padding: 2rem; }
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-top: 1rem;
        font-size: 0.95rem;
      }
      thead { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      th { 
        padding: 1rem; 
        text-align: left; 
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 0.5px;
      }
      td { 
        padding: 0.9rem 1rem; 
        border-bottom: 1px solid #e5e7eb;
      }
      tbody tr:hover { 
        background: #f9fafb;
        transition: background 0.2s;
      }
      .method { 
        display: inline-block;
        padding: 0.3rem 0.7rem;
        border-radius: 0.4rem;
        font-weight: 600;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
      }
      .get { background: #dbeafe; color: #1e40af; }
      .post { background: #d1fae5; color: #065f46; }
      .put { background: #fef3c7; color: #92400e; }
      .delete { background: #fee2e2; color: #991b1b; }
      .endpoint { 
        font-family: "Courier New", monospace;
        color: #1f2937;
        font-weight: 500;
      }
      .access { 
        display: inline-block;
        padding: 0.25rem 0.6rem;
        border-radius: 0.3rem;
        font-size: 0.75rem;
        font-weight: 500;
      }
      .public { background: #d1fae5; color: #065f46; }
      .auth { background: #fef3c7; color: #92400e; }
      .super { background: #fee2e2; color: #991b1b; }
      .section-title {
        background: #f3f4f6;
        font-weight: 700;
        color: #1f2937;
        font-size: 1rem;
        padding: 1rem !important;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .footer {
        background: #f9fafb;
        padding: 1.5rem;
        text-align: center;
        color: #6b7280;
        font-size: 0.9rem;
        border-top: 1px solid #e5e7eb;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Pocket Soccer Scout API</h1>
        <p>Complete API Documentation - All Available Endpoints</p>
      </div>
      
      <div class="content">
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>Endpoint</th>
              <th>Description</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            <!-- Health & Monitoring -->
            <tr>
              <td colspan="4" class="section-title">Health & Database Monitoring</td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/ping</td>
              <td>Database keepalive ping - Returns response time and status</td>
              <td><span class="access public">Public</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/health</td>
              <td>Health check - Database connection status and metrics</td>
              <td><span class="access public">Public</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/db/metrics</td>
              <td>Database metrics - Storage usage, collections, free tier status</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>

            <!-- Authentication -->
            <tr>
              <td colspan="4" class="section-title">Authentication & Admin Management</td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td class="endpoint">/api/admins/register</td>
              <td>Register new admin/coach account</td>
              <td><span class="access public">Public</span></td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td class="endpoint">/api/admins/login</td>
              <td>Admin/coach login - Returns JWT token</td>
              <td><span class="access public">Public</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/admins/me</td>
              <td>Get current authenticated admin profile</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/admins</td>
              <td>List all admins/coaches</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>
            <tr>
              <td><span class="method put">PUT</span></td>
              <td class="endpoint">/api/admins/:id</td>
              <td>Update admin profile</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>
            <tr>
              <td><span class="method delete">DELETE</span></td>
              <td class="endpoint">/api/admins/:id</td>
              <td>Delete admin account</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>

            <!-- Password Management -->
            <tr>
              <td colspan="4" class="section-title">Password Management (OTP-based)</td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td class="endpoint">/api/admins/forgot-password</td>
              <td>Request password reset OTP via email</td>
              <td><span class="access public">Public</span></td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td class="endpoint">/api/admins/verify-reset-otp</td>
              <td>Verify OTP and reset password</td>
              <td><span class="access public">Public</span></td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td class="endpoint">/api/admins/resend-otp</td>
              <td>Resend password reset OTP</td>
              <td><span class="access public">Public</span></td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td class="endpoint">/api/admins/change-password/request-otp</td>
              <td>Request OTP for password change (logged-in users)</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td class="endpoint">/api/admins/change-password/verify-otp</td>
              <td>Verify OTP and change password</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td class="endpoint">/api/admins/change-password/resend-otp</td>
              <td>Resend password change OTP</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>

            <!-- Players -->
            <tr>
              <td colspan="4" class="section-title">Player Management</td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/players</td>
              <td>Get all players with filters (age, position, skills)</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/players/:id</td>
              <td>Get player details by ID</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td class="endpoint">/api/players</td>
              <td>Create new player profile</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>
            <tr>
              <td><span class="method put">PUT</span></td>
              <td class="endpoint">/api/players/:id</td>
              <td>Update player profile</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>
            <tr>
              <td><span class="method delete">DELETE</span></td>
              <td class="endpoint">/api/players/:id</td>
              <td>Soft delete player (moves to deleted records)</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>

            <!-- Tournaments -->
            <tr>
              <td colspan="4" class="section-title">Tournament Management</td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/tournaments</td>
              <td>Get all tournaments with filters</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/tournaments/:id</td>
              <td>Get tournament details by ID</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td class="endpoint">/api/tournaments</td>
              <td>Create new tournament</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>
            <tr>
              <td><span class="method put">PUT</span></td>
              <td class="endpoint">/api/tournaments/:id</td>
              <td>Update tournament details</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>
            <tr>
              <td><span class="method delete">DELETE</span></td>
              <td class="endpoint">/api/tournaments/:id</td>
              <td>Soft delete tournament</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>

            <!-- Audit Logs -->
            <tr>
              <td colspan="4" class="section-title">Audit Logs & Activity Tracking</td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/audit</td>
              <td>Get paginated audit logs with filters</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/audit/stats</td>
              <td>Get audit statistics (counts by action, entity, severity)</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/audit/entity/:type/:id</td>
              <td>Get audit logs for specific entity (player/tournament)</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/audit/actor/:id</td>
              <td>Get audit logs by admin/actor ID</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/audit/my-activity</td>
              <td>Get current user's audit activity</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/audit/enums</td>
              <td>Get audit log enum values (actions, entities, severities)</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>

            <!-- Audit Reports -->
            <tr>
              <td colspan="4" class="section-title">Audit Reports (PDF + Email)</td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td class="endpoint">/api/audit/reports/current-month</td>
              <td>Generate current month audit report (PDF + email)</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td class="endpoint">/api/audit/reports/custom</td>
              <td>Generate custom date range report (PDF + email)</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td class="endpoint">/api/audit/reports/test-cleanup</td>
              <td>Generate cleanup test report (validates retention system)</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>

            <!-- Restoration -->
            <tr>
              <td colspan="4" class="section-title">Deleted Records Restoration (30-day retention)</td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/restore/deleted</td>
              <td>Get all deleted records (players + tournaments)</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/restore/deleted/:type</td>
              <td>Get deleted records by type (player/tournament)</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/restore/stats</td>
              <td>Get restoration statistics</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/restore/preview/:type/:id</td>
              <td>Preview deleted record before restoration</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/restore/validate/:type/:id</td>
              <td>Validate if record can be restored</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td class="endpoint">/api/restore/:type/:id</td>
              <td>Restore deleted record</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/restore/retention</td>
              <td>Get retention policy info and cleanup schedule</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>

            <!-- Export -->
            <tr>
              <td colspan="4" class="section-title">Data Export (Excel)</td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/export/info</td>
              <td>Get export service information and statistics</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/export/players</td>
              <td>Export players data to Excel</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/export/tournaments</td>
              <td>Export tournaments data to Excel</td>
              <td><span class="access auth">Auth Required</span></td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td class="endpoint">/api/export/all/combined</td>
              <td>Export all data (players + tournaments) to single Excel file</td>
              <td><span class="access super">SUPER_ADMIN</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p><strong>Pocket Soccer Scout API</strong> | Version 2.1.3 | Automated DB Pings: 3x Daily (8 AM, 2 PM, 8 PM)</p>
        <p>Audit Retention: 30 days | Auto-cleanup: Daily at 2:00 AM</p>
      </div>
    </div>
  </body>
  </html>
  `;
  res.send(html);
});

// Routes
app.use("/api/players", require("./routes/playerRoutes"));
app.use("/api/tournaments", require("./routes/tournamentRoutes"));
app.use("/api/trainings", require("./routes/trainingRoutes"));
app.use("/api/admins", require("./routes/adminRoutes"));
app.use("/api/audit", require("./routes/auditRoutes"));
app.use("/api/restore", require("./routes/restorationRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/jersey-likes", require("./routes/jerseyLikeRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));       // Gallery images
app.use("/api/contact-info", require("./routes/contactInfoRoutes")); // Contact info management
app.use("/api/upload", require("./routes/uploadRoutes"));         // Image uploads (Cloudinary/Azure)
app.use("/api/about-content", require("./routes/aboutContentRoutes")); // About page content
app.use("/api", require("./routes/healthRoutes")); // Health and DB routes

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  });
});

// Export app for testing
module.exports = app;

const PORT = process.env.PORT || 5000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== "test") {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`🔗 Access at: http://localhost:${PORT}`);
    console.log(`🔗 Or at: http://127.0.0.1:${PORT}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use!`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
    }
  });
}
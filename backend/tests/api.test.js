const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const http = require("http");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Admin = require("../models/Admin");

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}`;
const MONGO_URI = process.env.MONGO_URI;

// Server instance
let server = null;

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

let superAdminToken = "";
let adminToken = "";
let testPlayerId = "";
let testTournamentId = "";

// Helper to log test results
function logTest(name, passed, details = "") {
  const status = passed ? "[OK] PASS" : "[ERROR] FAIL";
  console.log(`   ${status}: ${name}`);
  if (!passed && details) console.log(`      → ${details}`);
  testResults.tests.push({ name, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

// HTTP request helper
function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Start server for testing
async function startServer() {
  return new Promise((resolve, reject) => {
    // Set test environment
    process.env.NODE_ENV = "test";
    
    // Import the app (this connects to MongoDB)
    const app = require("../server");
    
    server = app.listen(PORT, () => {
      console.log(`[OK] Test server started on port ${PORT}`);
      resolve();
    });
    
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`[WARN] Port ${PORT} already in use, assuming server is running`);
        server = null;
        resolve();
      } else {
        reject(err);
      }
    });
  });
}

// Stop server after tests
async function stopServer() {
  if (server) {
    return new Promise((resolve) => {
      server.close(() => {
        console.log("Test server stopped");
        resolve();
      });
    });
  }
}

async function runAPITests() {
  console.log("\n" + "=".repeat(60));
  console.log("RUNNING API ENDPOINT TESTS");
  console.log("=".repeat(60));

  try {
    // Start the server (this also connects to MongoDB)
    console.log("\n[START] Starting test server...");
    await startServer();
    
    // Wait for server and MongoDB to be fully ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Setup: Ensure test admins exist using the server's mongoose connection
    console.log("\nSetting up test data...");
    
    // Create test admins if they don't exist
    const superAdminExists = await Admin.findOne({ email: "aanubothu@gmail.com" });
    if (!superAdminExists) {
      console.log("Creating test Super Admin...");
      await Admin.create({
        email: "aanubothu@gmail.com",
        password: await bcrypt.hash("Aravind@13", 10),
        role: "SUPER_ADMIN",
      });
    }

    const adminExists = await Admin.findOne({ email: "charannaikcharan734@gmail.com" });
    if (!adminExists) {
      console.log("Creating test Admin...");
      await Admin.create({
        email: "charannaikcharan734@gmail.com",
        password: await bcrypt.hash("Charan@11", 10),
        role: "ADMIN",
      });
    }

    console.log("[OK] Setup complete\n");

    // ========================================
    // HEALTH CHECK TESTS
    // ========================================
    console.log("HEALTH CHECK TESTS");
    console.log("-".repeat(40));

    // Test 1: Health check endpoint
    try {
      const res = await makeRequest("GET", "/");
      logTest("Health check returns 200", res.status === 200);
    } catch (error) {
      logTest("Health check returns 200", false, error.message);
    }

    // ========================================
    // AUTHENTICATION TESTS
    // ========================================
    console.log("\nAUTHENTICATION TESTS");
    console.log("-".repeat(40));

    // Test 2: Super Admin login
    try {
      const res = await makeRequest("POST", "/api/admins/login", {
        email: "aanubothu@gmail.com",
        password: "Aravind@13",
      });
      superAdminToken = res.data.token || "";
      logTest("Super Admin login", res.status === 200 && res.data.token);
    } catch (error) {
      logTest("Super Admin login", false, error.message);
    }

    // Test 3: Regular Admin login
    try {
      const res = await makeRequest("POST", "/api/admins/login", {
        email: "charannaikcharan734@gmail.com",
        password: "Charan@11",
      });
      adminToken = res.data.token || "";
      logTest("Regular Admin login", res.status === 200 && res.data.token);
    } catch (error) {
      logTest("Regular Admin login", false, error.message);
    }

    // Test 4: Login with wrong password
    try {
      const res = await makeRequest("POST", "/api/admins/login", {
        email: "aanubothu@gmail.com",
        password: "WrongPassword",
      });
      logTest("Wrong password rejected", res.status === 400);
    } catch (error) {
      logTest("Wrong password rejected", false, error.message);
    }

    // Test 5: Login with non-existent email
    try {
      const res = await makeRequest("POST", "/api/admins/login", {
        email: "notexist@example.com",
        password: "password123",
      });
      logTest("Non-existent email rejected", res.status === 400);
    } catch (error) {
      logTest("Non-existent email rejected", false, error.message);
    }

    // ========================================
    // PLAYER ENDPOINT TESTS
    // ========================================
    console.log("\nPLAYER ENDPOINT TESTS");
    console.log("-".repeat(40));

    // Test 6: Get all players
    try {
      const res = await makeRequest("GET", "/api/players");
      logTest("GET /api/players returns 200", res.status === 200);
    } catch (error) {
      logTest("GET /api/players returns 200", false, error.message);
    }

    // Test 7: Create new player
    try {
      const res = await makeRequest("POST", "/api/players", {
        name: "API Test Player",
        age: 15,
        age_group: "U15",
        gender: "Male",
        size: "M",
        height: 170,
        weight: 60,
        jersey_no: 88,
        city: "Test City",
      });
      testPlayerId = res.data.player?.id || res.data.id || "";
      logTest("POST /api/players creates player", res.status === 201);
    } catch (error) {
      logTest("POST /api/players creates player", false, error.message);
    }

    // Test 8: Get player by ID
    try {
      if (testPlayerId) {
        const res = await makeRequest("GET", `/api/players/${testPlayerId}`);
        logTest("GET /api/players/:id returns player", res.status === 200);
      } else {
        logTest("GET /api/players/:id returns player", false, "No test player ID");
      }
    } catch (error) {
      logTest("GET /api/players/:id returns player", false, error.message);
    }

    // Test 9: Update player
    try {
      if (testPlayerId) {
        const res = await makeRequest("PUT", `/api/players/${testPlayerId}`, {
          name: "Updated Test Player",
          city: "Updated City",
        });
        logTest("PUT /api/players/:id updates player", res.status === 200);
      } else {
        logTest("PUT /api/players/:id updates player", false, "No test player ID");
      }
    } catch (error) {
      logTest("PUT /api/players/:id updates player", false, error.message);
    }

    // Test 10: Delete player without auth (should fail)
    try {
      if (testPlayerId) {
        const res = await makeRequest("DELETE", `/api/players/${testPlayerId}`);
        logTest("DELETE without auth rejected", res.status === 401);
      } else {
        logTest("DELETE without auth rejected", false, "No test player ID");
      }
    } catch (error) {
      logTest("DELETE without auth rejected", false, error.message);
    }

    // Test 11: Delete player with regular admin (should fail)
    try {
      if (testPlayerId && adminToken) {
        const res = await makeRequest("DELETE", `/api/players/${testPlayerId}`, null, adminToken);
        logTest("DELETE with regular Admin rejected", res.status === 403);
      } else {
        logTest("DELETE with regular Admin rejected", false, "Missing player ID or admin token");
      }
    } catch (error) {
      logTest("DELETE with regular Admin rejected", false, error.message);
    }

    // Test 12: Delete player with Super Admin (should succeed)
    try {
      if (testPlayerId && superAdminToken) {
        const res = await makeRequest("DELETE", `/api/players/${testPlayerId}`, null, superAdminToken);
        logTest("DELETE with Super Admin succeeds", res.status === 200);
      } else {
        logTest("DELETE with Super Admin succeeds", false, "Missing player ID or super admin token");
      }
    } catch (error) {
      logTest("DELETE with Super Admin succeeds", false, error.message);
    }

    // ========================================
    // TOURNAMENT ENDPOINT TESTS
    // ========================================
    console.log("\n[TOURNAMENT] TOURNAMENT ENDPOINT TESTS");
    console.log("-".repeat(40));

    // Test 13: Get all tournaments
    try {
      const res = await makeRequest("GET", "/api/tournaments");
      logTest("GET /api/tournaments returns 200", res.status === 200);
    } catch (error) {
      logTest("GET /api/tournaments returns 200", false, error.message);
    }

    // Test 14: Create new tournament
    try {
      const res = await makeRequest("POST", "/api/tournaments", {
        name: "API Test Tournament",
        age_group: "U15",
        status: "Upcoming",
        start_date: "2026-08-01",
        end_date: "2026-08-10",
        location: "Test Stadium",
      });
      testTournamentId = res.data.tournament?.id || res.data.id || "";
      logTest("POST /api/tournaments creates tournament", res.status === 201);
    } catch (error) {
      logTest("POST /api/tournaments creates tournament", false, error.message);
    }

    // Test 15: Delete tournament with Super Admin
    try {
      if (testTournamentId && superAdminToken) {
        const res = await makeRequest("DELETE", `/api/tournaments/${testTournamentId}`, null, superAdminToken);
        logTest("DELETE tournament with Super Admin", res.status === 200);
      } else {
        logTest("DELETE tournament with Super Admin", false, "Missing tournament ID or token");
      }
    } catch (error) {
      logTest("DELETE tournament with Super Admin", false, error.message);
    }

    // ========================================
    // ADMIN ENDPOINT TESTS
    // ========================================
    console.log("\n[ADMIN] ADMIN ENDPOINT TESTS");
    console.log("-".repeat(40));

    // Test 16: Get all admins without auth (should fail)
    try {
      const res = await makeRequest("GET", "/api/admins");
      logTest("GET /api/admins without auth rejected", res.status === 401);
    } catch (error) {
      logTest("GET /api/admins without auth rejected", false, error.message);
    }

    // Test 17: Get all admins with regular admin (should fail)
    try {
      if (adminToken) {
        const res = await makeRequest("GET", "/api/admins", null, adminToken);
        logTest("GET /api/admins with regular Admin rejected", res.status === 403);
      } else {
        logTest("GET /api/admins with regular Admin rejected", false, "No admin token");
      }
    } catch (error) {
      logTest("GET /api/admins with regular Admin rejected", false, error.message);
    }

    // Test 18: Get all admins with Super Admin (should succeed)
    try {
      if (superAdminToken) {
        const res = await makeRequest("GET", "/api/admins", null, superAdminToken);
        logTest("GET /api/admins with Super Admin succeeds", res.status === 200);
      } else {
        logTest("GET /api/admins with Super Admin succeeds", false, "No super admin token");
      }
    } catch (error) {
      logTest("GET /api/admins with Super Admin succeeds", false, error.message);
    }

    // ========================================
    // 404 TESTS
    // ========================================
    console.log("\n404 TESTS");
    console.log("-".repeat(40));

    // Test 19: Non-existent route returns 404
    try {
      const res = await makeRequest("GET", "/api/nonexistent");
      logTest("Non-existent route returns 404", res.status === 404);
    } catch (error) {
      logTest("Non-existent route returns 404", false, error.message);
    }

    // Test 20: Non-existent player returns 404
    try {
      const res = await makeRequest("GET", "/api/players/non-existent-id");
      logTest("Non-existent player returns 404", res.status === 404);
    } catch (error) {
      logTest("Non-existent player returns 404", false, error.message);
    }

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("[SUMMARY] API TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(`   Total:  ${testResults.passed + testResults.failed}`);
    console.log(`   Passed: ${testResults.passed} [OK]`);
    console.log(`   Failed: ${testResults.failed} [ERROR]`);
    console.log("=".repeat(60));

    if (testResults.failed > 0) {
      console.log("\n[ERROR] FAILED TESTS:");
      testResults.tests
        .filter((t) => !t.passed)
        .forEach((t) => console.log(`   - ${t.name}: ${t.details}`));
    }

  } catch (error) {
    console.error("[ERROR] Test suite error:", error.message);
  } finally {
    // Stop the server
    await stopServer();
    
    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("Database connection closed");
    }
    
    process.exit(testResults.failed > 0 ? 1 : 0);
  }
}

runAPITests();

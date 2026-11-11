/**
 * Admin RUD (Read, Update, Delete) Tests
 * Tests the admin endpoints for reading, updating and deleting
 */

const http = require("http");
const mongoose = require("mongoose");
require("dotenv").config();

const BASE_URL = "http://localhost:5001/api";

// Store created admin IDs for cleanup
let createdAdminIds = [];
let server;
let serverStarted = false;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: { "Content-Type": "application/json" },
    };
    if (token) options.headers["Authorization"] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Start the server
async function startServer() {
  if (serverStarted) return;
  
  return new Promise((resolve, reject) => {
    const app = require("../server");
    server = app.listen(5001, () => {
      console.log("Test server started on port 5001");
      serverStarted = true;
      // Give server a moment to fully initialize
      setTimeout(resolve, 1000);
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log("Port 5001 already in use, assuming server is running");
        serverStarted = true;
        resolve();
      } else {
        reject(err);
      }
    });
  });
}

// Stop the server
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

// Test results tracking
let passed = 0;
let failed = 0;
const results = [];

function test(name, success, details = "") {
  if (success) {
    passed++;
    results.push({ name, status: "PASS", details });
    console.log(`  [OK] ${name}`);
  } else {
    failed++;
    results.push({ name, status: "FAIL", details });
    console.log(`  [ERROR] ${name} - ${details}`);
  }
}

async function runTests() {
  console.log("\n========================================");
  console.log("ADMIN RUD TESTS");
  console.log("========================================\n");

  try {
    // Start server
    await startServer();

    // ============================================
    // 1. LOGIN AS SUPER ADMIN
    // ============================================
    console.log("LOGIN TESTS");
    const superAdminLogin = await makeRequest("POST", "/admins/login", {
      email: "aanubothu@gmail.com",
      password: "Aravind@13",
    });
    test(
      "Super Admin login successful",
      superAdminLogin.status === 200 && superAdminLogin.data.token,
      superAdminLogin.status !== 200 ? `Status: ${superAdminLogin.status}` : ""
    );

    if (superAdminLogin.status !== 200) {
      console.log("\n[ERROR] Cannot proceed without Super Admin login");
      return;
    }

    const superAdminToken = superAdminLogin.data.token;

    // ============================================
    // 2. READ OPERATIONS
    // ============================================
    console.log("\nREAD TESTS");

    // Get all admins
    const allAdmins = await makeRequest("GET", "/admins", null, superAdminToken);
    test(
      "GET /api/admins - List all admins",
      allAdmins.status === 200 && Array.isArray(allAdmins.data),
      allAdmins.status !== 200 ? `Status: ${allAdmins.status}` : ""
    );

    console.log(`   Found ${allAdmins.data?.length || 0} admins`);

    // Get single admin by ID
    const adminToRead = allAdmins.data?.find((a) => a.role === "ADMIN");
    if (adminToRead) {
      const singleAdmin = await makeRequest(
        "GET",
        `/admins/${adminToRead.id}`,
        null,
        superAdminToken
      );
      test(
        "GET /api/admins/:id - Get single admin",
        singleAdmin.status === 200 && singleAdmin.data.email === adminToRead.email,
        singleAdmin.status !== 200 ? `Status: ${singleAdmin.status}` : ""
      );
    }

    // Get non-existent admin
    const notFoundAdmin = await makeRequest(
      "GET",
      "/admins/nonexistent-id-12345",
      null,
      superAdminToken
    );
    test(
      "GET /api/admins/:id - Non-existent admin returns 404",
      notFoundAdmin.status === 404,
      `Status: ${notFoundAdmin.status}`
    );

    // ============================================
    // 3. UPDATE OPERATIONS (DEMOTE)
    // ============================================
    console.log("\nUPDATE TESTS (DEMOTE)");

    // Create a test admin to demote (use unique email)
    const demoteTestEmail = `test-demote-${Date.now()}@example.com`;
    const createRes = await makeRequest(
      "POST",
      "/admins",
      {
        email: demoteTestEmail,
        password: "TestPass123",
        role: "SUPER_ADMIN",
      },
      superAdminToken
    );

    if (createRes.status === 201) {
      createdAdminIds.push(createRes.data.admin.id);
      const testAdmin = createRes.data.admin;

      // Demote the admin
      const demoteRes = await makeRequest(
        "PUT",
        `/admins/${testAdmin.id}/demote`,
        null,
        superAdminToken
      );
      test(
        "PUT /api/admins/:id/demote - Demote SUPER_ADMIN to ADMIN",
        demoteRes.status === 200 && demoteRes.data.admin?.role === "ADMIN",
        demoteRes.status !== 200 ? `Status: ${demoteRes.status}` : ""
      );

      // Try to demote again (already at lowest role)
      const demoteAgain = await makeRequest(
        "PUT",
        `/admins/${testAdmin.id}/demote`,
        null,
        superAdminToken
      );
      test(
        "PUT /api/admins/:id/demote - Already at lowest role returns 400",
        demoteAgain.status === 400,
        `Status: ${demoteAgain.status}`
      );
    } else {
      test(
        "Create test admin for demote",
        false,
        `Status: ${createRes.status} - ${createRes.data?.message}`
      );
    }

    // Self-demotion prevention
    const selfDemote = await makeRequest(
      "PUT",
      `/admins/${superAdminLogin.data.admin.id}/demote`,
      null,
      superAdminToken
    );
    test(
      "PUT /api/admins/:id/demote - Cannot demote yourself",
      selfDemote.status === 400 && selfDemote.data.message?.includes("yourself"),
      `Status: ${selfDemote.status}`
    );

    // Demote non-existent admin
    const demoteNotFound = await makeRequest(
      "PUT",
      "/admins/nonexistent-id-12345/demote",
      null,
      superAdminToken
    );
    test(
      "PUT /api/admins/:id/demote - Non-existent admin returns 404",
      demoteNotFound.status === 404,
      `Status: ${demoteNotFound.status}`
    );

    // ============================================
    // 4. ACCESS CONTROL TESTS
    // ============================================
    console.log("\nACCESS CONTROL TESTS");

    // Login as regular admin
    const adminLogin = await makeRequest("POST", "/admins/login", {
      email: "charannaikcharan734@gmail.com",
      password: "Charan@11",
    });
    test(
      "Regular Admin login successful",
      adminLogin.status === 200 && adminLogin.data.token,
      adminLogin.status !== 200 ? `Status: ${adminLogin.status}` : ""
    );

    if (adminLogin.status === 200) {
      const adminToken = adminLogin.data.token;

      // Regular admin trying to access admin list (should be denied)
      const unauthorizedList = await makeRequest("GET", "/admins", null, adminToken);
      test(
        "GET /api/admins - Regular admin denied (403)",
        unauthorizedList.status === 403,
        `Status: ${unauthorizedList.status}`
      );

      // Regular admin trying to demote (should be denied)
      const unauthorizedDemote = await makeRequest(
        "PUT",
        `/admins/${superAdminLogin.data.admin.id}/demote`,
        null,
        adminToken
      );
      test(
        "PUT /api/admins/:id/demote - Regular admin denied (403)",
        unauthorizedDemote.status === 403,
        `Status: ${unauthorizedDemote.status}`
      );
    }

    // No token provided
    const noTokenList = await makeRequest("GET", "/admins", null, null);
    test(
      "GET /api/admins - No token returns 401",
      noTokenList.status === 401,
      `Status: ${noTokenList.status}`
    );

    // Invalid token
    const invalidTokenList = await makeRequest("GET", "/admins", null, "invalid-token");
    test(
      "GET /api/admins - Invalid token returns 401",
      invalidTokenList.status === 401,
      `Status: ${invalidTokenList.status}`
    );

    // ============================================
    // 5. DELETE OPERATIONS
    // ============================================
    console.log("\nDELETE TESTS");

    // Create a test admin to delete (use unique email)
    const deleteTestEmail = `test-delete-${Date.now()}@example.com`;
    const createForDelete = await makeRequest(
      "POST",
      "/admins",
      {
        email: deleteTestEmail,
        password: "TestPass123",
        role: "ADMIN",
      },
      superAdminToken
    );

    if (createForDelete.status === 201) {
      const adminToDelete = createForDelete.data.admin;

      // Delete the admin
      const deleteRes = await makeRequest(
        "DELETE",
        `/admins/${adminToDelete.id}`,
        null,
        superAdminToken
      );
      test(
        "DELETE /api/admins/:id - Delete admin successfully",
        deleteRes.status === 200 && deleteRes.data.message?.includes("deleted"),
        deleteRes.status !== 200 ? `Status: ${deleteRes.status}` : ""
      );

      // Verify admin is deleted (should return 404)
      const verifyDeleted = await makeRequest(
        "GET",
        `/admins/${adminToDelete.id}`,
        null,
        superAdminToken
      );
      test(
        "GET /api/admins/:id - Deleted admin returns 404",
        verifyDeleted.status === 404,
        `Status: ${verifyDeleted.status}`
      );
    } else {
      test(
        "Create test admin for delete",
        false,
        `Status: ${createForDelete.status} - ${createForDelete.data?.message}`
      );
    }

    // Self-deletion prevention
    const selfDelete = await makeRequest(
      "DELETE",
      `/admins/${superAdminLogin.data.admin.id}`,
      null,
      superAdminToken
    );
    test(
      "DELETE /api/admins/:id - Cannot delete yourself",
      selfDelete.status === 400 && selfDelete.data.message?.includes("yourself"),
      `Status: ${selfDelete.status}`
    );

    // Delete non-existent admin
    const deleteNotFound = await makeRequest(
      "DELETE",
      "/admins/nonexistent-id-12345",
      null,
      superAdminToken
    );
    test(
      "DELETE /api/admins/:id - Non-existent admin returns 404",
      deleteNotFound.status === 404,
      `Status: ${deleteNotFound.status}`
    );

    // Regular admin trying to delete (should be denied)
    if (adminLogin.status === 200) {
      const adminToken = adminLogin.data.token;
      const unauthorizedDelete = await makeRequest(
        "DELETE",
        `/admins/${superAdminLogin.data.admin.id}`,
        null,
        adminToken
      );
      test(
        "DELETE /api/admins/:id - Regular admin denied (403)",
        unauthorizedDelete.status === 403,
        `Status: ${unauthorizedDelete.status}`
      );
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log("\n========================================");
    console.log("[SUMMARY] ADMIN RUD TEST RESULTS");
    console.log("========================================");
    console.log(`Total: ${passed + failed}`);
    console.log(`Passed: ${passed} [OK]`);
    console.log(`Failed: ${failed} [ERROR]`);
    console.log("========================================\n");

  } catch (error) {
    console.error("Test error:", error.message);
  } finally {
    // Cleanup
    await stopServer();
    
    // Close mongoose connection after a short delay
    setTimeout(async () => {
      try {
        await mongoose.connection.close();
      } catch (e) {}
      process.exit(failed > 0 ? 1 : 0);
    }, 500);
  }
}

runTests();

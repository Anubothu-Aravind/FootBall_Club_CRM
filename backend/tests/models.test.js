const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Player = require("../models/Player");
const Tournament = require("../models/Tournament");
const Admin = require("../models/Admin");

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

// Helper to log test results
function logTest(name, passed, details = "") {
  const status = passed ? "[OK] PASS" : "[ERROR] FAIL";
  console.log(`   ${status}: ${name}`);
  if (!passed && details) console.log(`      → ${details}`);
  testResults.tests.push({ name, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

// Helper to generate JWT token
function generateToken(admin) {
  return jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function runTests() {
  console.log("\n" + "=".repeat(60));
  console.log("RUNNING SAMPLE TEST CASES");
  console.log("=".repeat(60));

  try {
    // Connect to MongoDB
    console.log("\nConnecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("[OK] Connected to MongoDB\n");

    // ========================================
    // PLAYER MODEL TESTS
    // ========================================
    console.log("PLAYER MODEL TESTS");
    console.log("-".repeat(40));

    // Test 1: Create a valid player
    try {
      const player = new Player({
        name: "Test Player",
        age: 15,
        age_group: "U15",
        gender: "Male",
        size: "M",
        height: 170,
        weight: 60,
        jersey_no: 99,
        address: "Test Address",
        city: "Test City",
      });
      await player.save();
      logTest("Create valid player", player.id !== undefined);
      await Player.deleteOne({ _id: player._id });
    } catch (error) {
      logTest("Create valid player", false, error.message);
    }

    // Test 2: Player should have UUID
    try {
      const player = new Player({
        name: "UUID Test",
        age: 14,
        age_group: "U15",
        gender: "Female",
        size: "S",
        height: 160,
        weight: 50,
        jersey_no: 7,
      });
      await player.save();
      const hasUUID = player.id && player.id.includes("-");
      logTest("Player has UUID format", hasUUID);
      await Player.deleteOne({ _id: player._id });
    } catch (error) {
      logTest("Player has UUID format", false, error.message);
    }

    // Test 3: Player gender enum validation
    try {
      const player = new Player({
        name: "Gender Test",
        age: 14,
        age_group: "U15",
        gender: "Invalid",
        size: "M",
        height: 170,
        weight: 60,
        jersey_no: 10,
      });
      await player.save();
      logTest("Gender enum validation", false, "Should have rejected invalid gender");
      await Player.deleteOne({ _id: player._id });
    } catch (error) {
      logTest("Gender enum validation", error.name === "ValidationError");
    }

    // Test 4: Find player by UUID
    try {
      const player = new Player({
        name: "Find Test",
        age: 16,
        age_group: "U17",
        gender: "Male",
        size: "L",
        height: 175,
        weight: 65,
        jersey_no: 11,
      });
      await player.save();
      const found = await Player.findOne({ id: player.id });
      logTest("Find player by UUID", found !== null && found.name === "Find Test");
      await Player.deleteOne({ _id: player._id });
    } catch (error) {
      logTest("Find player by UUID", false, error.message);
    }

    // ========================================
    // TOURNAMENT MODEL TESTS
    // ========================================
    console.log("\n[TOURNAMENT] TOURNAMENT MODEL TESTS");
    console.log("-".repeat(40));

    // Test 5: Create a valid tournament
    try {
      const tournament = new Tournament({
        name: "Test Tournament",
        age_group: "U15",
        status: "Upcoming",
        start_date: new Date("2026-07-01"),
        end_date: new Date("2026-07-10"),
        location: "Test Stadium",
        images: [],
      });
      await tournament.save();
      logTest("Create valid tournament", tournament.id !== undefined);
      await Tournament.deleteOne({ _id: tournament._id });
    } catch (error) {
      logTest("Create valid tournament", false, error.message);
    }

    // Test 6: Tournament status enum validation
    try {
      const tournament = new Tournament({
        name: "Status Test",
        age_group: "U15",
        status: "InvalidStatus",
        start_date: new Date(),
        end_date: new Date(),
        location: "Test",
      });
      await tournament.save();
      logTest("Status enum validation", false, "Should have rejected invalid status");
      await Tournament.deleteOne({ _id: tournament._id });
    } catch (error) {
      logTest("Status enum validation", error.name === "ValidationError");
    }

    // Test 7: Tournament with images array
    try {
      const tournament = new Tournament({
        name: "Images Test",
        age_group: "U17",
        status: "Ongoing",
        start_date: new Date(),
        end_date: new Date(),
        location: "Test Arena",
        images: ["http://example.com/img1.jpg", "http://example.com/img2.jpg"],
      });
      await tournament.save();
      logTest("Tournament with images", tournament.images.length === 2);
      await Tournament.deleteOne({ _id: tournament._id });
    } catch (error) {
      logTest("Tournament with images", false, error.message);
    }

    // ========================================
    // ADMIN MODEL TESTS
    // ========================================
    console.log("\n[ADMIN] ADMIN MODEL TESTS");
    console.log("-".repeat(40));

    // Test 8: Create a valid admin
    try {
      const hashedPassword = await bcrypt.hash("TestPass123", 10);
      const admin = new Admin({
        email: "test@example.com",
        password: hashedPassword,
        role: "ADMIN",
      });
      await admin.save();
      logTest("Create valid admin", admin.id !== undefined);
      await Admin.deleteOne({ _id: admin._id });
    } catch (error) {
      logTest("Create valid admin", false, error.message);
    }

    // Test 9: Admin role enum validation
    try {
      const hashedPassword = await bcrypt.hash("TestPass123", 10);
      const admin = new Admin({
        email: "roletest@example.com",
        password: hashedPassword,
        role: "INVALID_ROLE",
      });
      await admin.save();
      logTest("Role enum validation", false, "Should have rejected invalid role");
      await Admin.deleteOne({ _id: admin._id });
    } catch (error) {
      logTest("Role enum validation", error.name === "ValidationError");
    }

    // Test 10: Admin email uniqueness
    try {
      const hashedPassword = await bcrypt.hash("TestPass123", 10);
      const admin1 = new Admin({
        email: "unique@example.com",
        password: hashedPassword,
        role: "ADMIN",
      });
      await admin1.save();

      const admin2 = new Admin({
        email: "unique@example.com",
        password: hashedPassword,
        role: "ADMIN",
      });
      await admin2.save();
      logTest("Email uniqueness", false, "Should have rejected duplicate email");
      await Admin.deleteOne({ email: "unique@example.com" });
    } catch (error) {
      logTest("Email uniqueness", error.code === 11000);
      await Admin.deleteOne({ email: "unique@example.com" });
    }

    // ========================================
    // JWT TOKEN TESTS
    // ========================================
    console.log("\nJWT TOKEN TESTS");
    console.log("-".repeat(40));

    // Test 11: Generate valid JWT token
    try {
      const mockAdmin = { id: "test-id", email: "test@test.com", role: "SUPER_ADMIN" };
      const token = generateToken(mockAdmin);
      const decoded = jwt.verify(token, JWT_SECRET);
      logTest("Generate valid JWT", decoded.email === "test@test.com");
    } catch (error) {
      logTest("Generate valid JWT", false, error.message);
    }

    // Test 12: JWT contains role
    try {
      const mockAdmin = { id: "test-id", email: "test@test.com", role: "SUPER_ADMIN" };
      const token = generateToken(mockAdmin);
      const decoded = jwt.verify(token, JWT_SECRET);
      logTest("JWT contains role", decoded.role === "SUPER_ADMIN");
    } catch (error) {
      logTest("JWT contains role", false, error.message);
    }

    // Test 13: Invalid JWT rejected
    try {
      jwt.verify("invalid.token.here", JWT_SECRET);
      logTest("Invalid JWT rejected", false, "Should have thrown error");
    } catch (error) {
      logTest("Invalid JWT rejected", error.name === "JsonWebTokenError");
    }

    // ========================================
    // PASSWORD HASHING TESTS
    // ========================================
    console.log("\n[SECURITY] PASSWORD HASHING TESTS");
    console.log("-".repeat(40));

    // Test 14: Password hashing works
    try {
      const password = "MySecurePassword123";
      const hash = await bcrypt.hash(password, 10);
      logTest("Password hashing", hash !== password && hash.length > 50);
    } catch (error) {
      logTest("Password hashing", false, error.message);
    }

    // Test 15: Password comparison works
    try {
      const password = "MySecurePassword123";
      const hash = await bcrypt.hash(password, 10);
      const isMatch = await bcrypt.compare(password, hash);
      logTest("Password comparison", isMatch === true);
    } catch (error) {
      logTest("Password comparison", false, error.message);
    }

    // Test 16: Wrong password rejected
    try {
      const password = "MySecurePassword123";
      const hash = await bcrypt.hash(password, 10);
      const isMatch = await bcrypt.compare("WrongPassword", hash);
      logTest("Wrong password rejected", isMatch === false);
    } catch (error) {
      logTest("Wrong password rejected", false, error.message);
    }

    // ========================================
    // ROLE VERIFICATION TESTS
    // ========================================
    console.log("\n[SECURITY] ROLE VERIFICATION TESTS");
    console.log("-".repeat(40));

    // Test 17: Super Admin role check
    try {
      const admin = { role: "SUPER_ADMIN" };
      const isSuperAdmin = admin.role === "SUPER_ADMIN";
      logTest("Super Admin role check", isSuperAdmin === true);
    } catch (error) {
      logTest("Super Admin role check", false, error.message);
    }

    // Test 18: Regular Admin role check
    try {
      const admin = { role: "ADMIN" };
      const isSuperAdmin = admin.role === "SUPER_ADMIN";
      logTest("Regular Admin is not Super Admin", isSuperAdmin === false);
    } catch (error) {
      logTest("Regular Admin is not Super Admin", false, error.message);
    }

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("[SUMMARY] TEST SUMMARY");
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
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
    process.exit(testResults.failed > 0 ? 1 : 0);
  }
}

runTests();

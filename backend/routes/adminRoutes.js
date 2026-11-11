const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const auth = require("../middleware/authMiddleware");
const AuditService = require("../services/auditService");
const RestorationService = require("../services/restorationService");
const AuditLog = require("../models/AuditLog");

const router = express.Router();

// Middleware to check if user is Super Admin
const isSuperAdmin = (req, res, next) => {
  if (!req.coach || req.coach.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Access denied. Super Admin only." });
  }
  next();
};

// POST /api/admins - Create a new admin (Super Admin only)
router.post("/", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const { email, password, role, image } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }

    // Hash password - never store plain text
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "ADMIN",
      image: image || "",
    });

    await newAdmin.save();

    // Audit log for admin creation
    await AuditService.logAction({
      action: AuditLog.ACTIONS.CREATE,
      entityType: AuditLog.ENTITY_TYPES.ADMIN,
      entityId: newAdmin.id,
      entityName: newAdmin.email,
      newData: { email: newAdmin.email, role: newAdmin.role },
      actorId: req.coach.id,
      actorEmail: req.coach.email,
      actorRole: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
      description: AuditService.generateDescription(
        AuditLog.ACTIONS.CREATE,
        "ADMIN",
        newAdmin.email
      ),
    });

    // Return admin without password
    const adminResponse = {
      id: newAdmin.id,
      _id: newAdmin._id,
      email: newAdmin.email,
      role: newAdmin.role,
      image: newAdmin.image,
      createdAt: newAdmin.createdAt,
      updatedAt: newAdmin.updatedAt,
    };

    res.status(201).json({
      message: "Admin created successfully",
      admin: adminResponse,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Admin with this email already exists",
      });
    }
    next(error);
  }
});

// GET /api/admins/me - Get current authenticated admin's profile
router.get("/me", auth, async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ id: req.coach.id }).select("-password");

    if (!admin && req.coach.id.match(/^[0-9a-fA-F]{24}$/)) {
      const adminById = await Admin.findById(req.coach.id).select("-password");
      if (adminById) {
        return res.json(adminById);
      }
    }

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    next(error);
  }
});

// GET /api/admins - Get all admins (Super Admin only)
router.get("/", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    next(error);
  }
});

// GET /api/admins/:id - Get admin by ID (Super Admin only)
router.get("/:id", auth, isSuperAdmin, async (req, res, next) => {
  try {
    let admin = await Admin.findOne({ id: req.params.id }).select("-password");

    if (!admin && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      admin = await Admin.findById(req.params.id).select("-password");
    }

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admins/:id/demote - Demote admin (Super Admin only)
// SUPER_ADMIN -> ADMIN
router.put("/:id/demote", auth, isSuperAdmin, async (req, res, next) => {
  try {
    // Try to find by custom UUID id first, then by MongoDB _id
    let admin = await Admin.findOne({ id: req.params.id });

    if (!admin && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      admin = await Admin.findById(req.params.id);
    }

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Prevent self-demotion
    if (admin.id === req.coach.id || admin._id.toString() === req.coach.id) {
      return res.status(400).json({ message: "Cannot demote yourself" });
    }

    // Check if already at lowest role
    if (admin.role === "ADMIN") {
      return res.status(400).json({ message: "Admin is already at the lowest role" });
    }

    // Demote: SUPER_ADMIN -> ADMIN
    admin.role = "ADMIN";
    await admin.save();

    // Audit log for demotion
    await AuditService.logAction({
      action: AuditLog.ACTIONS.ADMIN_DEMOTE,
      entityType: AuditLog.ENTITY_TYPES.ADMIN,
      entityId: admin.id,
      entityName: admin.email,
      previousData: { role: "SUPER_ADMIN" },
      newData: { role: "ADMIN" },
      changedFields: ["role"],
      actorId: req.coach.id,
      actorEmail: req.coach.email,
      actorRole: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
      description: AuditService.generateDescription(
        AuditLog.ACTIONS.ADMIN_DEMOTE,
        "ADMIN",
        admin.email
      ),
    });

    // Return admin without password
    const adminResponse = {
      id: admin.id,
      _id: admin._id,
      email: admin.email,
      role: admin.role,
      image: admin.image,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };

    res.json({
      message: "Admin demoted successfully",
      admin: adminResponse,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admins/:id/promote - Promote admin (Super Admin only)
// ADMIN -> SUPER_ADMIN
router.put("/:id/promote", auth, isSuperAdmin, async (req, res, next) => {
  try {
    let admin = await Admin.findOne({ id: req.params.id });

    if (!admin && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      admin = await Admin.findById(req.params.id);
    }

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.id === req.coach.id || admin._id.toString() === req.coach.id) {
      return res.status(400).json({ message: "Cannot promote yourself" });
    }

    if (admin.role === "SUPER_ADMIN") {
      return res.status(400).json({ message: "Admin is already a Super Admin" });
    }

    admin.role = "SUPER_ADMIN";
    await admin.save();

    // Audit log for promotion
    await AuditService.logAction({
      action: AuditLog.ACTIONS.ADMIN_PROMOTE,
      entityType: AuditLog.ENTITY_TYPES.ADMIN,
      entityId: admin.id,
      entityName: admin.email,
      previousData: { role: "ADMIN" },
      newData: { role: "SUPER_ADMIN" },
      changedFields: ["role"],
      actorId: req.coach.id,
      actorEmail: req.coach.email,
      actorRole: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
      description: AuditService.generateDescription(
        AuditLog.ACTIONS.ADMIN_PROMOTE,
        "ADMIN",
        admin.email
      ),
    });

    const adminResponse = {
      id: admin.id,
      _id: admin._id,
      email: admin.email,
      role: admin.role,
      image: admin.image,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };

    res.json({
      message: "Admin promoted successfully",
      admin: adminResponse,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admins/:id/password - Reset/modify admin password (Super Admin only)
router.put("/:id/password", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    let admin = await Admin.findOne({ id: req.params.id });

    if (!admin && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      admin = await Admin.findById(req.params.id);
    }

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    admin.password = hashedPassword;
    
    // Add to password change history
    if (!admin.passwordChangeHistory) {
      admin.passwordChangeHistory = [];
    }
    
    admin.passwordChangeHistory.push({
      changedAt: new Date(),
      ipAddress: req.clientIP || req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      method: 'admin_reset',
    });
    
    await admin.save();

    // Audit log for password reset by admin
    await AuditService.logAction({
      action: AuditLog.ACTIONS.ADMIN_PASSWORD_RESET,
      entityType: AuditLog.ENTITY_TYPES.ADMIN,
      entityId: admin.id,
      entityName: admin.email,
      actorId: req.coach.id,
      actorEmail: req.coach.email,
      actorRole: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
      description: AuditService.generateDescription(
        AuditLog.ACTIONS.ADMIN_PASSWORD_RESET,
        "ADMIN",
        admin.email
      ),
    });

    res.json({
      message: "Password updated successfully",
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admins/login - Admin login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find admin with password field
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+password");
    if (!admin) {
      // Log failed login attempt
      await AuditService.logAction({
        action: AuditLog.ACTIONS.LOGIN_FAILED,
        entityType: AuditLog.ENTITY_TYPES.ADMIN,
        entityName: email.toLowerCase(),
        ipAddress: req.clientIP,
        userAgent: req.clientUserAgent,
        description: `Failed login attempt for ${email.toLowerCase()} - user not found`,
        metadata: { reason: "user_not_found" },
      });
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Validate password
    const validPass = await bcrypt.compare(password, admin.password);
    if (!validPass) {
      // Log failed login attempt
      await AuditService.logAction({
        action: AuditLog.ACTIONS.LOGIN_FAILED,
        entityType: AuditLog.ENTITY_TYPES.ADMIN,
        entityId: admin.id,
        entityName: admin.email,
        ipAddress: req.clientIP,
        userAgent: req.clientUserAgent,
        description: `Failed login attempt for ${admin.email} - invalid password`,
        metadata: { reason: "invalid_password" },
      });
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate token with role
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Log successful login
    await AuditService.logAction({
      action: AuditLog.ACTIONS.LOGIN_SUCCESS,
      entityType: AuditLog.ENTITY_TYPES.ADMIN,
      entityId: admin.id,
      entityName: admin.email,
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
      description: `User ${admin.email} logged in successfully`,
    });

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        image: admin.image,
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admins/:id - Delete an admin (Super Admin only) - Uses soft delete
router.delete("/:id", auth, isSuperAdmin, async (req, res, next) => {
  try {
    // Try to find by custom UUID id first, then by MongoDB _id
    let admin = await Admin.findOne({ id: req.params.id });

    if (!admin && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      admin = await Admin.findById(req.params.id);
    }

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Prevent self-deletion
    if (admin.id === req.coach.id || admin._id.toString() === req.coach.id) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    const actorInfo = {
      id: req.coach.id,
      email: req.coach.email,
      role: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
    };

    const result = await RestorationService.softDelete(
      "ADMIN",
      admin.id,
      actorInfo,
      (req.body && req.body.reason) || ""
    );

    res.json({
      message: "Admin deleted successfully",
      deletedAdmin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      deletedRecord: result.deletedRecord,
    });
  } catch (error) {
    next(error);
  }
});

// ===================================================================
// PASSWORD RESET ENDPOINTS
// ===================================================================

const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const { sendPasswordResetEmail, sendPasswordChangedEmail, sendPasswordChangeOTP } = require("../services/emailService");
const { generateOTP, hashOTP, verifyOTP, isOTPExpired } = require("../services/otpService");

// Rate limiter for password reset requests
const passwordResetLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 3, // 3 requests per window
  message: "Too many password reset attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/admins/forgot-password - Request password reset
router.post("/forgot-password", passwordResetLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email input
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailLower = email.toLowerCase().trim();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: emailLower });

    // SECURITY: Always return success message to prevent email enumeration
    // Don't reveal whether email exists or not
    const successMessage = "If an account with that email exists, a password reset link has been sent.";

    if (!admin) {
      // Still return success to prevent email enumeration
      return res.json({ message: successMessage });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash token before storing (security best practice)
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set token expiration (15 minutes from now)
    const expiryTime = new Date(Date.now() + (parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY) || 15 * 60 * 1000));

    // Save hashed token to database
    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = expiryTime;
    admin.resetPasswordUsed = false;
    await admin.save();

    // Send email with unhashed token (this is what user needs)
    try {
      await sendPasswordResetEmail(admin.email, resetToken, admin.email);
      console.log(`Password reset email sent to ${admin.email}`);
    } catch (emailError) {
      // Log error but don't expose to user
      console.error("Email sending failed:", emailError);
      // Clean up the reset token since email failed
      admin.resetPasswordToken = undefined;
      admin.resetPasswordExpires = undefined;
      await admin.save();
      
      return res.status(500).json({ 
        message: "Failed to send password reset email. Please try again later." 
      });
    }

    res.json({ message: successMessage });
  } catch (error) {
    console.error("Forgot password error:", error);
    next(error);
  }
});

// GET /api/admins/validate-reset-token/:token - Validate reset token
router.get("/validate-reset-token/:token", async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.json({ valid: false, message: "Token is required" });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find admin with this token
    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Token not expired
      resetPasswordUsed: false, // Token not already used
    });

    if (!admin) {
      return res.json({ 
        valid: false, 
        message: "Password reset token is invalid or has expired" 
      });
    }

    res.json({ 
      valid: true, 
      message: "Token is valid",
      email: admin.email // Return email for display purposes
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.json({ valid: false, message: "Error validating token" });
  }
});

// POST /api/admins/reset-password - Reset password with valid token
router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validate inputs
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ 
        message: "Token, password, and password confirmation are required" 
      });
    }

    // Check passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters" 
      });
    }

    // Hash the token to find admin
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find admin with valid token
    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      resetPasswordUsed: false,
    }).select("+password");

    if (!admin) {
      return res.status(400).json({ 
        message: "Password reset token is invalid or has expired" 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and invalidate token
    admin.password = hashedPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    admin.resetPasswordUsed = true;
    
    // Add to password change history
    if (!admin.passwordChangeHistory) {
      admin.passwordChangeHistory = [];
    }
    
    admin.passwordChangeHistory.push({
      changedAt: new Date(),
      ipAddress: req.clientIP || req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      method: 'forgot_password',
    });
    
    await admin.save();

    // Send confirmation email (non-blocking)
    sendPasswordChangedEmail(admin.email, admin.email).catch(err => {
      console.error("Failed to send confirmation email:", err);
    });

    console.log(`Password reset successful for ${admin.email}`);

    // Audit log for password reset success
    await AuditService.logAction({
      action: AuditLog.ACTIONS.PASSWORD_RESET_SUCCESS,
      entityType: AuditLog.ENTITY_TYPES.ADMIN,
      entityId: admin.id,
      entityName: admin.email,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
      description: AuditService.generateDescription(
        AuditLog.ACTIONS.PASSWORD_RESET_SUCCESS,
        "ADMIN",
        admin.email
      ),
      metadata: { method: "reset_link" },
    });

    res.json({ 
      message: "Password has been reset successfully. You can now login with your new password." 
    });
  } catch (error) {
    console.error("Reset password error:", error);
    next(error);
  }
});

// ==============================================================================
// OTP-BASED PASSWORD CHANGE ENDPOINTS (for logged-in users)
// ==============================================================================

// Rate limiter for OTP requests
const otpRequestLimiter = rateLimit({
  windowMs: parseInt(process.env.OTP_RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.OTP_RATE_LIMIT_MAX_REQUESTS) || 5,
  message: "Too many OTP requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/admins/change-password/request-otp
// Step 1: Request OTP for password change (authenticated users only)
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
    
    // Get admin with password and passwordChangeOTP fields
    const admin = await Admin.findOne({ id: userId }).select('+password +passwordChangeOTP');
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
    const newPasswordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
    
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
    
    console.log(`OTP sent for password change: ${admin.email}`);
    
    // Audit log for password change request
    await AuditService.logAction({
      action: AuditLog.ACTIONS.PASSWORD_CHANGE_REQUESTED,
      entityType: AuditLog.ENTITY_TYPES.ADMIN,
      entityId: admin.id,
      entityName: admin.email,
      actorId: req.coach.id,
      actorEmail: req.coach.email,
      actorRole: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
      description: `Password change OTP requested for ${admin.email}`,
    });
    
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
// Step 2: Verify OTP and change password (authenticated users only)
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
    
    // Get admin with passwordChangeOTP and password fields
    const admin = await Admin.findOne({ id: userId }).select('+passwordChangeOTP +password');
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
    
    console.log(`Password changed successfully for ${admin.email} via OTP`);
    
    // Audit log for successful password change
    await AuditService.logAction({
      action: AuditLog.ACTIONS.PASSWORD_CHANGE_SUCCESS,
      entityType: AuditLog.ENTITY_TYPES.ADMIN,
      entityId: admin.id,
      entityName: admin.email,
      actorId: req.coach.id,
      actorEmail: req.coach.email,
      actorRole: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
      description: AuditService.generateDescription(
        AuditLog.ACTIONS.PASSWORD_CHANGE_SUCCESS,
        "ADMIN",
        admin.email
      ),
      metadata: { method: "otp" },
    });
    
    res.json({
      message: "Password changed successfully. Please login with your new password.",
    });
    
  } catch (error) {
    console.error("Verify OTP error:", error);
    next(error);
  }
});

// POST /api/admins/change-password/resend-otp
// Resend OTP if user didn't receive it (authenticated users only)
router.post("/change-password/resend-otp", auth, otpRequestLimiter, async (req, res, next) => {
  try {
    const userId = req.coach.id;
    
    // Get admin with passwordChangeOTP field
    const admin = await Admin.findOne({ id: userId }).select('+passwordChangeOTP');
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
    
    console.log(`OTP resent for password change: ${admin.email}`);
    
    res.json({
      message: "New OTP sent to your email address.",
      expiresIn: Math.floor((parseInt(process.env.OTP_EXPIRY) || 600000) / 60000),
    });
    
  } catch (error) {
    console.error("Resend OTP error:", error);
    next(error);
  }
});

module.exports = router;

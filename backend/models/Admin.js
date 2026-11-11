const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const AdminSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN"],
      default: "ADMIN",
    },
    image: {
      type: String,
      default: "",
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    resetPasswordUsed: {
      type: Boolean,
      default: false,
      select: false,
    },
    
    // OTP fields for password change (logged-in users)
    passwordChangeOTP: {
      type: {
        code: {
          type: String,
        },
        expiresAt: {
          type: Date,
        },
        attempts: {
          type: Number,
          default: 0,
        },
        used: {
          type: Boolean,
          default: false,
        },
        newPasswordHash: {
          type: String,
        },
        createdAt: {
          type: Date,
        },
      },
      select: false,
    },
    
    // Security audit log for password changes
    passwordChangeHistory: [{
      changedAt: Date,
      ipAddress: String,
      userAgent: String,
      method: {
        type: String,
        enum: ['forgot_password', 'change_password_otp', 'admin_reset'],
      },
    }],
  },
  { timestamps: true }
);

// Create index for password reset token (unique and sparse)
AdminSchema.index({ resetPasswordToken: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Admin", AdminSchema);

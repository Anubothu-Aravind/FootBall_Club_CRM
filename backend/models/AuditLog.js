const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Action types for audit logging
const ACTIONS = {
  // CRUD Operations
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  RESTORE: "RESTORE",
  
  // Authentication
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGOUT: "LOGOUT",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  
  // Password Operations
  PASSWORD_CHANGE_REQUESTED: "PASSWORD_CHANGE_REQUESTED",
  PASSWORD_CHANGE_OTP_SENT: "PASSWORD_CHANGE_OTP_SENT",
  PASSWORD_CHANGE_OTP_VERIFIED: "PASSWORD_CHANGE_OTP_VERIFIED",
  PASSWORD_CHANGE_OTP_FAILED: "PASSWORD_CHANGE_OTP_FAILED",
  PASSWORD_CHANGE_SUCCESS: "PASSWORD_CHANGE_SUCCESS",
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED",
  PASSWORD_RESET_LINK_SENT: "PASSWORD_RESET_LINK_SENT",
  PASSWORD_RESET_SUCCESS: "PASSWORD_RESET_SUCCESS",
  PASSWORD_RESET_FAILED: "PASSWORD_RESET_FAILED",
  
  // Admin Management
  ADMIN_PROMOTE: "ADMIN_PROMOTE",
  ADMIN_DEMOTE: "ADMIN_DEMOTE",
  ADMIN_PASSWORD_RESET: "ADMIN_PASSWORD_RESET",
  
  // Email Events
  EMAIL_SENT: "EMAIL_SENT",
  EMAIL_FAILED: "EMAIL_FAILED",
  
  // System Events
  DATA_EXPORT: "DATA_EXPORT",
  BULK_OPERATION: "BULK_OPERATION",
};

// Categories for organizing audit logs
const CATEGORIES = {
  AUTHENTICATION: "AUTHENTICATION",
  SECURITY: "SECURITY",
  DATA_MODIFICATION: "DATA_MODIFICATION",
  ADMIN_MANAGEMENT: "ADMIN_MANAGEMENT",
  EMAIL_NOTIFICATION: "EMAIL_NOTIFICATION",
  SYSTEM: "SYSTEM",
};

// Severity levels for filtering
const SEVERITIES = {
  CRITICAL: "CRITICAL",
  WARNING: "WARNING",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

// Entity types
const ENTITY_TYPES = {
  PLAYER: "PLAYER",
  TOURNAMENT: "TOURNAMENT",
  TRAINING: "TRAINING",
  ADMIN: "ADMIN",
  SYSTEM: "SYSTEM",
};

const AuditLogSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    
    // Action Details
    action: {
      type: String,
      required: true,
      enum: Object.values(ACTIONS),
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: Object.values(CATEGORIES),
      index: true,
    },
    severity: {
      type: String,
      required: true,
      enum: Object.values(SEVERITIES),
      index: true,
    },
    
    // Entity Information
    entityType: {
      type: String,
      required: true,
      enum: Object.values(ENTITY_TYPES),
      index: true,
    },
    entityId: {
      type: String,
      index: true,
    },
    entityName: {
      type: String,
      default: "",
    },
    
    // Change Details
    previousData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    changedFields: {
      type: [String],
      default: [],
    },
    
    // Actor Information
    actorId: {
      type: String,
      index: true,
    },
    actorEmail: {
      type: String,
      index: true,
    },
    actorRole: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "SYSTEM"],
      default: "SYSTEM",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    sessionId: {
      type: String,
      default: "",
    },
    
    // Human-readable description
    description: {
      type: String,
      required: true,
    },
    
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    
    // Restoration tracking (for delete actions)
    isRestored: {
      type: Boolean,
      default: false,
    },
    restoredAt: {
      type: Date,
    },
    restoredBy: {
      type: String,
    },
  },
  { 
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes for common query patterns
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
AuditLogSchema.index({ category: 1, severity: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

// Static methods for easy access to enums
AuditLogSchema.statics.ACTIONS = ACTIONS;
AuditLogSchema.statics.CATEGORIES = CATEGORIES;
AuditLogSchema.statics.SEVERITIES = SEVERITIES;
AuditLogSchema.statics.ENTITY_TYPES = ENTITY_TYPES;

// Static method to determine category from action
AuditLogSchema.statics.getCategoryFromAction = function(action) {
  const authActions = [
    ACTIONS.LOGIN_SUCCESS, ACTIONS.LOGIN_FAILED, 
    ACTIONS.LOGOUT, ACTIONS.SESSION_EXPIRED
  ];
  const securityActions = [
    ACTIONS.PASSWORD_CHANGE_REQUESTED, ACTIONS.PASSWORD_CHANGE_OTP_SENT,
    ACTIONS.PASSWORD_CHANGE_OTP_VERIFIED, ACTIONS.PASSWORD_CHANGE_OTP_FAILED,
    ACTIONS.PASSWORD_CHANGE_SUCCESS, ACTIONS.PASSWORD_RESET_REQUESTED,
    ACTIONS.PASSWORD_RESET_LINK_SENT, ACTIONS.PASSWORD_RESET_SUCCESS,
    ACTIONS.PASSWORD_RESET_FAILED
  ];
  const adminActions = [
    ACTIONS.ADMIN_PROMOTE, ACTIONS.ADMIN_DEMOTE, ACTIONS.ADMIN_PASSWORD_RESET
  ];
  const emailActions = [ACTIONS.EMAIL_SENT, ACTIONS.EMAIL_FAILED];
  const systemActions = [ACTIONS.DATA_EXPORT, ACTIONS.BULK_OPERATION];
  
  if (authActions.includes(action)) return CATEGORIES.AUTHENTICATION;
  if (securityActions.includes(action)) return CATEGORIES.SECURITY;
  if (adminActions.includes(action)) return CATEGORIES.ADMIN_MANAGEMENT;
  if (emailActions.includes(action)) return CATEGORIES.EMAIL_NOTIFICATION;
  if (systemActions.includes(action)) return CATEGORIES.SYSTEM;
  return CATEGORIES.DATA_MODIFICATION;
};

// Static method to determine severity from action
AuditLogSchema.statics.getSeverityFromAction = function(action) {
  const criticalActions = [
    ACTIONS.DELETE, ACTIONS.ADMIN_PASSWORD_RESET,
    ACTIONS.ADMIN_PROMOTE, ACTIONS.ADMIN_DEMOTE
  ];
  const warningActions = [
    ACTIONS.LOGIN_FAILED, ACTIONS.PASSWORD_CHANGE_OTP_FAILED,
    ACTIONS.PASSWORD_RESET_FAILED, ACTIONS.SESSION_EXPIRED,
    ACTIONS.EMAIL_FAILED
  ];
  const debugActions = [ACTIONS.EMAIL_SENT];
  
  if (criticalActions.includes(action)) return SEVERITIES.CRITICAL;
  if (warningActions.includes(action)) return SEVERITIES.WARNING;
  if (debugActions.includes(action)) return SEVERITIES.DEBUG;
  return SEVERITIES.INFO;
};

module.exports = mongoose.model("AuditLog", AuditLogSchema);

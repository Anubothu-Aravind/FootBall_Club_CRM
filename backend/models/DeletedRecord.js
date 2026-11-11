const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Retention periods in days for different entity types
const RETENTION_PERIODS = {
  PLAYER: 30,
  TOURNAMENT: 30,
  ADMIN: 7,
};

const DeletedRecordSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    
    // Entity Information
    entityType: {
      type: String,
      required: true,
      enum: ["PLAYER", "TOURNAMENT", "ADMIN"],
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      index: true,
    },
    entityName: {
      type: String,
      default: "",
    },
    
    // Complete snapshot of the original data
    originalData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    
    // Deletion metadata
    deletedBy: {
      type: String,
      required: true,
    },
    deletedByEmail: {
      type: String,
      default: "",
    },
    deletedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    deletionReason: {
      type: String,
      default: "",
    },
    
    // Restoration tracking
    isRestored: {
      type: Boolean,
      default: false,
      index: true,
    },
    restoredBy: {
      type: String,
    },
    restoredByEmail: {
      type: String,
    },
    restoredAt: {
      type: Date,
    },
    
    // Auto-purge date (TTL index will handle permanent deletion)
    purgeAfter: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL index for automatic permanent deletion after retention period
// MongoDB will automatically remove documents when purgeAfter date is reached
// Note: purgeAfter field already has index: true in schema, TTL index is set here
DeletedRecordSchema.index({ purgeAfter: 1 }, { expireAfterSeconds: 0 });

// Compound indexes for common query patterns
DeletedRecordSchema.index({ entityType: 1, deletedAt: -1 });
DeletedRecordSchema.index({ entityType: 1, isRestored: 1, deletedAt: -1 });
DeletedRecordSchema.index({ deletedBy: 1, deletedAt: -1 });

// Static method to calculate purge date based on entity type
DeletedRecordSchema.statics.calculatePurgeDate = function(entityType) {
  const retentionDays = RETENTION_PERIODS[entityType] || 30;
  const purgeDate = new Date();
  purgeDate.setDate(purgeDate.getDate() + retentionDays);
  return purgeDate;
};

// Static method to get retention period for an entity type
DeletedRecordSchema.statics.getRetentionPeriod = function(entityType) {
  return RETENTION_PERIODS[entityType] || 30;
};

// Instance method to calculate days remaining before permanent deletion
DeletedRecordSchema.methods.getDaysUntilPurge = function() {
  const now = new Date();
  const purgeDate = new Date(this.purgeAfter);
  const diffTime = purgeDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Instance method to check if record can be restored
DeletedRecordSchema.methods.canBeRestored = function() {
  if (this.isRestored) return { canRestore: false, reason: "Already restored" };
  
  const now = new Date();
  if (new Date(this.purgeAfter) <= now) {
    return { canRestore: false, reason: "Retention period expired" };
  }
  
  return { canRestore: true, reason: null };
};

// Virtual for formatted deletion date
DeletedRecordSchema.virtual("formattedDeletedAt").get(function() {
  return this.deletedAt.toISOString();
});

// Virtual for days since deletion
DeletedRecordSchema.virtual("daysSinceDeleted").get(function() {
  const now = new Date();
  const deletedDate = new Date(this.deletedAt);
  const diffTime = now - deletedDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Ensure virtuals are included when converting to JSON
DeletedRecordSchema.set("toJSON", { virtuals: true });
DeletedRecordSchema.set("toObject", { virtuals: true });

// Export retention periods for use in services
DeletedRecordSchema.statics.RETENTION_PERIODS = RETENTION_PERIODS;

module.exports = mongoose.model("DeletedRecord", DeletedRecordSchema);

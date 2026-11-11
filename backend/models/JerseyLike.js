const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * Jersey Like Schema
 * Tracks user interactions with jersey displays on the About page
 * Supports both authenticated and anonymous users
 */
const JerseyLikeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    jerseyId: {
      type: String,
      required: true,
      index: true,
      // Jersey IDs: 'current-2025-26', '2024-25', '2023-24', etc.
    },
    jerseyDetails: {
      season: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
        default: "Home",
      },
      colorway: {
        type: String,
        required: true,
      },
    },
    // User information - supports both authenticated and anonymous
    userId: {
      type: String,
      default: null,
      index: true,
      // Authenticated user ID or null for anonymous
    },
    userEmail: {
      type: String,
      default: null,
      // Email if authenticated user
    },
    userName: {
      type: String,
      default: "Anonymous",
      // Display name or "Anonymous"
    },
    // Session tracking for anonymous users
    sessionId: {
      type: String,
      default: null,
      index: true,
      // Browser fingerprint or session ID for anonymous users
    },
    ipAddress: {
      type: String,
      default: null,
      // Track IP for analytics and abuse prevention
    },
    userAgent: {
      type: String,
      default: null,
      // Browser/device information
    },
    // Like state
    isActive: {
      type: Boolean,
      default: true,
      // true = liked, false = unliked (soft delete)
    },
    // Timestamps
    likedAt: {
      type: Date,
      default: Date.now,
    },
    unlikedAt: {
      type: Date,
      default: null,
    },
    // Metadata
    metadata: {
      source: {
        type: String,
        default: "web",
        enum: ["web", "mobile", "admin"],
      },
      deviceType: {
        type: String,
        enum: ["desktop", "tablet", "mobile", "unknown"],
        default: "unknown",
      },
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Compound indexes for efficient queries
JerseyLikeSchema.index({ jerseyId: 1, isActive: 1 });
JerseyLikeSchema.index({ jerseyId: 1, userId: 1 });
JerseyLikeSchema.index({ jerseyId: 1, sessionId: 1 });
JerseyLikeSchema.index({ createdAt: -1 });

// Static method to get like count for a jersey
JerseyLikeSchema.statics.getLikeCount = async function (jerseyId) {
  return await this.countDocuments({ jerseyId, isActive: true });
};

// Static method to check if user/session liked a jersey
JerseyLikeSchema.statics.hasUserLiked = async function (jerseyId, userId, sessionId) {
  const query = { jerseyId, isActive: true };
  if (userId) {
    query.userId = userId;
  } else if (sessionId) {
    query.sessionId = sessionId;
  } else {
    return false;
  }
  const like = await this.findOne(query);
  return !!like;
};

// Static method to get all likes for a jersey with user details
JerseyLikeSchema.statics.getJerseyLikes = async function (jerseyId, options = {}) {
  const {
    limit = 100,
    skip = 0,
    sortBy = "-likedAt",
    activeOnly = true,
  } = options;

  const query = { jerseyId };
  if (activeOnly) {
    query.isActive = true;
  }

  return await this.find(query)
    .select("-__v")
    .sort(sortBy)
    .limit(limit)
    .skip(skip)
    .lean();
};

// Static method to get analytics for all jerseys
JerseyLikeSchema.statics.getAnalytics = async function () {
  const analytics = await this.aggregate([
    {
      $match: { isActive: true },
    },
    {
      $group: {
        _id: "$jerseyId",
        totalLikes: { $sum: 1 },
        authenticatedLikes: {
          $sum: { $cond: [{ $ne: ["$userId", null] }, 1, 0] },
        },
        anonymousLikes: {
          $sum: { $cond: [{ $eq: ["$userId", null] }, 1, 0] },
        },
        lastLikeAt: { $max: "$likedAt" },
        jerseyDetails: { $first: "$jerseyDetails" },
      },
    },
    {
      $sort: { totalLikes: -1 },
    },
  ]);

  return analytics;
};

module.exports = mongoose.model("JerseyLike", JerseyLikeSchema);

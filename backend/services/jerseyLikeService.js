const JerseyLike = require("../models/JerseyLike");
const AuditLog = require("../models/AuditLog");

/**
 * Jersey Like Service
 * Handles all business logic for jersey likes
 * Note: Audit logs are only created for admin actions (reset, restore, delete)
 * not for public user likes
 */

/**
 * Toggle like for a jersey (like or unlike)
 * @param {Object} likeData - Like data including jerseyId, user info, session info
 * @returns {Object} - Result with success status, message, and updated counts
 */
const toggleJerseyLike = async (likeData) => {
  const {
    jerseyId,
    jerseyDetails,
    userId = null,
    userEmail = null,
    userName = "Anonymous",
    sessionId = null,
    ipAddress = null,
    userAgent = null,
    metadata = {},
  } = likeData;

  try {
    // Build query to find existing like
    const query = { jerseyId };
    if (userId) {
      query.userId = userId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    } else {
      throw new Error("Either userId or sessionId must be provided");
    }

    // Check if user already liked this jersey
    const existingLike = await JerseyLike.findOne(query);

    let action;
    let like;

    if (existingLike) {
      // Toggle the like status
      existingLike.isActive = !existingLike.isActive;
      if (existingLike.isActive) {
        existingLike.likedAt = new Date();
        existingLike.unlikedAt = null;
        action = "liked";
      } else {
        existingLike.unlikedAt = new Date();
        action = "unliked";
      }
      like = await existingLike.save();
    } else {
      // Create new like
      like = await JerseyLike.create({
        jerseyId,
        jerseyDetails,
        userId,
        userEmail,
        userName,
        sessionId,
        ipAddress,
        userAgent,
        isActive: true,
        likedAt: new Date(),
        metadata,
      });
      action = "liked";
    }

    // Get updated count
    const likeCount = await JerseyLike.getLikeCount(jerseyId);

    // Note: We don't create audit logs for public user interactions
    // Audit logs are reserved for admin actions

    return {
      success: true,
      action,
      isLiked: like.isActive,
      likeCount,
      likeId: like.id,
      message: `Jersey ${action} successfully`,
    };
  } catch (error) {
    console.error("Error toggling jersey like:", error);
    throw error;
  }
};

/**
 * Get like status and count for a jersey
 * @param {string} jerseyId - Jersey identifier
 * @param {string} userId - User ID (optional)
 * @param {string} sessionId - Session ID (optional)
 * @returns {Object} - Like count and user's like status
 */
const getJerseyLikeStatus = async (jerseyId, userId = null, sessionId = null) => {
  try {
    const likeCount = await JerseyLike.getLikeCount(jerseyId);
    const isLiked = await JerseyLike.hasUserLiked(jerseyId, userId, sessionId);

    return {
      success: true,
      jerseyId,
      likeCount,
      isLiked,
    };
  } catch (error) {
    console.error("Error getting jersey like status:", error);
    throw error;
  }
};

/**
 * Get like counts for multiple jerseys
 * @param {Array<string>} jerseyIds - Array of jersey identifiers
 * @param {string} userId - User ID (optional)
 * @param {string} sessionId - Session ID (optional)
 * @returns {Object} - Object with jersey IDs as keys and like data as values
 */
const getBulkLikeStatus = async (jerseyIds, userId = null, sessionId = null) => {
  try {
    const results = {};

    await Promise.all(
      jerseyIds.map(async (jerseyId) => {
        const status = await getJerseyLikeStatus(jerseyId, userId, sessionId);
        results[jerseyId] = {
          likeCount: status.likeCount,
          isLiked: status.isLiked,
        };
      })
    );

    return {
      success: true,
      results,
    };
  } catch (error) {
    console.error("Error getting bulk like status:", error);
    throw error;
  }
};

/**
 * Get detailed analytics for all jerseys
 * @returns {Object} - Analytics data
 */
const getJerseyLikesAnalytics = async () => {
  try {
    const analytics = await JerseyLike.getAnalytics();
    const totalLikes = analytics.reduce((sum, item) => sum + item.totalLikes, 0);
    const totalAuthenticatedLikes = analytics.reduce(
      (sum, item) => sum + item.authenticatedLikes,
      0
    );
    const totalAnonymousLikes = analytics.reduce(
      (sum, item) => sum + item.anonymousLikes,
      0
    );

    return {
      success: true,
      summary: {
        totalLikes,
        totalAuthenticatedLikes,
        totalAnonymousLikes,
        totalJerseys: analytics.length,
      },
      jerseys: analytics,
    };
  } catch (error) {
    console.error("Error getting jersey likes analytics:", error);
    throw error;
  }
};

/**
 * Get detailed like records for a specific jersey
 * @param {string} jerseyId - Jersey identifier
 * @param {Object} options - Query options (limit, skip, sort)
 * @returns {Object} - Like records with metadata
 */
const getJerseyLikeDetails = async (jerseyId, options = {}) => {
  try {
    const likes = await JerseyLike.getJerseyLikes(jerseyId, options);
    const totalLikes = await JerseyLike.getLikeCount(jerseyId);

    return {
      success: true,
      jerseyId,
      totalLikes,
      likes,
      count: likes.length,
    };
  } catch (error) {
    console.error("Error getting jersey like details:", error);
    throw error;
  }
};

/**
 * Reset all likes for a specific jersey (Admin only)
 * @param {string} jerseyId - Jersey identifier
 * @param {Object} adminInfo - Admin performing the action
 * @returns {Object} - Result of reset operation
 */
const resetJerseyLikes = async (jerseyId, adminInfo) => {
  try {
    // Soft delete all likes for the jersey
    const result = await JerseyLike.updateMany(
      { jerseyId, isActive: true },
      {
        $set: {
          isActive: false,
          unlikedAt: new Date(),
        },
      }
    );

    // Create audit log
    await AuditLog.create({
      action: "UPDATE",
      category: "SYSTEM",
      severity: "INFO",
      description: `Reset ${result.modifiedCount} likes for jersey ${jerseyId}`,
      entityType: "SYSTEM",
      entityId: `jersey-${jerseyId}`,
      entityName: `Jersey Likes: ${jerseyId}`,
      actorId: adminInfo.id,
      actorEmail: adminInfo.email,
      actorRole: adminInfo.role,
      ipAddress: adminInfo.ipAddress,
      changedFields: ["likes_reset"],
      newData: {
        action: "reset_likes",
        jerseyId,
        likesReset: result.modifiedCount,
      },
    });

    return {
      success: true,
      message: `Reset ${result.modifiedCount} likes for jersey ${jerseyId}`,
      likesReset: result.modifiedCount,
    };
  } catch (error) {
    console.error("Error resetting jersey likes:", error);
    throw error;
  }
};

/**
 * Restore all likes for a specific jersey (Admin only)
 * @param {string} jerseyId - Jersey identifier
 * @param {Object} adminInfo - Admin performing the action
 * @returns {Object} - Result of restore operation
 */
const restoreJerseyLikes = async (jerseyId, adminInfo) => {
  try {
    // Restore all previously removed likes for the jersey
    const result = await JerseyLike.updateMany(
      { jerseyId, isActive: false },
      {
        $set: {
          isActive: true,
          likedAt: new Date(),
          unlikedAt: null,
        },
      }
    );

    // Create audit log
    await AuditLog.create({
      action: "RESTORE",
      category: "SYSTEM",
      severity: "INFO",
      description: `Restored ${result.modifiedCount} likes for jersey ${jerseyId}`,
      entityType: "SYSTEM",
      entityId: `jersey-${jerseyId}`,
      entityName: `Jersey Likes: ${jerseyId}`,
      actorId: adminInfo.id,
      actorEmail: adminInfo.email,
      actorRole: adminInfo.role,
      ipAddress: adminInfo.ipAddress,
      changedFields: ["likes_restored"],
      newData: {
        action: "restore_likes",
        jerseyId,
        likesRestored: result.modifiedCount,
      },
    });

    return {
      success: true,
      message: `Restored ${result.modifiedCount} likes for jersey ${jerseyId}`,
      likesRestored: result.modifiedCount,
    };
  } catch (error) {
    console.error("Error restoring jersey likes:", error);
    throw error;
  }
};

/**
 * Delete all likes for a specific jersey permanently (Super Admin only)
 * @param {string} jerseyId - Jersey identifier
 * @param {Object} adminInfo - Admin performing the action
 * @returns {Object} - Result of delete operation
 */
const deleteJerseyLikesPermanently = async (jerseyId, adminInfo) => {
  try {
    const result = await JerseyLike.deleteMany({ jerseyId });

    // Create audit log
    await AuditLog.create({
      action: "DELETE",
      category: "SYSTEM",
      severity: "WARNING",
      description: `Permanently deleted ${result.deletedCount} likes for jersey ${jerseyId}`,
      entityType: "SYSTEM",
      entityId: `jersey-${jerseyId}`,
      entityName: `Jersey Likes: ${jerseyId}`,
      actorId: adminInfo.id,
      actorEmail: adminInfo.email,
      actorRole: adminInfo.role,
      ipAddress: adminInfo.ipAddress,
      changedFields: ["likes_deleted_permanently"],
      previousData: {
        likesCount: result.deletedCount,
      },
      newData: {
        action: "delete_likes_permanently",
        jerseyId,
        likesDeleted: result.deletedCount,
      },
    });

    return {
      success: true,
      message: `Permanently deleted ${result.deletedCount} likes for jersey ${jerseyId}`,
      likesDeleted: result.deletedCount,
    };
  } catch (error) {
    console.error("Error deleting jersey likes permanently:", error);
    throw error;
  }
};

module.exports = {
  toggleJerseyLike,
  getJerseyLikeStatus,
  getBulkLikeStatus,
  getJerseyLikesAnalytics,
  getJerseyLikeDetails,
  resetJerseyLikes,
  restoreJerseyLikes,
  deleteJerseyLikesPermanently,
};

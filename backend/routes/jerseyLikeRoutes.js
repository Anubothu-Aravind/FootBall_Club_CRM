const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authMiddleware");
const jerseyLikeService = require("../services/jerseyLikeService");

/**
 * Helper function to detect device type from user agent
 */
const getDeviceType = (userAgent) => {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
};

/**
 * @route   POST /api/jersey-likes/toggle
 * @desc    Toggle like for a jersey (authenticated or anonymous)
 * @access  Public
 */
router.post("/toggle", async (req, res) => {
  try {
    const {
      jerseyId,
      jerseyDetails,
      sessionId, // Required for anonymous users
    } = req.body;

    // Validate required fields
    if (!jerseyId || !jerseyDetails) {
      return res.status(400).json({
        success: false,
        message: "jerseyId and jerseyDetails are required",
      });
    }

    // Get user info from auth token if available
    const token = req.header("Authorization")?.replace("Bearer ", "");
    let userId = null;
    let userEmail = null;
    let userName = "Anonymous";

    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        userEmail = decoded.email;
        userName = decoded.name || decoded.email;
      } catch (error) {
        // Token invalid or expired, treat as anonymous
      }
    }

    // For anonymous users, sessionId is required
    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId is required for anonymous users",
      });
    }

    // Prepare like data
    const likeData = {
      jerseyId,
      jerseyDetails,
      userId,
      userEmail,
      userName,
      sessionId,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
      metadata: {
        source: "web",
        deviceType: getDeviceType(req.headers["user-agent"]),
      },
    };

    const result = await jerseyLikeService.toggleJerseyLike(likeData);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error toggling jersey like:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle like",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/jersey-likes/status/:jerseyId
 * @desc    Get like status and count for a specific jersey
 * @access  Public
 */
router.get("/status/:jerseyId", async (req, res) => {
  try {
    const { jerseyId } = req.params;
    const { sessionId } = req.query;

    // Get user info from auth token if available
    const token = req.header("Authorization")?.replace("Bearer ", "");
    let userId = null;

    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (error) {
        // Token invalid or expired, treat as anonymous
      }
    }

    const result = await jerseyLikeService.getJerseyLikeStatus(
      jerseyId,
      userId,
      sessionId
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting jersey like status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get like status",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/jersey-likes/bulk-status
 * @desc    Get like status for multiple jerseys
 * @access  Public
 */
router.post("/bulk-status", async (req, res) => {
  try {
    const { jerseyIds, sessionId } = req.body;

    if (!jerseyIds || !Array.isArray(jerseyIds)) {
      return res.status(400).json({
        success: false,
        message: "jerseyIds array is required",
      });
    }

    // Get user info from auth token if available
    const token = req.header("Authorization")?.replace("Bearer ", "");
    let userId = null;

    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (error) {
        // Token invalid or expired, treat as anonymous
      }
    }

    const result = await jerseyLikeService.getBulkLikeStatus(
      jerseyIds,
      userId,
      sessionId
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting bulk like status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get bulk like status",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/jersey-likes/analytics
 * @desc    Get analytics for all jersey likes (Admin only)
 * @access  Private (Admin, Super Admin)
 */
router.get("/analytics", auth, requireRole("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  try {
    const result = await jerseyLikeService.getJerseyLikesAnalytics();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting jersey likes analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get analytics",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/jersey-likes/details/:jerseyId
 * @desc    Get detailed like records for a specific jersey (Admin only)
 * @access  Private (Admin, Super Admin)
 */
router.get("/details/:jerseyId", auth, requireRole("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  try {
    const { jerseyId } = req.params;
    const { limit = 100, skip = 0, sortBy = "-likedAt" } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      sortBy,
      activeOnly: req.query.activeOnly !== "false", // Default true
    };

    const result = await jerseyLikeService.getJerseyLikeDetails(jerseyId, options);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting jersey like details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get like details",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/jersey-likes/reset/:jerseyId
 * @desc    Reset all likes for a specific jersey (Admin only)
 * @access  Private (Admin, Super Admin)
 */
router.post("/reset/:jerseyId", auth, requireRole("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  try {
    const { jerseyId } = req.params;

    const adminInfo = {
      id: req.coach.id,
      email: req.coach.email,
      role: req.coach.role,
      ipAddress: req.ip || req.connection.remoteAddress,
    };

    const result = await jerseyLikeService.resetJerseyLikes(jerseyId, adminInfo);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error resetting jersey likes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset likes",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/jersey-likes/restore/:jerseyId
 * @desc    Restore all likes for a specific jersey (Admin only)
 * @access  Private (Admin, Super Admin)
 */
router.post("/restore/:jerseyId", auth, requireRole("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  try {
    const { jerseyId } = req.params;

    const adminInfo = {
      id: req.coach.id,
      email: req.coach.email,
      role: req.coach.role,
      ipAddress: req.ip || req.connection.remoteAddress,
    };

    const result = await jerseyLikeService.restoreJerseyLikes(jerseyId, adminInfo);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error restoring jersey likes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore likes",
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/jersey-likes/:jerseyId
 * @desc    Permanently delete all likes for a jersey (Super Admin only)
 * @access  Private (Super Admin only)
 */
router.delete("/:jerseyId", auth, requireRole("SUPER_ADMIN"), async (req, res) => {
  try {
    const { jerseyId } = req.params;

    const adminInfo = {
      id: req.coach.id,
      email: req.coach.email,
      role: req.coach.role,
      ipAddress: req.ip || req.connection.remoteAddress,
    };

    const result = await jerseyLikeService.deleteJerseyLikesPermanently(
      jerseyId,
      adminInfo
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting jersey likes permanently:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete likes permanently",
      error: error.message,
    });
  }
});

module.exports = router;

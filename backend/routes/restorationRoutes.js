const express = require("express");
const RestorationService = require("../services/restorationService");
const DeletedRecord = require("../models/DeletedRecord");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Middleware to check if user is Super Admin
const isSuperAdmin = (req, res, next) => {
  if (!req.coach || req.coach.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Access denied. Super Admin only." });
  }
  next();
};

/**
 * GET /api/restore/deleted
 * Get all deleted records (Super Admin only)
 */
router.get("/deleted", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const filters = {
      entityType: req.query.entityType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      includeRestored: req.query.includeRestored === "true",
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: Math.min(parseInt(req.query.limit) || 20, 100),
      sortBy: req.query.sortBy || "deletedAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await RestorationService.getDeletedRecords(filters, pagination);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/restore/deleted/:type
 * Get deleted records by entity type (Super Admin only)
 */
router.get("/deleted/:type", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const { type } = req.params;
    const entityType = type.toUpperCase();

    if (!["PLAYER", "TOURNAMENT", "ADMIN"].includes(entityType)) {
      return res.status(400).json({ message: "Invalid entity type" });
    }

    const filters = {
      entityType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      includeRestored: req.query.includeRestored === "true",
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: Math.min(parseInt(req.query.limit) || 20, 100),
      sortBy: req.query.sortBy || "deletedAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await RestorationService.getDeletedRecords(filters, pagination);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/restore/stats
 * Get deletion/restoration statistics (Super Admin only)
 */
router.get("/stats", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const stats = await RestorationService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/restore/preview/:type/:id
 * Preview a deleted record without restoring (Super Admin only)
 */
router.get("/preview/:type/:id", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const entityType = type.toUpperCase();

    if (!["PLAYER", "TOURNAMENT", "ADMIN"].includes(entityType)) {
      return res.status(400).json({ message: "Invalid entity type" });
    }

    const preview = await RestorationService.previewRecord(entityType, id);
    res.json(preview);
  } catch (error) {
    if (error.message === "Deleted record not found") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
});

/**
 * GET /api/restore/validate/:type/:id
 * Validate if a record can be restored (Super Admin only)
 */
router.get("/validate/:type/:id", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const entityType = type.toUpperCase();

    if (!["PLAYER", "TOURNAMENT", "ADMIN"].includes(entityType)) {
      return res.status(400).json({ message: "Invalid entity type" });
    }

    const validation = await RestorationService.validateRestoration(entityType, id);
    res.json(validation);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/restore/:type/:id
 * Restore a deleted record (Super Admin only)
 */
router.post("/:type/:id", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const entityType = type.toUpperCase();

    if (!["PLAYER", "TOURNAMENT", "ADMIN"].includes(entityType)) {
      return res.status(400).json({ message: "Invalid entity type" });
    }

    const actorInfo = {
      id: req.coach.id,
      email: req.coach.email,
      role: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
    };

    const result = await RestorationService.restoreRecord(entityType, id, actorInfo);
    res.json(result);
  } catch (error) {
    if (
      error.message === "Deleted record not found" ||
      error.message.includes("not found")
    ) {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message.includes("cannot be restored") ||
      error.message.includes("already in use")
    ) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
});

/**
 * GET /api/restore/retention
 * Get retention periods for each entity type
 */
router.get("/retention", auth, isSuperAdmin, async (req, res) => {
  res.json({
    retentionPeriods: DeletedRecord.RETENTION_PERIODS,
  });
});

module.exports = router;

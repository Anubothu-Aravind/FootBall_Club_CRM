const express = require("express");
const AuditService = require("../services/auditService");
const AuditLog = require("../models/AuditLog");
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
 * GET /api/audit
 * Get paginated audit logs with filters (Super Admin only)
 */
router.get("/", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const filters = {
      action: req.query.action,
      category: req.query.category,
      severity: req.query.severity,
      entityType: req.query.entityType,
      entityId: req.query.entityId,
      actorId: req.query.actorId,
      actorEmail: req.query.actorEmail,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: Math.min(parseInt(req.query.limit) || 20, 100),
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await AuditService.getAuditLogs(filters, pagination);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/stats
 * Get audit statistics (Super Admin only)
 */
router.get("/stats", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const stats = await AuditService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/entity/:type/:id
 * Get audit history for a specific entity (Super Admin only)
 */
router.get("/entity/:type/:id", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const entityType = type.toUpperCase();

    if (!Object.values(AuditLog.ENTITY_TYPES).includes(entityType)) {
      return res.status(400).json({ message: "Invalid entity type" });
    }

    const logs = await AuditService.getEntityHistory(entityType, id);
    res.json({ entityType, entityId: id, logs });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/actor/:id
 * Get all audit logs for a specific actor (Super Admin only)
 */
router.get("/actor/:id", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const logs = await AuditService.getActorActivity(id, { startDate, endDate });
    res.json({ actorId: id, logs });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/export
 * Export audit logs (Super Admin only)
 */
router.get("/export", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const format = req.query.format || "json";
    const filters = {
      action: req.query.action,
      category: req.query.category,
      severity: req.query.severity,
      entityType: req.query.entityType,
      actorId: req.query.actorId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const result = await AuditService.exportLogs(format, filters);

    // Log the export action
    await AuditService.logAction({
      action: AuditLog.ACTIONS.DATA_EXPORT,
      entityType: AuditLog.ENTITY_TYPES.SYSTEM,
      actorId: req.coach.id,
      actorEmail: req.coach.email,
      actorRole: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
      description: `Exported audit logs in ${format} format`,
      metadata: { format, filters },
    });

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=${result.filename}`);
      return res.send(result.data);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/my-activity
 * Get current user's own activity logs (any authenticated user)
 */
router.get("/my-activity", auth, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    const result = await AuditService.getAuditLogs(
      {
        actorId: req.coach.id,
        startDate,
        endDate,
      },
      { page, limit }
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/enums
 * Get available enum values for filters
 */
router.get("/enums", auth, isSuperAdmin, async (req, res) => {
  res.json({
    actions: Object.values(AuditLog.ACTIONS),
    categories: Object.values(AuditLog.CATEGORIES),
    severities: Object.values(AuditLog.SEVERITIES),
    entityTypes: Object.values(AuditLog.ENTITY_TYPES),
  });
});

/**
 * GET /api/audit/:id
 * Get a single audit log entry by ID (Super Admin only)
 */
router.get("/:id", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const log = await AuditLog.findOne({ id: req.params.id });

    if (!log) {
      return res.status(404).json({ message: "Audit log not found" });
    }

    res.json(log);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/audit/reports/current-month
 * Generate and send current month audit report (Super Admin only)
 */
router.post("/reports/current-month", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const { generateCurrentMonthReport } = require("../services/schedulerService");
    const result = await generateCurrentMonthReport();
    
    res.json({
      success: true,
      message: result.message,
      data: {
        logsIncluded: result.logsIncluded,
        emailsSent: result.emailsSent,
        recipients: result.recipients,
        stats: result.stats,
      },
    });
  } catch (error) {
    console.error("Error generating current month report:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate current month report",
    });
  }
});

/**
 * POST /api/audit/reports/custom
 * Generate and send custom date range audit report (Super Admin only)
 */
router.post("/reports/custom", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before end date",
      });
    }

    const { generateCustomReport } = require("../services/schedulerService");
    const result = await generateCustomReport(start, end, true);
    
    res.json({
      success: true,
      message: result.message,
      data: {
        logsIncluded: result.logsIncluded,
        emailsSent: result.emailsSent,
        recipients: result.recipients,
        stats: result.stats,
      },
    });
  } catch (error) {
    console.error("Error generating custom report:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate custom report",
    });
  }
});

/**
 * POST /api/audit/reports/test-cleanup
 * Test the 30-day cleanup (sends email without deleting) (Super Admin only)
 */
router.post("/reports/test-cleanup", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const { performScheduledCleanup } = require("../services/schedulerService");
    const result = await performScheduledCleanup(true); // testMode = true
    
    res.json({
      success: result.success,
      message: result.message,
      data: {
        logsFound: result.logsFound,
        logsDeleted: result.logsDeleted,
        emailsSent: result.emailsSent,
        recipients: result.recipients,
        testMode: result.testMode,
      },
    });
  } catch (error) {
    console.error("Error testing cleanup:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to test cleanup",
    });
  }
});

module.exports = router;

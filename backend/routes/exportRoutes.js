const express = require("express");
const ExportService = require("../services/exportService");
const AuditService = require("../services/auditService");
const AuditLog = require("../models/AuditLog");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Middleware to check if user is Super Admin
const isSuperAdmin = (req, res, next) => {
  if (!req.coach || req.coach.role !== "SUPER_ADMIN") {
    return res
      .status(403)
      .json({ message: "Access denied. Super Admin only." });
  }
  next();
};

/**
 * GET /api/export/info
 * Get export metadata (available sections, record counts, etc.)
 * Requires authentication
 */
router.get("/info", auth, async (req, res, next) => {
  try {
    const info = await ExportService.getExportInfo();

    // Filter sections based on user role
    if (req.coach.role !== "SUPER_ADMIN") {
      info.sections = info.sections.filter((s) => !s.requiresRole);
    }

    res.json(info);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/export/:section
 * Export data for a specific section
 *
 * Query params:
 *   - format: json, csv, xlsx (default: json)
 *   - includeHidden: true/false (default: false)
 *   - Filters vary by section
 */
router.get("/:section", auth, async (req, res, next) => {
  try {
    const { section } = req.params;
    const format = req.query.format || "json";
    const includeHidden = req.query.includeHidden === "true";

    // Validate section
    const validSections = ["players", "tournaments", "trainings", "audit", "deleted"];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        message: `Invalid section: ${section}. Valid sections: ${validSections.join(", ")}`,
      });
    }

    // Check permissions for restricted sections
    if (
      (section === "audit" || section === "deleted") &&
      req.coach.role !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({
        message:
          "Access denied. Super Admin only for audit and deleted records export.",
      });
    }

    // Validate format
    const validFormats = ["json", "csv", "xlsx"];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        message: `Invalid format: ${format}. Valid formats: ${validFormats.join(", ")}`,
      });
    }

    // Build filters from query params
    const filters = {};
    const filterKeys = [
      "age_group",
      "gender",
      "city",
      "age_min",
      "age_max",
      "size",
      "height",
      "weight",
      "jersey_no", // Player filters
      "status",
      "location",
      "name",
      "startDate",
      "endDate", // Tournament filters
      "action",
      "category",
      "severity",
      "entityType", // Audit filters
    ];
    filterKeys.forEach((key) => {
      if (req.query[key]) filters[key] = req.query[key];
    });

    // Parse selected columns if provided
    let selectedColumns = null;
    if (req.query.selectedColumns) {
      selectedColumns = req.query.selectedColumns
        .split(",")
        .map((col) => col.trim());
    }

    // Perform export
    const result = await ExportService.exportData(
      section,
      format,
      filters,
      includeHidden,
      selectedColumns,
    );

    // Log the export action
    await AuditService.logAction({
      action: AuditLog.ACTIONS.DATA_EXPORT,
      entityType: AuditLog.ENTITY_TYPES.SYSTEM,
      actorId: req.coach.id,
      actorEmail: req.coach.email,
      actorRole: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
      description: `Exported ${section} data in ${format} format (${result.meta?.totalRecords || 0} records)`,
      metadata: {
        section,
        format,
        filters,
        includeHidden,
        recordCount: result.meta?.totalRecords,
      },
    });

    // Set response headers based on format
    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`,
      );
      return res.send(result.data);
    }

    if (format === "xlsx") {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`,
      );
      return res.send(result.data);
    }

    // JSON format
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/export/all
 * Export all data sections combined (Super Admin only)
 */
router.get("/all/combined", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const format = req.query.format || "json";
    const includeHidden = req.query.includeHidden === "true";

    const result = await ExportService.exportAll(format, includeHidden);

    // Log the export
    await AuditService.logAction({
      action: AuditLog.ACTIONS.DATA_EXPORT,
      entityType: AuditLog.ENTITY_TYPES.SYSTEM,
      actorId: req.coach.id,
      actorEmail: req.coach.email,
      actorRole: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
      description: `Full system data export in ${format} format`,
      metadata: { format, includeHidden },
    });

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`,
      );
      return res.send(result.data);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

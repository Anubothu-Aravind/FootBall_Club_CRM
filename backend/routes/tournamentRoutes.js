const express = require("express");
const Tournament = require("../models/Tournament");
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

// GET /api/tournaments - Get all tournaments
router.get("/", async (req, res, next) => {
  try {
    // Support filtering by query params
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.age_group) filter.age_group = req.query.age_group;
    if (req.query.location) filter.location = new RegExp(req.query.location, "i");

    const tournaments = await Tournament.find(filter).sort({ start_date: -1 });
    res.json(tournaments);
  } catch (error) {
    next(error);
  }
});

// POST /api/tournaments - Create a new tournament (authenticated)
router.post("/", auth, async (req, res, next) => {
  try {
    const {
      name,
      age_group,
      status,
      start_date,
      end_date,
      location,
      images,
    } = req.body;

    // Input validation for required fields
    if (!name || !age_group || !start_date || !end_date || !location) {
      return res.status(400).json({
        message: "Required fields: name, age_group, start_date, end_date, location",
      });
    }

    const newTournament = new Tournament({
      name,
      age_group,
      status: status || "Upcoming",
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      location,
      images: images || [],
    });

    await newTournament.save();

    // Audit log for tournament creation
    await AuditService.logAction({
      action: AuditLog.ACTIONS.CREATE,
      entityType: AuditLog.ENTITY_TYPES.TOURNAMENT,
      entityId: newTournament.id,
      entityName: newTournament.name,
      newData: newTournament.toObject(),
      actorId: req.coach.id,
      actorEmail: req.coach.email,
      actorRole: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
      description: AuditService.generateDescription(
        AuditLog.ACTIONS.CREATE,
        "TOURNAMENT",
        newTournament.name
      ),
    });

    res.status(201).json({
      message: "Tournament created successfully",
      tournament: newTournament,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
    }
    next(error);
  }
});

// GET /api/tournaments/:id - Get tournament by ID
router.get("/:id", async (req, res, next) => {
  try {
    // Try to find by custom UUID id first, then by MongoDB _id
    let tournament = await Tournament.findOne({ id: req.params.id });

    if (!tournament && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      tournament = await Tournament.findById(req.params.id);
    }

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    res.json(tournament);
  } catch (error) {
    next(error);
  }
});

// PUT /api/tournaments/:id - Update tournament (authenticated)
router.put("/:id", auth, async (req, res, next) => {
  try {
    const updateData = {};
    const allowedFields = [
      "name",
      "age_group",
      "status",
      "start_date",
      "end_date",
      "location",
      "images",
    ];

    // Only include allowed fields in update
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Convert date fields
    if (updateData.start_date) updateData.start_date = new Date(updateData.start_date);
    if (updateData.end_date) updateData.end_date = new Date(updateData.end_date);

    // First find the tournament to get previous data
    let tournament = await Tournament.findOne({ id: req.params.id });
    if (!tournament && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      tournament = await Tournament.findById(req.params.id);
    }

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    const previousData = tournament.toObject();

    // Now update
    Object.assign(tournament, updateData);
    await tournament.save();

    // Calculate changed fields and log audit
    const changedFields = AuditService.getChangedFields(previousData, tournament.toObject());
    
    if (changedFields.length > 0) {
      await AuditService.logAction({
        action: AuditLog.ACTIONS.UPDATE,
        entityType: AuditLog.ENTITY_TYPES.TOURNAMENT,
        entityId: tournament.id,
        entityName: tournament.name,
        previousData,
        newData: tournament.toObject(),
        changedFields,
        actorId: req.coach.id,
        actorEmail: req.coach.email,
        actorRole: req.coach.role,
        ipAddress: req.clientIP,
        userAgent: req.clientUserAgent,
        description: AuditService.generateDescription(
          AuditLog.ACTIONS.UPDATE,
          "TOURNAMENT",
          tournament.name,
          changedFields,
          previousData,
          tournament.toObject()
        ),
      });
    }

    res.json({ message: "Tournament updated successfully", tournament });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid data",
        error: error.message,
      });
    }
    next(error);
  }
});

// DELETE /api/tournaments/:id - Delete tournament (Super Admin only) - Uses soft delete
router.delete("/:id", auth, isSuperAdmin, async (req, res, next) => {
  try {
    const actorInfo = {
      id: req.coach.id,
      email: req.coach.email,
      role: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
    };

    const result = await RestorationService.softDelete(
      "TOURNAMENT",
      req.params.id,
      actorInfo,
      (req.body && req.body.reason) || ""
    );

    res.json({
      message: "Tournament deleted successfully",
      deletedRecord: result.deletedRecord,
    });
  } catch (error) {
    if (error.message === "TOURNAMENT not found" || error.message.includes("not found")) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid tournament ID" });
    }
    next(error);
  }
});

module.exports = router;

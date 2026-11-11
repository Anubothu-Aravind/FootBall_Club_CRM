const express = require("express");
const Training = require("../models/Training");
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

// GET /api/trainings - Get all training sessions
router.get("/", async (req, res, next) => {
  try {
    // Support filtering by query params
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.age_group) filter.age_group = req.query.age_group;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.location) filter.location = new RegExp(req.query.location, "i");

    const trainings = await Training.find(filter).sort({ session_date: -1 });
    res.json(trainings);
  } catch (error) {
    next(error);
  }
});

// POST /api/trainings - Create a new training session (authenticated)
router.post("/", auth, async (req, res, next) => {
  try {
    const {
      title,
      age_group,
      type,
      status,
      session_date,
      duration,
      location,
      coach_name,
      participants_count,
      description,
      images,
    } = req.body;

    // Input validation for required fields
    if (!title || !age_group || !session_date || !duration || !location) {
      return res.status(400).json({
        message: "Required fields: title, age_group, session_date, duration, location",
      });
    }

    const newTraining = new Training({
      title,
      age_group,
      type: type || "Technical",
      status: status || "Scheduled",
      session_date: new Date(session_date),
      duration,
      location,
      coach_name,
      participants_count,
      description,
      images: images || [],
    });

    await newTraining.save();

    // Audit log for training creation
    await AuditService.logAction({
      action: AuditLog.ACTIONS.CREATE,
      entityType: AuditLog.ENTITY_TYPES.TRAINING,
      entityId: newTraining.id,
      entityName: newTraining.title,
      newData: newTraining.toObject(),
      actorId: req.coach.id,
      actorEmail: req.coach.email,
      actorRole: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
      description: AuditService.generateDescription(
        AuditLog.ACTIONS.CREATE,
        "TRAINING",
        newTraining.title
      ),
    });

    res.status(201).json({
      message: "Training session created successfully",
      training: newTraining,
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

// GET /api/trainings/:id - Get training session by ID
router.get("/:id", async (req, res, next) => {
  try {
    // Try to find by custom UUID id first, then by MongoDB _id
    let training = await Training.findOne({ id: req.params.id });

    if (!training && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      training = await Training.findById(req.params.id);
    }

    if (!training) {
      return res.status(404).json({ message: "Training session not found" });
    }
    res.json(training);
  } catch (error) {
    next(error);
  }
});

// PUT /api/trainings/:id - Update training session (authenticated)
router.put("/:id", auth, async (req, res, next) => {
  try {
    const updateData = {};
    const allowedFields = [
      "title",
      "age_group",
      "type",
      "status",
      "session_date",
      "duration",
      "location",
      "coach_name",
      "participants_count",
      "description",
      "images",
    ];

    // Only include allowed fields in update
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Convert date field
    if (updateData.session_date) updateData.session_date = new Date(updateData.session_date);

    // First find the training to get previous data
    let training = await Training.findOne({ id: req.params.id });
    if (!training && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      training = await Training.findById(req.params.id);
    }

    if (!training) {
      return res.status(404).json({ message: "Training session not found" });
    }

    const previousData = training.toObject();

    // Now update
    Object.assign(training, updateData);
    await training.save();

    // Calculate changed fields and log audit
    const changedFields = AuditService.getChangedFields(previousData, training.toObject());
    
    if (changedFields.length > 0) {
      await AuditService.logAction({
        action: AuditLog.ACTIONS.UPDATE,
        entityType: AuditLog.ENTITY_TYPES.TRAINING,
        entityId: training.id,
        entityName: training.title,
        previousData,
        newData: training.toObject(),
        changedFields,
        actorId: req.coach.id,
        actorEmail: req.coach.email,
        actorRole: req.coach.role,
        ipAddress: req.clientIP,
        userAgent: req.clientUserAgent,
        description: AuditService.generateDescription(
          AuditLog.ACTIONS.UPDATE,
          "TRAINING",
          training.title,
          changedFields,
          previousData,
          training.toObject()
        ),
      });
    }

    res.json({ message: "Training session updated successfully", training });
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

// DELETE /api/trainings/:id - Delete training session (Super Admin only) - Uses soft delete
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
      "TRAINING",
      req.params.id,
      actorInfo,
      (req.body && req.body.reason) || ""
    );

    res.json({
      message: "Training session deleted successfully",
      deletedRecord: result.deletedRecord,
    });
  } catch (error) {
    if (error.message === "TRAINING not found" || error.message.includes("not found")) {
      return res.status(404).json({ message: "Training session not found" });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid training session ID" });
    }
    next(error);
  }
});

module.exports = router;

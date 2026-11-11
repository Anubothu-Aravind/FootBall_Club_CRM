const express = require("express");
const Player = require("../models/Player");
const auth = require("../middleware/authMiddleware");
const AuditService = require("../services/auditService");
const RestorationService = require("../services/restorationService");
const AuditLog = require("../models/AuditLog");

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

// GET /api/players - Get all players (authenticated)
router.get("/", auth, async (req, res, next) => {
  try {
    // Support filtering by query params
    const filter = {};
    if (req.query.age_group) filter.age_group = req.query.age_group;
    if (req.query.gender) filter.gender = req.query.gender;
    if (req.query.city) filter.city = req.query.city;

    const players = await Player.find(filter).sort({ createdAt: -1 });
    res.json(players);
  } catch (error) {
    next(error);
  }
});

// POST /api/players - Add new player (authenticated)
router.post("/", auth, async (req, res, next) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      age,
      age_group,
      age_group_auto,
      gender,
      size,
      height,
      weight,
      jersey_no,
      address,
      city,
    } = req.body;

    // Input validation for required fields
    // age_group is no longer strictly required — it auto-calculates from age
    if (
      !first_name ||
      !last_name ||
      !age ||
      !gender ||
      !size ||
      !height ||
      !weight ||
      !jersey_no
    ) {
      return res.status(400).json({
        message:
          "Required fields: first_name, last_name, age, gender, size, height, weight, jersey_no",
      });
    }

    // Determine if age_group should be auto-calculated
    const isAutoAgeGroup = age_group_auto !== false && !age_group;
    const { calculateAgeGroup } = require("../models/Player");

    const newPlayer = new Player({
      first_name,
      middle_name: middle_name || "",
      last_name,
      age: Number(age),
      age_group: age_group || calculateAgeGroup(Number(age)),
      age_group_auto: isAutoAgeGroup || age_group_auto === true,
      gender,
      size,
      height: Number(height),
      weight: Number(weight),
      jersey_no: Number(jersey_no),
      address: address || "",
      city: city || "",
    });

    await newPlayer.save();

    // Audit log for player creation
    await AuditService.logAction({
      action: AuditLog.ACTIONS.CREATE,
      entityType: AuditLog.ENTITY_TYPES.PLAYER,
      entityId: newPlayer.id,
      entityName: `${newPlayer.first_name} ${newPlayer.last_name}`,
      newData: newPlayer.toObject(),
      actorId: req.coach.id,
      actorEmail: req.coach.email,
      actorRole: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
      description: AuditService.generateDescription(
        AuditLog.ACTIONS.CREATE,
        "PLAYER",
        `${newPlayer.first_name} ${newPlayer.last_name}`,
      ),
    });

    res.status(201).json({
      message: "Player added successfully",
      player: newPlayer,
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

// GET /api/players/:id - Get single player by ID (authenticated)
router.get("/:id", auth, async (req, res, next) => {
  try {
    // Try to find by custom UUID id first, then by MongoDB _id
    let player = await Player.findOne({ id: req.params.id });

    if (!player && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      player = await Player.findById(req.params.id);
    }

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.json(player);
  } catch (error) {
    next(error);
  }
});

// PUT /api/players/:id - Update player (authenticated)
router.put("/:id", auth, async (req, res, next) => {
  try {
    const updateData = {};
    const allowedFields = [
      "first_name",
      "middle_name",
      "last_name",
      "age",
      "age_group",
      "age_group_auto",
      "gender",
      "size",
      "height",
      "weight",
      "jersey_no",
      "address",
      "city",
    ];

    // Only include allowed fields in update
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Convert numeric fields
    if (updateData.age) updateData.age = Number(updateData.age);
    if (updateData.height) updateData.height = Number(updateData.height);
    if (updateData.weight) updateData.weight = Number(updateData.weight);
    if (updateData.jersey_no)
      updateData.jersey_no = Number(updateData.jersey_no);

    // Auto-calculate age group if age changed and age_group_auto is true
    if (updateData.age && !updateData.age_group) {
      const { calculateAgeGroup } = require("../models/Player");
      // Only auto-calculate if the user hasn't explicitly set age_group
      if (updateData.age_group_auto !== false) {
        updateData.age_group = calculateAgeGroup(updateData.age);
      }
    }

    // First find the player to get previous data
    let player = await Player.findOne({ id: req.params.id });
    if (!player && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      player = await Player.findById(req.params.id);
    }

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const previousData = player.toObject();

    // Now update
    Object.assign(player, updateData);
    await player.save();

    // Calculate changed fields and log audit
    const changedFields = AuditService.getChangedFields(
      previousData,
      player.toObject(),
    );

    if (changedFields.length > 0) {
      await AuditService.logAction({
        action: AuditLog.ACTIONS.UPDATE,
        entityType: AuditLog.ENTITY_TYPES.PLAYER,
        entityId: player.id,
        entityName: `${player.first_name} ${player.last_name}`,
        previousData,
        newData: player.toObject(),
        changedFields,
        actorId: req.coach.id,
        actorEmail: req.coach.email,
        actorRole: req.coach.role,
        ipAddress: req.clientIP,
        userAgent: req.clientUserAgent,
        description: AuditService.generateDescription(
          AuditLog.ACTIONS.UPDATE,
          "PLAYER",
          `${player.first_name} ${player.last_name}`,
          changedFields,
          previousData,
          player.toObject(),
        ),
      });
    }

    res.json({ message: "Player updated successfully", player });
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

// DELETE /api/players/:id - Delete player (Super Admin only) - Uses soft delete
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
      "PLAYER",
      req.params.id,
      actorInfo,
      (req.body && req.body.reason) || "",
    );

    res.json({
      message: "Player deleted successfully",
      deletedRecord: result.deletedRecord,
    });
  } catch (error) {
    if (
      error.message === "PLAYER not found" ||
      error.message === "Invalid entity type: PLAYER"
    ) {
      return res.status(404).json({ message: "Player not found" });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid player ID" });
    }
    next(error);
  }
});

module.exports = router;

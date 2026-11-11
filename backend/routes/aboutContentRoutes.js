const express = require("express");
const AboutJersey = require("../models/AboutJersey");
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// ═══════════════════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════════════════

/**
 * GET /api/about-content/jerseys
 * Returns all active jerseys (featured first, then by order)
 */
router.get("/jerseys", async (req, res, next) => {
  try {
    const jerseys = await AboutJersey.getActiveJerseys();
    const featured = jerseys.find((j) => j.isFeatured) || jerseys[0] || null;
    const archive = jerseys.filter((j) => !j.isFeatured);
    res.json({ featured, archive, total: jerseys.length });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════
// ADMIN ENDPOINTS (Auth required)
// ═══════════════════════════════════════════════════════

/**
 * GET /api/about-content/jerseys/all
 * Returns ALL jerseys including inactive (admin view)
 */
router.get("/jerseys/all", auth, requireRole("SUPER_ADMIN"), async (req, res, next) => {
  try {
    const jerseys = await AboutJersey.find()
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .lean();
    res.json({ jerseys, total: jerseys.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/about-content/jerseys/:id
 * Get a single jersey by custom id
 */
router.get("/jerseys/:id", auth, async (req, res, next) => {
  try {
    const jersey = await AboutJersey.findOne({ id: req.params.id }).lean();
    if (!jersey) return res.status(404).json({ message: "Jersey not found" });
    res.json(jersey);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/about-content/jerseys
 * Create a new jersey entry
 */
router.post("/jerseys", auth, requireRole("SUPER_ADMIN"), async (req, res, next) => {
  try {
    const { season, type, colorway, description, imageUrl, thumbnailUrl, cloudinaryPublicId, isFeatured, order, isActive } = req.body;

    if (!season || !colorway || !imageUrl) {
      return res.status(400).json({ message: "season, colorway, and imageUrl are required" });
    }

    // If marking as featured, unmark all others
    if (isFeatured) {
      await AboutJersey.updateMany({}, { isFeatured: false });
    }

    const jersey = await AboutJersey.create({
      season,
      type: type || "Home",
      colorway,
      description: description || "",
      imageUrl,
      thumbnailUrl: thumbnailUrl || "",
      cloudinaryPublicId: cloudinaryPublicId || "",
      isFeatured: isFeatured || false,
      order: order ?? (await AboutJersey.countDocuments()),
      isActive: isActive !== false,
    });

    res.status(201).json(jersey);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/about-content/jerseys/:id
 * Update a jersey entry
 */
router.put("/jerseys/:id", auth, requireRole("SUPER_ADMIN"), async (req, res, next) => {
  try {
    const jersey = await AboutJersey.findOne({ id: req.params.id });
    if (!jersey) return res.status(404).json({ message: "Jersey not found" });

    const { season, type, colorway, description, imageUrl, thumbnailUrl, cloudinaryPublicId, isFeatured, order, isActive } = req.body;

    // If marking as featured, unmark all others
    if (isFeatured && !jersey.isFeatured) {
      await AboutJersey.updateMany({ _id: { $ne: jersey._id } }, { isFeatured: false });
    }

    if (season !== undefined) jersey.season = season;
    if (type !== undefined) jersey.type = type;
    if (colorway !== undefined) jersey.colorway = colorway;
    if (description !== undefined) jersey.description = description;
    if (imageUrl !== undefined) jersey.imageUrl = imageUrl;
    if (thumbnailUrl !== undefined) jersey.thumbnailUrl = thumbnailUrl;
    if (cloudinaryPublicId !== undefined) jersey.cloudinaryPublicId = cloudinaryPublicId;
    if (isFeatured !== undefined) jersey.isFeatured = isFeatured;
    if (order !== undefined) jersey.order = order;
    if (isActive !== undefined) jersey.isActive = isActive;

    await jersey.save();
    res.json(jersey);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/about-content/jerseys/:id
 * Delete a jersey entry
 */
router.delete("/jerseys/:id", auth, requireRole("SUPER_ADMIN"), async (req, res, next) => {
  try {
    const jersey = await AboutJersey.findOneAndDelete({ id: req.params.id });
    if (!jersey) return res.status(404).json({ message: "Jersey not found" });
    res.json({ message: "Jersey deleted", jersey });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/about-content/jerseys/seed
 * Seed default jerseys (only if collection is empty)
 */
router.post("/jerseys/seed", auth, requireRole("SUPER_ADMIN"), async (req, res, next) => {
  try {
    await AboutJersey.seedDefaults();
    const jerseys = await AboutJersey.find().sort({ isFeatured: -1, order: 1 }).lean();
    res.json({ message: "Jerseys seeded", jerseys, total: jerseys.length });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/about-content/jerseys/migrate-likes
 * Migrate old-format jerseyId values in JerseyLike collection to stable AboutJersey UUIDs.
 * Old formats: "current-2025-26", "2021–22", "2022–23", etc.
 * New format: the stable UUID from AboutJersey.id
 */
router.post("/jerseys/migrate-likes", auth, requireRole("SUPER_ADMIN"), async (req, res, next) => {
  try {
    const JerseyLike = require("../models/JerseyLike");

    // Build season→UUID mapping from AboutJersey collection
    const allJerseys = await AboutJersey.find().lean();
    const seasonToUuid = {};
    allJerseys.forEach((j) => {
      // Normalize season: "2025–26" → "2025-26", "2025–26" stays as-is
      const normalizedSeason = j.season.replace(/[–—]/g, "-");
      seasonToUuid[j.season] = j.id;             // exact match e.g. "2025–26"
      seasonToUuid[normalizedSeason] = j.id;      // normalized e.g. "2025-26"
      seasonToUuid[`current-${normalizedSeason}`] = j.id; // old featured format e.g. "current-2025-26"
    });

    // Find all JerseyLike records whose jerseyId is NOT already a UUID (not 36 chars with dashes)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const allLikes = await JerseyLike.find().lean();

    const migratedIds = [];
    const skipped = [];
    const noMatch = [];

    for (const like of allLikes) {
      if (uuidPattern.test(like.jerseyId)) {
        // Already a UUID — check if it exists in AboutJersey
        const exists = allJerseys.some((j) => j.id === like.jerseyId);
        if (exists) {
          skipped.push(like.jerseyId);
          continue;
        }
        // UUID but not matching any jersey — skip (might be a deleted jersey)
        skipped.push(like.jerseyId);
        continue;
      }

      // Old-format jerseyId — try to map
      const targetUuid = seasonToUuid[like.jerseyId];
      if (!targetUuid) {
        noMatch.push(like.jerseyId);
        continue;
      }

      // Check if this user/session already has a like on the target jersey UUID
      const duplicateQuery = { jerseyId: targetUuid };
      if (like.userId) {
        duplicateQuery.userId = like.userId;
      } else if (like.sessionId) {
        duplicateQuery.sessionId = like.sessionId;
      }
      const existingLike = await JerseyLike.findOne(duplicateQuery);

      if (existingLike) {
        // Duplicate — delete the old-format record (keep the UUID one)
        await JerseyLike.deleteOne({ _id: like._id });
        migratedIds.push({ old: like.jerseyId, action: "deleted-duplicate", likeId: like.id });
      } else {
        // Remap jerseyId to UUID
        await JerseyLike.updateOne({ _id: like._id }, { $set: { jerseyId: targetUuid } });
        migratedIds.push({ old: like.jerseyId, new: targetUuid, action: "remapped", likeId: like.id });
      }
    }

    res.json({
      message: "Like migration complete",
      migrated: migratedIds.length,
      skipped: skipped.length,
      noMatch,
      details: migratedIds,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

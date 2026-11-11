const express = require("express");
const GalleryImage = require("../models/Gallery");
const AuditService = require("../services/auditService");
const AuditLog = require("../models/AuditLog");
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authMiddleware");
const cloudinaryService = require("../services/cloudinaryService");

const router = express.Router();

// ═══════════════════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════════════════

/**
 * GET /api/gallery
 * Get all active gallery images (public)
 * Query: ?category=General&page=1&limit=20
 */
router.get("/", async (req, res, next) => {
  try {
    const { category, page = 1, limit = 50, tags } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(",").map((t) => t.trim()) };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await GalleryImage.countDocuments(query);
    const images = await GalleryImage.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      images,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/gallery/categories
 * Get all gallery categories (public)
 */
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await GalleryImage.getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/gallery/:id
 * Get a single gallery image (public)
 */
router.get("/:id", async (req, res, next) => {
  try {
    const image = await GalleryImage.findOne({ id: req.params.id, isActive: true });
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    res.json(image);
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════
// ADMIN ENDPOINTS (Super Admin)
// ═══════════════════════════════════════════════════════

/**
 * GET /api/gallery/admin/all
 * Get all gallery images including inactive (Super Admin)
 */
router.get(
  "/admin/all",
  auth,
  requireRole("SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const images = await GalleryImage.find({})
        .sort({ category: 1, order: 1, createdAt: -1 })
        .lean();
      const categories = await GalleryImage.getCategories();
      res.json({ images, categories, total: images.length });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/gallery
 * Add a new gallery image (Super Admin)
 * Body: { imageUrl, title, description, alt, category, tags, order, thumbnailUrl }
 *   OR  { imageBase64, ... } for base64 upload via Cloudinary
 */
router.post(
  "/",
  auth,
  requireRole("SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const {
        imageUrl,
        imageBase64,
        title,
        description,
        alt,
        category,
        tags,
        order,
      } = req.body;

      let finalUrl = imageUrl || "";
      let thumbnailUrl = req.body.thumbnailUrl || "";
      let cloudinaryPublicId = "";
      let width = 0;
      let height = 0;
      let fileSize = 0;

      // If base64 provided, upload to Cloudinary
      if (imageBase64) {
        const uploadResult = await cloudinaryService.uploadImage(imageBase64, {
          folder: "pocket-soccer-scout/gallery",
        });
        finalUrl = uploadResult.url;
        thumbnailUrl = uploadResult.thumbnailUrl || uploadResult.url;
        cloudinaryPublicId = uploadResult.publicId || "";
        width = uploadResult.width || 0;
        height = uploadResult.height || 0;
        fileSize = uploadResult.bytes || 0;
      }

      if (!finalUrl) {
        return res.status(400).json({ message: "Image URL or base64 data is required" });
      }

      const newImage = await GalleryImage.create({
        imageUrl: finalUrl,
        thumbnailUrl: thumbnailUrl || finalUrl,
        title: title || "",
        description: description || "",
        alt: alt || title || "",
        category: category || "General",
        tags: tags || [],
        order: order || 0,
        cloudinaryPublicId,
        width,
        height,
        fileSize,
        uploadedBy: req.coach.id,
        uploadedByEmail: req.coach.email,
      });

      // Audit log
      await AuditService.logAction({
        action: AuditLog.ACTIONS.CREATE,
        entityType: AuditLog.ENTITY_TYPES.SYSTEM,
        entityId: newImage.id,
        entityName: `Gallery Image: ${newImage.title || newImage.id}`,
        newData: { imageUrl: finalUrl, category },
        actorId: req.coach.id,
        actorEmail: req.coach.email,
        actorRole: req.coach.role,
        ipAddress: req.clientIP,
        userAgent: req.clientUserAgent,
        description: `Added gallery image "${newImage.title || newImage.id}"`,
      });

      res.status(201).json({ message: "Gallery image added", image: newImage });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/gallery/bulk
 * Bulk upload gallery images (Super Admin)
 * Body: { images: [{ imageUrl, title, category, ... }] }
 *   OR  { images: [{ imageBase64, title, category, ... }] }
 */
router.post(
  "/bulk",
  auth,
  requireRole("SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const { images } = req.body;
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ message: "images array is required" });
      }

      const results = [];
      const errors = [];

      for (let i = 0; i < images.length; i++) {
        try {
          const img = images[i];
          let finalUrl = img.imageUrl || "";
          let thumbnailUrl = img.thumbnailUrl || "";
          let cloudinaryPublicId = "";
          let width = 0;
          let height = 0;
          let fileSize = 0;

          if (img.imageBase64) {
            const uploadResult = await cloudinaryService.uploadImage(img.imageBase64, {
              folder: "pocket-soccer-scout/gallery",
            });
            finalUrl = uploadResult.url;
            thumbnailUrl = uploadResult.thumbnailUrl || uploadResult.url;
            cloudinaryPublicId = uploadResult.publicId || "";
            width = uploadResult.width || 0;
            height = uploadResult.height || 0;
            fileSize = uploadResult.bytes || 0;
          }

          if (!finalUrl) {
            errors.push({ index: i, error: "No image URL or base64 data" });
            continue;
          }

          const newImage = await GalleryImage.create({
            imageUrl: finalUrl,
            thumbnailUrl: thumbnailUrl || finalUrl,
            title: img.title || "",
            description: img.description || "",
            alt: img.alt || img.title || "",
            category: img.category || "General",
            tags: img.tags || [],
            order: img.order || i,
            cloudinaryPublicId,
            width,
            height,
            fileSize,
            uploadedBy: req.coach.id,
            uploadedByEmail: req.coach.email,
          });

          results.push(newImage);
        } catch (err) {
          errors.push({ index: i, error: err.message });
        }
      }

      // Audit log
      await AuditService.logAction({
        action: AuditLog.ACTIONS.BULK_OPERATION,
        entityType: AuditLog.ENTITY_TYPES.SYSTEM,
        entityName: "Gallery Bulk Upload",
        newData: { uploaded: results.length, failed: errors.length },
        actorId: req.coach.id,
        actorEmail: req.coach.email,
        actorRole: req.coach.role,
        ipAddress: req.clientIP,
        userAgent: req.clientUserAgent,
        description: `Bulk uploaded ${results.length} gallery images (${errors.length} failed)`,
      });

      res.status(201).json({
        message: `Uploaded ${results.length} images, ${errors.length} failed`,
        images: results,
        errors,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/gallery/:id
 * Update a gallery image (Super Admin)
 */
router.put(
  "/:id",
  auth,
  requireRole("SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const image = await GalleryImage.findOne({ id: req.params.id });
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }

      const allowedFields = [
        "title", "description", "alt", "category", "tags",
        "order", "isActive", "imageUrl", "thumbnailUrl",
      ];

      const previousData = image.toObject();

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          image[field] = req.body[field];
        }
      });

      // If new base64 image provided, upload to Cloudinary
      if (req.body.imageBase64) {
        // Delete old image from Cloudinary if exists
        if (image.cloudinaryPublicId) {
          await cloudinaryService.deleteImage(image.cloudinaryPublicId);
        }

        const uploadResult = await cloudinaryService.uploadImage(req.body.imageBase64, {
          folder: "pocket-soccer-scout/gallery",
        });
        image.imageUrl = uploadResult.url;
        image.thumbnailUrl = uploadResult.thumbnailUrl || uploadResult.url;
        image.cloudinaryPublicId = uploadResult.publicId || "";
        image.width = uploadResult.width || 0;
        image.height = uploadResult.height || 0;
        image.fileSize = uploadResult.bytes || 0;
      }

      await image.save();

      // Audit log
      await AuditService.logAction({
        action: AuditLog.ACTIONS.UPDATE,
        entityType: AuditLog.ENTITY_TYPES.SYSTEM,
        entityId: image.id,
        entityName: `Gallery Image: ${image.title || image.id}`,
        previousData,
        newData: image.toObject(),
        actorId: req.coach.id,
        actorEmail: req.coach.email,
        actorRole: req.coach.role,
        ipAddress: req.clientIP,
        userAgent: req.clientUserAgent,
        description: `Updated gallery image "${image.title || image.id}"`,
      });

      res.json({ message: "Gallery image updated", image });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/gallery/reorder
 * Reorder gallery images (Super Admin)
 * Body: { orderedIds: ["id1", "id2", ...] }
 */
router.put(
  "/reorder/batch",
  auth,
  requireRole("SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const { orderedIds } = req.body;
      if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).json({ message: "orderedIds array is required" });
      }

      await GalleryImage.reorderImages(orderedIds);
      res.json({ message: "Gallery images reordered successfully" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/gallery/:id
 * Delete a gallery image (Super Admin)
 */
router.delete(
  "/:id",
  auth,
  requireRole("SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const image = await GalleryImage.findOne({ id: req.params.id });
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }

      // Delete from Cloudinary if applicable
      if (image.cloudinaryPublicId) {
        await cloudinaryService.deleteImage(image.cloudinaryPublicId);
      }

      await GalleryImage.deleteOne({ id: req.params.id });

      // Audit log
      await AuditService.logAction({
        action: AuditLog.ACTIONS.DELETE,
        entityType: AuditLog.ENTITY_TYPES.SYSTEM,
        entityId: image.id,
        entityName: `Gallery Image: ${image.title || image.id}`,
        previousData: image.toObject(),
        actorId: req.coach.id,
        actorEmail: req.coach.email,
        actorRole: req.coach.role,
        ipAddress: req.clientIP,
        userAgent: req.clientUserAgent,
        description: `Deleted gallery image "${image.title || image.id}"`,
      });

      res.json({ message: "Gallery image deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

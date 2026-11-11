const express = require("express");
const cloudinaryService = require("../services/cloudinaryService");
const azureService = require("../services/azureService");
const AuditService = require("../services/auditService");
const AuditLog = require("../models/AuditLog");
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Increase JSON body limit for base64 image uploads
// Note: Also set in server.js, but this is a safety net
const express5 = require("express");

/**
 * GET /api/upload/status
 * Check upload service status (which provider is active)
 */
router.get("/status", auth, async (req, res, next) => {
  try {
    const status = {
      provider: "none",
      cloudinary: {
        configured: cloudinaryService.isConfigured(),
        usage: null,
      },
      azure: {
        enabled: azureService.isAzureEnabled(),
        blobConfigured: !!process.env.AZURE_BLOB_CONNECTION,
      },
    };

    if (azureService.isAzureEnabled() && process.env.AZURE_BLOB_CONNECTION) {
      status.provider = "azure_blob";
    } else if (cloudinaryService.isConfigured()) {
      status.provider = "cloudinary";
      status.cloudinary.usage = await cloudinaryService.getUsageStats();
    } else {
      status.provider = "url_only";
    }

    res.json(status);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/upload/image
 * Upload a single image (Auth required)
 * Body: { image: "base64string or URL", folder: "gallery", aspectRatio: "16:9" }
 */
router.post("/image", auth, async (req, res, next) => {
  try {
    const { image, folder, aspectRatio, publicId } = req.body;

    if (!image) {
      return res.status(400).json({ message: "image (base64 or URL) is required" });
    }

    const options = {
      folder: folder ? `pocket-soccer-scout/${folder}` : "pocket-soccer-scout/general",
    };
    if (aspectRatio) options.aspectRatio = aspectRatio;
    if (publicId) options.publicId = publicId;

    // Use unified upload (Azure Blob or Cloudinary based on configuration)
    const result = await azureService.uploadImageUnified(image, {
      ...options,
      filename: `img-${Date.now()}.jpg`,
    });

    // Audit log
    await AuditService.logAction({
      action: AuditLog.ACTIONS.CREATE,
      entityType: AuditLog.ENTITY_TYPES.SYSTEM,
      entityName: "Image Upload",
      newData: { url: result.url, folder, provider: result.isAzure ? "azure" : result.isCloudinary ? "cloudinary" : "url" },
      actorId: req.coach.id,
      actorEmail: req.coach.email,
      actorRole: req.coach.role,
      ipAddress: req.clientIP,
      userAgent: req.clientUserAgent,
      description: `Uploaded image to ${folder || "general"}`,
    });

    res.status(201).json({
      message: "Image uploaded successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/upload/images
 * Bulk upload images (Super Admin)
 * Body: { images: [{ image: "base64/URL", folder, aspectRatio }] }
 */
router.post(
  "/images",
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
          const { image, folder, aspectRatio } = images[i];
          if (!image) {
            errors.push({ index: i, error: "No image data provided" });
            continue;
          }

          const options = {
            folder: folder
              ? `pocket-soccer-scout/${folder}`
              : "pocket-soccer-scout/general",
            filename: `img-${Date.now()}-${i}.jpg`,
          };
          if (aspectRatio) options.aspectRatio = aspectRatio;

          const result = await azureService.uploadImageUnified(image, options);
          results.push({ index: i, success: true, ...result });
        } catch (err) {
          errors.push({ index: i, success: false, error: err.message });
        }
      }

      // Audit log
      await AuditService.logAction({
        action: AuditLog.ACTIONS.BULK_OPERATION,
        entityType: AuditLog.ENTITY_TYPES.SYSTEM,
        entityName: "Bulk Image Upload",
        newData: { uploaded: results.length, failed: errors.length },
        actorId: req.coach.id,
        actorEmail: req.coach.email,
        actorRole: req.coach.role,
        ipAddress: req.clientIP,
        userAgent: req.clientUserAgent,
        description: `Bulk uploaded ${results.length} images (${errors.length} failed)`,
      });

      res.status(201).json({
        message: `Uploaded ${results.length} images, ${errors.length} failed`,
        results,
        errors,
        total: images.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/upload/image
 * Delete an image by public ID or blob name (Super Admin)
 * Body: { publicId: "..." }
 */
router.delete(
  "/image",
  auth,
  requireRole("SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const { publicId } = req.body;
      if (!publicId) {
        return res.status(400).json({ message: "publicId is required" });
      }

      await azureService.deleteImageUnified(publicId);

      // Audit log
      await AuditService.logAction({
        action: AuditLog.ACTIONS.DELETE,
        entityType: AuditLog.ENTITY_TYPES.SYSTEM,
        entityName: "Image Delete",
        previousData: { publicId },
        actorId: req.coach.id,
        actorEmail: req.coach.email,
        actorRole: req.coach.role,
        ipAddress: req.clientIP,
        userAgent: req.clientUserAgent,
        description: `Deleted image: ${publicId}`,
      });

      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

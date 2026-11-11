const express = require("express");
const ContactInfo = require("../models/ContactInfo");
const AuditService = require("../services/auditService");
const AuditLog = require("../models/AuditLog");
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// ═══════════════════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════════════════

/**
 * GET /api/contact-info
 * Get active contact information (public)
 */
router.get("/", async (req, res, next) => {
  try {
    const contactInfo = await ContactInfo.getActiveContactInfo();
    res.json(contactInfo);
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════
// ADMIN ENDPOINTS (Super Admin)
// ═══════════════════════════════════════════════════════

/**
 * GET /api/contact-info/admin
 * Get full contact info for editing (Super Admin)
 */
router.get(
  "/admin",
  auth,
  requireRole("SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const contactInfo = await ContactInfo.getActiveContactInfo();
      res.json(contactInfo);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/contact-info
 * Update contact information (Super Admin)
 * Body: { organizationName, email, phone, addressLine1, ... }
 */
router.put(
  "/",
  auth,
  requireRole("SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const editorInfo = { id: req.coach.id, email: req.coach.email };
      
      // Get previous data for audit
      const previous = await ContactInfo.getActiveContactInfo();
      const previousData = previous ? previous.toObject() : {};

      const allowedFields = [
        "organizationName", "tagline", "logoUrl",
        "email", "phone", "address",
        "mapCoordinates", "socialLinks", "officeHours",
      ];

      const updateData = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const updated = await ContactInfo.upsertContactInfo(updateData, editorInfo);

      // Audit log
      const changedFields = AuditService.getChangedFields(previousData, updated.toObject());
      if (changedFields.length > 0) {
        await AuditService.logAction({
          action: AuditLog.ACTIONS.UPDATE,
          entityType: AuditLog.ENTITY_TYPES.SYSTEM,
          entityId: updated.id,
          entityName: "Contact Information",
          previousData,
          newData: updated.toObject(),
          changedFields,
          actorId: req.coach.id,
          actorEmail: req.coach.email,
          actorRole: req.coach.role,
          ipAddress: req.clientIP,
          userAgent: req.clientUserAgent,
          description: `Updated contact information (${changedFields.length} fields changed)`,
        });
      }

      res.json({ message: "Contact information updated successfully", contactInfo: updated });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/contact-info/social-links
 * Update only social media links (Super Admin)
 * Body: { socialLinks: [{ platform, url, label, icon, isActive }] }
 */
router.put(
  "/social-links",
  auth,
  requireRole("SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const { socialLinks } = req.body;
      if (!Array.isArray(socialLinks)) {
        return res.status(400).json({ message: "socialLinks must be an array" });
      }

      const contactInfo = await ContactInfo.getActiveContactInfo();
      contactInfo.socialLinks = socialLinks;
      contactInfo.lastEditedBy = req.coach.id;
      contactInfo.lastEditedByEmail = req.coach.email;
      await contactInfo.save();

      // Audit log
      await AuditService.logAction({
        action: AuditLog.ACTIONS.UPDATE,
        entityType: AuditLog.ENTITY_TYPES.SYSTEM,
        entityId: contactInfo.id,
        entityName: "Contact Information - Social Links",
        newData: { socialLinks },
        actorId: req.coach.id,
        actorEmail: req.coach.email,
        actorRole: req.coach.role,
        ipAddress: req.clientIP,
        userAgent: req.clientUserAgent,
        description: `Updated social media links (${socialLinks.length} links)`,
      });

      res.json({ message: "Social links updated successfully", contactInfo });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

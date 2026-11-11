const express = require("express");
const router = express.Router();
const { sendContactFormEmail } = require("../services/emailService");
const mongoose = require("mongoose");

/**
 * ContactSubmission Schema — stores all contact form submissions in the database.
 * This is defined inline to keep the existing contactRoutes.js self-contained.
 */
const ContactSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    organization: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
    notes: { type: String, default: "" },
    repliedBy: { type: String, default: "" },
    repliedAt: { type: Date },
    ipAddress: { type: String, default: "" },
  },
  { timestamps: true }
);
const ContactSubmission =
  mongoose.models.ContactSubmission ||
  mongoose.model("ContactSubmission", ContactSubmissionSchema);

/**
 * POST /api/contact
 * Public endpoint — sends the contact form submission via email
 * to the Anantapur FC admin inbox and a confirmation to the sender.
 * Also stores the submission in the database.
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, organization, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required.",
      });
    }

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Store in database
    await ContactSubmission.create({
      name,
      email,
      phone: phone || "",
      organization: organization || "",
      subject: subject || "Contact Form Submission",
      message,
      ipAddress: req.clientIP || "",
    });

    // Send the email
    await sendContactFormEmail({
      name,
      email,
      phone: phone || "Not provided",
      organization: organization || "Not provided",
      subject: subject || "Contact Form Submission",
      message,
    });

    return res.status(200).json({
      success: true,
      message: "Your message has been sent. We will respond shortly.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send your message right now. Please try again later.",
    });
  }
});

// ═══════════════════════════════════════════════════════
// ADMIN ENDPOINTS — Manage contact submissions
// ═══════════════════════════════════════════════════════

const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authMiddleware");

/**
 * GET /api/contact/submissions
 * Get all contact form submissions (Super Admin)
 * Query: ?status=new&page=1&limit=20
 */
router.get(
  "/submissions",
  auth,
  requireRole("SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const { status, page = 1, limit = 20, search } = req.query;
      const query = {};

      if (status) query.status = status;
      if (search) {
        query.$or = [
          { name: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
          { subject: new RegExp(search, "i") },
          { message: new RegExp(search, "i") },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await ContactSubmission.countDocuments(query);
      const submissions = await ContactSubmission.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      res.json({
        submissions,
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
  }
);

/**
 * GET /api/contact/submissions/stats
 * Get contact submission statistics (Super Admin)
 */
router.get(
  "/submissions/stats",
  auth,
  requireRole("SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const [total, newCount, readCount, repliedCount, archivedCount] =
        await Promise.all([
          ContactSubmission.countDocuments(),
          ContactSubmission.countDocuments({ status: "new" }),
          ContactSubmission.countDocuments({ status: "read" }),
          ContactSubmission.countDocuments({ status: "replied" }),
          ContactSubmission.countDocuments({ status: "archived" }),
        ]);

      res.json({ total, new: newCount, read: readCount, replied: repliedCount, archived: archivedCount });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/contact/submissions/:id/status
 * Update submission status (Super Admin)
 * Body: { status: "read" | "replied" | "archived", notes: "..." }
 */
router.put(
  "/submissions/:id/status",
  auth,
  requireRole("SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const submission = await ContactSubmission.findById(req.params.id);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      if (req.body.status) submission.status = req.body.status;
      if (req.body.notes !== undefined) submission.notes = req.body.notes;
      if (req.body.status === "replied") {
        submission.repliedBy = req.coach.email;
        submission.repliedAt = new Date();
      }

      await submission.save();
      res.json({ message: "Submission updated", submission });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/contact/submissions/:id
 * Delete a contact submission (Super Admin)
 */
router.delete(
  "/submissions/:id",
  auth,
  requireRole("SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const result = await ContactSubmission.findByIdAndDelete(req.params.id);
      if (!result) {
        return res.status(404).json({ message: "Submission not found" });
      }
      res.json({ message: "Submission deleted" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

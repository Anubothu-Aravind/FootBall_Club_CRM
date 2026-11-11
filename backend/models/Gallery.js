const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * Gallery Model
 * Stores gallery images fetched from the backend, editable via superadmin dashboard.
 * No limit on number of images. Supports categories/albums and ordering.
 */

const GalleryImageSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: "" },
    alt: { type: String, default: "" },
    category: { type: String, default: "General" },
    tags: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    // Metadata
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    fileSize: { type: Number, default: 0 }, // in bytes
    mimeType: { type: String, default: "" },
    // Cloudinary-specific
    cloudinaryPublicId: { type: String, default: "" },
    // Upload info
    uploadedBy: { type: String, default: "" },
    uploadedByEmail: { type: String, default: "" },
  },
  { timestamps: true }
);

GalleryImageSchema.index({ category: 1, order: 1 });
GalleryImageSchema.index({ isActive: 1 });
GalleryImageSchema.index({ tags: 1 });

// ─── Static: Get all active images ───
GalleryImageSchema.statics.getActiveImages = function (category = null) {
  const query = { isActive: true };
  if (category) query.category = category;
  return this.find(query).sort({ order: 1, createdAt: -1 });
};

// ─── Static: Get unique categories ───
GalleryImageSchema.statics.getCategories = async function () {
  return this.distinct("category", { isActive: true });
};

// ─── Static: Reorder images ───
GalleryImageSchema.statics.reorderImages = async function (orderedIds) {
  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { id },
      update: { $set: { order: index } },
    },
  }));
  return this.bulkWrite(bulkOps);
};

module.exports = mongoose.model("GalleryImage", GalleryImageSchema);

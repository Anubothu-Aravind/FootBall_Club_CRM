const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * AboutJersey Model
 * Stores jersey catalog entries for the About page "Club Jerseys" section.
 * Supports a featured jersey + archive grid, with Cloudinary image uploads.
 */

const AboutJerseySchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true },
    season: { type: String, required: true },
    type: { type: String, required: true, default: "Home" },
    colorway: { type: String, required: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: "" },
    cloudinaryPublicId: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AboutJerseySchema.index({ isFeatured: 1 });
AboutJerseySchema.index({ order: 1, createdAt: -1 });
AboutJerseySchema.index({ isActive: 1 });

// ─── Get all active jerseys, featured first ───
AboutJerseySchema.statics.getActiveJerseys = function () {
  return this.find({ isActive: true })
    .sort({ isFeatured: -1, order: 1, createdAt: -1 })
    .lean();
};

// ─── Get the featured jersey ───
AboutJerseySchema.statics.getFeaturedJersey = function () {
  return this.findOne({ isFeatured: true, isActive: true }).lean();
};

// ─── Seed default jerseys on first run ───
AboutJerseySchema.statics.seedDefaults = async function () {
  const count = await this.countDocuments();
  if (count > 0) return;

  const defaults = [
    {
      season: "2025–26",
      type: "HOME JERSEY",
      colorway: "Red & White",
      description:
        "Our iconic stripes representing passion and purity in every match.",
      imageUrl:
        "https://res.cloudinary.com/doakquevf/image/upload/v1770738961/Tshirt_d11d9g.jpg",
      isFeatured: true,
      order: 0,
    },
    {
      season: "2024–25",
      type: "Home",
      colorway: "Red & Black",
      imageUrl:
        "https://images.unsplash.com/photo-1590273225427-f2644a9f3f7d?w=400&auto=format&fit=crop",
      order: 1,
    },
    {
      season: "2023–24",
      type: "Home",
      colorway: "Classic Red",
      imageUrl:
        "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&auto=format&fit=crop",
      order: 2,
    },
    {
      season: "2022–23",
      type: "Home",
      colorway: "Red & White",
      imageUrl:
        "https://images.unsplash.com/photo-1614632537239-d3d191a2e1c5?w=400&auto=format&fit=crop",
      order: 3,
    },
    {
      season: "2021–22",
      type: "Home",
      colorway: "Crimson",
      imageUrl:
        "https://images.unsplash.com/photo-1577212017184-80cc0da11082?w=400&auto=format&fit=crop",
      order: 4,
    },
    {
      season: "2020–21",
      type: "Home",
      colorway: "Deep Red",
      imageUrl:
        "https://images.unsplash.com/photo-1582142306909-195724d3f2b5?w=400&auto=format&fit=crop",
      order: 5,
    },
  ];

  await this.insertMany(defaults);
  console.log(`[AboutJersey] Seeded ${defaults.length} default jerseys`);
};

module.exports = mongoose.model("AboutJersey", AboutJerseySchema);

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * Calculate age group automatically based on age.
 * Groups: U-6, U-8, U-10, U-12, U-14, U-16, U-18, U-21, Senior
 * Users can still override this value manually.
 */
const calculateAgeGroup = (age) => {
  if (!age || age < 0) return "Unknown";
  if (age <= 6) return "U-6";
  if (age <= 8) return "U-8";
  if (age <= 10) return "U-10";
  if (age <= 12) return "U-12";
  if (age <= 14) return "U-14";
  if (age <= 16) return "U-16";
  if (age <= 18) return "U-18";
  if (age <= 21) return "U-21";
  return "Senior";
};

const PlayerSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    middle_name: {
      type: String,
      default: "",
    },
    last_name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    age_group: {
      type: String,
      required: true,
    },
    age_group_auto: {
      type: Boolean,
      default: true, // true = auto-calculated, false = manually set
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    jersey_no: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

PlayerSchema.index({ city: 1 });

/**
 * Pre-validate hook: auto-calculate age_group when age changes
 * and age_group_auto is true (or age_group is not explicitly provided).
 */
PlayerSchema.pre("validate", function (next) {
  // If age_group_auto is true or not explicitly set, compute from age
  if (this.isModified("age") && this.age_group_auto !== false) {
    this.age_group = calculateAgeGroup(this.age);
  }
  next();
});

/**
 * Virtual: full_name combining first, middle, and last name
 */
PlayerSchema.virtual("full_name").get(function () {
  return [this.first_name, this.middle_name, this.last_name]
    .filter((n) => n && n.trim())
    .join(" ");
});

PlayerSchema.set("toJSON", { virtuals: true });
PlayerSchema.set("toObject", { virtuals: true });

// Export the helper function for use in routes
module.exports = mongoose.model("Player", PlayerSchema);
module.exports.calculateAgeGroup = calculateAgeGroup;

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const TournamentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    age_group: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Upcoming",
      // Dynamic categories: Upcoming, Ongoing, Completed, Cancelled, + custom
      // Enum removed to allow custom categories managed via Category model
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tournament", TournamentSchema);

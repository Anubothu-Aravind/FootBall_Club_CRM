const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const TrainingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    age_group: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "Technical",
      // Dynamic categories: Technical, Tactical, Physical, Mental, Goalkeeper, Team Building, + custom
      // Enum removed to allow custom categories managed via Category model
    },
    status: {
      type: String,
      default: "Scheduled",
      // Dynamic categories: Scheduled, Ongoing, Completed, Cancelled, + custom
      // Enum removed to allow custom categories managed via Category model
    },
    session_date: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    coach_name: {
      type: String,
      required: false,
    },
    participants_count: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: false,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Training", TrainingSchema);

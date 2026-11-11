/**
 * Migration script: Remap old-format jerseyId values in JerseyLike collection
 * to stable AboutJersey UUIDs.
 *
 * Old formats: "current-2025-26", "2021–22", "2022–23", etc.
 * New format: stable UUID from AboutJersey.id
 *
 * Usage: node scripts/migrateLikes.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const AboutJersey = require("../models/AboutJersey");
  const JerseyLike = require("../models/JerseyLike");

  // Build season → UUID mapping from AboutJersey collection
  const allJerseys = await AboutJersey.find().lean();
  console.log(
    "Jerseys in DB:",
    allJerseys.map((j) => `${j.id} => ${j.season} (${j.colorway})`)
  );

  const seasonToUuid = {};
  allJerseys.forEach((j) => {
    const norm = j.season.replace(/[–—]/g, "-");
    seasonToUuid[j.season] = j.id; // exact e.g. "2025–26"
    seasonToUuid[norm] = j.id; // normalized e.g. "2025-26"
    seasonToUuid["current-" + norm] = j.id; // old featured e.g. "current-2025-26"
  });

  console.log("Season → UUID mapping:", JSON.stringify(seasonToUuid, null, 2));

  // Get all likes
  const allLikes = await JerseyLike.find().lean();
  console.log("Total like records:", allLikes.length);

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  let migrated = 0;
  let skipped = 0;
  let deleted = 0;
  let noMatch = [];

  for (const like of allLikes) {
    // Already a UUID — skip
    if (uuidPattern.test(like.jerseyId)) {
      skipped++;
      continue;
    }

    // Old-format jerseyId — try to map to UUID
    const targetUuid = seasonToUuid[like.jerseyId];
    if (!targetUuid) {
      console.log("  No mapping found for jerseyId:", like.jerseyId);
      noMatch.push(like.jerseyId);
      continue;
    }

    // Check if this user/session already has a like on the target jersey UUID
    const dupQuery = { jerseyId: targetUuid };
    if (like.userId) {
      dupQuery.userId = like.userId;
    } else if (like.sessionId) {
      dupQuery.sessionId = like.sessionId;
    }

    const existing = await JerseyLike.findOne(dupQuery);

    if (existing) {
      // Duplicate — delete the old-format record
      await JerseyLike.deleteOne({ _id: like._id });
      console.log(
        `  Deleted duplicate: ${like.jerseyId} (user/session already liked ${targetUuid})`
      );
      deleted++;
    } else {
      // Remap jerseyId to UUID
      await JerseyLike.updateOne(
        { _id: like._id },
        { $set: { jerseyId: targetUuid } }
      );
      console.log(`  Remapped: ${like.jerseyId} => ${targetUuid}`);
      migrated++;
    }
  }

  console.log("\n=== Migration Complete ===");
  console.log("Remapped:", migrated);
  console.log("Deleted duplicates:", deleted);
  console.log("Skipped (already UUID):", skipped);
  if (noMatch.length > 0) {
    console.log("No match found for:", [...new Set(noMatch)]);
  }

  await mongoose.disconnect();
}

migrate().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});

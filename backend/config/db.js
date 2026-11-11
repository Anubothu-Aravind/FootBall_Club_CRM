const mongoose = require("mongoose");

/**
 * Connect to MongoDB.
 * When AZURE_ENABLED=true and AZURE_COSMOS_URI is set, uses Azure Cosmos DB.
 * Otherwise uses standard MONGO_URI.
 */
const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    let options = {};

    // Azure Cosmos DB support (MongoDB-compatible API)
    if (process.env.AZURE_ENABLED === "true" && process.env.AZURE_COSMOS_URI) {
      uri = process.env.AZURE_COSMOS_URI;
      options = {
        retryWrites: false, // Cosmos DB limitation
        ssl: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };
      console.log("Connecting to Azure Cosmos DB (MongoDB API)...");
    }

    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

module.exports = connectDB;

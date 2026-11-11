/**
 * Azure Service
 * Preparations for Azure deployment. This module only activates when
 * AZURE_ENABLED=true is set in the environment.
 *
 * It provides:
 *   - Azure Cosmos DB connection (MongoDB-compatible API)
 *   - Azure Blob Storage for images (alternative to Cloudinary)
 *   - Azure Communication Services for email (alternative to Nodemailer SMTP)
 *   - Application Insights for monitoring
 *
 * Required ENV variables (only when AZURE_ENABLED=true):
 *   AZURE_COSMOS_URI         — Cosmos DB connection string (MongoDB API)
 *   AZURE_BLOB_CONNECTION    — Azure Blob Storage connection string
 *   AZURE_BLOB_CONTAINER     — Container name for images
 *   AZURE_EMAIL_CONNECTION   — Azure Communication Services connection string
 *   AZURE_EMAIL_SENDER       — Sender email address
 *   AZURE_APPINSIGHTS_KEY    — Application Insights instrumentation key (optional)
 *
 * This runs parallel to the current architecture:
 *   - If AZURE_ENABLED is false/not set: existing MongoDB + SMTP continue as-is
 *   - If AZURE_ENABLED is true: Azure services take over
 */

const isAzureEnabled = () => {
  return process.env.AZURE_ENABLED === "true";
};

// ═══════════════════════════════════════════════════════
// DATABASE: Azure Cosmos DB (MongoDB API)
// ═══════════════════════════════════════════════════════

/**
 * Get the MongoDB connection URI based on environment.
 * When Azure is enabled, uses Cosmos DB URI.
 * Otherwise, uses the standard MONGO_URI.
 */
const getDatabaseUri = () => {
  if (isAzureEnabled() && process.env.AZURE_COSMOS_URI) {
    console.log("Using Azure Cosmos DB (MongoDB API)");
    return process.env.AZURE_COSMOS_URI;
  }
  return process.env.MONGO_URI;
};

/**
 * Get Mongoose connection options optimized for Azure Cosmos DB.
 * Cosmos DB has certain limitations vs standard MongoDB.
 */
const getDatabaseOptions = () => {
  const baseOptions = {};

  if (isAzureEnabled() && process.env.AZURE_COSMOS_URI) {
    return {
      ...baseOptions,
      retryWrites: false, // Cosmos DB doesn't support retryWrites
      ssl: true,
      // Cosmos DB specific settings
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
  }

  return baseOptions;
};

// ═══════════════════════════════════════════════════════
// IMAGE STORAGE: Azure Blob Storage
// ═══════════════════════════════════════════════════════

let blobServiceClient = null;
let containerClient = null;

/**
 * Initialize Azure Blob Storage client.
 * Only runs when AZURE_ENABLED=true and AZURE_BLOB_CONNECTION is set.
 */
const initBlobStorage = async () => {
  if (!isAzureEnabled() || !process.env.AZURE_BLOB_CONNECTION) {
    return null;
  }

  try {
    const { BlobServiceClient: BlobServiceClientClass } = require("@azure/storage-blob");
    blobServiceClient = BlobServiceClientClass.fromConnectionString(
      process.env.AZURE_BLOB_CONNECTION
    );

    const containerName = process.env.AZURE_BLOB_CONTAINER || "images";
    containerClient = blobServiceClient.getContainerClient(containerName);

    // Create container if it doesn't exist
    await containerClient.createIfNotExists({ access: "blob" });

    console.log(`Azure Blob Storage initialized (container: ${containerName})`);
    return containerClient;
  } catch (err) {
    console.error("Failed to initialize Azure Blob Storage:", err.message);
    return null;
  }
};

/**
 * Upload an image to Azure Blob Storage.
 * @param {Buffer} buffer - Image buffer
 * @param {string} filename - Destination filename
 * @param {string} contentType - MIME type
 * @param {string} folder - Virtual folder path
 * @returns {Object} { url, blobName }
 */
const uploadToBlob = async (buffer, filename, contentType = "image/jpeg", folder = "") => {
  if (!containerClient) {
    await initBlobStorage();
  }
  if (!containerClient) {
    throw new Error("Azure Blob Storage is not configured");
  }

  const blobName = folder ? `${folder}/${filename}` : filename;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return {
    url: blockBlobClient.url,
    blobName,
  };
};

/**
 * Delete an image from Azure Blob Storage.
 * @param {string} blobName
 */
const deleteFromBlob = async (blobName) => {
  if (!containerClient) {
    await initBlobStorage();
  }
  if (!containerClient) return;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
};

// ═══════════════════════════════════════════════════════
// EMAIL: Azure Communication Services
// ═══════════════════════════════════════════════════════

let emailClient = null;

/**
 * Initialize Azure Communication Services email client.
 * Only activates when AZURE_ENABLED=true and AZURE_EMAIL_CONNECTION is set.
 */
const initEmailClient = () => {
  if (!isAzureEnabled() || !process.env.AZURE_EMAIL_CONNECTION) {
    return null;
  }

  try {
    const { EmailClient: EmailClientClass } = require("@azure/communication-email");
    emailClient = new EmailClientClass(process.env.AZURE_EMAIL_CONNECTION);
    console.log("Azure Communication Services email client initialized");
    return emailClient;
  } catch (err) {
    console.error("Failed to initialize Azure Email:", err.message);
    return null;
  }
};

/**
 * Send an email via Azure Communication Services.
 * Falls back to standard Nodemailer if Azure is not enabled.
 * @param {Object} options - { to, subject, html, attachments }
 * @returns {Object} Send result
 */
const sendAzureEmail = async (options) => {
  if (!emailClient) {
    initEmailClient();
  }
  if (!emailClient) {
    throw new Error("Azure Email is not configured");
  }

  const senderAddress = process.env.AZURE_EMAIL_SENDER || "noreply@anantapurfc.com";

  const message = {
    senderAddress,
    content: {
      subject: options.subject,
      html: options.html,
    },
    recipients: {
      to: Array.isArray(options.to)
        ? options.to.map((email) => ({ address: email }))
        : [{ address: options.to }],
    },
  };

  if (options.attachments?.length) {
    message.attachments = options.attachments.map((att) => ({
      name: att.filename,
      contentType: att.contentType || "application/octet-stream",
      contentInBase64: att.content.toString("base64"),
    }));
  }

  const poller = await emailClient.beginSend(message);
  const result = await poller.pollUntilDone();
  return result;
};

// ═══════════════════════════════════════════════════════
// MONITORING: Application Insights
// ═══════════════════════════════════════════════════════

let appInsightsClient = null;

/**
 * Initialize Azure Application Insights for monitoring.
 * Only activates when AZURE_ENABLED=true and AZURE_APPINSIGHTS_KEY is set.
 */
const initAppInsights = () => {
  if (!isAzureEnabled() || !process.env.AZURE_APPINSIGHTS_KEY) {
    return null;
  }

  try {
    const appInsights = require("applicationinsights");
    appInsights
      .setup(process.env.AZURE_APPINSIGHTS_KEY)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .start();

    appInsightsClient = appInsights.defaultClient;
    console.log("Azure Application Insights initialized");
    return appInsightsClient;
  } catch (err) {
    console.error("Failed to initialize Application Insights:", err.message);
    return null;
  }
};

/**
 * Track a custom event in Application Insights
 * @param {string} name - Event name
 * @param {Object} properties - Additional properties
 */
const trackEvent = (name, properties = {}) => {
  if (appInsightsClient) {
    appInsightsClient.trackEvent({ name, properties });
  }
};

/**
 * Track an exception in Application Insights
 * @param {Error} error
 */
const trackException = (error) => {
  if (appInsightsClient) {
    appInsightsClient.trackException({ exception: error });
  }
};

// ═══════════════════════════════════════════════════════
// UNIFIED IMAGE UPLOAD (Cloudinary or Azure Blob)
// ═══════════════════════════════════════════════════════

/**
 * Upload image to the configured storage provider.
 * When Azure is enabled, uses Azure Blob Storage.
 * Otherwise, uses Cloudinary (via cloudinaryService).
 *
 * @param {Buffer|string} source - Image data
 * @param {Object} options - Upload options (folder, filename, etc.)
 * @returns {Object} Upload result with url
 */
const uploadImageUnified = async (source, options = {}) => {
  if (isAzureEnabled() && process.env.AZURE_BLOB_CONNECTION) {
    // Azure Blob Storage
    const filename = options.filename || `img-${Date.now()}.jpg`;
    const folder = options.folder || "general";
    const buffer = Buffer.isBuffer(source) ? source : Buffer.from(source, "base64");
    const result = await uploadToBlob(buffer, filename, options.contentType || "image/jpeg", folder);
    return {
      url: result.url,
      publicId: result.blobName,
      isAzure: true,
      isCloudinary: false,
    };
  }

  // Fallback to Cloudinary
  const cloudinaryService = require("./cloudinaryService");
  return cloudinaryService.uploadImage(source, options);
};

/**
 * Delete image from the configured storage provider.
 * @param {string} publicIdOrBlobName
 */
const deleteImageUnified = async (publicIdOrBlobName) => {
  if (isAzureEnabled() && process.env.AZURE_BLOB_CONNECTION) {
    return deleteFromBlob(publicIdOrBlobName);
  }

  const cloudinaryService = require("./cloudinaryService");
  return cloudinaryService.deleteImage(publicIdOrBlobName);
};

// ═══════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════

/**
 * Initialize all Azure services. Call this at startup.
 * Only activates services when AZURE_ENABLED=true.
 */
const initializeAzureServices = async () => {
  if (!isAzureEnabled()) {
    console.log("Azure services disabled (AZURE_ENABLED != true). Using standard services.");
    return {
      database: false,
      blobStorage: false,
      email: false,
      monitoring: false,
    };
  }

  console.log("Initializing Azure services...");

  const results = {
    database: !!getDatabaseUri(),
    blobStorage: !!(await initBlobStorage()),
    email: !!initEmailClient(),
    monitoring: !!initAppInsights(),
  };

  console.log("Azure services initialization complete:", results);
  return results;
};

module.exports = {
  isAzureEnabled,
  getDatabaseUri,
  getDatabaseOptions,
  initBlobStorage,
  uploadToBlob,
  deleteFromBlob,
  initEmailClient,
  sendAzureEmail,
  initAppInsights,
  trackEvent,
  trackException,
  uploadImageUnified,
  deleteImageUnified,
  initializeAzureServices,
};

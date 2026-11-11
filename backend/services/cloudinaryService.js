/**
 * Cloudinary Service
 * Handles image uploads, deletion, and transformations via Cloudinary.
 * Supports single uploads, bulk uploads, and direct URL management.
 *
 * Required ENV variables:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *
 * When CLOUDINARY_CLOUD_NAME is not set, falls back to local/URL-based storage.
 */

let cloudinary = null;
let isCloudinaryConfigured = false;

const initCloudinary = () => {
  if (isCloudinaryConfigured) return cloudinary;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.log(
      "Cloudinary not configured — image uploads will use URL-based storage only."
    );
    return null;
  }

  try {
    const cloudinaryModule = require("cloudinary").v2;
    cloudinaryModule.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    cloudinary = cloudinaryModule;
    isCloudinaryConfigured = true;
    console.log("Cloudinary configured successfully");
    return cloudinary;
  } catch (err) {
    console.error("Failed to initialize Cloudinary:", err.message);
    return null;
  }
};

/**
 * Upload a single image buffer or base64 string to Cloudinary
 * @param {Buffer|string} source - Image buffer, base64 data URI, or remote URL
 * @param {Object} options
 * @param {string} options.folder - Cloudinary folder (e.g., "gallery", "hero", "about")
 * @param {string} options.publicId - Optional custom public ID
 * @param {Object} options.transformation - Optional transformation options
 * @param {string} options.aspectRatio - Optional aspect ratio (e.g., "16:9")
 * @returns {Object} { url, publicId, width, height, format, bytes }
 */
const uploadImage = async (source, options = {}) => {
  const client = initCloudinary();

  if (!client) {
    // Fallback: if source is a URL, just return it
    if (typeof source === "string" && source.startsWith("http")) {
      return {
        url: source,
        publicId: "",
        width: 0,
        height: 0,
        format: "",
        bytes: 0,
        thumbnailUrl: source,
        isCloudinary: false,
      };
    }
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  const uploadOptions = {
    folder: options.folder || "pocket-soccer-scout",
    resource_type: "image",
    overwrite: true,
    unique_filename: true,
  };

  if (options.publicId) {
    uploadOptions.public_id = options.publicId;
  }

  // Apply transformation if specified
  if (options.transformation) {
    uploadOptions.transformation = options.transformation;
  }

  // Apply aspect ratio cropping
  if (options.aspectRatio) {
    uploadOptions.transformation = [
      ...(uploadOptions.transformation || []),
      { aspect_ratio: options.aspectRatio, crop: "fill", gravity: "auto" },
    ];
  }

  // Generate eager transformations for thumbnails
  uploadOptions.eager = [
    { width: 400, height: 300, crop: "fill", gravity: "auto", quality: "auto" },
  ];

  let uploadSource = source;
  if (Buffer.isBuffer(source)) {
    // Convert buffer to base64 data URI
    uploadSource = `data:image/jpeg;base64,${source.toString("base64")}`;
  }

  const result = await client.uploader.upload(uploadSource, uploadOptions);

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    thumbnailUrl:
      result.eager && result.eager[0]
        ? result.eager[0].secure_url
        : result.secure_url,
    isCloudinary: true,
  };
};

/**
 * Upload multiple images in bulk
 * @param {Array<{source, options}>} images
 * @returns {Array<Object>} Array of upload results
 */
const uploadBulkImages = async (images) => {
  const results = [];
  const errors = [];

  for (let i = 0; i < images.length; i++) {
    try {
      const result = await uploadImage(images[i].source, images[i].options || {});
      results.push({ index: i, success: true, ...result });
    } catch (err) {
      errors.push({ index: i, success: false, error: err.message });
    }
  }

  return { results, errors, total: images.length, successful: results.length, failed: errors.length };
};

/**
 * Delete an image from Cloudinary by public ID
 * @param {string} publicId
 * @returns {Object} Deletion result
 */
const deleteImage = async (publicId) => {
  const client = initCloudinary();
  if (!client || !publicId) {
    return { result: "not_found" };
  }

  const result = await client.uploader.destroy(publicId);
  return result;
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array<string>} publicIds
 * @returns {Object} Deletion results
 */
const deleteBulkImages = async (publicIds) => {
  const client = initCloudinary();
  if (!client || !publicIds?.length) {
    return { deleted: {} };
  }

  const result = await client.api.delete_resources(publicIds);
  return result;
};

/**
 * Get a transformed URL for an existing Cloudinary image
 * @param {string} publicId
 * @param {Object} transformation
 * @returns {string} Transformed URL
 */
const getTransformedUrl = (publicId, transformation = {}) => {
  const client = initCloudinary();
  if (!client || !publicId) return "";

  return client.url(publicId, {
    secure: true,
    ...transformation,
  });
};

/**
 * Check if Cloudinary is properly configured
 * @returns {boolean}
 */
const isConfigured = () => {
  initCloudinary();
  return isCloudinaryConfigured;
};

/**
 * Get Cloudinary usage statistics
 * @returns {Object} Usage data or null
 */
const getUsageStats = async () => {
  const client = initCloudinary();
  if (!client) return null;

  try {
    const usage = await client.api.usage();
    return {
      plan: usage.plan,
      storageUsed: usage.storage?.usage || 0,
      storageLimit: usage.storage?.limit || 0,
      bandwidthUsed: usage.bandwidth?.usage || 0,
      bandwidthLimit: usage.bandwidth?.limit || 0,
      transformationsUsed: usage.transformations?.usage || 0,
      transformationsLimit: usage.transformations?.limit || 0,
    };
  } catch (err) {
    console.error("Failed to get Cloudinary usage:", err.message);
    return null;
  }
};

module.exports = {
  initCloudinary,
  uploadImage,
  uploadBulkImages,
  deleteImage,
  deleteBulkImages,
  getTransformedUrl,
  isConfigured,
  getUsageStats,
};

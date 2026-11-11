const crypto = require('crypto');

/**
 * OTP Service
 * Handles OTP generation, hashing, and verification for password change functionality
 */

/**
 * Generate a 6-character alphanumeric OTP
 * Excludes confusing characters (0, O, I, 1) for better user experience
 * @returns {string} - OTP code (e.g., "A3K9M2")
 */
const generateOTP = () => {
  const length = parseInt(process.env.OTP_LENGTH) || 6;
  // Exclude confusing characters: 0, O, I, 1, L
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    otp += characters[randomIndex];
  }
  
  return otp;
};

/**
 * Hash OTP for secure storage using SHA-256
 * @param {string} otp - Plain OTP code
 * @returns {string} - Hashed OTP (64 hex characters)
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify OTP matches stored hash using timing-safe comparison
 * @param {string} inputOTP - User-entered OTP
 * @param {string} storedHash - Stored hashed OTP
 * @returns {boolean} - Match status
 */
const verifyOTP = (inputOTP, storedHash) => {
  try {
    const inputHash = hashOTP(inputOTP.toUpperCase());
    
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(inputHash),
      Buffer.from(storedHash)
    );
  } catch (error) {
    // timingSafeEqual throws if buffers are different lengths
    return false;
  }
};

/**
 * Check if OTP has expired
 * @param {Date} expiresAt - Expiration timestamp
 * @returns {boolean} - Expired status
 */
const isOTPExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

/**
 * Calculate remaining time for OTP in minutes
 * @param {Date} expiresAt - Expiration timestamp
 * @returns {number} - Remaining minutes (rounded down)
 */
const getOTPRemainingMinutes = (expiresAt) => {
  const remaining = new Date(expiresAt) - new Date();
  return Math.max(0, Math.floor(remaining / 60000));
};

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP,
  isOTPExpired,
  getOTPRemainingMinutes,
};

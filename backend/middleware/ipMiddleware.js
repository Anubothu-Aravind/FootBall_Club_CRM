/**
 * IP Tracking Middleware
 * Extracts real client IP from various headers and proxy configurations
 */

const getClientIP = (req) => {
  // Check various headers for proxied requests
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2)
    // The first one is typically the original client
    const ips = forwarded.split(",").map((ip) => ip.trim());
    return ips[0];
  }

  // Check other common proxy headers
  const realIP = req.headers["x-real-ip"];
  if (realIP) return realIP;

  const cfConnectingIP = req.headers["cf-connecting-ip"]; // Cloudflare
  if (cfConnectingIP) return cfConnectingIP;

  const trueClientIP = req.headers["true-client-ip"]; // Akamai, Cloudflare Enterprise
  if (trueClientIP) return trueClientIP;

  // Fall back to direct connection IP
  return req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.ip || 
         "unknown";
};

const normalizeIP = (ip) => {
  if (!ip) return "unknown";
  
  // Handle IPv6 localhost
  if (ip === "::1" || ip === "::ffff:127.0.0.1") return "127.0.0.1";
  
  // Remove IPv6 prefix for IPv4 addresses
  if (ip.startsWith("::ffff:")) return ip.substring(7);
  
  return ip;
};

/**
 * Middleware to attach IP and request metadata to req object
 */
const ipMiddleware = (req, res, next) => {
  const rawIP = getClientIP(req);
  req.clientIP = normalizeIP(rawIP);
  req.clientUserAgent = req.headers["user-agent"] || "unknown";
  
  // Generate session ID from request if not present
  req.sessionId = req.headers["x-session-id"] || req.sessionID || "";
  
  next();
};

module.exports = ipMiddleware;
module.exports.getClientIP = getClientIP;
module.exports.normalizeIP = normalizeIP;

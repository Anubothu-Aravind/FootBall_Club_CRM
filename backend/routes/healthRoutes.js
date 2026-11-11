const express = require('express');
const router = express.Router();
const { pingDatabase, getDatabaseMetrics, checkHealth } = require('../services/dbService');
const auth = require('../middleware/authMiddleware');

// Middleware to check if user is Super Admin
const isSuperAdmin = (req, res, next) => {
  if (!req.coach || req.coach.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Access denied. Super Admin only." });
  }
  next();
};

/**
 * Public ping endpoint - keeps DB awake
 * GET /api/ping
 */
router.get('/ping', async (req, res) => {
  try {
    const result = await pingDatabase();
    
    res.status(result.success ? 200 : 500).json({
      message: result.success ? 'Database is awake and responsive' : 'Database ping failed',
      data: result,
    });
  } catch (error) {
    console.error('[PING] Error:', error);
    res.status(500).json({
      message: 'Ping failed',
      error: error.message,
    });
  }
});

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', async (req, res) => {
  try {
    const health = await checkHealth();
    
    res.status(health.success ? 200 : 503).json({
      message: health.message,
      data: health,
    });
  } catch (error) {
    console.error('[HEALTH] Error:', error);
    res.status(503).json({
      message: 'Health check failed',
      error: error.message,
    });
  }
});

/**
 * Database metrics endpoint (Super Admin only)
 * GET /api/db/metrics
 */
router.get('/db/metrics', auth, isSuperAdmin, async (req, res) => {
  try {
    const metrics = await getDatabaseMetrics();
    
    res.status(metrics.success ? 200 : 500).json({
      message: metrics.success ? 'Database metrics retrieved successfully' : 'Failed to retrieve metrics',
      data: metrics,
    });
  } catch (error) {
    console.error('[DB METRICS] Error:', error);
    res.status(500).json({
      message: 'Failed to retrieve database metrics',
      error: error.message,
    });
  }
});

module.exports = router;

const mongoose = require('mongoose');

/**
 * Database Service
 * Provides utilities for database health checks and metrics
 */

/**
 * Ping database to keep it awake (for free tier MongoDB Atlas)
 * @returns {Promise<Object>} Ping result
 */
const pingDatabase = async () => {
  try {
    const startTime = Date.now();
    
    // Simple ping using admin command
    await mongoose.connection.db.admin().ping();
    
    const responseTime = Date.now() - startTime;
    
    return {
      success: true,
      status: 'connected',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      database: mongoose.connection.db.databaseName,
    };
  } catch (error) {
    console.error('[DB PING] Error:', error);
    return {
      success: false,
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get database statistics and metrics
 * @returns {Promise<Object>} Database metrics
 */
const getDatabaseMetrics = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Get database stats
    const dbStats = await db.stats();
    
    // Get collection stats
    const collections = await db.listCollections().toArray();
    const collectionStats = await Promise.all(
      collections.map(async (col) => {
        try {
          const stats = await db.collection(col.name).stats();
          return {
            name: col.name,
            documents: stats.count || 0,
            size: formatBytes(stats.size || 0),
            storageSize: formatBytes(stats.storageSize || 0),
            indexes: stats.nindexes || 0,
            avgDocSize: formatBytes(stats.avgObjSize || 0),
          };
        } catch (err) {
          return {
            name: col.name,
            error: 'Unable to fetch stats',
          };
        }
      })
    );

    // Connection info
    const connectionInfo = {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.db.databaseName,
      readyState: getReadyState(mongoose.connection.readyState),
    };

    return {
      success: true,
      timestamp: new Date().toISOString(),
      connection: connectionInfo,
      database: {
        name: dbStats.db,
        collections: dbStats.collections,
        dataSize: formatBytes(dbStats.dataSize),
        storageSize: formatBytes(dbStats.storageSize),
        indexSize: formatBytes(dbStats.indexSize),
        totalSize: formatBytes(dbStats.dataSize + dbStats.indexSize),
        avgObjSize: formatBytes(dbStats.avgObjSize),
      },
      collections: collectionStats,
      limits: {
        freetier: '512 MB',
        currentUsage: formatBytes(dbStats.storageSize),
        percentageUsed: ((dbStats.storageSize / (512 * 1024 * 1024)) * 100).toFixed(2) + '%',
      },
    };
  } catch (error) {
    console.error('[DB METRICS] Error:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Format bytes to human-readable format
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted string
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get connection ready state as string
 * @param {number} state - Mongoose connection state
 * @returns {string} State description
 */
const getReadyState = (state) => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[state] || 'unknown';
};

/**
 * Check database health
 * @returns {Promise<Object>} Health check result
 */
const checkHealth = async () => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      return {
        success: false,
        status: 'unhealthy',
        message: 'Database not connected',
        readyState: getReadyState(mongoose.connection.readyState),
      };
    }

    const pingResult = await pingDatabase();
    
    return {
      success: true,
      status: 'healthy',
      message: 'Database is connected and responsive',
      ...pingResult,
    };
  } catch (error) {
    return {
      success: false,
      status: 'unhealthy',
      error: error.message,
    };
  }
};

module.exports = {
  pingDatabase,
  getDatabaseMetrics,
  checkHealth,
};

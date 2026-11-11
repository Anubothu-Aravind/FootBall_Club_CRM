const AuditLog = require("../models/AuditLog");
const { sendCriticalAlert } = require("./criticalAlertService");

/**
 * Audit Service
 * Provides centralized logging and querying of audit events
 */
class AuditService {
  /**
   * Log an action to the audit trail
   * @param {Object} params - Audit log parameters
   * @returns {Promise<Object>} Created audit log entry
   */
  static async logAction({
    action,
    entityType,
    entityId = null,
    entityName = "",
    previousData = null,
    newData = null,
    changedFields = [],
    actorId = null,
    actorEmail = null,
    actorRole = "SYSTEM",
    ipAddress = "",
    userAgent = "",
    sessionId = "",
    description,
    metadata = {},
  }) {
    try {
      // Auto-determine category and severity if not provided
      const category = AuditLog.getCategoryFromAction(action);
      const severity = AuditLog.getSeverityFromAction(action);

      const auditLog = new AuditLog({
        action,
        category,
        severity,
        entityType,
        entityId,
        entityName,
        previousData: this.sanitizeData(previousData),
        newData: this.sanitizeData(newData),
        changedFields,
        actorId,
        actorEmail,
        actorRole,
        ipAddress,
        userAgent,
        sessionId,
        description,
        metadata,
      });

      await auditLog.save();

      // Send critical alert email (non-blocking)
      sendCriticalAlert(auditLog.toObject()).catch(err => {
        console.error("Critical alert email failed (non-blocking):", err.message);
      });

      return auditLog;
    } catch (error) {
      // Log to console but don't throw - auditing shouldn't break the main flow
      console.error("Failed to create audit log:", error);
      return null;
    }
  }

  /**
   * Sanitize data to remove sensitive fields before storing
   * @param {Object} data - Data to sanitize
   * @returns {Object} Sanitized data
   */
  static sanitizeData(data) {
    if (!data) return null;
    
    const sensitiveFields = [
      "password", "passwordHash", "resetPasswordToken",
      "passwordChangeOTP", "newPasswordHash", "token",
      "resetPasswordExpires", "resetPasswordUsed"
    ];
    
    const sanitized = { ...data };
    sensitiveFields.forEach(field => {
      if (sanitized[field] !== undefined) {
        sanitized[field] = "[REDACTED]";
      }
    });
    
    return sanitized;
  }

  /**
   * Get changed fields between two objects
   * @param {Object} previous - Previous state
   * @param {Object} current - Current state
   * @returns {Array} Array of changed field names
   */
  static getChangedFields(previous, current) {
    if (!previous || !current) return [];
    
    const changedFields = [];
    const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);
    
    allKeys.forEach(key => {
      // Skip internal fields
      if (key.startsWith("_") || key === "updatedAt") return;
      
      const prevValue = JSON.stringify(previous[key]);
      const currValue = JSON.stringify(current[key]);
      
      if (prevValue !== currValue) {
        changedFields.push(key);
      }
    });
    
    return changedFields;
  }

  /**
   * Generate human-readable description of changes
   * @param {string} action - Action type
   * @param {string} entityType - Entity type
   * @param {string} entityName - Entity name
   * @param {Array} changedFields - Changed fields
   * @param {Object} previousData - Previous data
   * @param {Object} newData - New data
   * @returns {string} Human-readable description
   */
  static generateDescription(action, entityType, entityName, changedFields = [], previousData = null, newData = null) {
    const entity = entityType.toLowerCase();
    const name = entityName || "unknown";
    
    switch (action) {
      case AuditLog.ACTIONS.CREATE:
        return `Created ${entity}: ${name}`;
      
      case AuditLog.ACTIONS.UPDATE:
        if (changedFields.length > 0) {
          const changes = changedFields.slice(0, 3).map(field => {
            const prev = previousData?.[field];
            const curr = newData?.[field];
            return `${field} (${prev}→${curr})`;
          }).join(", ");
          const more = changedFields.length > 3 ? ` and ${changedFields.length - 3} more` : "";
          return `Updated ${entity} ${name}: ${changes}${more}`;
        }
        return `Updated ${entity}: ${name}`;
      
      case AuditLog.ACTIONS.DELETE:
        return `Deleted ${entity}: ${name}`;
      
      case AuditLog.ACTIONS.RESTORE:
        return `Restored ${entity}: ${name}`;
      
      case AuditLog.ACTIONS.LOGIN_SUCCESS:
        return `User ${name} logged in successfully`;
      
      case AuditLog.ACTIONS.LOGIN_FAILED:
        return `Failed login attempt for ${name}`;
      
      case AuditLog.ACTIONS.LOGOUT:
        return `User ${name} logged out`;
      
      case AuditLog.ACTIONS.PASSWORD_CHANGE_SUCCESS:
        return `Password changed for ${name}`;
      
      case AuditLog.ACTIONS.PASSWORD_RESET_SUCCESS:
        return `Password reset completed for ${name}`;
      
      case AuditLog.ACTIONS.ADMIN_PROMOTE:
        return `Promoted ${name} to Super Admin`;
      
      case AuditLog.ACTIONS.ADMIN_DEMOTE:
        return `Demoted ${name} to Admin`;
      
      case AuditLog.ACTIONS.ADMIN_PASSWORD_RESET:
        return `Password reset by admin for ${name}`;
      
      default:
        return `${action} on ${entity}: ${name}`;
    }
  }

  /**
   * Get paginated audit logs with filters
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Paginated results
   */
  static async getAuditLogs(filters = {}, pagination = {}) {
    const {
      action,
      category,
      severity,
      entityType,
      entityId,
      actorId,
      actorEmail,
      startDate,
      endDate,
      search,
    } = filters;

    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;

    const query = {};

    if (action) query.action = action;
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    if (actorId) query.actorId = actorId;
    if (actorEmail) query.actorEmail = new RegExp(actorEmail, "i");

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { description: new RegExp(search, "i") },
        { entityName: new RegExp(search, "i") },
        { actorEmail: new RegExp(search, "i") },
      ];
    }

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort(sort).skip(skip).limit(limit),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  /**
   * Get audit logs for a specific entity
   * @param {string} entityType - Entity type
   * @param {string} entityId - Entity ID
   * @returns {Promise<Array>} Audit logs for the entity
   */
  static async getEntityHistory(entityType, entityId) {
    return AuditLog.find({ entityType, entityId })
      .sort({ createdAt: -1 })
      .limit(100);
  }

  /**
   * Get audit logs for a specific actor
   * @param {string} actorId - Actor ID
   * @param {Object} dateRange - Optional date range
   * @returns {Promise<Array>} Audit logs for the actor
   */
  static async getActorActivity(actorId, dateRange = {}) {
    const query = { actorId };
    
    if (dateRange.startDate || dateRange.endDate) {
      query.createdAt = {};
      if (dateRange.startDate) query.createdAt.$gte = new Date(dateRange.startDate);
      if (dateRange.endDate) query.createdAt.$lte = new Date(dateRange.endDate);
    }

    return AuditLog.find(query).sort({ createdAt: -1 }).limit(100);
  }

  /**
   * Get audit statistics
   * @param {Object} dateRange - Date range for statistics
   * @returns {Promise<Object>} Audit statistics
   */
  static async getStats(dateRange = {}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today's stats
    const todayStats = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: today, $lte: todayEnd } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byCategory: {
            $push: "$category"
          },
          bySeverity: {
            $push: "$severity"
          }
        }
      }
    ]);

    // Last 7 days trend with severity breakdown
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const trendData = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            severity: "$severity"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    // Top actors
    const topActors = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: "$actorEmail", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Process category and severity counts
    const categoryCount = {};
    const severityCount = {};
    
    if (todayStats.length > 0) {
      todayStats[0].byCategory.forEach(cat => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      todayStats[0].bySeverity.forEach(sev => {
        severityCount[sev] = (severityCount[sev] || 0) + 1;
      });
    }

    // Generate last 7 days labels
    const labels = [];
    const dateMap = new Map();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(label);
      dateMap.set(dateStr, i);
    }

    // Initialize data arrays for each severity
    const criticalData = new Array(7).fill(0);
    const warningData = new Array(7).fill(0);
    const infoData = new Array(7).fill(0);

    // Fill data from aggregation
    trendData.forEach(item => {
      const dateIndex = dateMap.get(item._id.date);
      if (dateIndex !== undefined) {
        const count = item.count;
        switch (item._id.severity) {
          case 'CRITICAL':
            criticalData[dateIndex] = count;
            break;
          case 'WARNING':
            warningData[dateIndex] = count;
            break;
          case 'INFO':
            infoData[dateIndex] = count;
            break;
        }
      }
    });

    return {
      today: {
        total: todayStats[0]?.total || 0,
        byCategory: categoryCount,
        bySeverity: severityCount,
      },
      trends: {
        labels: labels,
        critical: criticalData,
        warning: warningData,
        info: infoData,
      },
      topActors: topActors.map(a => ({
        email: a._id || "System",
        actions: a.count,
      })),
    };
  }

  /**
   * Export audit logs
   * @param {string} format - Export format (json/csv)
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Export data
   */
  static async exportLogs(format, filters = {}) {
    const { logs } = await this.getAuditLogs(filters, { limit: 10000 });
    
    if (format === "csv") {
      const headers = [
        "Date", "Action", "Category", "Severity", "Entity Type",
        "Entity Name", "Actor Email", "IP Address", "Description"
      ];
      
      const rows = logs.map(log => [
        log.createdAt.toISOString(),
        log.action,
        log.category,
        log.severity,
        log.entityType,
        log.entityName,
        log.actorEmail || "",
        log.ipAddress || "",
        log.description
      ]);
      
      const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
      return { format: "csv", data: csv, filename: `audit-logs-${Date.now()}.csv` };
    }
    
    return { format: "json", data: logs, filename: `audit-logs-${Date.now()}.json` };
  }
}

module.exports = AuditService;

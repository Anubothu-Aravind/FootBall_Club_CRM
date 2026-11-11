const cron = require("node-cron");
const Admin = require("../models/Admin");
const AuditLog = require("../models/AuditLog");
const AuditService = require("./auditService");
const { generateAuditLogPDF, deleteLogsOlderThan, getLogsOlderThan } = require("./reportService");
const { sendAuditReportEmail } = require("./emailService");
const { generatePieChartImage } = require("./chartService");
const { pingDatabase } = require("./dbService");

/**
 * Scheduler Service
 * Handles automated tasks like 30-day audit log cleanup
 */

// Configuration
const RETENTION_DAYS = 30; // Keep logs for 30 days
const SCHEDULE_TIME = "0 2 * * *"; // Run daily at 2:00 AM

/**
 * Send 30-day report and cleanup old logs
 * @param {boolean} testMode - If true, sends email but doesn't delete logs
 * @returns {Promise<Object>} Result of the operation
 */
const performScheduledCleanup = async (testMode = false) => {
  try {
    console.log(`[SCHEDULER] Starting ${testMode ? 'TEST' : 'SCHEDULED'} audit log cleanup...`);
    
    // Get all super admins
    const superAdmins = await Admin.find({ role: "SUPER_ADMIN" });
    
    if (superAdmins.length === 0) {
      console.warn("[SCHEDULER] No super admins found. Skipping email notification.");
      return {
        success: false,
        message: "No active super admins to notify",
      };
    }

    const superAdminEmails = superAdmins.map(admin => admin.email);
    console.log(`[SCHEDULER] Found ${superAdmins.length} super admin(s): ${superAdminEmails.join(', ')}`);

    // Get logs older than retention period
    const oldLogs = await getLogsOlderThan(RETENTION_DAYS);
    
    if (oldLogs.length === 0) {
      console.log("[SCHEDULER] No logs older than 30 days found.");
      return {
        success: true,
        message: "No logs to cleanup",
        logsFound: 0,
      };
    }

    console.log(`[SCHEDULER] Found ${oldLogs.length} logs older than ${RETENTION_DAYS} days`);

    // Calculate date range for the old logs
    const oldestLog = oldLogs[oldLogs.length - 1];
    const newestLog = oldLogs[0];
    const startDate = new Date(oldestLog.createdAt);
    const endDate = new Date(newestLog.createdAt);

    // Generate PDF report
    console.log("[SCHEDULER] Generating PDF report...");
    const pdfBuffer = await generateAuditLogPDF(startDate, endDate);

    // Calculate statistics
    const stats = {
      totalLogs: oldLogs.length,
      criticalCount: oldLogs.filter(l => l.severity === "CRITICAL").length,
      warningCount: oldLogs.filter(l => l.severity === "WARNING").length,
      infoCount: oldLogs.filter(l => l.severity === "INFO").length,
      startDate,
      endDate,
    };

    // Generate pie chart image
    console.log("[SCHEDULER] Generating pie chart...");
    const chartImage = await generatePieChartImage(
      stats.criticalCount,
      stats.warningCount,
      stats.infoCount
    );

    // Send report to all super admins
    console.log("[SCHEDULER] Sending report emails...");
    await sendAuditReportEmail(
      superAdminEmails,
      pdfBuffer,
      `Last ${RETENTION_DAYS} Days (Auto-Cleanup)`,
      stats,
      chartImage
    );

    console.log(`[SCHEDULER] Report emails sent successfully to ${superAdmins.length} super admin(s)`);

    let deletionResult = { deletedCount: 0 };
    
    // Delete old logs (unless in test mode)
    if (!testMode) {
      console.log("[SCHEDULER] Deleting old logs...");
      deletionResult = await deleteLogsOlderThan(RETENTION_DAYS);
      console.log(`[SCHEDULER] Deleted ${deletionResult.deletedCount} log(s)`);

      // Log the cleanup action
      await AuditService.logAction({
        action: AuditLog.ACTIONS.BULK_OPERATION,
        category: AuditLog.CATEGORIES.SYSTEM,
        severity: AuditLog.SEVERITIES.INFO,
        entityType: AuditLog.ENTITY_TYPES.SYSTEM,
        entityId: "audit-cleanup",
        entityName: "Audit Log Cleanup",
        actorId: "system",
        actorEmail: "system@anantapurfc.com",
        actorRole: "SYSTEM",
        ipAddress: "127.0.0.1",
        userAgent: "Scheduler Service",
        description: `Automated 30-day cleanup: ${deletionResult.deletedCount} logs deleted, report sent to ${superAdmins.length} super admin(s)`,
      });
    } else {
      console.log("[SCHEDULER] TEST MODE: Skipping log deletion");
    }

    return {
      success: true,
      message: testMode 
        ? `Test mode: Report sent to ${superAdmins.length} super admin(s). No logs deleted.`
        : `Cleanup complete: ${deletionResult.deletedCount} logs deleted, report sent to ${superAdmins.length} super admin(s)`,
      logsFound: oldLogs.length,
      logsDeleted: deletionResult.deletedCount,
      emailsSent: superAdmins.length,
      recipients: superAdminEmails,
      testMode,
    };

  } catch (error) {
    console.error("[SCHEDULER] Error during cleanup:", error);
    
    // Log the error
    try {
      await AuditService.logAction({
        action: AuditLog.ACTIONS.BULK_OPERATION,
        category: AuditLog.CATEGORIES.SYSTEM,
        severity: AuditLog.SEVERITIES.CRITICAL,
        entityType: AuditLog.ENTITY_TYPES.SYSTEM,
        entityId: "audit-cleanup",
        entityName: "Audit Log Cleanup Failed",
        actorId: "system",
        actorEmail: "system@anantapurfc.com",
        actorRole: "SYSTEM",
        ipAddress: "127.0.0.1",
        userAgent: "Scheduler Service",
        description: `Automated cleanup failed: ${error.message}`,
      });
    } catch (logError) {
      console.error("[SCHEDULER] Failed to log error:", logError);
    }

    throw error;
  }
};

/**
 * Generate and send report for custom date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {boolean} testMode - If true, sends email only (no deletion)
 * @returns {Promise<Object>} Result of the operation
 */
const generateCustomReport = async (startDate, endDate, testMode = true) => {
  try {
    console.log(`[REPORT] Generating custom report from ${startDate} to ${endDate}...`);
    
    // Get all super admins
    const superAdmins = await Admin.find({ role: "SUPER_ADMIN" });
    
    if (superAdmins.length === 0) {
      throw new Error("No active super admins found");
    }

    const superAdminEmails = superAdmins.map(admin => admin.email);

    // Generate PDF report
    const pdfBuffer = await generateAuditLogPDF(startDate, endDate);

    // Get logs for statistics
    const { getLogsByDateRange } = require("./reportService");
    const logs = await getLogsByDateRange(startDate, endDate);

    const stats = {
      totalLogs: logs.length,
      criticalCount: logs.filter(l => l.severity === "CRITICAL").length,
      warningCount: logs.filter(l => l.severity === "WARNING").length,
      infoCount: logs.filter(l => l.severity === "INFO").length,
      startDate,
      endDate,
    };

    // Generate pie chart image
    const chartImage = await generatePieChartImage(
      stats.criticalCount,
      stats.warningCount,
      stats.infoCount
    );

    // Send report
    await sendAuditReportEmail(
      superAdminEmails,
      pdfBuffer,
      `Custom Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      stats,
      chartImage
    );

    // Log the report generation
    await AuditService.logAction({
      action: AuditLog.ACTIONS.DATA_EXPORT,
      category: AuditLog.CATEGORIES.SYSTEM,
      severity: AuditLog.SEVERITIES.INFO,
      entityType: AuditLog.ENTITY_TYPES.SYSTEM,
      entityId: "custom-report",
      entityName: "Custom Audit Report",
      actorId: "user",
      actorEmail: superAdminEmails[0] || "system@anantapurfc.com",
      actorRole: "SUPER_ADMIN",
      ipAddress: "127.0.0.1",
      userAgent: "Manual Report",
      description: `Custom report generated: ${logs.length} logs from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}, sent to ${superAdmins.length} super admin(s)`,
    });

    return {
      success: true,
      message: `Report sent to ${superAdmins.length} super admin(s)`,
      logsIncluded: logs.length,
      emailsSent: superAdmins.length,
      recipients: superAdminEmails,
      stats,
    };

  } catch (error) {
    console.error("[REPORT] Error generating custom report:", error);
    throw error;
  }
};

/**
 * Generate and send current month report
 * @returns {Promise<Object>} Result of the operation
 */
const generateCurrentMonthReport = async () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // Last day of current month
  
  return await generateCustomReport(startDate, endDate, true);
};

/**
 * Initialize the scheduler
 * Runs daily at 2:00 AM to check for logs older than 30 days
 * Pings DB 3 times daily to keep free tier awake
 */
const initializeScheduler = () => {
  console.log(`[SCHEDULER] Initializing audit log cleanup scheduler...`);
  console.log(`[SCHEDULER] Schedule: ${SCHEDULE_TIME} (Daily at 2:00 AM)`);
  console.log(`[SCHEDULER] Retention period: ${RETENTION_DAYS} days`);

  // Schedule the cleanup task
  cron.schedule(SCHEDULE_TIME, async () => {
    console.log("[SCHEDULER] Running scheduled audit log cleanup...");
    try {
      const result = await performScheduledCleanup(false);
      console.log("[SCHEDULER] Cleanup completed:", result);
    } catch (error) {
      console.error("[SCHEDULER] Scheduled cleanup failed:", error);
    }
  });

  // Schedule DB pings 3 times a day (8:00 AM, 2:00 PM, 8:00 PM)
  // Keeps MongoDB free tier awake
  cron.schedule("0 8,14,20 * * *", async () => {
    console.log("[DB PING] Sending keepalive ping to database...");
    try {
      const result = await pingDatabase();
      console.log(`[DB PING] Success - Response time: ${result.responseTime}`);
    } catch (error) {
      console.error("[DB PING] Failed:", error);
    }
  });

  console.log("[SCHEDULER] Scheduler initialized successfully");
  console.log("[SCHEDULER] DB keepalive pings: 3x daily (8:00 AM, 2:00 PM, 8:00 PM)");
};

module.exports = {
  initializeScheduler,
  performScheduledCleanup,
  generateCustomReport,
  generateCurrentMonthReport,
  RETENTION_DAYS,
};

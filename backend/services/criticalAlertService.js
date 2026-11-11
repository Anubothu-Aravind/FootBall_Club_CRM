const nodemailer = require("nodemailer");
const Admin = require("../models/Admin");

/**
 * Critical Alert Service
 * Sends email notifications for critical system actions
 */

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Actions that trigger critical alerts
 */
const CRITICAL_ACTIONS = [
  "DELETE",
  "ADMIN_DEMOTE",
  "ADMIN_PROMOTE",
  "ADMIN_PASSWORD_RESET",
  "DATA_EXPORT",
  "PASSWORD_CHANGE_SUCCESS",
  "PASSWORD_RESET_SUCCESS",
];

/**
 * Check if an action should trigger a critical alert
 * @param {string} action - The action type
 * @param {string} severity - The severity level
 * @returns {boolean}
 */
const shouldAlert = (action, severity) => {
  if (severity === "CRITICAL") return true;
  if (CRITICAL_ACTIONS.includes(action)) return true;
  return false;
};

/**
 * Get all Super Admin emails for notifications
 * @returns {Promise<string[]>} Array of Super Admin email addresses
 */
const getSuperAdminEmails = async () => {
  try {
    const superAdmins = await Admin.find({ role: "SUPER_ADMIN" }).select("email");
    return superAdmins.map(admin => admin.email);
  } catch (error) {
    console.error("Failed to fetch Super Admin emails:", error);
    return [];
  }
};

/**
 * Generate alert email HTML content
 * @param {Object} auditLog - The audit log entry
 * @returns {string} HTML content
 */
const generateAlertHTML = (auditLog) => {
  const severityColors = {
    CRITICAL: "#DC2626",
    WARNING: "#F59E0B",
    INFO: "#3B82F6",
    DEBUG: "#6B7280",
  };

  const severityLabels = {
    CRITICAL: "Critical",
    WARNING: "Warning",
    INFO: "Information",
    DEBUG: "Debug",
  };

  const color = severityColors[auditLog.severity] || "#6B7280";
  const label = severityLabels[auditLog.severity] || "Alert";
  const timestamp = new Date(auditLog.createdAt || Date.now()).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  });
  const year = new Date().getFullYear();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>Security Alert - Anantapur FC</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F1F5F9; -webkit-font-smoothing: antialiased;">

  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #F1F5F9;">
    [${label}] ${auditLog.action}: ${auditLog.description || auditLog.entityName || "System alert"} - Review required
  </div>

  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F1F5F9" role="presentation">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table style="max-width: 560px; width: 100%;" width="560" border="0" cellspacing="0" cellpadding="0" role="presentation">

          <!-- Severity color bar -->
          <tr>
            <td style="height: 4px; background-color: ${color}; border-radius: 8px 8px 0 0; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- White card -->
          <tr>
            <td style="background-color: #FFFFFF; border-left: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0;">

              <!-- Brand + Badge row -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td style="padding: 28px 40px 16px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td style="vertical-align: middle;">
                          <table border="0" cellspacing="0" cellpadding="0" role="presentation">
                            <tr>
                              <td style="width: 36px; height: 36px; background-color: #DC2626; border-radius: 50%; text-align: center; vertical-align: middle;">
                                <span style="color: #FFFFFF; font-size: 16px; font-weight: 800; line-height: 36px; font-family: Georgia, serif;">A</span>
                              </td>
                              <td style="padding-left: 12px; vertical-align: middle;">
                                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #0F172A;">Anantapur FC</p>
                                <p style="margin: 0; font-size: 10px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">Security Alert</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td style="text-align: right; vertical-align: middle;">
                          <span style="background-color: ${color}; color: #FFFFFF; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${label}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <tr><td style="padding: 0 40px;"><div style="height: 1px; background-color: #F1F5F9;"></div></td></tr>

              <!-- Alert description -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td style="padding: 20px 40px 0;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background-color: #FEF2F2; border-radius: 8px; border-left: 3px solid ${color};">
                      <tr>
                        <td style="padding: 14px 16px;">
                          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0F172A; line-height: 1.5;">
                            ${auditLog.description || "A critical action was performed on the system."}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Details table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td style="padding: 20px 40px 0;">
                    <p style="margin: 0 0 12px; font-size: 12px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">Event Details</p>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
                      <tr style="background-color: #F8FAFC;">
                        <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #475569; width: 35%; border-bottom: 1px solid #E2E8F0;">Action</td>
                        <td style="padding: 10px 14px; font-size: 13px; color: #0F172A; border-bottom: 1px solid #E2E8F0; font-weight: 600;">${auditLog.action || "N/A"}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #F1F5F9;">Entity Type</td>
                        <td style="padding: 10px 14px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1F5F9;">${auditLog.entityType || "N/A"}</td>
                      </tr>
                      <tr style="background-color: #F8FAFC;">
                        <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #E2E8F0;">Entity</td>
                        <td style="padding: 10px 14px; font-size: 13px; color: #334155; border-bottom: 1px solid #E2E8F0;">${auditLog.entityName || "N/A"}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #F1F5F9;">Performed By</td>
                        <td style="padding: 10px 14px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1F5F9;">${auditLog.actorEmail || "System"}</td>
                      </tr>
                      <tr style="background-color: #F8FAFC;">
                        <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #E2E8F0;">Role</td>
                        <td style="padding: 10px 14px; font-size: 13px; color: #334155; border-bottom: 1px solid #E2E8F0;">${auditLog.actorRole || "N/A"}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #F1F5F9;">IP Address</td>
                        <td style="padding: 10px 14px; font-size: 13px; color: #334155; border-bottom: 1px solid #F1F5F9;">${auditLog.ipAddress || "Unknown"}</td>
                      </tr>
                      <tr style="background-color: #F8FAFC;">
                        <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #475569;">Timestamp</td>
                        <td style="padding: 10px 14px; font-size: 13px; color: #334155;">${timestamp}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${auditLog.changedFields && auditLog.changedFields.length > 0 ? `
              <!-- Changed fields -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td style="padding: 16px 40px 0;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background-color: #F8FAFC; border-radius: 8px;">
                      <tr>
                        <td style="padding: 12px 16px;">
                          <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px;">Modified Fields</p>
                          <p style="margin: 0; font-size: 13px; color: #334155;">${auditLog.changedFields.join(", ")}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : ""}

              <!-- Review CTA -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td style="padding: 24px 40px 0; text-align: center;">
                    <table border="0" cellspacing="0" cellpadding="0" role="presentation" align="center">
                      <tr>
                        <td style="border-radius: 8px; background-color: #0F172A;">
                          <a href="${frontendUrl}/audit-logs" target="_blank" style="display: inline-block; padding: 12px 32px; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Review in Audit Logs</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 10px 0 0; font-size: 12px; color: #94A3B8;">Please verify this action was authorized</p>
                  </td>
                </tr>
              </table>

              <!-- Spacer -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tr><td style="height: 28px;"></td></tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0F172A; padding: 24px 40px; border-radius: 0 0 8px 8px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #E2E8F0;">Anantapur Football Club</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #64748B;">Anantapur, Andhra Pradesh, India</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 14px; text-align: center;">
                    <div style="height: 1px; background-color: #1E293B;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 14px; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #475569;">
                      Automated security alert from Anantapur FC Coach Portal. Do not reply.
                    </p>
                    <p style="margin: 6px 0 0; font-size: 11px; color: #334155;">
                      &copy; ${year} Anantapur FC. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Send critical alert email to all Super Admins
 * @param {Object} auditLog - The audit log entry to alert about
 * @returns {Promise<boolean>} Success status
 */
const sendCriticalAlert = async (auditLog) => {
  try {
    // Check if alerting is enabled
    if (process.env.CRITICAL_ALERTS_ENABLED !== "true") {
      console.log("Critical alerts disabled (set CRITICAL_ALERTS_ENABLED=true to enable)");
      return false;
    }

    // Check if this action warrants an alert
    if (!shouldAlert(auditLog.action, auditLog.severity)) {
      return false;
    }

    const recipients = await getSuperAdminEmails();
    if (recipients.length === 0) {
      console.warn("No Super Admin emails found for critical alert");
      return false;
    }

    // Send to ALL Super Admins (including the actor — they need the email record too)
    const filteredRecipients = recipients;

    const transporter = createTransporter();
    const htmlContent = generateAlertHTML(auditLog);

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Anantapur FC Alerts" <${process.env.EMAIL_USER}>`,
      to: filteredRecipients.join(", "),
      subject: `[${auditLog.severity}] ${auditLog.action}: ${auditLog.description || auditLog.entityName || "System Alert"}`,
      html: htmlContent,
      text: `Critical Alert: ${auditLog.description}\n\nAction: ${auditLog.action}\nEntity: ${auditLog.entityType} - ${auditLog.entityName}\nPerformed by: ${auditLog.actorEmail}\nIP: ${auditLog.ipAddress}\nTime: ${new Date().toISOString()}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Critical alert sent to ${filteredRecipients.length} Super Admin(s): ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("Failed to send critical alert email:", error.message);
    return false;
  }
};

module.exports = {
  sendCriticalAlert,
  shouldAlert,
  getSuperAdminEmails,
  CRITICAL_ACTIONS,
};

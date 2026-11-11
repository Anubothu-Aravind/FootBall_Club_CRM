const nodemailer = require("nodemailer");
const fs = require('fs');
const path = require('path');

/**
 * Email Service
 * Handles sending emails for password reset and other notifications.
 * Supports both standard SMTP (Nodemailer) and Azure Communication Services.
 * Azure email is used when AZURE_ENABLED=true and AZURE_EMAIL_CONNECTION is set.
 */

// Determine if Azure email should be used
const shouldUseAzureEmail = () => {
  return (
    process.env.AZURE_ENABLED === "true" &&
    !!process.env.AZURE_EMAIL_CONNECTION
  );
};

// Create transporter (SMTP - default)
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
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
  });
};

/**
 * Unified email send function. Routes to Azure or SMTP based on config.
 * @param {Object} mailOptions - Standard nodemailer-style options: { to, subject, html, text, attachments }
 */
const sendEmail = async (mailOptions) => {
  if (shouldUseAzureEmail()) {
    const azureService = require("./azureService");
    return azureService.sendAzureEmail({
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      attachments: mailOptions.attachments,
    });
  }

  const transporter = createTransporter();
  return transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || "Pocket Soccer Scout"}" <${process.env.EMAIL_USER}>`,
    ...mailOptions,
  });
};

/**
 * Send password reset email with professional HTML template
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} adminName - Admin's name (email if no name)
 * @returns {Promise<boolean>} - Success status
 */
const sendPasswordResetEmail = async (email, resetToken, adminName = "Coach") => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    // Load HTML template
    const templatePath = path.join(__dirname, '../templates/password-reset.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');
    
    // Replace placeholders
    htmlContent = htmlContent
      .replace(/{{USER_NAME}}/g, adminName)
      .replace(/{{RESET_URL}}/g, resetUrl)
      .replace(/{{FRONTEND_URL}}/g, process.env.FRONTEND_URL || 'http://localhost:5173')
      .replace(/{{CURRENT_YEAR}}/g, new Date().getFullYear());

    // Plain text version (fallback)
    const textContent = `
Password Reset Request - Anantapur FC

Dear ${adminName},

We received a request to reset your password for the Anantapur FC Coach Portal.

Click the link below to reset your password (expires in 15 minutes):
${resetUrl}

If you didn't request this, please ignore this email and your password will remain unchanged.

For security reasons, this link will expire in 15 minutes.

Best regards,
Anantapur Football Club
Anantapur, Andhra Pradesh, India

---
This is an automated message. Please do not reply to this email.
    `;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Anantapur FC" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request - Anantapur FC Coach Portal",
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}: ${info.messageId}`);
    
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email. Please try again later.");
  }
};

/**
 * Send password change confirmation email
 * @param {string} email - Recipient email address
 * @param {string} adminName - Admin's name
 * @returns {Promise<boolean>} - Success status
 */
const sendPasswordChangedEmail = async (email, adminName = "Coach") => {
  try {
    const transporter = createTransporter();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light only">
          <meta name="supported-color-schemes" content="light only">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F1F5F9; -webkit-font-smoothing: antialiased;">
          <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #F1F5F9;">
            Your Anantapur FC password has been changed successfully.
          </div>
          <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F1F5F9" role="presentation">
            <tr>
              <td align="center" style="padding: 32px 16px;">
                <table style="max-width: 560px; width: 100%;" width="560" border="0" cellspacing="0" cellpadding="0" role="presentation">
                  <!-- Green accent bar -->
                  <tr>
                    <td style="height: 4px; background: linear-gradient(90deg, #059669 0%, #047857 100%); border-radius: 8px 8px 0 0; font-size: 0; line-height: 0;">&nbsp;</td>
                  </tr>
                  <!-- White card -->
                  <tr>
                    <td style="background-color: #FFFFFF; border-left: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0;">
                      <!-- Brand header -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                        <tr>
                          <td style="padding: 32px 40px 20px; text-align: center;">
                            <table border="0" cellspacing="0" cellpadding="0" role="presentation" align="center">
                              <tr>
                                <td style="width: 48px; height: 48px; background-color: #DC2626; border-radius: 50%; text-align: center; vertical-align: middle;">
                                  <span style="color: #FFFFFF; font-size: 20px; font-weight: 800; line-height: 48px; font-family: Georgia, serif;">A</span>
                                </td>
                              </tr>
                            </table>
                            <p style="margin: 14px 0 0; font-size: 18px; font-weight: 700; color: #0F172A;">Anantapur FC</p>
                            <p style="margin: 2px 0 0; font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 500;">Pocket Soccer Scout</p>
                          </td>
                        </tr>
                      </table>
                      <!-- Divider -->
                      <tr><td style="padding: 0 40px;"><div style="height: 1px; background-color: #F1F5F9;"></div></td></tr>
                      <!-- Success icon + heading -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                        <tr>
                          <td style="padding: 24px 40px 8px; text-align: center;">
                            <table border="0" cellspacing="0" cellpadding="0" role="presentation" align="center">
                              <tr>
                                <td style="width: 44px; height: 44px; background-color: #D1FAE5; border-radius: 50%; text-align: center; vertical-align: middle;">
                                  <span style="color: #059669; font-size: 22px; font-weight: 800; line-height: 44px;">&#10003;</span>
                                </td>
                              </tr>
                            </table>
                            <h2 style="margin: 14px 0 0; font-size: 20px; font-weight: 700; color: #0F172A;">Password Changed</h2>
                            <p style="margin: 6px 0 0; font-size: 14px; color: #64748B;">Your password has been updated successfully</p>
                          </td>
                        </tr>
                      </table>
                      <!-- Message body -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                        <tr>
                          <td style="padding: 20px 40px 0;">
                            <p style="margin: 0 0 10px; font-size: 15px; font-weight: 600; color: #0F172A;">Hello ${adminName},</p>
                            <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.7;">
                              This confirms that the password for your Anantapur FC Coach Portal account has been successfully changed. If you made this change, no further action is needed.
                            </p>
                          </td>
                        </tr>
                      </table>
                      <!-- Warning -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                        <tr>
                          <td style="padding: 20px 40px 32px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background-color: #FFF7ED; border-radius: 8px; border-left: 3px solid #F97316;">
                              <tr>
                                <td style="padding: 14px 16px;">
                                  <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #9A3412;">Did not make this change?</p>
                                  <p style="margin: 0; font-size: 13px; color: #7C2D12; line-height: 1.5;">
                                    If you did not change your password, your account may be compromised. Please contact support immediately at <a href="mailto:aravind.anubothu13@gmail.com" style="color: #DC2626; font-weight: 600;">aravind.anubothu13@gmail.com</a>.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
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
                            <p style="margin: 0; font-size: 11px; color: #475569;">Automated notification. Do not reply to this email.</p>
                            <p style="margin: 6px 0 0; font-size: 11px; color: #334155;">&copy; ${new Date().getFullYear()} Anantapur FC. All rights reserved.</p>
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
      </html>
    `;

    const textContent = `
Password Changed Successfully - Anantapur FC

Dear ${adminName},

This is to confirm that your password for the Anantapur FC Coach Portal has been successfully changed.

If you made this change, no further action is required.

If you didn't make this change, please contact support immediately as your account may have been compromised.

Best regards,
Anantapur Football Club
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Anantapur FC" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Changed Successfully - Anantapur FC",
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Password changed confirmation sent to ${email}: ${info.messageId}`);
    
    return true;
  } catch (error) {
    console.error("Error sending password changed email:", error);
    // Don't throw error - this is just a courtesy notification
    return false;
  }
};

/**
 * Send OTP email for password change (logged-in users)
 * @param {string} email - Recipient email
 * @param {string} otpCode - Plain OTP code (6 characters)
 * @param {string} adminName - Admin's name
 * @returns {Promise<boolean>} - Success status
 */
const sendPasswordChangeOTP = async (email, otpCode, adminName = "Coach") => {
  try {
    const transporter = createTransporter();
    const expiryMinutes = Math.floor((parseInt(process.env.OTP_EXPIRY) || 600000) / 60000);
    
    // Load HTML template
    const templatePath = path.join(__dirname, '../templates/otp-verification.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');
    
    // Replace placeholders
    htmlContent = htmlContent
      .replace(/{{USER_NAME}}/g, adminName)
      .replace(/{{OTP_CODE}}/g, otpCode)
      .replace(/{{OTP_EXPIRY_MINUTES}}/g, expiryMinutes)
      .replace(/{{CURRENT_YEAR}}/g, new Date().getFullYear());
    
    const textContent = `
Password Change OTP - Anantapur FC

Dear ${adminName},

You requested to change your password. Please use the following One-Time Password (OTP) to verify your identity:

OTP Code: ${otpCode}

This code is valid for ${expiryMinutes} minutes.

If you didn't request this, please ignore this email and consider changing your password if you suspect unauthorized access.

Stay secure,
Anantapur FC Security Team
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Anantapur FC" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Change Verification Code - Anantapur FC",
      text: textContent,
      html: htmlContent,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}: ${info.messageId}`);
    
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email. Please try again later.");
  }
};

/**
 * Test email configuration
 * @returns {Promise<boolean>} - Success status
 */
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email service is configured correctly");
    return true;
  } catch (error) {
    console.error("Email service configuration error:", error);
    return false;
  }
};

/**
 * Generate SVG pie chart for severity distribution
 * @param {number} critical - Critical count
 * @param {number} warning - Warning count
 * @param {number} info - Info count
 * @returns {string} SVG markup
 */
const generatePieChartSVG = (critical, warning, info) => {
  const total = critical + warning + info;
  if (total === 0) return '<circle cx="100" cy="100" r="80" fill="#e5e7eb" />';

  const criticalPercent = (critical / total) * 100;
  const warningPercent = (warning / total) * 100;
  const infoPercent = (info / total) * 100;

  // Calculate angles
  let currentAngle = 0;
  const criticalAngle = (criticalPercent / 100) * 360;
  const warningAngle = (warningPercent / 100) * 360;
  
  const slices = [];
  
  // Helper to convert angle to coordinates
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle, color) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return `
      <path d="M 100 100 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z" 
            fill="${color}" stroke="#ffffff" stroke-width="2"/>
    `;
  };

  if (critical > 0) {
    slices.push(describeArc(100, 100, 80, currentAngle, currentAngle + criticalAngle, '#dc2626'));
    currentAngle += criticalAngle;
  }
  if (warning > 0) {
    slices.push(describeArc(100, 100, 80, currentAngle, currentAngle + warningAngle, '#f97316'));
    currentAngle += warningAngle;
  }
  if (info > 0) {
    slices.push(describeArc(100, 100, 80, currentAngle, currentAngle + (360 - currentAngle), '#3b82f6'));
  }

  return slices.join('');
};

/**
 * Send audit log report email with PDF attachment
 * @param {Array<string>} recipients - Array of recipient email addresses
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} reportPeriod - Report period description (e.g., "Last 30 Days")
 * @param {Object} stats - Summary statistics
 * @param {string} chartImage - Base64 chart image data URL
 * @returns {Promise<boolean>} - Success status
 */
const sendAuditReportEmail = async (recipients, pdfBuffer, reportPeriod, stats = {}, chartImage = null) => {
  try {
    const transporter = createTransporter();
    
    const {
      totalLogs = 0,
      criticalCount = 0,
      warningCount = 0,
      infoCount = 0,
      startDate = null,
      endDate = null,
    } = stats;

    const formatDate = (date) => {
      return date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'N/A';
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Audit Logs Report</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 0; text-align: center; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                Pocket Soccer Scout
              </h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">
                System Audit Report
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-top: -20px;">
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px;">
                      System Audit Report
                    </h2>
                    
                    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
                      Dear Super Admin,
                    </p>
                    
                    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
                      Please find attached the comprehensive audit logs report for <strong>${reportPeriod}</strong>.
                    </p>

                    <!-- Report Period -->
                    <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #1f2937; font-weight: 600; margin-bottom: 8px;">Report Period</p>
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">
                        <strong>From:</strong> ${formatDate(startDate)}<br>
                        <strong>To:</strong> ${formatDate(endDate)}
                      </p>
                    </div>

                    <!-- Summary Statistics -->
                    <div style="margin: 30px 0;">
                      <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Summary Statistics</h3>
                      
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 12px; background-color: #f3f4f6; border-radius: 6px; margin-bottom: 8px;">
                            <span style="color: #6b7280; font-size: 14px;">Total Events</span>
                            <strong style="display: block; color: #1f2937; font-size: 24px; margin-top: 4px;">${totalLogs.toLocaleString()}</strong>
                          </td>
                        </tr>
                      </table>

                      <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
                        <tr>
                          <td style="padding: 12px; background-color: #fee2e2; border-radius: 6px; width: 32%; vertical-align: top;">
                            <span style="color: #991b1b; font-size: 12px; font-weight: 600;">CRITICAL</span>
                            <strong style="display: block; color: #dc2626; font-size: 20px; margin-top: 4px;">${criticalCount}</strong>
                          </td>
                          <td style="width: 2%;"></td>
                          <td style="padding: 12px; background-color: #ffedd5; border-radius: 6px; width: 32%; vertical-align: top;">
                            <span style="color: #9a3412; font-size: 12px; font-weight: 600;">WARNING</span>
                            <strong style="display: block; color: #f97316; font-size: 20px; margin-top: 4px;">${warningCount}</strong>
                          </td>
                          <td style="width: 2%;"></td>
                          <td style="padding: 12px; background-color: #dbeafe; border-radius: 6px; width: 32%; vertical-align: top;">
                            <span style="color: #1e40af; font-size: 12px; font-weight: 600;">INFO</span>
                            <strong style="display: block; color: #3b82f6; font-size: 20px; margin-top: 4px;">${infoCount}</strong>
                          </td>
                        </tr>
                      </table>

                      <!-- Pie Chart Visualization -->
                      ${chartImage ? `
                      <div style="text-align: center; margin: 25px 0;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #0f172a;">Event Distribution</h3>
                        <img src="${chartImage}" alt="Event Distribution Chart" style="max-width: 320px; height: auto; display: block; margin: 0 auto;">
                      </div>
                      ` : ''}
                    </div>

                    <!-- Attachment Notice -->
                    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 15px 20px; margin: 25px 0;">
                      <p style="margin: 0; color: #1e40af; font-size: 14px;">
                        <strong>Attachment:</strong> Detailed audit logs report (PDF format)
                      </p>
                    </div>

                    <p style="color: #4b5563; line-height: 1.6; margin: 25px 0 0 0; font-size: 14px;">
                      Please review the attached PDF document for complete details of all system activities during this period.
                    </p>

                    ${totalLogs > 0 && criticalCount > 0 ? `
                      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #991b1b; font-weight: 600;">
                          Attention Required
                        </p>
                        <p style="margin: 8px 0 0 0; color: #7f1d1d; font-size: 14px;">
                          ${criticalCount} critical event${criticalCount > 1 ? 's' : ''} detected. Please review the detailed report.
                        </p>
                      </div>
                    ` : ''}

                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      This is an automated report from the Pocket Soccer Scout system.
                    </p>
                    <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 11px;">
                      © ${new Date().getFullYear()} Anantapur Football Club. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const textContent = `
Pocket Soccer Scout - Audit Logs Report

Report Period: ${reportPeriod}
From: ${formatDate(startDate)}
To: ${formatDate(endDate)}

SUMMARY STATISTICS
==================
Total Events: ${totalLogs}
Critical Events: ${criticalCount}
Warning Events: ${warningCount}
Info Events: ${infoCount}

Please review the attached PDF document for complete details of all system activities during this period.

${criticalCount > 0 ? `⚠️ ATTENTION: ${criticalCount} critical event${criticalCount > 1 ? 's' : ''} detected.\n` : ''}
---
This is an automated report from the Pocket Soccer Scout system.
© ${new Date().getFullYear()} Anantapur Football Club. All rights reserved.
    `;

    // Generate filename with date
    const filename = `Audit_Report_${startDate ? new Date(startDate).toISOString().split('T')[0] : 'Custom'}_${endDate ? new Date(endDate).toISOString().split('T')[0] : 'Range'}.pdf`;

    // Send email to all recipients
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Anantapur FC - System Reports" <${process.env.EMAIL_USER}>`,
      to: recipients.join(', '),
      subject: `🔒 Audit Logs Report - ${reportPeriod} | Pocket Soccer Scout`,
      text: textContent,
      html: htmlContent,
      attachments: [
        {
          filename: filename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Audit report email sent to ${recipients.length} recipient(s): ${info.messageId}`);
    
    return true;
  } catch (error) {
    console.error("Error sending audit report email:", error);
    throw new Error("Failed to send audit report email. Please try again later.");
  }
};

/**
 * Send contact form email — forwards the enquiry to the admin inbox
 * and sends a confirmation to the visitor.
 */
const sendContactFormEmail = async ({ name, email, phone, organization, subject, message }) => {
  const transporter = createTransporter();
  const adminEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
  const year = new Date().getFullYear();

  // Email to admin with the enquiry
  const adminHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#F1F5F9;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F1F5F9" role="presentation">
        <tr><td align="center" style="padding:32px 16px;">
          <table style="max-width:560px;width:100%;" border="0" cellspacing="0" cellpadding="0">
            <tr><td style="height:4px;background:linear-gradient(90deg,#DC2626 0%,#F97316 100%);border-radius:8px 8px 0 0;">&nbsp;</td></tr>
            <tr><td style="background:#FFFFFF;padding:32px 40px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">
              <table border="0" cellspacing="0" cellpadding="0" align="center"><tr>
                <td style="width:48px;height:48px;background:#DC2626;border-radius:50%;text-align:center;vertical-align:middle;">
                  <span style="color:#FFF;font-size:20px;font-weight:800;line-height:48px;font-family:Georgia,serif;">A</span>
                </td>
              </tr></table>
              <p style="margin:14px 0 0;font-size:18px;font-weight:700;color:#0F172A;text-align:center;">New Contact Enquiry</p>
              <p style="margin:2px 0 24px;font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:1.5px;font-weight:500;text-align:center;">Anantapur FC Website</p>
              <div style="height:1px;background:#F1F5F9;margin-bottom:20px;"></div>
              <table width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;color:#334155;line-height:1.7;">
                <tr><td style="padding:6px 0;font-weight:600;width:110px;vertical-align:top;">Name</td><td style="padding:6px 0;">${name}</td></tr>
                <tr><td style="padding:6px 0;font-weight:600;vertical-align:top;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#DC2626;">${email}</a></td></tr>
                <tr><td style="padding:6px 0;font-weight:600;vertical-align:top;">Phone</td><td style="padding:6px 0;">${phone}</td></tr>
                <tr><td style="padding:6px 0;font-weight:600;vertical-align:top;">Organisation</td><td style="padding:6px 0;">${organization}</td></tr>
                <tr><td style="padding:6px 0;font-weight:600;vertical-align:top;">Subject</td><td style="padding:6px 0;">${subject}</td></tr>
              </table>
              <div style="margin-top:16px;padding:16px;background:#FFF7ED;border-radius:8px;border-left:3px solid #F97316;">
                <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#9A3412;">Message</p>
                <p style="margin:0;font-size:14px;color:#7C2D12;line-height:1.6;white-space:pre-wrap;">${message}</p>
              </div>
            </td></tr>
            <tr><td style="background:#0F172A;padding:20px 40px;border-radius:0 0 8px 8px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#64748B;">&copy; ${year} Anantapur Football Club. All rights reserved.</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Anantapur FC" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    replyTo: email,
    subject: `Contact: ${subject} — from ${name}`,
    text: `New contact enquiry from ${name} (${email}).\n\nPhone: ${phone}\nOrganisation: ${organization}\nSubject: ${subject}\n\nMessage:\n${message}`,
    html: adminHtml,
  });

  // Confirmation to the sender
  const confirmHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#F1F5F9;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F1F5F9" role="presentation">
        <tr><td align="center" style="padding:32px 16px;">
          <table style="max-width:560px;width:100%;" border="0" cellspacing="0" cellpadding="0">
            <tr><td style="height:4px;background:linear-gradient(90deg,#DC2626 0%,#F97316 100%);border-radius:8px 8px 0 0;">&nbsp;</td></tr>
            <tr><td style="background:#FFFFFF;padding:32px 40px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">
              <table border="0" cellspacing="0" cellpadding="0" align="center"><tr>
                <td style="width:48px;height:48px;background:#DC2626;border-radius:50%;text-align:center;vertical-align:middle;">
                  <span style="color:#FFF;font-size:20px;font-weight:800;line-height:48px;font-family:Georgia,serif;">A</span>
                </td>
              </tr></table>
              <p style="margin:14px 0 0;font-size:18px;font-weight:700;color:#0F172A;text-align:center;">Anantapur FC</p>
              <p style="margin:2px 0 24px;font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:1.5px;font-weight:500;text-align:center;">Pocket Soccer Scout</p>
              <div style="height:1px;background:#F1F5F9;margin-bottom:20px;"></div>
              <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#0F172A;">Hi ${name},</p>
              <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;">Thank you for reaching out to Anantapur Football Club. We have received your message and will get back to you within 24-48 hours.</p>
              <div style="margin-top:20px;padding:14px 16px;background:#F0FDF4;border-radius:8px;border-left:3px solid #22C55E;">
                <p style="margin:0;font-size:13px;font-weight:600;color:#166534;">Your message has been received</p>
                <p style="margin:4px 0 0;font-size:13px;color:#15803D;">Subject: ${subject}</p>
              </div>
            </td></tr>
            <tr><td style="background:#0F172A;padding:20px 40px;border-radius:0 0 8px 8px;text-align:center;">
              <p style="margin:0;font-size:14px;font-weight:600;color:#E2E8F0;">Anantapur Football Club</p>
              <p style="margin:4px 0 0;font-size:12px;color:#64748B;">Anantapur, Andhra Pradesh, India</p>
              <p style="margin:10px 0 0;font-size:11px;color:#475569;">&copy; ${year} Anantapur FC. All rights reserved.</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Anantapur FC" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `We received your message — Anantapur FC`,
    text: `Hi ${name},\n\nThank you for reaching out to Anantapur Football Club. We have received your message regarding "${subject}" and will respond within 24-48 hours.\n\nBest regards,\nAnantapur FC`,
    html: confirmHtml,
  });

  return true;
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendPasswordChangeOTP,
  testEmailConnection,
  sendAuditReportEmail,
  sendContactFormEmail,
};
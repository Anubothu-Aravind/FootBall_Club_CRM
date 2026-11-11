const puppeteer = require('puppeteer');
const AuditLog = require("../models/AuditLog");
const { generatePieChartImage } = require('./chartService');

/**
 * Generate HTML template for PDF report
 */
const generateHTMLReport = async (logs, startDate, endDate, chartImage) => {
  const totalLogs = logs.length;
  const criticalCount = logs.filter((l) => l.severity === "CRITICAL").length;
  const warningCount = logs.filter((l) => l.severity === "WARNING").length;
  const infoCount = logs.filter((l) => l.severity === "INFO").length;

  // Calculate actual date range from data
  const actualStartDate = logs.length > 0 
    ? new Date(Math.min(...logs.map(l => new Date(l.createdAt))))
    : startDate;
  const actualEndDate = logs.length > 0
    ? new Date(Math.max(...logs.map(l => new Date(l.createdAt))))
    : endDate;

  // Calculate login statistics
  const loginLogs = logs.filter(l => l.action === 'LOGIN_SUCCESS');
  const loginStats = loginLogs.reduce((acc, log) => {
    const email = log.actorEmail || 'Unknown';
    acc[email] = (acc[email] || 0) + 1;
    return acc;
  }, {});

  // Category breakdown
  const categoryBreakdown = logs.reduce((acc, log) => {
    const category = log.category || 'UNCATEGORIZED';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #374151;
      line-height: 1.6;
      padding: 30px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .stat-card {
      background: #f9fafb;
      padding: 12px;
      border-radius: 6px;
      text-align: center;
      border-left: 4px solid;
    }
    
    .stat-card.total { border-color: #374151; }
    .stat-card.critical { border-color: #dc2626; }
    .stat-card.warning { border-color: #f97316; }
    .stat-card.info { border-color: #3b82f6; }
    
    .stat-label {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .stat-value {
      font-size: 22px;
      font-weight: bold;
    }
    
    .stat-card.total .stat-value { color: #374151; }
    .stat-card.critical .stat-value { color: #dc2626; }
    .stat-card.warning .stat-value { color: #f97316; }
    .stat-card.info .stat-value { color: #3b82f6; }
    
    .logs-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-top: 12px;
    }
    
    .logs-table thead {
      background: #1e3a8a;
      color: white;
    }
    
    .logs-table th {
      padding: 8px 6px;
      text-align: left;
      font-weight: 600;
      font-size: 10px;
    }
    
    .logs-table td {
      padding: 6px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 9px;
    }
    
    .logs-table tbody tr:nth-child(even) {
      background: #f9fafb;
    }
  </style>
</head>
<body>
  <h1 style="color: #1e3a8a; font-size: 24px; text-align: center; margin-bottom: 20px;">Pocket Soccer Scout - Audit Report</h1>
  <p style="text-align: center; color: #666; margin-bottom: 30px;">
    <strong>Period:</strong> ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
  </p>

  <!-- Summary Stats -->
  <div class="stats-grid">
    <div class="stat-card total">
      <div class="stat-label">Total Events</div>
      <div class="stat-value">${totalLogs}</div>
    </div>
    <div class="stat-card critical">
      <div class="stat-label">Critical</div>
      <div class="stat-value">${criticalCount}</div>
    </div>
    <div class="stat-card warning">
      <div class="stat-label">Warning</div>
      <div class="stat-value">${warningCount}</div>
    </div>
    <div class="stat-card info">
      <div class="stat-label">Info</div>
      <div class="stat-value">${infoCount}</div>
    </div>
  </div>

  ${chartImage ? `<div style="text-align: center; margin: 20px 0;"><img src="${chartImage}" alt="Chart" style="max-width: 320px;"></div>` : ''}

  ${Object.keys(loginStats).length > 0 ? `
  <h3 style="margin: 25px 0 10px; color: #1e3a8a;">Login Statistics</h3>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
    <thead><tr style="background: #e5e7eb;"><th style="padding: 8px; text-align: left;">User</th><th style="padding: 8px; text-align: right;">Logins</th></tr></thead>
    <tbody>
      ${Object.entries(loginStats).sort((a, b) => b[1] - a[1]).map(([email, count]) => 
        `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${email}</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${count}</td></tr>`
      ).join('')}
    </tbody>
  </table>
  ` : ''}

  ${logs.length > 0 ? `
  <h3 style="margin: 25px 0 10px; color: #1e3a8a;">Detailed Logs</h3>
  <table class="logs-table">
    <thead>
      <tr>
        <th>Date/Time</th>
        <th>Action</th>
        <th>Actor</th>
        <th>Severity</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      ${logs.map(log => `
        <tr>
          <td>${new Date(log.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
          <td>${log.action || 'N/A'}</td>
          <td>${log.actorEmail || 'System'}</td>
          <td><span style="padding: 2px 6px; background: ${log.severity === 'CRITICAL' ? '#fef2f2' : log.severity === 'WARNING' ? '#fff7ed' : '#eff6ff'}; color: ${log.severity === 'CRITICAL' ? '#dc2626' : log.severity === 'WARNING' ? '#f97316' : '#3b82f6'}; border-radius: 3px; font-size: 8px;">${log.severity}</span></td>
          <td>${log.description ? log.description.substring(0, 80) : 'N/A'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p style="text-align: center; color: #666; margin: 30px 0;">No logs found for this period.</p>'}
</body>
</html>
  `;
};

/**
 * Generate PDF report using Puppeteer
 */
const generateAuditLogPDF = async (startDate, endDate) => {
  let browser;
  try {
    const logs = await AuditLog.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 }).lean();

    const criticalCount = logs.filter((l) => l.severity === "CRITICAL").length;
    const warningCount = logs.filter((l) => l.severity === "WARNING").length;
    const infoCount = logs.filter((l) => l.severity === "INFO").length;

    const chartImage = await generatePieChartImage(criticalCount, warningCount, infoCount);
    const html = await generateHTMLReport(logs, startDate, endDate, chartImage);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' },
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    if (browser) await browser.close();
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF report");
  }
};

const getLogsOlderThan = async (days) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return await AuditLog.find({ createdAt: { $lt: cutoffDate } }).sort({ createdAt: -1 }).lean();
};

const deleteLogsOlderThan = async (days) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoffDate } });
  return { deletedCount: result.deletedCount, cutoffDate };
};

const getLogsByDateRange = async (startDate, endDate) => {
  return await AuditLog.find({
    createdAt: { $gte: startDate, $lte: endDate },
  }).sort({ createdAt: -1 }).lean();
};

module.exports = {
  generateAuditLogPDF,
  getLogsOlderThan,
  deleteLogsOlderThan,
  getLogsByDateRange,
};

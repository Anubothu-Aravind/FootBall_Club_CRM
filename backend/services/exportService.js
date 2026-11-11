const Player = require("../models/Player");
const Tournament = require("../models/Tournament");
const Training = require("../models/Training");
const AuditLog = require("../models/AuditLog");
const DeletedRecord = require("../models/DeletedRecord");
const XLSX = require("xlsx");

/**
 * Export Service
 * Centralized data export for Players, Tournaments, Audit Logs, and Deleted Records
 * Supports JSON, CSV, and Excel (XLSX) formats
 */
class ExportService {
  // ═══════════════════════════════════════════════════════
  // FIELD DEFINITIONS (Visible vs Hidden)
  // ═══════════════════════════════════════════════════════

  static PLAYER_VISIBLE_FIELDS = [
    "full_name",
    "age",
    "age_group",
    "gender",
    "size",
    "height",
    "weight",
    "jersey_no",
    "city",
    "createdAt",
  ];

  static PLAYER_HIDDEN_FIELDS = [
    "first_name",
    "middle_name",
    "last_name",
    "address",
    "id",
    "_id",
    "__v",
    "updatedAt",
  ];

  static TOURNAMENT_VISIBLE_FIELDS = [
    "name",
    "age_group",
    "status",
    "start_date",
    "end_date",
    "location",
    "createdAt",
  ];

  static TOURNAMENT_HIDDEN_FIELDS = ["images", "id", "_id", "__v", "updatedAt"];

  static TRAINING_VISIBLE_FIELDS = [
    "title",
    "age_group",
    "type",
    "status",
    "session_date",
    "duration",
    "location",
    "coach_name",
    "participants_count",
    "createdAt",
  ];

  static TRAINING_HIDDEN_FIELDS = [
    "description",
    "images",
    "id",
    "_id",
    "__v",
    "updatedAt",
  ];

  static AUDIT_VISIBLE_FIELDS = [
    "createdAt",
    "action",
    "category",
    "severity",
    "entityType",
    "entityName",
    "actorEmail",
    "description",
  ];

  static AUDIT_HIDDEN_FIELDS = [
    "ipAddress",
    "userAgent",
    "previousData",
    "newData",
    "changedFields",
    "actorId",
    "metadata",
    "id",
    "_id",
    "__v",
  ];

  // ═══════════════════════════════════════════════════════
  // DATA FETCHING
  // ═══════════════════════════════════════════════════════

  static async getPlayerData(filters = {}) {
    const query = {};

    // Basic filters
    if (filters.age_group) query.age_group = filters.age_group;
    if (filters.gender) query.gender = filters.gender;
    if (filters.city) query.city = new RegExp(filters.city, "i");

    // Name filter - search across first_name, middle_name, and last_name
    if (filters.name) {
      const nameRegex = new RegExp(filters.name, "i");
      query.$or = [
        { first_name: nameRegex },
        { middle_name: nameRegex },
        { last_name: nameRegex },
      ];
    }

    // Age range filters
    if (filters.age_min)
      query.age = { ...query.age, $gte: parseInt(filters.age_min) };
    if (filters.age_max)
      query.age = { ...query.age, $lte: parseInt(filters.age_max) };

    // Size filter
    if (filters.size) query.size = filters.size;

    // Height filter
    if (filters.height) query.height = parseInt(filters.height);

    // Weight filter
    if (filters.weight) query.weight = parseInt(filters.weight);

    // Jersey number filter
    if (filters.jersey_no) query.jersey_no = parseInt(filters.jersey_no);

    const players = await Player.find(query).sort({ createdAt: -1 }).lean();

    // Combine first_name, middle_name, and last_name into a single full_name field
    return players.map((player) => ({
      ...player,
      full_name: [player.first_name, player.middle_name, player.last_name]
        .filter((n) => n && n.trim())
        .join(" "),
    }));
  }

  static async getTournamentData(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.age_group) query.age_group = filters.age_group;
    if (filters.location) query.location = new RegExp(filters.location, "i");

    // Additional tournament filters
    if (filters.name) query.name = new RegExp(filters.name, "i");
    if (filters.startDate) {
      query.start_date = {
        ...query.start_date,
        $gte: new Date(filters.startDate),
      };
    }
    if (filters.endDate) {
      query.end_date = { ...query.end_date, $lte: new Date(filters.endDate) };
    }

    return Tournament.find(query).sort({ start_date: -1 }).lean();
  }

  static async getTrainingData(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.age_group) query.age_group = filters.age_group;
    if (filters.type) query.type = filters.type;
    if (filters.location) query.location = new RegExp(filters.location, "i");

    // Additional training filters
    if (filters.title) query.title = new RegExp(filters.title, "i");
    if (filters.coach_name)
      query.coach_name = new RegExp(filters.coach_name, "i");
    if (filters.startDate) {
      query.session_date = {
        ...query.session_date,
        $gte: new Date(filters.startDate),
      };
    }
    if (filters.endDate) {
      query.session_date = {
        ...query.session_date,
        $lte: new Date(filters.endDate),
      };
    }

    return Training.find(query).sort({ session_date: -1 }).lean();
  }

  static async getAuditData(filters = {}) {
    const query = {};
    if (filters.action) query.action = filters.action;
    if (filters.category) query.category = filters.category;
    if (filters.severity) query.severity = filters.severity;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    return AuditLog.find(query).sort({ createdAt: -1 }).limit(10000).lean();
  }

  static async getDeletedRecordData(filters = {}) {
    const query = { isRestored: false };
    if (filters.entityType) query.entityType = filters.entityType;

    return DeletedRecord.find(query).sort({ deletedAt: -1 }).lean();
  }

  // ═══════════════════════════════════════════════════════
  // EXPORT METHODS
  // ═══════════════════════════════════════════════════════

  /**
   * Export data based on section and format
   * @param {string} section - Data section (players, tournaments, audit, deleted)
   * @param {string} format - Export format (json, csv, xlsx)
   * @param {Object} filters - Optional filters
   * @param {boolean} includeHidden - Include hidden fields
   * @param {Array} selectedColumns - Optional array of specific columns to include
   * @returns {Object} Export result
   */
  static async exportData(
    section,
    format,
    filters = {},
    includeHidden = false,
    selectedColumns = null,
  ) {
    let data;
    let visibleFields;
    let hiddenFields;
    let label;

    switch (section) {
      case "players":
        data = await this.getPlayerData(filters);
        visibleFields = this.PLAYER_VISIBLE_FIELDS;
        hiddenFields = this.PLAYER_HIDDEN_FIELDS;
        label = "Players";
        break;
      case "tournaments":
        data = await this.getTournamentData(filters);
        visibleFields = this.TOURNAMENT_VISIBLE_FIELDS;
        hiddenFields = this.TOURNAMENT_HIDDEN_FIELDS;
        label = "Tournaments";
        break;
      case "trainings":
        data = await this.getTrainingData(filters);
        visibleFields = this.TRAINING_VISIBLE_FIELDS;
        hiddenFields = this.TRAINING_HIDDEN_FIELDS;
        label = "Training Sessions";
        break;
      case "audit":
        data = await this.getAuditData(filters);
        visibleFields = this.AUDIT_VISIBLE_FIELDS;
        hiddenFields = this.AUDIT_HIDDEN_FIELDS;
        label = "Audit Logs";
        break;
      case "deleted":
        data = await this.getDeletedRecordData(filters);
        visibleFields = [
          "entityType",
          "entityName",
          "deletedByEmail",
          "deletedAt",
          "deletionReason",
          "purgeAfter",
        ];
        hiddenFields = ["originalData", "id", "_id", "__v", "deletedBy"];
        label = "Deleted Records";
        break;
      default:
        throw new Error(`Invalid export section: ${section}`);
    }

    // Determine which fields to export
    let fields;
    if (selectedColumns && selectedColumns.length > 0) {
      // Use explicitly selected columns
      fields = selectedColumns;
    } else if (includeHidden) {
      // Include all fields (visible + hidden)
      fields = [...visibleFields, ...hiddenFields];
    } else {
      // Use only visible fields
      fields = visibleFields;
    }

    switch (format) {
      case "json":
        return this.toJSON(data, fields, label);
      case "csv":
        return this.toCSV(data, fields, label);
      case "xlsx":
        return this.toXLSX(data, fields, label);
      default:
        throw new Error(`Invalid export format: ${format}`);
    }
  }

  // ═══════════════════════════════════════════════════════
  // FORMAT CONVERTERS
  // ═══════════════════════════════════════════════════════

  /**
   * Export as JSON
   */
  static toJSON(data, fields, label) {
    const filteredData = data.map((item) => {
      const obj = {};
      fields.forEach((field) => {
        if (item[field] !== undefined) {
          obj[field] = item[field];
        }
      });
      return obj;
    });

    return {
      format: "json",
      contentType: "application/json",
      filename: `${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`,
      data: filteredData,
      meta: {
        section: label,
        totalRecords: data.length,
        exportedAt: new Date().toISOString(),
        fieldsIncluded: fields,
      },
    };
  }

  /**
   * Export as CSV
   */
  static toCSV(data, fields, label) {
    const headers = fields.map((f) => this.formatFieldName(f));

    const rows = data.map((item) => {
      return fields.map((field) => {
        let value = item[field];

        // Format dates
        if (value instanceof Date) {
          value = value.toISOString();
        }

        // Format objects/arrays
        if (typeof value === "object" && value !== null) {
          value = JSON.stringify(value);
        }

        // Escape CSV special characters
        if (value === null || value === undefined) {
          return '""';
        }

        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return `"${str}"`;
      });
    });

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return {
      format: "csv",
      contentType: "text/csv",
      filename: `${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.csv`,
      data: csv,
      meta: {
        section: label,
        totalRecords: data.length,
        exportedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Export as XLSX (Excel)
   * Uses the xlsx library to generate proper Excel files
   */
  static toXLSX(data, fields, label) {
    const headers = fields.map((f) => this.formatFieldName(f));

    // Prepare data rows
    const rows = data.map((item) => {
      const row = {};
      fields.forEach((field, index) => {
        let value = item[field];

        // Format dates
        if (value instanceof Date) {
          value = value.toISOString().replace("T", " ").substring(0, 19);
        } else if (typeof value === "object" && value !== null) {
          value = JSON.stringify(value);
        } else if (value === null || value === undefined) {
          value = "";
        }

        row[headers[index]] = value;
      });
      return row;
    });

    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: headers,
    });

    // Set column widths
    const columnWidths = headers.map(() => ({ wch: 20 }));
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, label.substring(0, 31));

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return {
      format: "xlsx",
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      filename: `${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.xlsx`,
      data: buffer,
      meta: {
        section: label,
        totalRecords: data.length,
        exportedAt: new Date().toISOString(),
      },
    };
  }

  // ═══════════════════════════════════════════════════════
  // MULTI-SECTION EXPORT (All in one)
  // ═══════════════════════════════════════════════════════

  /**
   * Export all sections into one combined result
   */
  static async exportAll(format, includeHidden = false) {
    const sections = [
      "players",
      "tournaments",
      "trainings",
      "audit",
      "deleted",
    ];
    const results = {};

    for (const section of sections) {
      try {
        results[section] = await this.exportData(
          section,
          "json",
          {},
          includeHidden,
        );
      } catch (err) {
        results[section] = { error: err.message };
      }
    }

    if (format === "json") {
      return {
        format: "json",
        contentType: "application/json",
        filename: `full-export-${Date.now()}.json`,
        data: results,
        meta: {
          exportedAt: new Date().toISOString(),
          sections: sections,
        },
      };
    }

    // For CSV, combine all sections with section headers
    if (format === "csv") {
      let combined = "";
      for (const section of sections) {
        if (results[section]?.data) {
          const sectionResult = await this.exportData(
            section,
            "csv",
            {},
            includeHidden,
          );
          combined += `\n=== ${sectionResult.meta.section.toUpperCase()} ===\n`;
          combined += sectionResult.data;
          combined += "\n\n";
        }
      }

      return {
        format: "csv",
        contentType: "text/csv",
        filename: `full-export-${Date.now()}.csv`,
        data: combined,
        meta: {
          exportedAt: new Date().toISOString(),
          sections: sections,
        },
      };
    }

    throw new Error("Multi-section export only supports json and csv formats");
  }

  // ═══════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════

  static formatFieldName(field) {
    return field
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  static escapeXML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  /**
   * Get export metadata for all sections
   */
  static async getExportInfo() {
    const [
      playerCount,
      tournamentCount,
      trainingCount,
      auditCount,
      deletedCount,
    ] = await Promise.all([
      Player.countDocuments(),
      Tournament.countDocuments(),
      Training.countDocuments(),
      AuditLog.countDocuments(),
      DeletedRecord.countDocuments({ isRestored: false }),
    ]);

    return {
      sections: [
        {
          id: "players",
          label: "Players",
          description: "All player records with personal details and stats",
          recordCount: playerCount,
          formats: ["json", "csv", "xlsx"],
          visibleFields: this.PLAYER_VISIBLE_FIELDS.map((f) =>
            this.formatFieldName(f),
          ),
          hiddenFields: this.PLAYER_HIDDEN_FIELDS.map((f) =>
            this.formatFieldName(f),
          ),
        },
        {
          id: "tournaments",
          label: "Tournaments",
          description:
            "All tournament records with dates, status, and location",
          recordCount: tournamentCount,
          formats: ["json", "csv", "xlsx"],
          visibleFields: this.TOURNAMENT_VISIBLE_FIELDS.map((f) =>
            this.formatFieldName(f),
          ),
          hiddenFields: this.TOURNAMENT_HIDDEN_FIELDS.map((f) =>
            this.formatFieldName(f),
          ),
        },
        {
          id: "trainings",
          label: "Training Sessions",
          description:
            "All training session records with dates, type, and duration",
          recordCount: trainingCount,
          formats: ["json", "csv", "xlsx"],
          visibleFields: this.TRAINING_VISIBLE_FIELDS.map((f) =>
            this.formatFieldName(f),
          ),
          hiddenFields: this.TRAINING_HIDDEN_FIELDS.map((f) =>
            this.formatFieldName(f),
          ),
        },
        {
          id: "audit",
          label: "Audit Logs",
          description: "System activity trail with actor and action details",
          recordCount: auditCount,
          formats: ["json", "csv", "xlsx"],
          visibleFields: this.AUDIT_VISIBLE_FIELDS.map((f) =>
            this.formatFieldName(f),
          ),
          hiddenFields: this.AUDIT_HIDDEN_FIELDS.map((f) =>
            this.formatFieldName(f),
          ),
          requiresRole: "SUPER_ADMIN",
        },
        {
          id: "deleted",
          label: "Deleted Records",
          description: "Soft-deleted records awaiting restoration or purge",
          recordCount: deletedCount,
          formats: ["json", "csv"],
          visibleFields: [
            "Entity Type",
            "Entity Name",
            "Deleted By",
            "Deleted At",
            "Reason",
            "Purge After",
          ],
          hiddenFields: ["Original Data", "Internal IDs"],
          requiresRole: "SUPER_ADMIN",
        },
      ],
    };
  }
}

module.exports = ExportService;

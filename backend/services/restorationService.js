const DeletedRecord = require("../models/DeletedRecord");
const Player = require("../models/Player");
const Tournament = require("../models/Tournament");
const Training = require("../models/Training");
const Admin = require("../models/Admin");
const AuditService = require("./auditService");
const AuditLog = require("../models/AuditLog");

/**
 * Restoration Service
 * Handles soft deletion and restoration of records
 */
class RestorationService {
  /**
   * Get the model for a given entity type
   * @param {string} entityType - Entity type
   * @returns {Model} Mongoose model
   */
  static getModel(entityType) {
    const models = {
      PLAYER: Player,
      TOURNAMENT: Tournament,
      TRAINING: Training,
      ADMIN: Admin,
    };
    return models[entityType.toUpperCase()];
  }

  /**
   * Get entity display name from data
   * @param {string} entityType - Entity type
   * @param {Object} data - Entity data
   * @returns {string} Display name
   */
  static getEntityName(entityType, data) {
    switch (entityType.toUpperCase()) {
      case "PLAYER":
        return (
          [data.first_name, data.middle_name, data.last_name]
            .filter(Boolean)
            .join(" ") || `Player ${data.jersey_no}`
        );
      case "TOURNAMENT":
        return data.name || "Unnamed Tournament";
      case "TRAINING":
        return data.title || "Unnamed Training Session";
      case "ADMIN":
        return data.email || "Unknown Admin";
      default:
        return "Unknown";
    }
  }

  /**
   * Soft delete a record
   * @param {string} entityType - Type of entity
   * @param {string} entityId - ID of the entity
   * @param {Object} actorInfo - Info about who performed the deletion
   * @param {string} reason - Optional deletion reason
   * @returns {Promise<Object>} Deleted record info
   */
  static async softDelete(entityType, entityId, actorInfo, reason = "") {
    const Model = this.getModel(entityType);
    if (!Model) {
      throw new Error(`Invalid entity type: ${entityType}`);
    }

    // Find the record to delete
    let record = await Model.findOne({ id: entityId });
    if (!record && entityId.match(/^[0-9a-fA-F]{24}$/)) {
      record = await Model.findById(entityId);
    }

    if (!record) {
      throw new Error(`${entityType} not found`);
    }

    // Create snapshot of the data
    const originalData = record.toObject();
    const entityName = this.getEntityName(entityType, originalData);

    // Create deleted record entry
    const deletedRecord = new DeletedRecord({
      entityType: entityType.toUpperCase(),
      entityId: record.id || record._id.toString(),
      entityName,
      originalData,
      deletedBy: actorInfo.id,
      deletedByEmail: actorInfo.email,
      deletionReason: reason,
      purgeAfter: DeletedRecord.calculatePurgeDate(entityType.toUpperCase()),
    });

    await deletedRecord.save();

    // Delete the original record
    await Model.deleteOne({ _id: record._id });

    // Log the deletion
    await AuditService.logAction({
      action: AuditLog.ACTIONS.DELETE,
      entityType: entityType.toUpperCase(),
      entityId: record.id || record._id.toString(),
      entityName,
      previousData: originalData,
      actorId: actorInfo.id,
      actorEmail: actorInfo.email,
      actorRole: actorInfo.role,
      ipAddress: actorInfo.ipAddress,
      userAgent: actorInfo.userAgent,
      description: AuditService.generateDescription(
        AuditLog.ACTIONS.DELETE,
        entityType,
        entityName,
      ),
      metadata: { deletedRecordId: deletedRecord.id, reason },
    });

    return {
      success: true,
      deletedRecord: {
        id: deletedRecord.id,
        entityType: deletedRecord.entityType,
        entityName,
        deletedAt: deletedRecord.deletedAt,
        purgeAfter: deletedRecord.purgeAfter,
        daysUntilPurge: deletedRecord.getDaysUntilPurge(),
      },
    };
  }

  /**
   * Get deleted records with optional filtering
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Paginated deleted records
   */
  static async getDeletedRecords(filters = {}, pagination = {}) {
    const {
      entityType,
      startDate,
      endDate,
      search,
      includeRestored = false,
    } = filters;
    const {
      page = 1,
      limit = 20,
      sortBy = "deletedAt",
      sortOrder = "desc",
    } = pagination;

    const query = {};

    if (!includeRestored) {
      query.isRestored = false;
    }

    if (entityType) {
      query.entityType = entityType.toUpperCase();
    }

    if (startDate || endDate) {
      query.deletedAt = {};
      if (startDate) query.deletedAt.$gte = new Date(startDate);
      if (endDate) query.deletedAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { entityName: new RegExp(search, "i") },
        { deletedByEmail: new RegExp(search, "i") },
      ];
    }

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      DeletedRecord.find(query).sort(sort).skip(skip).limit(limit),
      DeletedRecord.countDocuments(query),
    ]);

    // Add computed fields
    const enrichedRecords = records.map((record) => ({
      ...record.toObject(),
      daysUntilPurge: record.getDaysUntilPurge(),
      canRestore: record.canBeRestored(),
    }));

    return {
      records: enrichedRecords,
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
   * Preview a deleted record without restoring
   * @param {string} entityType - Entity type
   * @param {string} recordId - Deleted record ID
   * @returns {Promise<Object>} Deleted record preview
   */
  static async previewRecord(entityType, recordId) {
    const record = await DeletedRecord.findOne({
      id: recordId,
      entityType: entityType.toUpperCase(),
    });

    if (!record) {
      throw new Error("Deleted record not found");
    }

    return {
      id: record.id,
      entityType: record.entityType,
      entityName: record.entityName,
      originalData: record.originalData,
      deletedBy: record.deletedByEmail,
      deletedAt: record.deletedAt,
      deletionReason: record.deletionReason,
      daysUntilPurge: record.getDaysUntilPurge(),
      canRestore: record.canBeRestored(),
      isRestored: record.isRestored,
    };
  }

  /**
   * Validate if a record can be restored
   * @param {string} entityType - Entity type
   * @param {string} recordId - Deleted record ID
   * @returns {Promise<Object>} Validation result
   */
  static async validateRestoration(entityType, recordId) {
    const record = await DeletedRecord.findOne({
      id: recordId,
      entityType: entityType.toUpperCase(),
    });

    if (!record) {
      return { canRestore: false, reason: "Deleted record not found" };
    }

    const basicCheck = record.canBeRestored();
    if (!basicCheck.canRestore) {
      return basicCheck;
    }

    // Additional validation based on entity type
    if (entityType.toUpperCase() === "ADMIN") {
      // Check if email is already in use
      const existingAdmin = await Admin.findOne({
        email: record.originalData.email,
      });
      if (existingAdmin) {
        return {
          canRestore: false,
          reason: "Email address is already in use by another admin",
        };
      }
    }

    return { canRestore: true, reason: null };
  }

  /**
   * Restore a deleted record
   * @param {string} entityType - Entity type
   * @param {string} recordId - Deleted record ID
   * @param {Object} actorInfo - Info about who performed the restoration
   * @returns {Promise<Object>} Restored record
   */
  static async restoreRecord(entityType, recordId, actorInfo) {
    // Validate restoration first
    const validation = await this.validateRestoration(entityType, recordId);
    if (!validation.canRestore) {
      throw new Error(validation.reason);
    }

    const deletedRecord = await DeletedRecord.findOne({
      id: recordId,
      entityType: entityType.toUpperCase(),
    });

    if (!deletedRecord) {
      throw new Error("Deleted record not found");
    }

    const Model = this.getModel(entityType);

    // Prepare data for restoration
    const restoreData = { ...deletedRecord.originalData };

    // Remove MongoDB internal fields
    delete restoreData._id;
    delete restoreData.__v;

    // Create new record with original data
    const restoredDoc = new Model(restoreData);
    await restoredDoc.save();

    // Mark deleted record as restored
    deletedRecord.isRestored = true;
    deletedRecord.restoredBy = actorInfo.id;
    deletedRecord.restoredByEmail = actorInfo.email;
    deletedRecord.restoredAt = new Date();
    await deletedRecord.save();

    // Log the restoration
    await AuditService.logAction({
      action: AuditLog.ACTIONS.RESTORE,
      entityType: entityType.toUpperCase(),
      entityId: restoredDoc.id || restoredDoc._id.toString(),
      entityName: deletedRecord.entityName,
      previousData: null,
      newData: restoredDoc.toObject(),
      actorId: actorInfo.id,
      actorEmail: actorInfo.email,
      actorRole: actorInfo.role,
      ipAddress: actorInfo.ipAddress,
      userAgent: actorInfo.userAgent,
      description: AuditService.generateDescription(
        AuditLog.ACTIONS.RESTORE,
        entityType,
        deletedRecord.entityName,
      ),
      metadata: { deletedRecordId: recordId },
    });

    return {
      success: true,
      restoredRecord: restoredDoc,
      message: `${entityType} "${deletedRecord.entityName}" has been restored successfully`,
    };
  }

  /**
   * Get deletion statistics
   * @returns {Promise<Object>} Deletion statistics
   */
  static async getStats() {
    const stats = await DeletedRecord.aggregate([
      { $match: { isRestored: false } },
      {
        $group: {
          _id: "$entityType",
          count: { $sum: 1 },
        },
      },
    ]);

    const restoredStats = await DeletedRecord.aggregate([
      { $match: { isRestored: true } },
      {
        $group: {
          _id: "$entityType",
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      pending: stats.reduce((acc, s) => {
        acc[s._id] = s.count;
        acc.total = (acc.total || 0) + s.count;
        return acc;
      }, {}),
      restored: restoredStats.reduce((acc, s) => {
        acc[s._id] = s.count;
        acc.total = (acc.total || 0) + s.count;
        return acc;
      }, {}),
    };
  }
}

module.exports = RestorationService;

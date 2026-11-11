const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * ContactInfo Model
 * Stores contact information displayed on the website.
 * Editable via superadmin dashboard. Only one active document at a time.
 */

const SocialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true }, // e.g., "facebook", "instagram", "twitter", "youtube"
    url: { type: String, required: true },
    label: { type: String, default: "" },
    icon: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const EmailSchema = new mongoose.Schema(
  {
    primary: { type: String, default: "" },
    secondary: { type: String, default: "" },
    support: { type: String, default: "" },
  },
  { _id: false }
);

const PhoneSchema = new mongoose.Schema(
  {
    primary: { type: String, default: "" },
    secondary: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
  },
  { _id: false }
);

const AddressSchema = new mongoose.Schema(
  {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "India" },
    pincode: { type: String, default: "" },
  },
  { _id: false }
);

const MapCoordinatesSchema = new mongoose.Schema(
  {
    latitude: { type: String, default: "" },
    longitude: { type: String, default: "" },
  },
  { _id: false }
);

const OfficeHoursSchema = new mongoose.Schema(
  {
    weekdays: { type: String, default: "" },
    weekends: { type: String, default: "" },
    holidays: { type: String, default: "" },
  },
  { _id: false }
);

const SocialLinksSchema = new mongoose.Schema(
  {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    youtube: { type: String, default: "" },
    linkedin: { type: String, default: "" },
  },
  { _id: false }
);

const ContactInfoSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true },
    // Organization details
    organizationName: { type: String, default: "Anantapur FC" },
    tagline: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    // Contact details - nested objects
    email: { type: EmailSchema, default: () => ({}) },
    phone: { type: PhoneSchema, default: () => ({}) },
    address: { type: AddressSchema, default: () => ({}) },
    // Map coordinates
    mapCoordinates: { type: MapCoordinatesSchema, default: () => ({}) },
    // Social Media - nested object
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },
    // Office hours
    officeHours: { type: OfficeHoursSchema, default: () => ({}) },
    // Status
    isActive: { type: Boolean, default: true },
    // Admin tracking
    lastEditedBy: { type: String, default: "" },
    lastEditedByEmail: { type: String, default: "" },
  },
  { timestamps: true }
);

// ─── Static: Get active contact info ───
ContactInfoSchema.statics.getActiveContactInfo = async function () {
  let contact = await this.findOne({ isActive: true }).sort({ updatedAt: -1 });
  if (!contact) {
    // Create default if none exists
    contact = await this.create({
      organizationName: "Anantapur FC",
      isActive: true,
    });
  }
  return contact;
};

// ─── Static: Upsert contact info (only one active at a time) ───
ContactInfoSchema.statics.upsertContactInfo = async function (data, editorInfo = {}) {
  // Deactivate all existing
  await this.updateMany({}, { $set: { isActive: false } });

  const update = {
    ...data,
    isActive: true,
    lastEditedBy: editorInfo.id || "",
    lastEditedByEmail: editorInfo.email || "",
  };

  return this.findOneAndUpdate(
    { isActive: true },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

module.exports = mongoose.model("ContactInfo", ContactInfoSchema);

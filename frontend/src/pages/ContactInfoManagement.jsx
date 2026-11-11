import { useState, useEffect } from "react";
import { apiService, API_ENDPOINTS } from "../services/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import ToastMessages from "../components/common/ToastMessages";

/**
 * ContactInfoManagement Page (Super Admin)
 * Edit organization contact details: address, phone, email, social links, map coordinates
 */
const ContactInfoManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState({
    organizationName: "Anantapur Sports Complex",
    address: { street: "", city: "Anantapur", state: "Andhra Pradesh", country: "India", pincode: "" },
    phone: { primary: "+91 98765 43210", secondary: "", whatsapp: "" },
    email: { primary: "contact@anantapurfc.com", secondary: "aravind.anubothu13@gmail.com", support: "" },
    socialLinks: { facebook: "", instagram: "", twitter: "", youtube: "", linkedin: "" },
    mapCoordinates: { latitude: "14.6829", longitude: "77.5950" },
    officeHours: { weekdays: "9:00 AM - 6:00 PM", weekends: "10:00 AM - 2:00 PM", holidays: "Closed" },
  });

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3500); };
  const flashError = (msg) => { setError(msg); setTimeout(() => setError(""), 5000); };

  // Fetch current contact info
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const data = await apiService.get(API_ENDPOINTS.CONTACT_INFO);
        const info = data?.contactInfo || data;
        if (info) {
          setFormData(prev => ({
            organizationName: info.organizationName || prev.organizationName,
            address: { ...prev.address, ...info.address },
            phone: { ...prev.phone, ...info.phone },
            email: { ...prev.email, ...info.email },
            socialLinks: { ...prev.socialLinks, ...info.socialLinks },
            mapCoordinates: { ...prev.mapCoordinates, ...info.mapCoordinates },
            officeHours: { ...prev.officeHours, ...info.officeHours },
          }));
        }
      } catch {
        // Keep defaults
      } finally {
        setLoading(false);
      }
    };
    fetchContactInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiService.put(API_ENDPOINTS.CONTACT_INFO, formData);
      flash("Contact info updated successfully!");
    } catch (err) {
      flashError(err.message || "Failed to save contact info");
    } finally {
      setSaving(false);
    }
  };

  const updateNested = (section, key, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-md:p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 max-md:text-xl">Contact Info</h1>
            <p className="text-gray-500 text-sm mt-1">Edit organization contact details shown on the website</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="py-2.5 px-5 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-700 transition-colors cursor-pointer border-none disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Save Changes
          </button>
        </div>

        <ToastMessages error={error} successMsg={successMsg} />

        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          {/* Organization Name */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Organization</h3>
            <div>
              <label className={labelClass}>Organization Name</label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Address</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Street</label>
                <input type="text" value={formData.address.street} onChange={(e) => updateNested("address", "street", e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" value={formData.address.city} onChange={(e) => updateNested("address", "city", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input type="text" value={formData.address.state} onChange={(e) => updateNested("address", "state", e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Country</label>
                  <input type="text" value={formData.address.country} onChange={(e) => updateNested("address", "country", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Pincode</label>
                  <input type="text" value={formData.address.pincode} onChange={(e) => updateNested("address", "pincode", e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Phone</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Primary</label>
                <input type="text" value={formData.phone.primary} onChange={(e) => updateNested("phone", "primary", e.target.value)} className={inputClass} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className={labelClass}>Secondary</label>
                <input type="text" value={formData.phone.secondary} onChange={(e) => updateNested("phone", "secondary", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>WhatsApp</label>
                <input type="text" value={formData.phone.whatsapp} onChange={(e) => updateNested("phone", "whatsapp", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Email</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Primary</label>
                <input type="email" value={formData.email.primary} onChange={(e) => updateNested("email", "primary", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Secondary</label>
                <input type="email" value={formData.email.secondary} onChange={(e) => updateNested("email", "secondary", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Support</label>
                <input type="email" value={formData.email.support} onChange={(e) => updateNested("email", "support", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(formData.socialLinks).map(platform => (
                <div key={platform}>
                  <label className={labelClass}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</label>
                  <input type="url" value={formData.socialLinks[platform]} onChange={(e) => updateNested("socialLinks", platform, e.target.value)} className={inputClass} placeholder={`https://${platform}.com/...`} />
                </div>
              ))}
            </div>
          </div>

          {/* Map Coordinates */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Map Coordinates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Latitude</label>
                <input type="number" step="any" value={formData.mapCoordinates.latitude} onChange={(e) => updateNested("mapCoordinates", "latitude", parseFloat(e.target.value) || "")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Longitude</label>
                <input type="number" step="any" value={formData.mapCoordinates.longitude} onChange={(e) => updateNested("mapCoordinates", "longitude", parseFloat(e.target.value) || "")} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Office Hours */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Office Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Weekdays</label>
                <input type="text" value={formData.officeHours.weekdays} onChange={(e) => updateNested("officeHours", "weekdays", e.target.value)} className={inputClass} placeholder="9:00 AM - 6:00 PM" />
              </div>
              <div>
                <label className={labelClass}>Weekends</label>
                <input type="text" value={formData.officeHours.weekends} onChange={(e) => updateNested("officeHours", "weekends", e.target.value)} className={inputClass} placeholder="10:00 AM - 2:00 PM" />
              </div>
              <div>
                <label className={labelClass}>Holidays</label>
                <input type="text" value={formData.officeHours.holidays} onChange={(e) => updateNested("officeHours", "holidays", e.target.value)} className={inputClass} placeholder="Closed" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="py-3 px-8 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-700 transition-colors cursor-pointer border-none disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Save All Changes
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ContactInfoManagement;

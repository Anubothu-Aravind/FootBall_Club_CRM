import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Map } from "../components/common/Map";
import { apiService, API_ENDPOINTS } from "../services/api";

/**
 * Contact Us Page
 * Full-featured contact page with form, info cards, map, and email integration.
 * Now fetches contact info from backend for dynamic address, phone, email, social links.
 * Follows existing Anantapur FC design system (red-600/orange accent palette).
 */

// Default coordinates (lng, lat)
const DEFAULT_COORDS = [77.5950, 14.6829];

const ContactUs = () => {
  const mapRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  // Contact info from backend
  const [contactInfo, setContactInfo] = useState({
    address: { street: "", city: "Anantapur", state: "Andhra Pradesh", country: "India", pincode: "" },
    phone: { primary: "+91 98765 43210" },
    email: { primary: "contact@anantapurfc.com", secondary: "aravind.anubothu13@gmail.com" },
    socialLinks: {},
    mapCoordinates: { longitude: DEFAULT_COORDS[0], latitude: DEFAULT_COORDS[1] },
    organizationName: "Anantapur Sports Complex",
  });

  // Fetch contact info from backend
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const data = await apiService.get(API_ENDPOINTS.CONTACT_INFO);
        if (data?.contactInfo || data) {
          const info = data.contactInfo || data;
          setContactInfo(prev => ({
            ...prev,
            ...info,
            address: { ...prev.address, ...info.address },
            phone: { ...prev.phone, ...info.phone },
            email: { ...prev.email, ...info.email },
            mapCoordinates: { ...prev.mapCoordinates, ...info.mapCoordinates },
          }));
        }
      } catch {
        // Keep defaults
      }
    };
    fetchContactInfo();
  }, []);

  const mapCoords = [
    contactInfo.mapCoordinates?.longitude || DEFAULT_COORDS[0],
    contactInfo.mapCoordinates?.latitude || DEFAULT_COORDS[1],
  ];

  const fullAddress = [
    contactInfo.address?.street,
    contactInfo.address?.city,
    contactInfo.address?.state,
    contactInfo.address?.country,
  ].filter(Boolean).join(", ");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);

    try {
      await apiService.post(API_ENDPOINTS.CONTACT, formData);
      setStatus({
        type: "success",
        msg: "Message sent successfully. We will get back to you soon.",
      });
      setFormData({
        name: "",
        organization: "",
        phone: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setStatus({
        type: "error",
        msg: err?.message || "Something went wrong. Please try again later.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-orange-50/30 to-white">
      {/* Hero */}
      <section className="relative w-full py-12 px-6 max-md:py-10 max-[480px]:py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 max-md:text-3xl max-[480px]:text-2xl">
            Contact Us
          </h1>
          <p className="text-gray-600 text-base max-md:text-sm leading-relaxed max-w-2xl mx-auto">
            We're here to help. Reach out and we'll get back to you soon.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 pb-8 max-md:px-4 max-[480px]:px-3">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Left - Get in touch (2/5 on desktop, full width on mobile) */}
          <div className="lg:col-span-2 p-8 space-y-6 max-md:p-6 max-[480px]:p-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-5 max-[480px]:text-lg">
                Get in Touch
              </h2>
            </div>

            {/* Contact cards */}
            <div className="space-y-6 max-[480px]:space-y-5">
              {/* Head Office */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 bg-orange-600 rounded-lg flex items-center justify-center max-[480px]:w-10 max-[480px]:h-10">
                  <svg
                    className="w-5 h-5 text-white max-[480px]:w-4 max-[480px]:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base mb-1">
                    Head Office
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed max-[480px]:text-sm">
                    {contactInfo.organizationName || "Anantapur Sports Complex"}
                    <br />
                    {fullAddress || "Anantapur, Andhra Pradesh, India"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 bg-orange-600 rounded-lg flex items-center justify-center max-[480px]:w-10 max-[480px]:h-10">
                  <svg
                    className="w-5 h-5 text-white max-[480px]:w-4 max-[480px]:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base mb-1">
                    Email Us
                  </h3>
                  <a
                    href={`mailto:${contactInfo.email?.primary || "contact@anantapurfc.com"}`}
                    className="text-orange-600 hover:text-orange-700 text-base transition-colors block max-[480px]:text-sm"
                  >
                    {contactInfo.email?.primary || "contact@anantapurfc.com"}
                  </a>
                  {contactInfo.email?.secondary && (
                    <a
                      href={`mailto:${contactInfo.email.secondary}`}
                      className="text-orange-600 hover:text-orange-700 text-base transition-colors block max-[480px]:text-sm"
                    >
                      {contactInfo.email.secondary}
                    </a>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 bg-orange-600 rounded-lg flex items-center justify-center max-[480px]:w-10 max-[480px]:h-10">
                  <svg
                    className="w-5 h-5 text-white max-[480px]:w-4 max-[480px]:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base mb-1">
                    Call Us
                  </h3>
                  <a
                    href={`tel:${(contactInfo.phone?.primary || "+919876543210").replace(/\s/g, '')}`}
                    className="text-gray-600 text-base hover:text-orange-600 transition-colors block max-[480px]:text-sm"
                  >
                    {contactInfo.phone?.primary || "+91 98765 43210"}
                  </a>
                </div>
              </div>
            </div>

            {/* Social icons */}
            <div>
              <h3 className="font-semibold text-gray-900 text-base mb-3">
                Follow Us
              </h3>
              <div className="flex gap-3">
                {[
                  {
                    label: "Facebook",
                    href: "https://facebook.com",
                    d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                  },
                  {
                    label: "Instagram",
                    href: "https://instagram.com",
                    d: "M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z",
                  },
                  {
                    label: "Twitter",
                    href: "https://twitter.com",
                    d: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
                  },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center hover:bg-orange-700 transition-colors"
                    aria-label={s.label}
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={s.d} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Contact form (3/5 on desktop) */}
          <div className="lg:col-span-3 p-8 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 max-md:p-6 max-[480px]:p-5">
            <h2 className="text-xl font-bold text-gray-900 mb-6 max-[480px]:text-lg">
              Send Us a Message
            </h2>

            {/* Status banner */}
            {status && (
              <div
                className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
                  status.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {status.msg}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 max-[480px]:space-y-4"
            >
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-[480px]:gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-base font-medium text-gray-900 mb-2 max-[480px]:text-sm"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all max-[480px]:py-2.5"
                  />
                </div>
                <div>
                  <label
                    htmlFor="organization"
                    className="block text-base font-medium text-gray-900 mb-2 max-[480px]:text-sm"
                  >
                    Organisation
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="Club / School"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all max-[480px]:py-2.5"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-[480px]:gap-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-base font-medium text-gray-900 mb-2 max-[480px]:text-sm"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all max-[480px]:py-2.5"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-base font-medium text-gray-900 mb-2 max-[480px]:text-sm"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all max-[480px]:py-2.5"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-base font-medium text-gray-900 mb-2 max-[480px]:text-sm"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all max-[480px]:py-2.5"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-base font-medium text-gray-900 mb-2 max-[480px]:text-sm"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Write your message here..."
                  rows={5}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none max-[480px]:rows-4"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-orange-600 text-white font-semibold py-3.5 text-base rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed max-[480px]:py-3"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section - compact */}
      <section className="max-w-6xl mx-auto px-6 pb-12 max-md:px-4 max-md:pb-20 max-[480px]:px-3">
        <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200">
          <div className="w-full h-[280px] max-md:h-[200px] max-[480px]:h-[180px]">
            <Map
              ref={mapRef}
              center={mapCoords}
              zoom={14}
              markers={[
                {
                  position: mapCoords,
                  color: "#EA580C",
                  popup: `<div style="padding:6px 8px;text-align:center;font-family:system-ui"><strong style="font-size:13px">${contactInfo.organizationName || "Anantapur Arts College"}</strong><br/><span style="font-size:12px;color:#555">${fullAddress || "Anantapur, Andhra Pradesh, India"}</span></div>`,
                },
              ]}
              className="w-full h-full"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 max-[480px]:flex-col max-[480px]:gap-2">
          <p className="text-gray-600 text-sm">
            {contactInfo.organizationName || "Anantapur Arts College (Govt Degree college)"}, {contactInfo.address?.city || "Anantapur"}, {contactInfo.address?.state || "Andhra Pradesh"}
          </p>
          <a
            href={`https://www.google.com/maps?q=${mapCoords[1]},${mapCoords[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors flex items-center gap-1"
          >
            Open in Google Maps
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;

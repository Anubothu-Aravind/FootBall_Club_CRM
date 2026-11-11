/**
 * FooterSections Component
 * Contains About Us, Gallery, and Contact sections
 * Features hover effects and clean layout
 */
const FooterSections = () => {
  return (
    <section className="w-full bg-white py-16 px-16 max-lg:py-12 max-lg:px-8 max-md:py-10 max-md:px-5 max-[480px]:py-8 max-[480px]:px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-3 gap-10 max-md:grid-cols-1 max-md:gap-6 max-md:text-center">
          {/* About Us */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 m-0 mb-3 max-[480px]:text-base">
              About Us
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed m-0 max-[480px]:text-[13px]">
              Learn about our history, mission, and values
            </p>
          </div>

          {/* Gallery */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 m-0 mb-3 max-[480px]:text-base">
              Gallery
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed m-0 max-[480px]:text-[13px]">
              Explore our moments of victory and team spirit
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 m-0 mb-3 max-[480px]:text-base">
              Contact
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed m-0 max-[480px]:text-[13px]">
              Get in touch with our coaching staff
            </p>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-200 max-md:mt-8">
        <div className="flex justify-between items-center gap-4 text-gray-600 text-sm max-md:flex-col max-md:gap-4 max-md:text-center max-[480px]:text-xs">
          <p>&copy; 2026 Anantapur Football Club. All rights reserved.</p>
          <div className="flex gap-6 max-md:flex-wrap max-md:justify-center max-md:gap-4">
            <a
              href="#"
              className="text-gray-600 no-underline transition-colors duration-200 hover:text-red-600 max-[480px]:text-xs"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-600 no-underline transition-colors duration-200 hover:text-red-600 max-[480px]:text-xs"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-600 no-underline transition-colors duration-200 hover:text-red-600 max-[480px]:text-xs"
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterSections;

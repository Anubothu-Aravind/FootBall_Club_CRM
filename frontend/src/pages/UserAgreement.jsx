import { Link } from "react-router-dom";

/**
 * User Agreement Page (Terms and Conditions)
 * Legal terms of service for Anantapur Football Club
 */
const UserAgreement = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium mb-4 no-underline transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Terms and Conditions
          </h1>
          <p className="text-gray-500">
            Last updated: February 7, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          {/* 1. Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Anantapur Football Club ("ACFC", "we", "us", or "our"). 
              These Terms and Conditions govern your use of our website and services. 
              By accessing or using our platform, you agree to be bound by these terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you do not agree with any part of these terms, please do not use our services.
            </p>
          </section>

          {/* 2. Definitions */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Definitions
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Service:</strong> Refers to the Anantapur FC website and coach portal</li>
              <li><strong>User:</strong> Any individual accessing or using the Service</li>
              <li><strong>Coach:</strong> Authenticated users with access to the coach portal</li>
              <li><strong>Player:</strong> Youth football players registered with ACFC</li>
              <li><strong>Content:</strong> All text, images, videos, and data on the platform</li>
            </ul>
          </section>

          {/* 3. Eligibility */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Eligibility
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use the coach portal, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Be at least 18 years of age</li>
              <li>Be authorized by Anantapur Football Club</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
            </ul>
          </section>

          {/* 4. User Accounts */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. User Accounts and Responsibilities
            </h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">
              4.1 Account Creation
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Coach accounts are created by Super Admins. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Maintaining the confidentiality of your password</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">
              4.2 Account Security
            </h3>
            <p className="text-gray-700 leading-relaxed">
              You must not share your account credentials with others. We reserve the right 
              to suspend or terminate accounts that violate security protocols.
            </p>
          </section>

          {/* 5. Acceptable Use */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Acceptable Use Policy
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Upload or transmit viruses or malicious code</li>
              <li>Collect user information without consent</li>
              <li>Impersonate any person or entity</li>
              <li>Harass, abuse, or harm other users</li>
            </ul>
          </section>

          {/* 6. Player Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Player Data and Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              As a coach, you may have access to player information. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Use player data solely for legitimate coaching purposes</li>
              <li>Maintain confidentiality of all player information</li>
              <li>Comply with all applicable data protection laws</li>
              <li>Not share or disclose player data to third parties</li>
              <li>Report any data breaches immediately</li>
            </ul>
          </section>

          {/* 7. Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Intellectual Property Rights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All content, trademarks, logos, and intellectual property on this Service 
              are owned by Anantapur Football Club or its licensors. You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Copy, reproduce, or distribute any content without permission</li>
              <li>Use ACFC branding for commercial purposes</li>
              <li>Modify or create derivative works from our content</li>
            </ul>
          </section>

          {/* 8. Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the maximum extent permitted by law:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>We provide the Service "as is" without warranties of any kind</li>
              <li>We are not liable for any indirect, incidental, or consequential damages</li>
              <li>Our total liability shall not exceed the fees paid by you (if any)</li>
              <li>We do not guarantee uninterrupted or error-free service</li>
            </ul>
          </section>

          {/* 9. Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Termination
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Suspend or terminate your account at any time for violations</li>
              <li>Remove or modify any content at our discretion</li>
              <li>Refuse service to anyone for any reason</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          {/* 10. Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Changes to These Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update these Terms and Conditions from time to time. Changes will 
              be effective immediately upon posting. Continued use of the Service 
              constitutes acceptance of the updated terms. We will notify users of 
              significant changes via email or a notice on our website.
            </p>
          </section>

          {/* 11. Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the 
              laws of India. Any disputes arising from these terms shall be subject 
              to the exclusive jurisdiction of the courts in Anantapur, Andhra Pradesh.
            </p>
          </section>

          {/* 12. Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 mb-2">
                <strong>Anantapur Football Club</strong>
              </p>
              <p className="text-gray-700 mb-2">
                Anantapur, Andhra Pradesh, India
              </p>
              <p className="text-gray-700 mb-2">
                Email: <a href="mailto:legal@anantapurfc.com" className="text-red-600 hover:text-red-700 no-underline">legal@anantapurfc.com</a>
              </p>
              <p className="text-gray-700">
                Support: <a href="mailto:support@anantapurfc.com" className="text-red-600 hover:text-red-700 no-underline">support@anantapurfc.com</a>
              </p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="mb-8 bg-red-50 p-6 rounded-lg border border-red-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By using the Anantapur Football Club website and services, you acknowledge 
              that you have read, understood, and agree to be bound by these Terms and 
              Conditions and our Privacy Policy.
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-4 justify-between items-center">
          <Link
            to="/privacy-policy"
            className="text-red-600 hover:text-red-700 text-sm font-medium no-underline transition-colors"
          >
            View Privacy Policy →
          </Link>
          <Link
            to="/"
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium no-underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserAgreement;

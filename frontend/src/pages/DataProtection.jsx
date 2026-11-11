import { Link } from "react-router-dom";

/**
 * Data Protection Page (Privacy Policy)
 * Data protection and privacy information for Anantapur Football Club
 */
const DataProtection = () => {
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
            Privacy Policy
          </h1>
          <p className="text-gray-500">
            Last updated: February 7, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Anantapur Football Club ("ACFC", "we", "us", or "our") is committed to 
              protecting your privacy. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our website and services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Please read this privacy policy carefully. If you do not agree with the terms 
              of this privacy policy, please do not access the site.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Information We Collect
            </h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">
              1.1 Personal Information
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect information that you voluntarily provide to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li><strong>Coach Accounts:</strong> Email address, name, role, profile image</li>
              <li><strong>Player Data:</strong> Name, age, age group, gender, position, skill ratings, tournament participation</li>
              <li><strong>Contact Information:</strong> Email addresses for communications</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">
              1.2 Automatically Collected Information
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you access our Service, we may automatically collect:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Operating system information</li>
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Provide, operate, and maintain our services</li>
              <li>Authenticate coaches and manage user accounts</li>
              <li>Track player development and performance</li>
              <li>Organize and manage tournaments</li>
              <li>Send administrative information and updates</li>
              <li>Respond to inquiries and support requests</li>
              <li>Improve and optimize our platform</li>
              <li>Ensure security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* 3. Data Sharing and Disclosure */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Data Sharing and Disclosure
            </h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">
              3.1 We Do Not Sell Your Data
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">
              3.2 Limited Sharing
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>With Coaches:</strong> Authorized coaches can access player data for legitimate coaching purposes</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our platform (e.g., hosting, email services)</li>
              <li><strong>With Consent:</strong> When you give us explicit permission</li>
            </ul>
          </section>

          {/* 4. Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Password hashing using industry-standard algorithms (bcrypt)</li>
              <li>Secure authentication with JWT tokens</li>
              <li>OTP verification for password changes with timing-safe comparison</li>
              <li>Rate limiting to prevent brute force attacks</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and user role management</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              However, no method of transmission over the internet is 100% secure. 
              While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          {/* 5. Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your information for as long as necessary to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Provide our services to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Maintain historical records for club purposes</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              When data is no longer needed, we will securely delete or anonymize it.
            </p>
          </section>

          {/* 6. Cookies and Tracking */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Remember your login session</li>
              <li>Store authentication tokens</li>
              <li>Analyze site usage and improve performance</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You can control cookies through your browser settings. However, disabling 
              cookies may affect the functionality of our Service.
            </p>
          </section>

          {/* 7. Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Your Privacy Rights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Access:</strong> Request access to your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a structured format</li>
              <li><strong>Objection:</strong> Object to processing of your data</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent where we rely on it</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, please contact us at{" "}
              <a href="mailto:privacy@anantapurfc.com" className="text-red-600 hover:text-red-700 no-underline">
                privacy@anantapurfc.com
              </a>
            </p>
          </section>

          {/* 8. Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Children's Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service is designed to manage youth football programs. While we collect 
              information about minor players, this data is entered by authorized coaches 
              and parents/guardians. We do not knowingly collect personal information 
              directly from children under 13 without parental consent. If you believe 
              a child has provided us with personal information without consent, please 
              contact us immediately.
            </p>
          </section>

          {/* 9. Third-Party Links */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Third-Party Links
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service may contain links to third-party websites. We are not responsible 
              for the privacy practices of these external sites. We encourage you to review 
              the privacy policies of any third-party sites you visit.
            </p>
          </section>

          {/* 10. International Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. International Data Transfers
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Your information is primarily stored and processed in India. If you access 
              our Service from outside India, please be aware that your information may 
              be transferred to, stored, and processed in India.
            </p>
          </section>

          {/* 11. Changes to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of 
              significant changes by posting the new policy on this page and updating the 
              "Last updated" date. Continued use of the Service after changes constitutes 
              acceptance of the updated policy.
            </p>
          </section>

          {/* 12. Contact Us */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 mb-2">
                <strong>Data Protection Officer</strong>
              </p>
              <p className="text-gray-700 mb-2">
                Anantapur Football Club
              </p>
              <p className="text-gray-700 mb-2">
                Anantapur, Andhra Pradesh, India
              </p>
              <p className="text-gray-700 mb-2">
                Email: <a href="mailto:privacy@anantapurfc.com" className="text-red-600 hover:text-red-700 no-underline">privacy@anantapurfc.com</a>
              </p>
              <p className="text-gray-700">
                General: <a href="mailto:contact@anantapurfc.com" className="text-red-600 hover:text-red-700 no-underline">contact@anantapurfc.com</a>
              </p>
            </div>
          </section>

          {/* Summary Box */}
          <section className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Privacy Summary
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>We do not sell your personal information</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>We use industry-standard security measures</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>You have rights to access, correct, and delete your data</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>We only share data when necessary or with your consent</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-4 justify-between items-center">
          <Link
            to="/terms-and-conditions"
            className="text-red-600 hover:text-red-700 text-sm font-medium no-underline transition-colors"
          >
            View Terms and Conditions →
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

export default DataProtection;

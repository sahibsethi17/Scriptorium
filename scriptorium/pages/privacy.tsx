// GENERATED WITH CHATGPT (PROMPT: Give a privacy policy page for a website)

import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-800 text-black dark:text-white py-12 px-6 md:px-20">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="mb-4">
            Your privacy is important to us. This Privacy Policy explains how we
            collect, use, and protect your information when you use our website,
            services, and products.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information that you provide directly to us, such as when
            you create an account, submit a form, or contact us. This information
            may include your name, email address, phone number, and any other
            details you provide.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
          <p className="mb-4">
            We may use your information to:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>Provide and improve our services</li>
            <li>Respond to your inquiries or support requests</li>
            <li>Send you updates, promotional content, or notifications</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2">3. Sharing Your Information</h2>
          <p className="mb-4">
            We do not sell or share your personal information with third parties
            except as necessary to provide our services (e.g., payment processors)
            or comply with legal requirements.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">4. Cookies and Tracking</h2>
          <p className="mb-4">
            Our website may use cookies and similar tracking technologies to
            improve your experience. You can manage your cookie preferences
            through your browser settings.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">5. Data Security</h2>
          <p className="mb-4">
            We take reasonable measures to protect your information from
            unauthorized access, use, or disclosure. However, no method of
            transmission over the internet is 100% secure, and we cannot
            guarantee absolute security.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">6. Your Rights</h2>
          <p className="mb-4">
            You have the right to access, update, or delete your personal
            information. Please contact us at [your contact email] to exercise
            these rights.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">7. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. Any changes will
            be posted on this page with an updated effective date.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">8. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy or our practices,
            please contact us at:
          </p>
          <address className="not-italic">
            <p>Email: support@yourdomain.com</p>
            <p>Phone: +1 (123) 456-7890</p>
            <p>Address: 123 Main Street, City, Country</p>
          </address>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
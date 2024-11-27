import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Contact: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Contact Us</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            For inquiries, please email us at: <br />
            <a
              href="mailto:scriptoriumproject123@gmail.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              scriptoriumproject123@gmail.com
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
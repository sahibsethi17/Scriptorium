import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Left Section: Site Links */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8 mb-4 md:mb-0">
            <a
              href="/"
              className="hover:text-blue-400 transition-colors duration-300 hover:underline"
            >
              Home
            </a>
            <a
              href="/about"
              className="hover:text-blue-400 transition-colors duration-300 hover:underline"
            >
              About
            </a>
            <a
              href="/contact"
              className="hover:text-blue-400 transition-colors duration-300 hover:underline"
            >
              Contact
            </a>
            <a
              href="/privacy"
              className="hover:text-blue-400 transition-colors duration-300 hover:underline"
            >
              Privacy Policy
            </a>
          </div>

          {/* Middle Section: Social Media Links */}
          <div className="flex space-x-6 mb-4 md:mb-0">
            {/* GitHub Icon */}
            <a
              href="https://github.com/your-github"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-125 hover:text-blue-400 transition-transform duration-300"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.166 6.84 9.49.5.09.68-.22.68-.48v-1.68c-2.78.61-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.45-1.1-1.45-.9-.62.07-.62.07-.62 1 .07 1.52 1.03 1.52 1.03.89 1.52 2.33 1.08 2.9.83.09-.64.34-1.09.61-1.34-2.22-.25-4.56-1.11-4.56-4.92 0-1.09.39-1.98 1.03-2.67-.1-.25-.45-1.27.1-2.66 0 0 .84-.27 2.75 1.03A9.38 9.38 0 0112 7.38c.85.004 1.7.114 2.5.33 1.91-1.3 2.75-1.03 2.75-1.03.55 1.39.2 2.41.1 2.66.64.69 1.03 1.58 1.03 2.67 0 3.82-2.35 4.67-4.58 4.92.35.3.65.89.65 1.8v2.67c0 .26.18.57.69.48A10 10 0 0022 12c0-5.52-4.48-10-10-10z"
                  clipRule="evenodd"
                />
              </svg>
            </a>

            {/* YouTube Icon */}
            <button
              onClick={() =>
                window.open(
                  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  "_blank"
                )
              }
              className="hover:scale-125 hover:text-red-400 transition-transform duration-300"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23.498 6.186c-.272-1.031-1.08-1.839-2.112-2.11C19.437 3.5 12 3.5 12 3.5s-7.437 0-9.386.576c-1.031.271-1.839 1.08-2.11 2.11C.5 8.136.5 12 .5 12s0 3.864.504 5.814c.271 1.031 1.079 1.839 2.11 2.11C4.563 20.5 12 20.5 12 20.5s7.437 0 9.386-.576c1.032-.271 1.84-1.079 2.112-2.11.504-1.95.504-5.814.504-5.814s0-3.864-.504-5.814zM9.75 15.02V8.98l6.5 3.02-6.5 3.02z"
                />
              </svg>
            </button>
          </div>

          {/* Right Section: Copyright */}
          <div className="text-sm text-gray-400 hover:text-gray-200 transition-colors duration-300">
            &copy; {new Date().getFullYear()} Scriptorium. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
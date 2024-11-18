// pages/LandingPage.tsx
import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-col md:flex-row items-center justify-center h-[calc(100vh-64px)] px-8 md:px-16 py-12 bg-gray-50">
        {/* Left Content */}
        <div className="flex-1 md:mr-8">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-4 animate-fade-slide-left">
            Welcome to Scriptorium
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 animate-fade-slide-up">
            Scriptorium is your all-in-one online code editor with support for multiple languages including Java, JavaScript, C, C++, Python, Ruby, PHP, Go, and Rust. Collaborate seamlessly with other users, build off templates, and connect through blogs and comments. Customize your profile and take your coding experience to the next level.
          </p>
          <button
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 animate-fade-slide-up"
            onClick={() => window.location.href = "/code_editor"}
          >
            Get Started
          </button>
        </div>

        {/* Right Image Section */}
        <div className="flex-1 flex justify-center items-center animate-slide-in-right">
          <img
            src="/images/scriptorium.jpg"
            alt="Scriptorium"
            className="w-full max-w-md"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;

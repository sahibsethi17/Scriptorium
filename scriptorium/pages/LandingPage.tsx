import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <Navbar />
      <div className="flex flex-col md:flex-row items-center justify-center h-[calc(100vh-64px)] px-8 md:px-16 py-12">
        {/* Left Content */}
        <div className="flex-1 md:mr-8 text-center md:text-left animate-fade-slide-left">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            Welcome to <span className="text-yellow-300">Scriptorium</span>
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Scriptorium is your all-in-one online code editor supporting
            multiple languages like Java, Python, and more. Collaborate
            seamlessly, customize your profile, and connect with others in an
            engaging environment.
          </p>
          <button
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-green-500 font-semibold rounded-lg transform hover:scale-105 hover:shadow-lg hover:shadow-blue-400/50 transition duration-300 ease-in-out"
            onClick={() => (window.location.href = "/code_editor")}
          >
            Get Started
          </button>
        </div>

        {/* Right Image Section */}
        <div className="flex-1 flex justify-center items-center animate-slide-in-right">
          <img
            src="/images/scriptorium.jpg"
            alt="Scriptorium"
            className="w-full max-w-md rounded-lg shadow-lg shadow-gray-900/50"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
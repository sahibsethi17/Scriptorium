// pages/signup.tsx
import React, { useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    avatar: "man.png",
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleAvatarSelect = (avatar: string) => {
    setFormData({ ...formData, avatar });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      await axios.post("/api/users/signup", formData);
      setSuccessMessage("Account created successfully! Please log in.");
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 dark:text-white">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md dark:bg-gray-600 dark:text-white">
          <h2 className="text-2xl font-bold text-black text-center mb-6 dark:text-white">Sign Up</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-500"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-500"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-500"
              required
            />
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-500"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-500"
              required
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-500"
              required
            />

            {/* Avatar Selection */}
            <div className="flex justify-around items-center mt-4">
              <div
                className={`p-2 border-2 rounded-lg cursor-pointer ${
                  formData.avatar === "man.png" ? "border-blue-600" : "border-gray-300"
                }`}
                onClick={() => handleAvatarSelect("man.png")}
              >
                <img
                  src="/uploads/avatars/man.png"
                  alt="Man Avatar"
                  className="w-16 h-16 rounded-full"
                />
              </div>
              <div
                className={`p-2 border-2 rounded-lg cursor-pointer ${
                  formData.avatar === "woman.png" ? "border-blue-600" : "border-gray-300"
                }`}
                onClick={() => handleAvatarSelect("woman.png")}
              >
                <img
                  src="/uploads/avatars/woman.png"
                  alt="Woman Avatar"
                  className="w-16 h-16 rounded-full"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Signup;

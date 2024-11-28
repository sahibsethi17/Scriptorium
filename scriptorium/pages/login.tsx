import React, { useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useRouter } from "next/router";
import { useAuth } from "../src/components/AuthContext";

const Login: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setIsLoggedIn } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/login", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const accessToken = response.data?.accessToken;
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("userId", response.data.userId);

        setIsLoggedIn(true);

        // Dispatch custom event to notify the app of login status change
        window.dispatchEvent(new Event("loginStatusChange"));

        // Redirect to the home page
        router.push("/");
      } else {
        throw new Error("No access token received.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 dark:text-white">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md dark:bg-gray-600 dark:text-white">
          <h2 className="text-2xl font-bold text-black dark:text-white text-center mb-6">Log In</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <button
              type="submit"
              className="w-full p-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useAuth } from "./components/AuthContext";

const Profile: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    avatar: "man.png",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data using the user ID from localStorage
  useEffect(() => {
    // If the login status is still unknown, wait
    if (isLoggedIn === null) {
      return;
    }

    // If user is not logged in, redirect to login page
    if (!isLoggedIn) {
      console.log("User is not authenticated. Redirecting to login page.");
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId"); // Retrieve user ID from localStorage

        if (!accessToken || !userId) {
          console.log("Access token or user ID is missing. Redirecting to login page.");
          router.push("/login");
          return;
        }

        // Make the request to fetch the user data
        const response = await axios.get(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        });

        const userData = response.data.user;
        setUser(userData);
        setFormData({
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber.toString(),
          avatar: userData.avatar || "man.png",
        });
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch user data:", err);
        setError("Failed to load user data.");
        setLoading(false);
      }
    };

    fetchUser();
  }, [isLoggedIn, router]);

  // Show loading state
  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  // Show error state
  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
        <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md">
          <div className="flex items-center mb-6">
            <img
              src={`/uploads/avatars/${formData.avatar}`}
              alt="User Avatar"
              className="w-20 h-20 rounded-full mr-4"
            />
            <h1 className="text-3xl font-bold">
              {user.firstName} {user.lastName}
            </h1>
          </div>

          <form className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              className="w-full p-3 border rounded-lg"
              readOnly
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              className="w-full p-3 border rounded-lg"
              readOnly
            />
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              className="w-full p-3 border rounded-lg"
              readOnly
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              className="w-full p-3 border rounded-lg"
              readOnly
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              className="w-full p-3 border rounded-lg"
              readOnly
            />
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
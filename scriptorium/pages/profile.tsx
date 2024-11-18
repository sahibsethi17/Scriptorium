import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useAuth } from "./components/AuthContext";

const Profile: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user data using the user ID from localStorage
  useEffect(() => {
    if (isLoggedIn === null) {
      return;
    }

    // if (!isLoggedIn) {
    //   router.push("/login");
    //   return;
    // }

    const fetchUser = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");

        if (!accessToken || !userId) {
          router.push("/login");
          return;
        }

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
        setError("Failed to load user data.");
        setLoading(false);
      }
    };

    fetchUser();
  }, [isLoggedIn, router]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle avatar change
  const handleAvatarChange = (avatar: string) => {
    setFormData({ ...formData, avatar });
  };

  // Handle form submission for updating user data
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");

      if (!accessToken || !userId) {
        router.push("/login");
        return;
      }

      await axios.put(
        `/api/users/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );

      setSuccessMessage("Profile updated successfully!");
    } catch (err: any) {
      setError("Failed to update profile.");
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");

      if (!accessToken || !userId) {
        router.push("/login");
        return;
      }

      setIsLoggedIn(false);

      await axios.delete(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });

      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      router.push("/");
    } catch (err: any) {
      setError("Failed to delete account.");
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
        <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
          {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
          <form onSubmit={handleUpdate} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border text-black rounded-lg"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border text-black rounded-lg"
            />
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 border text-black rounded-lg"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 border text-black rounded-lg"
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-3 border text-black rounded-lg"
            />

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleAvatarChange("man.png")}
                className={`p-2 rounded-lg ${formData.avatar === "man.png" ? "border-2 border-blue-500" : ""}`}
              >
                <img src="/uploads/avatars/man.png" alt="Man Avatar" className="w-16 h-16" />
              </button>
              <button
                type="button"
                onClick={() => handleAvatarChange("woman.png")}
                className={`p-2 rounded-lg ${formData.avatar === "woman.png" ? "border-2 border-blue-500" : ""}`}
              >
                <img src="/uploads/avatars/woman.png" alt="Woman Avatar" className="w-16 h-16" />
              </button>
            </div>

            <button
              type="submit"
              className="w-full p-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Update Profile
            </button>
          </form>

          <button
            onClick={handleDeleteAccount}
            className="w-full p-3 mt-6 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
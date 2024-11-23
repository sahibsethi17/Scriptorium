import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useAuth } from "./AuthContext";
import axiosInstance from "@/utils/axiosInstance";

interface User {
  avatar: string;
  name?: string;
  email?: string;
}

const Navbar: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data including the avatar
  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      if (isLoggedIn && userId && accessToken) {
        try {
          const response = await axiosInstance.get(`/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          });

          const userData = response.data.user; // Assuming the response contains `user` object
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userId");
            setIsLoggedIn(false);
            router.push("/login");
          }
        }
      }
    };

    fetchUser();
  }, [isLoggedIn, setIsLoggedIn]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      setIsLoggedIn(false);
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-background text-foreground px-6 py-4 flex justify-between items-center shadow-md dark:bg-gray-900 dark:text-white">
      <div
        className="text-2xl font-bold cursor-pointer hover:scale-110 transition-transform duration-300"
        onClick={() => router.push("/")}
      >
        Scriptorium
      </div>
      <div className="flex space-x-4 items-center">
        {isLoggedIn ? (
          <>
            <a
              href="/blogs"
              className="hover:text-blue-400 transition-colors duration-300 hover:underline"
            >
              Blogs
            </a>
            {user && user.avatar ? (
              <div
                className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition duration-300"
                onClick={() => router.push("/profile")}
              >
                <img
                  src={`../../uploads/avatars/${user.avatar}`}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <a
                href="/profile"
                className="hover:text-blue-400 transition-colors duration-300 hover:underline"
              >
                Profile
              </a>
            )}
            <button
              onClick={handleLogout}
              className="hover:text-red-400 transition-transform duration-300 hover:scale-105"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a
              href="/login"
              className="hover:text-blue-400 transition-colors duration-300 hover:underline"
            >
              Login
            </a>
            <a
              href="/signup"
              className="hover:text-blue-400 transition-colors duration-300 hover:underline"
            >
              Signup
            </a>
            <a
              href="/blogs"
              className="hover:text-blue-400 transition-colors duration-300 hover:underline"
            >
              Blogs
            </a>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
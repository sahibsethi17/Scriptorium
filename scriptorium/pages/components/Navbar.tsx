// components/Navbar.tsx
import React from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useAuth } from "./AuthContext";

const Navbar: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      localStorage.removeItem("accessToken");
      setIsLoggedIn(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold cursor-pointer" onClick={() => router.push("/")}>
        Scriptorium
      </div>
      <div className="flex space-x-4" id="nav-links">
        {isLoggedIn ? (
          <>
            <a href="/profile" className="hover:text-blue-400">
              Profile
            </a>
            <a href="/blogs" className="hover:text-blue-400">
              Blogs
            </a>
            <a href="/templates" className="hover:text-blue-400">
              Templates
            </a>
            <button onClick={handleLogout} className="hover:text-red-400">
              Logout
            </button>
          </>
        ) : (
          <>
            <a href="/login" className="hover:text-blue-400">
              Login
            </a>
            <a href="/signup" className="hover:text-blue-400">
              Signup
            </a>
            <a href="/blogs" className="hover:text-blue-400">
              Blogs
            </a>
            <a href="/templates" className="hover:text-blue-400">
              Templates
            </a>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
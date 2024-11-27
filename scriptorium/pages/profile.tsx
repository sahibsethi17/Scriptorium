import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useRouter } from "next/router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useAuth } from "./components/AuthContext";

interface Template {
  id: number;
  title: string;
  explanation: string;
  tags: string;
  code: string;
  stdin: string;
  language: string;
  createdAt: string;
}

interface Blog {
  id: number;
  title: string;
  description: string;
  tags: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
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

  useEffect(() => {
    if (isLoggedIn === null) {
      return;
    }

    const fetchUser = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");

        if (!accessToken || !userId) {
          router.push("/login");
          return;
        }

        const response = await axiosInstance.get(`/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        });

        /* return res.status(200).json({
          user: JSON.parse(serializedUser),
          templates: userWithoutSensitiveFields.Template || [],
          blogs: userWithoutSensitiveFields.Blog || [],
        });
        */

        const userData = response.data.user;
        setUser(userData);
        setTemplates(response.data.templates || []);
        setBlogs(response.data.blogs || []);
        console.log(templates);
        console.log(blogs);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (avatar: string) => {
    setFormData({ ...formData, avatar });
  };

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

      await axiosInstance.put(
        `/users/${userId}`,
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

      await axiosInstance.delete(`/users/${userId}`, {
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
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 dark:bg-gray-800 dark:text-white">
        <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md dark:bg-gray-600 dark:text-white">
          <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
          {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
          <form onSubmit={handleUpdate} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-500"
            />
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-500"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-500"
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-500"
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

        {/* Templates Section */}
        <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md mt-8 dark:bg-gray-600 dark:text-white">
          <h2 className="text-2xl font-bold mb-4">Templates</h2>
          <ul>
            {templates.map((template) => (
              <li key={template.id} className="border-b pb-4 mb-4">
                <p><strong>ID:</strong> {template.id}</p>
                <p><strong>Title:</strong> {template.title}</p>
                <p><strong>Explanation:</strong> {template.explanation}</p>
                <p><strong>Tags:</strong> {template.tags}</p>
                <p><strong>Code:</strong> <pre>{template.code}</pre></p>
                <p><strong>Stdin:</strong> {template.stdin}</p>
                <p><strong>Language:</strong> {template.language}</p>
                <p><strong>Created At:</strong> {new Date(template.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Blogs Section */}
        <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md mt-8 dark:bg-gray-600 dark:text-white">
          <h2 className="text-2xl font-bold mb-4">Blogs</h2>
          <ul>
            {blogs.map((blog) => (
              <li key={blog.id} className="border-b pb-4 mb-4">
                <p><strong>ID:</strong> {blog.id}</p>
                <p><strong>Title:</strong> {blog.title}</p>
                <p><strong>Description:</strong> {blog.description}</p>
                <p><strong>Tags:</strong> {blog.tags}</p>
                <p><strong>Created At:</strong> {new Date(blog.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
import { useAuth } from "pages/components/AuthContext";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BlogForm from "../components/BlogForm";

const CreateBlog = () => {
  const { isLoggedIn } = useAuth();
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken") || ""; // Fetch token from local storage
    setAccessToken(token);
  }, []);

  const handleSubmit = async (title: string, description: string, tags: string) => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(`/api/blogs/create`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ title, description, tags }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      const data = await response.json();
      window.location.href = `/blogs/${data.id}`;
    } catch (error) {
      console.error("Error creating blog:", error);
      alert("Failed to create blog. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 dark:text-white">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6 text-blue-600 text-center mt-4">
        Create a New Blog
      </h1>
      <BlogForm onSubmit={handleSubmit}/>
      <Footer />
    </div>
  );
};

export default CreateBlog;

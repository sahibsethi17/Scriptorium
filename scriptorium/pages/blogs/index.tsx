// MODIFIED FROM CHATGPT

import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // Import useRouter for navigation
import Pagination from "pages/components/Pagination";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Blogs = () => {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [searchParams, setSearchParams] = useState({
    id: "",
    title: "",
    description: "",
    tags: "",
    order: "",
    templateIds: "",
    pageNum: 1,
    isReported: false,
  });
  const [userRole, setUserRole] = useState<string | null>(null); // Store user role
  const [accessToken, setAccessToken] = useState("");
  const [totalPages, setTotalPages] = useState(1); // Total pages for pagination
  const [error, setError] = useState("");

  // Helper to sync URL query string
  const syncURL = (params: Record<string, any>) => {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== "") acc[key] = String(value); // Avoid empty values in the URL
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    // Push new state to the browser's URL bar without reloading
    router.replace({ pathname: "/blogs", search: queryString }, undefined, {
      shallow: true,
    });
  };

  // Fetch blogs based on searchParams
  const fetchBlogs = async () => {
    setError("");
    try {
      const query = new URLSearchParams(
        Object.entries(searchParams).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      ).toString();

      const res = await fetch(`/api/blogs?${query}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setBlogs(data.blogs); // Make sure to set the blogs correctly
        setTotalPages(data.totalPages); // Set the totalPages correctly
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, pageNum: page }));
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSearchParams({
      ...searchParams,
      pageNum: 1,
      [e.target.name]: e.target.value,
    });
  };

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/user-role", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setUserRole(data.role);
      }
    } catch (err: any) {
      setError("Failed to fetch user role.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setAccessToken(token); // Set accessToken before fetching the user role
      fetchUserRole();
    } else {
      setError("You are not logged in.");
    }

    // Populate searchParams from the URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const params: Record<string, any> = {};
    urlParams.forEach((value, key) => {
      params[key] = value;
    });

    setSearchParams((prev) => ({ ...prev, ...params }));
  }, []);

  useEffect(() => {
    syncURL(searchParams); // Sync URL query string with state
    fetchBlogs(); // Fetch blogs based on updated searchParams
  }, [searchParams]);

  return (
      <div
        className={`min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800 dark:text-white`}
      >
        <Navbar />

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between max-w-4xl mx-auto mt-4 mb-4">
            <button
              onClick={() => (window.location.href = "/blogs/create")}
              className="py-2 px-4 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition text-sm sm:text-base sm:py-2 sm:px-4 md:text-base md:py-3 md:px-6"
            >
              Create New Blog
            </button>
            <h1 className="pr-44 text-3xl font-bold text-blue-600 flex-1 text-center">
              Search Blogs
            </h1>
          </div>

          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 dark:bg-gray-600 dark:text-white">
            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                name="title"
                value={searchParams.title}
                onChange={handleInputChange}
                placeholder="Blog Title"
                className="search-input rounded bg-gray-100 dark:bg-gray-900 dark:text-white"
              />
              <input
                type="text"
                name="description"
                value={searchParams.description}
                onChange={handleInputChange}
                placeholder="Blog Description"
                className="search-input rounded bg-gray-100 dark:bg-gray-900 dark:text-white"
              />
              <input
                type="text"
                name="tags"
                value={searchParams.tags}
                onChange={handleInputChange}
                placeholder="Blog Tags (comma-separated)"
                className="search-input rounded bg-gray-100 dark:bg-gray-900 dark:text-white"
              />
              <input
                type="text"
                name="templateIds"
                value={searchParams.templateIds}
                onChange={handleInputChange}
                placeholder="Template IDs"
                className="search-input md:col-span-3 rounded bg-gray-100 dark:bg-gray-900 dark:text-white"
              />
              <div className="flex flex-col md:col-span-3">
                <label className="text-black mb-2 font-medium dark:text-white">
                  Order By:
                </label>
                <select
                  name="order"
                  value={searchParams.order}
                  onChange={handleInputChange}
                  className="search-input rounded bg-gray-100 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">Newest</option>
                  <option value="upvotes">Upvotes</option>
                  <option value="downvotes">Downvotes</option>
                  {userRole === "ADMIN" && (
                    <option value="reports">Reports</option>
                  )}
                </select>
              </div>
            </div>

            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>

          {/* Blog Posts */}
          <div className="max-w-4xl mx-auto mt-8">
            {blogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogs.map((blog: any) => (
                  <button
                    key={blog.id}
                    className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg dark:bg-gray-600 dark:text-white hover:scale-105 hover:shadow-blue-400/50 transition duration-300 ease-in-out"
                    onClick={() => (window.location.href = `/blogs/${blog.id}`)}
                  >
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 break-words">
                      {blog.title}
                    </h2>
                    <p className="text-gray-600 mt-2 dark:text-white break-words">
                      {blog.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-4 dark:text-gray-400">
                      <span className="text-black dark:text-white">
                        Upvotes: {blog.upvotes}
                      </span>
                      <span className="text-black dark:text-white">
                        Downvotes: {blog.downvotes}
                      </span>
                    </div>

                    {/* Display reports count for admins */}
                    {userRole === "ADMIN" && (
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                        Reports: {blog.reports}
                      </div>
                    )}

                    <div className="text-sm text-gray-400 mt-2 dark:text-gray-200">
                      Tags:
                      {blog.tags.split(",").map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full m-0.5"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-red-600 text-center">No blogs found.</p>
            )}
          </div>
        </div>

        {/* Pagination */}
        {blogs.length > 0 && (
          <div className="mb-4">
            <Pagination
              currentPage={searchParams.pageNum}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Footer */}
        <Footer />
      </div>
  );
};

export default Blogs;

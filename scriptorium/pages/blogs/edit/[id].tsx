import { useAuth } from "pages/components/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import BlogForm from "../../components/BlogForm";

const EditBlog = () => {
  const { isLoggedIn } = useAuth();
  const [accessToken, setAccessToken] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [blog, setBlog] = useState<any>(null); // Store the blog details
  const [loading, setLoading] = useState(true); // Track loading state
  const router = useRouter();
  const { id } = router.query; // Get the blog id from the URL

  useEffect(() => {
    // Get the access token and logged-in user ID from localStorage
    const token = localStorage.getItem("accessToken") || "";
    setAccessToken(token);
    const userId = localStorage.getItem("userId") || "";
    setLoggedInUserId(userId);

    if (id) {
      // Fetch blog data based on the blog id from the URL
      const fetchBlog = async () => {
        try {
          const response = await fetch(`/api/blogs/?id=${id}`);

          if (!response.ok) {
            throw new Error("Failed to fetch blog data");
          }

          let data = await response.json();
          data = data.blogs[0];

          // Check if the logged-in user is the owner of the blog
          if (data.userId !== Number(loggedInUserId)) {
            alert("You do not have permission to edit this blog.");
            router.push("/"); // Redirect to the home page if not authorized
            return;
          }
          setBlog(data);
        } catch (error) {
          console.error("Error fetching blog data:", error);
          alert("Failed to load blog data.");
        } finally {
          setLoading(false); // Set loading to false once the data is fetched
        }
      };

      fetchBlog();
    }
  }, [id, accessToken, loggedInUserId, router]);

  const handleSubmit = async (title: string, description: string, tags: string) => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
  
    try {
      const response = await fetch(`/api/blogs/edit`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({
          title,
          description,
          tags,
          id: Number(id), // Ensure that id is part of the body
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }
  
      const data = await response.json();
      console.log('BLOG DATA: ' + data);
      window.location.href = `/blogs/${data.id}`; // Redirect to the updated blog page
    } catch (error) {
      console.error("Error editing blog:", error);
      alert("Failed to edit blog. Please try again.");
    }
  };
  

  // Add a loading state check to prevent rendering the BlogForm while fetching
  if (loading) {
    return <div>Loading...</div>; // Show loading message until the blog data is fetched
  }

  if (!blog) {
    return <div>No blog found for the provided ID.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 dark:text-white">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6 text-blue-600 text-center mt-4">
        Edit Blog
      </h1>
      {/* Ensure that the BlogForm is only rendered once the blog data is available */}
      <BlogForm
        initialTitle={blog.title}
        initialDescription={blog.description}
        initialTags={blog.tags}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EditBlog;

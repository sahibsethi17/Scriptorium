import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../components/AuthContext";
import Footer from "pages/components/Footer";

interface Blog {
  id: number;
  userId: number;
  title: string;
  description: string;
  tags: string;
  upvotes: number;
  downvotes: number;
  reports: number;
  createdAt: string;
  hidden: boolean;
  userUpvoted: boolean;
  userDownvoted: boolean;
}

interface Comment {
  id: number;
  userId: number;
  content: string;
  upvotes: number;
  downvotes: number;
  reports: number;
  createdAt: string;
  parentId: number | null;
  blogId: number;
  hidden: boolean;
}

const BlogPage = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { id } = router.query;
  const [blogPost, setBlog] = useState<Blog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commentsOrder, setCommentsOrder] = useState("");
  const [comments, setComments] = useState([]);
  const [accessToken, setAccessToken] = useState("");

  const fetchBlogPost = async () => {
    try {
      const response = await fetch(`/api/blogs/?id=${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setBlog(data.blogs[0]);
    } catch (err) {
      setError(`Error fetching blog post: ${err}`);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/blogs/comments/?blogId=${id}&order=`);
      const data = await response.json();
      setComments(data.comments);
    } catch (err) {
      setError(`Error fetching comments: ${err}`);
    }
  };

  const handleUpvote = async () => {
    try {
      if (!isLoggedIn) {
        window.location.href = "/login";
        return;
      }
      let diff = blogPost.userUpvoted ? -1 : 1;
      const upvote = await fetch(`/api/blogs/upvote`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ id: blogPost.id, diff }),
      });
      if (!upvote.ok) {
        const errorText = await upvote.text(); // Get the raw response text
        throw new Error(
          `HTTP error! Status: ${upvote.status}, Message: ${errorText}`
        );
      }
      const response = await fetch(`/api/blogs/?id=${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setBlog(data.blogs[0]);
    } catch (err) {
      setError(`Error upvoting: ${err}`);
    }
  };

  const handleDownvote = async () => {
    try {
      if (!isLoggedIn) {
        window.location.href = "/login";
        return;
      }
      let diff = blogPost.userDownvoted ? -1 : 1;
      const downvote = await fetch(`/api/blogs/downvote`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ id: blogPost.id, diff }),
      });
      console.log(downvote);
      if (!downvote.ok) {
        const errorText = await downvote.text(); // Get the raw response text
        throw new Error(
          `HTTP error! Status: ${downvote.status}, Message: ${errorText}`
        );
      }
      const response = await fetch(`/api/blogs/?id=${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setBlog(data.blogs[0]);
    } catch (err) {
      setError(`Error downvoting: ${err}`);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBlogPost();
      // fetchComments();
    }
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setAccessToken(token);
    }
  }, [id]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!blogPost) {
    return <div>Loading...</div>;
  }

  // GENERATED WITH CHATGPT
  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center">
        <div className="text-left w-full max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg border border-gray-200 mt-8 dark:bg-gray-600">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {blogPost.title}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-white">
            {blogPost.description}
          </p>

          <div className="flex items-center mt-4 text-sm text-gray-500 dark:text-white">
            <p>Posted by User {blogPost.userId}</p>
            <span className="mx-2">•</span>
            <p>
              {new Date(blogPost.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-white mb-1">
              Tags:
            </h3>
            {blogPost.tags.split(",").map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full m-0.5"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center cursor-pointer transition-all duration-300 p-2 rounded-md ${
                  blogPost.userUpvoted ? "bg-green-100" : "hover:bg-green-100"
                }`}
                onClick={handleUpvote}
              >
                <img
                  src="https://www.svgrepo.com/show/21106/thumbs-up.svg"
                  alt="thumbs-up"
                  className="w-6 h-6"
                />
                <span className="ml-2 text-lg font-semibold text-green-600">
                  {blogPost.upvotes}
                </span>
              </div>

              <div
                className={`flex items-center cursor-pointer transition-all duration-300 p-2 rounded-md ${
                  blogPost.userDownvoted ? "bg-red-100" : "hover:bg-red-100"}`}
                onClick={handleDownvote}
              >
                <img
                  src="https://www.svgrepo.com/show/56144/thumb-down.svg"
                  alt="thumbs-down"
                  className="w-6 h-6"
                />
                <span className="ml-2 text-lg font-semibold text-red-600">
                  {blogPost.downvotes}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;

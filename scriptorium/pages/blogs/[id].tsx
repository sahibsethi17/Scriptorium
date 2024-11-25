import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../components/AuthContext";
import Footer from "pages/components/Footer";
import Pagination from "pages/components/Pagination";
import Rating from "pages/components/Rating";

interface Blog {
  id: number;
  userId: number;
  username: string;
  avatar: string;
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
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [accessToken, setAccessToken] = useState("");
  const [commentContent, setCommentContent] = useState("");

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

  const fetchComments = async (page: number = 1) => {
    try {
      const response = await fetch(
        `/api/blogs/comments/?blogId=${id}&pageNum=${page}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setComments(data.comments);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(`Error fetching comments: ${err}`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchComments(page);
  };

  const handleBlogUpvote = async () => {
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

  const handleBlogDownvote = async () => {
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

  const handleCreateComment = async () => {
    try {
      await fetch(`/api/blogs/comments/create`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ blogId: blogPost.id, content: commentContent }),
      });
      await fetchComments();
    } catch (err) {
      setError(`Error commenting: ${err}`);
    }
  };

  const handleCommentUpvote = async (commentId: number) => {
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
  }

  // const handleCommentDownvote = async (commentId: number) => {

  // }

  useEffect(() => {
    if (id) {
      fetchBlogPost();
      fetchComments();
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
          <span className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {blogPost.title}
            </h2>
            <div>
              <div className="flex flex-col text-sm text-gray-500 dark:text-white">
                <div className="flex items-center">
                  <p className="mr-2">Posted by {blogPost.username}</p>
                  <img
                    src={`../../uploads/avatars/${blogPost.avatar}`}
                    alt={`${blogPost.username}'s avatar`}
                    className="w-6 h-6 rounded-full"
                  />
                </div>
                <p className="mt-1 justify-right ml-auto">
                  {new Date(blogPost.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </span>

          <p className="mt-2 text-gray-600 dark:text-white text-1xl">
            {blogPost.description}
          </p>

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
              <Rating
                upvotes={blogPost.upvotes}
                downvotes={blogPost.downvotes}
                userUpvoted={blogPost.userUpvoted}
                userDownvoted={blogPost.userDownvoted}
                onUpvote={handleBlogUpvote}
                onDownvote={handleBlogDownvote}
              />
            </div>
          </div>
        </div>
        {/* Comments Section */}
        <div className="mt-8 w-full max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg border border-gray-200 dark:bg-gray-600">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Comments
          </h3>

          {/* Comment Input Section */}
          <div className="mb-4">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-4 border border-gray-300 dark:border-gray-500 rounded-md text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
            <button
              onClick={handleCreateComment}
              disabled={!commentContent.trim()}
              className="mt-2 w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              title="Comment cannot be empty"
            >
              Post Comment
            </button>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>

          {/* Display Comments */}
          {comments.length > 0 ? (
            <>
              <ul>
                {comments.map((comment) => (
                  <li
                    key={comment.id}
                    className="flex flex-col space-y-2 border-b border-gray-200 py-4 dark:border-gray-500"
                  >
                    {/* Top row with avatar and username */}
                    <div className="flex items-center space-x-3">
                      <img
                        src={`../../uploads/avatars/${comment.user.avatar}`}
                        alt={`${comment.user.username}'s avatar`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <p className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                        {comment.user.username}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Comment Content */}
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 text-lg">
                        {comment.content}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-300">No comments yet!</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;

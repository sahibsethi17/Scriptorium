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
  userUpvoted: boolean;
  userDownvoted: boolean;
  replies?: Comment[];
}

const BlogPage = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { id } = router.query;
  const [blogPost, setBlog] = useState<Blog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commentsOrder, setCommentsOrder] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [accessToken, setAccessToken] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>(
    {}
  );
  const [replies, setReplies] = useState({});

  const [showReplyInput, setShowReplyInput] = useState<{
    [key: number]: boolean;
  }>({});

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
        `/api/blogs/comments/?blogId=${id}&pageNum=${page}&order=${commentsOrder}`,
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

  const handleCreateComment = async () => {
    try {
      await fetch('/api/blogs/comments/create', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ blogId: blogPost.id, content: commentContent }),
      });
      await fetchComments();
    } catch (err) {
      setError('Error commenting: ${err}');
    }
  };

  const handleCreateReply = async (parentId: number, replyId: number, replyContent: string) => {
    try {
      await fetch(`/api/blogs/comments/create`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          blogId: blogPost.id,
          content: replyContent,
          parentId,
        }),
      });
      setReplyContent((prev) => ({ ...prev, [parentId]: "" })); // Clear reply input
      setShowReplyInput((prev) => ({ ...prev, [parentId]: false })); // Hide reply input
      if (replyId) {
        setShowReplyInput((prev) => ({ ...prev, [replyId]: false })); // Hide reply input
      }
      await fetchComments(currentPage);
    } catch (err) {
      setError(`Error replying: ${err}`);
    }
  };

  const handleToggleReplyInput = (parentId: number) => {
    setShowReplyInput((prev) => ({ ...prev, [parentId]: !prev[parentId] }));
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

  const handleBlogEdit = async () => {
    window.location.href = `./edit/${blogPost.id}`;
  };

  const handleBlogDelete = async () => {

    try {
      await fetch(`/api/blogs/delete`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "DELETE",
        body: JSON.stringify({
          id: Number(id), // Ensure that id is part of the body
        }),
      });
      window.location.href = `/blogs`; // Redirect to the updated blog page
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Failed to delete blog. Please try again.");
    }
  };

  const handleCommentUpvote = async (commentId: number) => {
    try {
      if (!isLoggedIn) {
        window.location.href = "/login";
        return;
      }
  
      // Find the comment or reply recursively
      const findComment = (commentList: Comment[], id: number): Comment | undefined => {
        for (const comment of commentList) {
          if (comment.id === id) return comment;
          if (comment.replies) {
            const found = findComment(comment.replies, id);
            if (found) return found;
          }
        }
        return undefined;
      };
  
      const comment = findComment(comments, commentId);
      if (!comment) throw new Error("Comment not found");
  
      let diff = comment.userUpvoted ? -1 : 1; // Toggle the upvote
      await fetch(`/api/blogs/comments/upvote`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ id: commentId, diff }),
      });
  
      // Refresh comments to reflect the update
      await fetchComments(currentPage);
    } catch (err) {
      setError(`Error upvoting comment: ${err}`);
    }
  };
  

  const handleCommentDownvote = async (commentId: number) => {
    try {
      if (!isLoggedIn) {
        window.location.href = "/login";
        return;
      }
  
      // Helper function to find a comment by ID, including nested replies
      const findCommentById = (comments: Comment[], id: number): Comment | null => {
        for (const comment of comments) {
          if (comment.id === id) {
            return comment;
          }
          if (comment.replies) {
            const found = findCommentById(comment.replies, id);
            if (found) {
              return found;
            }
          }
        }
        return null;
      };
  
      // Find the comment or reply to be downvoted
      const comment = findCommentById(comments, commentId);
      if (!comment) throw new Error("Comment not found");
  
      // Toggle downvote state
      const diff = comment.userDownvoted ? -1 : 1;
  
      await fetch(`/api/blogs/comments/downvote`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ id: commentId, diff }),
      });
  
      // Refresh comments to reflect the update
      await fetchComments(currentPage);
    } catch (err) {
      setError(`Error downvoting comment: ${err}`);
    }
  };
  

  useEffect(() => {
    if (id) {
      fetchBlogPost();
      fetchComments();
    }
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setAccessToken(token);
      setLoggedInUserId(localStorage.getItem("userId"));
    }
  }, [id, commentsOrder]);

  const renderReplies = (replies: Comment[] | undefined, parentId: number) => {
    if (!replies) return null;

    return (
      <ul className="ml-8 mt-2 border-l pl-4 border-gray-300 dark:border-gray-600">
        {replies.map((reply) => (
          <li key={reply.id} className="mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={`../../uploads/avatars/${reply.user.avatar}`}
                alt={`${reply.user.username}'s avatar`}
                className="w-8 h-8 rounded-full object-cover"
              />
              <p className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                {reply.user.username}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                {new Date(reply.createdAt).toLocaleString()}
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
              {reply.content}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Rating
                upvotes={reply.upvotes}
                downvotes={reply.downvotes}
                userUpvoted={reply.userUpvoted}
                userDownvoted={reply.userDownvoted}
                onUpvote={() => handleCommentUpvote(reply.id)}
                onDownvote={() => handleCommentDownvote(reply.id)}
              />
              <button
                onClick={() => handleToggleReplyInput(reply.id)}
                className="text-sm"
              >
                Reply
              </button>
            </div>
            {showReplyInput[reply.id] && (
              <div className="mt-2">
                <textarea
                  value={replyContent[reply.id] || ""}
                  onChange={(e) =>
                    setReplyContent((prev) => ({
                      ...prev,
                      [reply.id]: e.target.value,
                    }))
                  }
                  placeholder="Write your reply..."
                  className="w-full p-4 border border-gray-300 dark:border-gray-500 rounded-md text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
                <button
                  onClick={() =>
                    handleCreateReply(parentId, reply.id, replyContent[reply.id])
                  }
                  disabled={!replyContent[reply.id]?.trim()}
                  className="mt-2 py-1 px-4 bg-blue-500 text-white rounded-md"
                >
                  Post Reply
                </button>
              </div>
            )}
            {renderReplies(reply.replies, reply.id)}
          </li>
        ))}
      </ul>
    );
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!blogPost) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center">
        {/* Blog Content */}
        <div className="text-left w-full max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg border border-gray-200 mt-8 dark:bg-gray-600">
          <span className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 break-words">
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

          <p className="mt-2 text-gray-600 dark:text-white text-1xl break-words">
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
            <div>
              {blogPost.userId === Number(loggedInUserId) ? (
                <button onClick={handleBlogEdit} className="mr-1.5">
                  Edit
                </button>
              ) : (
                ""
              )}
              {blogPost.userId === Number(loggedInUserId) ? (
                <button
                  onClick={handleBlogDelete}
                  className="ml-1.5 bg-red-600"
                >
                  Delete
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
        {/* Comments Section */}
        <div className="mt-8 w-full max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg border border-gray-200 dark:bg-gray-600 mb-6">
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
            <div className="flex flex-col md:col-span-3 mt-4">
              <label className="text-gray-800 mb-2 font-medium dark:text-gray-200">
                Order By:
              </label>
              <select
                name="order"
                value={commentsOrder}
                onChange={(e) => setCommentsOrder(e.target.value)} // Uncomment to handle changes
                className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-800 dark:bg-gray-700 dark:border-gray-500 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out duration-200"
              >
                <option value="">Newest</option>
                <option value="upvotes">Upvotes</option>
                <option value="downvotes">Downvotes</option>
              </select>
            </div>
          </div>
          {/* Render Comments */}
          {comments.length > 0 ? (
            <ul>
              {comments.map((comment) => (
                <li key={comment.id} className="mb-4">
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
                  <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
                    {comment.content}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Rating
                      upvotes={comment.upvotes}
                      downvotes={comment.downvotes}
                      userUpvoted={comment.userUpvoted}
                      userDownvoted={comment.userDownvoted}
                      onUpvote={() => handleCommentUpvote(comment.id)}
                      onDownvote={() => handleCommentDownvote(comment.id)}
                    />
                    <button
                      onClick={() => handleToggleReplyInput(comment.id)}
                      className="text-sm"
                    >
                      Reply
                    </button>
                  </div>
                  {showReplyInput[comment.id] && (
                    <div className="mt-2">
                      <textarea
                        value={replyContent[comment.id] || ""}
                        onChange={(e) =>
                          setReplyContent((prev) => ({
                            ...prev,
                            [comment.id]: e.target.value,
                          }))
                        }
                        placeholder="Write your reply..."
                        className="w-full p-4 border border-gray-300 dark:border-gray-500 rounded-md text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                      />
                      <button
                        onClick={() =>
                          handleCreateReply(
                            comment.id,
                            null,
                            replyContent[comment.id]
                          )
                        }
                        disabled={!replyContent[comment.id]?.trim()}
                        className="mt-2 py-1 px-4 bg-blue-500 text-white rounded-md"
                      >
                        Post Reply
                      </button>
                    </div>
                  )}
                  {renderReplies(comment.replies, comment.id)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-center mt-4">
              No comments yet. Be the first to comment!
            </p>
          )}
          <div className="mt-6">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;


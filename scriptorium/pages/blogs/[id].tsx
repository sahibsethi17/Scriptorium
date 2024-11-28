// MODIFIED FROM CHATGPT

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../components/AuthContext";
import Footer from "pages/components/Footer";
import Pagination from "pages/components/Pagination";
import Rating from "pages/components/Rating";

interface Template {
  id: number;
  userId: number;
  title: string;
  explanation: string;
  tags: string;
  code: string;
  stdin: string;
  language: string;
  forkedFrom: string;
  createdAt: string;
  updatedAt: string;
}

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
  userReported: boolean;
  BlogReport: BlogReport[];
  templates: Template[];
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
  CommentReport: CommentReport[];
}

interface BlogReport {
  id: number;
  explanation: string;
  createdAt: string;
}

interface CommentReport {
  id: number;
  explanation: string;
  createdAt: string;
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
  const [isModalOpen, setModalOpen] = useState(false); // Blog Modal state
  const [explanation, setExplanation] = useState(""); // Blog Report Explanation state
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null); // Blog ID for reporting
  const [reportError, setReportError] = useState<string | null>(null); // State for Blog report error message
  const [reportSuccess, setReportSuccess] = useState<string | null>(null); // State for Blog report success message
  const [isCommentModalOpen, setCommentModalOpen] = useState(false); // Comment Modal state
  const [commentExplanation, setCommentExplanation] = useState(""); // Comment Report Explanation state
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(
    null
  ); // Comment ID for reporting
  const [commentReportError, setCommentReportError] = useState<string | null>(
    null
  ); // State for Comment report error message
  const [commentReportSuccess, setCommentReportSuccess] = useState<
    string | null
  >(null); // State for Comment report success message
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showReportedComments, setShowReportedComments] = useState(false);
  const [isBlogReportsModalOpen, setBlogReportsModalOpen] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);
  const [isCommentReportsModalOpen, setCommentReportsModalOpen] =
    useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>(
    {}
  );

  const [showReplyInput, setShowReplyInput] = useState<{
    [key: number]: boolean;
  }>({});
  const [templates, setTemplates] = useState([]);

  const fetchBlogPost = async () => {
    try {
      const response = await fetch(`/api/blogs/?id=${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        const blog = data.blogs[0];
        if (blog) {
          setBlog({
            ...blog,
            BlogReport: blog.BlogReport || [],
          });
          if (blog.templates) {
            setTemplates(blog.templates);
          }
        }
      } else {
        setError(data.error || "Failed to fetch blog post");
      }
    } catch (err) {
      setError(`Error fetching blog post: ${err}`);
    }
  };

  const fetchComments = async (page: number = 1) => {
    try {
      const queryParams = new URLSearchParams({
        blogId: String(id),
        pageNum: String(page),
        order: commentsOrder,
        ...(showReportedComments && { reportedOnly: "true" }), // Use `reportedOnly` for filtering
      });
      console.log(queryParams);

      const response = await fetch(`/api/blogs/comments/?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        const commentsWithReports = data.comments.map((comment) => ({
          ...comment,
          CommentReport: comment.CommentReport || [], // Ensure CommentReport[] is handled
        }));
        console.log(commentsWithReports);
        setComments(commentsWithReports);
        setTotalPages(data.totalPages);
      } else {
        setError(data.error || "Failed to fetch comments");
      }
    } catch (err) {
      setError(`Error fetching comments: ${err}`);
    }
  };

  const toggleReportedComments = async () => {
    setShowReportedComments((prev) => !prev);
    await fetchComments(); // Fetch comments based on the updated state
    setCurrentPage(1);
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateComment = async () => {
    try {
      if (!isLoggedIn) {
        window.location.href = "/login";
        return;
      }
      await fetch("/api/blogs/comments/create", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ blogId: blogPost.id, content: commentContent }),
      });
      await fetchComments();
      setCommentContent("");
    } catch (err) {
      setError("Error commenting: ${err}");
    }
  };

  const handleCreateReply = async (
    parentId: number,
    replyId: number,
    replyContent: string
  ) => {
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
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
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
      if (!isLoggedIn) {
        window.location.href = "/login";
        return;
      }
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
      alert('Blog successfully deleted');
      window.location.href = `/blogs`; // Redirect to the updated blog page
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const handleCommentUpvote = async (commentId: number) => {
    try {
      if (!isLoggedIn) {
        window.location.href = "/login";
        return;
      }

      // Find the comment or reply recursively
      const findComment = (
        commentList: Comment[],
        id: number
      ): Comment | undefined => {
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
      const findCommentById = (
        comments: Comment[],
        id: number
      ): Comment | null => {
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

  const handleOpenBlogReportModal = (blogId: number) => {
    setSelectedBlogId(blogId);
    setModalOpen(true); // Open modal
  };

  const handleOpenCommentReportModal = (commentId: number) => {
    setSelectedCommentId(commentId);
    setCommentModalOpen(true);
    setCommentExplanation("");
    setCommentReportSuccess(null);
    setCommentReportError(null);
  };

  const handleCloseBlogReportModal = () => {
    setModalOpen(false); // Close modal
    setExplanation(""); // Reset explanation
    setSelectedBlogId(null); // Reset blog ID
  };

  const handleCloseCommentReportModal = () => {
    setCommentModalOpen(false);
    setCommentExplanation("");
    setSelectedCommentId(null);
  };

  const handleSubmitReport = async () => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    if (!explanation.trim()) {
      setReportError("Explanation is required to report the blog.");
      return;
    }

    try {
      const response = await fetch(`/api/blogs/report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedBlogId, explanation }),
      });

      if (response.status === 409) {
        // Handle duplicate report case
        setReportError("You have already reported this blog.");
        setBlog((prev) => prev && { ...prev, userReported: true }); // Update client state
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to report blog. Status: ${response.status}, Message: ${errorText}`
        );
      }

      // Show success message and mark the blog as reported
      setReportSuccess(
        "Thank you for submitting your report. We will look into this issue."
      );
      setBlog((prev) => prev && { ...prev, userReported: true }); // Mark as reported
    } catch (err) {
      console.error("Error reporting blog:", err);
      setError(`Error reporting blog: ${err}`);
    }
  };

  const handleSubmitCommentReport = async () => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    if (!commentExplanation.trim()) {
      setCommentReportError("Explanation is required to report the comment.");
      return;
    }

    console.log(commentExplanation);

    try {
      const response = await fetch(`/api/blogs/comments/report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedCommentId,
          explanation: commentExplanation,
        }),
      });

      if (response.status === 409) {
        // Handle duplicate report case
        setCommentReportError("You have already reported this comment.");
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === selectedCommentId
              ? { ...comment, userReported: true }
              : comment
          )
        );
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to report comment. Status: ${response.status}, Message: ${errorText}`
        );
      }

      // Show success message and mark the comment as reported
      setCommentReportSuccess(
        "Thank you for submitting your report. We will look into this issue."
      );
      setSelectedCommentId(null); // Clear selected comment ID after success
      setCommentExplanation(""); // Clear explanation after success
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === selectedCommentId
            ? { ...comment, userReported: true }
            : comment
        )
      );
      setSelectedCommentId(null); // Clear selected comment ID after success
      setExplanation(""); // Clear explanation after success
    } catch (err) {
      console.error("Error reporting comment:", err);
      setCommentReportError(`Error reporting comment: ${err.message}`);
    }
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
      setUserRole(data.role);
    } catch (err) {
      console.error("Error fetching user role:", err);
    }
  };

  const toggleBlogVisibility = async () => {
    if (!blogPost) return;

    try {
      const url = blogPost.hidden ? "/api/blogs/unhide" : "/api/blogs/hide";
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: blogPost.id }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update visibility: ${errorText}`);
      }

      setBlog((prev) => prev && { ...prev, hidden: !prev.hidden });
    } catch (err: any) {
      setError(`Error toggling visibility: ${err.message}`);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setAccessToken(token);
      fetchUserRole();
    }
  }, []);

  const toggleCommentVisibility = async (commentId, isHidden) => {
    try {
      const url = isHidden
        ? "/api/blogs/comments/unhide"
        : "/api/blogs/comments/hide";
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: commentId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update visibility for comment ${commentId}`);
      }

      // Update local state
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, hidden: !comment.hidden }
            : comment
        )
      );
    } catch (err) {
      setError(`Error toggling comment visibility: ${err.message}`);
    }
  };

  const handleOpenBlogReportsModal = (blogReports) => {
    setSelectedReports(blogReports);
    setBlogReportsModalOpen(true);
  };

  const handleOpenCommentReportsModal = (commentReports) => {
    setSelectedReports(commentReports);
    setCommentReportsModalOpen(true);
  };

  const handleCloseBlogReportsModal = () => {
    setBlogReportsModalOpen(false);
    setSelectedReports([]);
  };

  const handleCloseCommentReportsModal = () => {
    setCommentReportsModalOpen(false);
    setSelectedReports([]);
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

  // Re-fetch comments whenever `showReportedComments` or `currentPage` changes
  useEffect(() => {
    if (id) {
      fetchComments(currentPage);
    }
  }, [showReportedComments, currentPage]);

  if (error) {
    return <div className="text-red-500 justify-center">Error: {error}</div>;
  }

  if (!blogPost) {
    return <div>Loading...</div>;
  }

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
                    handleCreateReply(
                      parentId,
                      reply.id,
                      replyContent[reply.id]
                    )
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

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center">
        {/* Blog Content */}
        <div className="text-left w-full max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg border border-gray-200 mt-8 dark:bg-gray-600 relative">
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

          <div className="mt-4 mb-4">
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

          {/* Template Information */}
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => {
                router.push({
                  pathname: "/code_editor",
                  query: {
                    title: template.title,
                    description: template.explanation,
                    tags: template.tags,
                    code: template.code,
                    language: template.language,
                    stdin: template.stdin
                  },
                });
              }}
              className="mb-6 p-6 bg-white rounded-lg shadow-md border dark:bg-gray-700 dark:text-white cursor-pointer"
            >
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                {template.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {template.explanation}
              </p>

              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                <p>
                  <strong>Language:</strong> {template.language}
                </p>
                <p>
                  <strong>Tags:</strong> {template.tags}
                </p>
              </div>

              <pre className="whitespace-pre-wrap break-words">
                {template.code}
              </pre>
            </div>
          ))}

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
              {userRole === "ADMIN" && (
                <div className="text-gray-600 dark:text-white hover:text-gray-800">
                  <button
                    onClick={() =>
                      handleOpenBlogReportsModal(blogPost.BlogReport)
                    }
                    className="text-white hover:underline"
                  >
                    Reports: {blogPost.reports}
                  </button>
                </div>
              )}

              {userRole === "ADMIN" && (
                <button
                  onClick={toggleBlogVisibility}
                  className="text-gray-600 dark:text-white hover:text-gray-800"
                  title={blogPost.hidden ? "Unhide Blog" : "Hide Blog"}
                >
                  {blogPost.hidden ? "Unhide Blog" : "Hide Blog"}
                </button>
              )}

              {blogPost.hidden && (
                <span
                  className="ml-2 text-red-500 cursor-pointer text-2xl"
                  title="This blog has been reported and hidden by a System Administrator."
                >
                  Flagged 🚩
                </span>
              )}

              <div className="absolute bottom-4 right-4">
                {isBlogReportsModalOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full dark:bg-gray-900 dark:text-white">
                      <h3 className="text-lg font-semibold mb-4">
                        Blog Reports
                      </h3>
                      <ul className="space-y-2">
                        {selectedReports.length > 0 ? (
                          selectedReports.map((report, index) => (
                            <li
                              key={index}
                              className="p-3 border rounded-md dark:border-gray-700"
                            >
                              <p className="text-sm text-gray-800 dark:text-gray-200">
                                <strong>Report #{index + 1}:</strong>{" "}
                                {report.explanation}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs">
                                {new Date(report.createdAt).toLocaleString()}
                              </p>
                            </li>
                          ))
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">
                            No reports available.
                          </p>
                        )}
                      </ul>
                      <button
                        onClick={handleCloseBlogReportsModal}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Blog Modal */}
              {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full dark:bg-gray-900 dark:text-white">
                    <h3 className="text-lg font-semibold mb-4">Report Blog</h3>
                    {reportError && (
                      <p className="text-red-500 mt-2 text-sm">{reportError}</p>
                    )}
                    {reportSuccess ? (
                      <>
                        <p className="text-green-500 mt-2 text-sm">
                          {reportSuccess}
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            onClick={handleCloseBlogReportModal}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                          >
                            Close
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <textarea
                          value={explanation}
                          onChange={(e) => setExplanation(e.target.value)}
                          placeholder="Please provide a reason for reporting this blog..."
                          className="w-full bg-white p-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
                          rows={4}
                        />
                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            onClick={handleSubmitReport}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
                          >
                            Submit
                          </button>
                          <button
                            onClick={handleCloseBlogReportModal}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                          >
                            Close
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div>
              {userRole === "USER" && (
                <button
                  onClick={() => handleOpenBlogReportModal(blogPost.id)}
                  className="mr-2 bg-red-600"
                  title="Report Blog"
                >
                  Report
                </button>
              )}
              {blogPost.userId === Number(loggedInUserId) ? (
                <button onClick={handleBlogEdit} className="mr-1">
                  Edit
                </button>
              ) : (
                ""
              )}
              {blogPost.userId === Number(loggedInUserId) ? (
                <button onClick={handleBlogDelete} className="ml-1 bg-red-600">
                  Delete
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
        {/* Comments Section */}
        <div className="mt-8 w-full max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg relative border border-gray-200 dark:bg-gray-600 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Comments
            </h3>
            {userRole === "ADMIN" && (
              <button
                onClick={toggleReportedComments}
                className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition duration-200"
              >
                {showReportedComments
                  ? "Show All Comments"
                  : "Show Reported Comments"}
              </button>
            )}
          </div>

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
                    {userRole === "USER" && (
                      <button
                        onClick={() => handleOpenCommentReportModal(comment.id)}
                        className="px-1 py-0.5 bg-red-500 text-white font-small rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition duration-200"
                        title="Report Comment"
                      >
                        Report
                      </button>
                    )}

                    {/* Show number of reports and hide/unhide button for ADMIN */}
                    {userRole === "ADMIN" && (
                      <div className="ml-auto flex items-center space-x-4">
                        <button
                          onClick={() =>
                            handleOpenCommentReportsModal(comment.CommentReport)
                          }
                          className="px-1 py-0.5 text-white hover:underline"
                        >
                          Reports: {comment.reports}
                        </button>
                        <button
                          onClick={() =>
                            toggleCommentVisibility(comment.id, comment.hidden)
                          }
                          className="px-1 py-0.5 text-gray-600 dark:text-white hover:text-gray-800"
                          title={
                            comment.hidden ? "Unhide Comment" : "Hide Comment"
                          }
                        >
                          {comment.hidden ? "Unhide" : "Hide"}
                        </button>
                      </div>
                    )}
                    {comment.hidden && (
                      <span
                        className="text-red-500 text-lg cursor-pointer"
                        title="This comment has been hidden by a System Administrator."
                      >
                        Flagged 🚩
                      </span>
                    )}

                    {isCommentReportsModalOpen && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full dark:bg-gray-900 dark:text-white">
                          <h3 className="text-lg font-semibold mb-4">
                            Comment Reports
                          </h3>
                          <ul className="space-y-2">
                            {selectedReports.length > 0 ? (
                              selectedReports.map((report, index) => (
                                <li
                                  key={index}
                                  className="p-3 border rounded-md dark:border-gray-700"
                                >
                                  <p className="text-sm text-gray-800 dark:text-gray-200">
                                    <strong>Report #{index + 1}:</strong>{" "}
                                    {report.explanation}
                                  </p>
                                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                                    {new Date(
                                      report.createdAt
                                    ).toLocaleString()}
                                  </p>
                                </li>
                              ))
                            ) : (
                              <p className="text-gray-500 dark:text-gray-400">
                                No reports available.
                              </p>
                            )}
                          </ul>
                          <button
                            onClick={handleCloseCommentReportsModal}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Comment Content */}
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

          {/* Comment Report Modal */}
          {isCommentModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full py-10 dark:bg-gray-900 dark:text-white relative">
                <h3 className="text-lg font-semibold mb-4">Report Comment</h3>

                {/* Display Error Message */}
                {commentReportError && (
                  <p className="text-red-500 mt-2 text-sm">
                    {commentReportError}
                  </p>
                )}

                {/* Display Success Message */}
                {commentReportSuccess ? (
                  <>
                    <p className="text-green-500 mt-2 text-sm">
                      {commentReportSuccess}
                    </p>
                    <button
                      onClick={handleCloseCommentReportModal}
                      className="absolute bottom-4 right-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  // Display textarea and buttons for reporting
                  <>
                    <textarea
                      value={commentExplanation}
                      onChange={(e) => setCommentExplanation(e.target.value)}
                      placeholder="Please provide a reason for reporting this comment..."
                      className="w-full bg-white p-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
                      rows={4}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={handleSubmitCommentReport}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
                      >
                        Submit
                      </button>
                      <button
                        onClick={handleCloseCommentReportModal}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
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

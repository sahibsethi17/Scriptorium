// Getter endpoint for comments
import { verifyAuth } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { paginate } from "@/utils/paginate";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { blogId, content, order, pageNum, reportedOnly } = req.query;

  if (!blogId) return res.status(400).json({ error: "Blog ID is invalid" });

  // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting -- used for filtering and sorting
  let filter = {};
  if (content) {
    filter.content = {
      contains: content,
    };
  }

  // Check if we have a logged in user
  const auth = await verifyAuth(req);
  let userId;
  if (auth) userId = auth.userId;
  let isAdmin = false;
  let currentUserId = null;

  if (userId) {
    const { role, id } = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { role: true, id: true },
    });
    isAdmin = role.toLowerCase() === "admin";
    currentUserId = id;
  }

  // Apply hidden filter logic
  filter.blogId = Number(blogId);

  if (reportedOnly === "true") {
    if (!isAdmin) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    filter.reports = { gt: 0 }; // Include only reported comments
  } else if (!isAdmin) {
    // Include hidden comments if they are authored by the current user
    filter.OR = [
      { hidden: false },
      { AND: [{ hidden: true }, { userId: currentUserId }] },
    ];
  }

  // Finalize the order in which the comments are sorted
  let orderBy = {};
  if (order) {
    switch (order) {
      case "upvotes":
        orderBy.upvotes = "desc";
        break;
      case "downvotes":
        orderBy.downvotes = "desc";
        break;
      case "reports":
        // Verify that the user is an admin
        if (!isAdmin) {
          return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
        }
        const { role } = await prisma.user.findUnique({
          where: {
            id: Number(userId),
          },
        });
        if (role.toLowerCase() !== "admin") {
          return res.status(401).json({ error: "Unauthorized action" });
        }
        orderBy.reports = "desc";
        break;
      default:
        orderBy.createdAt = "desc";
    }
  }

  try {
    console.log(filter);
    let comments = await prisma.comment.findMany({
      orderBy: orderBy,
      where: filter,
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
        CommentReport: {
          select: {
            id: true,
            explanation: true,
            createdAt: true,
          },
        },
      },
    });
    
    // Pagination handling
    const page = pageNum ? parseInt(pageNum) : 1;
    const paginatedComments = paginate(comments, page);
    
    return res.status(200).json({
      comments: paginatedComments.items,
      totalPages: paginatedComments.totalPages,
      totalItems: paginatedComments.totalItems,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
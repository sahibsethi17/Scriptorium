// Getter endpoint for comments
import { verifyAuth } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { paginate } from "@/utils/paginate";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { blogId, content, order, pageNum, parentId, reportedOnly } = req.query;

  if (!blogId) return res.status(400).json({ error: "Blog ID is invalid" });

  // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting -- used for filtering and sorting
  let filter = {};
  if (content) {
    filter.content = {
      contains: content,
    };
  }

  const auth = await verifyAuth(req); // Verify authentication
  let userRole = null;
  let userId = -1;

  console.log(222);
  if (auth) {
    userId = auth.userId;

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { role: true },
    });

    if (user) {
      userRole = user.role.toUpperCase();
    }
  }
  console.log(444);

  const isAdmin = userRole === "ADMIN"; // Determine if the user is an admin

  // Apply hidden filter logic
  filter.blogId = Number(blogId);

  if (reportedOnly === "true") {
    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "Forbidden: Insufficient permissions" });
    }
    filter.reports = { gt: 0 }; // Include only reported comments
  } else if (!isAdmin) {
    // Include hidden comments if they are authored by the current user
    filter.OR = [
      { hidden: false },
      { AND: [{ hidden: true }, { userId: Number(userId) }] },
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
          return res
            .status(403)
            .json({ error: "Forbidden: Insufficient permissions" });
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
  } else {
    orderBy.createdAt = "asc";
  }

  if (parentId) {
    filter.parentId = Number(parentId);
  } else {
    filter.parentId = null;
  }

  try {
    console.log("Filter:", filter);
    console.log("Filter.OR:", filter.OR);
    console.log("OrderBy:", orderBy);
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
        replies: {
          include: {
            user: {
              select: {
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
    console.log("comments: \n" + comments);

    // Pagination handling
    const page = pageNum ? parseInt(pageNum) : 1;
    const paginatedComments = paginate(comments, page);

    if (userId) {
      for (let i = 0; i < paginatedComments.items.length; i++) {
        const existingVote = await prisma.commentVote.findUnique({
          where: {
            userId_commentId: {
              userId: Number(userId),
              commentId: Number(paginatedComments.items[i].id),
            },
          },
        });
        if (existingVote) {
          if (existingVote.type === "UPVOTE") {
            paginatedComments.items[i].userUpvoted = true;
            paginatedComments.items[i].userDownvoted = false;
          } else if (existingVote.type === "DOWNVOTE") {
            paginatedComments.items[i].userUpvoted = false;
            paginatedComments.items[i].userDownvoted = true;
          } else {
            paginatedComments.items[i].userUpvoted = false;
            paginatedComments.items[i].userDownvoted = false;
          }
        }
      }
    }

    if (!order) paginatedComments.items.reverse(); // ensure comments are in reverse chronological order by default

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

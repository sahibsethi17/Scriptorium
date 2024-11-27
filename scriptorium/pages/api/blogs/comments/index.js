// Getter endpoint for comments
import { verifyAuth } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { paginate } from "@/utils/paginate";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { blogId, content, order, pageNum, parentId } = req.query;

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
    // Retrieve the user role and ID if the user is logged in
    const { role, id } = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { role: true, id: true },
    });
    isAdmin = role.toLowerCase() === "admin";
    currentUserId = id;
  }

  // Apply hidden filter
  if (!isAdmin) filter.hidden = false; // Show non-hidden blogs to all users
  filter.blogId = Number(blogId);

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
        if (!userId) {
          return res.status(401).json({ error: "Unauthorized action" });
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
    }
  } else {
    orderBy.createdAt = "asc";
  }

  if (parentId) {
    filter.parentId = Number(parentId);
  } else {
    filter.parentId = null;
  }

  // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting -- how to use the orderBy keyword
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

    // Pagination handling
    const page = pageNum ? parseInt(pageNum) : 1;
    const paginatedComments = paginate(comments, page);

    console.log(userId)
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

// Getter endpoint for blogs
import { verifyAuth } from "@/utils/auth";
import { paginate } from "@/utils/paginate";
import { PrismaClient } from "@prisma/client";
import { convertToArray } from "../../../utils/blog-utils";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    let blogs = [];
    let totalPages = 1;

    try {
        const auth = await verifyAuth(req); // Verify authentication
        let userRole = null;
        let userId = null;

        if (auth) {
            userId = auth.userId;

            if (userId) {
                const user = await prisma.user.findUnique({
                    where: { id: Number(userId) },
                    select: { role: true },
                });

                if (user) {
                    userRole = user.role.toUpperCase();
                }
            }
        }

        const isAdmin = userRole === "ADMIN"; // Determine if the user is an admin
        
        if (!req.query) {
            blogs = await prisma.blog.findMany({
              where: isAdmin
                ? {} // Admin sees all blogs
                : {
                    OR: [
                      { hidden: false }, // Unhidden blogs
                      { userId: Number(userId) }, // Hidden blogs created by the current user
                    ],
                  },
              include: {
                BlogReport: {
                  select: {
                    id: true,
                    explanation: true,
                    createdAt: true,
                  },
                },
              },
            });
            totalPages = Math.ceil(blogs.length / 10);
          } else {
            const { id, title, description, tags, order, templateIds, pageNum } = req.query;
          
            let filter = { AND: [] };
            if (!isAdmin) {
              filter.AND.push({
                OR: [
                  { hidden: false }, // Unhidden blogs
                  { userId: Number(userId) }, // Hidden blogs created by the current user
                ],
              });
            }
            if (id) {
              filter.id = { in: [Number(id)] };
            }
            if (title) {
              filter.title = { contains: title };
            }
            if (description) {
              filter.description = { contains: description };
            }
            if (tags) {
              const tagsArray = tags.split(",");
              for (const tag of tagsArray) {
                filter.AND.push({ tags: { contains: tag } });
              }
            }
            if (templateIds) {
              const templateIdsArray = convertToArray(templateIds);
              filter.AND.push({
                templates: { some: { id: { in: templateIdsArray } } },
              });
            }
          
            // Include BlogReport in Prisma query
            const prismaInput = { where: filter, include: { BlogReport: { select: { id: true, explanation: true, createdAt: true } } } };
            if (order) {
              if (order === "upvotes") {
                prismaInput.orderBy = [{ upvotes: "desc" }];
              } else if (order === "downvotes") {
                prismaInput.orderBy = [{ downvotes: "desc" }];
              } else if (order === "reports") {
                prismaInput.where = {
                  ...prismaInput.where,
                  reports: { gt: 0 }, // Only include blogs with reports > 0
                };
                prismaInput.orderBy = [{ reports: "desc" }];
              }
            } else {
              prismaInput.orderBy = [{ 'createdAt': 'desc'}];
            }
          
            let blogsQuery = await prisma.blog.findMany(prismaInput);
          
            totalPages = Math.ceil(blogsQuery.length / 10);
          
            // Pagination handling
            const page = pageNum ? parseInt(pageNum) : 1;
            const paginatedBlogs = paginate(blogsQuery, page);

            // Get the username of the user that created this blog
            if (!paginatedBlogs.items[0]) {
                return res.status(200).json({
                    blogs: [],   
                    totalPages: 0, 
                    totalItems: 0  
                });
            }

            const user = await prisma.user.findUnique({
              where: { id: paginatedBlogs.items[0]?.userId },
              select: { username: true, avatar: true },
            });
          
            if (user) {
              paginatedBlogs.items.forEach((blog) => {
                blog.username = user.username;
                blog.avatar = user.avatar;
              });
            }
          
            return res.status(200).json({
              blogs: paginatedBlogs.items,
              totalPages: paginatedBlogs.totalPages,
              totalItems: paginatedBlogs.totalItems,
            });
          }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
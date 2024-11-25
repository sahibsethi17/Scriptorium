// Getter endpoint for blogs
import { verifyAuth } from '@/utils/auth';
import { paginate } from '@/utils/paginate';
import { PrismaClient } from '@prisma/client';
import { convertToArray } from '../../../utils/blog-utils';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let blogs = [];
    let totalPages = 1;
    if (!req.query) { // If no parameters are provided, return all blog posts
        try {
            blogs = await prisma.blog.findMany();
            totalPages = Math.ceil(blogs.length / 10);
        } catch(err) {
            return res.status(500).json({ error: "Internal server error" });
        }
    } else { // If at least one parameter is provided
        const { id, userId, title, description, tags, order, templateIds, pageNum } = req.query;

        let filter = { AND: [] };
        if (id) {
            filter.id = {
                in: [Number(id)]
            }
        }
        if (userId) {
            filter.userId = {
                in: [Number(userId)]
            }
        }
        if (title) {
            filter.title = {
                contains: title
            }
        }
        if (description) {
            filter.description = {
                contains: description
            }
        }
        if (tags) {
            const tagsArray = tags.split(',');
            for (const tag of tagsArray) {
                filter.AND.push({
                    tags: {
                        contains: tag
                    }
                })
            }
        }
        if (templateIds) {
            const templateIdsArray = convertToArray(templateIds);
            filter.AND.push({
                templates: {
                    some: {
                        id: {
                            in: templateIdsArray
                        }
                    }
                }
            });
        }

        // Find blogs with the specified query
        try {
            let prismaInput = {where: filter}
            if (order) order == 'upvotes' ? prismaInput.orderBy = [{ 'upvotes': 'desc'}] : prismaInput.orderBy = [{ 'downvotes': 'desc'}];
            console.log(prismaInput)
            let blogsQuery = await prisma.blog.findMany(prismaInput);
        
            totalPages = Math.ceil(blogsQuery.length / 10);
        
            // Pagination handling
            const page = pageNum ? parseInt(pageNum) : 1;
            const paginatedBlogs = paginate(blogsQuery, page);

            // Get the username of the user that created this blog
            const user = await prisma.user.findUnique({
                where: {
                    id: paginatedBlogs.items[0].userId
                }
            })

            // set username and avatar
            paginatedBlogs.items[0].username = user.username;
            paginatedBlogs.items[0].avatar = user.avatar;

            const auth = await verifyAuth(req);
            if (auth) {
                const { userId } = auth;
                if (userId) {
                    const existingVote = await prisma.blogVote.findUnique({
                        where: {
                            userId_blogId: { userId: Number(userId), blogId: Number(id) },
                        }
                    });
                    if (existingVote) {
                        if (existingVote.type === 'UPVOTE') {
                            paginatedBlogs.items[0].userUpvoted = true;
                            paginatedBlogs.items[0].userDownvoted = false;
                        } else if (existingVote.type === 'DOWNVOTE') {
                            paginatedBlogs.items[0].userUpvoted = false
                            paginatedBlogs.items[0].userDownvoted = true;
                        }
                    }
                }
            }
            
            return res.status(200).json({
                blogs: paginatedBlogs.items,   
                totalPages: paginatedBlogs.totalPages,  
                totalItems: paginatedBlogs.totalItems,  
            });
        } catch(err) {
            console.log(err);
            return res.status(500).json({ error: "Internal server error" });
        }
        
    }
}
  
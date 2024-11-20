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
        const { id, title, description, tags, order, templateIds, pageNum } = req.query;

        let filter = { AND: [] };
        if (id) {
            filter.id = {
                in: [Number(id)]
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
  
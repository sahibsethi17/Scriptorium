// Getter endpoint for blogs
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let blogs = {};
    if (!req.body) { // If no parameters are provided, return all blog posts
        try {
            blogs = await prisma.blog.findMany();
        } catch(err) {
            return res.status(500).json({ error: "Internal server error" });
        }

    } else { // If at least one parameter is provided
        const { id, title, description, order } = req.query;

        // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting -- used for filtering and sorting
        let filter = {};
        if (id) {
            filter.id = Number(id);
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
        
        // Finalize the order in which the blog posts are sorted
        let orderBy = {};
        if (order) {
            switch (order) {
                case 'upvotes':
                    orderBy.upvotes = 'desc';
                    break;
                case 'downvotes':
                    orderBy.downvotes = 'desc'
                    break;
            }
        }
        console.log(orderBy)

        // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting -- how to use the orderBy keyword
        try {
            blogs = await prisma.blog.findMany({
                orderBy: orderBy,
                where: filter
            });
            return res.status(200).json(blogs);
        } catch(err) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}
  
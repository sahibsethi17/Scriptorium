// Get all comments associated with a specific blog 
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { blogId, order } = req.query;



    // Blog ID must be provided
    if (!blogId) return res.status(400).json({ error: "Blog ID is invalid" });

    // Finalize the order in which the comments are sorted
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
        const comments = await prisma.blog.findMany({
            where: {
                id: Number(blogId)
            },
            select: { // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/select-fields -- how to use select field in Prisma
                comments: {
                    orderBy
                }
            }
        });
        return res.status(200).json(comments);
    } catch(err) {
        return res.status(500).json({ error: "Internal server error" });
    }
}
  
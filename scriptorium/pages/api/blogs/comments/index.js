// Getter endpoint for comments
import { verifyAuth } from '@/utils/auth';
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { blogId, content, order } = req.query;

    if (!blogId) return res.status(400).json({ error: "Blog ID is invalid" });

    // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting -- used for filtering and sorting
    let filter = {};
    if (content) {
        filter.content = {
            contains: content
        }
    }
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
            case 'reports':
                // Verify that the user is an admin
                const userId = verifyAuth(req);
                if (!userId) {
                    return res.status(401).json({ error: "Unauthorized action" });
                }
                const { role } = await prisma.user.findUnique({
                    where: {
                        id: Number(userId)
                    }
                })
                if (role.toLowerCase() !== 'admin') {
                    return res.status(401).json({ error: "Unauthorized action" });
                }
                orderBy.reports = 'desc'
                break;
        }
    }

    // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting -- how to use the orderBy keyword
    try {
        const comments = await prisma.comment.findMany({
            orderBy: orderBy,
            where: filter
        });
        return res.status(200).json(comments);
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
  
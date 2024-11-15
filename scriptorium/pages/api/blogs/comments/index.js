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
    let filter = { AND: [] }; 
    if (content) {
        filter.content = {
            contains: content
        }
    }

    // Check if we have a logged in user
    const userId = await verifyAuth(req);
    let isAdmin = false;
    let currentUserId = null;

    if (userId) {
        // Retrieve the user role and ID if the user is logged in
        const { role, id } = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: { role: true, id: true }
        });
        isAdmin = role.toLowerCase() === 'admin';
        currentUserId = id;
    }

    // Apply hidden filter
    if (!isAdmin) {
        filter.AND.push({
            OR: [
                { hidden: false },  // Show non-hidden blogs to all users
                userId ? { hidden: true, userId: currentUserId } : {}  // Generated with ChatGPT
            ]
        });
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
  
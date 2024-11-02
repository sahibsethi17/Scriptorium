// Create endpoint for blogs
import { verifyAuth } from '@/utils/auth';
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get the currently logged in user (if exists)
    const userId = verifyAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized action" });

    // Get the blog ID
    let { id } = req.body;
    if (!id) return res.status(400).json({ error: "Blog ID is invalid" });

    try {
        // Delete entry from database
        const blog = await prisma.blog.delete({
            where: {
                id: Number(id),
                userId
            }
        })
        return res.status(200).json(blog);
    } catch(err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
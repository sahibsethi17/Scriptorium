// Edit endpoint for comments
import { verifyAuth } from '@/utils/auth';
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const userId = verifyAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized action" });

    let { id, content } = req.body;

    // Get the updated parameters
    if (!id) return res.status(400).json({ error: "Blog ID is invalid" });
    if (!content) return res.status(400).json({ error: "Content is invalid" });

    try {
        // Delete entry from database
        const blog = await prisma.blog.update({
            where: {
                id: Number(id),
                userId
            },
            data: {
                content
            }
        })
        return res.status(200).json(blog);
    } catch(err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
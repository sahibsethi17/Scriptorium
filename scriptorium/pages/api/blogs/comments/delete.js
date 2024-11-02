// Delete endpoint for comments
import { verifyAuth } from '@/utils/auth';
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const userId = verifyAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized action" });

    let { id } = req.body;

    // If invalid parameters
    if (!id) return res.status(400).json({ error: "Comment ID is invalid" });

    try {
        // Delete entry from database
        const comment = await prisma.comment.delete({
            where: {
                id: Number(id),
                userId
            }
        })
        return res.status(200).json(comment);
    } catch(err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
// Delete endpoint for comments
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let { id } = req.body;

    // If invalid parameters
    if (!id) return res.status(400).json({ error: "Comment ID is invalid" });

    try {
        // Delete entry from database
        const comment = await prisma.comment.delete({
            where: {
                id: Number(id)
            }
        })
        return res.status(200).json(comment);
    } catch(err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
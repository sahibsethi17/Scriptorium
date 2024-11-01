// Downvote endpoint for comments
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Diff is how much the downvote will change by (either 1 or -1)
    let { id, diff } = req.body;

    // If invalid parameters
    if (!id) return res.status(400).json({ error: "Comment ID not provided" });
    if (!diff) return res.status(400).json({ error: "Diff not provided" });

    try {
        // Get current number of downvotes
        const { downvotes } = await prisma.comment.findUnique({
            where: {
                id: Number(id)
            },
        })
        if (typeof downvotes === 'null') {
            return res.status(404).json({ error: "Comment not found" });
        }
        if (downvotes == 0 && diff == -1) {
            return res.status(409).json({ error: "Downvotes cannot be decremented at 0" });
        }
        // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/crud#update -- used for updating database entries
        const comment = await prisma.comment.update({
            where: {
                id: Number(id)
            },
            data: {
                downvotes: Number(downvotes) + diff
            }
        })
        return res.status(200).json(comment);
    } catch(err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
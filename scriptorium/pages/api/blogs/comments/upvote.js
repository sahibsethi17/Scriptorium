// Upvote endpoint for comments
import { verifyAuth } from '@/utils/auth';
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const userId = verifyAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized action" });

    // Diff is how much the upvote will change by (either 1 or -1)
    let { id, diff } = req.body;

    // If invalid parameters
    if (!id) return res.status(400).json({ error: "Comment ID not provided" });
    if (!diff) return res.status(400).json({ error: "Diff not provided" });

    try {
        // Get current number of upvotes
        const { upvotes } = await prisma.comment.findUnique({
            where: {
                id: Number(id)
            },
        })
        if (typeof upvotes === 'null') {
            return res.status(404).json({ error: "Comment not found" });
        }
        if (upvotes == 0 && diff == -1) {
            return res.status(409).json({ error: "Upvotes cannot be decremented at 0" });
        }
        // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/crud#update -- used for updating database entries
        const comment = await prisma.comment.update({
            where: {
                id: Number(id)
            },
            data: {
                upvotes: Number(upvotes) + diff
            }
        })
        return res.status(200).json(comment);
    } catch(err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
// Upvote endpoint for blogs
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Diff is how much the upvote will change by (either 1 or -1)
    let { id, diff } = req.body;

    // If invalid parameters
    if (!id) return res.status(400).json({ error: "Blog ID not provided" });
    if (!diff) return res.status(400).json({ error: "Diff not provided" });

    try {
        // Get current number of upvotes
        const { upvotes } = await prisma.blog.findUnique({
            where: {
                id: Number(id)
            },
        })
        if (typeof upvotes === 'null') {
            return res.status(404).json({ error: "Blog not found" });
        }
        if (upvotes == 0 && diff == -1) {
            return res.status(409).json({ error: "Upvotes cannot be decremented at 0" });
        }
        // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/crud#update -- used for updating database entries
        const blog = await prisma.blog.update({
            where: {
                id: Number(id)
            },
            data: {
                upvotes: Number(upvotes) + diff
            }
        })
        return res.status(200).json(blog);
    } catch(err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
// Create endpoint for comments
import { verifyAuth } from '@/utils/auth';
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const userId = await verifyAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized action" });

    let { id, explanation } = req.body;

    // If invalid parameters
    if (!id) return res.status(400).json({ error: "Comment ID is invalid" });

    try {
        // Add report to CommentReport database
        const report = await prisma.commentReport.create({
            data: {
                userId,
                commentId: id,
                explanation
            }
        })

        // Get current number of reports
        const { reports } = await prisma.comment.findUnique({
            where: {
                id: Number(id)
            },
        })
        // Create new entry in database
        const comment = await prisma.comment.update({
            where: {
                id: Number(id)
            },
            data: {
                reports: Number(reports) + 1
            }
        });
        return res.status(201).json(report);
    } catch(err) {
        if (err.code == 'P2002') { // SOURCE: https://www.prisma.io/docs/orm/reference/error-reference -- P2002 means the unique constraint failed
            return res.status(409).json({ error: "This user has already reported this comment" })
        }
        res.status(500).json({ error: "Internal server error" });
    }   
}
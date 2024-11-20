// Create endpoint for comments
import { verifyAuth } from '@/utils/auth';
import { prisma } from "@/utils/db";
import { convertToArray } from '@/utils/blog-utils'

export default async function handler(req, res) {
    const userId = await verifyAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized action" });

    if (req.method === 'POST') {

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
            console.log(report)

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
            console.log(err)
            res.status(500).json({ error: "Internal server error" });
        }   
    } else if (req.method === 'GET') {
        // Ensure the current user is admin
        const { role } = await prisma.user.findUnique({
            where: {
                id: Number(userId)
            }
        })
        if (role.toLowerCase() !== 'admin') {
            return res.status(401).json({ error: "Unauthorized action" });
        }

        let { blogIds } = req.query;

        if (blogIds) blogIds = convertToArray(blogIds);
        else blogIds = [];

        try {
            // Create new entry in database
            let filter = {}
            if (blogIds.length > 0) {
                filter.id = {
                    in: blogIds
                }
            }
            const reports = await prisma.blogReport.findMany({
                where: filter
            });
            return res.status(200).json(reports);
        } catch(err) {
            console.log(err);
            res.status(500).json({ error: "Internal server error", details: err.message });
        }  

    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}
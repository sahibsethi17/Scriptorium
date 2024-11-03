// Create endpoint for blogs
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
    if (!id) return res.status(400).json({ error: "Blog ID is invalid" });

    try {
        // Add report to BlogReport database
        const report = await prisma.blogReport.create({
            data: {
                userId,
                blogId: id,
                explanation
            }
        })

        // Get current number of reports
        const { reports } = await prisma.blog.findUnique({
            where: {
                id: Number(id)
            },
        })

        // Create new entry in database
        const blog = await prisma.blog.update({
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
            return res.status(409).json({ error: "This user has already reported this blog post" })
        }
        return res.status(500).json({ error: "Internal server error" });
    }   
}
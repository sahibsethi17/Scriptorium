// Hide comment endpoint
import { verifyAuth } from '@/utils/auth';
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.body;

    if (!id) return res.status(400).json({ error: "Comment ID is invalid" });

    const userId = verifyAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized action" });

    // Ensure the current user is admin
    const { role } = await prisma.user.findUnique({
        where: {
            id: Number(userId)
        }
    })
    if (role.toLowerCase() !== 'admin') {
        return res.status(401).json({ error: "Unauthorized action" });
    }

    // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting -- how to use the orderBy keyword
    try {
        const comment = await prisma.comment.update({
            where: {
                id
            },
            data: {
                hidden: false
            }
        });
        return res.status(200).json(comment);
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
  
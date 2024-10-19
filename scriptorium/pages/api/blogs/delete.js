// Delete endpoint for blogs
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let { id } = req.body;

    // If invalid parameters
    if (!id) return res.status(400).json({ error: "Blog ID not provided" });

    try {
        // Delete entry from database
        const blog = await prisma.blog.delete({
            where: {
                id: Number(id)
            }
        })
        return res.status(200).json(blog);
    } catch(err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
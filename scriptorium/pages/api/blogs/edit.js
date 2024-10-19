// Edit endpoint for blogs
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let { id, title, description, tags } = req.body;

    // Get the updated parameters
    let update = {};
    if (!id) return res.status(400).json({ error: "Blog ID not provided" });
    if (title) update.title = title;
    if (description) update.description = description;
    if (tags) update.tags = tags;

    try {
        // Delete entry from database
        const blog = await prisma.blog.update({
            where: {
                id: Number(id)
            },
            data: update
        })
        return res.status(200).json(blog);
    } catch(err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
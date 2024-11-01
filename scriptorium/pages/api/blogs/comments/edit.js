// Edit endpoint for blogs
import { removeDuplicateTags } from '@/utils/blog-utils';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let { id, content } = req.body;

    // Get the updated parameters
    if (!id) return res.status(400).json({ error: "Blog ID is invalid" });
    if (!content) return res.status(400).json({ error: "Content is invalid" });

    try {
        // Delete entry from database
        const blog = await prisma.blog.update({
            where: {
                id: Number(id)
            },
            data: {
                content
            }
        })
        return res.status(200).json(blog);
    } catch(err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
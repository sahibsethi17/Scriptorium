// Create endpoint for blogs
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let { title, description, tags } = req.body;

    // If invalid parameters
    if (!title) return res.status(400).json({ error: "Title is empty" });
    if (!description) return res.status(400).json({ error: "Description is empty" });

    if (!tags) tags = "";
    try {
        // Create new entry in database
        const blog = await prisma.blog.create({
            data: {
                // userId,
                title,
                description,
                tags
            },
        });
        return res.status(201).json(blog);
    } catch(err) {
        res.status(500).json({ error: "Internal server error" });
    }   
}
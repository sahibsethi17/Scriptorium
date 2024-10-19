// Create endpoint for comments
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let { blogId, description } = req.body;

    // If invalid parameters
    if (!blogId) return res.status(400).json({ error: "Blog ID is empty" });
    if (!description) return res.status(400).json({ error: "Description is empty" });

    try {

        // Create new entry in comment database
        const comment = await prisma.comment.create({
            data: {
                // userId,
                blogId,
                description
            },
        });

        // Update the corresponding blog to include the new comment
        const blog = await prisma.blog.update({
            where: {
                id: blogId
            }
        });
        blog

        return res.status(201).json(comment);
    } catch(err) {
        res.status(500).json({ error: "Internal server error" });
    }   
}
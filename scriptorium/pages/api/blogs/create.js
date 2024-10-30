// Create endpoint for blogs
import { verifyToken } from '@/utils/auth';
import { removeDuplicateTags } from '@/utils/blog-utils';
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let { title, description, tags } = req.body;

    // Get the currently logged in user (if exists)
    const accessToken = verifyToken(req.headers.authorization);
    if (!accessToken) return res.status(401).json({ error: 'Unauthorized action' });
    const userId = accessToken.userId;

    // If invalid parameters
    if (!title) return res.status(400).json({ error: "Title is invalid" });
    if (!description) return res.status(400).json({ error: "Description is invalid" });

    // Prisma does not support arrays of primitive types, so tag lists must be a whole string with each tag separated by a comma
    if (!tags) tags = ""; 

    // Ensure no duplicate tags
    tags = removeDuplicateTags(tags);

    try {
        // Create new entry in database
        const blog = await prisma.blog.create({
            data: {
                user : {
                    connect: {
                        id: userId
                    }
                },
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
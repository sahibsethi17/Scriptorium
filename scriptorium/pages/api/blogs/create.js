// Create endpoint for blogs
import { removeDuplicateTags, convertToArray } from '@/utils/blog-utils';
import { verifyAuth } from '@/utils/auth';
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let { title, description, tags, templateIds } = req.body;

    // Get the currently logged in user (if exists)
    const { userId } = await verifyAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized action" });

    // If invalid parameters
    if (!title) return res.status(400).json({ error: "Title is invalid" });
    if (!description) return res.status(400).json({ error: "Description is invalid" });

    // If no tags
    if (!tags) tags = "";
    tags = removeDuplicateTags(tags);

    // Get array of template IDs
    if (templateIds) templateIds = convertToArray(templateIds);
    else templateIds = [];

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
                tags,
                templates: {
                    connect: templateIds.map((id) => ({ id })),
                },
            },
            include: {
                templates: true,  
            }
        });
        return res.status(201).json(blog);
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }   
}
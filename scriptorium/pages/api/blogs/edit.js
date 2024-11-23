// Edit endpoint for blogs
import { removeDuplicateTags, convertToArray } from '@/utils/blog-utils';

import { verifyAuth } from '@/utils/auth';
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = await verifyAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized action" });

    let { id, title, description, tags, templateIds } = req.body;

    // Get the updated parameters
    let update = {};
    if (!id) return res.status(400).json({ error: "Blog ID is invalid" });
    if (title) update.title = title;
    if (description) update.description = description;
    if (tags) {
        // Ensure no duplicate tags
        tags = removeDuplicateTags(tags);
        update.tags = tags;
    }
    if (templateIds) {
        templateIds = convertToArray(templateIds);
        update.templates = {};
        // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries -- connecting in Prisma
        update.templates.connect = templateIds.map((templateId) => ({ id: templateId }));
    }

    try {
        console.log(update);
        // Edit entry in database
        const blog = await prisma.blog.update({
            where: {
                id,
                userId
            },
            data: update,
            include: {
                templates: true
            }
        })
        return res.status(200).json(blog);
    } catch(err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
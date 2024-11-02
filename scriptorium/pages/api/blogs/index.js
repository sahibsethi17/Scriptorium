// Getter endpoint for blogs
import { verifyAuth } from '@/utils/auth';
import { convertToArray } from '@/utils/blog-utils';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let blogs = {};
    if (!req.query) { // If no parameters are provided, return all blog posts
        try {
            blogs = await prisma.blog.findMany();
        } catch(err) {
            return res.status(500).json({ error: "Internal server error" });
        }

    } else { // If at least one parameter is provided
        const { id, title, description, tags, order, templateQuery, templateTags } = req.query;

        // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting -- used for filtering and sorting
        let filter = { AND: [] };
        if (id) {
            filter.id = {
                in: [Number(id)]
            }
        }
        if (title) {
            filter.title = {
                contains: title
            }
        }
        if (description) {
            filter.description = {
                contains: description
            }
        }
        if (tags) {
            const tagsArray = tags.split(',');
            for (const tag of tagsArray) {
                filter.AND.push({
                    tags: {
                        contains: tag
                    }
                })
            }
        }
        if (templateQuery || templateTags) {

            // SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams -- construct the URL with query parameters
            const url = new URL("http://localhost:3000/api/templates/search");
            if (templateQuery) url.searchParams.append("query", templateQuery);
            if (templateTags) url.searchParams.append("tags", templateTags);

            const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json' 
                    }
                }
            );
            if (!response.ok) {
                console.log("ERROR");
                return res.status(500).json({ error: "Internal server error" });
            }
            const json = await response.json();
            const templates = json.templates;
            console.log(templates);
            let templateIds = []; 
            for (const template of templates) {
                templateIds.push(template.id);
            }

            // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting -- using the some keyword in Prisma
            filter.AND.push({
                templates: {
                    some: {
                        id: {
                            in: templateIds
                        }
                    }
                }
            });
            
        }
        
        // Finalize the order in which the blog posts are sorted
        let orderBy = {};
        if (order) {
            switch (order) {
                case 'upvotes':
                    orderBy.upvotes = 'desc';
                    break;
                case 'downvotes':
                    orderBy.downvotes = 'desc'
                    break;
                case 'reports':
                    // Verify that the user is an admin
                    const userId = verifyAuth(req);
                    if (!userId) {
                        return res.status(401).json({ error: "Unauthorized action" });
                    }
                    const { role } = await prisma.user.findUnique({
                        where: {
                            id: Number(userId)
                        }
                    })
                    if (role.toLowerCase() !== 'admin') {
                        return res.status(401).json({ error: "Unauthorized action" });
                    }
                    orderBy.reports = 'desc'
                    break;
            }
        }

        // SOURCE: https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting -- how to use the orderBy keyword
        try {
            const blogs = await prisma.blog.findMany({
                orderBy: orderBy,
                where: filter,
                include: {
                    templates: true,
                    comments: true  
                }
            });
            return res.status(200).json(blogs);
        } catch(err) {
            console.log(err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}
  
// Create endpoint for comments
import { verifyAuth } from '@/utils/auth';
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = await verifyAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized action" });

    let { blogId, parentId, content } = req.body;

    // If invalid parameters
    if (!blogId) return res.status(400).json({ error: "Blog ID is invalid" });
    if (!content) return res.status(400).json({ error: "Content is invalid" });

    let data = {
            content,
            blog: {
                connect: { // SOURCE: Using the connect keyword in Prisma -- https://stackoverflow.com/questions/65950407/prisma-many-to-many-relations-create-and-connect
                    id: blogId
                }
            },
            user: {
                connect: {
                    id: userId
                }
            }
        }

    // Handle the case where the comment is a reply
    if (parentId) {
        const parentComment = await prisma.comment.findUnique({
            where: {
                id: parentId
            }
        })
        // Parent comment should exist
        if (!parentComment) return res.status(400).json( { error: "Parent ID is invalid" } )
        data.parent = {connect: {
            id: parentId
        }}
    }

    try {
        // Create new entry in comment database
        const comment = await prisma.comment.create({
            data
        });

        return res.status(201).json(comment);
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }   
}
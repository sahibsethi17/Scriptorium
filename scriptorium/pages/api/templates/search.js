// pages/api/templates/search.js
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, tags } = req.query;

  // Convert tags to an array if it's provided, otherwise leave it empty
  const tagsArray = tags ? tags.split(',') : [];

  try {
    const templates = await prisma.template.findMany({
      where: {
        OR: [
          { title: { contains: query || '' } },
          { explanation: { contains: query || '' } },
          { tags: { contains: query || '' } },
        ],
        AND: tagsArray.length > 0
          ? tagsArray.map(tag => ({
              tags: { contains: tag }
            }))
          : []
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ templates });
  } catch (error) {
    console.error("Search failed with error:", error);
    return res.status(500).json({ error: 'Search failed', details: error.message });
  }
}
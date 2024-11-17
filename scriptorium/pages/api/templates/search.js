// pages/api/templates/search.js
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tag, title, explanation } = req.query;

  if (!tag && !title && !explanation) {
    return res.status(400).json({ error: 'A search parameter (tag, title, or explanation) is required' });
  }

  try {
    const searchConditions = [];

    if (tag) {
      searchConditions.push({
        tags: {
          contains: tag,
        },
      });
    }

    if (title) {
      searchConditions.push({
        title: {
          contains: title.toLowerCase(),  
        },
      });
    }

    if (explanation) {
      searchConditions.push({
        explanation: {
          contains: explanation.toLowerCase(),  
        },
      });
    }

    const templates = await prisma.template.findMany({
      where: {
        OR: searchConditions,
      },
    });

    res.status(200).json({ templates });
  } catch (error) {
    console.error("Template search error:", error);
    res.status(500).json({ error: 'Template search failed', details: error.message });
  }
}
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 5 } = req.query;

      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);

      const templates = await prisma.template.findMany({
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      });

      const totalTemplates = await prisma.template.count();

      res.status(200).json({
        templates,
        totalPages: Math.ceil(totalTemplates / pageSize),
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
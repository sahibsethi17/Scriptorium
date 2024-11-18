// pages/api/templates/index.js
import { prisma } from "@/utils/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const templates = await prisma.template.findMany();
    res.status(200).json({ templates });
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
}
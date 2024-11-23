// pages/api/templates/fork.js
import { prisma } from "@/utils/db";
import { verifyAuth } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { templateId, title, explanation, tags } = req.body;
  const { userId } = await verifyAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const originalTemplate = await prisma.template.findUnique({
      where: { id: templateId }
    });

    if (!originalTemplate) {
      return res.status(404).json({ error: 'Original template not found' });
    }

    // Ensure that the language is copied over when forking
    const forkedTemplate = await prisma.template.create({
      data: {
        userId,
        title,
        explanation,
        tags,
        code: originalTemplate.code,
        stdin: originalTemplate.stdin,
        language: originalTemplate.language,
        forkedFrom: originalTemplate.id
      }
    });

    res.status(201).json({ message: 'Template forked successfully', template: forkedTemplate });
  } catch (error) {
    console.error("Fork template error:", error);
    res.status(500).json({ error: 'Failed to fork template', details: error.message });
  }
}
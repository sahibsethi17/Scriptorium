// pages/api/templates/create.js
import { prisma } from "@/utils/db";
import { verifyAuth } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, explanation, tags, code, stdin = [], language } = req.body;
  const userId = verifyAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!title || !explanation || !tags || !code || !language) {
    return res.status(400).json({ error: 'Title, explanation, tags, code, and language are required' });
  }

  try {
    const template = await prisma.template.create({
      data: {
        userId,
        title,
        explanation,
        tags,
        code,
        stdin: stdin.length > 0 ? JSON.stringify(stdin) : null,
        language
      }
    });
    res.status(201).json({ template });
  } catch (error) {
    console.error("Template creation error:", error);
    res.status(500).json({ error: 'Template creation failed', details: error.message });
  }
}
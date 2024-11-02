// pages/api/templates/[id].js
import { prisma } from "@/utils/db";
import { verifyAuth } from "@/utils/auth";

export default async function handler(req, res) {
  const { id } = req.query;
  const userId = verifyAuth(req);

  if (req.method === 'GET') {
    // Retrieve template by ID
    try {
      const template = await prisma.template.findUnique({
        where: { id: parseInt(id) }
      });
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      res.status(200).json({ template });
    } catch (error) {
      console.error("Fetch template error:", error);
      res.status(500).json({ error: 'Failed to retrieve template', details: error.message });
    }
  } else if (req.method === 'PUT') {
    // Update template fields
    const { title, explanation, tags, code, stdin, language } = req.body;

    try {
      const updatedTemplate = await prisma.template.update({
        where: { id: parseInt(id) },
        data: {
          title,
          explanation,
          tags,
          code,
          stdin: stdin ? JSON.stringify(stdin) : undefined,
          language
        }
      });
      res.status(200).json({ message: 'Template updated successfully', template: updatedTemplate });
    } catch (error) {
      console.error("Template update error:", error);
      res.status(500).json({ error: 'Failed to update template', details: error.message });
    }
  } else if (req.method === 'DELETE') {
    // Delete template by ID
    try {
      await prisma.template.delete({
        where: { id: parseInt(id) }
      });
      res.status(200).json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error("Template deletion error:", error);
      res.status(500).json({ error: 'Failed to delete template', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
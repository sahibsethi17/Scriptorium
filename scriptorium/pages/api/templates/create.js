import { prisma } from "@/utils/db";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, explanation, tags, code, stdin = [], language, forkedFrom = null } = req.body;

  try {
    // Ensure default user exists
    let defaultUser = await prisma.user.findUnique({
      where: { email: "defaultuser@example.com" },
    });

    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: "defaultuser@example.com",
          password: "defaultpassword", // Use a strong password in real scenarios
          username: "defaultuser",
          firstName: "Default",
          lastName: "User",
          phoneNumber: BigInt(1234567890),
        },
      });
    }

    const userId = defaultUser.id;

    // Validate required fields
    if (!title || !explanation || !code || !language) {
      return res
        .status(400)
        .json({ error: 'Title, explanation, code, and language are required' });
    }

    // Ensure all fields are properly populated
    const processedStdin = stdin && stdin.length > 0 ? JSON.stringify(stdin) : null; // Convert stdin to JSON string or null
    const processedTags = tags ? tags.trim() : null; // Ensure tags is null or a trimmed string
    const processedForkedFrom = forkedFrom || null; // Default to null if not provided

    

    // Prisma create call with all required and optional fields
    const template = await prisma.template.create({
      data: {
        userId,
        title,
        explanation,
        tags: processedTags,
        code: code.trim(),
        stdin: processedStdin,
        language,
        forkedFrom: processedForkedFrom,
      },
    });

    res.status(201).json({ template });
  } catch (error) {
    console.error('Template creation error:', error);
    res.status(500).json({
      error: 'Template creation failed',
      details: error.message,
    });
  }
}
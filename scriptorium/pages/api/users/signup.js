import { prisma } from "@/utils/db";
import { hashPassword } from "@/utils/auth";
import formidable from "formidable";
import path from "path";
import fs from "fs/promises";

// Disable Next.js default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to initialize formidable
const parseForm = (req) => {
  const form = formidable({
    uploadDir: path.join(process.cwd(), "public/uploads/avatars"),
    keepExtensions: true,
    filename: (name, ext) => `${name}-${Date.now()}${ext}`,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  if (req.method === 'POST') {

  try {
    const { fields, files } = await parseForm(req);

    const { email, password, username, firstName, lastName, phoneNumber, avatar, role} = fields;

    if (!email || !password || !username || !firstName || !lastName || !phoneNumber) {
      return res.status(400).json({ error: "Please provide all the required fields." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    const hashedPassword = await hashPassword(password);

    // Set avatar path if uploaded
    const avatarPath = files.avatar ? `/uploads/avatars/${path.basename(files.avatar.filepath)}` : null;

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber: BigInt(phoneNumber),
        avatar: avatarPath,
        role
      },
    });

    const serializedUser = JSON.stringify(user, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );

    return res.status(201).json({ message: "User created successfully", user: serializedUser });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "User creation failed. Please try again later." });
  }
}
}
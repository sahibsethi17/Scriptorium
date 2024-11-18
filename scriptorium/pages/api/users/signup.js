import { prisma } from "../../../utils/db";
import { hashPassword } from "../../../utils/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { email, password, username, firstName, lastName, phoneNumber, avatar, role } = req.body;

    // Check for missing required fields
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

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber: BigInt(phoneNumber),
        avatar: avatar || null,
        role,
      },
    });

    // Exclude the password field from the response
    const { password: _, ...userWithoutPassword } = user;

    // Serialize the user object to handle BigInt values
    const serializedUser = JSON.stringify(userWithoutPassword, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );

    // Sends the response without the password
    return res.status(201).json({ message: "User created successfully", user: JSON.parse(serializedUser) });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "User creation failed. Please try again later." });
  }
}

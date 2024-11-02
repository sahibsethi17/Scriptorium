import { prisma } from "@/utils/db";
import { hashPassword } from "@/utils/auth";


export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password, username, firstName, lastName, phoneNumber, role } = req.body;
    
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

    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

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
          phoneNumber,
          role
        },
      });

      const serializedUser = JSON.stringify(user, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      );

      return res.status(201).send({ message: 'User created successfully', serializedUser });

      
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ error: 'User creation failed. Please try again later.' });
    }
    
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

import { prisma } from "@/utils/db";
import bcrypt from 'bcryptjs';
import { generateToken, comparePassword } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = generateToken({ userId: user.id, username: user.username });

      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

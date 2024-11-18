import { prisma } from "../../../utils/db";
import { generateAccessToken, generateRefreshToken, comparePassword } from "../../../utils/auth";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate tokens
      const accessToken = generateAccessToken({ userId: user.id, username: user.username });
      const refreshToken = generateRefreshToken({ userId: user.id, username: user.username });

      // Store refresh token in the database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      // Set the refresh token cookie
      const refreshTokenCookie = serialize('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // Set to false for local development
        sameSite: 'Lax', // Use 'Lax' for better compatibility
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      res.setHeader('Set-Cookie', refreshTokenCookie);
      res.status(200).json({ message: 'Login successful', accessToken });
    } catch (error) {
      console.error("Login API Error:", error);
      res.status(500).json({ error: 'Login failed' });
    }
  } else if (req.method === 'OPTIONS') {
    res.status(204).end();
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

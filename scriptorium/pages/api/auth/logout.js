import { serialize } from 'cookie';
import { prisma } from "../../../utils/db";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ error: 'No refresh token provided.' });
  }

  try {
    // Invalidate the refresh token in the database
    await prisma.user.updateMany({
      where: { refreshToken },
      data: { refreshToken: null },
    });

    // Clear the refreshToken and authToken cookies
    res.setHeader('Set-Cookie', [
      serialize('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        expires: new Date(0),
        path: '/',
      }),
      serialize('authToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        expires: new Date(0),
        path: '/',
      }),
    ]);

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({ error: 'Logout failed. Please try again later.' });
  }
}

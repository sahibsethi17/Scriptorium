import { prisma } from "@/utils/db"; 

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: 'No refresh token found' });
  }

  try {
    await prisma.token.delete({
      where: { token: refreshToken },
    });

    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict', path: '/' });

    return res.status(200).json({ message: 'Successfully logged out' });
  } catch (error) {
    return res.status(500).json({ message: 'Logout failed', error });
  }
}

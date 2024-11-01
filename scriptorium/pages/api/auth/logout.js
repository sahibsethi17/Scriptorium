import { prisma } from "@/utils/db"; 
import cookie from "cookie";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const cookies = cookie.parse(req.headers.cookie || '');
  const refreshToken = cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: 'No refresh token found' });
  }

  res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict', path: '/' });

  return res.status(200).json({ message: 'Successfully logged out' });
}

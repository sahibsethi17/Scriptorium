import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Clear cookie by setting it with an expired date
    res.setHeader(
      'Set-Cookie',
      serialize('authToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0),
        path: '/',
      })
    );

    return res.status(200).json({ message: 'Logged out successfully' });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

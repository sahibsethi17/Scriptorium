import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const refreshTokenHandler = async (req, res) => {
  cookieParser()(req, res, () => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token provided' });
      }

      const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      const payload = { userId: user.userId, username: user.username };
      const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

      return res.status(200).json({ accessToken: newAccessToken });

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Refresh token expired' });
      }
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
  });
};

export default refreshTokenHandler;

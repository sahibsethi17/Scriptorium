const refreshTokenHandler = (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token provided' });
  
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid refresh token' });
  
      const payload = { username: user.username, role: user.role };
      const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  
      return res.json({ accessToken: newAccessToken });
    });
  };
  
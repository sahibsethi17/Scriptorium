import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS);
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN;

export async function hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

export function generateAccessToken(obj) {
    const expiresIn = ACCESS_TOKEN_EXPIRES_IN;
    try {
        return jwt.sign(obj, ACCESS_TOKEN_SECRET || 'defaultAccessSecret', { 
            expiresIn: expiresIn,
            algorithm: 'HS256' 
        });
    } catch (error) {
        console.error('Error generating access token:', error);
        throw new Error('Access token generation failed');
    }
}

export function generateRefreshToken(obj) {
    const expiresIn = REFRESH_TOKEN_EXPIRES_IN;
    try {
        return jwt.sign(obj, REFRESH_TOKEN_SECRET || 'defaultRefreshSecret', { 
            expiresIn: expiresIn,
            algorithm: 'HS256' 
        });
    } catch (error) {
        console.error('Error generating refresh token:', error);
        throw new Error('Refresh token generation failed');
    }
}

export function isTokenExpired(token) {
    try {
      const decodedToken = jwt.decode(token);
      
      if (!decodedToken || !decodedToken.exp) {
        return true;
      }
  
      // Convert expiration to milliseconds and compare with current time
      const isExpired = decodedToken.exp * 1000 < Date.now();
      return isExpired;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

export function verifyToken(token) {
    if (!token?.startsWith("Bearer ")) {
        return null;
    }

    token = token.split(" ")[1];

    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (err) {
        return null;
    }
}

export async function verifyAuth(req) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return null;
  
      try {
        const user = jwt.verify(token, ACCESS_TOKEN_SECRET);
        return user.userId;
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          const refreshToken = req.cookies.refreshToken;
          if (!refreshToken) {
            return { error: 'User is not logged in.', status: 401 };
          }
          
          if (isTokenExpired(refreshToken)) {
            try {
              const response = await axios.post('/api/logout');
              return response.data;
            } catch (logoutError) {
              console.error('Logout failed:', logoutError);
              throw logoutError;
            }
          } else {
            const user = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
            const payload = { userId: user.userId, username: user.username };
            const newAccessToken = generateAccessToken(payload);
            return { userId: user.userId, newAccessToken };
          }
        } else {
          console.error('Token verification error:', error);
          return null;
        }
      }
    } catch (error) {
      console.error('An error occurred in verifyAuth:', error);
      return null;
    }
  }
  


  
//   const refreshTokenHandler = async (req, res) => {
//     try {
//     const refreshToken = req.cookies.refreshToken;
//     if (!refreshToken) {
//         return res.status(401).json({ error: 'This user is not logged in.' });
//     }

//     const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

//     const payload = { userId: user.userId, username: user.username };
//     const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

//     return res.status(200).json({ accessToken: newAccessToken });

//     } catch (error) {
//     if (error.name === 'TokenExpiredError') {
//         return res.status(403).json({ error: 'Refresh token expired' }); // 
//     }
//     return res.status(403).json({ error: 'Invalid refresh token' });
//     }
//   };
  
//   export default refreshTokenHandler;
  

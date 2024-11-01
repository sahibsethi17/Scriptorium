import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';

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
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;  // Get current time in seconds (Unix time)
  
    return decoded.exp < currentTime;  // If true, the token is expired
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

export function verifyAuth(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}


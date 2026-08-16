import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../../config/prisma.js';

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = '15m';
const refreshTokenExpiration = '7d';

export async function signUp({email, password,name}) {

    const existingUser = await prisma.user.findUnique({where: {email}});
    if (existingUser) {
        const err = new Error('User already exists with this email');
        err.status = 409;
        throw err;
    }
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({data: {email, password: passwordHash, name}});

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    return { user: sanitizeUser(user), accessToken, refreshToken };
}

export async function login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
   
    // Reject if user doesn't exist OR is soft-deleted
    if (!user || user.deletedAt) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }
   
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }
   
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
   
    return { user: sanitizeUser(user), accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      const err = new Error('No refresh token provided');
      err.statusCode = 401;
      throw err;
    }
   
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }
   
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.deletedAt) {
      const error = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }
   
    const newAccessToken = signAccessToken(user);
    return { accessToken: newAccessToken };
  }
   
  function signAccessToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );
  }
   
  function signRefreshToken(user) {
    return jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );
  }
   
  // Never send passwordHash back to the client, ever
  function sanitizeUser(user) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

// ==========================================
// AUTHENTICATION UTILITIES - DOTCOIN PLATFORM
// ==========================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Fallback JWT secret for local development
const JWT_SECRET = process.env.JWT_SECRET || 'dotcoin-default-jwt-secret-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Hashes a plain text password using bcrypt with 10 rounds of salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plain text password against a stored hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Signs a JWT session token valid for 7 days
 */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies a JWT token and returns the decoded payload or null if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}
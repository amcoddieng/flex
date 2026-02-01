import jwt from 'jsonwebtoken';

const SECRET = 'cle_a_modifier';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
  avatar?: string;
}

export interface ExtendedTokenPayload extends TokenPayload {
  firstName?: string | null;
  lastName?: string | null;
}

export function generateToken(payload: ExtendedTokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): ExtendedTokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as ExtendedTokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
}

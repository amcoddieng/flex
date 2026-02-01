import jwt from 'jsonwebtoken';

const SECRET = 'cle_a_modifier';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export interface ExtendedTokenPayload extends TokenPayload {
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
}

export function generateToken(payload: ExtendedTokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

// Client-side JWT decoder (without verification - for client use only)
export function decodeToken(token: string): ExtendedTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload as ExtendedTokenPayload;
  } catch (error) {
    console.error('Token decode failed:', error);
    return null;
  }
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

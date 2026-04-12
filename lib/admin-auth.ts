import { decodeToken } from "@/lib/jwt";
import { NextRequest } from "next/server";

export function verifyAdmin(request: NextRequest): any {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  const token = parts[1];
  const decoded = decodeToken(token);
  
  if (!decoded || decoded.role !== 'ADMIN') {
    return null;
  }
  
  return decoded;
}

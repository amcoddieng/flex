import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'dieng',
  password: process.env.DB_PASSWORD || 'Papa1997',
  database: process.env.DB_NAME || 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const verifyAdmin = (request: NextRequest): boolean => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return false;
  const token = parts[1];
  const decoded = verifyToken(token);
  return decoded?.role === 'ADMIN';
};

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Accès refusé. Vous devez être administrateur.' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const validationStatus = searchParams.get('validation_status');

    const offset = (page - 1) * limit;
    const safeLimit = Math.max(1, Math.min(1000, limit));
    const safeOffset = Math.max(0, offset);

    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          u.id, 
          u.email, 
          u.role, 
          u.blocked,
          u.created_at,
          ep.id as profile_id,
          ep.company_name,
          ep.contact_person,
          ep.phone,
          ep.email as contact_email,
          ep.address,
          ep.description,
          ep.validation_status
        FROM user u
        LEFT JOIN employer_profile ep ON u.id = ep.user_id
        WHERE u.role = 'EMPLOYER'
      `;

      const params: any[] = [];

      if (search) {
        query += ` AND (u.email LIKE ? OR ep.company_name LIKE ? OR ep.contact_person LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (validationStatus) {
        query += ` AND ep.validation_status = ?`;
        params.push(validationStatus);
      }

      query += ` ORDER BY u.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

      const [result]: any = await connection.execute(query, params);
      const employers = Array.isArray(result) ? result : [];

      // Count
      let countQuery = `
        SELECT COUNT(*) as total FROM user u
        LEFT JOIN employer_profile ep ON u.id = ep.user_id
        WHERE u.role = 'EMPLOYER'
      `;
      const countParams: any[] = [];
      if (search) {
        countQuery += ` AND (u.email LIKE ? OR ep.company_name LIKE ? OR ep.contact_person LIKE ?)`;
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (validationStatus) {
        countQuery += ` AND ep.validation_status = ?`;
        countParams.push(validationStatus);
      }

      const [countResult]: any = await connection.execute(countQuery, countParams);
      const total = Array.isArray(countResult) && countResult.length > 0 ? countResult[0].total : 0;

      return NextResponse.json({ success: true, data: employers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur GET /api/admin/employers:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

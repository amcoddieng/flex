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

// Helper: Verify employer token
const verifyEmployer = (request: NextRequest): { role: string; userId: string } | null => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  const token = parts[1];
  const decoded = verifyToken(token);
  
  if (decoded?.role !== 'EMPLOYER') return null;
  return decoded as { role: string; userId: string };
};

// GET - List applications for employer's jobs
export async function GET(request: NextRequest) {
  try {
    const user = verifyEmployer(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const userId = parseInt(user.userId, 10) || 0;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const offset = (page - 1) * limit;
    const safeLimit = Math.max(1, Math.min(1000, limit));
    const safeOffset = Math.max(0, offset);

    const connection = await pool.getConnection();

    try {
      let query = `
        SELECT ja.id, ja.job_id, ja.student_id, ja.status, ja.applied_at,
               sp.first_name, sp.last_name, u.email, j.title as job_title
        FROM job_application ja
        JOIN job_offer j ON ja.job_id = j.id
        JOIN student_profile sp ON ja.student_id = sp.id
        JOIN user u ON sp.user_id = u.id
        WHERE j.employer_id = (SELECT id FROM employer_profile WHERE user_id = ?)
      `;
      const params: any[] = [userId];

      if (search) {
        query += ` AND (sp.first_name LIKE ? OR sp.last_name LIKE ? OR u.email LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (status) {
        query += ` AND ja.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY ja.applied_at DESC LIMIT ? OFFSET ?`;
      params.push(safeLimit, safeOffset);

      const [apps] = await connection.execute(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total FROM job_application ja
        JOIN job_offer j ON ja.job_id = j.id
        WHERE j.employer_id = (SELECT id FROM employer_profile WHERE user_id = ?)
      `;
      const countParams: any[] = [userId];

      if (search) {
        countQuery += ` AND (sp.first_name LIKE ? OR sp.last_name LIKE ? OR u.email LIKE ?)`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }

      if (status) {
        countQuery += ` AND ja.status = ?`;
        countParams.push(status);
      }

      const [countRows] = await connection.execute(countQuery, countParams);
      const total = (countRows as any)[0]?.total || 0;

      connection.release();

      return NextResponse.json(
        {
          success: true,
          data: apps || [],
          pagination: { page, limit, total, pages: Math.ceil(total / safeLimit) },
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('GET /api/employer/applications error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

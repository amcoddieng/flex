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

// GET - List employer's job offers
export async function GET(request: NextRequest) {
  try {
    const user = verifyEmployer(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const userId = Number(user.userId);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { error: 'Utilisateur invalide' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    const pageStr = searchParams.get('page') || '1';
    const limitStr = searchParams.get('limit') || '20';
    
    const page = Math.max(1, parseInt(pageStr, 10) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(limitStr, 10) || 20));

    const safeLimit = Number(limit);
    const safePage = Number(page);
    const safeOffset = Number((safePage - 1) * safeLimit);

    const search = searchParams.get('search');

    const connection = await pool.getConnection();

    try {
      let query = `
        SELECT j.id, j.title, j.location, j.is_active, j.blocked, j.posted_at, j.description,
               (SELECT COUNT(*) FROM job_application WHERE job_id = j.id) as applicants
        FROM job_offer j
        WHERE j.employer_id = (
          SELECT id FROM employer_profile WHERE user_id = ?
        )
      `;

      const params: any[] = [userId];

      if (search) {
        query += ` AND (j.title LIKE ? OR j.location LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      // LIMIT and OFFSET must be injected directly, not as parameters
      query += ` ORDER BY j.posted_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

      const [jobs] = await connection.execute(query, params);

      // Count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM job_offer j
        WHERE j.employer_id = (
          SELECT id FROM employer_profile WHERE user_id = ?
        )
      `;

      const countParams: any[] = [userId];

      if (search) {
        countQuery += ` AND (j.title LIKE ? OR j.location LIKE ?)`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm);
      }

      const [countRows] = await connection.execute(countQuery, countParams);
      const total = (countRows as any)[0]?.total || 0;

      return NextResponse.json(
        {
          success: true,
          data: jobs || [],
          pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            pages: Math.ceil(total / safeLimit),
          },
        },
        { status: 200 }
      );
    } finally {
      connection.release(); // ✅ UNE SEULE FOIS
    }
  } catch (err: any) {
    console.error('GET /api/employer/jobs error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

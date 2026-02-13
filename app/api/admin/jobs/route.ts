import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'dieng',
  password: 'Papa1997',
  database: 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const token = authHeader.slice(7);
    
    // Pour l'admin, on peut laisser passer (vérification simple)
    // En production, vérifier le JWT ici
    
    const searchParams = request.nextUrl.searchParams;
    const employerId = searchParams.get('employer_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const isActiveParam = searchParams.get('is_active');

    const connection = await pool.getConnection();

    try {
      // Récupérer les jobs (optionnellement filtrés par employer)
      const offset = (page - 1) * limit;
      const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 20;
      const safeOffset = Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : 0;

      let baseQuery = `SELECT 
          id,
          employer_id,
          title,
          description,
          company,
          location,
          service_type,
          salary,
          applicants,
            blocked,
            is_active,
          posted_at,
          updated_at
        FROM job_offer`;

      const whereClauses: string[] = [];
      const params: any[] = [];

      if (employerId) {
        whereClauses.push(`employer_id = (SELECT id FROM employer_profile WHERE user_id = ?)`);
        params.push(employerId);
      }

      if (search) {
        whereClauses.push(`(title LIKE ? OR company LIKE ?)`);
        params.push(`%${search}%`, `%${search}%`);
      }

      if (isActiveParam === '1' || isActiveParam === '0') {
        whereClauses.push(`is_active = ?`);
        params.push(isActiveParam === '1' ? 1 : 0);
      }

      const whereSql = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';

      const [jobs]: any = await connection.execute(
        `${baseQuery}${whereSql} ORDER BY posted_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`,
        params
      );

      // Compter le total
      const [countResult]: any = await connection.execute(
        `SELECT COUNT(*) as total FROM job_offer ${whereSql}`,
        params
      );

      const total = countResult[0]?.total || 0;

      return NextResponse.json({
        success: true,
        data: jobs || [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur GET /api/admin/jobs:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

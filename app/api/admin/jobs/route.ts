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

    if (!employerId) {
      return NextResponse.json({ error: 'employer_id requis' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Récupérer les jobs de l'employeur
      const offset = (page - 1) * limit;
      const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 20;
      const safeOffset = Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : 0;

      const [jobs]: any = await connection.execute(
        `SELECT 
          id,
          employer_id,
          title,
          description,
          company,
          location,
          service_type,
          salary,
          applicants,
          is_active,
          posted_at,
          updated_at
        FROM job_offer
        WHERE employer_id = (SELECT id FROM employer_profile WHERE user_id = ?)
        ORDER BY posted_at DESC
        LIMIT ${safeLimit} OFFSET ${safeOffset}`,
        [employerId]
      );

      // Compter le total
      const [countResult]: any = await connection.execute(
        `SELECT COUNT(*) as total FROM job_offer 
         WHERE employer_id = (SELECT id FROM employer_profile WHERE user_id = ?)`,
        [employerId]
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

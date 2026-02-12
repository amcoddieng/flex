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

    const searchParams = request.nextUrl.searchParams;
    const studentId = parseInt(searchParams.get('student_id') || '0');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!studentId || studentId === 0) {
      return NextResponse.json({ error: 'student_id requis et doit être un nombre' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Récupérer les candidatures de l'étudiant avec infos du job
      const offset = (page - 1) * limit;
      const safeLimit = Math.min(limit, 100);
      const safeOffset = Math.max(offset, 0);

      const [applications]: any = await connection.execute(
        `SELECT 
          ja.id,
          ja.job_id,
          ja.status,
          ja.applied_at,
          ja.message,
          ja.experience,
          jo.title as job_title,
          jo.description as job_description,
          jo.company,
          jo.location,
          jo.salary,
          jo.service_type,
          jo.is_active,
          ep.company_name as employer_company
        FROM job_application ja
        LEFT JOIN job_offer jo ON ja.job_id = jo.id
        LEFT JOIN employer_profile ep ON jo.employer_id = ep.id
        WHERE ja.student_id = ?
        ORDER BY ja.applied_at DESC
        LIMIT ${safeLimit} OFFSET ${safeOffset}`,
        [studentId]
      );

      // Compter le total
      const [countResult]: any = await connection.execute(
        `SELECT COUNT(*) as total FROM job_application WHERE student_id = ?`,
        [studentId]
      );

      const total = countResult[0]?.total || 0;

      return NextResponse.json({
        success: true,
        data: applications || [],
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
    console.error('Erreur GET /api/admin/applications:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

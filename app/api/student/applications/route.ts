import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'dieng',
  password: process.env.DB_PASSWORD || 'Papa1997',
  database: process.env.DB_NAME || 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // 🔐 Sécuriser userId
    const userId = Number(payload.userId);
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;

    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.max(1, Number(searchParams.get('limit') || 20));
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    try {
      // 🔎 DEBUG (tu peux supprimer après test)
      console.log('userId:', userId);
      console.log('limit:', limit);
      console.log('offset:', offset);

      const [applications] = await connection.execute(
        `
        SELECT 
          ja.id,
          ja.job_id,
          ja.student_id,
          ja.status,
          ja.applied_at,
          ja.message as cover_letter,
          jo.title,
          jo.description,
          jo.location,
          jo.availability as job_type,
          jo.salary,
          jo.posted_at as job_created_at,
          ep.company_name,
          ep.contact_person,
          ep.email as employer_email,
          ep.phone as employer_phone
        FROM job_application ja
        JOIN job_offer jo ON ja.job_id = jo.id
        JOIN employer_profile ep ON jo.employer_id = ep.id
        WHERE ja.student_id = ?
        ORDER BY ja.applied_at DESC
        LIMIT ? OFFSET ?
        `,
        [userId, limit, offset]
      );

      const [countResult] = await connection.execute(
        `
        SELECT COUNT(*) as total
        FROM job_application
        WHERE student_id = ?
        `,
        [userId]
      );

      const total = (countResult as any[])[0].total;

      const formattedApplications = (applications as any[]).map(app => ({
        id: app.id,
        job_id: app.job_id,
        student_id: app.student_id,
        status: app.status,
        applied_at: app.applied_at,
        cover_letter: app.cover_letter,
        job: {
          id: app.job_id,
          title: app.title,
          description: app.description,
          location: app.location,
          job_type: app.job_type,
          salary: app.salary,
          created_at: app.job_created_at,
          employer: {
            company_name: app.company_name,
            contact_person: app.contact_person,
            email: app.employer_email,
            phone: app.employer_phone
          }
        }
      }));

      return NextResponse.json({
        applications: formattedApplications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur récupération candidatures étudiant:', error);

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === 'production'
            ? 'Erreur serveur'
            : error.message,
      },
      { status: 500 }
    );
  }
}

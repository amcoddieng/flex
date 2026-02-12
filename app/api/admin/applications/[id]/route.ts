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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const applicationId = parseInt(params.id);
    if (isNaN(applicationId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Récupérer la candidature avec les infos du job et l'étudiant
      const [appResult]: any = await connection.execute(
        `SELECT 
          ja.id,
          ja.job_id,
          ja.student_id,
          ja.status,
          ja.message,
          ja.availability,
          ja.experience,
          ja.start_date,
          ja.applied_at,
          ja.interview_date,
          ja.interview_time,
          ja.interview_location,
          jo.title as job_title,
          jo.description as job_description,
          jo.company,
          jo.location as job_location,
          jo.salary,
          jo.service_type,
          jo.requirements,
          jo.is_active,
          sp.first_name,
          sp.last_name,
          sp.phone,
          sp.email,
          sp.university,
          sp.department,
          u.email as user_email
        FROM job_application ja
        LEFT JOIN job_offer jo ON ja.job_id = jo.id
        LEFT JOIN student_profile sp ON ja.student_id = sp.id
        LEFT JOIN user u ON sp.user_id = u.id
        WHERE ja.id = ?`,
        [applicationId]
      );

      const application = appResult[0];
      if (!application) {
        return NextResponse.json({ error: 'Candidature non trouvée' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: application
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur GET /api/admin/applications/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

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

    const jobId = parseInt(params.id);
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Récupérer le job
      const [jobResult]: any = await connection.execute(
        `SELECT 
          id,
          employer_id,
          title,
          description,
          company,
          location,
          service_type,
          salary,
          availability,
          requirements,
          contact_email,
          contact_phone,
          applicants,
          is_active,
          posted_at,
          updated_at
        FROM job_offer
        WHERE id = ?`,
        [jobId]
      );

      const job = jobResult[0];
      if (!job) {
        return NextResponse.json({ error: 'Job non trouvé' }, { status: 404 });
      }

      // Récupérer les candidatures pour ce job
      const [applicants]: any = await connection.execute(
        `SELECT 
          ja.id,
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
          sp.first_name,
          sp.last_name,
          sp.phone,
          sp.email,
          sp.university,
          sp.department,
          u.email as user_email
        FROM job_application ja
        LEFT JOIN student_profile sp ON ja.student_id = sp.id
        LEFT JOIN user u ON sp.user_id = u.id
        WHERE ja.job_id = ?
        ORDER BY ja.applied_at DESC`,
        [jobId]
      );

      return NextResponse.json({
        success: true,
        data: {
          job,
          applicants: applicants || []
        }
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur GET /api/admin/jobs/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

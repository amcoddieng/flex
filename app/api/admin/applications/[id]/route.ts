import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken } from '@/lib/jwt';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const resolvedParams = await params;
    const applicationId = parseInt(resolvedParams.id);
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

// PUT - Mettre à jour le statut d'une candidature
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { id } = await params;
    const applicationId = parseInt(id);
    
    if (isNaN(applicationId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['PENDING', 'ACCEPTED', 'REJECTED', 'INTERVIEW'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      await connection.execute(
        'UPDATE job_application SET status = ? WHERE id = ?',
        [status, applicationId]
      );

      return NextResponse.json({
        success: true,
        message: 'Statut mis à jour avec succès',
        data: { id: applicationId, status }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Erreur lors de la mise à jour du statut',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * POST /api/job/[id]/apply
 * Submit a job application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id, 10);
    if (!jobId) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Accès refusé. Seuls les étudiants peuvent postuler.' },
        { status: 403 }
      );
    }

    const userId = parseInt(decoded.userId, 10);
    const body = await request.json();
    const { message, availability, experience, start_date } = body;

    const connection = await pool.getConnection();

    try {
      // Get student profile
      const [studentRows]: any = await connection.execute(
        'SELECT id FROM student_profile WHERE user_id = ?',
        [userId]
      );

      if (!Array.isArray(studentRows) || studentRows.length === 0) {
        return NextResponse.json(
          { error: 'Profil étudiant introuvable' },
          { status: 404 }
        );
      }

      const studentId = studentRows[0].id;

      // Check if already applied
      const [existingApp]: any = await connection.execute(
        'SELECT id FROM job_application WHERE job_id = ? AND student_id = ?',
        [jobId, studentId]
      );

      if (Array.isArray(existingApp) && existingApp.length > 0) {
        return NextResponse.json(
          { error: 'Vous avez déjà postulé à cette offre' },
          { status: 400 }
        );
      }

      // Verify job exists and is active
      const [jobRows]: any = await connection.execute(
        'SELECT id FROM job_offer WHERE id = ? AND is_active = 1 AND blocked = 0',
        [jobId]
      );

      if (!Array.isArray(jobRows) || jobRows.length === 0) {
        return NextResponse.json(
          { error: 'Offre non trouvée ou inactive' },
          { status: 404 }
        );
      }

      // Create application
      const [result]: any = await connection.execute(
        `INSERT INTO job_application 
        (job_id, student_id, message, availability, experience, start_date, status, applied_at)
        VALUES (?, ?, ?, ?, ?, ?, 'PENDING', NOW())`,
        [jobId, studentId, message || null, availability || null, experience || null, start_date || null]
      );

      // Update applicants count
      await connection.execute(
        'UPDATE job_offer SET applicants = applicants + 1 WHERE id = ?',
        [jobId]
      );

      return NextResponse.json(
        {
          success: true,
          applicationId: result.insertId,
          message: 'Candidature envoyée avec succès',
        },
        { status: 201 }
      );
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur candidature:', error);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Erreur lors de la soumission de la candidature'
        : error?.message || String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/job/[id]/application-status
 * Check if user has applied to this job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const url = new URL(request.url);
    const isStatusCheck = url.pathname.includes('application-status');

    if (!isStatusCheck) {
      // Regular GET for job details is handled in route.ts
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    const { id } = await params;
    const jobId = parseInt(id, 10);
    if (!jobId) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    // Check if authenticated
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: true, hasApplied: false }
      );
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'STUDENT') {
      return NextResponse.json(
        { success: true, hasApplied: false }
      );
    }

    const userId = parseInt(decoded.userId, 10);

    const connection = await pool.getConnection();

    try {
      // Get student profile
      const [studentRows]: any = await connection.execute(
        'SELECT id FROM student_profile WHERE user_id = ?',
        [userId]
      );

      if (!Array.isArray(studentRows) || studentRows.length === 0) {
        return NextResponse.json({
          success: true,
          hasApplied: false,
        });
      }

      const studentId = studentRows[0].id;

      // Check if applied
      const [applications]: any = await connection.execute(
        'SELECT id, status FROM job_application WHERE job_id = ? AND student_id = ?',
        [jobId, studentId]
      );

      const hasApplied = Array.isArray(applications) && applications.length > 0;
      const status = hasApplied ? applications[0].status : null;

      return NextResponse.json({
        success: true,
        hasApplied,
        status,
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur vérification candidature:', error);
    return NextResponse.json(
      { success: true, hasApplied: false }
    );
  }
}

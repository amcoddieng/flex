import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper function pour valider les dates
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}
// commentaire de cette fonction : cette fonction permet de récupérer toutes les candidatures d'un étudiant
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

      // Get student_id from user_id
      const [studentResult] = await connection.execute(
        'SELECT id FROM student_profile WHERE user_id = ?',
        [userId]
      );

      if (!Array.isArray(studentResult) || studentResult.length === 0) {
        return NextResponse.json(
          { error: 'Profil étudiant non trouvé' },
          { status: 404 }
        );
      }

      const studentId = (studentResult as any[])[0].id;
      console.log('studentId:', studentId);

      const [applications] = await connection.execute(
        `
        SELECT 
          ja.id,
          ja.job_id,
          ja.student_id,
          ja.status,
          ja.applied_at,
          ja.message as cover_letter,
          ja.interview_date,
          ja.interview_time,
          ja.interview_location,
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
        [studentId, limit, offset]
      );

      const [countResult] = await connection.execute(
        `
        SELECT COUNT(*) as total
        FROM job_application
        WHERE student_id = ?
        `,
        [studentId]
      );

      const total = (countResult as any[])[0].total;

      const formattedApplications = (applications as any[]).map(app => ({
        id: app.id,
        job_id: app.job_id,
        student_id: app.student_id,
        status: app.status,
        applied_at: app.applied_at,
        cover_letter: app.cover_letter,
        interview_date: app.interview_date,
        interview_time: app.interview_time,
        interview_location: app.interview_location,
        updated_at: app.updated_at,
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
        success: true,
        data: formattedApplications,
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
// commentaire de cette fonction : cette fonction permet de créer une nouvelle candidature
// route pour acceder avec postman : POST /api/student/applications
// POST - Create new application
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Sécuriser userId
    const userId = Number(payload.userId);
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      job_id, 
      message, 
      availability, 
      experience, 
      start_date, 
      interview_date, 
      interview_time, 
      interview_location 
    } = body;

    // Validation
    if (!job_id || isNaN(Number(job_id))) {
      return NextResponse.json({ error: 'ID de job invalide' }, { status: 400 });
    }

    // Validation optionnelle des dates
    if (start_date && !isValidDate(start_date)) {
      return NextResponse.json({ error: 'Date de début invalide' }, { status: 400 });
    }

    if (interview_date && !isValidDate(interview_date)) {
      return NextResponse.json({ error: 'Date d\'entretien invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Vérifier si le job existe et est actif
      const [jobCheck] = await connection.execute(
        `SELECT id, is_active, blocked FROM job_offer WHERE id = ?`,
        [job_id]
      );

      if (!Array.isArray(jobCheck) || jobCheck.length === 0) {
        return NextResponse.json({ error: 'Offre d\'emploi non trouvée' }, { status: 404 });
      }

      const job = (jobCheck as any)[0];
      if (!job.is_active || job.blocked) {
        return NextResponse.json({ error: 'Offre d\'emploi non disponible' }, { status: 400 });
      }

      // Obtenir l'ID du profil étudiant
      const [studentProfile] = await connection.execute(
        `SELECT id FROM student_profile WHERE user_id = ?`,
        [userId]
      );

      if (!Array.isArray(studentProfile) || studentProfile.length === 0) {
        return NextResponse.json({ error: 'Profil étudiant non trouvé' }, { status: 404 });
      }

      const studentId = (studentProfile as any)[0].id;

      // Vérifier si l'étudiant a déjà postulé
      const [existingApplication] = await connection.execute(
        `SELECT id FROM job_application WHERE job_id = ? AND student_id = ?`,
        [job_id, studentId]
      );

      if (Array.isArray(existingApplication) && existingApplication.length > 0) {
        return NextResponse.json({ error: 'Vous avez déjà postulé à cette offre' }, { status: 400 });
      }

      // Créer la candidature
      const [result] = await connection.execute(
        `INSERT INTO job_application (
          job_id, 
          student_id, 
          status, 
          message, 
          availability, 
          experience, 
          start_date, 
          interview_date, 
          interview_time, 
          interview_location, 
          applied_at
        ) VALUES (?, ?, 'PENDING', ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          job_id, 
          studentId, 
          message || null, 
          availability || null, 
          experience || null, 
          start_date || null, 
          interview_date || null, 
          interview_time || null, 
          interview_location || null
        ]
      );

      const applicationId = (result as any).insertId;

      // Mettre à jour le nombre de candidats dans l'offre
      await connection.execute(
        `UPDATE job_offer SET applicants = applicants + 1 WHERE id = ?`,
        [job_id]
      );

      return NextResponse.json({
        success: true,
        message: 'Candidature envoyée avec succès',
        data: { id: applicationId }
      }, { status: 201 });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur création candidature:', error);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === 'production'
          ? 'Erreur serveur'
          : error.message,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// GET - Récupérer toutes les candidatures pour une offre d'emploi spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      return NextResponse.json(
        { error: 'ID de job invalide' },
        { status: 400 }
      );
    }

    const user = verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const connection = await pool.getConnection();

    try {
      const query = `
        SELECT 
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
          sp.first_name,
          sp.last_name,
          sp.email,
          sp.phone,
          sp.university,
          sp.department,
          sp.year_of_study
        FROM job_application ja
        LEFT JOIN student_profile sp ON ja.student_id = sp.id
        WHERE ja.job_id = ?
        ORDER BY ja.applied_at DESC
      `;

      const [applications] = await connection.execute(query, [jobId]);

      connection.release();

      // Formater les données pour inclure les informations de l'étudiant
      const formattedApplications = (applications as any[]).map(app => ({
        id: app.id,
        job_id: app.job_id,
        student_id: app.student_id,
        status: app.status,
        message: app.message,
        availability: app.availability,
        experience: app.experience,
        start_date: app.start_date,
        applied_at: app.applied_at,
        interview_date: app.interview_date,
        interview_time: app.interview_time,
        interview_location: app.interview_location,
        student: {
          first_name: app.first_name,
          last_name: app.last_name,
          email: app.email,
          phone: app.phone,
          university: app.university,
          department: app.department,
          year_of_study: app.year_of_study
        }
      }));

      return NextResponse.json({
        success: true,
        data: formattedApplications
      });

    } catch (dbError) {
      connection.release();
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Erreur base de données' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Admin job applications GET error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
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
    const { id } = await params;
    const user = verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { applicationId, status, interview_date, interview_time, interview_location } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Paramètres invalides' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      const query = `
        UPDATE job_application 
        SET status = ?, interview_date = ?, interview_time = ?, interview_location = ?
        WHERE id = ?
      `;

      await connection.execute(query, [
        status,
        interview_date || null,
        interview_time || null,
        interview_location || null,
        applicationId
      ]);

      connection.release();

      return NextResponse.json({
        success: true,
        message: 'Candidature mise à jour avec succès'
      });

    } catch (dbError) {
      connection.release();
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Erreur base de données' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Admin job applications PUT error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

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

// GET - Récupérer le profil d'un étudiant
export async function GET(
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

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID utilisateur invalide' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      const query = `
        SELECT 
          sp.id,
          sp.user_id,
          sp.first_name,
          sp.last_name,
          sp.phone,
          sp.email,
          sp.university,
          sp.department,
          sp.year_of_study,
          sp.bio,
          sp.hourly_rate,
          sp.student_card_pdf,
          sp.validation_status,
          sp.rejection_reason,
          u.email as user_email,
          u.created_at,
          (SELECT COUNT(*) FROM job_application WHERE student_id = sp.id) as application_count,
          (SELECT COUNT(*) FROM job_application WHERE student_id = sp.id AND status = 'ACCEPTED') as accepted_count
        FROM student_profile sp
        LEFT JOIN user u ON sp.user_id = u.id
        WHERE sp.user_id = ?
      `;

      const [profiles] = await connection.execute(query, [userId]);

      connection.release();

      if (!profiles || (profiles as any[]).length === 0) {
        return NextResponse.json(
          { error: 'Profil étudiant non trouvé' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: (profiles as any[])[0]
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
    console.error('Admin student profile GET error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

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

// GET - Récupérer toutes les candidatures d'un utilisateur
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
          ja.id,
          ja.job_id,
          ja.status,
          ja.message,
          ja.applied_at,
          jo.title as job_title,
          jo.company as company_name,
          ep.company_name as employer_name
        FROM job_application ja
        LEFT JOIN job_offer jo ON ja.job_id = jo.id
        LEFT JOIN employer_profile ep ON jo.employer_id = ep.user_id
        WHERE ja.student_id = ?
        ORDER BY ja.applied_at DESC
      `;

      const [applications] = await connection.execute(query, [userId]);

      connection.release();

      return NextResponse.json({
        success: true,
        data: applications
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
    console.error('Admin user applications GET error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

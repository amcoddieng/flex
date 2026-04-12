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

// GET - Récupérer le profil d'un employeur
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
          ep.id,
          ep.user_id,
          ep.company_name,
          ep.contact_person,
          ep.phone,
          ep.email,
          ep.address,
          ep.description,
          ep.validation_status,
          u.email as user_email,
          u.created_at,
          (SELECT COUNT(*) FROM job_offer WHERE employer_id = ep.id) as job_count,
          (SELECT COUNT(*) FROM job_offer WHERE employer_id = ep.id AND is_active = 1) as active_jobs
        FROM employer_profile ep
        LEFT JOIN user u ON ep.user_id = u.id
        WHERE ep.user_id = ?
      `;

      const [profiles] = await connection.execute(query, [userId]);

      connection.release();

      if (!profiles || (profiles as any[]).length === 0) {
        return NextResponse.json(
          { error: 'Profil employeur non trouvé' },
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
    console.error('Admin employer profile GET error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

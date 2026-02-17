import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'dieng',
  password: process.env.DB_PASSWORD || 'Papa1997',
  database: process.env.DB_NAME || 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * GET /api/job/[id]
 * Fetch job details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id, 10);
    if (!jobId) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      const [jobs]: any = await connection.execute(
        `SELECT 
          id,
          title,
          description,
          company,
          location,
          service_type,
          salary,
          type_paiement,
          availability,
          requirements,
          contact_email,
          contact_phone,
          posted_at,
          applicants,
          is_active,
          blocked
        FROM job_offer
        WHERE id = ? AND is_active = 1 AND blocked = 0`,
        [jobId]
      );

      if (!Array.isArray(jobs) || jobs.length === 0) {
        return NextResponse.json(
          { error: 'Offre non trouvée' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: jobs[0],
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur récupération job:', error);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Erreur lors de la récupération de l\'offre'
        : error?.message || String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

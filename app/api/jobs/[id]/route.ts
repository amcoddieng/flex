import { NextRequest, NextResponse } from 'next/server';
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

// GET - Get specific job details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    if (!jobId || isNaN(Number(jobId))) {
      return NextResponse.json(
        { error: 'ID de job invalide' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      const query = `
        SELECT 
          j.id, 
          j.title, 
          j.location, 
          j.description,
          j.company,
          j.service_type as job_type,
          j.salary,
          j.requirements,
          j.availability,
          j.posted_at,
          j.is_active,
          j.employer_id,
          ep.company_name as employer_company,
          ep.contact_person,
          ep.email as contact_email,
          ep.phone as contact_phone,
          ep.description as employer_description,
          (SELECT COUNT(*) FROM job_application WHERE job_id = j.id) as applicants_count
        FROM job_offer j
        LEFT JOIN employer_profile ep ON j.employer_id = ep.id
        WHERE j.id = ? 
        AND j.is_active = 1 
        AND j.blocked = 0
      `;

      const [jobs] = await connection.execute(query, [jobId]);

      if (!Array.isArray(jobs) || jobs.length === 0) {
        return NextResponse.json(
          { error: 'Offre d\'emploi non trouvée' },
          { status: 404 }
        );
      }

      const job = jobs[0];

      return NextResponse.json(
        {
          success: true,
          data: job,
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('GET /api/jobs/[id] error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

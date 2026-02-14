import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'dieng',
  password: process.env.DB_PASSWORD || 'Papa1997',
  database: process.env.DB_NAME || 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper: Verify employer token
const verifyEmployer = (request: NextRequest): { role: string; userId: string } | null => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  const token = parts[1];
  const decoded = verifyToken(token);
  
  if (decoded?.role !== 'EMPLOYER') return null;
  return decoded as { role: string; userId: string };
};

// GET - Get job detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id);

    const user = verifyEmployer(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const userId = parseInt(user.userId, 10) || 0;
    const connection = await pool.getConnection();

    try {
      // Get job and verify ownership
      const [jobRows] = await connection.execute(
        `SELECT j.*, e.id as employer_id
         FROM job_offer j
         JOIN employer_profile e ON j.employer_id = e.id
         WHERE j.id = ? AND e.user_id = ?`,
        [jobId, userId]
      );

      if (!jobRows || (jobRows as any).length === 0) {
        connection.release();
        return NextResponse.json(
          { error: 'Offre non trouvée ou accès refusé' },
          { status: 404 }
        );
      }

      const job = (jobRows as any)[0];

      // Get applications for this job
      const [appRows] = await connection.execute(
        `SELECT ja.id, ja.status, ja.applied_at, sp.first_name, sp.last_name, u.email as user_email
         FROM job_application ja
         JOIN student_profile sp ON ja.student_id = sp.id
         JOIN user u ON sp.user_id = u.id
         WHERE ja.job_id = ?
         ORDER BY ja.applied_at DESC`,
        [jobId]
      );

      connection.release();

      return NextResponse.json(
        {
          success: true,
          data: {
            job,
            applicants: appRows || [],
          },
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('GET /api/employer/jobs/[id] error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Update job (only is_active)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id);
    const body = await request.json();

    const user = verifyEmployer(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const userId = parseInt(user.userId, 10) || 0;
    const connection = await pool.getConnection();

    try {
      // Verify ownership
      const [jobRows] = await connection.execute(
        `SELECT j.id FROM job_offer j
         JOIN employer_profile e ON j.employer_id = e.id
         WHERE j.id = ? AND e.user_id = ?`,
        [jobId, userId]
      );

      if (!jobRows || (jobRows as any).length === 0) {
        connection.release();
        return NextResponse.json(
          { error: 'Offre non trouvée ou accès refusé' },
          { status: 404 }
        );
      }

      // Update is_active only
      if (body.is_active !== undefined) {
        await connection.execute(
          'UPDATE job_offer SET is_active = ? WHERE id = ?',
          [body.is_active ? 1 : 0, jobId]
        );
      }

      connection.release();

      return NextResponse.json(
        { success: true, message: 'Offre mise à jour' },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('PUT /api/employer/jobs/[id] error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

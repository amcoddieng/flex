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

// GET - Get application detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appId = parseInt(id);

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
      // Get application and verify it belongs to this employer's job
      const [appRows] = await connection.execute(
        `SELECT ja.id, ja.job_id, ja.student_id, ja.status, ja.applied_at,
                sp.first_name, sp.last_name, u.email, j.title as job_title
         FROM job_application ja
         JOIN job_offer j ON ja.job_id = j.id
         JOIN student_profile sp ON ja.student_id = sp.id
         JOIN user u ON sp.user_id = u.id
         WHERE ja.id = ? AND j.employer_id = (SELECT id FROM employer_profile WHERE user_id = ?)`,
        [appId, userId]
      );

      if (!appRows || (appRows as any).length === 0) {
        connection.release();
        return NextResponse.json(
          { error: 'Candidature non trouvée ou accès refusé' },
          { status: 404 }
        );
      }

      connection.release();

      return NextResponse.json(
        {
          success: true,
          data: (appRows as any)[0],
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('GET /api/employer/applications/[id] error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Update application status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appId = parseInt(id);
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
      // Verify ownership and get application
      const [appRows] = await connection.execute(
        `SELECT ja.id FROM job_application ja
         JOIN job_offer j ON ja.job_id = j.id
         WHERE ja.id = ? AND j.employer_id = (SELECT id FROM employer_profile WHERE user_id = ?)`,
        [appId, userId]
      );

      if (!appRows || (appRows as any).length === 0) {
        connection.release();
        return NextResponse.json(
          { error: 'Candidature non trouvée ou accès refusé' },
          { status: 404 }
        );
      }

      // Update status
      if (body.status) {
        await connection.execute(
          'UPDATE job_application SET status = ? WHERE id = ?',
          [body.status, appId]
        );
      }

      connection.release();

      return NextResponse.json(
        { success: true, message: 'Candidature mise à jour' },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('PUT /api/employer/applications/[id] error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

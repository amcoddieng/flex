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

// Helper: Verify employer token and get userId
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

// GET - Récupérer les statistiques de l'employeur
export async function GET(request: NextRequest) {
  try {
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
      // Total jobs for this employer
      const [jobRows] = await connection.execute(
        'SELECT COUNT(*) as count FROM job_offer WHERE employer_id = (SELECT id FROM employer_profile WHERE user_id = ?)',
        [userId]
      );
      const totalJobs = (jobRows as any)[0]?.count || 0;

      // Active jobs
      const [activeRows] = await connection.execute(
        'SELECT COUNT(*) as count FROM job_offer WHERE employer_id = (SELECT id FROM employer_profile WHERE user_id = ?) AND is_active = 1',
        [userId]
      );
      const activeJobs = (activeRows as any)[0]?.count || 0;

      // Total applications
      const [appRows] = await connection.execute(
        `SELECT COUNT(*) as count FROM job_application 
         WHERE job_id IN (SELECT id FROM job_offer WHERE employer_id = (SELECT id FROM employer_profile WHERE user_id = ?))`,
        [userId]
      );
      const totalApplications = (appRows as any)[0]?.count || 0;

      // Pending applications
      const [pendingRows] = await connection.execute(
        `SELECT COUNT(*) as count FROM job_application 
         WHERE job_id IN (SELECT id FROM job_offer WHERE employer_id = (SELECT id FROM employer_profile WHERE user_id = ?))
         AND status = 'PENDING'`,
        [userId]
      );
      const pendingApplications = (pendingRows as any)[0]?.count || 0;

      // Recent jobs
      const [recentJobs] = await connection.execute(
        `SELECT id, title, location, is_active, posted_at,
                 (SELECT COUNT(*) FROM job_application WHERE job_id = job_offer.id) as applicants
         FROM job_offer 
         WHERE employer_id = (SELECT id FROM employer_profile WHERE user_id = ?)
         ORDER BY posted_at DESC LIMIT 5`,
        [userId]
      );

      connection.release();

      return NextResponse.json(
        {
          success: true,
          data: {
            total_jobs: totalJobs,
            active_jobs: activeJobs,
            total_applications: totalApplications,
            pending_applications: pendingApplications,
            recent_jobs: recentJobs || [],
          },
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('GET /api/employer/stats error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

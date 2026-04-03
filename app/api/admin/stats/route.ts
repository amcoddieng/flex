import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const verifyAdmin = (request: NextRequest): boolean => {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader) return false;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return false;
  const token = parts[1];
  const decoded = verifyToken(token);
  return decoded?.role === 'ADMIN';
};

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const connection = await pool.getConnection();
    try {
      const results: any = {};

      const [usersRows]: any = await connection.execute(`SELECT COUNT(*) as total FROM user`);
      results.total_users = usersRows[0]?.total || 0;

      const [studentsRows]: any = await connection.execute(`SELECT COUNT(u.id) as total FROM user u JOIN student_profile sp ON u.id = sp.user_id`);
      results.total_students = studentsRows[0]?.total || 0;

      const [employersRows]: any = await connection.execute(`SELECT COUNT(u.id) as total FROM user u JOIN employer_profile ep ON u.id = ep.user_id`);
      results.total_employers = employersRows[0]?.total || 0;

      const [jobsRows]: any = await connection.execute(`SELECT COUNT(*) as total FROM job_offer`);
      results.total_jobs = jobsRows[0]?.total || 0;

      const [activeJobsRows]: any = await connection.execute(`SELECT COUNT(*) as total FROM job_offer WHERE is_active = 1`);
      results.active_jobs = activeJobsRows[0]?.total || 0;

      const [blockedUsersRows]: any = await connection.execute(`SELECT COUNT(*) as total FROM user WHERE blocked = 1`);
      results.blocked_users = blockedUsersRows[0]?.total || 0;

      const [pendingStudentsRows]: any = await connection.execute(`SELECT COUNT(*) as total FROM student_profile WHERE validation_status = 'PENDING'`);
      results.pending_students = pendingStudentsRows[0]?.total || 0;

      const [pendingEmployersRows]: any = await connection.execute(`SELECT COUNT(*) as total FROM employer_profile WHERE validation_status = 'PENDING'`);
      results.pending_employers = pendingEmployersRows[0]?.total || 0;

      const [applicationsRows]: any = await connection.execute(`SELECT COUNT(*) as total FROM job_application`);
      results.total_applications = applicationsRows[0]?.total || 0;

      // New users last 7 days
      const [newUsersRows]: any = await connection.execute(`SELECT COUNT(*) as total FROM user WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);
      results.new_users_last_7_days = newUsersRows[0]?.total || 0;

      return NextResponse.json({ success: true, data: results });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur GET /api/admin/stats:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

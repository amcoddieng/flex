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
      // Get detailed application and student profile
      const [appRows] = await connection.execute(
        `SELECT ja.id, ja.job_id, ja.student_id, ja.status, ja.applied_at,
                ja.message, ja.availability, ja.experience, ja.start_date,
                ja.interview_date, ja.interview_time, ja.interview_location,
                sp.id as student_profile_id,
                sp.first_name, sp.last_name, sp.phone, sp.email as student_email,
                sp.university, sp.department, sp.year_of_study, sp.bio,
                sp.skills, sp.hourly_rate, sp.profile_photo,
                u.email as user_email,
                j.title as job_title
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

      const appData = (appRows as any)[0];

      connection.release();

      return NextResponse.json(
        {
          success: true,
          data: {
            id: appData.id,
            job_id: appData.job_id,
            student_id: appData.student_id,
            status: appData.status,
            applied_at: appData.applied_at,
            message: appData.message,
            availability: appData.availability,
            experience: appData.experience,
            start_date: appData.start_date,
            interview_date: appData.interview_date,
            interview_time: appData.interview_time,
            interview_location: appData.interview_location,
            job_title: appData.job_title,
            student: {
              id: appData.student_profile_id,
              first_name: appData.first_name,
              last_name: appData.last_name,
              phone: appData.phone,
              email: appData.student_email,
              university: appData.university,
              department: appData.department,
              year_of_study: appData.year_of_study,
              bio: appData.bio,
              skills: appData.skills ? JSON.parse(appData.skills) : [],
              hourly_rate: appData.hourly_rate,
              profile_photo: appData.profile_photo,
            },
          },
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

      // Update status and optional interview details
      if (body.status) {
        const updates: string[] = [];
        const updateParams: any[] = [];

        updates.push('status = ?');
        updateParams.push(body.status);

        if (body.status === 'INTERVIEW') {
          // Expect optional fields: interview_date (DATETIME string), interview_time, interview_location
          if (body.interview_date !== undefined) {
            updates.push('interview_date = ?');
            updateParams.push(body.interview_date || null);
          }
          if (body.interview_time !== undefined) {
            updates.push('interview_time = ?');
            updateParams.push(body.interview_time || null);
          }
          if (body.interview_location !== undefined) {
            updates.push('interview_location = ?');
            updateParams.push(body.interview_location || null);
          }
        }

        // Build query
        const updateQuery = `UPDATE job_application SET ${updates.join(', ')} WHERE id = ?`;
        updateParams.push(appId);

        await connection.execute(updateQuery, updateParams);
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

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'dieng',
  password: process.env.DB_PASSWORD || 'Papa1997',
  database: process.env.DB_NAME || 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Token non fourni ou invalide' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, email, role FROM user WHERE id = ?',
        [payload.userId]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      const user = (rows as any)[0];

      // Fetch user profile based on role
      let profileData: any = { name: user.email.split('@')[0], avatar: null };

      try {
        if (user.role === 'student') {
          const [studentProfile] = await connection.execute(
            'SELECT firstName, lastName, profilePhoto FROM student_profile WHERE user_id = ?',
            [user.id]
          );
          if ((studentProfile as any[]).length > 0) {
            const profile = (studentProfile as any[])[0];
            profileData.name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || user.email.split('@')[0];
            profileData.avatar = profile.profilePhoto;
          }
        } else if (user.role === 'employer') {
          const [employerProfile] = await connection.execute(
            'SELECT companyName, companyLogo FROM employer_profile WHERE user_id = ?',
            [user.id]
          );
          if ((employerProfile as any[]).length > 0) {
            const profile = (employerProfile as any[])[0];
            profileData.name = profile.companyName || user.email.split('@')[0];
            profileData.avatar = profile.companyLogo;
          }
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        // Continue with fallback data
      }

      return NextResponse.json(
        {
          success: true,
          userId: user.id,
          email: user.email,
          role: user.role,
          name: profileData.name,
          avatar: profileData.avatar,
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur /api/me:', error);
    const message = process.env.NODE_ENV === 'production'
      ? 'Erreur lors de la récupération des informations utilisateur'
      : (error?.message || String(error));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'dieng',
  password: process.env.DB_PASSWORD || 'Papa1997',
  database: process.env.DB_NAME || 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, email, password, role FROM user WHERE email = ?',
        [email]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }

      const user = (rows as any)[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
      }

      // Fetch user profile based on role to get name, first/last and avatar
      let profileData: any = { name: null, avatar: null, firstName: null, lastName: null };

      try {
        if (user.role === 'STUDENT') {
          const [studentProfile] = await connection.execute(
            'SELECT first_name, last_name, profile_photo FROM student_profile WHERE user_id = ?',
            [user.id]
          );
          if ((studentProfile as any[]).length > 0) {
            // afficher dans le console pour debug
            console.log('studentProfile:', studentProfile);
            const profile = (studentProfile as any[])[0];
            profileData.firstName = profile.first_name || null;
            profileData.lastName = profile.last_name || null;
            profileData.name = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim();
            profileData.avatar = profile.profile_photo;
          }
        } else if (user.role === 'employer') {
          const [employerProfile] = await connection.execute(
            'SELECT companyName, companyLogo FROM employer_profile WHERE user_id = ?',
            [user.id]
          );
          if ((employerProfile as any[]).length > 0) {
            const profile = (employerProfile as any[])[0];
            // For employers, place companyName into firstName for token convenience
            profileData.firstName = profile.companyName || null;
            profileData.lastName = null;
            profileData.name = profileData.firstName ;
            profileData.avatar = profile.companyLogo;
          }
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        // Continue with fallback data
      }

      // Generate JWT token including firstName/lastName when available
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        name: profileData.name
      });

      return NextResponse.json(
        {
          success: true,
          // userId: user.id,
          // email: user.email,
          // role: user.role,
          token,
          // name: profileData.name,
          // avatar: profileData.avatar,
          // firstName: profileData.firstName,
          // lastName: profileData.lastName,
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur login:', error);
    const message = process.env.NODE_ENV === 'production' ? 'Erreur lors de la connexion' : (error?.message || String(error));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

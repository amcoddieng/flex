import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/jwt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

export async function POST(request: NextRequest) {
  let client;
  
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    try {
      client = await pool.connect();
    } catch (connectError) {
      console.error('Database connection failed:', connectError);
      return NextResponse.json({ error: 'Failed to connect to the database.' }, { status: 500 });
    }
    
    const result = await client.query(
      'SELECT id, email, password, role FROM "user" WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
    }

    let profileData: any = { name: null, avatar: null, firstName: null, lastName: null };

    try {
      if (user.role === 'STUDENT') {
        const studentProfileResult = await client.query(
          'SELECT first_name, last_name, profile_photo FROM student_profile WHERE user_id = $1',
          [user.id]
        );
        
        if (studentProfileResult.rows.length > 0) {
          const profile = studentProfileResult.rows[0];
          profileData.firstName = profile.first_name || null;
          profileData.lastName = profile.last_name || null;
          profileData.name = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim();
          profileData.avatar = profile.profile_photo;
        }
      } else if (user.role === 'employer') {
        const employerProfileResult = await client.query(
          'SELECT companyName, companyLogo FROM employer_profile WHERE user_id = $1',
          [user.id]
        );
        
        if (employerProfileResult.rows.length > 0) {
          const profile = employerProfileResult.rows[0];
          profileData.firstName = profile.companyname || null;
          profileData.name = profileData.firstName;
          profileData.avatar = profile.companylogo;
        }
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
    }

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
        token,
        role: user.role,
        userId: user.id,
        email: user.email,
        name: profileData.name,
        avatar: profileData.avatar,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur login:', error);
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
  } finally {
    client?.release();
  }
}
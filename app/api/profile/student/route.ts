import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID requis dans les headers (x-user-id)' },
        { status: 401 }
      );
    }

    const {
      firstName,
      lastName,
      phone,
      email,
      university,
      department,
      yearOfStudy,
      bio,
      skills,
      availability,
      services,
      hourlyRate,
      profilePhoto,
      studentCardPdf,
    } = body;

    const connection = await pool.getConnection();

    try {
      // Récupérer le profil étudiant
      const [rows] = await connection.execute(
        'SELECT id FROM student_profile WHERE user_id = ?',
        [userId]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json(
          { error: 'Profil étudiant non trouvé' },
          { status: 404 }
        );
      }

      // Mettre à jour le profil
      const updateQuery = `
        UPDATE student_profile SET
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          phone = COALESCE(?, phone),
          email = COALESCE(?, email),
          university = COALESCE(?, university),
          department = COALESCE(?, department),
          year_of_study = COALESCE(?, year_of_study),
          bio = COALESCE(?, bio),
          skills = COALESCE(?, skills),
          availability = COALESCE(?, availability),
          services = COALESCE(?, services),
          hourly_rate = COALESCE(?, hourly_rate),
          profile_photo = COALESCE(?, profile_photo),
          student_card_pdf = COALESCE(?, student_card_pdf)
        WHERE user_id = ?
      `;

      await connection.execute(updateQuery, [
        firstName || null,
        lastName || null,
        phone || null,
        email || null,
        university || null,
        department || null,
        yearOfStudy || null,
        bio || null,
        skills ? JSON.stringify(skills) : null,
        availability ? JSON.stringify(availability) : null,
        services ? JSON.stringify(services) : null,
        hourlyRate || null,
        profilePhoto || null,
        studentCardPdf || null,
        userId,
      ]);

      return NextResponse.json(
        {
          success: true,
          message: 'Profil étudiant mis à jour avec succès',
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du profil étudiant:', error);

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID requis dans les headers (x-user-id)' },
        { status: 401 }
      );
    }

    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(
        'SELECT * FROM student_profile WHERE user_id = ?',
        [userId]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json(
          { error: 'Profil étudiant non trouvé' },
          { status: 404 }
        );
      }

      const profile = rows[0] as any;
      
      // Parser les champs JSON
      return NextResponse.json(
        {
          success: true,
          data: {
            ...profile,
            skills: profile.skills ? JSON.parse(profile.skills) : null,
            availability: profile.availability ? JSON.parse(profile.availability) : null,
            services: profile.services ? JSON.parse(profile.services) : null,
          },
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération du profil étudiant:', error);

    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract and verify JWT token
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

    const userId = payload.userId;

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

    try {
      // CORRIGÉ: Vérifier si le profil étudiant existe avec PostgreSQL
      const checkResult = await pool.query(
        'SELECT id FROM student_profile WHERE user_id = $1',
        [userId]
      );

      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Profil étudiant non trouvé' },
          { status: 404 }
        );
      }

      // CORRIGÉ: Mettre à jour le profil avec PostgreSQL ($1, $2, etc.)
      const updateQuery = `
        UPDATE student_profile SET
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          phone = COALESCE($3, phone),
          email = COALESCE($4, email),
          university = COALESCE($5, university),
          department = COALESCE($6, department),
          year_of_study = COALESCE($7, year_of_study),
          bio = COALESCE($8, bio),
          skills = COALESCE($9, skills),
          availability = COALESCE($10, availability),
          services = COALESCE($11, services),
          hourly_rate = COALESCE($12, hourly_rate),
          profile_photo = COALESCE($13, profile_photo),
          student_card_pdf = COALESCE($14, student_card_pdf)
        WHERE user_id = $15
      `;

      await pool.query(updateQuery, [
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
    } catch (error: any) {
      throw error;
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
    // Extract and verify JWT token
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

    const userId = payload.userId;

    try {
      // CORRIGÉ: Utiliser $1 au lieu de ?
      const result = await pool.query(
        'SELECT * FROM student_profile WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Profil étudiant non trouvé' },
          { status: 404 }
        );
      }

      const profile = result.rows[0];
      
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
    } catch (error: any) {
      throw error;
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération du profil étudiant:', error);

    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}
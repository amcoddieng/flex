import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role, firstName, lastName } = body;

    // Validation
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password et role sont requis' },
        { status: 400 }
      );
    }

    if (!['STUDENT', 'EMPLOYER'].includes(role)) {
      return NextResponse.json(
        { error: 'Role doit être STUDENT ou EMPLOYER' },
        { status: 400 }
      );
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();

    try {
      // Début de la transaction
      await client.query('BEGIN');

      // Créer l'utilisateur (id auto-incrémenté)
      const userResult = await client.query(
        'INSERT INTO "user" (email, password, role, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
        [email, hashedPassword, role]
      );
      const userId = userResult.rows[0]?.id;

      // Créer le profil selon le rôle
      if (role === 'STUDENT') {
        await client.query(
          'INSERT INTO student_profile (user_id, first_name, last_name, created_at) VALUES ($1, $2, $3, NOW())',
          [userId, firstName || '', lastName || '']
        );
      } else if (role === 'EMPLOYER') {
        const employerProfileResult = await client.query(
          'INSERT INTO employer_profile (user_id, created_at) VALUES ($1, NOW()) RETURNING id',
          [userId]
        );
        const employerProfileId = employerProfileResult.rows[0]?.id;

        // Créer le panier pour l'employeur
        await client.query(
          'INSERT INTO employer_cart (employer_id) VALUES ($1)',
          [employerProfileId]
        );
      }

      // Commit de la transaction
      await client.query('COMMIT');

      return NextResponse.json(
        {
          success: true,
          message: 'Inscription réussie',
          userId,
        },
        { status: 201 }
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);

    // Gestion de l'email déjà existant
    if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription dd', details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
    const userId = uuidv4();

    const connection = await pool.getConnection();

    try {
      // Début de la transaction
      await connection.beginTransaction();

      // Créer l'utilisateur
      await connection.execute(
        'INSERT INTO user (id, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
        [userId, email, hashedPassword, role]
      );

      // Créer le profil selon le rôle
      if (role === 'STUDENT') {
        const studentProfileId = uuidv4();
        await connection.execute(
          'INSERT INTO student_profile (id, user_id, first_name, last_name, created_at) VALUES (?, ?, ?, ?, NOW())',
          [studentProfileId, userId, firstName || '', lastName || '']
        );
      } else if (role === 'EMPLOYER') {
        const employerProfileId = uuidv4();
        const employerCartId = uuidv4();

        await connection.execute(
          'INSERT INTO employer_profile (id, user_id, created_at) VALUES (?, ?, NOW())',
          [employerProfileId, userId]
        );

        // Créer le panier pour l'employeur
        await connection.execute(
          'INSERT INTO employer_cart (id, employer_id) VALUES (?, ?)',
          [employerCartId, employerProfileId]
        );
      }

      // Commit de la transaction
      await connection.commit();

      return NextResponse.json(
        {
          success: true,
          message: 'Inscription réussie',
          userId,
        },
        { status: 201 }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);

    // Gestion de l'email déjà existant
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}

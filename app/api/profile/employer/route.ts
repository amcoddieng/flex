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
      companyName,
      contactPerson,
      phone,
      email,
      address,
      description,
    } = body;

    const connection = await pool.getConnection();

    try {
      // Récupérer le profil employeur
      const [rows] = await connection.execute(
        'SELECT id FROM employer_profile WHERE user_id = ?',
        [userId]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json(
          { error: 'Profil employeur non trouvé' },
          { status: 404 }
        );
      }

      // Mettre à jour le profil
      const updateQuery = `
        UPDATE employer_profile SET
          company_name = COALESCE(?, company_name),
          contact_person = COALESCE(?, contact_person),
          phone = COALESCE(?, phone),
          email = COALESCE(?, email),
          address = COALESCE(?, address),
          description = COALESCE(?, description)
        WHERE user_id = ?
      `;

      await connection.execute(updateQuery, [
        companyName || null,
        contactPerson || null,
        phone || null,
        email || null,
        address || null,
        description || null,
        userId,
      ]);

      return NextResponse.json(
        {
          success: true,
          message: 'Profil employeur mis à jour avec succès',
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du profil employeur:', error);

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
        'SELECT * FROM employer_profile WHERE user_id = ?',
        [userId]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json(
          { error: 'Profil employeur non trouvé' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: rows[0],
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération du profil employeur:', error);

    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}

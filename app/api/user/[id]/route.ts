import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

interface RequestParams {
  params: Promise<{ id: string }>;
}

// GET - Récupérer un utilisateur par ID
export async function GET(request: NextRequest, { params }: RequestParams) {
  try {
    const { id } = await params;

    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(
        'SELECT id, email, role, created_at FROM user WHERE id = ?',
        [id]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
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
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);

    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un utilisateur
export async function PUT(request: NextRequest, { params }: RequestParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, password, role } = body;

    const connection = await pool.getConnection();

    try {
      // Vérifier que l'utilisateur existe
      const [rows] = await connection.execute(
        'SELECT id FROM user WHERE id = ?',
        [id]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      // Construire la requête de mise à jour
      const updates: string[] = [];
      const params: any[] = [];

      if (email !== undefined) {
        updates.push('email = ?');
        params.push(email);
      }

      if (password !== undefined) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push('password = ?');
        params.push(hashedPassword);
      }

      if (role !== undefined) {
        if (!['STUDENT', 'EMPLOYER', 'ADMIN'].includes(role)) {
          return NextResponse.json(
            { error: 'Role invalide' },
            { status: 400 }
          );
        }
        updates.push('role = ?');
        params.push(role);
      }

      if (updates.length === 0) {
        return NextResponse.json(
          { error: 'Aucun champ à mettre à jour' },
          { status: 400 }
        );
      }

      params.push(id);

      await connection.execute(
        `UPDATE user SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      return NextResponse.json(
        {
          success: true,
          message: 'Utilisateur mis à jour avec succès',
        },
        { status: 200 }
      );
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 409 }
        );
      }
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(request: NextRequest, { params }: RequestParams) {
  try {
    const { id } = await params;

    const connection = await pool.getConnection();

    try {
      // Vérifier que l'utilisateur existe
      const [rows] = await connection.execute(
        'SELECT id FROM user WHERE id = ?',
        [id]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      // Supprimer l'utilisateur (les profils seront supprimés en cascade)
      await connection.execute(
        'DELETE FROM user WHERE id = ?',
        [id]
      );

      return NextResponse.json(
        {
          success: true,
          message: 'Utilisateur supprimé avec succès',
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);

    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// GET - Récupérer les détails d'un utilisateur
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID utilisateur invalide' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      const query = `
        SELECT 
          u.id,
          u.email,
          u.role,
          u.created_at,
          u.blocked,
          sp.first_name,
          sp.last_name,
          sp.phone as student_phone,
          sp.university,
          sp.department,
          sp.year_of_study,
          sp.validation_status as student_validation,
          ep.company_name,
          ep.phone as employer_phone,
          ep.validation_status as employer_validation
        FROM user u
        LEFT JOIN student_profile sp ON u.id = sp.user_id
        LEFT JOIN employer_profile ep ON u.id = ep.user_id
        WHERE u.id = ?
      `;

      const [users] = await connection.execute(query, [userId]);

      connection.release();

      if (!users || (users as any[]).length === 0) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: (users as any[])[0]
      });

    } catch (dbError) {
      connection.release();
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Erreur base de données' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Admin user GET error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID utilisateur invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { blocked } = body;

    const connection = await pool.getConnection();

    try {
      // Mettre à jour le statut blocked seulement si fourni
      if (blocked !== undefined) {
        await connection.execute(
          'UPDATE user SET blocked = ? WHERE id = ?',
          [blocked ? 1 : 0, userId]
        );
      } else {
        // Si aucun paramètre n'est fourni, retourner une erreur
        return NextResponse.json(
          { error: 'Aucun paramètre à mettre à jour fourni' },
          { status: 400 }
        );
      }

      connection.release();

      return NextResponse.json({
        success: true,
        message: 'Utilisateur mis à jour avec succès'
      });

    } catch (dbError) {
      connection.release();
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Erreur base de données' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Admin user PUT error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID utilisateur invalide' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Supprimer d'abord les enregistrements dépendants
      await connection.execute('DELETE FROM job_application WHERE student_id IN (SELECT id FROM student_profile WHERE user_id = ?)', [userId]);
      await connection.execute('DELETE FROM job_application WHERE job_id IN (SELECT id FROM job_offer WHERE employer_id IN (SELECT id FROM employer_profile WHERE user_id = ?))', [userId]);
      await connection.execute('DELETE FROM job_offer WHERE employer_id IN (SELECT id FROM employer_profile WHERE user_id = ?)', [userId]);
      await connection.execute('DELETE FROM student_profile WHERE user_id = ?', [userId]);
      await connection.execute('DELETE FROM employer_profile WHERE user_id = ?', [userId]);
      
      // Supprimer l'utilisateur
      await connection.execute('DELETE FROM user WHERE id = ?', [userId]);

      connection.release();

      return NextResponse.json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
      });

    } catch (dbError) {
      connection.release();
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Erreur base de données' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Admin user DELETE error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

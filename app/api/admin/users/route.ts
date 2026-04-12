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

// GET - Récupérer tous les utilisateurs avec pagination et filtres
export async function GET(request: NextRequest) {
  try {
    const user = verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    try {
      let query = `
        SELECT 
          u.id,
          u.email,
          u.role,
          u.created_at,
          u.blocked
        FROM user u
        WHERE 1=1
      `;
      
      const params: any[] = [];

      if (search) {
        query += ` AND (u.email LIKE ? OR u.id IN (
          SELECT user_id FROM student_profile WHERE 
          first_name LIKE ? OR last_name LIKE ? OR university LIKE ?
        ) OR u.id IN (
          SELECT user_id FROM employer_profile WHERE 
          company_name LIKE ? OR contact_person LIKE ?
        ))`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      if (role) {
        query += ` AND u.role = ?`;
        params.push(role);
      }

      // Compter le total
      const countQuery = query.replace('SELECT u.id, u.email, u.role, u.created_at, u.blocked', 'SELECT COUNT(*) as total');
      const [countResult] = await connection.execute(countQuery, params);
      const total = (countResult as any)[0].total;

      // Ajouter pagination et tri
      query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [users] = await connection.execute(query, params);

      connection.release();

      return NextResponse.json({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
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
    console.error('Admin users GET error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un utilisateur (bloquer/débloquer)
export async function PUT(request: NextRequest) {
  try {
    const user = verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, blocked } = body;

    if (!userId || typeof blocked !== 'boolean') {
      return NextResponse.json(
        { error: 'Paramètres invalides' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      await connection.execute(
        'UPDATE user SET blocked = ? WHERE id = ?',
        [blocked, userId]
      );

      connection.release();

      return NextResponse.json({
        success: true,
        message: blocked ? 'Utilisateur bloqué avec succès' : 'Utilisateur débloqué avec succès'
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
    console.error('Admin users PUT error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

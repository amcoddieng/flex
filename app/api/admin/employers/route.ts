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

// GET - Récupérer tous les employeurs avec pagination et filtres
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
    const status = searchParams.get('status') || '';
    
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    try {
      let query = `
        SELECT 
          u.id,
          u.email,
          u.role,
          u.blocked,
          u.created_at,
          ep.id as profile_id,
          ep.company_name,
          ep.contact_person,
          ep.phone,
          ep.address,
          ep.description,
          ep.img,
          ep.identity,
          ep.validation_status
        FROM user u
        LEFT JOIN employer_profile ep ON u.id = ep.user_id
        WHERE u.role = 'EMPLOYER'
      `;
      
      const params: any[] = [];

      if (search) {
        query += ` AND (u.email LIKE ? OR ep.company_name LIKE ? OR ep.contact_person LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      if (status) {
        query += ` AND ep.validation_status = ?`;
        params.push(status);
      }

      // Compter le total
      const countQuery = query.replace(
        'SELECT u.id, u.email, u.role, u.blocked, u.created_at, ep.id as profile_id, ep.company_name, ep.contact_person, ep.phone, ep.address, ep.description, ep.img, ep.identity, ep.validation_status',
        'SELECT COUNT(*) as total'
      );
      const [countResult] = await connection.execute(countQuery, params);
      const total = (countResult as any)[0].total;

      // Ajouter pagination et tri
      query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [employers] = await connection.execute(query, params);

      connection.release();

      return NextResponse.json({
        success: true,
        data: employers,
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
    console.error('Admin employers GET error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un employeur (bloquer/débloquer, valider/rejeter)
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
    const { employerId, blocked, validation_status, rejection_reason } = body;

    const connection = await pool.getConnection();

    try {
      // Mettre à jour le statut de blocage
      if (typeof blocked === 'boolean') {
        await connection.execute(
          'UPDATE user SET blocked = ? WHERE id = ?',
          [blocked, employerId]
        );
      }

      // Mettre à jour le statut de validation
      if (validation_status) {
        await connection.execute(
          'UPDATE employer_profile SET validation_status = ?, rejection_reason = ? WHERE user_id = ?',
          [validation_status, rejection_reason || null, employerId]
        );
      }

      connection.release();

      return NextResponse.json({
        success: true,
        message: 'Employeur mis à jour avec succès'
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
    console.error('Admin employers PUT error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

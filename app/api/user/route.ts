import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const pool = mysql.createPool({
  host:'localhost',
  user:'dieng',
  password:'Papa1997',
  database:'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// GET - Récupérer tous les utilisateurs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;
    const safeLimit = Math.max(1, Math.min(1000, limit));
    const safeOffset = Math.max(0, offset);
    const connection = await pool.getConnection();

    try {
      let query = 'SELECT id, email, role, created_at FROM user WHERE 1=1';
      const params: any[] = [];

      if (role) {
        query += ' AND role = ?';
        params.push(role);
      }

      if (search) {
        query += ' AND email LIKE ?';
        params.push(`%${search}%`);
      }

      // LIMIT and OFFSET as direct numbers to avoid prepared-statement type issues
      query += ` ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

      const [users] = await connection.execute(query, params);

      // Compter le nombre total
      let countQuery = 'SELECT COUNT(*) as total FROM user WHERE 1=1';
      const countParams: any[] = [];
      
      if (role) {
        countQuery += ' AND role = ?';
        countParams.push(role);
      }

      if (search) {
        countQuery += ' AND email LIKE ?';
        countParams.push(`%${search}%`);
      }

      const [countResult] = await connection.execute(countQuery, countParams);
      const total = (countResult as any[])[0].total;

      return NextResponse.json(
        {
          success: true,
          data: users,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    const message = process.env.NODE_ENV === 'production'
      ? 'Erreur lors de la récupération des utilisateurs'
      : (error?.message || String(error));

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

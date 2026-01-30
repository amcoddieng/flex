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

// GET - Récupérer tous les utilisateurs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');

    const offset = (page - 1) * limit;
    const connection = await pool.getConnection();

    try {
      let query = 'SELECT id, email, role, created_at FROM user';
      const params: any[] = [];

      if (role) {
        query += ' WHERE role = ?';
        params.push(role);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [users] = await connection.execute(query, params);

      // Compter le nombre total
      let countQuery = 'SELECT COUNT(*) as total FROM user';
      const countParams: any[] = [];
      
      if (role) {
        countQuery += ' WHERE role = ?';
        countParams.push(role);
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

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

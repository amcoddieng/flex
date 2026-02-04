import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'dieng',
  password: process.env.DB_PASSWORD || 'Papa1997',
  database: process.env.DB_NAME || 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper: Verify admin token from Authorization header
const verifyAdmin = (request: NextRequest): boolean => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return false;
  
  const token = parts[1];
  const decoded = verifyToken(token);
  
  return decoded?.role === 'ADMIN';
};

// GET - Récupérer la liste des étudiants avec leurs profils
export async function GET(request: NextRequest) {
  try {
    // Verify admin
    if (!verifyAdmin(request)) {
      return NextResponse.json(
        { error: 'Accès refusé. Vous devez être administrateur.' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const validationStatus = searchParams.get('validation_status');

    const offset = (page - 1) * limit;
    const safeLimit = Math.max(1, Math.min(1000, limit));
    const safeOffset = Math.max(0, offset);

    const connection = await pool.getConnection();

    try {
      let query = `
        SELECT 
          u.id, 
          u.email, 
          u.role, 
          u.blocked,
          u.created_at,
          sp.id as profile_id,
          sp.first_name,
          sp.last_name,
          sp.phone,
          sp.university,
          sp.department,
          sp.year_of_study,
          sp.validation_status
        FROM user u
        LEFT JOIN student_profile sp ON u.id = sp.user_id
        WHERE u.role = 'STUDENT'
      `;
      
      const params: any[] = [];

      if (search) {
        query += ` AND (u.email LIKE ? OR sp.first_name LIKE ? OR sp.last_name LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (validationStatus) {
        query += ` AND sp.validation_status = ?`;
        params.push(validationStatus);
      }

      query += ` ORDER BY u.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

      const [result]: any = await connection.execute(query, params);
      const students = Array.isArray(result) ? result : [];

      // Compter le nombre total
      let countQuery = `
        SELECT COUNT(*) as total FROM user u
        LEFT JOIN student_profile sp ON u.id = sp.user_id
        WHERE u.role = 'STUDENT'
      `;
      const countParams: any[] = [];

      if (search) {
        countQuery += ` AND (u.email LIKE ? OR sp.first_name LIKE ? OR sp.last_name LIKE ?)`;
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (validationStatus) {
        countQuery += ` AND sp.validation_status = ?`;
        countParams.push(validationStatus);
      }

      const [countResult]: any = await connection.execute(countQuery, countParams);
      const countRows = Array.isArray(countResult) ? countResult : [];
      const total = countRows.length > 0 ? countRows[0].total : 0;

      return NextResponse.json(
        {
          success: true,
          data: students,
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
    console.error('Erreur lors de la récupération des étudiants:', error);

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des étudiants' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const userId = Number(payload.userId);
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Get student_id from user_id
      const [studentResult] = await connection.execute(
        'SELECT id FROM student_profile WHERE user_id = ?',
        [userId]
      );

      if (!Array.isArray(studentResult) || studentResult.length === 0) {
        return NextResponse.json(
          { error: 'Profil étudiant non trouvé' },
          { status: 404 }
        );
      }

      const studentId = (studentResult as any[])[0].id;

      // Get conversations for student
      const [conversations] = await connection.execute(
        `
        SELECT 
          c.id,
          c.employer_id as participant_id,
          ep.company_name as participant_name,
          ep.company_name as participant_company,
          'EMPLOYER' as participant_type,
          c.offer_id,
          c.created_at as last_message_at,
          0 as unread_count,
          1 as is_active
        FROM conversation c
        LEFT JOIN employer_profile ep ON c.employer_id = ep.id
        WHERE c.student_id = ?
        ORDER BY c.created_at DESC
        `,
        [studentId]
      );

      return NextResponse.json({
        success: true,
        data: conversations
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur récupération conversations étudiant:', error);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === 'production'
          ? 'Erreur serveur'
          : error.message,
      },
      { status: 500 }
    );
  }
}

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

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const resolvedParams = await params;
    const userId = Number(payload.userId);
    const conversationId = Number(resolvedParams.id);

    if (!Number.isInteger(userId) || !Number.isInteger(conversationId)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
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

      // Verify conversation belongs to this student
      const [conversationCheck] = await connection.execute(
        'SELECT id FROM conversation WHERE id = ? AND student_id = ?',
        [conversationId, studentId]
      );

      if (!Array.isArray(conversationCheck) || conversationCheck.length === 0) {
        return NextResponse.json(
          { error: 'Conversation non trouvée' },
          { status: 404 }
        );
      }

      // Mark all messages from employer as read using the message table
      await connection.execute(
        `
        UPDATE message 
        SET is_read = 1 
        WHERE conversation_id = ? AND sender_type = 'employer' AND is_read = 0
        `,
        [conversationId]
      );

      return NextResponse.json({
        success: true,
        message: 'Messages marqués comme lus'
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur marquer messages lus:', error);
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

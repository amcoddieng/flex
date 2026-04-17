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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    console.log('Token payload:', payload);
    
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const resolvedParams = await params;
    const userId = Number(payload.userId);
    const conversationId = Number(resolvedParams.id);
    
    console.log('userId:', userId, 'resolvedParams.id:', resolvedParams.id, 'conversationId:', conversationId);

    if (!Number.isInteger(userId) || !Number.isInteger(conversationId) || isNaN(conversationId)) {
      console.log('Validation failed - userId:', userId, 'conversationId:', conversationId);
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

      // Get messages for this conversation using the existing message table
      const [messages] = await connection.execute(
        `
        SELECT 
          m.id,
          m.conversation_id,
          m.sender_type,
          m.sender_id,
          m.message as content,
          m.is_read,
          m.created_at,
          CASE 
            WHEN m.sender_type = 'student' THEN sp.first_name || ' ' || sp.last_name
            WHEN m.sender_type = 'employer' THEN ep.company_name
            ELSE 'Utilisateur inconnu'
          END as sender_name,
          CASE 
            WHEN m.sender_type = 'student' THEN 'STUDENT'
            WHEN m.sender_type = 'employer' THEN 'EMPLOYER'
            ELSE 'UNKNOWN'
          END as sender_type_formatted
        FROM message m
        LEFT JOIN student_profile sp ON m.sender_id = sp.id AND m.sender_type = 'student'
        LEFT JOIN employer_profile ep ON m.sender_id = ep.id AND m.sender_type = 'employer'
        WHERE m.conversation_id = ?
        ORDER BY m.created_at ASC
        `,
        [conversationId]
      );
      
      // Format the messages to match the expected interface
      const formattedMessages = (messages as any[]).map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        receiver_id: msg.sender_type === 'student' ? (conversationCheck as any[])[0].employer_id : studentId,
        content: msg.content,
        sender_type: msg.sender_type_formatted,
        receiver_type: msg.sender_type === 'student' ? 'EMPLOYER' : 'STUDENT',
        is_read: Boolean(msg.is_read),
        created_at: msg.created_at,
        sender_name: msg.sender_name
      }));

      return NextResponse.json({
        success: true,
        data: formattedMessages
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur récupération messages:', error);
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

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Contenu du message requis' }, { status: 400 });
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

      // Verify conversation belongs to this student and get participant info
      const [conversationCheck] = await connection.execute(
        'SELECT id, employer_id FROM conversation WHERE id = ? AND student_id = ?',
        [conversationId, studentId]
      );

      if (!Array.isArray(conversationCheck) || conversationCheck.length === 0) {
        return NextResponse.json(
          { error: 'Conversation non trouvée' },
          { status: 404 }
        );
      }

      const conversation = (conversationCheck as any[])[0];

      // Create new message using the existing message table
      const [result] = await connection.execute(
        `
        INSERT INTO message (
          conversation_id,
          sender_type,
          sender_id,
          message,
          is_read,
          created_at
        ) VALUES (?, 'student', ?, ?, 0, NOW())
        `,
        [conversationId, studentId, content.trim()]
      );

      const messageId = (result as any).insertId;

      // Get the created message with sender info
      const [newMessage] = await connection.execute(
        `
        SELECT 
          m.id,
          m.conversation_id,
          m.sender_type,
          m.sender_id,
          m.message as content,
          m.is_read,
          m.created_at,
          sp.first_name || ' ' || sp.last_name as sender_name
        FROM message m
        LEFT JOIN student_profile sp ON m.sender_id = sp.id AND m.sender_type = 'student'
        WHERE m.id = ?
        `,
        [messageId]
      );

      return NextResponse.json({
        success: true,
        data: (newMessage as any[])[0]
      }, { status: 201 });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur envoi message:', error);
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

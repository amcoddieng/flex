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
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const resolvedParams = await params;
    const topicId = Number(resolvedParams.id);

    if (!Number.isInteger(topicId) || isNaN(topicId)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Get all replies for this topic
      const [replies] = await connection.execute(
        `
        SELECT 
          fr.id,
          fr.topic_id,
          fr.author_id,
          fr.author_name,
          fr.author_university,
          fr.content,
          fr.likes,
          fr.is_helpful,
          fr.created_at,
          sp.first_name,
          sp.last_name
        FROM forum_reply fr
        LEFT JOIN student_profile sp ON fr.author_id = sp.id
        WHERE fr.topic_id = ?
        ORDER BY fr.created_at ASC
        `,
        [topicId]
      );

      // Format author names if we have student profile info
      const formattedReplies = (replies as any[]).map(reply => ({
        ...reply,
        author_name: reply.first_name && reply.last_name 
          ? `${reply.first_name} ${reply.last_name}`
          : reply.author_name
      }));

      return NextResponse.json({
        success: true,
        data: formattedReplies
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur récupération réponses:', error);
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
    const topicId = Number(resolvedParams.id);
    const userId = Number(payload.userId);
    const body = await request.json();
    const { content } = body;

    if (!Number.isInteger(topicId) || isNaN(topicId)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le contenu de la réponse est requis' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Get student_id from user_id
      const [studentResult] = await connection.execute(
        'SELECT id, first_name, last_name FROM student_profile WHERE user_id = ?',
        [userId]
      );

      if (!Array.isArray(studentResult) || studentResult.length === 0) {
        return NextResponse.json(
          { error: 'Profil étudiant non trouvé' },
          { status: 404 }
        );
      }

      const student = (studentResult as any[])[0];
      const studentId = student.id;
      const authorName = `${student.first_name} ${student.last_name}`;

      // Verify topic exists
      const [topicCheck] = await connection.execute(
        'SELECT id FROM forum_topic WHERE id = ?',
        [topicId]
      );

      if (!Array.isArray(topicCheck) || topicCheck.length === 0) {
        return NextResponse.json(
          { error: 'Sujet non trouvé' },
          { status: 404 }
        );
      }

      // Create new reply
      const [result] = await connection.execute(
        `
        INSERT INTO forum_reply (
          topic_id, 
          author_id, 
          author_name, 
          content, 
          likes, 
          is_helpful, 
          created_at
        ) VALUES (?, ?, ?, ?, 0, 0, NOW())
        `,
        [topicId, studentId, authorName, content.trim()]
      );

      const replyId = (result as any).insertId;

      // Get the created reply
      const [newReply] = await connection.execute(
        `
        SELECT 
          fr.id,
          fr.topic_id,
          fr.author_id,
          fr.author_name,
          fr.author_university,
          fr.content,
          fr.likes,
          fr.is_helpful,
          fr.created_at
        FROM forum_reply fr
        WHERE fr.id = ?
        `,
        [replyId]
      );

      return NextResponse.json({
        success: true,
        data: (newReply as any[])[0]
      }, { status: 201 });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur création réponse:', error);
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

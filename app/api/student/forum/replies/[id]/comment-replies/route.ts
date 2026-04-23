import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const replyId = Number(resolvedParams.id);

    if (!Number.isInteger(replyId) || isNaN(replyId)) {
      return NextResponse.json({ error: 'ID de réponse invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Get all comment replies for this forum reply
      const [commentReplies] = await connection.execute(
        `
        SELECT 
          cr.id,
          cr.reply_comment_id,
          cr.author_id,
          cr.author_name,
          cr.content,
          cr.likes,
          cr.created_at,
          sp.first_name,
          sp.last_name,
          sp.university
        FROM comment_reply cr
        LEFT JOIN student_profile sp ON cr.author_id = sp.id
        WHERE cr.reply_comment_id = ?
        ORDER BY cr.created_at ASC
        `,
        [replyId]
      );

      // Format author names if we have student profile info
      const formattedReplies = (commentReplies as any[]).map(reply => ({
        id: reply.id,
        reply_comment_id: reply.reply_comment_id,
        author_id: reply.author_id,
        author_name: reply.first_name && reply.last_name 
          ? `${reply.first_name} ${reply.last_name}`
          : reply.author_name,
        content: reply.content,
        likes: reply.likes,
        created_at: reply.created_at,
        author_university: reply.university
      }));

      return NextResponse.json({
        success: true,
        data: formattedReplies
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('❌ Erreur récupération réponses de commentaires:', error);
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'production'
          ? 'Erreur serveur'
          : error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const replyId = Number(resolvedParams.id);
    const userId = Number(payload.userId);
    const body = await request.json();
    const { content } = body;

    if (!Number.isInteger(replyId) || isNaN(replyId)) {
      return NextResponse.json({ error: 'ID de réponse invalide' }, { status: 400 });
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

      // Verify forum reply exists
      const [replyCheck] = await connection.execute(
        'SELECT id FROM forum_reply WHERE id = ?',
        [replyId]
      );

      if (!Array.isArray(replyCheck) || replyCheck.length === 0) {
        return NextResponse.json(
          { error: 'Réponse non trouvée' },
          { status: 404 }
        );
      }

      // Create new comment reply
      const [result] = await connection.execute(
        `
        INSERT INTO comment_reply (
          reply_comment_id, 
          author_id, 
          author_name, 
          content, 
          likes, 
          created_at
        ) VALUES (?, ?, ?, ?, 0, NOW())
        `,
        [replyId, studentId, authorName, content.trim()]
      );

      const commentReplyId = (result as any).insertId;

      // Get the created comment reply
      const [newCommentReply] = await connection.execute(
        `
        SELECT 
          cr.id,
          cr.reply_comment_id,
          cr.author_id,
          cr.author_name,
          cr.content,
          cr.likes,
          cr.created_at,
          sp.university
        FROM comment_reply cr
        LEFT JOIN student_profile sp ON cr.author_id = sp.id
        WHERE cr.id = ?
        `,
        [commentReplyId]
      );

      const formattedReply = (newCommentReply as any[])[0];
      const responseReply = {
        id: formattedReply.id,
        reply_comment_id: formattedReply.reply_comment_id,
        author_id: formattedReply.author_id,
        author_name: formattedReply.first_name && formattedReply.last_name 
          ? `${formattedReply.first_name} ${formattedReply.last_name}`
          : formattedReply.author_name,
        content: formattedReply.content,
        likes: formattedReply.likes,
        created_at: formattedReply.created_at,
        author_university: formattedReply.university
      };

      return NextResponse.json({
        success: true,
        data: responseReply
      }, { status: 201 });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('❌ Erreur création réponse de commentaire:', error);
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'production'
          ? 'Erreur serveur'
          : error.message,
      },
      { status: 500 }
    );
  }
}

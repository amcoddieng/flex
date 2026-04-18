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

    const connection = await pool.getConnection();

    try {
      // Get all forum topics with author information
      const [topics] = await connection.execute(
        `
        SELECT 
          ft.id,
          ft.author_id,
          ft.author_name,
          ft.author_university,
          ft.author_department,
          ft.category,
          ft.title,
          ft.content,
          ft.tags,
          ft.likes,
          ft.is_pinned,
          ft.created_at,
          sp.first_name,
          sp.last_name,
          u.email
        FROM forum_topic ft
        LEFT JOIN student_profile sp ON ft.author_id = sp.id
        LEFT JOIN user u ON sp.user_id = u.id
        ORDER BY ft.is_pinned DESC, ft.created_at DESC
        `
      );

      // Format author names if we have student profile info
      const formattedTopics = (topics as any[]).map(topic => ({
        ...topic,
        author_name: topic.first_name && topic.last_name 
          ? `${topic.first_name} ${topic.last_name}`
          : topic.author_name
      }));

      return NextResponse.json({
        success: true,
        data: formattedTopics
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur récupération topics:', error);
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

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { title, content, category, tags } = body;

    console.log('Creating forum topic:', { title, content, category, tags, userId });

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Le titre et le contenu sont requis' },
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

      // Create new forum topic
      const [result] = await connection.execute(
        `
        INSERT INTO forum_topic (
          author_id, 
          author_name, 
          author_university,
          author_department,
          category, 
          title, 
          content, 
          likes, 
          is_pinned, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, NOW())
        `,
        [studentId, authorName, null, null, category, title, content]
      );

      const topicId = (result as any).insertId;

      // Get the created topic
      const [newTopic] = await connection.execute(
        `
        SELECT 
          ft.id,
          ft.author_id,
          ft.author_name,
          ft.author_university,
          ft.author_department,
          ft.category,
          ft.title,
          ft.content,
          ft.tags,
          ft.likes,
          ft.is_pinned,
          ft.created_at
        FROM forum_topic ft
        WHERE ft.id = ?
        `,
        [topicId]
      );

      return NextResponse.json({
        success: true,
        data: (newTopic as any[])[0]
      }, { status: 201 });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur création topic:', error);
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

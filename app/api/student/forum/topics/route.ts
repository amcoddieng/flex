// app/api/student/forum/topics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
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

    // Get all forum topics with author information - Version PostgreSQL
    const topics = await pool.query(`
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
      LEFT JOIN "user" u ON sp.user_id = u.id
      ORDER BY ft.is_pinned DESC, ft.created_at DESC
    `);

    // Format author names if we have student profile info
    const formattedTopics = topics.rows.map(topic => ({
      ...topic,
      author_name: topic.first_name && topic.last_name 
        ? `${topic.first_name} ${topic.last_name}`
        : topic.author_name,
      likes: parseInt(topic.likes) || 0,
      is_pinned: Boolean(topic.is_pinned)
    }));

    console.log(`✅ ${formattedTopics.length} topics récupérés`);

    return NextResponse.json({
      success: true,
      data: formattedTopics
    });

  } catch (error: any) {
    console.error('❌ Erreur récupération topics:', error);
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

    console.log('📝 Création topic forum:', { title, content, category, tags, userId });

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Le titre et le contenu sont requis' },
        { status: 400 }
      );
    }

    // Get student_id from user_id - Version PostgreSQL
    const studentResult = await pool.query(
      'SELECT id, first_name, last_name FROM student_profile WHERE user_id = $1',
      [userId]
    );

    if (studentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Profil étudiant non trouvé' },
        { status: 404 }
      );
    }

    const student = studentResult.rows[0];
    const studentId = student.id;
    const authorName = `${student.first_name} ${student.last_name}`;

    // Create new forum topic - Version PostgreSQL
    const result = await pool.query(
      `
      INSERT INTO forum_topic (
        author_id, 
        author_name, 
        author_university,
        author_department,
        category, 
        title, 
        content, 
        tags,
        likes, 
        is_pinned, 
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 0, NOW())
      RETURNING id
      `,
      [studentId, authorName, null, null, category || null, title, content, tags || null]
    );

    const topicId = result.rows[0].id;

    // Get the created topic
    const newTopic = await pool.query(
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
      WHERE ft.id = $1
      `,
      [topicId]
    );

    console.log('✅ Topic créé avec succès, ID:', topicId);

    return NextResponse.json({
      success: true,
      data: newTopic.rows[0]
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Erreur création topic:', error);
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
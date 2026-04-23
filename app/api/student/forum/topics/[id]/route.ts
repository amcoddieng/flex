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
    const topicId = Number(resolvedParams.id);
    if (!Number.isInteger(topicId)) {
      return NextResponse.json({ error: 'ID de sujet invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Récupérer le sujet spécifique
      const [topicRows] = await connection.execute(`
        SELECT 
          ft.id,
          ft.author_id,
          ft.title,
          ft.content,
          ft.tags,
          ft.likes,
          ft.is_pinned,
          ft.created_at,
          sp.first_name,
          sp.last_name,
          sp.university,
          sp.department,
          CONCAT(sp.first_name, ' ', sp.last_name) as author_name
        FROM forum_topic ft
        JOIN student_profile sp ON ft.author_id = sp.id
        WHERE ft.id = ?
      `, [topicId]);

      if ((topicRows as any[]).length === 0) {
        return NextResponse.json({ error: 'Sujet non trouvé' }, { status: 404 });
      }

      const topic = (topicRows as any[])[0];

      // Formater les données
      const formattedTopic = {
        id: topic.id,
        author_id: topic.author_id,
        author_name: topic.author_name,
        author_university: topic.university,
        author_department: topic.department,
        title: topic.title,
        content: topic.content,
        tags: topic.tags,
        likes: topic.likes,
        is_pinned: topic.is_pinned,
        created_at: topic.created_at
      };

      return NextResponse.json({
        success: true,
        data: formattedTopic
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('❌ Erreur récupération sujet:', error);
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

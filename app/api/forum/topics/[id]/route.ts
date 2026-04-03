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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
    }

    const topicId = parseInt(params.id);
    if (!topicId || topicId <= 0) {
      return NextResponse.json({ error: 'ID de sujet invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Récupérer le sujet
      const [topicResult] = await connection.execute(
        'SELECT * FROM forum_topic WHERE id = ?',
        [topicId]
      );

      if ((topicResult as any[]).length === 0) {
        return NextResponse.json({ error: 'Sujet non trouvé' }, { status: 404 });
      }

      const topic = (topicResult as any[])[0];
      
      // Formater le sujet
      const formattedTopic = {
        ...topic,
        tags: topic.tags ? JSON.parse(topic.tags) : []
      };

      // Récupérer les réponses
      const [repliesResult] = await connection.execute(
        'SELECT * FROM forum_reply WHERE topic_id = ? ORDER BY created_at ASC',
        [topicId]
      );

      const formattedReplies = (repliesResult as any[]).map(reply => ({
        ...reply,
        is_helpful: Boolean(reply.is_helpful)
      }));

      return NextResponse.json({
        topic: formattedTopic,
        replies: formattedReplies
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur récupération sujet forum:', error);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors de la récupération du sujet' 
      : (error?.message || String(error));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    const topicId = Number(resolvedParams.id);

    if (!Number.isInteger(topicId) || isNaN(topicId)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
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

      // Increment likes count
      await connection.execute(
        'UPDATE forum_topic SET likes = likes + 1 WHERE id = ?',
        [topicId]
      );

      return NextResponse.json({
        success: true,
        message: 'Like ajouté avec succès'
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur like topic:', error);
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

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'dieng',
  password: process.env.DB_PASSWORD || 'Papa1997',
  database: process.env.DB_NAME || 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function POST(
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

    const replyId = parseInt(params.id);
    if (!replyId || replyId <= 0) {
      return NextResponse.json({ error: 'ID de réponse invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Vérifier que la réponse existe
      const [replyCheck] = await connection.execute(
        'SELECT id FROM forum_reply WHERE id = ?',
        [replyId]
      );

      if ((replyCheck as any[]).length === 0) {
        return NextResponse.json({ error: 'Réponse non trouvée' }, { status: 404 });
      }

      // Incrémenter le nombre de likes
      await connection.execute(
        'UPDATE forum_reply SET likes = likes + 1 WHERE id = ?',
        [replyId]
      );

      return NextResponse.json({
        success: true,
        message: 'Like ajouté avec succès'
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur like réponse forum:', error);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors du like' 
      : (error?.message || String(error));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

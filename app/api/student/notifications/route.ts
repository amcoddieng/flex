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

    const userId = Number(payload.userId);
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Récupérer les notifications de l'utilisateur
      const [notifications] = await connection.execute(`
        SELECT 
          n.id,
          n.user_id,
          n.type,
          n.title,
          n.message,
          n.is_read,
          n.created_at,
          n.metadata
        FROM notification n
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT 50
      `, [userId]);

      console.log('✅ Notifications récupérées pour l\'utilisateur:', userId);

      return NextResponse.json({
        success: true,
        data: {
          notifications: notifications
        }
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('❌ Erreur récupération notifications:', error);

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
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { type, title, message, metadata } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Type, titre et message sont requis' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Créer la notification
      const [result] = await connection.execute(`
        INSERT INTO notification (user_id, type, title, message, metadata)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, type, title, message, metadata ? JSON.stringify(metadata) : null]);

      const insertId = (result as any).insertId;

      // Récupérer la notification créée
      const [newNotification] = await connection.execute(`
        SELECT 
          n.id,
          n.user_id,
          n.type,
          n.title,
          n.message,
          n.is_read,
          n.created_at,
          n.metadata
        FROM notification n
        WHERE n.id = ?
      `, [insertId]);

      console.log('✅ Notification créée pour l\'utilisateur:', userId);

      return NextResponse.json({
        success: true,
        data: {
          notification: (newNotification as any[])[0]
        }
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('❌ Erreur création notification:', error);

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

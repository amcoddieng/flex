import { NextRequest, NextResponse } from 'next/server';
import mysql from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const userId = Number(payload.userId);
    const notificationId = Number(resolvedParams.id);

    if (!Number.isInteger(userId) || !Number.isInteger(notificationId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Vérifier que la notification appartient à l'utilisateur
      const [notificationCheck] = await connection.execute(`
        SELECT user_id FROM notification WHERE id = ?
      `, [notificationId]);

      if ((notificationCheck as any[]).length === 0) {
        return NextResponse.json({ error: 'Notification non trouvée' }, { status: 404 });
      }

      const notificationUserId = (notificationCheck as any[])[0].user_id;
      if (notificationUserId !== userId) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }

      // Marquer comme lu
      await connection.execute(`
        UPDATE notification SET is_read = 1 WHERE id = ?
      `, [notificationId]);

      console.log('✅ Notification marquée comme lue:', notificationId);

      return NextResponse.json({
        success: true,
        message: 'Notification marquée comme lue'
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('❌ Erreur mise à jour notification:', error);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const userId = Number(payload.userId);
    const notificationId = Number(resolvedParams.id);

    if (!Number.isInteger(userId) || !Number.isInteger(notificationId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Vérifier que la notification appartient à l'utilisateur
      const [notificationCheck] = await connection.execute(`
        SELECT user_id FROM notification WHERE id = ?
      `, [notificationId]);

      if ((notificationCheck as any[]).length === 0) {
        return NextResponse.json({ error: 'Notification non trouvée' }, { status: 404 });
      }

      const notificationUserId = (notificationCheck as any[])[0].user_id;
      if (notificationUserId !== userId) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }

      // Supprimer la notification
      await connection.execute(`
        DELETE FROM notification WHERE id = ?
      `, [notificationId]);

      console.log('✅ Notification supprimée:', notificationId);

      return NextResponse.json({
        success: true,
        message: 'Notification supprimée'
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('❌ Erreur suppression notification:', error);

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

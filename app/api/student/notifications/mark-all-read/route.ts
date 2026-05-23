import { NextRequest, NextResponse } from 'next/server';
import mysql from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool();

export async function PUT(request: NextRequest) {
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
      // Marquer toutes les notifications de l'utilisateur comme lues
      const [result] = await connection.execute(`
        UPDATE notification SET is_read = TRUE 
        WHERE user_id = ? AND is_read = FALSE
      `, [userId]);

      const updatedCount = (result as any).affectedRows;

      console.log(`✅ ${updatedCount} notifications marquées comme lues pour l'utilisateur:`, userId);

      return NextResponse.json({
        success: true,
        message: `${updatedCount} notification(s) marquée(s) comme lue(s)`,
        count: updatedCount
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('❌ Erreur marquer toutes notifications lues:', error);

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


// app/api/student/forum/replies/[id]/like/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

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

    if (isNaN(replyId) || !Number.isInteger(replyId)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    // Vérifier si la réponse existe
    const replyCheck = await pool.query(
      'SELECT id, likes FROM forum_reply WHERE id = $1',
      [replyId]
    );

    if (replyCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Réponse non trouvée' },
        { status: 404 }
      );
    }

    // Incrémenter le compteur de likes
    await pool.query(
      'UPDATE forum_reply SET likes = likes + 1 WHERE id = $1',
      [replyId]
    );

    // Récupérer le nouveau nombre de likes
    const updatedReply = await pool.query(
      'SELECT likes FROM forum_reply WHERE id = $1',
      [replyId]
    );

    const newLikesCount = updatedReply.rows[0].likes;

    console.log(`✅ Like ajouté à la réponse ${replyId} (${newLikesCount} likes total)`);

    return NextResponse.json({
      success: true,
      message: 'Like ajouté avec succès',
      data: {
        likes: parseInt(newLikesCount)
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur like reply:', error);
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

// DELETE pour retirer un like d'une réponse
export async function DELETE(
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

    if (isNaN(replyId) || !Number.isInteger(replyId)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    // Vérifier si la réponse existe
    const replyCheck = await pool.query(
      'SELECT id FROM forum_reply WHERE id = $1',
      [replyId]
    );

    if (replyCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Réponse non trouvée' },
        { status: 404 }
      );
    }

    // Décrémenter les likes (empêcher les valeurs négatives)
    await pool.query(
      'UPDATE forum_reply SET likes = GREATEST(likes - 1, 0) WHERE id = $1',
      [replyId]
    );

    // Récupérer le nouveau nombre de likes
    const updatedReply = await pool.query(
      'SELECT likes FROM forum_reply WHERE id = $1',
      [replyId]
    );

    const newLikesCount = updatedReply.rows[0].likes;

    console.log(`✅ Like retiré de la réponse ${replyId} (${newLikesCount} likes restants)`);

    return NextResponse.json({
      success: true,
      message: 'Like retiré avec succès',
      data: {
        likes: parseInt(newLikesCount)
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur retrait like:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
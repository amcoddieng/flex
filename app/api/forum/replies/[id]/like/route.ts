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
    const replyId = parseInt(resolvedParams.id);
    
    if (isNaN(replyId) || replyId <= 0) {
      return NextResponse.json({ error: 'ID de réponse invalide' }, { status: 400 });
    }

    const userId = Number(payload.userId);

    // Récupérer l'ID du profil étudiant
    const studentResult = await pool.query(
      'SELECT id FROM student_profile WHERE user_id = $1',
      [userId]
    );

    if (studentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Profil étudiant non trouvé' },
        { status: 404 }
      );
    }

    const studentId = studentResult.rows[0].id;

    // Vérifier que la réponse existe et récupérer l'auteur
    const replyCheck = await pool.query(
      'SELECT id, author_id, likes FROM forum_reply WHERE id = $1',
      [replyId]
    );

    if (replyCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Réponse non trouvée' }, { status: 404 });
    }

    const reply = replyCheck.rows[0];

    // Vérifier que l'utilisateur ne like pas sa propre réponse
    if (reply.author_id === studentId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas liker votre propre réponse' },
        { status: 403 }
      );
    }

    // Vérifier si l'utilisateur a déjà liké cette réponse
    const existingLike = await pool.query(
      'SELECT id FROM reply_likes WHERE reply_id = $1 AND student_id = $2',
      [replyId, studentId]
    );

    let action: 'liked' | 'unliked';
    let newLikesCount = reply.likes;

    if (existingLike.rows.length > 0) {
      // Retirer le like
      await pool.query(
        'DELETE FROM reply_likes WHERE reply_id = $1 AND student_id = $2',
        [replyId, studentId]
      );
      await pool.query(
        'UPDATE forum_reply SET likes = GREATEST(likes - 1, 0) WHERE id = $1',
        [replyId]
      );
      action = 'unliked';
      newLikesCount = Math.max(reply.likes - 1, 0);
    } else {
      // Ajouter le like
      await pool.query(
        'INSERT INTO reply_likes (reply_id, student_id, created_at) VALUES ($1, $2, NOW())',
        [replyId, studentId]
      );
      await pool.query(
        'UPDATE forum_reply SET likes = likes + 1 WHERE id = $1',
        [replyId]
      );
      action = 'liked';
      newLikesCount = reply.likes + 1;
    }

    // Récupérer le nouveau nombre de likes
    const updatedReply = await pool.query(
      'SELECT likes FROM forum_reply WHERE id = $1',
      [replyId]
    );

    const totalLikes = parseInt(updatedReply.rows[0]?.likes) || 0;

    console.log(`✅ ${action === 'liked' ? 'Like ajouté' : 'Like retiré'} sur la réponse ${replyId}`);

    return NextResponse.json({
      success: true,
      message: action === 'liked' ? 'Like ajouté avec succès' : 'Like retiré avec succès',
      data: {
        action,
        totalLikes,
        isLiked: action === 'liked'
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur like réponse forum:', error);
    
    // Gérer les erreurs de contrainte unique
    if (error.code === '23505') { // PostgreSQL unique violation
      return NextResponse.json(
        { error: 'Vous avez déjà liké cette réponse' },
        { status: 409 }
      );
    }
    
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors du like' 
      : (error?.message || String(error));
      
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE pour retirer un like
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
    const replyId = parseInt(resolvedParams.id);
    
    if (isNaN(replyId) || replyId <= 0) {
      return NextResponse.json({ error: 'ID de réponse invalide' }, { status: 400 });
    }

    const userId = Number(payload.userId);

    // Récupérer l'ID du profil étudiant
    const studentResult = await pool.query(
      'SELECT id FROM student_profile WHERE user_id = $1',
      [userId]
    );

    if (studentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Profil étudiant non trouvé' },
        { status: 404 }
      );
    }

    const studentId = studentResult.rows[0].id;

    // Vérifier si l'utilisateur a liké cette réponse
    const existingLike = await pool.query(
      'SELECT id FROM reply_likes WHERE reply_id = $1 AND student_id = $2',
      [replyId, studentId]
    );

    if (existingLike.rows.length === 0) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas liké cette réponse' },
        { status: 400 }
      );
    }

    // Retirer le like
    await pool.query(
      'DELETE FROM reply_likes WHERE reply_id = $1 AND student_id = $2',
      [replyId, studentId]
    );
    
    await pool.query(
      'UPDATE forum_reply SET likes = GREATEST(likes - 1, 0) WHERE id = $1',
      [replyId]
    );

    // Récupérer le nouveau nombre de likes
    const updatedReply = await pool.query(
      'SELECT likes FROM forum_reply WHERE id = $1',
      [replyId]
    );

    const totalLikes = parseInt(updatedReply.rows[0]?.likes) || 0;

    console.log(`✅ Like retiré de la réponse ${replyId}`);

    return NextResponse.json({
      success: true,
      message: 'Like retiré avec succès',
      data: {
        action: 'unliked',
        totalLikes,
        isLiked: false
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur retrait like:', error);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors du retrait du like' 
      : (error?.message || String(error));
      
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
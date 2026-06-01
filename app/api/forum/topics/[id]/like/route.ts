// app/api/forum/topics/[id]/like/route.ts
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
    const topicId = parseInt(resolvedParams.id);
    
    if (isNaN(topicId) || topicId <= 0) {
      return NextResponse.json({ error: 'ID de sujet invalide' }, { status: 400 });
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

    // Vérifier que le sujet existe et récupérer l'auteur
    const topicCheck = await pool.query(
      'SELECT id, author_id, likes FROM forum_topic WHERE id = $1',
      [topicId]
    );

    if (topicCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Sujet non trouvé' }, { status: 404 });
    }

    const topic = topicCheck.rows[0];

    // Vérifier que l'utilisateur ne like pas son propre sujet
    if (topic.author_id === studentId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas liker votre propre sujet' },
        { status: 403 }
      );
    }

    // Vérifier si l'utilisateur a déjà liké ce sujet
    const existingLike = await pool.query(
      'SELECT id FROM topic_likes WHERE topic_id = $1 AND student_id = $2',
      [topicId, studentId]
    );

    let action: 'liked' | 'unliked';
    let newLikesCount = topic.likes;

    if (existingLike.rows.length > 0) {
      // Retirer le like
      await pool.query(
        'DELETE FROM topic_likes WHERE topic_id = $1 AND student_id = $2',
        [topicId, studentId]
      );
      await pool.query(
        'UPDATE forum_topic SET likes = GREATEST(likes - 1, 0) WHERE id = $1',
        [topicId]
      );
      action = 'unliked';
      newLikesCount = Math.max(topic.likes - 1, 0);
      
      console.log(`✅ Like retiré du sujet ${topicId} par l'étudiant ${studentId}`);
    } else {
      // Ajouter le like
      await pool.query(
        'INSERT INTO topic_likes (topic_id, student_id, created_at) VALUES ($1, $2, NOW())',
        [topicId, studentId]
      );
      await pool.query(
        'UPDATE forum_topic SET likes = likes + 1 WHERE id = $1',
        [topicId]
      );
      action = 'liked';
      newLikesCount = topic.likes + 1;
      
      console.log(`✅ Like ajouté au sujet ${topicId} par l'étudiant ${studentId}`);
    }

    // Récupérer le nouveau nombre de likes
    const updatedTopic = await pool.query(
      'SELECT likes FROM forum_topic WHERE id = $1',
      [topicId]
    );

    const totalLikes = parseInt(updatedTopic.rows[0]?.likes) || 0;

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
    console.error('❌ Erreur like sujet forum:', error);
    
    // Gérer les erreurs de contrainte unique
    if (error.code === '23505') { // PostgreSQL unique violation
      return NextResponse.json(
        { error: 'Vous avez déjà liké ce sujet' },
        { status: 409 }
      );
    }
    
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors du like' 
      : (error?.message || String(error));
      
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE pour retirer un like (alternative à POST avec action)
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
    const topicId = parseInt(resolvedParams.id);
    
    if (isNaN(topicId) || topicId <= 0) {
      return NextResponse.json({ error: 'ID de sujet invalide' }, { status: 400 });
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

    // Vérifier si l'utilisateur a liké ce sujet
    const existingLike = await pool.query(
      'SELECT id FROM topic_likes WHERE topic_id = $1 AND student_id = $2',
      [topicId, studentId]
    );

    if (existingLike.rows.length === 0) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas liké ce sujet' },
        { status: 400 }
      );
    }

    // Retirer le like
    await pool.query(
      'DELETE FROM topic_likes WHERE topic_id = $1 AND student_id = $2',
      [topicId, studentId]
    );
    
    await pool.query(
      'UPDATE forum_topic SET likes = GREATEST(likes - 1, 0) WHERE id = $1',
      [topicId]
    );

    // Récupérer le nouveau nombre de likes
    const updatedTopic = await pool.query(
      'SELECT likes FROM forum_topic WHERE id = $1',
      [topicId]
    );

    const totalLikes = parseInt(updatedTopic.rows[0]?.likes) || 0;

    console.log(`✅ Like retiré du sujet ${topicId}`);

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
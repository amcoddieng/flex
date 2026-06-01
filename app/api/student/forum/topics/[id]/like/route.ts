// app/api/student/forum/topics/[id]/like/route.ts
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
    const topicId = Number(resolvedParams.id);

    if (isNaN(topicId) || !Number.isInteger(topicId)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    // Vérifier si l'utilisateur a déjà liké ce sujet (optionnel)
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

    // Vérifier si le topic existe
    const topicCheck = await pool.query(
      'SELECT id, likes FROM forum_topic WHERE id = $1',
      [topicId]
    );

    if (topicCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Sujet non trouvé' },
        { status: 404 }
      );
    }

    // Option 1: Simple - Incrémenter les likes sans vérification
    await pool.query(
      'UPDATE forum_topic SET likes = likes + 1 WHERE id = $1',
      [topicId]
    );

    // Récupérer le nouveau nombre de likes
    const updatedTopic = await pool.query(
      'SELECT likes FROM forum_topic WHERE id = $1',
      [topicId]
    );

    const newLikesCount = updatedTopic.rows[0].likes;

    console.log(`✅ Like ajouté au sujet ${topicId} (${newLikesCount} likes total)`);

    return NextResponse.json({
      success: true,
      message: 'Like ajouté avec succès',
      data: {
        likes: parseInt(newLikesCount)
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur like topic:', error);
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
    const topicId = Number(resolvedParams.id);

    if (isNaN(topicId) || !Number.isInteger(topicId)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    // Vérifier si le topic existe
    const topicCheck = await pool.query(
      'SELECT id FROM forum_topic WHERE id = $1',
      [topicId]
    );

    if (topicCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Sujet non trouvé' },
        { status: 404 }
      );
    }

    // Décrémenter les likes (empêcher les valeurs négatives)
    await pool.query(
      'UPDATE forum_topic SET likes = GREATEST(likes - 1, 0) WHERE id = $1',
      [topicId]
    );

    // Récupérer le nouveau nombre de likes
    const updatedTopic = await pool.query(
      'SELECT likes FROM forum_topic WHERE id = $1',
      [topicId]
    );

    const newLikesCount = updatedTopic.rows[0].likes;

    console.log(`✅ Like retiré du sujet ${topicId} (${newLikesCount} likes restants)`);

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
// app/api/forum/topics/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const resolvedParams = await params;
    const topicId = parseInt(resolvedParams.id);
    
    if (isNaN(topicId) || topicId <= 0) {
      return NextResponse.json({ error: 'ID de sujet invalide' }, { status: 400 });
    }

    // Récupérer le sujet avec les informations de l'auteur
    const topicResult = await pool.query(`
      SELECT 
        ft.id,
        ft.author_id,
        ft.author_name,
        ft.author_university,
        ft.author_department,
        ft.category,
        ft.title,
        ft.content,
        ft.tags,
        ft.likes,
        ft.is_pinned,
        ft.created_at,
        ft.updated_at,
        sp.first_name,
        sp.last_name,
        sp.profile_photo,
        sp.email as author_email,
        COALESCE(
          (SELECT COUNT(*) FROM forum_reply WHERE topic_id = ft.id),
          0
        ) as reply_count
      FROM forum_topic ft
      LEFT JOIN student_profile sp ON ft.author_id = sp.id
      WHERE ft.id = $1
    `, [topicId]);

    if (topicResult.rows.length === 0) {
      return NextResponse.json({ error: 'Sujet non trouvé' }, { status: 404 });
    }

    const topic = topicResult.rows[0];
    
    // Parser les tags JSON
    let parsedTags: string[] = [];
    try {
      if (topic.tags) {
        if (Array.isArray(topic.tags)) {
          parsedTags = topic.tags;
        } else if (typeof topic.tags === 'string') {
          try {
            const parsed = JSON.parse(topic.tags);
            parsedTags = Array.isArray(parsed) ? parsed : [];
          } catch {
            // Si ce n'est pas du JSON valide, traiter comme une chaîne simple
            if (topic.tags.includes(',')) {
              parsedTags = topic.tags.split(',').map((tag: string) => tag.trim());
            } else if (topic.tags.trim()) {
              parsedTags = [topic.tags.trim()];
            }
          }
        }
      }
    } catch (error) {
      console.warn('Erreur parsing tags:', error);
      parsedTags = [];
    }

    // Formater le sujet
    const formattedTopic = {
      id: topic.id,
      author_id: topic.author_id,
      author_name: topic.author_name,
      author_university: topic.author_university,
      author_department: topic.author_department,
      author_first_name: topic.first_name,
      author_last_name: topic.last_name,
      author_photo: topic.profile_photo,
      author_email: topic.author_email,
      category: topic.category,
      title: topic.title,
      content: topic.content,
      tags: parsedTags,
      likes: parseInt(topic.likes) || 0,
      is_pinned: Boolean(topic.is_pinned),
      created_at: topic.created_at,
      updated_at: topic.updated_at,
      reply_count: parseInt(topic.reply_count) || 0
    };

    // Récupérer les réponses avec les informations des auteurs
    const repliesResult = await pool.query(`
      SELECT 
        fr.id,
        fr.topic_id,
        fr.author_id,
        fr.author_name,
        fr.author_university,
        fr.content,
        fr.likes,
        fr.is_helpful,
        fr.created_at,
        sp.first_name,
        sp.last_name,
        sp.profile_photo,
        sp.email as author_email,
        COALESCE(
          (SELECT COUNT(*) FROM comment_reply WHERE reply_comment_id = fr.id),
          0
        ) as comment_count
      FROM forum_reply fr
      LEFT JOIN student_profile sp ON fr.author_id = sp.id
      WHERE fr.topic_id = $1
      ORDER BY fr.created_at ASC
    `, [topicId]);

    const formattedReplies = repliesResult.rows.map(reply => ({
      id: reply.id,
      topic_id: reply.topic_id,
      author_id: reply.author_id,
      author_name: reply.author_name,
      author_university: reply.author_university,
      author_first_name: reply.first_name,
      author_last_name: reply.last_name,
      author_photo: reply.profile_photo,
      author_email: reply.author_email,
      content: reply.content,
      likes: parseInt(reply.likes) || 0,
      is_helpful: Boolean(reply.is_helpful),
      created_at: reply.created_at,
      comment_count: parseInt(reply.comment_count) || 0
    }));

    console.log(`✅ Sujet ${topicId} récupéré avec ${formattedReplies.length} réponses`);

    return NextResponse.json({
      success: true,
      data: {
        topic: formattedTopic,
        replies: formattedReplies
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur récupération sujet forum:', error);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors de la récupération du sujet' 
      : (error?.message || String(error));
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT pour mettre à jour un sujet
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const resolvedParams = await params;
    const topicId = parseInt(resolvedParams.id);
    
    if (isNaN(topicId) || topicId <= 0) {
      return NextResponse.json({ error: 'ID de sujet invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { title, content, category, tags } = body;

    // Vérifier que l'utilisateur est l'auteur du sujet
    const topicCheck = await pool.query(
      'SELECT author_id FROM forum_topic WHERE id = $1',
      [topicId]
    );

    if (topicCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Sujet non trouvé' }, { status: 404 });
    }

    // Récupérer l'ID du profil étudiant
    const studentResult = await pool.query(
      'SELECT id FROM student_profile WHERE user_id = $1',
      [parseInt(payload.userId)]
    );

    const studentId = studentResult.rows[0]?.id;

    if (topicCheck.rows[0].author_id !== studentId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à modifier ce sujet' },
        { status: 403 }
      );
    }

    // Mettre à jour le sujet
    await pool.query(`
      UPDATE forum_topic 
      SET title = $1, content = $2, category = $3, tags = $4, updated_at = NOW()
      WHERE id = $5
    `, [
      title,
      content,
      category,
      JSON.stringify(tags || []),
      topicId
    ]);

    console.log(`✅ Sujet ${topicId} mis à jour`);

    return NextResponse.json({
      success: true,
      message: 'Sujet mis à jour avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur mise à jour sujet:', error);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors de la mise à jour du sujet' 
      : (error?.message || String(error));
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE pour supprimer un sujet
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
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
    }

    const resolvedParams = await params;
    const topicId = parseInt(resolvedParams.id);
    
    if (isNaN(topicId) || topicId <= 0) {
      return NextResponse.json({ error: 'ID de sujet invalide' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est l'auteur du sujet
    const topicCheck = await pool.query(
      'SELECT author_id FROM forum_topic WHERE id = $1',
      [topicId]
    );

    if (topicCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Sujet non trouvé' }, { status: 404 });
    }

    // Récupérer l'ID du profil étudiant
    const studentResult = await pool.query(
      'SELECT id FROM student_profile WHERE user_id = $1',
      [parseInt(payload.userId)]
    );

    const studentId = studentResult.rows[0]?.id;

    if (topicCheck.rows[0].author_id !== studentId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer ce sujet' },
        { status: 403 }
      );
    }

    // Supprimer le sujet (les réponses seront supprimées automatiquement grâce à ON DELETE CASCADE)
    await pool.query('DELETE FROM forum_topic WHERE id = $1', [topicId]);

    console.log(`✅ Sujet ${topicId} supprimé`);

    return NextResponse.json({
      success: true,
      message: 'Sujet supprimé avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur suppression sujet:', error);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors de la suppression du sujet' 
      : (error?.message || String(error));
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
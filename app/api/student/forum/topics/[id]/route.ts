// app/api/student/forum/topics/[id]/route.ts
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
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const resolvedParams = await params;
    const topicId = Number(resolvedParams.id);
    
    if (isNaN(topicId) || !Number.isInteger(topicId)) {
      return NextResponse.json({ error: 'ID de sujet invalide' }, { status: 400 });
    }

    // Récupérer le sujet spécifique - Version PostgreSQL
    const topicResult = await pool.query(`
      SELECT 
        ft.id,
        ft.author_id,
        ft.title,
        ft.content,
        ft.tags,
        ft.likes,
        ft.is_pinned,
        ft.created_at,
        ft.author_name as ft_author_name,
        sp.first_name,
        sp.last_name,
        sp.university,
        sp.department,
        sp.profile_photo,
        CONCAT(sp.first_name, ' ', sp.last_name) as author_name,
        (
          SELECT COUNT(*) FROM forum_reply WHERE topic_id = ft.id
        ) as reply_count
      FROM forum_topic ft
      JOIN student_profile sp ON ft.author_id = sp.id
      WHERE ft.id = $1
    `, [topicId]);

    if (topicResult.rows.length === 0) {
      return NextResponse.json({ error: 'Sujet non trouvé' }, { status: 404 });
    }
 
    const topic = topicResult.rows[0];

    // Récupérer les réponses du sujet
    const repliesResult = await pool.query(`
      SELECT 
        fr.id,
        fr.content,
        fr.likes,
        fr.created_at,
        fr.author_id,
        sp.first_name,
        sp.last_name,
        sp.university,
        sp.department,
        sp.profile_photo,
        CONCAT(sp.first_name, ' ', sp.last_name) as author_name
      FROM forum_reply fr
      JOIN student_profile sp ON fr.author_id = sp.id
      WHERE fr.topic_id = $1
      ORDER BY fr.created_at ASC
    `, [topicId]);

    // Formater les données
    const formattedTopic = {
      id: topic.id,
      author_id: topic.author_id,
      author_name: topic.author_name || topic.ft_author_name,
      author_university: topic.university,
      author_department: topic.department,
      author_photo: topic.profile_photo,
      title: topic.title,
      content: topic.content,
      tags: topic.tags || [],
      likes: parseInt(topic.likes) || 0,
      is_pinned: Boolean(topic.is_pinned),
      created_at: topic.created_at,
      updated_at: topic.updated_at,
      reply_count: parseInt(topic.reply_count) || 0,
      replies: repliesResult.rows.map((reply: any) => ({
        id: reply.id,
        content: reply.content,
        likes: parseInt(reply.likes) || 0,
        created_at: reply.created_at,
        author_id: reply.author_id,
        author_name: reply.author_name,
        author_university: reply.university,
        author_department: reply.department,
        author_photo: reply.profile_photo
      }))
    };

    console.log(`✅ Sujet ${topicId} récupéré avec ${formattedTopic.replies.length} réponses`);

    return NextResponse.json({
      success: true,
      data: formattedTopic
    });

  } catch (error: any) {
    console.error('❌ Erreur récupération sujet:', error);
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

// PUT pour modifier un sujet
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
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const userId = Number(payload.userId);
    const resolvedParams = await params;
    const topicId = Number(resolvedParams.id);
    
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

    // Vérifier le propriétaire
    const studentResult = await pool.query(
      'SELECT id FROM student_profile WHERE user_id = $1',
      [userId]
    );

    const studentId = studentResult.rows[0]?.id;
    
    if (topicCheck.rows[0].author_id !== studentId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à modifier ce sujet' },
        { status: 403 }
      );
    }

    // Mettre à jour le sujet
    await pool.query(
      `
      UPDATE forum_topic 
      SET title = $1, content = $2, tags = $3, updated_at = NOW()
      WHERE id = $4
      `,
      [title, content, tags || null, topicId]
    );

    console.log(`✅ Sujet ${topicId} mis à jour`);

    return NextResponse.json({
      success: true,
      message: 'Sujet mis à jour avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur mise à jour sujet:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
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
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const userId = Number(payload.userId);
    const resolvedParams = await params;
    const topicId = Number(resolvedParams.id);

    // Vérifier que l'utilisateur est l'auteur
    const topicCheck = await pool.query(
      'SELECT author_id FROM forum_topic WHERE id = $1',
      [topicId]
    );

    if (topicCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Sujet non trouvé' }, { status: 404 });
    }

    const studentResult = await pool.query(
      'SELECT id FROM student_profile WHERE user_id = $1',
      [userId]
    );

    const studentId = studentResult.rows[0]?.id;
    
    if (topicCheck.rows[0].author_id !== studentId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer ce sujet' },
        { status: 403 }
      );
    }

    // Supprimer d'abord les réponses (si pas de CASCADE)
    await pool.query('DELETE FROM forum_reply WHERE topic_id = $1', [topicId]);
    
    // Supprimer le sujet
    await pool.query('DELETE FROM forum_topic WHERE id = $1', [topicId]);

    console.log(`✅ Sujet ${topicId} supprimé`);

    return NextResponse.json({
      success: true,
      message: 'Sujet supprimé avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur suppression sujet:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
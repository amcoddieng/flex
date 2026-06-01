// app/api/student/forum/topics/[id]/replies/route.ts
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
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    // Get all replies for this topic - Version PostgreSQL
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
        CONCAT(sp.first_name, ' ', sp.last_name) as full_name
      FROM forum_reply fr
      LEFT JOIN student_profile sp ON fr.author_id = sp.id
      WHERE fr.topic_id = $1
      ORDER BY fr.created_at ASC
    `, [topicId]);

    // Format author names if we have student profile info
    const formattedReplies = repliesResult.rows.map(reply => ({
      id: reply.id,
      topic_id: reply.topic_id,
      author_id: reply.author_id,
      author_name: reply.full_name || reply.author_name,
      author_university: reply.author_university,
      author_photo: reply.profile_photo,
      content: reply.content,
      likes: parseInt(reply.likes) || 0,
      is_helpful: Boolean(reply.is_helpful),
      created_at: reply.created_at
    }));

    console.log(`✅ ${formattedReplies.length} réponses récupérées pour le sujet ${topicId}`);

    return NextResponse.json({
      success: true,
      data: formattedReplies
    });

  } catch (error: any) {
    console.error('❌ Erreur récupération réponses:', error);
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
    const userId = Number(payload.userId);
    const body = await request.json();
    const { content } = body;

    if (isNaN(topicId) || !Number.isInteger(topicId)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le contenu de la réponse est requis' },
        { status: 400 }
      );
    }

    // Get student_id from user_id - Version PostgreSQL
    const studentResult = await pool.query(
      'SELECT id, first_name, last_name, university FROM student_profile WHERE user_id = $1',
      [userId]
    );

    if (studentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Profil étudiant non trouvé' },
        { status: 404 }
      );
    }

    const student = studentResult.rows[0];
    const studentId = student.id;
    const authorName = `${student.first_name} ${student.last_name}`;
    const authorUniversity = student.university;

    // Verify topic exists
    const topicCheck = await pool.query(
      'SELECT id, title FROM forum_topic WHERE id = $1',
      [topicId]
    );

    if (topicCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Sujet non trouvé' },
        { status: 404 }
      );
    }

    // Create new reply - Version PostgreSQL avec RETURNING
    const result = await pool.query(
      `
      INSERT INTO forum_reply (
        topic_id, 
        author_id, 
        author_name, 
        author_university,
        content, 
        likes, 
        is_helpful, 
        created_at
      ) VALUES ($1, $2, $3, $4, $5, 0, 0, NOW())
      RETURNING id, topic_id, author_id, author_name, author_university, content, likes, is_helpful, created_at
      `,
      [topicId, studentId, authorName, authorUniversity, content.trim()]
    );

    const newReply = result.rows[0];

    console.log(`✅ Nouvelle réponse créée pour le sujet ${topicId} (ID: ${newReply.id})`);

    // Optionnel: Mettre à jour la date du sujet
    // await pool.query(
    //   'UPDATE forum_topic SET updated_at = NOW() WHERE id = $1',
    //   [topicId]
    // );

    return NextResponse.json({
      success: true,
      data: {
        id: newReply.id,
        topic_id: newReply.topic_id,
        author_id: newReply.author_id,
        author_name: newReply.author_name,
        author_university: newReply.author_university,
        content: newReply.content,
        likes: newReply.likes,
        is_helpful: newReply.is_helpful,
        created_at: newReply.created_at
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Erreur création réponse:', error);
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

// PUT pour modifier une réponse
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
    const replyId = Number(resolvedParams.id);
    const body = await request.json();
    const { content, is_helpful } = body;

    // Vérifier que l'utilisateur est l'auteur de la réponse
    const replyCheck = await pool.query(
      `SELECT fr.author_id, sp.user_id 
       FROM forum_reply fr
       JOIN student_profile sp ON fr.author_id = sp.id
       WHERE fr.id = $1`,
      [replyId]
    );

    if (replyCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Réponse non trouvée' }, { status: 404 });
    }

    if (replyCheck.rows[0].user_id !== userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à modifier cette réponse' },
        { status: 403 }
      );
    }

    // Mettre à jour la réponse
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (content) {
      updates.push(`content = $${paramCount}`);
      values.push(content.trim());
      paramCount++;
    }

    if (typeof is_helpful === 'boolean') {
      updates.push(`is_helpful = $${paramCount}`);
      values.push(is_helpful);
      paramCount++;
    }

    updates.push(`updated_at = NOW()`);

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }

    values.push(replyId);
    await pool.query(
      `UPDATE forum_reply SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    console.log(`✅ Réponse ${replyId} mise à jour`);

    return NextResponse.json({
      success: true,
      message: 'Réponse mise à jour avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur mise à jour réponse:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE pour supprimer une réponse
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
    const replyId = Number(resolvedParams.id);

    // Vérifier que l'utilisateur est l'auteur
    const replyCheck = await pool.query(
      `SELECT fr.author_id, fr.topic_id, sp.user_id 
       FROM forum_reply fr
       JOIN student_profile sp ON fr.author_id = sp.id
       WHERE fr.id = $1`,
      [replyId]
    );

    if (replyCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Réponse non trouvée' }, { status: 404 });
    }

    if (replyCheck.rows[0].user_id !== userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer cette réponse' },
        { status: 403 }
      );
    }

    const topicId = replyCheck.rows[0].topic_id;

    // Supprimer la réponse
    await pool.query('DELETE FROM forum_reply WHERE id = $1', [replyId]);

    console.log(`✅ Réponse ${replyId} supprimée`);

    return NextResponse.json({
      success: true,
      message: 'Réponse supprimée avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur suppression réponse:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
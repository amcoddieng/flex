// app/api/student/forum/replies/[id]/comments/route.ts
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
    const replyId = Number(resolvedParams.id);

    if (isNaN(replyId) || !Number.isInteger(replyId)) {
      return NextResponse.json({ error: 'ID de réponse invalide' }, { status: 400 });
    }

    // Get all comment replies for this forum reply - Version PostgreSQL
    const commentRepliesResult = await pool.query(`
      SELECT 
        cr.id,
        cr.reply_comment_id,
        cr.author_id,
        cr.author_name,
        cr.content,
        cr.likes,
        cr.created_at,
        sp.first_name,
        sp.last_name,
        sp.university,
        sp.profile_photo,
        CONCAT(sp.first_name, ' ', sp.last_name) as full_name
      FROM comment_reply cr
      LEFT JOIN student_profile sp ON cr.author_id = sp.id
      WHERE cr.reply_comment_id = $1
      ORDER BY cr.created_at ASC
    `, [replyId]);

    // Format author names if we have student profile info
    const formattedReplies = commentRepliesResult.rows.map(reply => ({
      id: reply.id,
      reply_comment_id: reply.reply_comment_id,
      author_id: reply.author_id,
      author_name: reply.full_name || reply.author_name,
      author_university: reply.university,
      author_photo: reply.profile_photo,
      content: reply.content,
      likes: parseInt(reply.likes) || 0,
      created_at: reply.created_at
    }));

    console.log(`✅ ${formattedReplies.length} commentaires récupérés pour la réponse ${replyId}`);

    return NextResponse.json({
      success: true,
      data: formattedReplies
    });

  } catch (error: any) {
    console.error('❌ Erreur récupération réponses de commentaires:', error);
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
    const replyId = Number(resolvedParams.id);
    const userId = Number(payload.userId);
    const body = await request.json();
    const { content } = body;

    if (isNaN(replyId) || !Number.isInteger(replyId)) {
      return NextResponse.json({ error: 'ID de réponse invalide' }, { status: 400 });
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

    // Verify forum reply exists
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

    // Create new comment reply - Version PostgreSQL avec RETURNING
    const result = await pool.query(
      `
      INSERT INTO comment_reply (
        reply_comment_id, 
        author_id, 
        author_name, 
        content, 
        likes, 
        created_at
      ) VALUES ($1, $2, $3, $4, 0, NOW())
      RETURNING id, reply_comment_id, author_id, author_name, content, likes, created_at
      `,
      [replyId, studentId, authorName, content.trim()]
    );

    const newCommentReply = result.rows[0];

    // Get the created comment reply with student info
    const commentWithStudent = await pool.query(`
      SELECT 
        cr.id,
        cr.reply_comment_id,
        cr.author_id,
        cr.author_name,
        cr.content,
        cr.likes,
        cr.created_at,
        sp.first_name,
        sp.last_name,
        sp.university,
        sp.profile_photo,
        CONCAT(sp.first_name, ' ', sp.last_name) as full_name
      FROM comment_reply cr
      LEFT JOIN student_profile sp ON cr.author_id = sp.id
      WHERE cr.id = $1
    `, [newCommentReply.id]);

    const formattedReply = commentWithStudent.rows[0];
    
    const responseReply = {
      id: formattedReply.id,
      reply_comment_id: formattedReply.reply_comment_id,
      author_id: formattedReply.author_id,
      author_name: formattedReply.full_name || formattedReply.author_name,
      author_university: formattedReply.university,
      author_photo: formattedReply.profile_photo,
      content: formattedReply.content,
      likes: parseInt(formattedReply.likes) || 0,
      created_at: formattedReply.created_at
    };

    console.log(`✅ Nouveau commentaire créé sur la réponse ${replyId} (ID: ${newCommentReply.id})`);

    return NextResponse.json({
      success: true,
      data: responseReply
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Erreur création réponse de commentaire:', error);
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

// PUT pour modifier un commentaire
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
    const commentId = Number(resolvedParams.id);
    const body = await request.json();
    const { content } = body;

    // Vérifier que l'utilisateur est l'auteur du commentaire
    const commentCheck = await pool.query(
      `SELECT cr.author_id, sp.user_id 
       FROM comment_reply cr
       JOIN student_profile sp ON cr.author_id = sp.id
       WHERE cr.id = $1`,
      [commentId]
    );

    if (commentCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Commentaire non trouvé' }, { status: 404 });
    }

    if (commentCheck.rows[0].user_id !== userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à modifier ce commentaire' },
        { status: 403 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le contenu est requis' },
        { status: 400 }
      );
    }

    // Mettre à jour le commentaire
    await pool.query(
      'UPDATE comment_reply SET content = $1 WHERE id = $2',
      [content.trim(), commentId]
    );

    console.log(`✅ Commentaire ${commentId} mis à jour`);

    return NextResponse.json({
      success: true,
      message: 'Commentaire mis à jour avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur mise à jour commentaire:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE pour supprimer un commentaire
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
    const commentId = Number(resolvedParams.id);

    // Vérifier que l'utilisateur est l'auteur
    const commentCheck = await pool.query(
      `SELECT cr.author_id, sp.user_id 
       FROM comment_reply cr
       JOIN student_profile sp ON cr.author_id = sp.id
       WHERE cr.id = $1`,
      [commentId]
    );

    if (commentCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Commentaire non trouvé' }, { status: 404 });
    }

    if (commentCheck.rows[0].user_id !== userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer ce commentaire' },
        { status: 403 }
      );
    }

    // Supprimer le commentaire
    await pool.query('DELETE FROM comment_reply WHERE id = $1', [commentId]);

    console.log(`✅ Commentaire ${commentId} supprimé`);

    return NextResponse.json({
      success: true,
      message: 'Commentaire supprimé avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur suppression commentaire:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
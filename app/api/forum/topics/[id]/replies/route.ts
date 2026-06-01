// app/api/forum/topics/[id]/replies/route.ts
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
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
    }

    const resolvedParams = await params;
    const topicId = parseInt(resolvedParams.id);
    
    if (isNaN(topicId) || topicId <= 0) {
      return NextResponse.json({ error: 'ID de sujet invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Le contenu est requis' }, { status: 400 });
    }

    // Récupérer les informations de l'auteur
    let authorName = payload.name || 'Utilisateur';
    let authorUniversity = '';
    let authorId: number | null = null;

    if (payload.role === 'STUDENT') {
      const studentResult = await pool.query(
        'SELECT id, first_name, last_name, university FROM student_profile WHERE user_id = $1',
        [parseInt(payload.userId)]
      );
      
      if (studentResult.rows.length > 0) {
        const student = studentResult.rows[0];
        authorName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || authorName;
        authorUniversity = student.university || '';
        authorId = student.id;
      }
    } else if (payload.role === 'EMPLOYER') {
      const employerResult = await pool.query(
        'SELECT id, company_name FROM employer_profile WHERE user_id = $1',
        [parseInt(payload.userId)]
      );
      
      if (employerResult.rows.length > 0) {
        const employer = employerResult.rows[0];
        authorName = employer.company_name || authorName;
        authorId = employer.id;
      }
    }

    // Vérifier que le sujet existe
    const topicCheck = await pool.query(
      'SELECT id FROM forum_topic WHERE id = $1',
      [topicId]
    );

    if (topicCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Sujet non trouvé' }, { status: 404 });
    }

    // Pour les employeurs, author_id est NULL (pas de lien avec student_profile)
    // Pour les étudiants, on utilise leur profile_id
    const finalAuthorId = payload.role === 'STUDENT' ? authorId : null;

    // Créer la réponse avec RETURNING
    const result = await pool.query(`
      INSERT INTO forum_reply 
      (topic_id, author_id, author_name, author_university, content, likes, is_helpful, created_at)
      VALUES ($1, $2, $3, $4, $5, 0, false, NOW())
      RETURNING id, topic_id, author_id, author_name, author_university, content, likes, is_helpful, created_at
    `, [
      topicId,
      finalAuthorId,
      authorName,
      authorUniversity,
      content.trim()
    ]);

    const newReply = result.rows[0];

    // Mettre à jour la date du topic
    await pool.query(
      'UPDATE forum_topic SET updated_at = NOW() WHERE id = $1',
      [topicId]
    );

    console.log(`✅ Nouvelle réponse créée dans le sujet ${topicId} (ID: ${newReply.id}) par ${authorName}`);

    return NextResponse.json({
      success: true,
      data: {
        id: newReply.id,
        topic_id: newReply.topic_id,
        author_id: newReply.author_id,
        author_name: newReply.author_name,
        author_university: newReply.author_university,
        content: newReply.content,
        likes: parseInt(newReply.likes) || 0,
        is_helpful: newReply.is_helpful,
        created_at: newReply.created_at
      },
      message: 'Réponse ajoutée avec succès'
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Erreur création réponse forum:', error);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors de la création de la réponse' 
      : (error?.message || String(error));
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// GET pour récupérer les réponses d'un sujet
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

    // Récupérer toutes les réponses du sujet
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
      author_photo: reply.profile_photo,
      content: reply.content,
      likes: parseInt(reply.likes) || 0,
      is_helpful: Boolean(reply.is_helpful),
      created_at: reply.created_at,
      comment_count: parseInt(reply.comment_count) || 0
    }));

    console.log(`✅ ${formattedReplies.length} réponses récupérées pour le sujet ${topicId}`);

    return NextResponse.json({
      success: true,
      data: formattedReplies
    });

  } catch (error: any) {
    console.error('❌ Erreur récupération réponses:', error);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors de la récupération des réponses' 
      : (error?.message || String(error));
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import mysql from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';
const pool = mysql.createPool();
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; discussionId: string }> }
) {
  try {
    console.log('GET /api/student/projects/[id]/discussions/[discussionId]/comments - Début de la requête');
    
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id);
    const discussionId = parseInt(resolvedParams.discussionId);
    
    console.log('📋 Paramètres reçus:', { projectId, discussionId });
    
    if (isNaN(projectId) || isNaN(discussionId)) {
      console.log('❌ IDs invalides:', { projectId, discussionId });
      return NextResponse.json(
        { error: 'ID de projet ou de discussion invalide' },
        { status: 400 }
      );
    }

    // Récupération et vérification du token
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);
    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    const connection = await pool.getConnection();

    // Vérification du token et récupération de l'ID utilisateur
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'STUDENT') {
      await connection.release();
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const studentId = parseInt(payload.userId);

    // Vérifier que l'étudiant existe bien dans student_profile
    const [studentCheck] = await connection.execute(
      'SELECT id FROM student_profile WHERE user_id = ?',
      [studentId]
    );

    if ((studentCheck as any[]).length === 0) {
      await connection.release();
      return NextResponse.json(
        { error: 'Profil étudiant non trouvé' },
        { status: 404 }
      );
    }

    const profileId = (studentCheck as any[])[0].id;

    // Vérifier que l'utilisateur est membre du projet OU créateur
    const [accessCheck] = await connection.execute(
      `SELECT 
        pm.id as member_id,
        cp.creator_id
       FROM collaborative_projects cp
       LEFT JOIN project_members pm ON cp.id = pm.project_id AND pm.member_id = ?
       WHERE cp.id = ?`,
      [profileId, projectId]
    );

    console.log('🔍 Vérification accès commentaires:', { profileId, projectId, accessCheck: accessCheck });

    if ((accessCheck as any[]).length === 0) {
      console.log('❌ Projet non trouvé:', projectId);
      await connection.release();
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    const access = (accessCheck as any[])[0];
    const isCreator = access.creator_id === profileId;
    const isMember = access.member_id !== null;

    console.log('🔐 Vérification accès - Créateur:', isCreator, 'Membre:', isMember);

    if (!isCreator && !isMember) {
      console.log('❌ Accès non autorisé - Ni créateur ni membre');
      await connection.release();
      return NextResponse.json(
        { error: 'Accès non autorisé à ce projet' },
        { status: 403 }
      );
    }

    // Récupérer les commentaires de la discussion
    console.log('📡 Récupération des commentaires pour discussion:', discussionId);
    const [comments] = await connection.execute(
      `SELECT 
        pdc.id,
        pdc.content,
        pdc.created_at,
        pdc.updated_at,
        sp.first_name,
        sp.last_name,
        sp.email,
        sp.university
       FROM project_discussion_comments pdc
       JOIN student_profile sp ON pdc.author_id = sp.id
       WHERE pdc.discussion_id = ?
       ORDER BY pdc.created_at ASC`,
      [discussionId]
    );

    console.log('💬 Commentaires récupérés:', comments);
    console.log('📊 Nombre de commentaires:', (comments as any[]).length);

    await connection.release();

    return NextResponse.json({
      success: true,
      data: {
        comments: comments
      }
    });

  } catch (error) {
    console.error('GET discussion comments error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; discussionId: string }> }
) {
  try {
    console.log('POST /api/student/projects/[id]/discussions/[discussionId]/comments - Début de la requête');
    
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id);
    const discussionId = parseInt(resolvedParams.discussionId);
    
    console.log('📋 Paramètres POST reçus:', { projectId, discussionId });
    
    if (isNaN(projectId) || isNaN(discussionId)) {
      console.log('❌ IDs invalides:', { projectId, discussionId });
      return NextResponse.json(
        { error: 'ID de projet ou de discussion invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content } = body;

    console.log('📝 Corps de la requête reçu:', body);

    if (!content || content.trim() === '') {
      console.log('❌ Contenu vide:', content);
      return NextResponse.json(
        { error: 'Le contenu du commentaire ne peut pas être vide' },
        { status: 400 }
      );
    }

    // Récupération et vérification du token
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);
    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    const connection = await pool.getConnection();

    // Vérification du token et récupération de l'ID utilisateur
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'STUDENT') {
      await connection.release();
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const studentId = parseInt(payload.userId);

    // Vérifier que l'étudiant existe bien dans student_profile
    const [studentCheck] = await connection.execute(
      'SELECT id FROM student_profile WHERE user_id = ?',
      [studentId]
    );

    if ((studentCheck as any[]).length === 0) {
      await connection.release();
      return NextResponse.json(
        { error: 'Profil étudiant non trouvé' },
        { status: 404 }
      );
    }

    const profileId = (studentCheck as any[])[0].id;

    // Vérifier que l'utilisateur est membre du projet OU créateur
    const [accessCheck] = await connection.execute(
      `SELECT 
        pm.id as member_id,
        cp.creator_id
       FROM collaborative_projects cp
       LEFT JOIN project_members pm ON cp.id = pm.project_id AND pm.member_id = ?
       WHERE cp.id = ?`,
      [profileId, projectId]
    );

    console.log('🔍 Vérification accès POST commentaire:', { profileId, projectId, accessCheck: accessCheck });

    if ((accessCheck as any[]).length === 0) {
      console.log('❌ Projet non trouvé:', projectId);
      await connection.release();
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    const access = (accessCheck as any[])[0];
    const isCreator = access.creator_id === profileId;
    const isMember = access.member_id !== null;

    console.log('🔐 Vérification accès POST - Créateur:', isCreator, 'Membre:', isMember);

    if (!isCreator && !isMember) {
      console.log('❌ Accès non autorisé POST - Ni créateur ni membre');
      await connection.release();
      return NextResponse.json(
        { error: 'Accès non autorisé à ce projet' },
        { status: 403 }
      );
    }

    // Création du commentaire
    console.log('💬 Création du commentaire:', { discussionId, profileId, content: content.trim() });
    const [result] = await connection.execute(
      'INSERT INTO project_discussion_comments (discussion_id, author_id, content) VALUES (?, ?, ?)',
      [discussionId, profileId, content.trim()]
    );

    console.log('✅ Commentaire créé avec ID:', (result as any).insertId);

    // Marquer la discussion comme non lue pour les autres membres
    await connection.execute(
      `UPDATE project_discussion_reads 
       SET read_at = CURRENT_TIMESTAMP 
       WHERE discussion_id = ? AND member_id != ?`,
      [discussionId, profileId]
    );

    await connection.release();

    return NextResponse.json({
      success: true,
      data: {
        comment: {
          id: (result as any).insertId,
          discussion_id: discussionId,
          author_id: profileId,
          content: content.trim(),
          created_at: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('POST discussion comments error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du commentaire' },
      { status: 500 }
    );
  }
}

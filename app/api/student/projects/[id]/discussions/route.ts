import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('GET /api/student/projects/[id]/discussions - Début de la requête');
    
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id);
    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'ID de projet invalide' },
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

    if ((accessCheck as any[]).length === 0) {
      await connection.release();
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    const access = (accessCheck as any[])[0];
    const isCreator = access.creator_id === profileId;
    const isMember = access.member_id !== null;

    if (!isCreator && !isMember) {
      await connection.release();
      return NextResponse.json(
        { error: 'Accès non autorisé à ce projet' },
        { status: 403 }
      );
    }

    console.log('Accès autorisé - Créateur:', isCreator, 'Membre:', isMember);

    // Récupérer toutes les discussions du projet
    console.log('Recherche des discussions pour le projet:', projectId);
    
    const [discussions] = await connection.execute(
      `SELECT 
        pd.id,
        pd.title,
        pd.content,
        pd.type,
        pd.priority,
        pd.status,
        pd.created_at,
        pd.updated_at,
        sp.first_name,
        sp.last_name,
        sp.email,
        sp.university,
        CASE 
          WHEN pm.role = 'creator' THEN 'Créateur'
          ELSE 'Membre'
        END as author_role
       FROM project_discussions pd
       JOIN student_profile sp ON pd.author_id = sp.id
       JOIN project_members pm ON pd.project_id = pm.project_id AND pm.member_id = sp.id
       WHERE pd.project_id = ?
       ORDER BY pd.priority DESC, pd.created_at DESC`,
      [projectId]
    );

    console.log('Discussions récupérées:', discussions);
    console.log('Nombre de discussions:', (discussions as any[]).length);
    
    // Vérifier si les tables existent
    const [tableCheck] = await connection.execute(
      'SHOW TABLES LIKE "project_discussions"'
    );
    console.log('Table project_discussions existe:', (tableCheck as any[]).length > 0);
    
    // Vérifier si des données existent
    const [dataCheck] = await connection.execute(
      'SELECT COUNT(*) as count FROM project_discussions WHERE project_id = ?',
      [projectId]
    );
    console.log('Données dans project_discussions pour ce projet:', (dataCheck as any[])[0]);

    await connection.release();

    return NextResponse.json({
      success: true,
      data: {
        discussions: discussions
      }
    });

  } catch (error) {
    console.error('GET discussions error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des discussions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('POST /api/student/projects/[id]/discussions - Début de la requête');
    
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id);
    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'ID de projet invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, type = 'general', priority = 'medium' } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Titre et contenu sont requis' },
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

    if ((accessCheck as any[]).length === 0) {
      await connection.release();
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    const access = (accessCheck as any[])[0];
    const isCreator = access.creator_id === profileId;
    const isMember = access.member_id !== null;

    if (!isCreator && !isMember) {
      await connection.release();
      return NextResponse.json(
        { error: 'Accès non autorisé à ce projet' },
        { status: 403 }
      );
    }

    console.log('Accès création discussion - Créateur:', isCreator, 'Membre:', isMember);

    // Création de la nouvelle discussion
    const [result] = await connection.execute(
      'INSERT INTO project_discussions (project_id, author_id, title, content, type, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [projectId, profileId, title, content, type, priority, 'open']
    );

    // Marquer la discussion comme lue par l'auteur
    await connection.execute(
      'INSERT INTO project_discussion_reads (discussion_id, member_id, read_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [(result as any).insertId, profileId]
    );

    console.log('Discussion créée avec ID:', (result as any).insertId);

    await connection.release();

    return NextResponse.json({
      success: true,
      data: {
        discussion: {
          id: (result as any).insertId,
          project_id: projectId,
          author_id: profileId,
          title,
          content,
          type,
          priority,
          status: 'open',
          created_at: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('POST discussions error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la discussion' },
      { status: 500 }
    );
  }
}

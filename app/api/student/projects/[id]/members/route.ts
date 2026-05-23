import { NextRequest, NextResponse } from 'next/server';
import mysql from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('GET /api/student/projects/[id]/members - Début de la requête');
    
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

    // Vérifier que l'utilisateur a accès à ce projet (créateur ou membre)
    const [accessCheck] = await connection.execute(
      `SELECT 
        cp.creator_id,
        pm.role as member_role
       FROM collaborative_projects cp
       LEFT JOIN project_members pm ON cp.id = pm.project_id AND pm.member_id = ?
       WHERE cp.id = ?`,
      [profileId, projectId]
    );

    if ((accessCheck as any[]).length === 0) {
      await connection.release();
      return NextResponse.json(
        { error: 'Accès non autorisé à ce projet' },
        { status: 403 }
      );
    }

    const access = (accessCheck as any[])[0];

    // Récupérer tous les membres du projet avec leurs informations
    const [members] = await connection.execute(
      `SELECT 
        pm.id,
        pm.project_id,
        pm.member_id,
        pm.role,
        pm.joined_at,
        CASE 
          WHEN cp.creator_id = pm.member_id THEN 'Créateur'
          ELSE CONCAT(sp.first_name, ' ', sp.last_name)
        END as member_name,
        sp.email as member_email,
        sp.university as member_university
       FROM project_members pm
       JOIN collaborative_projects cp ON pm.project_id = cp.id
       JOIN student_profile sp ON pm.member_id = sp.id
       WHERE pm.project_id = ?
       ORDER BY 
         CASE 
           WHEN cp.creator_id = pm.member_id THEN 1
           ELSE 2
         END,
         pm.joined_at ASC`,
      [projectId]
    );

    console.log('Membres récupérés:', members);

    await connection.release();

    return NextResponse.json({
      success: true,
      data: {
        members: members,
        userRole: access.creator_id === profileId ? 'creator' : access.member_role || null,
        projectAccess: true
      }
    });

  } catch (error) {
    console.error('GET members error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des membres' },
      { status: 500 }
    );
  }
}

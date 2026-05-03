import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  try {
    console.log('PUT /api/student/projects/[id]/applications/[applicationId]/status - Début de la requête');
    
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id);
    const applicationId = parseInt(resolvedParams.applicationId);
    
    if (isNaN(projectId) || isNaN(applicationId)) {
      return NextResponse.json(
        { error: 'ID de projet ou de candidature invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide. Valeurs possibles: accepted, rejected' },
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

    // Vérification que le projet existe et que l'utilisateur est le créateur
    const [projectCheck] = await connection.execute(
      'SELECT creator_id FROM collaborative_projects WHERE id = ?',
      [projectId]
    );

    if ((projectCheck as any[]).length === 0) {
      await connection.release();
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    const project = (projectCheck as any[])[0];
    if (project.creator_id !== profileId) {
      await connection.release();
      return NextResponse.json(
        { error: 'Seul le créateur peut gérer les candidatures' },
        { status: 403 }
      );
    }

    // Vérification que la candidature existe et appartient à ce projet
    const [applicationCheck] = await connection.execute(
      'SELECT id, status, applicant_id FROM project_applications WHERE id = ? AND project_id = ?',
      [applicationId, projectId]
    );

    if ((applicationCheck as any[]).length === 0) {
      await connection.release();
      return NextResponse.json(
        { error: 'Candidature non trouvée' },
        { status: 404 }
      );
    }

    const currentApplication = (applicationCheck as any[])[0];

    // Si la candidature est déjà acceptée, vérifier si on peut ajouter comme membre
    if (currentApplication.status === 'accepted' && status === 'accepted') {
      await connection.release();
      return NextResponse.json(
        { error: 'Cette candidature est déjà acceptée' },
        { status: 400 }
      );
    }

    console.log('Tentative de mise à jour du statut...');
    console.log('Application ID:', applicationId, 'New status:', status);

    // Mise à jour du statut de la candidature
    const [result] = await connection.execute(
      'UPDATE project_applications SET status = ? WHERE id = ?',
      [status, applicationId]
    );

    console.log('Résultat de la mise à jour:', result);

    // Si la candidature est acceptée, ajouter l'étudiant comme membre du projet
    if (status === 'accepted') {
      console.log('Ajout du membre au projet...');
      try {
        await connection.execute(
          'INSERT INTO project_members (project_id, member_id, role, joined_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
          [projectId, currentApplication.applicant_id, 'member']
        );
        console.log('Membre ajouté avec succès');
      } catch (memberError) {
        console.error('Erreur lors de l\'ajout du membre:', memberError);
        // Continuer même si l'ajout du membre échoue
      }
    }

    await connection.release();

    if ((result as any).affectedRows === 0) {
      console.log('Aucune modification effectuée');
      return NextResponse.json(
        { error: 'Aucune modification effectuée' },
        { status: 400 }
      );
    }

    console.log('Mise à jour réussie');

    return NextResponse.json({
      success: true,
      data: {
        id: applicationId,
        status: status,
        message: status === 'accepted' ? 'Candidature acceptée avec succès' : 'Candidature refusée'
      }
    });

  } catch (error) {
    console.error('PUT application status error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut de la candidature' },
      { status: 500 }
    );
  }
}

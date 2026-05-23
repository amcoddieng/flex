import { NextRequest, NextResponse } from 'next/server';
import mysql from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';
const pool = mysql.createPool();
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  try {
    console.log('PUT /api/student/projects/[id]/applications/[applicationId] - Début de la requête');
    console.log('URL de la requête:', request.url);
    
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id);
    const applicationId = parseInt(resolvedParams.applicationId);
    
    if (isNaN(projectId) || isNaN(applicationId)) {
      return NextResponse.json(
        { error: 'ID de projet ou de candidature invalide' },
        { status: 400 }
      );
    }

    console.log('Project ID:', projectId, 'Application ID:', applicationId);

    const body = await request.json();
    console.log('Body reçu:', body);
    const { action, message, skills, availability } = body;

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

    // Si c'est une action d'acceptation/refus par le créateur
    if (action === 'accept' || action === 'reject') {
      // Validation de l'action
      if (!action || (action !== 'accept' && action !== 'reject')) {
        await connection.release();
        return NextResponse.json(
          { error: 'Action invalide. Utilisez "accept" ou "reject"' },
          { status: 400 }
        );
      }

      // Vérification que l'utilisateur est le créateur du projet
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

      if ((projectCheck as any[])[0].creator_id !== profileId) {
        await connection.release();
        return NextResponse.json(
          { error: 'Seul le créateur peut accepter/refuser les candidatures' },
          { status: 403 }
        );
      }

      // Vérification que la candidature existe
      const [applicationCheck] = await connection.execute(
        'SELECT id, status FROM project_applications WHERE id = ? AND project_id = ?',
        [applicationId, projectId]
      );

      if ((applicationCheck as any[]).length === 0) {
        await connection.release();
        return NextResponse.json(
          { error: 'Candidature non trouvée' },
          { status: 404 }
        );
      }

      const application = (applicationCheck as any[])[0];
      
      // Vérification que la candidature est en attente
      if (application.status !== 'PENDING') {
        await connection.release();
        return NextResponse.json(
          { error: 'Cette candidature a déjà été traitée' },
          { status: 400 }
        );
      }

      // Mise à jour du statut de la candidature
      const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
      const [result] = await connection.execute(
        'UPDATE project_applications SET status = ? WHERE id = ?',
        [newStatus, applicationId]
      );

      await connection.release();

      return NextResponse.json({
        success: true,
        data: {
          id: applicationId,
          status: newStatus,
          message: `Candidature ${action === 'accept' ? 'acceptée' : 'refusée'} avec succès`
        }
      });
    }

    // Sinon, c'est une mise à jour par le candidat lui-même
    // Validation des champs requis
    if (!message || !skills || !availability) {
      await connection.release();
      return NextResponse.json(
        { error: 'Message, compétences et disponibilité sont requis' },
        { status: 400 }
      );
    }

    // Vérification que la candidature existe et appartient à l'utilisateur
    const [applicationCheck] = await connection.execute(
      'SELECT id, project_id FROM project_applications WHERE id = ? AND applicant_id = ?',
      [applicationId, profileId]
    );

    if ((applicationCheck as any[]).length === 0) {
      await connection.release();
      return NextResponse.json(
        { error: 'Candidature non trouvée ou non autorisée' },
        { status: 404 }
      );
    }

    const application = (applicationCheck as any[])[0];
    
    // Vérification que la candidature correspond au bon projet
    if (application.project_id !== projectId) {
      await connection.release();
      return NextResponse.json(
        { error: 'Cette candidature ne correspond pas à ce projet' },
        { status: 400 }
      );
    }

    // Vérification que le projet est toujours ouvert
    const [projectCheck] = await connection.execute(
      'SELECT status FROM collaborative_projects WHERE id = ?',
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
    if (project.status !== 'open') {
      await connection.release();
      return NextResponse.json(
        { error: 'Le projet n\'accepte plus de modifications de candidatures' },
        { status: 400 }
      );
    }

    // Mise à jour de la candidature
    const [result] = await connection.execute(
      `UPDATE project_applications 
       SET message = ?, skills = ?, availability = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND applicant_id = ?`,
      [message, skills, availability, applicationId, profileId]
    );

    await connection.release();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Aucune modification effectuée' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: applicationId,
        message: 'Candidature mise à jour avec succès'
      }
    });

  } catch (error) {
    console.error('PUT application error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la candidature' },
      { status: 500 }
    );
  }
}


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  try {
    console.log('GET /api/student/projects/[id]/applications/[applicationId] - Début de la requête');
    
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id);
    const applicationId = parseInt(resolvedParams.applicationId);
    
    if (isNaN(projectId) || isNaN(applicationId)) {
      return NextResponse.json(
        { error: 'ID de projet ou de candidature invalide' },
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

    // Récupération de la candidature spécifique
    const [applications] = await connection.execute(
      `SELECT 
        pa.*,
        CONCAT(sp.first_name, ' ', sp.last_name) as applicant_name,
        sp.university as applicant_university,
        sp.email as applicant_email
      FROM project_applications pa
      LEFT JOIN student_profile sp ON pa.applicant_id = sp.id
      WHERE pa.id = ? AND pa.project_id = ? AND pa.applicant_id = ?`,
      [applicationId, projectId, profileId]
    );

    await connection.release();

    if ((applications as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Candidature non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        application: (applications as any[])[0]
      }
    });

  } catch (error) {
    console.error('GET application error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la candidature' },
      { status: 500 }
    );
  }
}

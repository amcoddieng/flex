import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('GET /api/student/projects/[id]/my-application - Début de la requête');
    
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

    // Vérifier si l'utilisateur a déjà postulé à ce projet
    const [existingApplication] = await connection.execute(
      'SELECT * FROM project_applications WHERE project_id = ? AND applicant_id = ?',
      [projectId, profileId]
    );

    console.log('Candidature trouvée pour le candidat:', (existingApplication as any[])[0]);
    console.log('Statut de la candidature:', (existingApplication as any[])[0]?.status);

    await connection.release();

    if ((existingApplication as any[]).length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          hasApplied: true,
          application: (existingApplication as any[])[0]
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        data: {
          hasApplied: false,
          application: null
        }
      });
    }

  } catch (error) {
    console.error('GET my-application error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de la candidature' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import mysql from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    console.log('DELETE /api/student/projects/[id]/members/[memberId] - Début de la requête');
    
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id);
    const memberId = parseInt(resolvedParams.memberId);
    
    if (isNaN(projectId) || isNaN(memberId)) {
      return NextResponse.json(
        { error: 'ID de projet ou de membre invalide' },
        { status: 400 }
      );
    }

    console.log('Project ID:', projectId, 'Member ID:', memberId);

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
        { error: 'Seul le créateur peut résilier des membres' },
        { status: 403 }
      );
    }

    // Vérification que le membre existe bien dans le projet
    const [memberCheck] = await connection.execute(
      'SELECT id FROM project_members WHERE project_id = ? AND member_id = ?',
      [projectId, memberId]
    );

    if ((memberCheck as any[]).length === 0) {
      await connection.release();
      return NextResponse.json(
        { error: 'Membre non trouvé dans ce projet' },
        { status: 404 }
      );
    }

    // Suppression du membre du projet
    const [result] = await connection.execute(
      'DELETE FROM project_members WHERE project_id = ? AND member_id = ?',
      [projectId, memberId]
    );

    // Mettre à jour le statut de la candidature correspondante si elle existe
    await connection.execute(
      'UPDATE project_applications SET status = ? WHERE project_id = ? AND applicant_id = ?',
      ['REJECTED', projectId, memberId]
    );

    await connection.release();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Aucune modification effectuée' },
        { status: 400 }
      );
    }

    console.log('Membre résilié avec succès');

    return NextResponse.json({
      success: true,
      data: {
        projectId: projectId,
        memberId: memberId,
        message: 'Membre résilié avec succès'
      }
    });

  } catch (error) {
    console.error('DELETE member error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la résiliation du membre' },
      { status: 500 }
    );
  }
}

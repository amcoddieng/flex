import { NextRequest, NextResponse } from 'next/server';
import mysql from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';
const pool = mysql.createPool();
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    console.log('Token payload:', payload);
    
    if (!payload || payload.role !== 'STUDENT') {
      console.log('Token invalide ou rôle incorrect');
      await connection.release();
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const studentId = parseInt(payload.userId);
    console.log('Student ID from token:', studentId);

    // Récupérer le profileId de l'étudiant
    const [studentProfile] = await connection.execute(
      'SELECT id FROM student_profile WHERE user_id = ?',
      [studentId]
    );

    if ((studentProfile as any[]).length === 0) {
      console.log('Profil étudiant non trouvé');
      await connection.release();
      return NextResponse.json(
        { error: 'Profil étudiant non trouvé' },
        { status: 404 }
      );
    }

    const profileId = (studentProfile as any[])[0].id;
    console.log('Profile ID:', profileId);

    // Vérification que l'utilisateur est le créateur du projet
    const [projectCheck] = await connection.execute(
      'SELECT creator_id FROM collaborative_projects WHERE id = ?',
      [projectId]
    );

    console.log('Project check result:', projectCheck);

    if ((projectCheck as any[]).length === 0) {
      console.log('Projet non trouvé');
      await connection.release();
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    const creatorId = (projectCheck as any[])[0].creator_id;
    console.log('Creator ID from DB:', creatorId, 'Profile ID from token:', profileId);

    if (creatorId !== profileId) {
      console.log('L\'utilisateur n\'est pas le créateur du projet');
      await connection.release();
      return NextResponse.json(
        { error: 'Seul le créateur peut voir les candidatures' },
        { status: 403 }
      );
    }

    console.log('L\'utilisateur est bien le créateur, récupération des candidatures...');

    // Récupération des candidatures avec détails des candidats
    const [applications] = await connection.execute(
      `SELECT 
        pa.*,
        CONCAT(sp.first_name, ' ', sp.last_name) as applicant_name,
        sp.university as applicant_university,
        sp.email as applicant_email
      FROM project_applications pa
      LEFT JOIN student_profile sp ON pa.applicant_id = sp.id
      WHERE pa.project_id = ?
      ORDER BY pa.applied_at DESC`,
      [projectId]
    );

    console.log('Candidatures récupérées:', applications);
    console.log('Nombre de candidatures:', (applications as any[]).length);

    await connection.release();

    return NextResponse.json({
      success: true,
      data: {
        applications: applications
      }
    });

  } catch (error) {
    console.error('GET applications error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des candidatures' },
      { status: 500 }
    );
  }
}


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id);
    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'ID de projet invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { message, skills, availability } = body;

    // Validation des champs requis
    if (!message || !skills || !availability) {
      return NextResponse.json(
        { error: 'Message, compétences et disponibilité sont requis' },
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

    // Récupérer le vrai ID du profil étudiant
    const profileId = (studentCheck as any[])[0].id;

    // Vérification que le projet existe et est ouvert
    const [projectCheck] = await connection.execute(
      'SELECT status, creator_id FROM collaborative_projects WHERE id = ?',
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
        { error: 'Le projet n\'accepte plus de candidatures' },
        { status: 400 }
      );
    }

    // Vérification que l'utilisateur n'est pas le créateur
    if (project.creator_id === profileId) {
      await connection.release();
      return NextResponse.json(
        { error: 'Le créateur ne peut pas postuler à son propre projet' },
        { status: 400 }
      );
    }

    // Vérification que l'utilisateur n'a pas déjà postulé
    const [existingApplication] = await connection.execute(
      'SELECT id FROM project_applications WHERE project_id = ? AND applicant_id = ?',
      [projectId, profileId]
    );

    if ((existingApplication as any[]).length > 0) {
      await connection.release();
      return NextResponse.json(
        { error: 'Vous avez déjà postulé à ce projet' },
        { status: 400 }
      );
    }

    // Insertion de la candidature
    const [result] = await connection.execute(
      `INSERT INTO project_applications (project_id, applicant_id, message, skills, availability)
       VALUES (?, ?, ?, ?, ?)`,
      [projectId, profileId, message, skills, availability]
    );

    await connection.release();

    return NextResponse.json({
      success: true,
      data: {
        id: (result as any).insertId,
        message: 'Candidature envoyée avec succès'
      }
    });

  } catch (error) {
    console.error('POST application error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la candidature' },
      { status: 500 }
    );
  }
}

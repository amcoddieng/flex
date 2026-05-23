import { NextRequest, NextResponse } from 'next/server';
import mysql from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('GET /api/student/projects/[id] - Début de la requête');
    
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id);
    console.log('Project ID:', projectId);
    
    if (isNaN(projectId)) {
      console.log('ID de projet invalide');
      return NextResponse.json(
        { error: 'ID de projet invalide' },
        { status: 400 }
      );
    }

    console.log('Connexion à la base de données...');
    const connection = await pool.getConnection();
    console.log('Connexion établie');

    // Récupération du projet avec détails du créateur
    console.log('Recherche du projet avec ID:', projectId);
    
    const [projects] = await connection.execute(
      `SELECT 
        p.*,
        CONCAT(sp.first_name, ' ', sp.last_name) as creator_name,
        sp.university as creator_university,
        sp.email as creator_email
      FROM collaborative_projects p
      LEFT JOIN student_profile sp ON p.creator_id = sp.id
      WHERE p.id = ?`,
      [projectId]
    );

    console.log('Projets trouvés:', (projects as any[]).length);

    if ((projects as any[]).length === 0) {
      console.log('Projet non trouvé');
      await connection.release();
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    const project = (projects as any[])[0];
    console.log('Projet trouvé:', { id: project.id, title: project.title });

    // Récupération des membres
    const [members] = await connection.execute(
      `SELECT 
        pm.*,
        CONCAT(sp.first_name, ' ', sp.last_name) as member_name,
        sp.university as member_university
      FROM project_members pm
      LEFT JOIN student_profile sp ON pm.member_id = sp.id
      WHERE pm.project_id = ?`,
      [projectId]
    );

    // Récupération du nombre de candidatures
    const [applicationsCount] = await connection.execute(
      `SELECT COUNT(*) as total FROM project_applications WHERE project_id = ?`,
      [projectId]
    );

    await connection.release();

    console.log('Envoi de la réponse avec succès');

    return NextResponse.json({
      success: true,
      data: {
        project: {
          ...project,
          members: members,
          applications_count: (applicationsCount as any[])[0].total
        }
      }
    });

  } catch (error) {
    console.error('GET project detail error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du projet' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('PUT /api/student/projects/[id] - Début de la requête');
    
    // Test immédiat - retourner sans rien faire
    return NextResponse.json({
      success: true,
      message: 'Route PUT atteinte - test immédiat',
      timestamp: new Date().toISOString()
    });
    
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id);
    console.log('Project ID parsed:', projectId);
    
    if (isNaN(projectId)) {
      console.log('ID de projet invalide');
      return NextResponse.json(
        { error: 'ID de projet invalide' },
        { status: 400 }
      );
    }

    console.log('Lecture du body de la requête...');
    const body = await request.json();
    console.log('Body reçu:', body);
    
    const {
      title,
      description,
      category,
      objective,
      location,
      duration,
      max_participants,
      profiles_sought,
      requirements,
      status
    } = body;

    console.log('Vérification de l\'authentification...');
    // Vérification de l'authentification
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);
    console.log('Token trouvé:', !!token);
    
    if (!token) {
      console.log('Token manquant');
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    console.log('Connexion à la base de données...');
    const connection = await pool.getConnection();
    console.log('Connexion établie');

    // Décodage du token
    console.log('Vérification du token...');
    const decoded = verifyToken(token);
    console.log('Token décodé:', decoded);
    
    if (!decoded) {
      console.log('Token invalide');
      await connection.end();
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    const userId = parseInt(decoded.userId);
    console.log('User ID:', userId);

    // Vérification que l'utilisateur est le créateur
    console.log('Vérification que l\'utilisateur est le créateur...');
    const [projectCheck] = await connection.execute(
      'SELECT creator_id FROM collaborative_projects WHERE id = ?',
      [projectId]
    );

    console.log('Project check result:', projectCheck);

    if ((projectCheck as any[]).length === 0) {
      console.log('Projet non trouvé');
      await connection.end();
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    const creatorId = (projectCheck as any[])[0].creator_id;
    console.log('Creator ID:', creatorId, 'User ID:', userId);

    if (creatorId !== userId) {
      console.log('L\'utilisateur n\'est pas le créateur');
      await connection.end();
      return NextResponse.json(
        { error: 'Seul le créateur peut modifier le projet' },
        { status: 403 }
      );
    }

    console.log('L\'utilisateur est bien le créateur');

    // Construction de la requête de mise à jour
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(category);
    }
    if (objective !== undefined) {
      updateFields.push('objective = ?');
      updateValues.push(objective);
    }
    if (location !== undefined) {
      updateFields.push('location = ?');
      updateValues.push(location);
    }
    if (duration !== undefined) {
      updateFields.push('duration = ?');
      updateValues.push(duration);
    }
    if (max_participants !== undefined) {
      updateFields.push('max_participants = ?');
      updateValues.push(max_participants);
    }
    if (profiles_sought !== undefined) {
      updateFields.push('profiles_sought = ?');
      updateValues.push(profiles_sought);
    }
    if (requirements !== undefined) {
      updateFields.push('requirements = ?');
      updateValues.push(requirements);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    console.log('Construction de la requête de mise à jour...');
    console.log('Update fields:', updateFields);
    
    if (updateFields.length === 0) {
      console.log('Aucun champ à mettre à jour');
      await connection.end();
      return NextResponse.json(
        { error: 'Aucun champ à mettre à jour' },
        { status: 400 }
      );
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(projectId);

    console.log('Exécution de la mise à jour...');
    const [result] = await connection.execute(
      `UPDATE collaborative_projects SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    console.log('Résultat de la mise à jour:', result);
    console.log('Fermeture de la connexion...');

    await connection.end();

    console.log('Envoi de la réponse succès...');
    return NextResponse.json({
      success: true,
      data: {
        message: 'Projet mis à jour avec succès',
        updated: (result as any).affectedRows > 0
      }
    });

  } catch (error) {
    console.error('PUT project error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du projet' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Vérification de l'authentification
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);
    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    const connection = await pool.getConnection();

    // Décodage du token
    const decoded = verifyToken(token);
    if (!decoded) {
      await connection.end();
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    const userId = parseInt(decoded.userId);

    // Vérification que l'utilisateur est le créateur
    const [projectCheck] = await connection.execute(
      'SELECT creator_id FROM collaborative_projects WHERE id = ?',
      [projectId]
    );

    if ((projectCheck as any[]).length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    if ((projectCheck as any[])[0].creator_id !== userId) {
      await connection.end();
      return NextResponse.json(
        { error: 'Seul le créateur peut supprimer le projet' },
        { status: 403 }
      );
    }

    // Suppression du projet (les cascades supprimeront automatiquement les données liées)
    const [result] = await connection.execute(
      'DELETE FROM collaborative_projects WHERE id = ?',
      [projectId]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      data: {
        message: 'Projet supprimé avec succès',
        deleted: (result as any).affectedRows > 0
      }
    });

  } catch (error) {
    console.error('DELETE project error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du projet' },
      { status: 500 }
    );
  }
}

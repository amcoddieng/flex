import { NextRequest, NextResponse } from 'next/server';
import mysql from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool();

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/student/projects - Début de la requête');
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const location = searchParams.get('location') || '';
    const status = searchParams.get('status') || 'open';
    const search = searchParams.get('search') || '';
    const viewType = searchParams.get('view') || 'all'; // 'all', 'my', 'applied'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const offset = (page - 1) * limit;

    console.log('Paramètres reçus:', { category, location, status, search, viewType, page, limit });

    // Récupération du token pour identifier l'utilisateur
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);
    let currentUserId = null;
    
    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.role === 'STUDENT') {
        currentUserId = parseInt(payload.userId);
      }
    }

    const connection = await pool.getConnection();
    console.log('Connexion établie');

    // Construction de la requête avec filtres
    let whereClause = 'WHERE p.status = ?';
    const params: any[] = [status];

    // Filtrage selon le type de vue
    if (viewType === 'my' && currentUserId) {
      // Mes projets créés
      whereClause += ' AND p.creator_id = (SELECT id FROM student_profile WHERE user_id = ?)';
      params.push(currentUserId);
    } else if (viewType === 'applied' && currentUserId) {
      // Projets où j'ai postulé
      whereClause += ' AND p.id IN (SELECT project_id FROM project_applications WHERE applicant_id = (SELECT id FROM student_profile WHERE user_id = ?))';
      params.push(currentUserId);
    }

    if (category) {
      whereClause += ' AND p.category = ?';
      params.push(category);
    }

    if (location) {
      whereClause += ' AND p.location LIKE ?';
      params.push(`%${location}%`);
    }

    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Requête principale
    const query = `
      SELECT 
        p.*,
        CONCAT(sp.first_name, ' ', sp.last_name) as creator_name,
        sp.university as creator_university,
        sp.email as creator_email
      FROM collaborative_projects p
      LEFT JOIN student_profile sp ON p.creator_id = sp.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    console.log('Requête SQL:', query);
    console.log('Paramètres SQL:', [...params, limit, offset]);

    const [projects] = await connection.execute(query, [...params, limit, offset]);
    console.log('Projets trouvés:', (projects as any[]).length);

    // Requête de comptage
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM collaborative_projects p
      LEFT JOIN student_profile sp ON p.creator_id = sp.id
      ${whereClause}
    `;

    console.log('Requête de comptage:', countQuery);
    const [countResult] = await connection.execute(countQuery, params);
    const total = (countResult as any[])[0].total;
    console.log('Total projets:', total);

    await connection.release();

    return NextResponse.json({
      success: true,
      data: {
        projects: projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('GET projects error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/student/projects - Début de la requête');
    
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
      requirements
    } = body;

    // Validation des champs requis
    console.log('Validation des champs:', { title: !!title, description: !!description, category: !!category });
    
    if (!title || !description || !category) {
      console.log('Erreur de validation des champs');
      return NextResponse.json(
        { error: 'Titre, description et catégorie sont requis' },
        { status: 400 }
      );
    }

    // Récupération et vérification du token
    const authHeader = request.headers.get('authorization');
    console.log('Header authorization:', authHeader);
    
    const token = getTokenFromHeader(authHeader);
    console.log('Token extrait:', !!token);
    
    if (!token) {
      console.log('Erreur: Token manquant');
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    console.log('Connexion à la base de données...');
    const connection = await pool.getConnection();
    console.log('Connexion établie');

    // Vérification du token et récupération de l'ID utilisateur
    const payload = verifyToken(token);
    console.log('Payload du token:', payload);
    
    if (!payload || payload.role !== 'STUDENT') {
      console.log('Erreur: Token invalide ou rôle incorrect');
      await connection.release();
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const studentId = parseInt(payload.userId);
    console.log('Student ID:', studentId);

    // Vérifier que l'étudiant existe bien dans student_profile
    console.log('Vérification du profil étudiant avec user_id:', studentId);
    
    const [studentCheck] = await connection.execute(
      'SELECT id FROM student_profile WHERE user_id = ?',
      [studentId]
    );

    console.log('Résultat de la vérification:', (studentCheck as any[]).length);

    if ((studentCheck as any[]).length === 0) {
      console.log('Erreur: Profil étudiant non trouvé');
      await connection.release();
      return NextResponse.json(
        { error: 'Profil étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer le vrai ID du profil étudiant
    const profileId = (studentCheck as any[])[0].id;
    console.log('Profile ID trouvé:', profileId);

    console.log('Insertion du projet...');
    
    // Insertion du projet
    const [result] = await connection.execute(
      `INSERT INTO collaborative_projects (
        creator_id, title, description, category, objective, 
        location, duration, max_participants, profiles_sought, requirements
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profileId,
        title,
        description,
        category,
        objective || null,
        location || null,
        duration || null,
        max_participants || 5,
        profiles_sought || null,
        requirements || null
      ]
    );

    console.log('Projet inséré avec succès:', result);

    await connection.release();

    return NextResponse.json({
      success: true,
      data: {
        id: (result as any).insertId,
        message: 'Projet créé avec succès'
      }
    });

  } catch (error) {
    console.error('POST project error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
}

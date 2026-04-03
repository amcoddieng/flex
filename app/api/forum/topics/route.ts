import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    // Conversion robuste des paramètres avec valeurs par défaut
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;

    const connection = await pool.getConnection();

    try {
      let whereClause = '1=1';
      const params: any[] = [];

      if (search) {
        whereClause += ' AND (ft.title LIKE ? OR ft.content LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      if (category && category !== 'all') {
        whereClause += ' AND ft.category = ?';
        params.push(category);
      }

      // Calcul sécurisé de limit et offset
      const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 20)));
      const safePage = Math.max(1, Math.floor(Number(page) || 1));
      const safeOffset = (safePage - 1) * safeLimit;

      // Préparation finale des paramètres
      const finalParams = [...params];
      
      console.log('Requête params:', finalParams); // Debug
      
      // Récupérer les sujets - utilisation de requête non préparée pour LIMIT/OFFSET
      const [topics] = await connection.execute(`
        SELECT 
          ft.id,
          ft.author_id,
          ft.author_name,
          ft.author_university,
          ft.author_department,
          ft.category,
          ft.title,
          ft.content,
          ft.tags,
          ft.likes,
          ft.is_pinned,
          ft.created_at
        FROM forum_topic ft
        WHERE ${whereClause}
        ORDER BY ft.is_pinned DESC, ft.created_at DESC
        LIMIT ${safeLimit} OFFSET ${safeOffset}
      `, finalParams);

      // Compter le total (sans pagination)
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total
        FROM forum_topic ft
        WHERE ${whereClause}
      `, params);

      const total = (countResult as any)[0].total;

      // Formater les résultats
      const formattedTopics = (topics as any[]).map(topic => {
        let parsedTags = [];
        
        // Gestion robuste du parsing JSON des tags
        try {
          if (topic.tags) {
            // Si c'est déjà un tableau (cas rare)
            if (Array.isArray(topic.tags)) {
              parsedTags = topic.tags;
            } 
            // Si c'est une chaîne JSON valide
            else if (typeof topic.tags === 'string') {
              // Essayer de parser
              const parsed = JSON.parse(topic.tags);
              parsedTags = Array.isArray(parsed) ? parsed : [];
            }
            // Si c'est une chaîne simple (comma-separated)
            else if (typeof topic.tags === 'string' && topic.tags.includes(',')) {
              parsedTags = topic.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
            }
            // Si c'est une chaîne simple sans virgules
            else if (typeof topic.tags === 'string') {
              parsedTags = [topic.tags.trim()];
            }
          }
        } catch (error) {
          console.warn('Erreur parsing tags pour le sujet', topic.id, ':', error);
          parsedTags = [];
        }

        return {
          ...topic,
          tags: parsedTags,
          _count: {
            replies: 0 // Peut être calculé séparément si besoin
          }
        };
      });

      return NextResponse.json({
        topics: formattedTopics,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit)
        }
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur récupération sujets forum:', error);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors de la récupération des sujets' 
      : (error?.message || String(error));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, category, tags } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Titre, contenu et catégorie sont requis' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Récupérer les informations de l'auteur
      let authorInfo = {
        name: payload.name || 'Utilisateur',
        university: '',
        department: '',
        profileId: null
      };

      if (payload.role === 'STUDENT') {
        const [studentInfo] = await connection.execute(
          'SELECT id, first_name, last_name, university, department FROM student_profile WHERE user_id = ?',
          [parseInt(payload.userId)]
        );
        
        if ((studentInfo as any[]).length > 0) {
          const student = (studentInfo as any[])[0];
          authorInfo = {
            name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || payload.name || 'Étudiant',
            university: student.university || '',
            department: student.department || '',
            profileId: student.id
          };
        }
      } else if (payload.role === 'EMPLOYER') {
        const [employerInfo] = await connection.execute(
          'SELECT id, company_name FROM employer_profile WHERE user_id = ?',
          [parseInt(payload.userId)]
        );
        
        if ((employerInfo as any[]).length > 0) {
          const employer = (employerInfo as any[])[0];
          authorInfo = {
            name: employer.company_name || payload.name || 'Employeur',
            university: '',
            department: '',
            profileId: employer.id
          };
        }
      }

      // Pour les employeurs, on utilise NULL pour author_id car la contrainte est sur student_profile
      // Pour les étudiants, on utilise leur profile_id
      const authorId = payload.role === 'STUDENT' ? authorInfo.profileId : null;

      // Créer le sujet
      const [result] = await connection.execute(`
        INSERT INTO forum_topic 
        (author_id, author_name, author_university, author_department, category, title, content, tags, likes, is_pinned)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
      `, [
        authorId,
        authorInfo.name,
        authorInfo.university,
        authorInfo.department,
        category,
        title,
        content,
        JSON.stringify(tags || [])
      ]);

      return NextResponse.json({
        success: true,
        topicId: (result as any).insertId,
        message: 'Sujet créé avec succès'
      }, { status: 201 });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur création sujet forum:', error);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors de la création du sujet' 
      : (error?.message || String(error));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

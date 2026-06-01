// app/api/forum/topics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
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
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;

    // Construction de la requête avec paramètres
    let whereClause = '1=1';
    const queryParams: any[] = [];
    let paramCount = 1;

    if (search) {
      whereClause += ` AND (ft.title ILIKE $${paramCount} OR ft.content ILIKE $${paramCount + 1})`;
      queryParams.push(`%${search}%`, `%${search}%`);
      paramCount += 2;
    }

    if (category && category !== 'all') {
      whereClause += ` AND ft.category = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }

    // Récupérer les sujets avec pagination
    const topicsResult = await pool.query(`
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
        ft.created_at,
        ft.updated_at,
        COALESCE(
          (SELECT COUNT(*) FROM forum_reply WHERE topic_id = ft.id), 
          0
        ) as reply_count
      FROM forum_topic ft
      WHERE ${whereClause}
      ORDER BY ft.is_pinned DESC, ft.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...queryParams, limit, offset]);

    // Compter le total (sans pagination)
    const countResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM forum_topic ft
      WHERE ${whereClause}
    `, queryParams);

    const total = parseInt(countResult.rows[0]?.total) || 0;

    // Formater les résultats
    const formattedTopics = topicsResult.rows.map(topic => {
      let parsedTags: string[] = [];
      
      // Gestion robuste du parsing JSON des tags
      try {
        if (topic.tags) {
          if (Array.isArray(topic.tags)) {
            parsedTags = topic.tags;
          } else if (typeof topic.tags === 'string') {
            try {
              const parsed = JSON.parse(topic.tags);
              parsedTags = Array.isArray(parsed) ? parsed : [];
            } catch {
              // Si ce n'est pas du JSON valide, traiter comme une chaîne simple
              if (topic.tags.includes(',')) {
                parsedTags = topic.tags.split(',').map((tag: string) => tag.trim());
              } else if (topic.tags.trim()) {
                parsedTags = [topic.tags.trim()];
              }
            }
          }
        }
      } catch (error) {
        console.warn('Erreur parsing tags pour le sujet', topic.id, ':', error);
        parsedTags = [];
      }

      return {
        id: topic.id,
        author_id: topic.author_id,
        author_name: topic.author_name,
        author_university: topic.author_university,
        author_department: topic.author_department,
        category: topic.category,
        title: topic.title,
        content: topic.content,
        tags: parsedTags,
        likes: parseInt(topic.likes) || 0,
        is_pinned: Boolean(topic.is_pinned),
        created_at: topic.created_at,
        updated_at: topic.updated_at,
        reply_count: parseInt(topic.reply_count) || 0
      };
    });

    console.log(`✅ ${formattedTopics.length} sujets récupérés (page ${page})`);

    return NextResponse.json({
      success: true,
      data: {
        topics: formattedTopics,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur récupération sujets forum:', error);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors de la récupération des sujets' 
      : (error?.message || String(error));
    return NextResponse.json({ success: false, error: message }, { status: 500 });
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
      return NextResponse.json({ 
        error: 'Titre, contenu et catégorie sont requis' 
      }, { status: 400 });
    }

    // Récupérer les informations de l'auteur
    let authorName = payload.name || 'Utilisateur';
    let authorUniversity = '';
    let authorDepartment = '';
    let authorId: number | null = null;

    if (payload.role === 'STUDENT') {
      const studentResult = await pool.query(
        'SELECT id, first_name, last_name, university, department FROM student_profile WHERE user_id = $1',
        [parseInt(payload.userId)]
      );
      
      if (studentResult.rows.length > 0) {
        const student = studentResult.rows[0];
        authorName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || authorName;
        authorUniversity = student.university || '';
        authorDepartment = student.department || '';
        authorId = student.id;
      }
    } else if (payload.role === 'EMPLOYER') {
      const employerResult = await pool.query(
        'SELECT id, company_name FROM employer_profile WHERE user_id = $1',
        [parseInt(payload.userId)]
      );
      
      if (employerResult.rows.length > 0) {
        const employer = employerResult.rows[0];
        authorName = employer.company_name || authorName;
        authorId = employer.id;
      }
    }

    // Pour les employeurs, author_id est NULL (pas de lien avec student_profile)
    // Pour les étudiants, on utilise leur profile_id
    const finalAuthorId = payload.role === 'STUDENT' ? authorId : null;

    // Créer le sujet
    const result = await pool.query(`
      INSERT INTO forum_topic 
      (author_id, author_name, author_university, author_department, category, title, content, tags, likes, is_pinned, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, false, NOW(), NOW())
      RETURNING id
    `, [
      finalAuthorId,
      authorName,
      authorUniversity,
      authorDepartment,
      category,
      title,
      content,
      JSON.stringify(tags || [])
    ]);

    const topicId = result.rows[0].id;

    console.log(`✅ Nouveau sujet créé: "${title}" (ID: ${topicId}) par ${authorName}`);

    return NextResponse.json({
      success: true,
      data: {
        topicId,
        message: 'Sujet créé avec succès'
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Erreur création sujet forum:', error);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors de la création du sujet' 
      : (error?.message || String(error));
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
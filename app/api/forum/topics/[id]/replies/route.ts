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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
    }

    const topicId = parseInt(params.id);
    if (!topicId || topicId <= 0) {
      return NextResponse.json({ error: 'ID de sujet invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Le contenu est requis' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Vérifier que le sujet existe
      const [topicCheck] = await connection.execute(
        'SELECT id FROM forum_topic WHERE id = ?',
        [topicId]
      );

      if ((topicCheck as any[]).length === 0) {
        return NextResponse.json({ error: 'Sujet non trouvé' }, { status: 404 });
      }

      // Récupérer les informations de l'auteur
      let authorInfo = {
        name: payload.name || 'Utilisateur',
        university: '',
        profileId: null
      };

      if (payload.role === 'STUDENT') {
        const [studentInfo] = await connection.execute(
          'SELECT id, first_name, last_name, university FROM student_profile WHERE user_id = ?',
          [parseInt(payload.userId)]
        );
        
        if ((studentInfo as any[]).length > 0) {
          const student = (studentInfo as any[])[0];
          authorInfo = {
            name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || payload.name || 'Étudiant',
            university: student.university || '',
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
            profileId: employer.id
          };
        }
      }

      // Pour les employeurs, on utilise NULL pour author_id car la contrainte est sur student_profile
      const authorId = payload.role === 'STUDENT' ? authorInfo.profileId : null;

      // Créer la réponse
      const [result] = await connection.execute(`
        INSERT INTO forum_reply 
        (topic_id, author_id, author_name, author_university, content, likes, is_helpful)
        VALUES (?, ?, ?, ?, ?, 0, 0)
      `, [
        topicId,
        authorId,
        authorInfo.name,
        authorInfo.university,
        content.trim()
      ]);

      return NextResponse.json({
        success: true,
        replyId: (result as any).insertId,
        message: 'Réponse ajoutée avec succès'
      }, { status: 201 });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur création réponse forum:', error);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors de la création de la réponse' 
      : (error?.message || String(error));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

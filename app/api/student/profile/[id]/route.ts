import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || (payload.role !== 'STUDENT' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const studentId = Number(resolvedParams.id);
    if (!Number.isInteger(studentId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      console.log('🔍 Récupération profil étudiant pour studentId:', studentId);

      // Récupérer les informations complètes du profil étudiant
      const [studentRows] = await connection.execute(`
        SELECT 
          sp.id,
          sp.user_id,
          sp.first_name,
          sp.last_name,
          sp.phone,
          sp.email,
          sp.university,
          sp.department,
          sp.year_of_study,
          sp.bio,
          sp.skills,
          sp.availability,
          sp.services,
          sp.hourly_rate,
          sp.profile_photo,
          sp.student_card_pdf,
          sp.validation_status,
          sp.rejection_reason,
          sp.created_at,
          u.email as user_email,
          u.created_at as account_created_at
        FROM student_profile sp
        JOIN user u ON sp.user_id = u.id
        WHERE sp.id = ?
      `, [studentId]);

      if ((studentRows as any[]).length === 0) {
        return NextResponse.json({ error: 'Profil étudiant non trouvé' }, { status: 404 });
      }

      const student = (studentRows as any[])[0];

      // Formater les données pour correspondre à l'interface StudentProfile
      const formattedStudent = {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.user_email,
        university: student.university,
        field_of_study: student.department,
        bio: student.bio,
        skills: student.skills || '',
        experience: '', // Ce champ n'existe pas dans la base actuelle
        education: student.university, // Utiliser l'université comme formation
        languages: '', // Ce champ n'existe pas dans la base actuelle
        location: '', // Ce champ n'existe pas dans la base actuelle
        portfolio_url: '', // Ce champ n'existe pas dans la base actuelle
        linkedin_url: '', // Ce champ n'existe pas dans la base actuelle
        github_url: '', // Ce champ n'existe pas dans la base actuelle
        availability: student.availability || '',
        created_at: student.created_at,
        updated_at: student.created_at // Utiliser created_at comme fallback
      };

      console.log('✅ Profil étudiant récupéré avec succès pour ID:', studentId);

      return NextResponse.json({
        success: true,
        data: {
          student: formattedStudent
        }
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('❌ Erreur récupération profil étudiant:', error);

    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'production'
          ? 'Erreur serveur'
          : error.message,
      },
      { status: 500 }
    );
  }
}

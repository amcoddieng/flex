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

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // 🔐 Sécuriser userId
    const userId = Number(payload.userId);
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      console.log('🔍 Récupération profil étudiant pour userId:', userId);

      // Vérifier d'abord si l'utilisateur existe
      const [userCheck] = await connection.execute(`
        SELECT id, role FROM user WHERE id = ?
      `, [userId]);
      
      console.log('🔍 Utilisateur trouvé dans la base:', (userCheck as any[]).length > 0);
      if ((userCheck as any[]).length > 0) {
        console.log('🔍 Rôle utilisateur:', (userCheck as any[])[0].role);
      }

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
        WHERE sp.user_id = ?
      `, [userId]);

      if ((studentRows as any[]).length === 0) {
        return NextResponse.json({ error: 'Profil étudiant non trouvé' }, { status: 404 });
      }

      const student = (studentRows as any[])[0];

      // Récupérer les statistiques des candidatures
      const [applicationStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_applications,
          SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted_count,
          SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_count,
          SUM(CASE WHEN status = 'INTERVIEW' THEN 1 ELSE 0 END) as interview_count,
          SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_count,
          MAX(applied_at) as last_application_date
        FROM job_application 
        WHERE student_id = ?
      `, [student.id]);

      // Récupérer les candidatures récentes (limit 5)
      const [recentApplications] = await connection.execute(`
        SELECT 
          ja.id,
          ja.status,
          ja.applied_at,
          jo.title,
          jo.company,
          ep.company_name as employer_name
        FROM job_application ja
        JOIN job_offer jo ON ja.job_id = jo.id
        JOIN employer_profile ep ON jo.employer_id = ep.id
        WHERE ja.student_id = ?
        ORDER BY ja.applied_at DESC
        LIMIT 5
      `, [student.id]);

      // Récupérer l'activité forum
      const [forumStats] = await connection.execute(`
        SELECT 
          COUNT(DISTINCT ft.id) as topics_created,
          COUNT(DISTINCT fr.id) as replies_given,
          SUM(ft.likes) as total_topic_likes,
          SUM(fr.likes) as total_reply_likes
        FROM student_profile sp
        LEFT JOIN forum_topic ft ON sp.id = ft.author_id
        LEFT JOIN forum_reply fr ON sp.id = fr.author_id
        WHERE sp.id = ?
      `, [student.id]);

      // Récupérer les notifications non lues
      const [notifications] = await connection.execute(`
        SELECT 
          COUNT(*) as unread_count
        FROM notification 
        WHERE user_id = ? AND is_read = FALSE
      `, [userId]);

      // Formater les données
      const formattedStudent = {
        // Informations de base
        id: student.id,
        userId: student.user_id,
        email: student.user_email,
        firstName: student.first_name,
        lastName: student.last_name,
        fullName: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
        phone: student.phone,
        
        // Informations académiques
        university: student.university,
        department: student.department,
        yearOfStudy: student.year_of_study,
        bio: student.bio,
        
        // Compétences et services
        skills: student.skills ? JSON.parse(student.skills) : [],
        availability: student.availability ? JSON.parse(student.availability) : {},
        services: student.services ? JSON.parse(student.services) : [],
        hourlyRate: student.hourly_rate,
        
        // Médias
        profilePhoto: student.profile_photo,
        studentCardPdf: student.student_card_pdf,
        
        // Validation
        validationStatus: student.validation_status,
        rejectionReason: student.rejection_reason,
        
        // Dates
        createdAt: student.created_at,
        accountCreatedAt: student.account_created_at,
        
        // Statistiques
        statistics: {
          applications: {
            total: (applicationStats as any[])[0]?.total_applications || 0,
            accepted: (applicationStats as any[])[0]?.accepted_count || 0,
            pending: (applicationStats as any[])[0]?.pending_count || 0,
            interview: (applicationStats as any[])[0]?.interview_count || 0,
            rejected: (applicationStats as any[])[0]?.rejected_count || 0,
            successRate: (applicationStats as any[])[0]?.total_applications > 0 
              ? Math.round(((applicationStats as any[])[0]?.accepted_count / (applicationStats as any[])[0]?.total_applications) * 100) 
              : 0,
            responseRate: (applicationStats as any[])[0]?.total_applications > 0 
              ? Math.round((((applicationStats as any[])[0]?.accepted_count + (applicationStats as any[])[0]?.interview_count) / (applicationStats as any[])[0]?.total_applications) * 100) 
              : 0,
            lastApplicationDate: (applicationStats as any[])[0]?.last_application_date
          },
          forum: {
            topicsCreated: (forumStats as any[])[0]?.topics_created || 0,
            repliesGiven: (forumStats as any[])[0]?.replies_given || 0,
            totalTopicLikes: (forumStats as any[])[0]?.total_topic_likes || 0,
            totalReplyLikes: (forumStats as any[])[0]?.total_reply_likes || 0
          },
          notifications: {
            unreadCount: (notifications as any[])[0]?.unread_count || 0
          }
        },
        
        // Données récentes
        recentApplications: (recentApplications as any[]).map((app: any) => ({
          id: app.id,
          status: app.status,
          appliedAt: app.applied_at,
          jobTitle: app.title,
          company: app.employer_name || app.company
        }))
      };

      console.log('✅ Profil étudiant récupéré avec succès');
      console.log('📊 Statistiques:', formattedStudent.statistics);
      console.log('🔍 ValidationStatus retourné:', formattedStudent.validationStatus);

      return NextResponse.json({
        success: true,
        student: formattedStudent
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

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const userId = Number(payload.userId);
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      university,
      department,
      yearOfStudy,
      bio,
      skills,
      availability,
      services,
      hourlyRate
    } = body;

    const connection = await pool.getConnection();

    try {
      // Mettre à jour le profil étudiant
      await connection.execute(`
        UPDATE student_profile SET
          first_name = ?,
          last_name = ?,
          phone = ?,
          university = ?,
          department = ?,
          year_of_study = ?,
          bio = ?,
          skills = ?,
          availability = ?,
          services = ?,
          hourly_rate = ?
        WHERE user_id = ?
      `, [
        firstName,
        lastName,
        phone,
        university,
        department,
        yearOfStudy,
        bio,
        skills ? JSON.stringify(skills) : null,
        availability ? JSON.stringify(availability) : null,
        services ? JSON.stringify(services) : null,
        hourlyRate,
        userId
      ]);

      console.log('✅ Profil étudiant mis à jour avec succès');

      return NextResponse.json({
        success: true,
        message: 'Profil mis à jour avec succès'
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('❌ Erreur mise à jour profil étudiant:', error);

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

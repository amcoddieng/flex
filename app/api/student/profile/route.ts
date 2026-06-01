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
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // 🔐 Sécuriser userId
    const userId = Number(payload.userId);
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    try {
      console.log('🔍 Récupération profil étudiant pour userId:', userId);

      // Vérifier d'abord si l'utilisateur existe
      const userCheck = await pool.query(
        'SELECT id, role FROM "user" WHERE id = $1',
        [userId]
      );
      
      console.log('🔍 Utilisateur trouvé dans la base:', userCheck.rows.length > 0);
      if (userCheck.rows.length > 0) {
        console.log('🔍 Rôle utilisateur:', userCheck.rows[0].role);
      }

      // Récupérer les informations complètes du profil étudiant
      const studentResult = await pool.query(`
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
        JOIN "user" u ON sp.user_id = u.id
        WHERE sp.user_id = $1
      `, [userId]);

      if (studentResult.rows.length === 0) {
        return NextResponse.json({ error: 'Profil étudiant non trouvé' }, { status: 404 });
      }

      const student = studentResult.rows[0];
      const studentProfileId = student.id;

      // Récupérer les statistiques des candidatures
      const applicationStats = await pool.query(`
        SELECT 
          COUNT(*) as total_applications,
          SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted_count,
          SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_count,
          SUM(CASE WHEN status = 'INTERVIEW' THEN 1 ELSE 0 END) as interview_count,
          SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_count,
          MAX(applied_at) as last_application_date
        FROM job_application 
        WHERE student_id = $1
      `, [studentProfileId]);

      // Récupérer les candidatures récentes (limit 5)
      const recentApplications = await pool.query(`
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
        WHERE ja.student_id = $1
        ORDER BY ja.applied_at DESC
        LIMIT 5
      `, [studentProfileId]);

      // Récupérer l'activité forum
      const forumStats = await pool.query(`
        SELECT 
          COUNT(DISTINCT ft.id) as topics_created,
          COUNT(DISTINCT fr.id) as replies_given,
          COALESCE(SUM(ft.likes), 0) as total_topic_likes,
          COALESCE(SUM(fr.likes), 0) as total_reply_likes
        FROM student_profile sp
        LEFT JOIN forum_topic ft ON sp.id = ft.author_id
        LEFT JOIN forum_reply fr ON sp.id = fr.author_id
        WHERE sp.id = $1
      `, [studentProfileId]);

      // Récupérer les notifications non lues
      const notifications = await pool.query(`
        SELECT 
          COUNT(*) as unread_count
        FROM notification 
        WHERE user_id = $1 AND is_read = 0
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
            total: parseInt(applicationStats.rows[0]?.total_applications) || 0,
            accepted: parseInt(applicationStats.rows[0]?.accepted_count) || 0,
            pending: parseInt(applicationStats.rows[0]?.pending_count) || 0,
            interview: parseInt(applicationStats.rows[0]?.interview_count) || 0,
            rejected: parseInt(applicationStats.rows[0]?.rejected_count) || 0,
            successRate: applicationStats.rows[0]?.total_applications > 0 
              ? Math.round((applicationStats.rows[0]?.accepted_count / applicationStats.rows[0]?.total_applications) * 100) 
              : 0,
            responseRate: applicationStats.rows[0]?.total_applications > 0 
              ? Math.round(((applicationStats.rows[0]?.accepted_count + applicationStats.rows[0]?.interview_count) / applicationStats.rows[0]?.total_applications) * 100) 
              : 0,
            lastApplicationDate: applicationStats.rows[0]?.last_application_date
          },
          forum: {
            topicsCreated: parseInt(forumStats.rows[0]?.topics_created) || 0,
            repliesGiven: parseInt(forumStats.rows[0]?.replies_given) || 0,
            totalTopicLikes: parseInt(forumStats.rows[0]?.total_topic_likes) || 0,
            totalReplyLikes: parseInt(forumStats.rows[0]?.total_reply_likes) || 0
          },
          notifications: {
            unreadCount: parseInt(notifications.rows[0]?.unread_count) || 0
          }
        },
        
        // Données récentes
        recentApplications: recentApplications.rows.map((app: any) => ({
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
        data: {
          student: formattedStudent
        }
      });

    } catch (error: any) {
      throw error;
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

    try {
      // Mettre à jour le profil étudiant avec PostgreSQL ($1, $2, etc.)
      await pool.query(`
        UPDATE student_profile SET
          first_name = $1,
          last_name = $2,
          phone = $3,
          university = $4,
          department = $5,
          year_of_study = $6,
          bio = $7,
          skills = $8,
          availability = $9,
          services = $10,
          hourly_rate = $11
        WHERE user_id = $12
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

    } catch (error: any) {
      throw error;
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
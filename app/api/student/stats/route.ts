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

    const userId = Number(payload.userId);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID utilisateur invalide' }, { status: 400 });
    }

    try {
      // 1. Get student_id from user_id
      const studentResult = await pool.query(
        'SELECT id FROM student_profile WHERE user_id = $1',
        [userId]
      );

      if (studentResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Profil étudiant non trouvé' },
          { status: 404 }
        );
      }

      const studentId = studentResult.rows[0].id;

      // 2. Get student's applications statistics
      const applicationsStats = await pool.query(`
        SELECT 
          COUNT(*) as total_applications,
          COUNT(*) FILTER (WHERE status = 'PENDING') as pending_applications,
          COUNT(*) FILTER (WHERE status = 'INTERVIEW') as interview_applications,
          COUNT(*) FILTER (WHERE status = 'ACCEPTED') as accepted_applications,
          COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected_applications,
          MAX(applied_at) as last_application_date
        FROM job_application 
        WHERE student_id = $1
      `, [studentId]);

      // 3. Get student's conversations statistics
      const conversationsStats = await pool.query(`
        SELECT 
          COUNT(*) as total_conversations,
          COUNT(*) FILTER (WHERE c.created_at >= NOW() - INTERVAL '7 days') as new_conversations
        FROM conversation c
        WHERE c.student_id = $1
      `, [studentId]);

      // 4. Get unread messages count
      const messagesStats = await pool.query(`
        SELECT 
          COUNT(*) as total_messages,
          COUNT(*) FILTER (WHERE m.is_read = 0) as unread_messages
        FROM message m
        JOIN conversation c ON m.conversation_id = c.id
        WHERE c.student_id = $1 AND m.sender_type = 'employer'
      `, [studentId]);

      // 5. Get available job offers
      const jobOffersStats = await pool.query(`
        SELECT COUNT(*) as total_offers
        FROM job_offer
        WHERE 1=1
      `);

      // 6. Get recent applications with job details
      const recentApplications = await pool.query(`
        SELECT 
          ja.id,
          ja.status,
          ja.applied_at,
          ja.interview_date,
          ja.interview_time,
          jo.title as job_title,
          ep.company_name
        FROM job_application ja
        JOIN job_offer jo ON ja.job_id = jo.id
        LEFT JOIN employer_profile ep ON jo.employer_id = ep.id
        WHERE ja.student_id = $1
        ORDER BY ja.applied_at DESC
        LIMIT 5
      `, [studentId]);

      // 7. Get forum activity
      const forumStats = await pool.query(`
        SELECT 
          COUNT(*) as total_topics,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recent_topics
        FROM forum_topic
        WHERE author_id = $1
      `, [studentId]);

      // 8. Get notifications count
      const notificationsStats = await pool.query(`
        SELECT 
          COUNT(*) as total_notifications,
          COUNT(*) FILTER (WHERE is_read = 0) as unread_notifications
        FROM notification
        WHERE user_id = $1
      `, [userId]);

      const stats = {
        applications: {
          total: parseInt(applicationsStats.rows[0]?.total_applications) || 0,
          pending: parseInt(applicationsStats.rows[0]?.pending_applications) || 0,
          interview: parseInt(applicationsStats.rows[0]?.interview_applications) || 0,
          accepted: parseInt(applicationsStats.rows[0]?.accepted_applications) || 0,
          rejected: parseInt(applicationsStats.rows[0]?.rejected_applications) || 0,
          last_application_date: applicationsStats.rows[0]?.last_application_date || null
        },
        conversations: {
          total: parseInt(conversationsStats.rows[0]?.total_conversations) || 0,
          new: parseInt(conversationsStats.rows[0]?.new_conversations) || 0
        },
        messages: {
          total: parseInt(messagesStats.rows[0]?.total_messages) || 0,
          unread: parseInt(messagesStats.rows[0]?.unread_messages) || 0
        },
        job_offers: {
          total: parseInt(jobOffersStats.rows[0]?.total_offers) || 0
        },
        forum: {
          topics: parseInt(forumStats.rows[0]?.total_topics) || 0,
          recent_topics: parseInt(forumStats.rows[0]?.recent_topics) || 0
        },
        notifications: {
          total: parseInt(notificationsStats.rows[0]?.total_notifications) || 0,
          unread: parseInt(notificationsStats.rows[0]?.unread_notifications) || 0
        },
        recent_applications: recentApplications.rows.map(app => ({
          id: app.id,
          status: app.status,
          applied_at: app.applied_at,
          interview_date: app.interview_date,
          interview_time: app.interview_time,
          job_title: app.job_title,
          company_name: app.company_name
        }))
      };

      console.log('✅ Statistiques récupérées avec succès pour studentId:', studentId);

      return NextResponse.json({
        success: true,
        data: stats
      });

    } catch (error: any) {
      throw error;
    }

  } catch (error: any) {
    console.error('❌ Erreur récupération statistiques étudiant:', error);
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
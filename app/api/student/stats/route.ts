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
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const userId = Number(payload.userId);
    const connection = await pool.getConnection();

    try {
      // Get student_id from user_id
      const [studentResult] = await connection.execute(
        'SELECT id FROM student_profile WHERE user_id = ?',
        [userId]
      );

      if (!Array.isArray(studentResult) || studentResult.length === 0) {
        return NextResponse.json(
          { error: 'Profil étudiant non trouvé' },
          { status: 404 }
        );
      }

      const studentId = (studentResult as any[])[0].id;

      // Get student's applications statistics
      const [applicationsStats] = await connection.execute(
        `
        SELECT 
          COUNT(*) as total_applications,
          SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_applications,
          SUM(CASE WHEN status = 'INTERVIEW' THEN 1 ELSE 0 END) as interview_applications,
          SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted_applications,
          SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_applications,
          MAX(applied_at) as last_application_date
        FROM job_application 
        WHERE student_id = ?
        `,
        [studentId]
      );

      // Get student's conversations statistics
      const [conversationsStats] = await connection.execute(
        `
        SELECT 
          COUNT(*) as total_conversations,
          SUM(CASE WHEN c.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_conversations
        FROM conversation c
        WHERE c.student_id = ?
        `,
        [studentId]
      );

      // Get unread messages count
      const [messagesStats] = await connection.execute(
        `
        SELECT 
          COUNT(*) as total_messages,
          SUM(CASE WHEN m.is_read = 0 THEN 1 ELSE 0 END) as unread_messages
        FROM message m
        JOIN conversation c ON m.conversation_id = c.id
        WHERE c.student_id = ? AND m.sender_type = 'employer'
        `,
        [studentId]
      );

      // Get available job offers
      const [jobOffersStats] = await connection.execute(
        `
        SELECT COUNT(*) as total_offers
        FROM job_offer
        WHERE 1=1
        `
      );

      // Get recent applications with job details
      const [recentApplications] = await connection.execute(
        `
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
        WHERE ja.student_id = ?
        ORDER BY ja.applied_at DESC
        LIMIT 5
        `,
        [studentId]
      );

      // Get forum activity
      const [forumStats] = await connection.execute(
        `
        SELECT 
          COUNT(*) as total_topics,
          SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as recent_topics
        FROM forum_topic
        WHERE author_id = ?
        `,
        [studentId]
      );

      // Get notifications count
      const [notificationsStats] = await connection.execute(
        `
        SELECT 
          COUNT(*) as total_notifications,
          SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_notifications
        FROM notification
        WHERE user_id = ?
        `,
        [userId]
      );

      const stats = {
        applications: {
          total: applicationsStats[0]?.total_applications || 0,
          pending: applicationsStats[0]?.pending_applications || 0,
          interview: applicationsStats[0]?.interview_applications || 0,
          accepted: applicationsStats[0]?.accepted_applications || 0,
          rejected: applicationsStats[0]?.rejected_applications || 0,
          last_application_date: applicationsStats[0]?.last_application_date
        },
        conversations: {
          total: conversationsStats[0]?.total_conversations || 0,
          new: conversationsStats[0]?.new_conversations || 0
        },
        messages: {
          total: messagesStats[0]?.total_messages || 0,
          unread: messagesStats[0]?.unread_messages || 0
        },
        job_offers: {
          total: jobOffersStats[0]?.total_offers || 0
        },
        forum: {
          topics: forumStats[0]?.total_topics || 0,
          recent_topics: forumStats[0]?.recent_topics || 0
        },
        notifications: {
          total: notificationsStats[0]?.total_notifications || 0,
          unread: notificationsStats[0]?.unread_notifications || 0
        },
        recent_applications: recentApplications
      };

      return NextResponse.json({
        success: true,
        data: stats
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur récupération statistiques étudiant:', error);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === 'production'
          ? 'Erreur serveur'
          : error.message,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'dieng',
  password: 'Papa1997',
  database: 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(request: NextRequest, { params }: { params: any }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const p = await params;
    const jobId = parseInt(p.id);
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Récupérer le job
      const [jobResult]: any = await connection.execute(
        `SELECT 
          id,
          employer_id,
          title,
          description,
          company,
          location,
          service_type,
          salary,
          availability,
          requirements,
          contact_email,
          contact_phone,
          applicants,
          blocked,
          is_active,
          posted_at,
          updated_at
        FROM job_offer
        WHERE id = ?`,
        [jobId]
      );

      const job = jobResult[0];
      if (!job) {
        return NextResponse.json({ error: 'Job non trouvé' }, { status: 404 });
      }

      // Récupérer les candidatures pour ce job
      const [applicants]: any = await connection.execute(
        `SELECT 
          ja.id,
          ja.student_id,
          ja.status,
          ja.message,
          ja.availability,
          ja.experience,
          ja.start_date,
          ja.applied_at,
          ja.interview_date,
          ja.interview_time,
          ja.interview_location,
          sp.first_name,
          sp.last_name,
          sp.phone,
          sp.email,
          sp.university,
          sp.department,
          u.email as user_email
        FROM job_application ja
        LEFT JOIN student_profile sp ON ja.student_id = sp.id
        LEFT JOIN user u ON sp.user_id = u.id
        WHERE ja.job_id = ?
        ORDER BY ja.applied_at DESC`,
        [jobId]
      );

      return NextResponse.json({
        success: true,
        data: {
          job,
          applicants: applicants || []
        }
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur GET /api/admin/jobs/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: any }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const p = await params;
    const jobId = parseInt(p.id);
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { is_active, blocked, notification_message } = body;

    const connection = await pool.getConnection();
    try {
      const updates: string[] = [];
      const args: any[] = [];
      if (typeof is_active !== 'undefined') { updates.push('is_active = ?'); args.push(is_active ? 1 : 0); }
      if (typeof blocked !== 'undefined') { updates.push('blocked = ?'); args.push(blocked ? 1 : 0); }

      if (updates.length > 0) {
        args.push(jobId);
        await connection.execute(`UPDATE job_offer SET ${updates.join(', ')} WHERE id = ?`, args);

        // If blocking, require notification_message and create notification for employer user
        if (typeof blocked !== 'undefined') {
          if (blocked === true && !notification_message) {
            return NextResponse.json({ error: 'Veuillez fournir un message de notification lors du blocage.' }, { status: 400 });
          }

          // Find employer user_id
          const [jobRows]: any = await connection.execute(`SELECT employer_id FROM job_offer WHERE id = ?`, [jobId]);
          const jobRow = Array.isArray(jobRows) ? jobRows[0] : null;
          if (jobRow && jobRow.employer_id) {
            const employerId = jobRow.employer_id;
            const [empRows]: any = await connection.execute(`SELECT user_id FROM employer_profile WHERE id = ?`, [employerId]);
            const emp = Array.isArray(empRows) ? empRows[0] : null;
            if (emp && emp.user_id) {
              const userId = emp.user_id;
              if (blocked === true) {
                const title = 'Offre bloquée par l\'administration';
                await connection.execute(
                  `INSERT INTO notification (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)`,
                  [userId, 'VALIDATION', title, notification_message, JSON.stringify({ action: 'job_blocked', job_id: jobId })]
                );
              } else if (blocked === false && notification_message) {
                const title = 'Offre débloquée';
                await connection.execute(
                  `INSERT INTO notification (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)`,
                  [userId, 'VALIDATION', title, notification_message, JSON.stringify({ action: 'job_unblocked', job_id: jobId })]
                );
              }
            }
          }
        }
      }

      return NextResponse.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur PUT /api/admin/jobs/[id]:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: any }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const p = await params;
    const jobId = parseInt(p.id);
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { notification_message } = body as any;

    const connection = await pool.getConnection();
    try {
      // Require a notification message when deleting an offer
      if (!notification_message) {
        return NextResponse.json({ error: 'Veuillez fournir un message de notification lors de la suppression.' }, { status: 400 });
      }

      // Find employer user_id to notify
      const [jobRows]: any = await connection.execute(`SELECT employer_id FROM job_offer WHERE id = ?`, [jobId]);
      const jobRow = Array.isArray(jobRows) ? jobRows[0] : null;
      if (jobRow && jobRow.employer_id) {
        const employerId = jobRow.employer_id;
        const [empRows]: any = await connection.execute(`SELECT user_id FROM employer_profile WHERE id = ?`, [employerId]);
        const emp = Array.isArray(empRows) ? empRows[0] : null;
        if (emp && emp.user_id) {
          const userId = emp.user_id;
          const title = 'Offre supprimée par l\'administration';
          await connection.execute(
            `INSERT INTO notification (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)`,
            [userId, 'VALIDATION', title, notification_message, JSON.stringify({ action: 'job_deleted', job_id: jobId })]
          );
        }
      }

      await connection.execute(`DELETE FROM job_offer WHERE id = ?`, [jobId]);
      return NextResponse.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur DELETE /api/admin/jobs/[id]:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

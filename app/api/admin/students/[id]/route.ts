import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

interface RequestParams {
  params: Promise<{ id: string }>;
}

// Helper: Verify admin token from Authorization header
const verifyAdmin = (request: NextRequest): boolean => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return false;
  
  const token = parts[1];
  const decoded = verifyToken(token);
  
  return decoded?.role === 'ADMIN';
};

// GET - Récupérer un étudiant avec son profil
export async function GET(request: NextRequest, { params }: RequestParams) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json(
        { error: 'Accès refusé. Vous devez être administrateur.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);

    const connection = await pool.getConnection();

    try {
      const [userResult]: any = await connection.execute(
        'SELECT id, email, role, blocked, created_at FROM user WHERE id = ? AND role = ?',
        [userId, 'STUDENT']
      );

      const userRows = Array.isArray(userResult) ? userResult : [];
      
      if (userRows.length === 0) {
        return NextResponse.json(
          { error: 'Étudiant non trouvé' },
          { status: 404 }
        );
      }

      const user = userRows[0] as any;

      const [profileResult]: any = await connection.execute(
        'SELECT * FROM student_profile WHERE user_id = ?',
        [userId]
      );

      const profileRows = Array.isArray(profileResult) ? profileResult : [];
      const profile = profileRows.length > 0 ? profileRows[0] : null;

      return NextResponse.json(
        {
          success: true,
          data: {
            user,
            profile,
          },
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'étudiant:', error);

    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'étudiant' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un étudiant
export async function PUT(request: NextRequest, { params }: RequestParams) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json(
        { error: 'Accès refusé. Vous devez être administrateur.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();

    console.log('PUT student update:', userId, body);

    const connection = await pool.getConnection();

    try {
      // Vérifier que l'étudiant existe
      const [userResult]: any = await connection.execute(
        'SELECT id, role FROM user WHERE id = ?',
        [userId]
      );

      const userRows = Array.isArray(userResult) ? userResult : [];
      
      if (userRows.length === 0 || userRows[0].role !== 'STUDENT') {
        return NextResponse.json(
          { error: 'Étudiant non trouvé' },
          { status: 404 }
        );
      }

      // Mettre à jour le statut de blocage
      if (body.blocked !== undefined) {
        console.log('Updating blocked status:', body.blocked);
        
        await connection.execute(
          'UPDATE user SET blocked = ? WHERE id = ?',
          [body.blocked ? 1 : 0, userId]
        );

        // Ajouter une notification
        if (body.notification_message) {
          const title = body.blocked ? 'Compte bloqué par l\'administration' : 'Compte débloqué';
          await connection.execute(
            `INSERT INTO notification (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)`,
            [userId, 'VALIDATION', title, body.notification_message, JSON.stringify({ action: body.blocked ? 'blocked' : 'unblocked' })]
          );
        }
      }

      // Mettre à jour le profil étudiant
      if (body.validation_status !== undefined || body.rejection_reason !== undefined) {
        console.log('Updating validation status:', body.validation_status);
        
        // Vérifier si le profil existe
        const [profileCheckResult]: any = await connection.execute(
          'SELECT id FROM student_profile WHERE user_id = ?',
          [userId]
        );
        
        const profileCheck = Array.isArray(profileCheckResult) ? profileCheckResult : [];

        if (profileCheck.length === 0) {
          // Créer le profil s'il n'existe pas
          await connection.execute(
            `INSERT INTO student_profile 
            (user_id, validation_status, rejection_reason) 
            VALUES (?, ?, ?)`,
            [userId, body.validation_status || 'PENDING', body.rejection_reason || null]
          );
        } else {
          // Mettre à jour le profil existant
          const updates: string[] = [];
          const updateParams: any[] = [];

          if (body.validation_status !== undefined) {
            updates.push('validation_status = ?');
            updateParams.push(body.validation_status);
          }
          if (body.rejection_reason !== undefined) {
            updates.push('rejection_reason = ?');
            updateParams.push(body.rejection_reason);
          }

          if (updates.length > 0) {
            updateParams.push(userId);
            await connection.execute(
              `UPDATE student_profile SET ${updates.join(', ')} WHERE user_id = ?`,
              updateParams
            );

            // Ajouter une notification de validation
            if (body.notification_message) {
              const notifTitle = body.validation_status === 'VALIDATED' ? 'Profil validé' : 'Profil refusé';
              const notifType = body.validation_status === 'VALIDATED' ? 'VALIDATION' : 'REJECTED';
              await connection.execute(
                `INSERT INTO notification (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)`,
                [userId, notifType, notifTitle, body.notification_message, JSON.stringify({ validation_status: body.validation_status })]
              );
            }
          }
        }
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Étudiant mis à jour avec succès',
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'étudiant:', error);

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour de l\'étudiant' },
      { status: 500 }
    );
  }
}

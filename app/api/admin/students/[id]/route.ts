import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'dieng',
  password: process.env.DB_PASSWORD || 'Papa1997',
  database: process.env.DB_NAME || 'job_platform',
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

      // Mettre à jour les infos utilisateur
      if (body.blocked !== undefined) {
        await connection.execute(
          'UPDATE user SET blocked = ? WHERE id = ?',
          [body.blocked ? 1 : 0, userId]
        );
      }

      // Mettre à jour le profil étudiant
      if (body.first_name !== undefined || body.last_name !== undefined || 
          body.phone !== undefined || body.university !== undefined || 
          body.department !== undefined || body.year_of_study !== undefined || 
          body.bio !== undefined || body.hourly_rate !== undefined ||
          body.validation_status !== undefined) {
        
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
            (user_id, first_name, last_name, phone, university, department, year_of_study, bio, hourly_rate, validation_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, body.first_name || null, body.last_name || null, body.phone || null, 
             body.university || null, body.department || null, body.year_of_study || null, 
             body.bio || null, body.hourly_rate || null, body.validation_status || 'PENDING']
          );
        } else {
          // Mettre à jour le profil existant
          const updates: string[] = [];
          const updateParams: any[] = [];

          if (body.first_name !== undefined) {
            updates.push('first_name = ?');
            updateParams.push(body.first_name);
          }
          if (body.last_name !== undefined) {
            updates.push('last_name = ?');
            updateParams.push(body.last_name);
          }
          if (body.phone !== undefined) {
            updates.push('phone = ?');
            updateParams.push(body.phone);
          }
          if (body.university !== undefined) {
            updates.push('university = ?');
            updateParams.push(body.university);
          }
          if (body.department !== undefined) {
            updates.push('department = ?');
            updateParams.push(body.department);
          }
          if (body.year_of_study !== undefined) {
            updates.push('year_of_study = ?');
            updateParams.push(body.year_of_study);
          }
          if (body.bio !== undefined) {
            updates.push('bio = ?');
            updateParams.push(body.bio);
          }
          if (body.hourly_rate !== undefined) {
            updates.push('hourly_rate = ?');
            updateParams.push(body.hourly_rate);
          }
          if (body.validation_status !== undefined) {
            updates.push('validation_status = ?');
            updateParams.push(body.validation_status);
          }

          if (updates.length > 0) {
            updateParams.push(userId);
            await connection.execute(
              `UPDATE student_profile SET ${updates.join(', ')} WHERE user_id = ?`,
              updateParams
            );
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
      { error: 'Erreur lors de la mise à jour de l\'étudiant' },
      { status: 500 }
    );
  }
}

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

// GET - Récupérer les infos utilisateur + profil
export async function GET(request: NextRequest, { params }: RequestParams) {
  try {
    // Verify admin
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
      // Récupérer les infos utilisateur
      const [userResult]: any = await connection.execute(
        'SELECT id, email, role, created_at FROM user WHERE id = ?',
        [userId]
      );

      const userRows = Array.isArray(userResult) ? userResult : [];
      
      if (userRows.length === 0) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      const user = userRows[0] as any;
      let profile = null;

      // Récupérer le profil selon le rôle
      if (user.role === 'STUDENT') {
        const [studentResult]: any = await connection.execute(
          'SELECT id, user_id, first_name, last_name, phone, email, university, department, year_of_study, bio, hourly_rate, validation_status FROM student_profile WHERE user_id = ?',
          [userId]
        );
        const studentRows = Array.isArray(studentResult) ? studentResult : [];
        if (studentRows.length > 0) {
          profile = studentRows[0];
        }
      } else if (user.role === 'EMPLOYER') {
        const [employerResult]: any = await connection.execute(
          'SELECT id, user_id, company_name, contact_person, phone, email, address, description, validation_status FROM employer_profile WHERE user_id = ?',
          [userId]
        );
        const employerRows = Array.isArray(employerResult) ? employerResult : [];
        if (employerRows.length > 0) {
          profile = employerRows[0];
        }
      }

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
    console.error('Erreur lors de la récupération du profil:', error);

    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour le profil utilisateur
export async function PUT(request: NextRequest, { params }: RequestParams) {
  try {
    // Verify admin
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
      // Récupérer l'utilisateur et son rôle
      const [userResult]: any = await connection.execute(
        'SELECT id, role FROM user WHERE id = ?',
        [userId]
      );

      const userRows = Array.isArray(userResult) ? userResult : [];
      
      if (userRows.length === 0) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      const user = userRows[0] as any;

      // Mettre à jour le profil selon le rôle
      if (user.role === 'STUDENT') {
        const { first_name, last_name, phone, university, department, year_of_study, bio, hourly_rate } = body;
        
        // Vérifier si le profil existe
        const [profileCheckResult]: any = await connection.execute(
          'SELECT id FROM student_profile WHERE user_id = ?',
          [userId]
        );
        
        const profileCheck = Array.isArray(profileCheckResult) ? profileCheckResult : [];

        if (!Array.isArray(profileCheck) || profileCheck.length === 0) {
          // Créer le profil s'il n'existe pas
          await connection.execute(
            'INSERT INTO student_profile (user_id, first_name, last_name, phone, university, department, year_of_study, bio, hourly_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, first_name || null, last_name || null, phone || null, university || null, department || null, year_of_study || null, bio || null, hourly_rate || null]
          );
        } else {
          // Mettre à jour le profil existant
          const updates: string[] = [];
          const params: any[] = [];

          if (first_name !== undefined) {
            updates.push('first_name = ?');
            params.push(first_name);
          }
          if (last_name !== undefined) {
            updates.push('last_name = ?');
            params.push(last_name);
          }
          if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone);
          }
          if (university !== undefined) {
            updates.push('university = ?');
            params.push(university);
          }
          if (department !== undefined) {
            updates.push('department = ?');
            params.push(department);
          }
          if (year_of_study !== undefined) {
            updates.push('year_of_study = ?');
            params.push(year_of_study);
          }
          if (bio !== undefined) {
            updates.push('bio = ?');
            params.push(bio);
          }
          if (hourly_rate !== undefined) {
            updates.push('hourly_rate = ?');
            params.push(hourly_rate);
          }

          if (updates.length > 0) {
            params.push(userId);
            await connection.execute(
              `UPDATE student_profile SET ${updates.join(', ')} WHERE user_id = ?`,
              params
            );
          }
        }
      } else if (user.role === 'EMPLOYER') {
        const { company_name, contact_person, phone, address, description } = body;
        
        // Vérifier si le profil existe
        const [profileCheckResult]: any = await connection.execute(
          'SELECT id FROM employer_profile WHERE user_id = ?',
          [userId]
        );
        
        const profileCheck = Array.isArray(profileCheckResult) ? profileCheckResult : [];

        if (!Array.isArray(profileCheck) || profileCheck.length === 0) {
          // Créer le profil s'il n'existe pas
          await connection.execute(
            'INSERT INTO employer_profile (user_id, company_name, contact_person, phone, address, description) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, company_name || null, contact_person || null, phone || null, address || null, description || null]
          );
        } else {
          // Mettre à jour le profil existant
          const updates: string[] = [];
          const params: any[] = [];

          if (company_name !== undefined) {
            updates.push('company_name = ?');
            params.push(company_name);
          }
          if (contact_person !== undefined) {
            updates.push('contact_person = ?');
            params.push(contact_person);
          }
          if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone);
          }
          if (address !== undefined) {
            updates.push('address = ?');
            params.push(address);
          }
          if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
          }

          if (updates.length > 0) {
            params.push(userId);
            await connection.execute(
              `UPDATE employer_profile SET ${updates.join(', ')} WHERE user_id = ?`,
              params
            );
          }
        }
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Profil mis à jour avec succès',
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du profil:', error);

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}

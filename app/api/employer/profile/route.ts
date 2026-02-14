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

// Helper: Verify employer token
const verifyEmployer = (request: NextRequest): { role: string; userId: string } | null => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  const token = parts[1];
  const decoded = verifyToken(token);
  
  if (decoded?.role !== 'EMPLOYER') return null;
  return decoded as { role: string; userId: string };
};

// GET - Get employer profile
export async function GET(request: NextRequest) {
  try {
    const user = verifyEmployer(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const userId = parseInt(user.userId, 10) || 0;
    const connection = await pool.getConnection();

    try {
      // Get employer profile with user data
      const [profileRows] = await connection.execute(
        `SELECT u.id, u.email, ep.company_name, ep.contact_person, ep.phone, 
                ep.address, ep.description, ep.validation_status, u.blocked
         FROM user u
         LEFT JOIN employer_profile ep ON u.id = ep.user_id
         WHERE u.id = ? AND u.role = 'EMPLOYER'`,
        [userId]
      );

      if (!profileRows || (profileRows as any).length === 0) {
        connection.release();
        return NextResponse.json(
          { error: 'Profil non trouvé' },
          { status: 404 }
        );
      }

      connection.release();

      return NextResponse.json(
        {
          success: true,
          data: (profileRows as any)[0],
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('GET /api/employer/profile error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Update employer profile
export async function PUT(request: NextRequest) {
  try {
    const user = verifyEmployer(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const userId = parseInt(user.userId, 10) || 0;
    const body = await request.json();

    const connection = await pool.getConnection();

    try {
      // Get employer_profile id
      const [epRows] = await connection.execute(
        'SELECT id FROM employer_profile WHERE user_id = ?',
        [userId]
      );

      if (!epRows || (epRows as any).length === 0) {
        connection.release();
        return NextResponse.json(
          { error: 'Profil employeur non trouvé' },
          { status: 404 }
        );
      }

      const epId = (epRows as any)[0].id;

      // Update employer profile
      const updates: string[] = [];
      const params: any[] = [];

      if (body.company_name !== undefined) {
        updates.push('company_name = ?');
        params.push(body.company_name);
      }
      if (body.contact_person !== undefined) {
        updates.push('contact_person = ?');
        params.push(body.contact_person);
      }
      if (body.phone !== undefined) {
        updates.push('phone = ?');
        params.push(body.phone);
      }
      if (body.address !== undefined) {
        updates.push('address = ?');
        params.push(body.address);
      }
      if (body.description !== undefined) {
        updates.push('description = ?');
        params.push(body.description);
      }
      if (body.validation_status !== undefined) {
        updates.push('validation_status = ?');
        params.push(body.validation_status);
      }

      if (updates.length > 0) {
        params.push(epId);
        const query = `UPDATE employer_profile SET ${updates.join(', ')} WHERE id = ?`;
        await connection.execute(query, params);
      }

      connection.release();

      return NextResponse.json(
        { success: true, message: 'Profil mis à jour' },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('PUT /api/employer/profile error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

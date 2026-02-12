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

const verifyAdmin = (request: NextRequest): boolean => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return false;
  const token = parts[1];
  const decoded = verifyToken(token);
  return decoded?.role === 'ADMIN';
};

export async function GET(request: NextRequest, { params }: { params: any }) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Accès refusé. Vous devez être administrateur.' }, { status: 403 });
    }

    const p = await params;
    const id = parseInt(p.id);
    if (isNaN(id)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });

    const connection = await pool.getConnection();
    try {
      const [rows]: any = await connection.execute(
        `SELECT u.id, u.email, u.role, u.blocked, u.created_at, ep.*
         FROM user u
         LEFT JOIN employer_profile ep ON u.id = ep.user_id
         WHERE u.id = ? AND u.role = 'EMPLOYER'`,
        [id]
      );

      const user = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      if (!user) return NextResponse.json({ error: 'Employeur non trouvé' }, { status: 404 });

      return NextResponse.json({ success: true, data: { user, profile: user } });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur GET /api/admin/employers/[id]:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: any }) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Accès refusé. Vous devez être administrateur.' }, { status: 403 });
    }

    const p = await params;
    const id = parseInt(p.id);
    if (isNaN(id)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });

    const body = await request.json();
    const { blocked, validation_status, company_name, contact_person, phone, address, description } = body;

    const connection = await pool.getConnection();
    try {
      // Mettre à jour blocked sur user si fourni
      if (typeof blocked !== 'undefined') {
        await connection.execute(`UPDATE user SET blocked = ? WHERE id = ?`, [blocked ? 1 : 0, id]);
      }

      // Vérifier si profile existe
      const [existing]: any = await connection.execute(`SELECT id FROM employer_profile WHERE user_id = ?`, [id]);
      const profileExists = Array.isArray(existing) && existing.length > 0;

      if (profileExists) {
        const updates: string[] = [];
        const params: any[] = [];
        if (typeof validation_status !== 'undefined') { updates.push('validation_status = ?'); params.push(validation_status); }
        if (typeof company_name !== 'undefined') { updates.push('company_name = ?'); params.push(company_name); }
        if (typeof contact_person !== 'undefined') { updates.push('contact_person = ?'); params.push(contact_person); }
        if (typeof phone !== 'undefined') { updates.push('phone = ?'); params.push(phone); }
        if (typeof address !== 'undefined') { updates.push('address = ?'); params.push(address); }
        if (typeof description !== 'undefined') { updates.push('description = ?'); params.push(description); }

        if (updates.length > 0) {
          params.push(id);
          await connection.execute(`UPDATE employer_profile SET ${updates.join(', ')} WHERE user_id = ?`, params);
        }
      } else {
        // Créer le profile si nécessaire
        await connection.execute(
          `INSERT INTO employer_profile (user_id, company_name, contact_person, phone, email, address, description, validation_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, company_name || null, contact_person || null, phone || null, null, address || null, description || null, validation_status || 'PENDING']
        );
      }

      return NextResponse.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur PUT /api/admin/employers/[id]:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

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

// Helper: Verify admin token
const verifyAdmin = (request: NextRequest): { role: string; userId: string } | null => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  const token = parts[1];
  const decoded = verifyToken(token);
  
  if (decoded?.role !== 'ADMIN') return null;
  return decoded as { role: string; userId: string };
};

// GET - Récupérer tous les profils employeurs en attente de validation
export async function GET(request: NextRequest) {
  try {
    const user = verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const connection = await pool.getConnection();

    try {
      const [employers] = await connection.execute(`
        SELECT 
          ep.id,
          ep.company_name,
          ep.contact_person,
          ep.phone,
          ep.email,
          ep.address,
          ep.description,
          ep.img,
          ep.identity,
          ep.validation_status,
          ep.rejection_reason,
          ep.created_at,
          u.email as user_email
        FROM employer_profile ep
        JOIN user u ON ep.user_id = u.id
        WHERE ep.validation_status = 'PENDING'
        ORDER BY ep.created_at DESC
      `);

      connection.release();
      return NextResponse.json({
        success: true,
        data: employers
      });

    } catch (dbError) {
      connection.release();
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Erreur base de données' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Employer validation GET error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Valider ou rejeter un profil employeur
export async function PUT(request: NextRequest) {
  try {
    const user = verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { employerId, status, rejectionReason } = body;

    if (!employerId || !status || !['VALIDATED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Paramètres invalides' },
        { status: 400 }
      );
    }

    // Si rejet, un motif est requis
    if (status === 'REJECTED' && !rejectionReason?.trim()) {
      return NextResponse.json(
        { error: 'Un motif de rejet est requis' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(`
        UPDATE employer_profile 
        SET validation_status = ?, 
            rejection_reason = ?
        WHERE id = ?
      `, [status, status === 'REJECTED' ? rejectionReason : null, employerId]) as any;

      connection.release();

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: 'Profil employeur non trouvé' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Profil employeur ${status === 'VALIDATED' ? 'validé' : 'rejeté'} avec succès`
      });

    } catch (dbError) {
      connection.release();
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Erreur base de données' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Employer validation PUT error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

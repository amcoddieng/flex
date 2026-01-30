import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'dieng',
  password: process.env.DB_PASSWORD || 'Papa1997',
  database: process.env.DB_NAME || 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Header x-user-id requis' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      company,
      location,
      serviceType,
      salary,
      availability,
      requirements,
      contactEmail,
      contactPhone,
      isActive
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Le champ title est requis' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      // Vérifier que l'utilisateur est employeur
      const [userRows] = await connection.execute('SELECT id, role FROM user WHERE id = ?', [userId]);
      if (!Array.isArray(userRows) || userRows.length === 0) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }

      const user = (userRows as any)[0];
      if (user.role !== 'EMPLOYER') {
        return NextResponse.json({ error: 'Seuls les employeurs peuvent publier des offres' }, { status: 403 });
      }

      // Récupérer l'employer_profile
      const [empRows] = await connection.execute('SELECT id FROM employer_profile WHERE user_id = ?', [userId]);
      if (!Array.isArray(empRows) || empRows.length === 0) {
        return NextResponse.json({ error: 'Profil employeur introuvable' }, { status: 404 });
      }

      const employerId = (empRows as any)[0].id;

      const jobId = uuidv4();

      await connection.execute(
        `INSERT INTO job_offer (id, employer_id, title, description, company, location, service_type, salary, availability, requirements, contact_email, contact_phone, is_active, posted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          jobId,
          employerId,
          title,
          description || null,
          company || null,
          location || null,
          serviceType || null,
          salary || null,
          availability ? JSON.stringify(availability) : null,
          requirements || null,
          contactEmail || null,
          contactPhone || null,
          isActive === undefined ? true : !!isActive,
        ]
      );

      return NextResponse.json({ success: true, jobId }, { status: 201 });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur création job:', error);
    const message = process.env.NODE_ENV === 'production' ? 'Erreur lors de la création de l\'offre' : (error?.message || String(error));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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

// GET - List employer's job offers
export async function GET(request: NextRequest) {
  try {
    const user = verifyEmployer(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const userId = Number(user.userId);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { error: 'Utilisateur invalide' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    const pageStr = searchParams.get('page') || '1';
    const limitStr = searchParams.get('limit') || '20';
    
    const page = Math.max(1, parseInt(pageStr, 10) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(limitStr, 10) || 20));

    const safeLimit = Number(limit);
    const safePage = Number(page);
    const safeOffset = Number((safePage - 1) * safeLimit);

    const search = searchParams.get('search');

    const connection = await pool.getConnection();

    try {
      let query = `
        SELECT j.id, j.title, j.location, j.is_active, j.blocked, j.posted_at, j.description,
               (SELECT COUNT(*) FROM job_application WHERE job_id = j.id) as applicants
        FROM job_offer j
        WHERE j.employer_id = (
          SELECT id FROM employer_profile WHERE user_id = ?
        )
      `;

      const params: any[] = [userId];

      if (search) {
        query += ` AND (j.title LIKE ? OR j.location LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      // LIMIT and OFFSET must be injected directly, not as parameters
      query += ` ORDER BY j.posted_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

      const [jobs] = await connection.execute(query, params);

      // Count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM job_offer j
        WHERE j.employer_id = (
          SELECT id FROM employer_profile WHERE user_id = ?
        )
      `;

      const countParams: any[] = [userId];

      if (search) {
        countQuery += ` AND (j.title LIKE ? OR j.location LIKE ?)`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm);
      }

      const [countRows] = await connection.execute(countQuery, countParams);
      const total = (countRows as any)[0]?.total || 0;

      return NextResponse.json(
        {
          success: true,
          data: jobs || [],
          pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            pages: Math.ceil(total / safeLimit),
          },
        },
        { status: 200 }
      );
    } finally {
      connection.release(); // ✅ UNE SEULE FOIS
    }
  } catch (err: any) {
    console.error('GET /api/employer/jobs error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Create new job offer
export async function POST(request: NextRequest) {
  try {
    const user = verifyEmployer(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const userId = Number(user.userId);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { error: 'Utilisateur invalide' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      title, 
      location, 
      description,
      company,
      service_type,
      salary,
      requirements,
      contact_email,
      contact_phone,
      availability,
      type_paiement
    } = body;

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Le titre de l\'offre est requis' },
        { status: 400 }
      );
    }

    if (!location || !location.trim()) {
      return NextResponse.json(
        { error: 'La localisation est requise' },
        { status: 400 }
      );
    }

    // Basic server-side validation
    if (title.trim().length > 255) {
      return NextResponse.json({ error: 'Le titre est trop long' }, { status: 400 });
    }
    if (company && company.trim().length > 255) {
      return NextResponse.json({ error: 'Le nom de l\'entreprise est trop long' }, { status: 400 });
    }
    if (service_type && service_type.trim().length > 255) {
      return NextResponse.json({ error: 'Le type de service est trop long' }, { status: 400 });
    }
    if (salary && salary.trim().length > 100) {
      return NextResponse.json({ error: 'Le champ salaire est trop long' }, { status: 400 });
    }
    if (contact_email && contact_email.trim()) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(contact_email.trim())) {
        return NextResponse.json({ error: 'Email de contact invalide' }, { status: 400 });
      }
    }
    if (contact_phone && contact_phone.trim()) {
      const phoneRe = /^[0-9+()\-\s]{6,30}$/;
      if (!phoneRe.test(contact_phone.trim())) {
        return NextResponse.json({ error: 'Téléphone de contact invalide' }, { status: 400 });
      }
    }

    const connection = await pool.getConnection();

    try {
      // Get employer profile ID
      const [employerProfile] = await connection.execute(
        `SELECT id FROM employer_profile WHERE user_id = ?`,
        [userId]
      );

      const employerId = (employerProfile as any)[0]?.id;
      if (!employerId) {
        return NextResponse.json(
          { error: 'Profil employeur non trouvé' },
          { status: 404 }
        );
      }

      // Validate availability: must be one of allowed ENUM values or NULL
      let availabilityValue: string | null = null;
      if (availability !== undefined && availability !== null && String(availability).trim() !== '') {
        const a = String(availability).trim();
        const allowedAvail = [
          'Temps plein',
          'Temps partiel',
          'Mi-temps',
          'Temps flexible',
          'Horaires flexibles',
        ];
        if (!allowedAvail.includes(a)) {
          return NextResponse.json({ error: 'Disponibilité invalide' }, { status: 400 });
        }
        availabilityValue = a;
      }

      // Validate type_paiement if provided
      const allowedTypes = ['heure','jour','semaine','mois'];
      let typePaiValue: string | null = null;
      if (type_paiement !== undefined && type_paiement !== null && String(type_paiement).trim() !== '') {
        const t = String(type_paiement).trim();
        if (!allowedTypes.includes(t)) {
          return NextResponse.json({ error: 'Type de paiement invalide' }, { status: 400 });
        }
        typePaiValue = t;
      }

      // Create job offer with all fields
      const [result] = await connection.execute(
        `INSERT INTO job_offer (
          employer_id, 
          title, 
          location, 
          description, 
          company, 
          service_type, 
          salary, 
          type_paiement,
          availability,
          requirements, 
          contact_email, 
          contact_phone, 
          is_active, 
          posted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
        [
          employerId, 
          title.trim(), 
          location.trim(), 
          description?.trim() || null,
          company?.trim() || null,
          service_type?.trim() || null,
          salary?.trim() || null,
          typePaiValue,
          availabilityValue,
          requirements?.trim() || null,
          contact_email?.trim() || null,
          contact_phone?.trim() || null,
        ]
      );

      const jobId = (result as any).insertId;

      return NextResponse.json(
        {
          success: true,
          message: 'Offre créée avec succès',
          data: { id: jobId },
        },
        { status: 201 }
      );
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('POST /api/employer/jobs error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

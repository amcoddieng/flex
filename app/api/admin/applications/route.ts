import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const verifyAdmin = (request: NextRequest) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded || decoded.role !== 'ADMIN') {
    return null;
  }
  
  return decoded;
};

export async function GET(request: NextRequest) {
  try {
    const user = verifyAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('student_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const company = searchParams.get('company') || '';
    const university = searchParams.get('university') || '';
    const dateRange = searchParams.get('date_range') || '';

    const connection = await pool.getConnection();

    try {
      // Si un student_id est spécifié, retourner les candidatures de cet étudiant
      if (studentId && studentId !== '0') {
        const studentIdNum = parseInt(studentId);
        if (isNaN(studentIdNum)) {
          return NextResponse.json({ error: 'student_id invalide' }, { status: 400 });
        }

        const query = `
          SELECT 
            ja.id,
            ja.job_id,
            ja.student_id,
            ja.status,
            ja.message,
            ja.applied_at,
            ja.availability,
            ja.experience,
            ja.start_date,
            jo.title as job_title,
            jo.company as company_name,
            sp.first_name,
            sp.last_name,
            sp.email as student_email,
            sp.phone as student_phone,
            sp.university as student_university,
            sp.department as student_department,
            sp.year_of_study as student_year_of_study,
            ep.company_name as employer_name
          FROM job_application ja
          LEFT JOIN job_offer jo ON ja.job_id = jo.id
          LEFT JOIN student_profile sp ON ja.student_id = sp.id
          LEFT JOIN employer_profile ep ON jo.employer_id = ep.id
          WHERE ja.student_id = ?
          ORDER BY ja.applied_at DESC
        `;

        const [applications] = await connection.execute(query, [studentIdNum]) as any[];
        connection.release();

        return NextResponse.json({
          data: applications,
          total: applications.length,
          page: 1,
          totalPages: 1
        });
      }

      // Sinon, retourner toutes les candidatures avec filtres
      let whereConditions = [];
      let queryParams = [];

      if (search) {
        whereConditions.push(`(
          jo.title LIKE ? OR 
          sp.first_name LIKE ? OR 
          sp.last_name LIKE ? OR 
          sp.email LIKE ? OR 
          jo.company LIKE ? OR 
          ep.company_name LIKE ?
        )`);
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      if (status) {
        whereConditions.push('ja.status = ?');
        queryParams.push(status);
      }

      if (company) {
        whereConditions.push('(jo.company LIKE ? OR ep.company_name LIKE ?)');
        const companyPattern = `%${company}%`;
        queryParams.push(companyPattern, companyPattern);
      }

      if (university) {
        whereConditions.push('sp.university LIKE ?');
        queryParams.push(`%${university}%`);
      }

      if (dateRange) {
        const now = new Date();
        let startDate;
        
        switch (dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        }
        
        if (startDate) {
          whereConditions.push('ja.applied_at >= ?');
          queryParams.push(startDate.toISOString().split('T')[0]);
        }
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Requête principale
      const query = `
        SELECT 
          ja.id,
          ja.job_id,
          ja.student_id,
          ja.status,
          ja.message,
          ja.applied_at,
          ja.availability,
          ja.experience,
          ja.start_date,
          jo.title as job_title,
          jo.company as company_name,
          CONCAT(sp.first_name, ' ', sp.last_name) as student_name,
          sp.email as student_email,
          sp.phone as student_phone,
          sp.university as student_university,
          sp.department as student_department,
          sp.year_of_study as student_year_of_study,
          ep.company_name as employer_name
        FROM job_application ja
        LEFT JOIN job_offer jo ON ja.job_id = jo.id
        LEFT JOIN student_profile sp ON ja.student_id = sp.id
        LEFT JOIN employer_profile ep ON jo.employer_id = ep.id
        ${whereClause}
        ORDER BY ja.applied_at DESC
        LIMIT ? OFFSET ?
      `;

      // Requête de comptage
      const countQuery = `
        SELECT COUNT(*) as total
        FROM job_application ja
        LEFT JOIN job_offer jo ON ja.job_id = jo.id
        LEFT JOIN student_profile sp ON ja.student_id = sp.id
        LEFT JOIN employer_profile ep ON jo.employer_id = ep.id
        ${whereClause}
      `;

      const offset = (page - 1) * limit;
      queryParams.push(limit.toString(), offset.toString());

      const [applications] = await connection.execute(query, queryParams) as any[];
      const [countResult] = await connection.execute(countQuery, queryParams.slice(0, -2)) as any[];
      
      connection.release();

      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        data: applications,
        total,
        page,
        totalPages
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
    console.error('Admin applications GET error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour le statut d'une candidature
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = verifyAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const applicationId = parseInt(id);
    if (isNaN(applicationId)) {
      return NextResponse.json({ error: 'ID candidature invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['PENDING', 'ACCEPTED', 'REJECTED', 'INTERVIEW'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      await connection.execute(
        'UPDATE job_application SET status = ? WHERE id = ?',
        [status, applicationId]
      );

      connection.release();

      return NextResponse.json({
        success: true,
        message: 'Candidature mise à jour avec succès'
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
    console.error('Admin application PUT error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

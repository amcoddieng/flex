import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// GET - List all active job offers (public API for students)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const pageStr = searchParams.get('page') || '1';
    const limitStr = searchParams.get('limit') || '20';
    
    const page = Math.max(1, parseInt(pageStr, 10) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(limitStr, 10) || 20));

    const safeLimit = Number(limit);
    const safePage = Number(page);
    const safeOffset = Number((safePage - 1) * safeLimit);

    const search = searchParams.get('search');
    const jobType = searchParams.get('job_type');
    const location = searchParams.get('location');

    const connection = await pool.getConnection();

    try {
      let query = `
        SELECT 
          j.id, 
          j.title, 
          j.location, 
          j.description,
          j.company,
          j.service_type as job_type,
          j.salary,
          j.requirements,
          j.availability,
          j.posted_at,
          j.is_active,
          ep.company_name as employer_company,
          ep.contact_person,
          ep.email as contact_email,
          ep.phone as contact_phone,
          (SELECT COUNT(*) FROM job_application WHERE job_id = j.id) as applicants_count
        FROM job_offer j
        LEFT JOIN employer_profile ep ON j.employer_id = ep.id
        WHERE j.is_active = 1 
        AND j.blocked = 0
      `;

      const params: any[] = [];

      if (search) {
        query += ` AND (j.title LIKE ? OR j.description LIKE ? OR j.company LIKE ? OR ep.company_name LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (jobType && jobType !== 'all') {
        query += ` AND j.service_type LIKE ?`;
        params.push(`%${jobType}%`);
      }

      if (location) {
        query += ` AND j.location LIKE ?`;
        params.push(`%${location}%`);
      }

      // ORDER BY and LIMIT must be injected directly, not as parameters
      query += ` ORDER BY j.posted_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

      const [jobs] = await connection.execute(query, params);

      // Count total results
      let countQuery = `
        SELECT COUNT(*) as total
        FROM job_offer j
        LEFT JOIN employer_profile ep ON j.employer_id = ep.id
        WHERE j.is_active = 1 
        AND j.blocked = 0
      `;

      const countParams: any[] = [];

      if (search) {
        countQuery += ` AND (j.title LIKE ? OR j.description LIKE ? OR j.company LIKE ? OR ep.company_name LIKE ?)`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (jobType && jobType !== 'all') {
        countQuery += ` AND j.service_type LIKE ?`;
        countParams.push(`%${jobType}%`);
      }

      if (location) {
        countQuery += ` AND j.location LIKE ?`;
        countParams.push(`%${location}%`);
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
      connection.release();
    }
  } catch (err: any) {
    console.error('GET /api/jobs error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

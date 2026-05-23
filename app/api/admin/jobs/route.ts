import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import mysql from '@/lib/db';

const pool = mysql.createPool();

// GET - Récupérer toutes les offres d'emploi avec pagination et filtres
export async function GET(request: NextRequest) {
  try {
    const user = verifyAdmin(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    try {
      let query = `
        SELECT 
          jo.id,
          jo.employer_id,
          jo.title,
          jo.location,
          jo.description,
          jo.requirements,
          jo.salary,
          jo.is_active,
          jo.posted_at,
          jo.contact_email,
          jo.contact_phone,
          ep.company_name
        FROM job_offer jo
        LEFT JOIN employer_profile ep ON jo.employer_id = ep.user_id
        WHERE 1=1
      `;
      
      const params: any[] = [];

      if (search) {
        query += ` AND (jo.title LIKE ? OR jo.location LIKE ? OR ep.company_name LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      if (status === 'active') {
        query += ` AND jo.is_active = 1`;
      } else if (status === 'inactive') {
        query += ` AND jo.is_active = 0`;
      }

      // Compter le total
      const countQuery = query.replace(
        'SELECT jo.id, jo.employer_id, jo.title, jo.location, jo.description, jo.requirements, jo.salary, jo.is_active, jo.posted_at, ep.company_name, ep.contact_email, ep.contact_phone',
        'SELECT COUNT(*) as total'
      );
      const [countResult] = await connection.execute(countQuery, params);
      const total = (countResult as any)[0].total;

      // Ajouter pagination et tri
      query += ` ORDER BY jo.posted_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [jobs] = await connection.execute(query, params);

      // Ajouter le nombre de candidats pour chaque offre
      const jobsWithApplicants = await Promise.all(
        (jobs as any[]).map(async (job) => {
          try {
            const [applicants] = await connection.execute(
              'SELECT COUNT(*) as count FROM job_application WHERE job_id = ?',
              [job.id]
            );
            return {
              ...job,
              applicants: (applicants as any)[0].count
            };
          } catch (err) {
            console.error('Error fetching applicants for job', job.id, err);
            return {
              ...job,
              applicants: 0
            };
          }
        })
      );

      connection.release();

      return NextResponse.json({
        success: true,
        data: jobsWithApplicants,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
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
    console.error('Admin jobs GET error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une offre d'emploi (activer/désactiver)
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
    const { jobId, is_active } = body;

    if (!jobId || typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'Paramètres invalides' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      await connection.execute(
        'UPDATE job_offer SET is_active = ? WHERE id = ?',
        [is_active, jobId]
      );

      connection.release();

      return NextResponse.json({
        success: true,
        message: is_active ? 'Offre activée avec succès' : 'Offre désactivée avec succès'
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
    console.error('Admin jobs PUT error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


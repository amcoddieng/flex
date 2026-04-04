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

// Helper function pour extraire l'ID du token
function getEmployerIdFromToken(token: string): number | null {
  try {
    const decoded = verifyToken(token);
    return decoded && decoded.role === 'EMPLOYER' ? parseInt(decoded.userId) : null;
  } catch {
    return null;
  }
}

// Helper function pour récupérer l'ID de l'employeur depuis student_profile
async function getEmployerIdFromProfile(employerUserId: number): Promise<number | null> {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(`
      SELECT id FROM employer_profile WHERE user_id = ?
    `, [employerUserId]);
    await connection.release();
    
    const rows = result as any[];
    return rows.length > 0 ? rows[0].id : null;
  } catch {
    return null;
  }
}

// GET - Récupérer toutes les conversations de l'employeur
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const employerUserId = getEmployerIdFromToken(token);
    if (!employerUserId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer l'ID du profil employeur
    const employerProfileId = await getEmployerIdFromProfile(employerUserId);
    if (!employerProfileId) {
      return NextResponse.json({ error: 'Profil employeur non trouvé' }, { status: 401 });
    }

    const connection = await pool.getConnection();
    
    try {
      const [conversations] = await connection.execute(`
        SELECT 
          c.id,
          c.offer_id,
          c.created_at,
          o.title as offer_title,
          sp.first_name,
          sp.last_name,
          sp.email as student_email,
          (SELECT COUNT(*) FROM message m WHERE m.conversation_id = c.id AND m.is_read = FALSE AND m.sender_type = 'student') as unread_count,
          (SELECT m.message FROM message m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
          (SELECT m.created_at FROM message m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_time
        FROM conversation c
        JOIN offer o ON c.offer_id = o.id
        JOIN student_profile sp ON c.student_id = sp.id
        WHERE c.employer_id = ?
        ORDER BY last_message_time DESC NULLS LAST
      `, [employerProfileId]);

      await connection.release();
      
      return NextResponse.json({
        success: true,
        data: conversations
      });

    } catch (dbError) {
      await connection.release();
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
    }

  } catch (error) {
    console.error('Conversations GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle conversation
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const employerUserId = getEmployerIdFromToken(token);
    if (!employerUserId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer l'ID du profil employeur
    const employerProfileId = await getEmployerIdFromProfile(employerUserId);
    if (!employerProfileId) {
      return NextResponse.json({ error: 'Profil employeur non trouvé' }, { status: 401 });
    }

    const body = await request.json();
    const { offer_id, student_id } = body;

    if (!offer_id || !student_id) {
      return NextResponse.json(
        { error: 'offer_id et student_id requis' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Vérifier si conversation existe
      const [existing]: any = await connection.execute(
        `SELECT id FROM conversation 
         WHERE employer_id = ? AND student_id = ? AND offer_id = ?`,
        [employerProfileId, student_id, offer_id]
      );

      if (existing.length > 0) {
        connection.release();
        return NextResponse.json({
          success: true,
          data: {
            conversation_id: existing[0].id,
            exists: true
          }
        });
      }
      

      // Créer conversation
      const [result]: any = await connection.execute(
        `INSERT INTO conversation (employer_id, student_id, offer_id)
         VALUES (?, ?, ?)`,
        [employerProfileId, student_id, offer_id]
      );

      connection.release();

      return NextResponse.json({
        success: true,
        data: {
          conversation_id: result.insertId,
          exists: false
        }
      });

    } catch (dbError) {
      connection.release();
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Erreur base de données2' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Conversations POST error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
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

// Helper function pour récupérer l'ID de l'employeur depuis employer_profile
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

// GET - Récupérer les messages d'une conversation
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Récupérer les params de manière asynchrone
    const resolvedParams = await params;
    const conversationId = resolvedParams.id;
    
    const connection = await pool.getConnection();
    
    try {
      // Debug pour voir les params
      console.log('🔍 Debug params:', resolvedParams);
      console.log('🔍 Debug conversationId:', conversationId);
      console.log('🔍 Debug employerProfileId:', employerProfileId);
      
      // Vérifier que la conversation appartient à l'employeur
      const [conversationCheck] = await connection.execute(`
        SELECT id FROM conversation 
        WHERE id = ? AND employer_id = ?
      `, [conversationId, employerProfileId]);

      const checkRows = conversationCheck as any[];
      if (!checkRows || checkRows.length === 0) {
        await connection.release();
        return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
      }

      // Récupérer les messages
      const [messages] = await connection.execute(`
        SELECT 
          m.id,
          m.sender_type,
          m.sender_id,
          m.message,
          m.is_read,
          m.created_at,
          CASE 
            WHEN m.sender_type = 'student' THEN 
              CONCAT(sp.first_name, ' ', sp.last_name)
            ELSE 
              'Vous'
          END as sender_name
        FROM message m
        LEFT JOIN student_profile sp ON m.sender_type = 'student' AND m.sender_id = sp.id
        WHERE m.conversation_id = ?
        ORDER BY m.created_at ASC
      `, [conversationId]);

      // Marquer les messages des étudiants comme lus
      await connection.execute(`
        UPDATE message 
        SET is_read = TRUE 
        WHERE conversation_id = ? AND sender_type = 'student' AND is_read = FALSE
      `, [conversationId]);

      await connection.release();
      
      return NextResponse.json({
        success: true,
        data: messages
      });

    } catch (dbError) {
      await connection.release();
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
    }

  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Envoyer un nouveau message
export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Récupérer les params de manière asynchrone
    const resolvedParams = await params;
    const conversationId = resolvedParams.id;
    const body = await request.json();
    const { message } = body;

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
      // Vérifier que la conversation appartient à l'employeur
      const [conversationCheck] = await connection.execute(`
        SELECT id FROM conversation 
        WHERE id = ? AND employer_id = ?
      `, [conversationId, employerProfileId]);

      const checkRows = conversationCheck as any[];
      if (!checkRows || checkRows.length === 0) {
        await connection.release();
        return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
      }

      // Insérer le nouveau message
      const [result] = await connection.execute(`
        INSERT INTO message (conversation_id, sender_type, sender_id, message)
        VALUES (?, 'employer', ?, ?)
      `, [conversationId, employerProfileId, message.trim()]);

      const resultRows = result as any[];
      await connection.release();
      
      return NextResponse.json({
        success: true,
        data: {
          id: resultRows[0]?.insertId || null,
          conversation_id: parseInt(conversationId),
          sender_type: 'employer',
          sender_id: employerProfileId,
          message: message.trim(),
          is_read: false,
          created_at: new Date().toISOString()
        }
      });

    } catch (dbError) {
      await connection.release();
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
    }

  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

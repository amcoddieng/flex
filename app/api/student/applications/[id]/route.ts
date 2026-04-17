import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

const pool = mysql.createPool({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
// commentaire de la fonction : cette fonction permet de supprimer une candidature d'un étudiant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const applicationId = parseInt(params.id);
    if (!applicationId || applicationId <= 0) {
      return NextResponse.json({ error: 'ID de candidature invalide' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Vérifier que la candidature appartient bien à l'étudiant
      const [applicationCheck] = await connection.execute(`
        SELECT id, status FROM job_application 
        WHERE id = ? AND student_id = ?
      `, [applicationId, parseInt(payload.userId)]);

      if ((applicationCheck as any[]).length === 0) {
        return NextResponse.json({ error: 'Candidature non trouvée' }, { status: 404 });
      }

      const application = (applicationCheck as any[])[0];
      
      // Vérifier que la candidature est encore en attente
      if (application.status !== 'PENDING') {
        return NextResponse.json({ 
          error: 'Impossible de retirer une candidature qui a déjà été traitée' 
        }, { status: 400 });
      }

      // Supprimer la candidature
      await connection.execute(`
        DELETE FROM job_application 
        WHERE id = ? AND student_id = ?
      `, [applicationId, parseInt(payload.userId)]);

      return NextResponse.json({ 
        message: 'Candidature retirée avec succès' 
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur suppression candidature étudiant:', error);
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur lors du retrait de la candidature' 
      : (error?.message || String(error));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

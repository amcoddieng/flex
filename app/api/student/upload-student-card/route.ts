import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'job_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const userId = Number(payload.userId);
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Le fichier doit être une image ou un PDF' }, { status: 400 });
    }

    // Vérifier la taille (max 10MB pour les documents)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Le fichier ne doit pas dépasser 10MB' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Créer le répertoire uploads s'il n'existe pas
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'student-cards');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Le répertoire existe déjà
      }

      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `student_card_${userId}_${timestamp}.${fileExtension}`;
      const filePath = join(uploadsDir, fileName);

      // Sauvegarder le fichier
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Mettre à jour la base de données
      const cardUrl = `/uploads/student-cards/${fileName}`;
      
      await connection.execute(`
        UPDATE student_profile SET 
          student_card_pdf = ?
        WHERE user_id = ?
      `, [cardUrl, userId]);

      console.log('Carte étudiante mise à jour avec succès:', cardUrl);

      return NextResponse.json({
        success: true,
        message: 'Carte étudiante mise à jour avec succès',
        studentCardPdf: cardUrl
      });

    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Erreur upload carte étudiante:', error);

    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'production'
          ? 'Erreur serveur'
          : error.message,
      },
      { status: 500 }
    );
  }
}

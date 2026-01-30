import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

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
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, password, role FROM user WHERE email = ?',
        [email]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }

      const user = (rows as any)[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
      }

      return NextResponse.json({ success: true, userId: user.id, role: user.role }, { status: 200 });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Erreur login:', error);
    const message = process.env.NODE_ENV === 'production' ? 'Erreur lors de la connexion' : (error?.message || String(error));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

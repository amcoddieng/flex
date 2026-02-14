import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifyToken } from '@/lib/jwt';

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

export async function POST(request: NextRequest) {
  try {
    const user = verifyEmployer(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'img' or 'identity'

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    if (!['img', 'identity'].includes(type)) {
      return NextResponse.json(
        { error: 'Type de fichier invalide' },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Le fichier doit être une image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux (max 5MB)' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'employer');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = file.type.split('/')[1]; // png, jpeg, etc.
    const filename = `${user.userId}-${type}-${Date.now()}.${ext}`;
    const filepath = join(uploadDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Return URL path
    const urlPath = `/uploads/employer/${filename}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          url: urlPath,
          type: type,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('POST /api/employer/profile/upload error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

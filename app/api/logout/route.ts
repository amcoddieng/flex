import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    
    if (token) {
      // Verify the token is valid (optional, but good for logging)
      try {
        const payload = verifyToken(token);
        console.log(`Logout request for user: ${payload?.userId} (${payload?.role})`);
      } catch (error) {
        console.log('Logout request with invalid token');
      }
    }

    // Create response that clears the token cookie
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    });

    // Clear any auth cookies if they exist
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === 'production'
          ? 'Erreur serveur'
          : error.message,
      },
      { status: 500 }
    );
  }
}

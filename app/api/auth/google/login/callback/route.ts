import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { setSessionCookie, hashPassword } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  const isProd = process.env.NODE_ENV === 'production';
  const redirectUri = isProd
    ? 'https://agenda.drajordanefaria.com/api/auth/google/login/callback'
    : 'http://localhost:3000/api/auth/google/login/callback';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=google_denied', request.url));
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    if (!googleUser.email) {
      return NextResponse.redirect(new URL('/login?error=no_email', request.url));
    }

    const userEmail = googleUser.email.toLowerCase();

    // Check optional env var whitelist if specified
    const allowedEnv = process.env.ALLOWED_GOOGLE_EMAILS;
    if (allowedEnv) {
      const allowedList = allowedEnv.split(',').map(e => e.trim().toLowerCase());
      if (!allowedList.includes(userEmail)) {
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(`O e-mail (${userEmail}) não possui autorização de acesso.`)}`, request.url)
        );
      }
    }

    // Find registered user in database
    let user = await prisma.usuario.findFirst({
      where: {
        OR: [
          { googleId: googleUser.id },
          { email: userEmail }
        ]
      }
    });

    if (!user) {
      // If email is in ALLOWED_GOOGLE_EMAILS whitelist, auto-create user on first login
      const randomPassword = Math.random().toString(36).slice(-10);
      const senhaHash = await hashPassword(randomPassword);
      user = await prisma.usuario.create({
        data: {
          nome: googleUser.name || 'Usuário Google',
          email: userEmail,
          senhaHash,
          googleId: googleUser.id,
          fotoUrl: googleUser.picture || null,
          role: 'ADMIN'
        }
      });
    }

    if (!user.googleId && googleUser.id) {
      user = await prisma.usuario.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.id,
          fotoUrl: user.fotoUrl || googleUser.picture || null
        }
      });
    }

    await setSessionCookie({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      fotoUrl: user.fotoUrl
    });

    return NextResponse.redirect(new URL('/', request.url));
  } catch (err: any) {
    console.error('Google login callback error details:', err?.stack || err);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err?.message || 'google_failed')}`, request.url));
  }
}

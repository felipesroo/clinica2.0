import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const isLocal = host.includes('localhost') || host.includes('0.0.0.0') || host.includes('127.0.0.1');
  const domain = isLocal ? host : (process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).host : 'agenda.drajordanefaria.com');
  const protocol = isLocal ? 'http' : 'https';
  const redirectUri = process.env.GOOGLE_LOGIN_REDIRECT_URI || `${protocol}://${domain}/api/auth/google/login/callback`;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    prompt: 'consent'
  });

  return NextResponse.redirect(authUrl);
}

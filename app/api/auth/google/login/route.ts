import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  const isProd = process.env.NODE_ENV === 'production';
  const redirectUri = isProd
    ? 'https://agenda.drajordanefaria.com/api/auth/google/login/callback'
    : 'http://localhost:3000/api/auth/google/login/callback';

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

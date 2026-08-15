import { NextResponse } from 'next/server';
import { authorizeWithCode } from '../../../../../lib/googleCalendar';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (code) {
    try {
      await authorizeWithCode(code);
    } catch (e) {
      console.error("Failed to authorize with Google", e);
    }
  }

  // Determine public base URL safely behind reverse proxies
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const isInternalHost = !host || host.includes('0.0.0.0') || host.includes('localhost') || host.includes('127.0.0.1');
  const baseUrl = isInternalHost
    ? (process.env.COOLIFY_FQDN ? `https://${process.env.COOLIFY_FQDN}` : 'https://agenda.drajordanefaria.com')
    : `https://${host}`;

  // Redirect back to settings page
  return NextResponse.redirect(`${baseUrl}/configuracoes`);
}

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

  // Redirect back to settings page
  return NextResponse.redirect(new URL('/configuracoes', request.url));
}

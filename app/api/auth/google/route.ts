import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '../../../../lib/googleCalendar';

export async function GET() {
  const url = await getGoogleAuthUrl();
  return NextResponse.redirect(url);
}

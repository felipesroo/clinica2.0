import { NextResponse } from 'next/server';
import { mergeDuplicateClientsAction } from '@/app/actions/client';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const expectedSecret = process.env.SEED_SECRET || 'aura_seed_sec_4f5e6d7c8b9a10293847_dra_jordane';

  if (!session && secret !== expectedSecret) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 401 });
  }

  const result = await mergeDuplicateClientsAction();
  return NextResponse.json(result);
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const db = createServerClient();

  const { data: candidate, error } = await db
    .from('candidates')
    .select('*, feedbacks(*)')
    .eq('uuid', uuid)
    .single();

  if (error || !candidate) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json(candidate);
}
